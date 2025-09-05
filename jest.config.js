module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>"],
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/app/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  clearMocks: true,
  restoreMocks: true,
  collectCoverageFrom: ["app/**/*.ts", "!app/**/*.d.ts"],
};
