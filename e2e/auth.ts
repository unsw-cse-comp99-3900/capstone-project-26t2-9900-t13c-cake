import { expect, test } from "@playwright/test";
import { dismissAccessibilityTip } from "./helpers";

const adminUsername = process.env.ADMIN_USERNAME || "admin";
const adminPassword = process.env.ADMIN_PASSWORD || "change-me";

export async function signInAsAdmin(page: import("@playwright/test").Page) {
  await page.goto("/admin");
  await dismissAccessibilityTip(page);

  await page.getByLabel("Username").fill(adminUsername);
  await page.getByLabel("Password").fill(adminPassword);
  await page.getByRole("button", { name: "Sign in" }).click();

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
