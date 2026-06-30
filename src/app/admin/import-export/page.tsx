import { redirect } from "next/navigation";

/** Excel tools live inside the CRUD workspace at /admin/records */
export default function AdminImportExportRedirectPage() {
  redirect("/admin/records");
}
