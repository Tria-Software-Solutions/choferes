import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  transform: {
    // TS151002 ("hybrid module kind requires isolatedModules") is emitted once
    // per test file for the node16 module setting and drowns the real output.
    "^.+\\.tsx?$": ["ts-jest", { diagnostics: { ignoreCodes: [151002] } }],
  },
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  clearMocks: true,
  setupFiles: ["<rootDir>/src/__tests__/setup.ts"],
  collectCoverageFrom: [
    "src/services/*.ts",
    "src/utils/*.ts",
    "!src/**/*.d.ts",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
};

export default config;
