"use client";

import Link from "next/link";
import { useState } from "react";
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
        <p className="mt-2 max-w-3xl text-base leading-7 text-slate-600">
          Update your administrator username and password. You will stay signed in after a
          successful change.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">Username</h3>
        <p className="mt-1 text-base text-slate-600">Change the username used to sign in.</p>

        <form
          className="mt-5 max-w-lg space-y-4"
          autoComplete="off"
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
              value={usernameForm.newUsername}
              onChange={(event) =>
                setUsernameForm((state) => ({ ...state, newUsername: event.target.value }))
              }
              className={inputClassName}
              {...readOnlyUntilFocusProps}
            />
            <p className="mt-1 text-sm text-slate-500">
              3–32 characters. Letters, numbers, dots, dashes, and underscores only.
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
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-800">
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
        <p className="mt-1 text-base text-slate-600">Change the password used to sign in.</p>

        <form
          className="mt-5 max-w-lg space-y-4"
          autoComplete="off"
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
              value={passwordForm.newPassword}
              onChange={(event) =>
                setPasswordForm((state) => ({ ...state, newPassword: event.target.value }))
              }
              className={inputClassName}
              {...readOnlyUntilFocusProps}
            />
            <p className="mt-1 text-sm text-slate-500">8–128 characters.</p>
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
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-800">
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
    </section>
  );
}
