import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import QueryResults from "./QueryResults";
import type { QueryResult } from "../../types/query";

function createResult(overrides: Partial<QueryResult> = {}): QueryResult {
  const defaultData: Record<string, unknown>[] = [
    { id: 1, name: "Alice", age: 30 },
    { id: 2, name: "Bob", age: 25 },
  ];
  const data = (overrides.data ?? defaultData) as Record<string, unknown>[];

  return {
    data: defaultData,
    columns: ["id", "name", "age"],
    rowCount: 2,
    displayRowCount: 2,
    executionTime: 12.34,
    arrowTable: {
      numRows: data.length,
      getChild: (col: string) => ({
        get: (i: number) => data[i]?.[col] ?? null,
      }),
    },
    wasTruncated: false,
    ...overrides,
  };
}

describe("QueryResults", () => {
  describe("empty state (no query executed)", () => {
    it("shows 'Ready to Execute' when no result and no error", () => {
      render(<QueryResults result={null} error={null} />);
      expect(screen.getByText("Ready to Execute")).toBeInTheDocument();
    });

    it("shows example queries in standalone mode", () => {
      render(<QueryResults result={null} error={null} />);
      expect(screen.getByText("Example Queries:")).toBeInTheDocument();
    });

    it("shows simplified empty state in embedded mode", () => {
      render(<QueryResults result={null} error={null} embedded />);
      expect(screen.getByText("Run a query to see results here")).toBeInTheDocument();
      expect(screen.queryByText("Ready to Execute")).not.toBeInTheDocument();
    });

    it("shows Ctrl+Enter hint in embedded mode", () => {
      render(<QueryResults result={null} error={null} embedded />);
      expect(screen.getByText("Ctrl+Enter")).toBeInTheDocument();
    });
  });

  describe("error state", () => {
    it("displays error message", () => {
      const error = new Error("Syntax error near SELECT");
      render(<QueryResults result={null} error={error} />);
      expect(screen.getByText("Query Error")).toBeInTheDocument();
      expect(screen.getByText("Syntax error near SELECT")).toBeInTheDocument();
    });
  });

  describe("result rendering", () => {
    it("renders column headers", () => {
      render(<QueryResults result={createResult()} error={null} />);
      expect(screen.getByText("id")).toBeInTheDocument();
      expect(screen.getByText("name")).toBeInTheDocument();
      expect(screen.getByText("age")).toBeInTheDocument();
    });

    it("renders row data", () => {
      render(<QueryResults result={createResult()} error={null} />);
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("Bob")).toBeInTheDocument();
      expect(screen.getByText("30")).toBeInTheDocument();
      expect(screen.getByText("25")).toBeInTheDocument();
    });

    it("shows row count badge", () => {
      render(<QueryResults result={createResult()} error={null} />);
      expect(screen.getByText("2 rows")).toBeInTheDocument();
    });

    it("shows singular 'row' for single result", () => {
      const result = createResult({
        data: [{ id: 1, name: "Alice", age: 30 }],
        rowCount: 1,
        displayRowCount: 1,
      });
      render(<QueryResults result={result} error={null} />);
      expect(screen.getByText("1 row")).toBeInTheDocument();
    });

    it("shows execution time", () => {
      render(<QueryResults result={createResult()} error={null} />);
      expect(screen.getByText("12.34ms")).toBeInTheDocument();
    });

    it("shows Export CSV button", () => {
      render(<QueryResults result={createResult()} error={null} />);
      expect(screen.getByText(/Export CSV/)).toBeInTheDocument();
    });

    it("renders null values with italic style", () => {
      const result = createResult({
        data: [
          { id: 1, name: null, age: 30 },
        ],
        rowCount: 1,
        displayRowCount: 1,
      });
      render(<QueryResults result={result} error={null} />);
      const nullSpan = screen.getByText("null");
      expect(nullSpan.className).toContain("italic");
    });

    it("shows 'no rows' message for empty result", () => {
      const result = createResult({
        data: [],
        rowCount: 0,
        displayRowCount: 0,
      });
      render(<QueryResults result={result} error={null} />);
      expect(
        screen.getByText("Query executed successfully but returned no rows.")
      ).toBeInTheDocument();
    });
  });

  describe("truncation warning", () => {
    it("shows truncation warning when wasTruncated is true", () => {
      const result = createResult({
        rowCount: 5000,
        displayRowCount: 1000,
        wasTruncated: true,
      });
      render(<QueryResults result={result} error={null} />);
      expect(screen.getByText("Results Truncated for Display")).toBeInTheDocument();
      // The warning text contains both numbers in the same paragraph
      const warningText = screen.getByText(/Showing/);
      expect(warningText.textContent).toContain("1,000");
      expect(warningText.textContent).toContain("5,000");
    });

    it("does not show truncation warning when not truncated", () => {
      render(<QueryResults result={createResult()} error={null} />);
      expect(
        screen.queryByText("Results Truncated for Display")
      ).not.toBeInTheDocument();
    });
  });

  describe("column sorting", () => {
    it("sorts ascending on first click", async () => {
      const user = userEvent.setup();
      const result = createResult({
        data: [
          { id: 2, name: "Bob", age: 25 },
          { id: 1, name: "Alice", age: 30 },
        ],
      });
      render(<QueryResults result={result} error={null} />);

      // Click 'name' column header
      await user.click(screen.getByText("name"));

      // Alice should appear before Bob after asc sort
      const rows = screen.getAllByRole("row");
      // First row is header, data starts at index 1
      const firstDataRow = rows[1];
      const secondDataRow = rows[2];
      expect(firstDataRow.textContent).toContain("Alice");
      expect(secondDataRow.textContent).toContain("Bob");
    });

    it("sorts descending on second click", async () => {
      const user = userEvent.setup();
      const result = createResult({
        data: [
          { id: 1, name: "Alice", age: 30 },
          { id: 2, name: "Bob", age: 25 },
        ],
      });
      render(<QueryResults result={result} error={null} />);

      // Click 'name' twice
      await user.click(screen.getByText("name"));
      await user.click(screen.getByText("name"));

      // Bob should appear before Alice after desc sort
      const rows = screen.getAllByRole("row");
      const firstDataRow = rows[1];
      const secondDataRow = rows[2];
      expect(firstDataRow.textContent).toContain("Bob");
      expect(secondDataRow.textContent).toContain("Alice");
    });

    it("resets sort on third click", async () => {
      const user = userEvent.setup();
      const result = createResult({
        data: [
          { id: 2, name: "Bob", age: 25 },
          { id: 1, name: "Alice", age: 30 },
        ],
      });
      render(<QueryResults result={result} error={null} />);

      // Click 'name' three times (asc -> desc -> reset)
      await user.click(screen.getByText("name"));
      await user.click(screen.getByText("name"));
      await user.click(screen.getByText("name"));

      // Should be back to original order
      const rows = screen.getAllByRole("row");
      expect(rows[1].textContent).toContain("Bob");
      expect(rows[2].textContent).toContain("Alice");
    });

    it("handles null values in sort (nulls last)", async () => {
      const user = userEvent.setup();
      const result = createResult({
        data: [
          { id: 1, name: null, age: 30 },
          { id: 2, name: "Alice", age: 25 },
        ],
        columns: ["id", "name", "age"],
      });
      render(<QueryResults result={result} error={null} />);

      await user.click(screen.getByText("name"));

      // Alice should appear before null
      const rows = screen.getAllByRole("row");
      expect(rows[1].textContent).toContain("Alice");
      expect(rows[2].textContent).toContain("null");
    });
  });

  describe("embedded mode", () => {
    it("does not show standalone header in embedded mode", () => {
      render(<QueryResults result={createResult()} error={null} embedded />);
      expect(screen.queryByText("Query Results")).not.toBeInTheDocument();
    });

    it("shows floating export button in embedded mode with results", () => {
      render(<QueryResults result={createResult()} error={null} embedded />);
      // The embedded export button has a title attribute
      const exportBtn = screen.getByTitle("Export CSV");
      expect(exportBtn).toBeInTheDocument();
    });
  });

  describe("CSV export", () => {
    it("triggers download on Export CSV click", async () => {
      const user = userEvent.setup();

      render(<QueryResults result={createResult()} error={null} />);

      // Mock DOM manipulation AFTER render so render itself isn't affected
      const mockClick = vi.fn();
      const mockSetAttribute = vi.fn();
      const origCreateElement = document.createElement.bind(document);
      vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
        if (tag === "a") {
          return {
            setAttribute: mockSetAttribute,
            click: mockClick,
            style: {} as CSSStyleDeclaration,
          } as unknown as HTMLAnchorElement;
        }
        return origCreateElement(tag);
      });
      vi.spyOn(document.body, "appendChild").mockImplementation((node) => node);
      vi.spyOn(document.body, "removeChild").mockImplementation((node) => node);

      const exportBtn = screen.getByText(/Export CSV/);
      await user.click(exportBtn);

      expect(mockClick).toHaveBeenCalled();
      expect(mockSetAttribute).toHaveBeenCalledWith("download", expect.stringContaining("query_results_"));
    });
  });
});
