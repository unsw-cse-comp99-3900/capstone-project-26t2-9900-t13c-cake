import { describe, expect, it } from "vitest";
import {
  ADMIN_FORGOT_PASSWORD_PATH,
  ADMIN_HOME_PATH,
  adminNavigation,
  getAdminNavItem,
} from "@/lib/admin/adminNavigation";

describe("adminNavigation", () => {
  it("exposes the account centre home and forgot-password paths", () => {
    expect(ADMIN_HOME_PATH).toBe("/admin");
    expect(ADMIN_FORGOT_PASSWORD_PATH).toBe("/admin/forgot-password");
  });

  it("includes the available admin tools", () => {
    expect(adminNavigation.map((item) => item.id)).toEqual([
      "records",
      "account",
      "analytics",
      "surveys",
    ]);
    expect(adminNavigation.every((item) => item.status === "available")).toBe(true);
  });

  it("resolves navigation items by pathname", () => {
    expect(getAdminNavItem("/admin/records")?.id).toBe("records");
    expect(getAdminNavItem("/admin/missing")).toBeUndefined();
  });
});
