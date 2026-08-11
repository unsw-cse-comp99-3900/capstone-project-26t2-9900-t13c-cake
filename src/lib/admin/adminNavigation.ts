export type AdminNavStatus = "available" | "coming_soon";

export type AdminNavItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  status: AdminNavStatus;
  story?: string;
};

/** Administrator hub paths and navigation items (CAKE-10). */
export const ADMIN_HOME_PATH = "/admin";
export const ADMIN_FORGOT_PASSWORD_PATH = "/admin/forgot-password";
/** sessionStorage key for post-reset banner on the login screen. */
export const ADMIN_RESET_MESSAGE_KEY = "admin-account-reset-message";

export const ADMIN_PUBLIC_PATHS = [ADMIN_FORGOT_PASSWORD_PATH] as const;

/** Available administrator tools shown on the account centre hub. */
export const adminNavigation: AdminNavItem[] = [
  {
    id: "records",
    title: "Evidence records",
    description:
      "Browse, create, edit, and soft-delete remuneration guidance records. Import and export the evidence table via Excel from the same workspace.",
    href: "/admin/records",
    status: "available",
  },
  {
    id: "account",
    title: "Account settings",
    description:
      "Update your administrator username and password to keep maintenance access secure.",
    href: "/admin/account",
    status: "available",
  },
  {
    id: "analytics",
    title: "Website usage",
    description:
      "View anonymised traffic trends such as page visits, quiz starts, and quiz completion rates.",
    href: "/admin/analytics",
    status: "available",
  },
  {
    id: "surveys",
    title: "Anonymous survey data",
    description:
      "Review anonymous feedback submitted by public tool users.",
    href: "/admin/surveys",
    status: "available",
  },
];

/** Resolve an admin nav item by exact pathname. */
export function getAdminNavItem(pathname: string): AdminNavItem | undefined {
  return adminNavigation.find((item) => item.href === pathname);
}
