"use client";

import Link from "next/link";
import { useAdminAuth } from "@/components/admin/AdminLoginGate";
import {
  adminNavigation,
  type AdminNavItem,
  type AdminNavStatus,
} from "@/lib/admin/adminNavigation";

function StatusBadge({ status }: { status: AdminNavStatus }) {
  if (status === "available") {
    return (
      <span className="rounded-full bg-teal-100 px-2.5 py-1 text-xs font-semibold text-teal-800">
        Available
      </span>
    );
  }

  return (
    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
      Coming soon
    </span>
  );
}

function NavCard({ item }: { item: AdminNavItem }) {
  const isDisabled = item.status === "coming_soon";

  const cardContent = (
    <>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
        <StatusBadge status={item.status} />
      </div>
      <p className="mt-2 text-base leading-7 text-slate-600">{item.description}</p>
      {item.story && (
        <p className="mt-3 text-sm font-medium text-slate-500">{item.story}</p>
      )}
      <p className="mt-4 text-sm font-semibold text-teal-800">
        {isDisabled ? "Preview area" : "Open"}
        <span aria-hidden="true" className="ml-1">
          &rarr;
        </span>
      </p>
    </>
  );

  const className =
    "block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-300 hover:shadow-md focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700";

  return (
    <Link href={item.href} className={className}>
      {cardContent}
    </Link>
  );
}

/** Administrator account centre hub */
export function AdminAccountCenter() {
  const { session } = useAdminAuth();
  const username = session.status === "authenticated" ? session.username : "Administrator";

  return (
    <section className="space-y-8">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-800">
          Account centre
        </p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">Welcome, {username}</h2>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
          Manage evidence records, review anonymised usage insights, and maintain administrator
          access from one place. Researchers continue to use the public questionnaire without an
          account.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-bold text-slate-900">Administrator tools</h3>
        <p className="mt-1 text-base text-slate-600">
          Choose a task below. Some areas are scaffolded now and will be completed in upcoming
          sprints.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {adminNavigation.map((item) => (
            <NavCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
