import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";

import { ThemeProvider } from "../../contexts/ThemeContext";
import { THEME_STORAGE } from "../../contexts/ThemeContextDef";
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
});
