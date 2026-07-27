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
      <div className="min-h-screen bg-white text-slate-900">
        <header className="bg-[#004c45] text-white shadow-[0_10px_28px_rgba(0,36,33,0.18)]">
          <div className="mx-auto flex min-h-[86px] w-full max-w-[1500px] flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-[75px]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#7fd8cf]">
                ADMINISTRATOR
              </p>
              <h1 className="mt-1 font-[Georgia,serif] text-2xl font-normal text-white sm:text-3xl">
                Account centre
              </h1>
            </div>
            <AdminHeaderActions />
          </div>
        </header>

        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto min-h-[calc(100vh-86px)] w-full max-w-[1500px] bg-[radial-gradient(circle_at_50%_0%,rgba(0,107,99,0.26)_0%,rgba(217,237,233,0.72)_35%,#ffffff_74%)] px-5 py-8 outline-none sm:px-8 lg:px-[75px] lg:py-9"
        >
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
        className="inline-flex min-h-11 items-center justify-center border border-white/45 bg-transparent px-5 py-2 text-sm font-bold text-white transition hover:border-white/80 hover:bg-white/10 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        Back to public tool
      </Link>
      {session.status === "authenticated" && (
        <button
          type="button"
          onClick={() => void logout()}
          disabled={isLoggingOut}
          className="inline-flex min-h-11 items-center justify-center border border-white/45 bg-transparent px-4 py-2 text-sm font-bold text-white transition hover:border-white/80 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {isLoggingOut ? "Signing out…" : "Sign out"}
        </button>
      )}
    </div>
  );
}
