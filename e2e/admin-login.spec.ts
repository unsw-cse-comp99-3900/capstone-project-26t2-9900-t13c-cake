import { expect, test } from "@playwright/test";
import { dismissAccessibilityTip } from "./helpers";
import { signInAsAdmin } from "./auth";

const adminUsername = process.env.ADMIN_USERNAME || "admin";
const adminPassword = process.env.ADMIN_PASSWORD || "change-me";

test.describe("Admin login", () => {
  test.describe.configure({ mode: "serial" });

  test("shows the sign-in form for guests", async ({ page }) => {
    await page.goto("/admin");
    await dismissAccessibilityTip(page);

    await expect(page.getByLabel("Username")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("rejects invalid credentials", async ({ page }) => {
    await page.goto("/admin");
    await dismissAccessibilityTip(page);

    await page.getByLabel("Username").fill(adminUsername);
    await page.getByLabel("Password").fill("definitely-not-the-password");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.locator("#admin-login-error")).toContainText(
      /Invalid credentials|Unable to sign in/i,
    );
    await expect(page.getByLabel("Username")).toBeVisible();
  });

  test("signs in with configured credentials", async ({ page }) => {
    await signInAsAdmin(page);
    await expect(page.getByRole("button", { name: /Sign out/i })).toBeVisible();
  });
});
