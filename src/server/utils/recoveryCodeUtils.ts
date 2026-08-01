import { createHmac, randomInt } from "node:crypto";

export const RECOVERY_CODE_TTL_MINUTES = 10;
export const RECOVERY_CODE_RESEND_SECONDS = 60;
export const RECOVERY_CODE_MAX_ATTEMPTS = 5;

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
