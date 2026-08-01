"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ADMIN_HOME_PATH, ADMIN_RESET_MESSAGE_KEY } from "@/lib/admin/adminNavigation";

type RecoveryMethod = "email" | "supervisor" | "backup";

type RecoveryOptions = {
  email: { available: boolean; masked: string | null };
  supervisorCode: boolean;
  backupRecoveryCode: boolean;
};

const inputClassName =
  "mt-1 w-full rounded-[4px] border border-[#8f9aa3] bg-white px-3 py-2 text-base text-slate-900 shadow-[inset_0_1px_1px_rgba(15,23,42,0.04)] outline-none focus:outline-3 focus:outline-offset-2 focus:outline-teal-700";

const primaryButtonClassName =
  "inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-[4px] border border-[#006b63] bg-[#006b63] px-4 py-2.5 font-bold text-white transition hover:bg-[#00524c] disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-400 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700";

const secondaryButtonClassName =
  "w-full cursor-pointer rounded-[4px] border border-[#006b63] bg-white px-4 py-2.5 text-sm font-bold text-[#004c45] transition hover:bg-[#f3fbf8] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700";

const methodButtonClassName =
  "w-full cursor-pointer rounded-[4px] border border-[#006b63] bg-white px-4 py-3 text-left font-bold text-[#004c45] transition hover:bg-[#f3fbf8] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700";

/** Keep in sync with RECOVERY_CODE_RESEND_SECONDS on the server. */
const RESEND_COOLDOWN_SECONDS = 60;

async function readJsonResponse<T>(response: Response): Promise<T | null> {
  const text = await response.text();
  if (!text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export function AccountRecoveryForm() {
  const [options, setOptions] = useState<RecoveryOptions | null>(null);
  const [method, setMethod] = useState<RecoveryMethod | null>(null);
  const [codeSent, setCodeSent] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [code, setCode] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    async function loadOptions() {
      try {
        const response = await fetch("/api/auth/recovery/options");
        if (!response.ok) {
          throw new Error();
        }
        const data = await readJsonResponse<RecoveryOptions>(response);
        if (!data) {
          throw new Error();
        }
        setOptions(data);
      } catch {
        setError("Unable to load password recovery options.");
      }
    }
    void loadOptions();
  }, []);

  useEffect(() => {
    if (resendCountdown <= 0) {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      setResendCountdown((remaining) => (remaining <= 1 ? 0 : remaining - 1));
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [resendCountdown]);

  function startResendCountdown(seconds = RESEND_COOLDOWN_SECONDS) {
    setResendCountdown(Math.max(0, Math.ceil(seconds)));
  }

  async function requestCode() {
    setError("");
    setMessage("");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/recovery/request", {
        method: "POST",
        headers: { Accept: "application/json" },
      });
      const data = await readJsonResponse<{
        error?: string;
        maskedDestination?: string;
        expiresInMinutes?: number;
        retryAfter?: number;
      }>(response);

      if (!response.ok) {
        if (typeof data?.retryAfter === "number") {
          startResendCountdown(data.retryAfter);
        }
        setError(data?.error ?? "Unable to send recovery code.");
        return;
      }

      if (!data?.maskedDestination) {
        setError("Unable to send recovery code. Please try again.");
        return;
      }

      setMethod("email");
      setCodeSent(true);
      setCodeVerified(false);
      setCode("");
      startResendCountdown();
      setMessage(
        `A 6-digit code was sent to ${data.maskedDestination}. It expires in ${data.expiresInMinutes ?? 10} minutes.`,
      );
    } catch {
      setError("Unable to send recovery code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function resendCode() {
    if (resendCountdown > 0 || isResending || isSubmitting) {
      return;
    }

    setError("");
    setIsResending(true);
    try {
      const response = await fetch("/api/auth/recovery/request", {
        method: "POST",
        headers: { Accept: "application/json" },
      });
      const data = await readJsonResponse<{
        error?: string;
        maskedDestination?: string;
        expiresInMinutes?: number;
        retryAfter?: number;
      }>(response);

      if (!response.ok || !data?.maskedDestination) {
        if (typeof data?.retryAfter === "number") {
          startResendCountdown(data.retryAfter);
        }
        setError(data?.error ?? "Unable to resend recovery code.");
        return;
      }

      setCode("");
      startResendCountdown();
      setMessage(
        `A new 6-digit code was sent to ${data.maskedDestination}. It expires in ${data.expiresInMinutes ?? 10} minutes.`,
      );
    } catch {
      setError("Unable to resend recovery code. Please try again.");
    } finally {
      setIsResending(false);
    }
  }

  async function verifyEnteredCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!method) {
      return;
    }
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/recovery/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(
          method === "email" ? { verificationCode: code } : { recoveryCode: code },
        ),
      });
      const data = await readJsonResponse<{ error?: string }>(response);
      if (!response.ok) {
        setError(data?.error ?? "Unable to verify recovery code.");
        return;
      }

      setCodeVerified(true);
      setMessage("Recovery code accepted. Set a new username and password below.");
    } catch {
      setError("Unable to verify recovery code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function resetPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!method) {
      return;
    }
    setError("");
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const body =
        method === "supervisor"
          ? {
              recoveryCode: code,
              newUsername,
              newPassword,
              confirmPassword,
            }
          : method === "backup"
            ? {
                backupRecoveryCode: code,
                newUsername,
                newPassword,
                confirmPassword,
              }
          : {
              verificationCode: code,
              newUsername,
              newPassword,
              confirmPassword,
            };
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
      });
      const data = await readJsonResponse<{ error?: string; username?: string }>(response);
      if (!response.ok) {
        setError(data?.error ?? "Unable to reset administrator password.");
        return;
      }

      sessionStorage.setItem(
        ADMIN_RESET_MESSAGE_KEY,
        `Password reset successfully. Sign in with username "${data?.username}".`,
      );
      window.location.assign(ADMIN_HOME_PATH);
    } catch {
      setError("Unable to reset administrator password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function chooseSupervisorCode() {
    setMethod("supervisor");
    setCodeSent(true);
    setCodeVerified(false);
    setCode("");
    setError("");
    setMessage("Enter the recovery code supplied by the system supervisor.");
  }

  function chooseBackupRecoveryCode() {
    setMethod("backup");
    setCodeSent(true);
    setCodeVerified(true);
    setCode("");
    setError("");
    setMessage(
      "Enter the backup recovery code you saved when administrator access was set up.",
    );
  }

  function startOver() {
    setMethod(null);
    setCodeSent(false);
    setCodeVerified(false);
    setCode("");
    setNewUsername("");
    setNewPassword("");
    setConfirmPassword("");
    setMessage("");
    setError("");
    setResendCountdown(0);
  }

  const showEmailCodeStep = method === "email" && codeSent && !codeVerified;
  const showEmailPasswordStep = method === "email" && codeSent && codeVerified;
  const showSupervisorCodeStep = method === "supervisor" && codeSent && !codeVerified;
  const showNonEmailAccountStep =
    (method === "supervisor" && codeSent && codeVerified) ||
    method === "backup";
  const canResend = !isResending && !isSubmitting && resendCountdown <= 0;

  return (
    <section className="mx-auto w-full max-w-md" aria-busy={isSubmitting || isResending}>
      <div className="rounded-[8px] border border-[#dce6e4] bg-white p-6 shadow-[0_12px_28px_rgba(15,23,42,0.05)] sm:p-8">
        <h2 className="text-2xl font-bold text-slate-900">Reset administrator password</h2>
        <p id="recovery-help" className="mt-2 text-base leading-7 text-slate-700">
          Choose a saved backup code, email, or a supervisor code. Email codes
          contain 6 digits and expire after 10 minutes.
        </p>

        {!method ? (
          isSubmitting ? (
            <p role="status" aria-live="polite" className="mt-6 text-base font-semibold text-slate-700">
              Sending email code…
            </p>
          ) : (
            <div className="mt-6 space-y-3">
              {!options && !error ? <p role="status" className="text-sm text-slate-700">Loading recovery options…</p> : null}
              {options?.email.available ? (
                <button
                  type="button"
                  onClick={() => void requestCode()}
                  className={methodButtonClassName}
                >
                  Email code to {options.email.masked}
                </button>
              ) : null}
              {options?.supervisorCode ? (
                <button
                  type="button"
                  onClick={chooseSupervisorCode}
                  className={methodButtonClassName}
                >
                  Use supervisor recovery code
                </button>
              ) : null}
              {options?.backupRecoveryCode ? (
                <button
                  type="button"
                  onClick={chooseBackupRecoveryCode}
                  className="w-full cursor-pointer rounded-lg border border-slate-300 px-4 py-3 text-left font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Use saved backup recovery code
                </button>
              ) : null}
              {options &&
              !options.email.available &&
              !options.supervisorCode &&
              !options.backupRecoveryCode ? (
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  No password recovery method is configured. Contact the system administrator.
                </p>
              ) : null}
            </div>
          )
        ) : null}

        {showEmailCodeStep ? (
          <form className="mt-6 space-y-4" onSubmit={verifyEnteredCode}>
            <div>
              <label htmlFor="recovery-verification-code" className="block text-sm font-semibold text-slate-800">
                6-digit verification code
              </label>
              <div className="relative mt-1">
                <input
                  id="recovery-verification-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  aria-describedby={error ? "recovery-help recovery-error" : "recovery-help"}
                  aria-invalid={Boolean(error)}
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  className="w-full rounded-[4px] border border-[#8f9aa3] bg-white py-2 pl-3 pr-28 text-base text-slate-900 shadow-[inset_0_1px_1px_rgba(15,23,42,0.04)] outline-none focus:outline-3 focus:outline-offset-2 focus:outline-teal-700"
                />
                <div className="absolute inset-y-1 right-1 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => void resendCode()}
                    disabled={!canResend}
                    className="inline-flex cursor-pointer items-center rounded-[4px] px-3 text-sm font-bold text-[#006b63] hover:bg-[#f3fbf8] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent"
                  >
                    {isResending ? "Sending…" : "Resend"}
                  </button>
                  {resendCountdown > 0 ? (
                    <span className="pr-2 text-sm tabular-nums text-slate-700" aria-live="polite">
                      {resendCountdown}s
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isResending}
              className={primaryButtonClassName}
            >
              {isSubmitting ? "Verifying…" : "Continue"}
            </button>
            <button
              type="button"
              onClick={startOver}
              className={secondaryButtonClassName}
            >
              Choose another recovery method
            </button>
          </form>
        ) : null}

        {showEmailPasswordStep ? (
          <form className="mt-6 space-y-4" onSubmit={resetPassword}>
            <div>
              <label htmlFor="recovery-new-username" className="block text-sm font-semibold text-slate-800">
                New username
              </label>
              <input
                id="recovery-new-username"
                type="text"
                required
                minLength={3}
                maxLength={32}
                pattern="[\w.-]+"
                value={newUsername}
                onChange={(event) => setNewUsername(event.target.value)}
                className={inputClassName}
              />
            </div>
            <div>
              <label htmlFor="recovery-new-password" className="block text-sm font-semibold text-slate-800">
                New password
              </label>
              <input
                id="recovery-new-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={128}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className={inputClassName}
              />
            </div>
            <div>
              <label htmlFor="recovery-confirm-password" className="block text-sm font-semibold text-slate-800">
                Confirm new password
              </label>
              <input
                id="recovery-confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className={inputClassName}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={primaryButtonClassName}
            >
              {isSubmitting ? "Resetting…" : "Reset password"}
            </button>
            <button
              type="button"
              onClick={startOver}
              className={secondaryButtonClassName}
            >
              Choose another recovery method
            </button>
          </form>
        ) : null}

        {showSupervisorCodeStep ? (
          <form className="mt-6 space-y-4" onSubmit={verifyEnteredCode}>
            <div>
              <label htmlFor="supervisor-recovery-code" className="block text-sm font-semibold text-slate-800">
                Supervisor recovery code
              </label>
              <input
                id="supervisor-recovery-code"
                type="password"
                required
                value={code}
                onChange={(event) => setCode(event.target.value)}
                className={inputClassName}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={primaryButtonClassName}
            >
              {isSubmitting ? "Verifying…" : "Continue"}
            </button>
            <button
              type="button"
              onClick={startOver}
              className={secondaryButtonClassName}
            >
              Choose another recovery method
            </button>
          </form>
        ) : null}

        {showNonEmailAccountStep ? (
          <form className="mt-6 space-y-4" onSubmit={resetPassword}>
            {method === "backup" ? (
              <div>
                <label
                  htmlFor="backup-recovery-code"
                  className="block text-sm font-semibold text-slate-800"
                >
                  Backup recovery code
                </label>
                <input
                  id="backup-recovery-code"
                  type="text"
                  autoCapitalize="characters"
                  autoComplete="off"
                  required
                  maxLength={32}
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  className={inputClassName}
                />
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  This code becomes invalid immediately after a successful reset.
                </p>
              </div>
            ) : null}
            <div>
              <label htmlFor="recovery-new-username" className="block text-sm font-semibold text-slate-800">
                New username
              </label>
              <input
                id="recovery-new-username"
                type="text"
                required
                minLength={3}
                maxLength={32}
                pattern="[\w.-]+"
                value={newUsername}
                onChange={(event) => setNewUsername(event.target.value)}
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="recovery-new-password" className="block text-sm font-semibold text-slate-800">
                New password
              </label>
              <input
                id="recovery-new-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={128}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className={inputClassName}
              />
            </div>
            <div>
              <label htmlFor="recovery-confirm-password" className="block text-sm font-semibold text-slate-800">
                Confirm new password
              </label>
              <input
                id="recovery-confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className={inputClassName}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={primaryButtonClassName}
            >
              {isSubmitting ? "Resetting…" : "Reset password"}
            </button>
            <button
              type="button"
              onClick={startOver}
              className={secondaryButtonClassName}
            >
              Choose another recovery method
            </button>
          </form>
        ) : null}

        {message ? <p role="status" aria-live="polite" className="mt-4 rounded-lg bg-teal-50 px-3 py-2 text-sm font-medium text-teal-900">{message}</p> : null}
        {error ? <p id="recovery-error" role="alert" className="mt-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-900">{error}</p> : null}

        <p className="mt-4 text-center text-sm text-slate-700">
          <Link href={ADMIN_HOME_PATH} className="font-semibold text-teal-800 hover:text-teal-900">
            Back to sign in
          </Link>
        </p>
      </div>
    </section>
  );
}
