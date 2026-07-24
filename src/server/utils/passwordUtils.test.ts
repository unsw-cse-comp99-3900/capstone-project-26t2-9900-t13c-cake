import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/server/utils/passwordUtils";

describe("passwordUtils (CAKE-10)", () => {
  it("hashes and verifies a password", () => {
    const stored = hashPassword("secret-pass");
    expect(verifyPassword("secret-pass", stored)).toBe(true);
    expect(verifyPassword("wrong-pass", stored)).toBe(false);
  });
});
