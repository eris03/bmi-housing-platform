import { describe, expect, it } from "vitest";
import { isValidEmail, maskPhone, normaliseIndianMobile } from "@/lib/phone";

describe("normaliseIndianMobile", () => {
  it.each([
    ["9876543210", "+919876543210"],
    ["98765 43210", "+919876543210"],
    ["+91 98765-43210", "+919876543210"],
    ["919876543210", "+919876543210"],
    ["09876543210", "+919876543210"],
  ])("accepts %s", (input, out) => expect(normaliseIndianMobile(input)).toBe(out));

  it.each(["", "12345", "5876543210", "98765432101", "abcdefghij"])("rejects %s", (input) =>
    expect(normaliseIndianMobile(input)).toBeNull(),
  );
});

describe("maskPhone", () => {
  it("hides the middle digits", () => expect(maskPhone("+919876543210")).toBe("+91•••••43210"));
});

describe("isValidEmail", () => {
  it("accepts a normal address", () => expect(isValidEmail("a@b.co")).toBe(true));
  it("rejects malformed", () => expect(isValidEmail("a@b")).toBe(false));
});
