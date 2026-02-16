import { test, expect } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_DIR = path.resolve(__dirname, "fixtures");

test.describe("Navigation", () => {
  test("loads the home page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/SQL for Files/i);
  });

  test("navigates to editor page", async ({ page }) => {
    await page.goto("/");
    // Click the first "Editor" link in the navbar
    const editorLink = page.getByRole("link", { name: "Editor", exact: true });
    await editorLink.click();
    await expect(page).toHaveURL(/\/editor/);
    // Editor page should have DuckDB loading or ready state
    await expect(page.locator("body")).not.toBeEmpty();
  });

  test("navigates to docs page", async ({ page }) => {
    await page.goto("/docs");
    await expect(page.locator("body")).toContainText(/doc/i);
  });

  test("navigates to privacy page", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.locator("body")).toContainText(/privacy/i);
  });

  test("navigates to legal page", async ({ page }) => {
    await page.goto("/legal");
    await expect(page.locator("body")).toContainText(/legal/i);
  });
});

test.describe("SQL Editor - DuckDB Integration", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/editor");
    // Wait for DuckDB to initialize — the Run Query button becomes enabled when db is ready.
    // First wait for the button to appear (may be disabled initially), then wait for it to be enabled.
    const runButton = page.getByLabel("Run SQL query").first();
    await expect(runButton).toBeVisible({ timeout: 30000 });
    await expect(runButton).toBeEnabled({ timeout: 30000 });
  });

  /**
   * Helper: Set the Monaco editor content via its API and execute the query.
   * Direct keyboard typing is unreliable with Monaco because it intercepts keystrokes.
   */
  async function setEditorValueAndRun(page: import("@playwright/test").Page, sql: string) {
    // Set the editor value using Monaco's internal API
    await page.evaluate((sqlText) => {
      // Monaco editor exposes its model via the DOM element
      const editorElement = document.querySelector(".monaco-editor");
      if (!editorElement) throw new Error("Monaco editor element not found");
      // Access the editor instance via Monaco's global API
      // @ts-expect-error — monaco is available globally from @monaco-editor/react
      const monacoInstance = window.monaco;
      if (!monacoInstance) throw new Error("Monaco global not found");
      const models = monacoInstance.editor.getModels();
      if (models.length === 0) throw new Error("No Monaco models found");
      models[0].setValue(sqlText);
    }, sql);

    // Click the Run Query button to execute
    const runButton = page.getByLabel("Run SQL query").first();
    await runButton.click();
  }

  test("DuckDB initializes successfully", async ({ page }) => {
    // The Run Query button should be present and enabled (verified by beforeEach)
    const runButton = page.getByLabel("Run SQL query").first();
    await expect(runButton).toBeVisible();
    await expect(runButton).toBeEnabled();
  });

  test("uploads a CSV file and creates a table", async ({ page }) => {
    // Upload a CSV via the file input (multiple inputs exist for responsive layout)
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(path.join(FIXTURE_DIR, "sample.csv"));

    // Wait for the table to appear in the sidebar — table name derived from "sample.csv" -> "sample"
    // Use exact match to avoid matching "sample_data" link or error messages
    await expect(page.getByText("sample", { exact: true })).toBeVisible({ timeout: 15000 });
  });

  test("executes a query on uploaded data", async ({ page }) => {
    // Upload file
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(path.join(FIXTURE_DIR, "sample.csv"));

    // Wait for table to appear in the sidebar
    await expect(page.getByText("sample", { exact: true })).toBeVisible({ timeout: 15000 });

    // Set query and execute via Monaco API + Run button
    await setEditorValueAndRun(page, "SELECT * FROM sample LIMIT 5;");

    // Wait for results — should show row count info (e.g., "5 rows" or "Showing 5 of 5")
    await expect(page.getByText(/\d+ rows?/i)).toBeVisible({ timeout: 15000 });
  });

  test("shows error for invalid SQL", async ({ page }) => {
    // Set invalid SQL and execute
    await setEditorValueAndRun(page, "INVALID SQL QUERY;");

    // Should show "Query Error" heading in the results panel (use .first() due to desktop/mobile layout duplication)
    await expect(page.getByText("Query Error").first()).toBeVisible({ timeout: 15000 });
  });

  test("DuckDB can run built-in functions without tables", async ({ page }) => {
    // Set query and execute
    await setEditorValueAndRun(page, "SELECT 1 + 1 AS result;");

    // Should show "result" column header in the results table (use .first() due to desktop/mobile layout duplication)
    await expect(page.locator("th", { hasText: "result" }).first()).toBeVisible({ timeout: 15000 });
    // Verify the query completed with 1 row
    await expect(page.getByText(/1 row/i).first()).toBeVisible({ timeout: 15000 });
  });
});
