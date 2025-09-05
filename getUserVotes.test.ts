// Mock dependencies first
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn(),
};

// Mock the Supabase server client module
jest.mock("./app/lib/supabase-server", () => ({
  createSupabaseServerClient: jest.fn().mockResolvedValue(mockSupabaseClient),
}));

// Mock Next.js modules
jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

import { getUserVotes, deletePoll } from "./app/lib/actions/polls";

describe("getUserVotes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return empty array when user is not authenticated", async () => {
    // Arrange
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: "Not authenticated" },
    });

    // Act
    const result = await getUserVotes("poll-123");

    // Assert
    expect(result).toEqual([]);
  });

  it("should return empty array when database query fails", async () => {
    // Arrange
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });

    const mockFromChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
    };

    mockFromChain.eq.mockImplementation((field, value) => {
      if (field === "poll_id") {
        return mockFromChain;
      } else if (field === "user_id") {
        return Promise.resolve({
          data: null,
          error: { message: "Database error" },
        });
      }
      return mockFromChain;
    });

    mockSupabaseClient.from.mockReturnValue(mockFromChain);

    // Act
    const result = await getUserVotes("poll-123");

    // Assert
    expect(result).toEqual([]);
  });

  it("should return option IDs when user has votes", async () => {
    // Arrange
    const mockVotes = [{ option_id: "option-1" }, { option_id: "option-3" }];

    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });

    const mockFromChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
    };

    mockFromChain.eq.mockImplementation((field, value) => {
      if (field === "poll_id") {
        return mockFromChain;
      } else if (field === "user_id") {
        return Promise.resolve({
          data: mockVotes,
          error: null,
        });
      }
      return mockFromChain;
    });

    mockSupabaseClient.from.mockReturnValue(mockFromChain);

    // Act
    const result = await getUserVotes("poll-123");

    // Assert
    expect(result).toEqual(["option-1", "option-3"]);
  });

  it("should return empty array when user has no votes", async () => {
    // Arrange
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });

    const mockFromChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
    };

    mockFromChain.eq.mockImplementation((field, value) => {
      if (field === "poll_id") {
        return mockFromChain;
      } else if (field === "user_id") {
        return Promise.resolve({
          data: [],
          error: null,
        });
      }
      return mockFromChain;
    });

    mockSupabaseClient.from.mockReturnValue(mockFromChain);

    // Act
    const result = await getUserVotes("poll-123");

    // Assert
    expect(result).toEqual([]);
  });
});

describe("deletePoll", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return early when pollId is empty", async () => {
    // Arrange
    const formData = new FormData();
    formData.append("pollId", "");

    // Act
    const result = await deletePoll(formData);

    // Assert
    expect(result).toBeUndefined();
    expect(mockSupabaseClient.auth.getUser).not.toHaveBeenCalled();
  });

  it("should redirect to login when user is not authenticated", async () => {
    // Arrange
    const formData = new FormData();
    formData.append("pollId", "poll-123");

    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const mockRedirect = require("next/navigation").redirect;

    // Act & Assert
    await expect(deletePoll(formData)).rejects.toThrow("REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/login");
  });

  it("should successfully delete poll for authenticated user", async () => {
    // Arrange
    const formData = new FormData();
    formData.append("pollId", "poll-123");

    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });

    const mockDeleteChain = {
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
    };

    mockDeleteChain.eq.mockImplementation((field, value) => {
      if (field === "id") {
        return mockDeleteChain;
      } else if (field === "created_by") {
        return Promise.resolve({
          error: null,
        });
      }
      return mockDeleteChain;
    });

    mockSupabaseClient.from.mockReturnValue(mockDeleteChain);

    const mockRevalidatePath = require("next/cache").revalidatePath;

    // Act
    await deletePoll(formData);

    // Assert
    expect(mockSupabaseClient.from).toHaveBeenCalledWith("polls");
    expect(mockDeleteChain.delete).toHaveBeenCalled();
    expect(mockDeleteChain.eq).toHaveBeenCalledWith("id", "poll-123");
    expect(mockDeleteChain.eq).toHaveBeenCalledWith("created_by", "user-123");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it("should throw error when database deletion fails", async () => {
    // Arrange
    const formData = new FormData();
    formData.append("pollId", "poll-123");

    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });

    const mockDeleteChain = {
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
    };

    mockDeleteChain.eq.mockImplementation((field, value) => {
      if (field === "id") {
        return mockDeleteChain;
      } else if (field === "created_by") {
        return Promise.resolve({
          error: { message: "Database deletion failed" },
        });
      }
      return mockDeleteChain;
    });

    mockSupabaseClient.from.mockReturnValue(mockDeleteChain);

    // Act & Assert
    await expect(deletePoll(formData)).rejects.toThrow(
      "Database deletion failed",
    );
  });
});
