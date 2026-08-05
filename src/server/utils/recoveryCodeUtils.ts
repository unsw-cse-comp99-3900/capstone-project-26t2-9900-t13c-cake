import { createHmac, randomInt } from "node:crypto";

/** Email OTP lifetime for password / recovery-email flows. */
export const RECOVERY_CODE_TTL_MINUTES = 10;
/** Minimum seconds between OTP resend requests. */
export const RECOVERY_CODE_RESEND_SECONDS = 60;
/** Failed OTP attempts before the code is invalidated. */
export const RECOVERY_CODE_MAX_ATTEMPTS = 5;

/** Generate a six-digit one-time recovery code. */
export function generateOneTimeRecoveryCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

/** HMAC-hash an OTP using SESSION_SECRET before persistence. */
export function hashOneTimeRecoveryCode(code: string): string {
  const secret = process.env.SESSION_SECRET?.trim();
  if (!secret) {
    throw new Error("SESSION_SECRET is required to hash recovery codes.");
  }

  return createHmac("sha256", secret).update(code).digest("hex");
}

/** True when the code is exactly six digits. */
export function isValidOneTimeRecoveryCode(code: string): boolean {
  return /^\d{6}$/.test(code);
}
