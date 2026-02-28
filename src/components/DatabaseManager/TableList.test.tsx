import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock dependencies
const mockRefreshTables = vi.fn().mockResolvedValue(undefined);
const mockSaveDatabase = vi.fn().mockResolvedValue({ saved: [], errors: [], warnings: [] });

vi.mock("../../contexts/DuckDBContext", () => ({
  useDuckDBContext: vi.fn(() => ({
    db: {
      connect: vi.fn().mockResolvedValue({
        query: vi.fn().mockResolvedValue({
          toArray: () => [
            { column_name: "id", column_type: "INTEGER", null: "NO" },
            { column_name: "name", column_type: "VARCHAR", null: "YES" },
          ],
        }),
        close: vi.fn().mockResolvedValue(undefined),
      }),
    },
    tables: [],
    loading: false,
    error: null,
    saveDatabase: mockSaveDatabase,
    refreshTables: mockRefreshTables,
  })),
}));

vi.mock("../../hooks/usePersistence", () => ({
  usePersistence: vi.fn(() => ({
    exportDatabase: vi.fn().mockResolvedValue(undefined),
    importDatabase: vi.fn().mockResolvedValue(undefined),
    dropTable: vi.fn().mockResolvedValue(undefined),
    dropAllTables: vi.fn().mockResolvedValue(undefined),
  })),
}));

import { useDuckDBContext } from "../../contexts/DuckDBContext";
import TableList from "./TableList";

const mockUseDuckDBContext = useDuckDBContext as ReturnType<typeof vi.fn>;

describe("TableList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loading state", () => {
    it("shows loading spinner", () => {
      mockUseDuckDBContext.mockReturnValue({
        db: null,
        tables: [],
        loading: true,
        error: null,
        saveDatabase: mockSaveDatabase,
        refreshTables: mockRefreshTables,
      });

      render(<TableList />);
      expect(screen.getByText("Loading database...")).toBeInTheDocument();
    });
  });

  describe("error state", () => {
    it("shows error message", () => {
      mockUseDuckDBContext.mockReturnValue({
        db: null,
        tables: [],
        loading: false,
        error: new Error("Connection failed"),
        saveDatabase: mockSaveDatabase,
        refreshTables: mockRefreshTables,
      });

      render(<TableList />);
      expect(screen.getByText("Failed to load database")).toBeInTheDocument();
      expect(screen.getByText("Connection failed")).toBeInTheDocument();
    });
  });

  describe("empty state", () => {
    it("shows 'No tables yet' message", () => {
      mockUseDuckDBContext.mockReturnValue({
        db: {},
        tables: [],
        loading: false,
        error: null,
        saveDatabase: mockSaveDatabase,
        refreshTables: mockRefreshTables,
      });

      render(<TableList />);
      expect(screen.getByText("No tables yet")).toBeInTheDocument();
      expect(
        screen.getByText("Add a file or import a database to get started")
      ).toBeInTheDocument();
    });

    it("shows Import Database button even when empty", () => {
      mockUseDuckDBContext.mockReturnValue({
        db: {},
        tables: [],
        loading: false,
        error: null,
        saveDatabase: mockSaveDatabase,
        refreshTables: mockRefreshTables,
      });

      render(<TableList />);
      expect(screen.getByText("Import Database")).toBeInTheDocument();
    });
  });

  describe("table list rendering", () => {
    beforeEach(() => {
      mockUseDuckDBContext.mockReturnValue({
        db: {
          connect: vi.fn().mockResolvedValue({
            query: vi.fn().mockResolvedValue({
              toArray: () => [
                { column_name: "id", column_type: "INTEGER", null: "NO" },
                { column_name: "name", column_type: "VARCHAR", null: "YES" },
              ],
            }),
            close: vi.fn().mockResolvedValue(undefined),
          }),
        },
        tables: ["users", "orders"],
        loading: false,
        error: null,
        saveDatabase: mockSaveDatabase,
        refreshTables: mockRefreshTables,
      });
    });

    it("renders table names", () => {
      render(<TableList />);
      expect(screen.getByText("users")).toBeInTheDocument();
      expect(screen.getByText("orders")).toBeInTheDocument();
    });

    it("renders Tables header", () => {
      render(<TableList />);
      expect(screen.getByText("Tables")).toBeInTheDocument();
    });

    it("renders action buttons", () => {
      render(<TableList />);
      expect(screen.getByLabelText("Export database")).toBeInTheDocument();
      expect(screen.getByLabelText("Import database")).toBeInTheDocument();
      expect(screen.getByLabelText("Save database to browser")).toBeInTheDocument();
      expect(screen.getByLabelText("Drop all tables")).toBeInTheDocument();
    });

    it("renders delete button for each table", () => {
      render(<TableList />);
      const deleteButtons = screen.getAllByLabelText(/Delete .* table/);
      expect(deleteButtons).toHaveLength(2);
    });

    it("expands table to show schema", async () => {
      const user = userEvent.setup();
      render(<TableList />);

      // Click on 'users' table to expand
      await user.click(screen.getByLabelText(/Expand users table schema/));

      await waitFor(() => {
        expect(screen.getByText("id")).toBeInTheDocument();
        expect(screen.getByText("INTEGER")).toBeInTheDocument();
        expect(screen.getByText("VARCHAR")).toBeInTheDocument();
      });
    });

    it("collapses table on second click", async () => {
      const user = userEvent.setup();
      render(<TableList />);

      // Expand
      await user.click(screen.getByLabelText(/Expand users table schema/));
      await waitFor(() => {
        expect(screen.getByText("INTEGER")).toBeInTheDocument();
      });

      // Collapse
      await user.click(screen.getByLabelText(/Collapse users table schema/));
      await waitFor(() => {
        expect(screen.queryByText("INTEGER")).not.toBeInTheDocument();
      });
    });
  });

  describe("destructive operations", () => {
    beforeEach(() => {
      mockUseDuckDBContext.mockReturnValue({
        db: {
          connect: vi.fn().mockResolvedValue({
            query: vi.fn().mockResolvedValue({ toArray: () => [] }),
            close: vi.fn().mockResolvedValue(undefined),
          }),
        },
        tables: ["users", "orders"],
        loading: false,
        error: null,
        saveDatabase: mockSaveDatabase,
        refreshTables: mockRefreshTables,
      });
    });

    it("shows confirmation for Drop All", async () => {
      const user = userEvent.setup();
      render(<TableList />);

      await user.click(screen.getByLabelText("Drop all tables"));

      expect(screen.getByText(/Drop all 2 tables\?/)).toBeInTheDocument();
      expect(screen.getByText("Cancel")).toBeInTheDocument();
      expect(screen.getByText("Drop All")).toBeInTheDocument();
    });

    it("cancels Drop All confirmation", async () => {
      const user = userEvent.setup();
      render(<TableList />);

      await user.click(screen.getByLabelText("Drop all tables"));
      expect(screen.getByText(/Drop all 2 tables\?/)).toBeInTheDocument();

      await user.click(screen.getByText("Cancel"));
      expect(screen.queryByText(/Drop all 2 tables\?/)).not.toBeInTheDocument();
    });

    it("shows confirmation for per-table delete", async () => {
      const user = userEvent.setup();
      render(<TableList />);

      await user.click(screen.getByLabelText("Delete users table"));

      expect(screen.getByText(/Delete "users"\?/)).toBeInTheDocument();
    });

    it("cancels per-table delete confirmation", async () => {
      const user = userEvent.setup();
      render(<TableList />);

      await user.click(screen.getByLabelText("Delete users table"));
      expect(screen.getByText(/Delete "users"\?/)).toBeInTheDocument();

      await user.click(screen.getByText("Cancel"));
      expect(screen.queryByText(/Delete "users"\?/)).not.toBeInTheDocument();
    });
  });

  describe("save database", () => {
    it("calls saveDatabase when Save button is clicked", async () => {
      const user = userEvent.setup();
      mockUseDuckDBContext.mockReturnValue({
        db: {},
        tables: ["t1"],
        loading: false,
        error: null,
        saveDatabase: mockSaveDatabase,
        refreshTables: mockRefreshTables,
      });

      render(<TableList />);

      await user.click(screen.getByLabelText("Save database to browser"));
      expect(mockSaveDatabase).toHaveBeenCalled();
    });
  });

  describe("preview callback", () => {
    it("calls onPreviewTable when preview button is clicked", async () => {
      const user = userEvent.setup();
      const handlePreview = vi.fn();
      mockUseDuckDBContext.mockReturnValue({
        db: {
          connect: vi.fn().mockResolvedValue({
            query: vi.fn().mockResolvedValue({ toArray: () => [] }),
            close: vi.fn().mockResolvedValue(undefined),
          }),
        },
        tables: ["users"],
        loading: false,
        error: null,
        saveDatabase: mockSaveDatabase,
        refreshTables: mockRefreshTables,
      });

      render(<TableList onPreviewTable={handlePreview} />);

      await user.click(screen.getByLabelText("Preview users table"));
      expect(handlePreview).toHaveBeenCalledWith("users");
    });
  });
});
