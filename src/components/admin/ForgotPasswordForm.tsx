"use client";

import Link from "next/link";
import { useState } from "react";
import { ADMIN_HOME_PATH, ADMIN_RESET_MESSAGE_KEY } from "@/lib/admin/adminNavigation";

function redirectToAdminHome() {
  window.location.assign(ADMIN_HOME_PATH);
}

const inputClassName =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base text-slate-900 outline-none ring-teal-500 focus:border-teal-500 focus:ring-2";

const readOnlyUntilFocusProps = {
  readOnly: true,
  onFocus: (event: React.FocusEvent<HTMLInputElement>) => {
    event.currentTarget.removeAttribute("readonly");
  },
} as const;

/** CAKE-10 — forgot password via supervisor recovery code */
export function ForgotPasswordForm() {
  const [recoveryCode, setRecoveryCode] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recoveryCode, newUsername, newPassword, confirmPassword }),
      });

      const data = (await response.json()) as { error?: string; username?: string };

      if (!response.ok) {
        setError(data.error ?? "Unable to reset administrator account.");
        return;
      }

      const username = data.username ?? newUsername.trim();
      sessionStorage.setItem(
        ADMIN_RESET_MESSAGE_KEY,
        `Account reset successfully. Sign in with username "${username}" and your new password.`,
      );
      redirectToAdminHome();
      return;
    } catch {
      setError("Unable to reset administrator account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-md">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-bold text-slate-900">Reset administrator account</h2>
        <p className="mt-2 text-base leading-7 text-slate-600">
          Enter the supervisor recovery code, then set a new username and password.
        </p>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          Researchers do not need an account to use the public questionnaire.
        </p>

        <form className="mt-6 space-y-4" autoComplete="off" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="recovery-code" className="block text-sm font-semibold text-slate-800">
              Recovery code
            </label>
            <input
              id="recovery-code"
              name="admin-recovery-code"
              type="password"
              autoComplete="off"
              required
              value={recoveryCode}
              onChange={(event) => setRecoveryCode(event.target.value)}
              className={inputClassName}
              {...readOnlyUntilFocusProps}
            />
          </div>

          <div>
            <label htmlFor="reset-new-username" className="block text-sm font-semibold text-slate-800">
              New username
            </label>
            <input
              id="reset-new-username"
              name="admin-reset-username"
              type="text"
              autoComplete="off"
              required
              value={newUsername}
              onChange={(event) => setNewUsername(event.target.value)}
              className={inputClassName}
              {...readOnlyUntilFocusProps}
            />
            <p className="mt-1 text-sm text-slate-500">
              3–32 characters. Letters, numbers, dots, dashes, and underscores only.
            </p>
          </div>

          <div>
            <label htmlFor="reset-new-password" className="block text-sm font-semibold text-slate-800">
              New password
            </label>
            <input
              id="reset-new-password"
              name="admin-reset-password"
              type="password"
              autoComplete="new-password"
              required
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className={inputClassName}
              {...readOnlyUntilFocusProps}
            />
            <p className="mt-1 text-sm text-slate-500">8–128 characters.</p>
          </div>

          <div>
            <label
              htmlFor="reset-confirm-password"
              className="block text-sm font-semibold text-slate-800"
            >
              Confirm new password
            </label>
            <input
              id="reset-confirm-password"
              name="admin-reset-confirm-password"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className={inputClassName}
              {...readOnlyUntilFocusProps}
            />
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-800">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#0b3b4a] px-4 py-2.5 text-base font-bold text-white transition hover:bg-[#0a3340] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Resetting…" : "Reset account"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          <Link href={ADMIN_HOME_PATH} className="font-semibold text-teal-800 hover:text-teal-900">
            Back to sign in
          </Link>
        </p>
      </div>
    </section>
  );
}
