import Link from "next/link";
import { AccountRecoveryForm } from "@/components/admin/AccountRecoveryForm";

export default function AdminForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="bg-[#004c45] text-white shadow-[0_10px_28px_rgba(0,36,33,0.18)]">
        <div className="mx-auto flex min-h-[86px] w-full max-w-[1500px] items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-[75px]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#7fd8cf]">
              Administrator
            </p>
            <h1 className="mt-1 font-[Georgia,serif] text-2xl font-normal text-white sm:text-3xl">
              Account recovery
            </h1>
          </div>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center border border-white/45 bg-transparent px-5 py-2 text-sm font-bold text-white transition hover:border-white/80 hover:bg-white/10 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Back to public tool
          </Link>
        </div>
      </header>

      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-6xl px-4 py-8 outline-none sm:px-6 lg:px-8"
      >
        <AccountRecoveryForm />
      </main>
    </div>
  );
}
