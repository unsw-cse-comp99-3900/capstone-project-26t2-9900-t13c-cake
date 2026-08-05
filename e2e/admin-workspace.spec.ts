import { expect, test } from "@playwright/test";
import { signInAsAdmin } from "./auth";

test.describe("Admin workspace", () => {
  test.describe.configure({ mode: "serial" });

  test("opens evidence records and account settings from the hub", async ({ page }) => {
    await signInAsAdmin(page);

    await page.getByRole("link", { name: /Evidence records/i }).click();
    await expect(page).toHaveURL(/\/admin\/records/);
    await expect(page.getByRole("heading", { name: "Evidence records" })).toBeVisible();

    await page.goto("/admin");
    await page.getByRole("link", { name: /Account settings/i }).click();
    await expect(page).toHaveURL(/\/admin\/account/);
  });

  test("opens website usage and survey data tools", async ({ page }) => {
    await signInAsAdmin(page);

    await page.getByRole("link", { name: /Website usage/i }).click();
    await expect(page).toHaveURL(/\/admin\/analytics/);

    await page.goto("/admin");
    await page.getByRole("link", { name: /Anonymous survey data/i }).click();
    await expect(page).toHaveURL(/\/admin\/surveys/);
  });
});
