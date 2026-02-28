import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePersistence } from "./usePersistence";
import { createMockDuckDB, createMockArrowResult } from "../test/mocks/duckdb";
import type { AsyncDuckDB } from "@duckdb/duckdb-wasm";

// ── Mocks ────────────────────────────────────────────────────────────────────

// Mock the DuckDB context
const mockRefreshTables = vi.fn().mockResolvedValue(undefined);
let mockDb: ReturnType<typeof createMockDuckDB> | null = null;
let mockTableNames: string[] = [];

vi.mock("../contexts/DuckDBContext", () => ({
  useDuckDBContext: () => ({
    db: mockDb as unknown as AsyncDuckDB,
    tables: mockTableNames,
    refreshTables: mockRefreshTables,
  }),
}));

// Mock the Notification context
const mockAddNotification = vi.fn().mockReturnValue("notification-id-1");
const mockRemoveNotification = vi.fn();

vi.mock("../contexts/NotificationContext", () => ({
  useNotifications: () => ({
    addNotification: mockAddNotification,
    removeNotification: mockRemoveNotification,
  }),
}));

// Mock databasePersistence utilities
const mockSaveAllTablesToIndexedDB = vi.fn();
const mockRestoreDatabaseFromIndexedDB = vi.fn();
const mockClearAllDatabaseState = vi.fn();
const mockRemoveTableFromIndexedDB = vi.fn();
const mockConvertToCSV = vi.fn().mockReturnValue("col1,col2\nval1,val2");

vi.mock("../utils/databasePersistence", () => ({
  saveAllTablesToIndexedDB: (...args: unknown[]) =>
    mockSaveAllTablesToIndexedDB(...args),
  restoreDatabaseFromIndexedDB: (...args: unknown[]) =>
    mockRestoreDatabaseFromIndexedDB(...args),
  clearAllDatabaseState: (...args: unknown[]) =>
    mockClearAllDatabaseState(...args),
  removeTableFromIndexedDB: (...args: unknown[]) =>
    mockRemoveTableFromIndexedDB(...args),
  convertToCSV: (...args: unknown[]) => mockConvertToCSV(...args),
}));

// Mock jszip
vi.mock("jszip", () => {
  const mockFile = vi.fn();
  const mockGenerateAsync = vi.fn().mockResolvedValue(new Blob(["zip"]));
  const mockLoadAsync = vi.fn();

  return {
    default: class MockJSZip {
      file = mockFile;
      generateAsync = mockGenerateAsync;
      static loadAsync = mockLoadAsync;
      static _mockFile = mockFile;
      static _mockGenerateAsync = mockGenerateAsync;
      static _mockLoadAsync = mockLoadAsync;
    },
  };
});

// ── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  mockDb = createMockDuckDB();
  mockTableNames = ["users", "orders"];
  mockSaveAllTablesToIndexedDB.mockResolvedValue({
    saved: ["users", "orders"],
    errors: [],
    warnings: [],
  });
  mockRestoreDatabaseFromIndexedDB.mockResolvedValue({
    restoredCount: 0,
    tableNames: [],
  });
  mockClearAllDatabaseState.mockResolvedValue(undefined);
  mockRemoveTableFromIndexedDB.mockResolvedValue(undefined);
});

// ── Tests ────────────────────────────────────────────────────────────────────

describe("usePersistence", () => {
  describe("saveStateToIndexedDB", () => {
    it("calls saveAllTablesToIndexedDB with db and table names", async () => {
      const { result } = renderHook(() => usePersistence());

      await act(async () => {
        await result.current.saveStateToIndexedDB();
      });

      expect(mockSaveAllTablesToIndexedDB).toHaveBeenCalledWith(
        mockDb,
        ["users", "orders"]
      );
    });

    it("shows success notification after saving", async () => {
      const { result } = renderHook(() => usePersistence());

      await act(async () => {
        await result.current.saveStateToIndexedDB();
      });

      expect(mockAddNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "success",
          title: expect.stringContaining("2"),
        })
      );
    });

    it("shows warning notifications when present", async () => {
      mockSaveAllTablesToIndexedDB.mockResolvedValue({
        saved: ["users"],
        errors: [],
        warnings: ["Table users has many rows"],
      });

      const { result } = renderHook(() => usePersistence());

      await act(async () => {
        await result.current.saveStateToIndexedDB();
      });

      expect(mockAddNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "info",
          title: "Table users has many rows",
        })
      );
    });

    it("shows error notifications for failed tables", async () => {
      mockSaveAllTablesToIndexedDB.mockResolvedValue({
        saved: [],
        errors: [{ table: "users", error: "Out of memory" }],
        warnings: [],
      });

      const { result } = renderHook(() => usePersistence());

      await act(async () => {
        await result.current.saveStateToIndexedDB();
      });

      expect(mockAddNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error",
          title: expect.stringContaining("users"),
        })
      );
    });

    it("does nothing when db is null", async () => {
      mockDb = null;
      const { result } = renderHook(() => usePersistence());

      await act(async () => {
        await result.current.saveStateToIndexedDB();
      });

      expect(mockSaveAllTablesToIndexedDB).not.toHaveBeenCalled();
    });

    it("handles unexpected errors gracefully", async () => {
      mockSaveAllTablesToIndexedDB.mockRejectedValue(new Error("boom"));

      const { result } = renderHook(() => usePersistence());

      await act(async () => {
        await result.current.saveStateToIndexedDB();
      });

      expect(mockAddNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error",
          title: "Failed to save database",
        })
      );
    });
  });

  describe("restoreStateFromIndexedDB", () => {
    it("calls restoreDatabaseFromIndexedDB with db", async () => {
      const { result } = renderHook(() => usePersistence());

      await act(async () => {
        await result.current.restoreStateFromIndexedDB();
      });

      expect(mockRestoreDatabaseFromIndexedDB).toHaveBeenCalledWith(mockDb);
    });

    it("returns true and refreshes tables when tables were restored", async () => {
      mockRestoreDatabaseFromIndexedDB.mockResolvedValue({
        restoredCount: 2,
        tableNames: ["users", "orders"],
      });

      const { result } = renderHook(() => usePersistence());

      let restored: boolean;
      await act(async () => {
        restored = await result.current.restoreStateFromIndexedDB();
      });

      expect(restored!).toBe(true);
      expect(mockRefreshTables).toHaveBeenCalled();
      expect(mockAddNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "info",
          title: expect.stringContaining("2"),
        })
      );
    });

    it("returns false when no tables were restored", async () => {
      const { result } = renderHook(() => usePersistence());

      let restored: boolean;
      await act(async () => {
        restored = await result.current.restoreStateFromIndexedDB();
      });

      expect(restored!).toBe(false);
      expect(mockRefreshTables).not.toHaveBeenCalled();
    });

    it("returns false when db is null", async () => {
      mockDb = null;
      const { result } = renderHook(() => usePersistence());

      let restored: boolean;
      await act(async () => {
        restored = await result.current.restoreStateFromIndexedDB();
      });

      expect(restored!).toBe(false);
    });

    it("returns false on error", async () => {
      mockRestoreDatabaseFromIndexedDB.mockRejectedValue(
        new Error("restore error")
      );

      const { result } = renderHook(() => usePersistence());

      let restored: boolean;
      await act(async () => {
        restored = await result.current.restoreStateFromIndexedDB();
      });

      expect(restored!).toBe(false);
    });
  });

  describe("clearSavedState", () => {
    it("calls clearAllDatabaseState", async () => {
      const { result } = renderHook(() => usePersistence());

      await act(async () => {
        await result.current.clearSavedState();
      });

      expect(mockClearAllDatabaseState).toHaveBeenCalled();
    });

    it("handles errors silently", async () => {
      mockClearAllDatabaseState.mockRejectedValue(new Error("clear error"));

      const { result } = renderHook(() => usePersistence());

      // Should not throw
      await act(async () => {
        await result.current.clearSavedState();
      });

      expect(mockClearAllDatabaseState).toHaveBeenCalled();
    });
  });

  describe("dropTable", () => {
    it("drops the table from DuckDB and IndexedDB", async () => {
      const { result } = renderHook(() => usePersistence());

      await act(async () => {
        await result.current.dropTable("users");
      });

      expect(mockDb!._mockConnection.query).toHaveBeenCalledWith(
        'DROP TABLE IF EXISTS "users"'
      );
      expect(mockRemoveTableFromIndexedDB).toHaveBeenCalledWith("users");
      expect(mockRefreshTables).toHaveBeenCalled();
    });

    it("shows success notification after dropping", async () => {
      const { result } = renderHook(() => usePersistence());

      await act(async () => {
        await result.current.dropTable("users");
      });

      expect(mockAddNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "success",
          title: expect.stringContaining("users"),
        })
      );
    });

    it("does nothing when db is null", async () => {
      mockDb = null;
      const { result } = renderHook(() => usePersistence());

      await act(async () => {
        await result.current.dropTable("users");
      });

      expect(mockRemoveTableFromIndexedDB).not.toHaveBeenCalled();
    });

    it("shows error notification on failure", async () => {
      mockDb!._mockConnection.query.mockRejectedValueOnce(
        new Error("drop failed")
      );

      const { result } = renderHook(() => usePersistence());

      await act(async () => {
        await result.current.dropTable("users");
      });

      expect(mockAddNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error",
          title: expect.stringContaining("users"),
        })
      );
    });
  });

  describe("dropAllTables", () => {
    it("drops all tables and clears IndexedDB state", async () => {
      const { result } = renderHook(() => usePersistence());

      await act(async () => {
        await result.current.dropAllTables();
      });

      expect(mockDb!._mockConnection.query).toHaveBeenCalledWith(
        'DROP TABLE IF EXISTS "users"'
      );
      expect(mockDb!._mockConnection.query).toHaveBeenCalledWith(
        'DROP TABLE IF EXISTS "orders"'
      );
      expect(mockClearAllDatabaseState).toHaveBeenCalled();
      expect(mockRefreshTables).toHaveBeenCalled();
    });

    it("shows success notification after dropping all", async () => {
      const { result } = renderHook(() => usePersistence());

      await act(async () => {
        await result.current.dropAllTables();
      });

      expect(mockAddNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "success",
          title: "All tables dropped",
        })
      );
    });

    it("does nothing when db is null", async () => {
      mockDb = null;
      const { result } = renderHook(() => usePersistence());

      await act(async () => {
        await result.current.dropAllTables();
      });

      expect(mockClearAllDatabaseState).not.toHaveBeenCalled();
    });

    it("shows error notification on failure", async () => {
      mockDb!._mockConnection.query.mockRejectedValueOnce(
        new Error("drop failed")
      );

      const { result } = renderHook(() => usePersistence());

      await act(async () => {
        await result.current.dropAllTables();
      });

      expect(mockAddNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error",
          title: "Failed to drop all tables",
        })
      );
    });
  });

  describe("exportDatabase", () => {
    it("shows error when db is null", async () => {
      mockDb = null;
      const { result } = renderHook(() => usePersistence());

      await act(async () => {
        await result.current.exportDatabase();
      });

      expect(mockAddNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error",
          title: "Database not initialized",
        })
      );
    });

    it("shows info notification while exporting", async () => {
      // Set up mock to return schema and count results
      const schemaResult = createMockArrowResult(
        [
          { column_name: "id", column_type: "INTEGER" },
          { column_name: "name", column_type: "VARCHAR" },
        ],
        ["column_name", "column_type"]
      );
      const countResult = createMockArrowResult(
        [{ count: 10 }],
        ["count"]
      );
      const dataResult = createMockArrowResult(
        [{ id: 1, name: "Alice" }],
        ["id", "name"]
      );

      mockDb!._mockConnection.query
        .mockResolvedValueOnce(schemaResult)  // DESCRIBE users
        .mockResolvedValueOnce(countResult)   // COUNT users
        .mockResolvedValueOnce(dataResult)    // SELECT * FROM users
        .mockResolvedValueOnce(schemaResult)  // DESCRIBE orders
        .mockResolvedValueOnce(countResult)   // COUNT orders
        .mockResolvedValueOnce(dataResult);   // SELECT * FROM orders

      const { result } = renderHook(() => usePersistence());

      await act(async () => {
        await result.current.exportDatabase();
      });

      // Should show "Exporting database..." info notification
      expect(mockAddNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "info",
          title: "Exporting database...",
        })
      );
    });

    it("shows per-table error notifications on export failures", async () => {
      mockDb!._mockConnection.query.mockRejectedValue(
        new Error("query failed")
      );

      const { result } = renderHook(() => usePersistence());

      await act(async () => {
        await result.current.exportDatabase();
      });

      // Per-table errors are shown individually
      expect(mockAddNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error",
          title: expect.stringContaining("users"),
        })
      );
      expect(mockAddNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error",
          title: expect.stringContaining("orders"),
        })
      );
    });
  });

  describe("importDatabase", () => {
    it("shows error when db is null", async () => {
      mockDb = null;
      const { result } = renderHook(() => usePersistence());
      const file = new File(["zip content"], "export.zip");

      await act(async () => {
        await result.current.importDatabase(file);
      });

      expect(mockAddNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error",
          title: "Database not initialized",
        })
      );
    });
  });
});
