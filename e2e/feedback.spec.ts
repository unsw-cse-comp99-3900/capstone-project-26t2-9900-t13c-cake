import { expect, test } from "@playwright/test";
import { dismissAccessibilityTip } from "./helpers";

test.describe("Public feedback", () => {
  test("loads the anonymous feedback form", async ({ page }) => {
    await page.goto("/feedback");
    await dismissAccessibilityTip(page);

    await expect(
      page.getByRole("heading", { name: "Share anonymous feedback" }),
    ).toBeVisible();
    await expect(page.locator("#feedback-worked-well")).toBeVisible();
    await expect(page.locator("#feedback-improvement")).toBeVisible();
    await expect(page.getByRole("button", { name: "Submit feedback" })).toBeVisible();
  });
});
