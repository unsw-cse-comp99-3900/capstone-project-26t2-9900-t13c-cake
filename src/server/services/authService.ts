import { adminAccountRepository } from "@/server/repositories/adminAccountRepository";
import {
  ADMIN_SESSION_COOKIE,
  createSessionToken,
  SESSION_MAX_AGE_SECONDS,
  verifySessionToken,
  type AdminSessionPayload,
} from "@/server/services/sessionService";

function readSessionFromCookieHeader(cookieHeader: string | null): AdminSessionPayload | null {
  if (!cookieHeader) {
    return null;
  }

  const sessionCookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_SESSION_COOKIE}=`));

  if (!sessionCookie) {
    return null;
  }

  const token = decodeURIComponent(sessionCookie.slice(ADMIN_SESSION_COOKIE.length + 1));
  return verifySessionToken(token);
}

/** Layer 3 — AuthService (CAKE-10) */
export const authService = {
  isConfigured(): boolean {
    return Boolean(
      process.env.SESSION_SECRET?.trim() &&
        process.env.ADMIN_USERNAME?.trim() &&
        process.env.ADMIN_PASSWORD,
    );
  },

  async verifyCredentials(username: string, password: string): Promise<boolean> {
    return adminAccountRepository.verifyCredentials(username, password);
  },

  async changeUsername(
    currentPassword: string,
    newUsername: string,
  ) {
    return adminAccountRepository.changeUsername(currentPassword, newUsername);
  },

  async changePassword(currentPassword: string, newPassword: string) {
    return adminAccountRepository.changePassword(currentPassword, newPassword);
  },

  createSessionToken(username: string): string {
    return createSessionToken(username.trim());
  },

  getSessionFromRequest(request: Request): AdminSessionPayload | null {
    return readSessionFromCookieHeader(request.headers.get("cookie"));
  },

  getSessionCookieOptions(): {
    name: string;
    maxAge: number;
    httpOnly: true;
    sameSite: "lax";
    secure: boolean;
    path: string;
  } {
    return {
      name: ADMIN_SESSION_COOKIE,
      maxAge: SESSION_MAX_AGE_SECONDS,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    };
  },
};
