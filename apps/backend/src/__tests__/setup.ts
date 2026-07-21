// Mock uuid v14 (ESM-only) so Jest can run tests in a CommonJS environment
jest.mock("uuid", () => {
  let value = 0;
  return {
    v4: jest.fn(() => {
      value += 1;
      return `00000000-0000-0000-0000-${String(value).padStart(12, "0")}`;
    }),
    v5: jest.fn(),
    v1: jest.fn(),
    v3: jest.fn(),
    validate: jest.fn(),
    version: jest.fn(),
    parse: jest.fn(),
    stringify: jest.fn(),
    NIL: "00000000-0000-0000-0000-000000000000",
  };
});
