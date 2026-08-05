import { expect, test } from "@playwright/test";
import { dismissAccessibilityTip } from "./helpers";

const adminUsername = process.env.ADMIN_USERNAME || "admin";
const adminPassword = process.env.ADMIN_PASSWORD || "change-me";

async function completeBackupRecoveryIfNeeded(page: import("@playwright/test").Page) {
  const setupHeading = page.getByRole("heading", {
    name: "Save your backup recovery code",
  });
  const welcomeHeading = page.getByRole("heading", {
    name: new RegExp(`Welcome,\\s*${adminUsername}`, "i"),
  });

  await expect(setupHeading.or(welcomeHeading)).toBeVisible();

  if (await setupHeading.isVisible()) {
    await page.getByRole("button", { name: "Generate recovery code" }).click();
    await expect(page.locator("code").first()).toBeVisible();
    await page
      .getByLabel("I have saved this recovery code in a secure location.")
      .check();
    await page.getByRole("button", { name: "Continue to admin area" }).click();
  }

  await expect(welcomeHeading).toBeVisible();
}

test.describe("Admin login", () => {
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
    await page.goto("/admin");
    await dismissAccessibilityTip(page);

    await page.getByLabel("Username").fill(adminUsername);
    await page.getByLabel("Password").fill(adminPassword);
    await page.getByRole("button", { name: "Sign in" }).click();

    await completeBackupRecoveryIfNeeded(page);
    await expect(page.getByRole("button", { name: /Sign out/i })).toBeVisible();
  });
});
