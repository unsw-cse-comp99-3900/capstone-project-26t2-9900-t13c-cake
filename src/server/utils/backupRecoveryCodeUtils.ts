import { randomInt } from "node:crypto";
import { hashPassword, verifyPassword } from "@/server/utils/passwordUtils";

const BACKUP_CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTVWXYZ";
const BACKUP_CODE_LENGTH = 20;

/** Generate a grouped backup recovery code (XXXX-XXXX-XXXX-XXXX-XXXX). */
export function generateBackupRecoveryCode(): string {
  const characters = Array.from(
    { length: BACKUP_CODE_LENGTH },
    () => BACKUP_CODE_ALPHABET[randomInt(BACKUP_CODE_ALPHABET.length)],
  );

  return Array.from({ length: 5 }, (_, index) =>
    characters.slice(index * 4, index * 4 + 4).join(""),
  ).join("-");
}

/** Normalise user input to the canonical backup-code form, or null if invalid. */
export function normalizeBackupRecoveryCode(input: string): string | null {
  const normalized = input.replace(/[\s-]/g, "").toUpperCase();
  const validPattern = new RegExp(
    `^[${BACKUP_CODE_ALPHABET}]{${BACKUP_CODE_LENGTH}}$`,
  );

  return validPattern.test(normalized) ? normalized : null;
}

/** Persist a scrypt hash of a normalised backup recovery code. */
export function hashBackupRecoveryCode(code: string): string {
  const normalized = normalizeBackupRecoveryCode(code);
  if (!normalized) {
    throw new Error("Invalid backup recovery code");
  }

  return hashPassword(normalized);
}

/** Verify a backup recovery code against its stored hash. */
export function verifyBackupRecoveryCode(
  code: string,
  storedHash: string,
): boolean {
  const normalized = normalizeBackupRecoveryCode(code);
  return normalized ? verifyPassword(normalized, storedHash) : false;
}
