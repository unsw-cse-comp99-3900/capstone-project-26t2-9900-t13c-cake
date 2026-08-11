import { expect, test } from "@playwright/test";
import { dismissAccessibilityTip } from "./helpers";

test.describe("Public questionnaire", () => {
  test("selects a jurisdiction and continues to context", async ({ page }) => {
    await page.goto("/questionnaire");
    await dismissAccessibilityTip(page);

    await expect(
      page.getByRole("heading", { name: "Which locations apply to your project?" }),
    ).toBeVisible();

    const continueButton = page.getByRole("button", { name: "Continue" });
    await expect(continueButton).toBeDisabled();

    await page.locator("label[for='jurisdiction-national']").click();
    await expect(continueButton).toBeEnabled();

    await continueButton.click();
    await expect(
      page.getByRole("heading", {
        name: "What is the research context and evidence coverage?",
      }),
    ).toBeVisible();
  });

  test("completes context selections and shows matched results", async ({ page }) => {
    await page.goto("/questionnaire");
    await dismissAccessibilityTip(page);

    await page.locator("label[for='jurisdiction-national']").click();
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(
      page.getByRole("heading", {
        name: "What is the research context and evidence coverage?",
      }),
    ).toBeVisible();

    await expect(page.getByText("Loading options")).toBeHidden({ timeout: 30_000 });

    const firstContext = page.locator('input[name="context"]').first();
    await expect(firstContext).toBeVisible({ timeout: 30_000 });
    await firstContext.locator("xpath=ancestor::label[1]").click();

    const selectAll = page.getByRole("button", { name: "Select all" }).first();
    await expect(selectAll).toBeVisible();
    await selectAll.click();

    const viewResults = page.getByRole("button", { name: "View results" });
    await expect(viewResults).toBeEnabled();
    await viewResults.click();

    await expect(page.getByText("Matched evidence guidance")).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByRole("button", { name: "Print results" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Export PDF" })).toBeVisible();
  });
});
