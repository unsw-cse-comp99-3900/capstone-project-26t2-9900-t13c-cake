"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAdminAuth } from "@/components/admin/AdminLoginGate";
import { ADMIN_HOME_PATH } from "@/lib/admin/adminNavigation";

const inputClassName =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base text-slate-900 outline-none ring-teal-500 focus:border-teal-500 focus:ring-2";

const readOnlyUntilFocusProps = {
  readOnly: true,
  onFocus: (event: React.FocusEvent<HTMLInputElement>) => {
    event.currentTarget.removeAttribute("readonly");
  },
} as const;

/** CAKE-10 — administrator account settings (username + password) */
export function AccountSettingsPanel() {
  const { session, refreshSession } = useAdminAuth();
  const currentUsername = session.status === "authenticated" ? session.username : "";

  const [usernameForm, setUsernameForm] = useState({
    currentPassword: "",
    newUsername: "",
    error: "",
    success: "",
    isSubmitting: false,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    error: "",
    success: "",
    isSubmitting: false,
  });

  const [recoveryForm, setRecoveryForm] = useState({
    activeEmail: "",
    email: "",
    currentPassword: "",
    verificationCode: "",
    maskedDestination: "",
    verificationPending: false,
    error: "",
    success: "",
    isLoading: true,
    isSubmitting: false,
    isVerifying: false,
  });

  useEffect(() => {
    async function loadRecoveryContacts() {
      try {
        const response = await fetch("/api/auth/recovery/contacts");
        const data = (await response.json()) as {
          email?: string | null;
          pendingEmail?: string | null;
          maskedPendingEmail?: string | null;
          error?: string;
        };
        if (!response.ok) {
          throw new Error(data.error);
        }
        setRecoveryForm((state) => ({
          ...state,
          activeEmail: data.email ?? "",
          email: data.pendingEmail ?? "",
          maskedDestination: data.maskedPendingEmail ?? "",
          verificationPending: Boolean(data.pendingEmail),
          isLoading: false,
        }));
      } catch {
        setRecoveryForm((state) => ({
          ...state,
          error: "Unable to load recovery contacts.",
          isLoading: false,
        }));
      }
    }

    void loadRecoveryContacts();
  }, []);

  async function handleUsernameSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUsernameForm((state) => ({ ...state, error: "", success: "", isSubmitting: true }));

    try {
      const response = await fetch("/api/auth/change-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: usernameForm.currentPassword,
          newUsername: usernameForm.newUsername,
        }),
      });

      const data = (await response.json()) as { error?: string; username?: string };

      if (!response.ok) {
        setUsernameForm((state) => ({
          ...state,
          error: data.error ?? "Unable to update username.",
          isSubmitting: false,
        }));
        return;
      }

      setUsernameForm({
        currentPassword: "",
        newUsername: "",
        error: "",
        success: `Username updated to "${data.username ?? usernameForm.newUsername.trim()}".`,
        isSubmitting: false,
      });
      await refreshSession();
    } catch {
      setUsernameForm((state) => ({
        ...state,
        error: "Unable to update username. Please try again.",
        isSubmitting: false,
      }));
    }
  }

  async function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordForm((state) => ({ ...state, error: "", success: "", isSubmitting: true }));

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword,
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setPasswordForm((state) => ({
          ...state,
          error: data.error ?? "Unable to update password.",
          isSubmitting: false,
        }));
        return;
      }

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        error: "",
        success: "Password updated successfully.",
        isSubmitting: false,
      });
      await refreshSession();
    } catch {
      setPasswordForm((state) => ({
        ...state,
        error: "Unable to update password. Please try again.",
        isSubmitting: false,
      }));
    }
  }

  async function handleRecoveryRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRecoveryForm((state) => ({ ...state, error: "", success: "", isSubmitting: true }));

    try {
      const response = await fetch("/api/auth/recovery/contacts/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: recoveryForm.email,
          currentPassword: recoveryForm.currentPassword,
        }),
      });
      const data = (await response.json()) as {
        pendingEmail?: string;
        maskedDestination?: string;
        expiresInMinutes?: number;
        error?: string;
      };
      if (!response.ok) {
        setRecoveryForm((state) => ({
          ...state,
          error: data.error ?? "Unable to update recovery contacts.",
          isSubmitting: false,
        }));
        return;
      }

      setRecoveryForm((state) => ({
        ...state,
        email: data.pendingEmail ?? state.email,
        currentPassword: "",
        verificationCode: "",
        maskedDestination: data.maskedDestination ?? state.email,
        verificationPending: true,
        error: "",
        success: `A verification code was sent. It expires in ${data.expiresInMinutes ?? 10} minutes.`,
        isSubmitting: false,
      }));
    } catch {
      setRecoveryForm((state) => ({
        ...state,
        error: "Unable to update recovery contacts. Please try again.",
        isSubmitting: false,
      }));
    }
  }

  async function handleRecoveryVerify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRecoveryForm((state) => ({ ...state, error: "", success: "", isVerifying: true }));

    try {
      const response = await fetch("/api/auth/recovery/contacts/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationCode: recoveryForm.verificationCode }),
      });
      const data = (await response.json()) as { email?: string; error?: string };
      if (!response.ok) {
        setRecoveryForm((state) => ({
          ...state,
          error: data.error ?? "Unable to verify the email address.",
          isVerifying: false,
        }));
        return;
      }

      setRecoveryForm((state) => ({
        ...state,
        activeEmail: data.email ?? state.email,
        email: "",
        currentPassword: "",
        verificationCode: "",
        maskedDestination: "",
        verificationPending: false,
        error: "",
        success: "Recovery email verified and updated.",
        isVerifying: false,
      }));
    } catch {
      setRecoveryForm((state) => ({
        ...state,
        error: "Unable to verify the email address. Please try again.",
        isVerifying: false,
      }));
    }
  }

  function restartRecoveryEmailChange() {
    setRecoveryForm((state) => ({
      ...state,
      currentPassword: "",
      verificationCode: "",
      verificationPending: false,
      error: "",
      success: "",
    }));
  }

  return (
    <section className="space-y-6">
      <div>
        <Link
          href={ADMIN_HOME_PATH}
          className="inline-flex items-center text-sm font-semibold text-teal-800 transition hover:text-teal-900"
        >
          <span aria-hidden="true" className="mr-2">
            &larr;
          </span>
          Back to account centre
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">Account settings</h2>
        <p className="mt-2 max-w-3xl text-base leading-7 text-slate-700">
          Update your administrator username, password, and verified recovery email. You will
          stay signed in after a successful change.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">Username</h3>
        <p className="mt-1 text-base text-slate-700">Change the username used to sign in.</p>

        <form
          className="mt-5 max-w-lg space-y-4"
          autoComplete="off"
          aria-busy={usernameForm.isSubmitting}
          onSubmit={handleUsernameSubmit}
        >
          <div>
            <label htmlFor="current-username" className="block text-sm font-semibold text-slate-800">
              Current username
            </label>
            <input
              id="current-username"
              type="text"
              readOnly
              value={currentUsername}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-base text-slate-700"
            />
          </div>

          <div>
            <label htmlFor="new-username" className="block text-sm font-semibold text-slate-800">
              New username
            </label>
            <input
              id="new-username"
              name="admin-new-username"
              type="text"
              autoComplete="off"
              required
              aria-describedby={usernameForm.error ? "new-username-help username-form-error" : "new-username-help"}
              aria-invalid={Boolean(usernameForm.error)}
              value={usernameForm.newUsername}
              onChange={(event) =>
                setUsernameForm((state) => ({ ...state, newUsername: event.target.value }))
              }
              className={inputClassName}
              {...readOnlyUntilFocusProps}
            />
            <p id="new-username-help" className="mt-1 text-sm text-slate-700">
              Use 3 to 32 characters. You can use letters, numbers, dots, dashes, and underscores.
            </p>
          </div>

          <div>
            <label
              htmlFor="username-current-password"
              className="block text-sm font-semibold text-slate-800"
            >
              Current password
            </label>
            <input
              id="username-current-password"
              name="admin-username-current-password"
              type="password"
              autoComplete="off"
              required
              value={usernameForm.currentPassword}
              onChange={(event) =>
                setUsernameForm((state) => ({ ...state, currentPassword: event.target.value }))
              }
              className={inputClassName}
              {...readOnlyUntilFocusProps}
            />
          </div>

          {usernameForm.error && (
            <p id="username-form-error" role="alert" className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-900">
              {usernameForm.error}
            </p>
          )}

          {usernameForm.success && (
            <p
              role="status"
              className="rounded-lg bg-teal-50 px-3 py-2 text-sm font-medium text-teal-900"
            >
              {usernameForm.success}
            </p>
          )}

          <button
            type="submit"
            disabled={usernameForm.isSubmitting}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#0b3b4a] px-4 py-2.5 text-base font-bold text-white transition hover:bg-[#0a3340] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {usernameForm.isSubmitting ? "Saving…" : "Save username"}
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">Password</h3>
        <p className="mt-1 text-base text-slate-700">Change the password used to sign in.</p>

        <form
          className="mt-5 max-w-lg space-y-4"
          autoComplete="off"
          aria-busy={passwordForm.isSubmitting}
          onSubmit={handlePasswordSubmit}
        >
          <div>
            <label
              htmlFor="password-current-password"
              className="block text-sm font-semibold text-slate-800"
            >
              Current password
            </label>
            <input
              id="password-current-password"
              name="admin-password-current-password"
              type="password"
              autoComplete="off"
              required
              aria-invalid={Boolean(passwordForm.error)}
              value={passwordForm.currentPassword}
              onChange={(event) =>
                setPasswordForm((state) => ({ ...state, currentPassword: event.target.value }))
              }
              className={inputClassName}
              {...readOnlyUntilFocusProps}
            />
          </div>

          <div>
            <label htmlFor="new-password" className="block text-sm font-semibold text-slate-800">
              New password
            </label>
            <input
              id="new-password"
              name="admin-new-password"
              type="password"
              autoComplete="new-password"
              required
              aria-describedby={passwordForm.error ? "new-password-help password-form-error" : "new-password-help"}
              aria-invalid={Boolean(passwordForm.error)}
              value={passwordForm.newPassword}
              onChange={(event) =>
                setPasswordForm((state) => ({ ...state, newPassword: event.target.value }))
              }
              className={inputClassName}
              {...readOnlyUntilFocusProps}
            />
            <p id="new-password-help" className="mt-1 text-sm text-slate-700">
              Use 8 to 128 characters.
            </p>
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-semibold text-slate-800">
              Confirm new password
            </label>
            <input
              id="confirm-password"
              name="admin-confirm-password"
              type="password"
              autoComplete="new-password"
              required
              value={passwordForm.confirmPassword}
              onChange={(event) =>
                setPasswordForm((state) => ({ ...state, confirmPassword: event.target.value }))
              }
              className={inputClassName}
              {...readOnlyUntilFocusProps}
            />
          </div>

          {passwordForm.error && (
            <p id="password-form-error" role="alert" className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-900">
              {passwordForm.error}
            </p>
          )}

          {passwordForm.success && (
            <p
              role="status"
              className="rounded-lg bg-teal-50 px-3 py-2 text-sm font-medium text-teal-900"
            >
              {passwordForm.success}
            </p>
          )}

          <button
            type="submit"
            disabled={passwordForm.isSubmitting}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#0b3b4a] px-4 py-2.5 text-base font-bold text-white transition hover:bg-[#0a3340] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {passwordForm.isSubmitting ? "Saving…" : "Save password"}
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">Recovery email</h3>
        <p id="recovery-contact-help" className="mt-1 max-w-2xl text-base text-slate-700">
          Recovery codes are only sent to a verified email address. Enter a new address and your
          current password, then confirm the six-digit code sent by email.
        </p>

        <div className="mt-5 max-w-lg">
          <p className="text-sm font-semibold text-slate-800">Current verified email</p>
          <p className="mt-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-base text-slate-700">
            {recoveryForm.isLoading
              ? "Loading…"
              : recoveryForm.activeEmail || "No verified recovery email"}
          </p>
        </div>

        {!recoveryForm.verificationPending ? (
          <form
            className="mt-5 max-w-lg space-y-4"
            autoComplete="off"
            aria-busy={recoveryForm.isLoading || recoveryForm.isSubmitting}
            aria-describedby="recovery-contact-help"
            onSubmit={handleRecoveryRequest}
          >
            <div>
              <label
                htmlFor="recovery-email"
                className="block text-sm font-semibold text-slate-800"
              >
                New recovery email
              </label>
              <input
                id="recovery-email"
                type="email"
                autoComplete="email"
                required
                value={recoveryForm.email}
                disabled={recoveryForm.isLoading}
                onChange={(event) =>
                  setRecoveryForm((state) => ({
                    ...state,
                    email: event.target.value,
                    error: "",
                    success: "",
                  }))
                }
                className={inputClassName}
              />
              <p className="mt-1 text-sm text-slate-700">
                This address cannot be cleared after it has been verified.
              </p>
            </div>

            <div>
              <label
                htmlFor="recovery-current-password"
                className="block text-sm font-semibold text-slate-800"
              >
                Current password
              </label>
              <input
                id="recovery-current-password"
                type="password"
                autoComplete="current-password"
                required
                value={recoveryForm.currentPassword}
                onChange={(event) =>
                  setRecoveryForm((state) => ({
                    ...state,
                    currentPassword: event.target.value,
                    error: "",
                    success: "",
                  }))
                }
                className={inputClassName}
              />
            </div>

            {recoveryForm.error && (
              <p
                role="alert"
                className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-900"
              >
                {recoveryForm.error}
              </p>
            )}
            {recoveryForm.success && (
              <p
                role="status"
                className="rounded-lg bg-teal-50 px-3 py-2 text-sm font-medium text-teal-900"
              >
                {recoveryForm.success}
              </p>
            )}

            <button
              type="submit"
              disabled={recoveryForm.isLoading || recoveryForm.isSubmitting}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#0b3b4a] px-4 py-2.5 text-base font-bold text-white transition hover:bg-[#0a3340] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {recoveryForm.isSubmitting ? "Sending…" : "Send verification code"}
            </button>
          </form>
        ) : (
          <form
            className="mt-5 max-w-lg space-y-4"
            autoComplete="off"
            aria-busy={recoveryForm.isVerifying}
            aria-describedby="recovery-contact-help"
            onSubmit={handleRecoveryVerify}
          >
            <div className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3">
              <p className="text-sm font-semibold text-teal-950">Verification code sent</p>
              <p className="mt-1 text-sm leading-6 text-teal-900">
                Enter the six-digit code sent to{" "}
                <span className="font-semibold">
                  {recoveryForm.maskedDestination || recoveryForm.email}
                </span>
                . The current recovery email remains active until verification succeeds.
              </p>
            </div>

            <div>
              <label
                htmlFor="recovery-verification-code"
                className="block text-sm font-semibold text-slate-800"
              >
                Verification code
              </label>
              <input
                id="recovery-verification-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                value={recoveryForm.verificationCode}
                onChange={(event) =>
                  setRecoveryForm((state) => ({
                    ...state,
                    verificationCode: event.target.value.replace(/\D/g, "").slice(0, 6),
                    error: "",
                  }))
                }
                className={inputClassName}
              />
            </div>

            {recoveryForm.error && (
              <p
                role="alert"
                className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-900"
              >
                {recoveryForm.error}
              </p>
            )}
            {recoveryForm.success && (
              <p
                role="status"
                className="rounded-lg bg-teal-50 px-3 py-2 text-sm font-medium text-teal-900"
              >
                {recoveryForm.success}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={recoveryForm.isVerifying}
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#0b3b4a] px-4 py-2.5 text-base font-bold text-white transition hover:bg-[#0a3340] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {recoveryForm.isVerifying ? "Verifying…" : "Verify and save email"}
              </button>
              <button
                type="button"
                disabled={recoveryForm.isVerifying}
                onClick={restartRecoveryEmailChange}
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-base font-bold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Use a different email
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
