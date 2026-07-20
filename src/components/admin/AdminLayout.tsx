"use client";

import Link from "next/link";
import {
  AdminAuthProvider,
  AdminLoginGate,
  useAdminAuth,
  useAdminLogout,
} from "@/components/admin/AdminLoginGate";

/** Admin layout shell (CAKE-10) */
export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-teal-800">
                Administrator
              </p>
              <h1 className="text-xl font-bold text-slate-900">Account centre</h1>
            </div>
            <AdminHeaderActions />
          </div>
        </header>

        <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-6xl px-4 py-8 outline-none sm:px-6 lg:px-8">
          <AdminLoginGate>{children}</AdminLoginGate>
        </main>
      </div>
    </AdminAuthProvider>
  );
}

function AdminHeaderActions() {
  const { session } = useAdminAuth();
  const { logout, isLoggingOut } = useAdminLogout();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link
        href="/"
        className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
      >
        Back to public tool
      </Link>
      {session.status === "authenticated" && (
        <button
          type="button"
          onClick={() => void logout()}
          disabled={isLoggingOut}
          className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoggingOut ? "Signing out…" : "Sign out"}
        </button>
      )}
    </div>
  );
}
