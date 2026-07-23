"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { ADMIN_FORGOT_PASSWORD_PATH, ADMIN_HOME_PATH, ADMIN_RESET_MESSAGE_KEY } from "@/lib/admin/adminNavigation";
import { BackupRecoverySetup } from "@/components/admin/BackupRecoverySetup";

function redirectToAdminHome() {
  window.location.assign(ADMIN_HOME_PATH);
}

type SessionState =
  | { status: "loading" }
  | { status: "unconfigured" }
  | { status: "guest" }
  | {
      status: "authenticated";
      username: string;
      backupRecoverySetupRequired: boolean;
    };

type AdminAuthContextValue = {
  session: SessionState;
  refreshSession: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
}

type AdminAuthProviderProps = {
  children: React.ReactNode;
};

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [session, setSession] = useState<SessionState>({ status: "loading" });

  const refreshSession = useCallback(async () => {
    setSession({ status: "loading" });

    try {
      const response = await fetch("/api/auth/session", { cache: "no-store" });
      const data = (await response.json()) as {
        authenticated?: boolean;
        configured?: boolean;
        username?: string;
        backupRecoverySetupRequired?: boolean;
      };

      if (response.status === 503 || data.configured === false) {
        setSession({ status: "unconfigured" });
        return;
      }

      if (data.authenticated && data.username) {
        setSession({
          status: "authenticated",
          username: data.username,
          backupRecoverySetupRequired:
            data.backupRecoverySetupRequired !== false,
        });
        return;
      }

      setSession({ status: "guest" });
    } catch {
      setSession({ status: "guest" });
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const value = useMemo(
    () => ({
      session,
      refreshSession,
    }),
    [session, refreshSession],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

type AdminLoginGateProps = {
  children: React.ReactNode;
};

/** CAKE-10 — AdminLoginGate */
export function AdminLoginGate({ children }: AdminLoginGateProps) {
  const { session, refreshSession } = useAdminAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const message = sessionStorage.getItem(ADMIN_RESET_MESSAGE_KEY);
    if (!message) {
      return;
    }

    sessionStorage.removeItem(ADMIN_RESET_MESSAGE_KEY);
    setResetMessage(message);
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Invalid credentials");
        return;
      }

      setPassword("");
      await refreshSession();
      return;
    } catch {
      setError("Unable to sign in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (session.status === "loading") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-[50vh] items-center justify-center text-base text-slate-700"
      >
        Checking administrator access…
      </div>
    );
  }

  if (session.status === "unconfigured") {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-amber-200 bg-amber-50 p-6 text-slate-800">
        <h2 className="text-xl font-bold text-slate-900">Admin sign-in unavailable</h2>
        <p className="mt-3 text-base leading-7 text-slate-700">
          Administrator credentials are not configured for this environment. Set{" "}
          <code className="rounded bg-white px-1.5 py-0.5 text-sm">ADMIN_USERNAME</code>,{" "}
          <code className="rounded bg-white px-1.5 py-0.5 text-sm">ADMIN_PASSWORD</code>, and{" "}
          <code className="rounded bg-white px-1.5 py-0.5 text-sm">SESSION_SECRET</code> in{" "}
          <code className="rounded bg-white px-1.5 py-0.5 text-sm">.env</code>.
        </p>
      </div>
    );
  }

  if (session.status === "guest") {
    return (
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900">Evidence table maintenance</h2>
          <p className="mt-2 text-base leading-7 text-slate-700">
            Sign in to update remuneration guidance records.
          </p>
          <p id="admin-login-help" className="mt-1 text-sm leading-6 text-slate-700">
            This page is for authorised administrators. Researchers can use the public
            questionnaire without signing in.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="admin-username" className="block text-sm font-semibold text-slate-800">
                Username
              </label>
              <input
                id="admin-username"
                name="username"
                type="text"
                autoComplete="username"
                required
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "admin-login-help admin-login-error" : "admin-login-help"}
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base text-slate-900 outline-none ring-teal-500 focus:border-teal-500 focus:ring-2"
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-sm font-semibold text-slate-800">
                Password
              </label>
              <input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "admin-login-help admin-login-error" : "admin-login-help"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base text-slate-900 outline-none ring-teal-500 focus:border-teal-500 focus:ring-2"
              />
              <p className="mt-2 text-right text-sm">
                <Link
                  href={ADMIN_FORGOT_PASSWORD_PATH}
                  className="font-semibold text-teal-800 hover:text-teal-900"
                >
                  Forgot password?
                </Link>
              </p>
            </div>

            {resetMessage && (
              <p
                role="status"
                className="rounded-lg bg-teal-50 px-3 py-2 text-sm font-medium text-teal-900"
              >
                {resetMessage}
              </p>
            )}

            {error && (
              <p
                id="admin-login-error"
                role="alert"
                className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-900"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#0b3b4a] px-4 py-2.5 text-base font-bold text-white transition hover:bg-[#0a3340] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (session.backupRecoverySetupRequired) {
    return <BackupRecoverySetup onCompleted={refreshSession} />;
  }

  return <>{children}</>;
}

export function useAdminLogout() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function logout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      redirectToAdminHome();
    } catch {
      setIsLoggingOut(false);
    }
  }

  return { logout, isLoggingOut };
}
