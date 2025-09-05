// Jest setup file

// Mock Next.js modules
jest.mock("next/navigation", () => ({
  redirect: jest.fn(() => {
    throw new Error("REDIRECT");
  }),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

// Global test configuration
beforeEach(() => {
  jest.clearAllMocks();
});
