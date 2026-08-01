"use client";

import { useState } from "react";
import {
  confirmBackupRecoveryCode,
  generateBackupRecoveryCode,
} from "@/components/admin/backupRecoveryClient";

type BackupRecoverySetupProps = {
  onCompleted: () => Promise<void>;
};

export function BackupRecoverySetup({
  onCompleted,
}: BackupRecoverySetupProps) {
  const [recoveryCode, setRecoveryCode] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [hasSaved, setHasSaved] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function generateCode() {
    setError("");
    setMessage("");
    setHasSaved(false);
    setIsSubmitting(true);

    try {
      const result = await generateBackupRecoveryCode();
      setRecoveryCode(result.recoveryCode);
      setCreatedAt(result.createdAt);
    } catch (caught) {
      setRecoveryCode("");
      setCreatedAt("");
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to generate recovery code.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(recoveryCode);
      setMessage("Recovery code copied.");
    } catch {
      setMessage("Select and copy the recovery code manually.");
    }
  }

  async function confirmSaved() {
    if (!createdAt || !hasSaved) {
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      await confirmBackupRecoveryCode(createdAt);
      setRecoveryCode("");
      setCreatedAt("");
      await onCompleted();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to confirm recovery code.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-lg">
      <div className="rounded-xl border border-amber-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-amber-800">
          Required security setup
        </p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900">
          Save your backup recovery code
        </h2>
        <p className="mt-3 text-base leading-7 text-slate-700">
          Use this code if you forget the administrator password. It is shown
          only after generation and will be replaced if you generate another
          one.
        </p>

        {!recoveryCode ? (
          <>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Store it in a password manager or another secure offline location.
            </p>
            <button
              type="button"
              onClick={() => void generateCode()}
              disabled={isSubmitting}
              className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#0b3b4a] px-4 py-2.5 font-bold text-white transition hover:bg-[#0a3340] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Generating…" : "Generate recovery code"}
            </button>
          </>
        ) : (
          <div className="mt-6">
            <div className="rounded-lg border-2 border-dashed border-teal-300 bg-teal-50 p-4 text-center">
              <code className="break-all text-lg font-bold tracking-wider text-slate-950 sm:text-xl">
                {recoveryCode}
              </code>
            </div>
            <button
              type="button"
              onClick={() => void copyCode()}
              className="mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Copy recovery code
            </button>

            <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm leading-6 text-slate-800">
              <input
                type="checkbox"
                checked={hasSaved}
                onChange={(event) => setHasSaved(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-700"
              />
              <span>I have saved this recovery code in a secure location.</span>
            </label>

            <button
              type="button"
              onClick={() => void confirmSaved()}
              disabled={!hasSaved || isSubmitting}
              className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#0b3b4a] px-4 py-2.5 font-bold text-white transition hover:bg-[#0a3340] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Saving…" : "Continue to admin area"}
            </button>
          </div>
        )}

        {message ? (
          <p role="status" className="mt-4 text-sm font-medium text-teal-900">
            {message}
          </p>
        ) : null}
        {error ? (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-900"
          >
            {error}
          </p>
        ) : null}
      </div>
    </section>
  );
}
