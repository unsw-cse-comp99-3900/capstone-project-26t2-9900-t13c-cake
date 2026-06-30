import Link from "next/link";
import { ExcelImportExportPanel } from "@/components/admin/ExcelImportExportPanel";
import { adminNavigation } from "@/lib/admin/adminNavigation";
import { ADMIN_HOME_PATH } from "@/lib/admin/adminNavigation";

const item = adminNavigation.find((entry) => entry.id === "records");

export default function AdminRecordsPage() {
  if (!item) {
    return null;
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
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{item.title}</h2>
            <p className="mt-2 max-w-3xl text-base leading-7 text-slate-600">{item.description}</p>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
            Coming soon
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">Excel import and export</h3>
        <p className="mt-2 text-base leading-7 text-slate-600">
          Bulk update and download the evidence table from this CRUD workspace. Excel tools are part
          of the records screen, not a separate administrator area.
        </p>
        <div className="mt-4">
          <ExcelImportExportPanel />
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6">
        <h3 className="text-lg font-bold text-slate-900">Record list and forms</h3>
        <p className="mt-2 text-base leading-7 text-slate-600">
          Record list, create, and edit screens will be implemented in <strong>CAKE-11</strong> and
          will appear above the Excel tools. Write APIs remain protected by the admin session.
        </p>
      </div>
    </section>
  );
}
