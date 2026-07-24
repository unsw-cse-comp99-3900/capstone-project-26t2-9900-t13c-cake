"use client";

import { usePathname } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ADMIN_FORGOT_PASSWORD_PATH } from "@/lib/admin/adminNavigation";

export default function AdminSectionLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  if (pathname === ADMIN_FORGOT_PASSWORD_PATH) {
    return <>{children}</>;
  }

  return <AdminLayout>{children}</AdminLayout>;
}
