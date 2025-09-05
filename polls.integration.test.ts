// Mock dependencies - but allow more realistic behavior for integration testing
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn(),
};

jest.mock("./app/lib/supabase-server", () => ({
  createSupabaseServerClient: jest.fn().mockResolvedValue(mockSupabaseClient),
}));

// Mock Next.js modules but track their calls
const mockRedirect = jest.fn(() => {
  throw new Error("REDIRECT");
});
const mockRevalidatePath = jest.fn();
const mockCookies = jest.fn();

jest.mock("next/navigation", () => ({
  redirect: mockRedirect,
}));

jest.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

jest.mock("next/headers", () => ({
  cookies: mockCookies,
}));

import { createPoll } from "./app/lib/actions/polls";

describe("createPoll - Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should successfully create a complete poll with all database operations", async () => {
    // Arrange - Set up realistic form data
    const formData = new FormData();
    formData.append("title", "What's your favorite programming language?");
    formData.append("description", "Choose your preferred programming language");
    formData.append("allowMultipleVotes", "on");
    formData.append("expiresAt", "2024-12-31T23:59:59Z");
    formData.append("options[]", "JavaScript");
    formData.append("options[]", "TypeScript");
    formData.append("options[]", "Python");

    const mockUser = { id: "user-123" };
    const mockPoll = { id: "poll-456" };

    // Mock successful authentication
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    // Mock successful poll creation
    const mockPollInsertChain = {
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: mockPoll,
        error: null,
      }),
    };

    // Mock successful options creation
    const mockOptionsInsertChain = {
      insert: jest.fn().mockResolvedValue({
        error: null,
      }),
    };

    // Set up from() mock to return appropriate chains
    mockSupabaseClient.from.mockImplementation((table) => {
      if (table === "polls") {
        return mockPollInsertChain;
      } else if (table === "poll_options") {
        return mockOptionsInsertChain;
      }
      return {};
    });

    // Act & Assert - Should redirect at the end, not throw other errors
    await expect(createPoll(formData)).rejects.toThrow("REDIRECT");

    // Verify the complete integration flow
    expect(mockCookies).toHaveBeenCalled();
    expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled();

    // Verify poll creation
    expect(mockSupabaseClient.from).toHaveBeenCalledWith("polls");
    expect(mockPollInsertChain.insert).toHaveBeenCalledWith({
      title: "What's your favorite programming language?",
      description: "Choose your preferred programming language",
      created_by: "user-123",
      is_active: true,
      allow_multiple_votes: true,
      expires_at: "2024-12-31T23:59:59.000Z",
    });
    expect(mockPollInsertChain.select).toHaveBeenCalledWith("id");
    expect(mockPollInsertChain.single).toHaveBeenCalled();

    // Verify options creation
    expect(mockSupabaseClient.from).toHaveBeenCalledWith("poll_options");
    expect(mockOptionsInsertChain.insert).toHaveBeenCalledWith([
      { poll_id: "poll-456", text: "JavaScript", vote_count: 0 },
      { poll_id: "poll-456", text: "TypeScript", vote_count: 0 },
      { poll_id: "poll-456", text: "Python", vote_count: 0 },
    ]);

    // Verify Next.js integration
    expect(mockRevalidatePath).toHaveBeenCalledWith("/polls", "page");
    expect(mockRedirect).toHaveBeenCalledWith("/polls?created=1");
  });

  it("should handle poll creation failure and cleanup properly", async () => {
    // Arrange
    const formData = new FormData();
    formData.append("title", "Test Poll");
    formData.append("options[]", "Option A");
    formData.append("options[]", "Option B");

    const mockUser = { id: "user-123" };

    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    // Mock successful poll creation
    const mockPoll = { id: "poll-456" };
    const mockPollInsertChain = {
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: mockPoll,
        error: null,
      }),
    };

    // Mock failed options creation
    const mockOptionsInsertChain = {
      insert: jest.fn().mockResolvedValue({
        error: { message: "Options insertion failed" },
      }),
    };

    // Mock cleanup delete operation
    const mockCleanupDeleteChain = {
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: null }),
    };

    mockSupabaseClient.from.mockImplementation((table) => {
      if (table === "polls") {
        // First call returns insert chain, second call returns delete chain
        if (mockPollInsertChain.insert.mock.calls.length === 0) {
          return mockPollInsertChain;
        } else {
          return mockCleanupDeleteChain;
        }
      } else if (table === "poll_options") {
        return mockOptionsInsertChain;
      }
      return {};
    });

    // Act & Assert
    await expect(createPoll(formData)).rejects.toThrow(
      "Failed to create poll options: Options insertion failed"
    );

    // Verify cleanup was attempted
    expect(mockCleanupDeleteChain.delete).toHaveBeenCalled();
    expect(mockCleanupDeleteChain.eq).toHaveBeenCalledWith("id", "poll-456");

    // Verify no redirect or revalidation occurred after failure
    expect(mockRevalidatePath).not.toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("should properly validate and process form data edge cases", async () => {
    // Test with edge case data - empty strings, whitespace, etc.
    const formData = new FormData();
    formData.append("title", "  Valid Title  "); // Title with whitespace
    formData.append("description", "   "); // Description with only whitespace
    formData.append("options[]", "Option 1");
    formData.append("options[]", "  Option 2  "); // Option with whitespace
    formData.append("options[]", ""); // Empty option (should be filtered out)
    formData.append("options[]", "Option 3");

    const mockUser = { id: "user-123" };
    const mockPoll = { id: "poll-456" };

    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const mockPollInsertChain = {
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: mockPoll,
        error: null,
      }),
    };

    const mockOptionsInsertChain = {
      insert: jest.fn().mockResolvedValue({ error: null }),
    };

    mockSupabaseClient.from.mockImplementation((table) => {
      if (table === "polls") {
        return mockPollInsertChain;
      } else if (table === "poll_options") {
        return mockOptionsInsertChain;
      }
      return {};
    });

    // Act
    await expect(createPoll(formData)).rejects.toThrow("REDIRECT");

    // Assert - Verify proper data processing
    expect(mockPollInsertChain.insert).toHaveBeenCalledWith({
      title: "Valid Title", // Trimmed
      description: null, // Whitespace-only string becomes null
      created_by: "user-123",
      is_active: true,
      allow_multiple_votes: false, // Default when not set
      expires_at: null, // Default when not provided
    });

    // Verify options processing - empty option filtered out, whitespace trimmed
    expect(mockOptionsInsertChain.insert).toHaveBeenCalledWith([
      { poll_id: "poll-456", text: "Option 1", vote_count: 0 },
      { poll_id: "poll-456", text: "Option 2", vote_count: 0 }, // Trimmed
      { poll_id: "poll-456", text: "Option 3", vote_count: 0 },
      // Empty option should not be included
    ]);
  });

  it("should handle authentication failure and redirect properly", async () => {
    // Arrange
    const formData = new FormData();
    formData.append("title", "Test Poll");
    formData.append("options[]", "Option A");
    formData.append("options[]", "Option B");

    // Mock authentication failure
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: "Authentication failed" },
    });

    // Act & Assert
    await expect(createPoll(formData)).rejects.toThrow("REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/login");

    // Verify no database operations were attempted
    expect(mockSupabaseClient.from).not.toHaveBeenCalled();
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });

  it("should validate required fields before any async operations", async () => {
    // Test missing title
    const formDataNoTitle = new FormData();
    formDataNoTitle.append("title", "");
    formDataNoTitle.append("options[]", "Option A");
    formDataNoTitle.append("options[]", "Option B");

    await expect(createPoll(formDataNoTitle)).rejects.toThrow("Title is required");

    // Test insufficient options
    const formDataFewOptions = new FormData();
    formDataFewOptions.append("title", "Test Poll");
    formDataFewOptions.append("options[]", "Option A");

    await expect(createPoll(formDataFewOptions)).rejects.toThrow(
      "At least two options are required"
    );

    // Verify no async operations were called for validation errors
    expect(mockSupabaseClient.auth.getUser).not.toHaveBeenCalled();
    expect(mockCookies).not.toHaveBeenCalled();
  });
});
