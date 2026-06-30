import { AdminSubpageShell } from "@/components/admin/AdminSubpageShell";
import { adminNavigation } from "@/lib/admin/adminNavigation";

const item = adminNavigation.find((entry) => entry.id === "surveys");

export default function AdminSurveysPage() {
  if (!item) {
    return null;
  }

  return (
    <AdminSubpageShell item={item}>
      <p>
        The public questionnaire does not collect personal identifiers. Future versions will log
        only anonymised filter selections so supervisors can understand usage patterns without
        storing identifiable survey responses.
      </p>
    </AdminSubpageShell>
  );
}
