import { createHmac, timingSafeEqual } from "node:crypto";

/** HttpOnly cookie name for administrator sessions (CAKE-10). */
export const ADMIN_SESSION_COOKIE = "admin_session";
/** Session lifetime in seconds (8 hours). */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

export type AdminSessionPayload = {
  username: string;
  exp: number;
};

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET?.trim();
  if (!secret) {
    throw new Error("SESSION_SECRET is not configured");
  }
  return secret;
}

function encodePayload(payload: AdminSessionPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodePayload(encoded: string): AdminSessionPayload | null {
  try {
    const parsed = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as AdminSessionPayload;

    if (
      typeof parsed.username !== "string" ||
      typeof parsed.exp !== "number" ||
      !parsed.username.trim()
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function sign(encodedPayload: string, secret: string): string {
  return createHmac("sha256", secret).update(encodedPayload).digest("base64url");
}

/** Layer 3 — HMAC-signed admin session tokens (CAKE-10). */
export function createSessionToken(username: string): string {
  const payload: AdminSessionPayload = {
    username,
    exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  };

  const encodedPayload = encodePayload(payload);
  const signature = sign(encodedPayload, getSessionSecret());
  return `${encodedPayload}.${signature}`;
}

/** Verify a session token signature and expiry; returns null when invalid. */
export function verifySessionToken(token: string | undefined): AdminSessionPayload | null {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    return null;
  }

  let secret: string;
  try {
    secret = getSessionSecret();
  } catch {
    return null;
  }

  const expectedSignature = sign(encodedPayload, secret);
  const provided = Buffer.from(signature, "utf8");
  const expected = Buffer.from(expectedSignature, "utf8");

  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return null;
  }

  const payload = decodePayload(encodedPayload);
  if (!payload || payload.exp <= Date.now()) {
    return null;
  }

  return payload;
}
