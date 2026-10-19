import { describe, expect, it } from "vitest";
import { ENUMS } from "../src";

describe("shared enums", () => {
  it("has no duplicate values", () => {
    for (const [name, values] of Object.entries(ENUMS)) {
      expect(new Set(values).size, name).toBe(values.length);
    }
  });
  it("uses UPPER_SNAKE_CASE", () => {
    for (const values of Object.values(ENUMS)) for (const v of values) expect(v).toMatch(/^[A-Z][A-Z_]*$/);
  });
});
