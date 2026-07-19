import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

export const RECOVERY_CODE_TTL_MINUTES = 10;
export const RECOVERY_CODE_RESEND_SECONDS = 60;
export const RECOVERY_CODE_MAX_ATTEMPTS = 5;

export function isRecoveryConfigured(): boolean {
  return Boolean(process.env.ADMIN_RECOVERY_CODE?.trim());
}

export function verifyRecoveryCode(candidate: string): boolean {
  const expected = process.env.ADMIN_RECOVERY_CODE?.trim();
  if (!expected || !candidate) {
    return false;
  }

  const provided = Buffer.from(candidate, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");

  if (provided.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(provided, expectedBuffer);
}

export function generateOneTimeRecoveryCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export function hashOneTimeRecoveryCode(code: string): string {
  const secret = process.env.SESSION_SECRET?.trim();
  if (!secret) {
    throw new Error("SESSION_SECRET is required to hash recovery codes.");
  }

  return createHmac("sha256", secret).update(code).digest("hex");
}

export function isValidOneTimeRecoveryCode(code: string): boolean {
  return /^\d{6}$/.test(code);
}
