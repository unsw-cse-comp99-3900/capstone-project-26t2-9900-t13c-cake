import { redirect } from "next/navigation";

export default function AdminUsernameRedirectPage() {
  redirect("/admin/account");
}
