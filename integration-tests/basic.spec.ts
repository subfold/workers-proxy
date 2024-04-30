import { test, expect } from "@playwright/test";

test("basic example", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("Workers Proxy Demo Site 1");
});
