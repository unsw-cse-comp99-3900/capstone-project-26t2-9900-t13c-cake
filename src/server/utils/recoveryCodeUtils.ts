import { timingSafeEqual } from "node:crypto";

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
