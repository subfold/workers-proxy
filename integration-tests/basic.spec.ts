import { test, expect } from "@playwright/test";

test("basic example", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("Workers Proxy Demo Site 1");

  await page.goto("/subdirectory");
  await expect(page.locator("h1")).toContainText("Workers Proxy Demo Site 2");

  await page.goto("/redirect");
  await page.waitForURL("https://workers-proxy-demo-2.tiiny.site");
});
