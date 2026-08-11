import { expect, test } from "@playwright/test";
import { dismissAccessibilityTip } from "./helpers";

test.describe("Landing page", () => {
  test("shows the tool title and starts the questionnaire", async ({ page }) => {
    await page.goto("/");
    await dismissAccessibilityTip(page);

    await expect(
      page.getByRole("heading", { name: "Consumer Representative Remuneration Tool" }),
    ).toBeVisible();

    await page
      .getByRole("main")
      .getByRole("link", { name: "Start the questionnaire" })
      .first()
      .click();
    await expect(page).toHaveURL(/\/questionnaire/);
    await expect(
      page.getByRole("heading", { name: "Which locations apply to your project?" }),
    ).toBeVisible();
  });

  test("links to the admin area from the footer", async ({ page }) => {
    await page.goto("/");
    await dismissAccessibilityTip(page);

    await page.getByRole("link", { name: "Administrator centre" }).click();
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.getByLabel("Username")).toBeVisible();
  });
});
