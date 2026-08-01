import { AdminSubpageShell } from "@/components/admin/AdminSubpageShell";
import { WebsiteUsagePage } from "@/components/admin/WebsiteUsagePage";
import { adminNavigation } from "@/lib/admin/adminNavigation";

const item = adminNavigation.find((entry) => entry.id === "analytics");

export default function AdminAnalyticsPage() {
  if (!item) {
    return null;
  }

  return (
    <AdminSubpageShell item={item}>
      <WebsiteUsagePage />
    </AdminSubpageShell>
  );
}
