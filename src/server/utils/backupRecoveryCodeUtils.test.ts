import { describe, expect, it } from "vitest";
import {
  generateBackupRecoveryCode,
  hashBackupRecoveryCode,
  normalizeBackupRecoveryCode,
  verifyBackupRecoveryCode,
} from "@/server/utils/backupRecoveryCodeUtils";

describe("backupRecoveryCodeUtils", () => {
  it("generates a human-friendly 20-character recovery code", () => {
    const generated = new Set(
      Array.from({ length: 100 }, () => generateBackupRecoveryCode()),
    );

    expect(generated.size).toBe(100);
    for (const code of generated) {
      expect(code).toMatch(
        /^[23456789ABCDEFGHJKMNPQRSTVWXYZ]{4}(?:-[23456789ABCDEFGHJKMNPQRSTVWXYZ]{4}){4}$/,
      );
    }
  });

  it("normalizes lowercase input and ignores spaces and hyphens", () => {
    expect(normalizeBackupRecoveryCode("abcd efgh-jkmn-pqrs-tvwx")).toBe(
      "ABCDEFGHJKMNPQRSTVWX",
    );
  });

  it("rejects malformed recovery codes before hashing", () => {
    expect(normalizeBackupRecoveryCode("too-short")).toBeNull();
    expect(normalizeBackupRecoveryCode("ABCD-EFGH-IJKL-MNOP-QRST")).toBeNull();
  });

  it("stores a hash and verifies only the matching code", () => {
    const code = "ABCD-EFGH-JKMN-PQRS-TVWX";
    const hash = hashBackupRecoveryCode(code);

    expect(hash).not.toContain(normalizeBackupRecoveryCode(code)!);
    expect(verifyBackupRecoveryCode("abcd efgh jkmn pqrs tvwx", hash)).toBe(true);
    expect(verifyBackupRecoveryCode("ABCD-EFGH-JKMN-PQRS-TVW2", hash)).toBe(false);
    expect(verifyBackupRecoveryCode("invalid", hash)).toBe(false);
  });
});
