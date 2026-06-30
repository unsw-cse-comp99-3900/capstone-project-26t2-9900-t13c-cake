import { AdminSubpageShell } from "@/components/admin/AdminSubpageShell";
import { adminNavigation } from "@/lib/admin/adminNavigation";

const item = adminNavigation.find((entry) => entry.id === "analytics");

export default function AdminAnalyticsPage() {
  if (!item) {
    return null;
  }

  return (
    <AdminSubpageShell item={item}>
      <p>
        Planned metrics include landing-page visits, questionnaire starts, completion rate, and
        result counts. Data will be aggregated and anonymised before it is shown here.
      </p>
    </AdminSubpageShell>
  );
}
