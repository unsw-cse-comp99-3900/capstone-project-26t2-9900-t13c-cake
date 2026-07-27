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

function redirectToAdminHome() {
  window.location.assign(ADMIN_HOME_PATH);
}

type SessionState =
  | { status: "loading" }
  | { status: "unconfigured" }
  | { status: "guest" }
  | { status: "authenticated"; username: string };

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
      };

      if (response.status === 503 || data.configured === false) {
        setSession({ status: "unconfigured" });
        return;
      }

      if (data.authenticated && data.username) {
        setSession({ status: "authenticated", username: data.username });
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
  const { session } = useAdminAuth();
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
      redirectToAdminHome();
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
        className="flex min-h-[50vh] items-center justify-center text-base font-medium text-slate-700"
      >
        Checking administrator access…
      </div>
    );
  }

  if (session.status === "unconfigured") {
    return (
      <div className="mx-auto max-w-xl rounded-[8px] border border-amber-200 bg-[#fff8e8] p-6 text-slate-800 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
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
      <div className="mx-auto flex min-h-[calc(100vh-158px)] w-full max-w-5xl flex-col justify-center">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#006b63]">
            Administrator access
          </p>
          <h2 className="mt-3 font-[Georgia,serif] text-4xl font-normal leading-tight tracking-tight text-[#051b1a] sm:text-[3rem]">
            Evidence table maintenance
          </h2>
          <div className="mx-auto mt-5 h-0.5 w-14 bg-[#006b63]" />
          <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-slate-600">
            Sign in to update remuneration guidance records and maintain the evidence base used by
            the public questionnaire.
          </p>
        </div>

        <div className="mx-auto mt-7 w-full max-w-[500px] rounded-[24px] border border-[#a9d3cc] bg-white p-7 shadow-[0_22px_46px_rgba(15,23,42,0.10)] sm:p-8">
          <h3 className="text-2xl font-bold text-[#051b1a]">Sign in</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">Authorised administrators only.</p>

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
                className="mt-2 min-h-11 w-full rounded-[4px] border border-[#8f9aa3] bg-white px-4 py-2 text-base text-slate-900 shadow-[inset_0_1px_1px_rgba(15,23,42,0.04)] focus:outline-3 focus:outline-offset-2 focus:outline-teal-700"
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
                className="mt-2 min-h-11 w-full rounded-[4px] border border-[#8f9aa3] bg-white px-4 py-2 text-base text-slate-900 shadow-[inset_0_1px_1px_rgba(15,23,42,0.04)] focus:outline-3 focus:outline-offset-2 focus:outline-teal-700"
              />
              <p className="mt-3 text-right text-sm">
                <Link
                  href={ADMIN_FORGOT_PASSWORD_PATH}
                  className="font-semibold text-[#006b63] hover:text-[#003f3b]"
                >
                  Forgot password?
                </Link>
              </p>
            </div>

            {resetMessage && (
              <p
                role="status"
                className="rounded-[8px] bg-[#e8f7f3] px-3 py-2 text-sm font-medium text-[#003f3b]"
              >
                {resetMessage}
              </p>
            )}

            {error && (
              <p
                id="admin-login-error"
                role="alert"
                className="rounded-[8px] border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-900"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-[4px] border border-[#006b63] bg-[#006b63] px-4 py-2.5 text-base font-bold text-white transition hover:bg-[#00524c] disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              {isSubmitting ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p id="admin-login-help" className="mx-auto mt-5 w-full max-w-[500px] rounded-[10px] border border-[#a9d3cc] bg-[#edf8f5] px-5 py-3 text-center text-sm leading-6 text-slate-700">
          Researchers can use the public questionnaire without signing in.
        </p>
      </div>
    );
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
