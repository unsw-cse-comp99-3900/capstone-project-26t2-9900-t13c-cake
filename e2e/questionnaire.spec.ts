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
});
