import { type Page } from "@playwright/test";

/** Dismiss the first-visit keyboard shortcuts tip if it is shown. */
export async function dismissAccessibilityTip(page: Page) {
  const gotIt = page.getByRole("button", { name: "Got it" });
  try {
    await gotIt.waitFor({ state: "visible", timeout: 2_000 });
    await gotIt.click();
  } catch {
    // Tip already dismissed or not shown for this browser context.
  }
}
