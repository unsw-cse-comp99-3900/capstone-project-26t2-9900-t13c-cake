import Link from "next/link";
import { AccountRecoveryForm } from "@/components/admin/AccountRecoveryForm";

export default function AdminForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-800">
              Administrator
            </p>
            <h1 className="text-xl font-bold text-slate-900">Account recovery</h1>
          </div>
          <Link
            href="/"
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
          >
            Back to public tool
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <AccountRecoveryForm />
      </main>
    </div>
  );
}
