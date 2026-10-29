import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

/**
 * Browser checks for Learn SQL lesson routes and the not-found page.
 * These run against the Vite dev server (see playwright.config.ts).
 */

async function waitForDuckDB(page: Page) {
  const runButton = page.getByLabel("Run SQL query").first();
  await expect(runButton).toBeVisible({ timeout: 30000 });
  await expect(runButton).toBeEnabled({ timeout: 30000 });
}

/** Load lesson data, open the official solution, run it, and check the answer. */
async function solveLessonWithSolution(page: Page, successMessage: RegExp) {
  await waitForDuckDB(page);

  await page.getByRole("button", { name: "Load Data" }).first().click();
  await expect(page.getByRole("button", { name: "Loaded" }).first()).toBeVisible({ timeout: 15000 });

  await page.getByRole("button", { name: "Show Solution" }).first().click();
  await page.getByLabel("Run SQL query").first().click();
  await expect(page.getByText(/\d+ rows?/i).first()).toBeVisible({ timeout: 15000 });

  await page.getByRole("button", { name: "Check Answer" }).first().click();
  await expect(page.getByText(successMessage).first()).toBeVisible({ timeout: 15000 });
}

test.describe("Learn SQL lesson routes", () => {
  test("opens a lesson from its URL with lesson metadata", async ({ page }) => {
    await page.goto("/editor/chapter1/01");

    await expect(page).toHaveTitle("Your First Query: Interactive SQL Lesson | SQL for Files");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://sqlforfiles.app/editor/chapter1/01"
    );
    await expect(page.getByText("01 Your First Query").first()).toBeVisible({ timeout: 15000 });
  });

  test("accepts the official solution for a list lambda challenge", async ({ page }) => {
    // Regression: list results arrive as Arrow vectors, which the validator used to reject.
    await page.goto("/editor/chapter12/01");
    await solveLessonWithSolution(page, /list_transform applied the lambda/);
  });

  test("accepts the official solution for list_reduce with an empty filtered list", async ({ page }) => {
    // Regression: DuckDB 1.4 raises an error for list_reduce on empty lists without a start value.
    await page.goto("/editor/chapter12/04");
    await solveLessonWithSolution(page, /combined list_filter and list_reduce/);
  });
});

test.describe("Not found", () => {
  test("renders a noindex not-found page for unknown URLs", async ({ page }) => {
    await page.goto("/this-page-does-not-exist");

    await expect(page.getByRole("heading", { level: 1, name: "Page not found" })).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex");
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  });
});
