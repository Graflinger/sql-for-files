import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import type { AsyncDuckDB } from "@duckdb/duckdb-wasm";

import { ThemeProvider } from "../../contexts/ThemeContext";
import { THEME_STORAGE } from "../../contexts/ThemeContextDef";
import { createMockArrowResult, createMockDuckDB } from "../../test/mocks/duckdb";
import AdvancedAddModal from "./AdvancedAddModal";

function renderWithTheme(ui: ReactNode) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe("AdvancedAddModal", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    document.documentElement.removeAttribute("data-theme-mode");
    document.documentElement.style.colorScheme = "light";
  });

  it("renders as an accessible dialog when open", () => {
    render(
      <AdvancedAddModal
        isOpen
        onClose={vi.fn()}
        db={null}
        onCreateTable={vi.fn().mockResolvedValue(undefined)}
      />
    );

    expect(screen.getByRole("dialog", { name: "Advanced Options" })).toBeInTheDocument();
    expect(screen.getByText("Database initializing...")).toBeInTheDocument();
  });

  it("includes dark mode styles for modal surfaces and form controls", async () => {
    localStorage.setItem(THEME_STORAGE.KEY, "dark");

    renderWithTheme(
      <AdvancedAddModal
        isOpen
        onClose={vi.fn()}
        db={null}
        onCreateTable={vi.fn().mockResolvedValue(undefined)}
      />
    );

    await waitFor(() => {
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    const dialog = screen.getByRole("dialog", { name: "Advanced Options" });
    expect(dialog.className).toContain("dark:bg-slate-950");
    expect(dialog.className).toContain("dark:border-slate-800");

    const tableNameInput = screen.getByLabelText("Table name");
    expect(tableNameInput.className).toContain("dark:bg-slate-900");
    expect(tableNameInput.className).toContain("dark:border-slate-700");

    expect(screen.getByText("Select a file").closest("label")?.className).toContain("dark:hover:bg-blue-950/30");
    expect(screen.getByText("Database initializing...").className).toContain("dark:text-slate-400");
  });

  it("supports timestamp formats and per-column type overrides for CSV files", async () => {
    const user = userEvent.setup();
    const mockDb = createMockDuckDB();
    const onCreateTable = vi.fn().mockResolvedValue(undefined);
    mockDb._mockConnection.query.mockResolvedValue(
      createMockArrowResult(
        [{ Name: "A", "Due Month": "2025-04-01T04:00:00Z" }],
        ["Name", "Due Month"]
      )
    );

    render(
      <AdvancedAddModal
        isOpen
        onClose={vi.fn()}
        db={mockDb as unknown as AsyncDuckDB}
        onCreateTable={onCreateTable}
      />
    );

    const file = new File(
      ["Name,Due Month\nA,2025-04-01T04:00:00Z"],
      "tasks.csv",
      { type: "text/csv" }
    );

    await user.upload(screen.getByLabelText("File"), file);

    await screen.findByLabelText("Type override for Due Month");

    await user.type(screen.getByLabelText("Timestamp format"), "%Y-%m-%dT%H:%M:%SZ");
    await user.selectOptions(
      screen.getByLabelText("Type override for Due Month"),
      "TIMESTAMP"
    );
    await user.click(screen.getByRole("button", { name: "Create table" }));

    await waitFor(() => {
      expect(onCreateTable).toHaveBeenCalledWith(
        expect.objectContaining({
          csvOptions: expect.objectContaining({
            timestampformat: "%Y-%m-%dT%H:%M:%SZ",
            types: { "Due Month": "TIMESTAMP" },
          }),
        })
      );
    });
  });

  it("lets the user opt out of datetime auto-detection for CSV files", async () => {
    const user = userEvent.setup();
    const mockDb = createMockDuckDB();
    const onCreateTable = vi.fn().mockResolvedValue(undefined);
    mockDb._mockConnection.query.mockResolvedValue(
      createMockArrowResult(
        [{ due: "2025-04-01T04:00:00Z" }],
        ["due"]
      )
    );

    render(
      <AdvancedAddModal
        isOpen
        onClose={vi.fn()}
        db={mockDb as unknown as AsyncDuckDB}
        onCreateTable={onCreateTable}
      />
    );

    const file = new File(
      ["due\n2025-04-01T04:00:00Z"],
      "tasks.csv",
      { type: "text/csv" }
    );

    await user.upload(screen.getByLabelText("File"), file);
    await screen.findByLabelText("Type override for due");

    const checkbox = screen.getByRole("checkbox", {
      name: /Auto-detect datetime columns/i,
    });
    // Defaults to on.
    expect(checkbox).toBeChecked();

    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();

    await user.click(screen.getByRole("button", { name: "Create table" }));

    await waitFor(() => {
      expect(onCreateTable).toHaveBeenCalledWith(
        expect.objectContaining({
          csvOptions: expect.objectContaining({
            autoDetectDatetime: false,
          }),
        })
      );
    });
  });
});
