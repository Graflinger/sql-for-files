import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { AsyncDuckDB } from "@duckdb/duckdb-wasm";

import { usePersistence } from "./usePersistence";
import { createMockDuckDB, createMockArrowResult } from "../test/mocks/duckdb";

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

const mockAddNotification = vi.fn().mockReturnValue("notification-id-1");
const mockRemoveNotification = vi.fn();

vi.mock("../contexts/NotificationContext", () => ({
  useNotifications: () => ({
    addNotification: mockAddNotification,
    removeNotification: mockRemoveNotification,
  }),
}));

const mockSaveAllTablesToIndexedDB = vi.fn();
const mockSaveTableToIndexedDB = vi.fn();
const mockRestoreDatabaseFromIndexedDB = vi.fn();
const mockClearAllDatabaseState = vi.fn();
const mockRemoveTableFromIndexedDB = vi.fn();
const mockExportTableToParquetBuffer = vi.fn();

vi.mock("../utils/databasePersistence", () => ({
  saveTableToIndexedDB: (...args: unknown[]) =>
    mockSaveTableToIndexedDB(...args),
  saveAllTablesToIndexedDB: (...args: unknown[]) =>
    mockSaveAllTablesToIndexedDB(...args),
  restoreDatabaseFromIndexedDB: (...args: unknown[]) =>
    mockRestoreDatabaseFromIndexedDB(...args),
  clearAllDatabaseState: (...args: unknown[]) =>
    mockClearAllDatabaseState(...args),
  removeTableFromIndexedDB: (...args: unknown[]) =>
    mockRemoveTableFromIndexedDB(...args),
  exportTableToParquetBuffer: (...args: unknown[]) =>
    mockExportTableToParquetBuffer(...args),
}));

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

async function getJsZipMock() {
  const JSZip = (await import("jszip")).default as unknown as {
    _mockFile: ReturnType<typeof vi.fn>;
    _mockGenerateAsync: ReturnType<typeof vi.fn>;
    _mockLoadAsync: ReturnType<typeof vi.fn>;
  };

  return JSZip;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockDb = createMockDuckDB();
  mockTableNames = ["users", "orders"];
  mockSaveAllTablesToIndexedDB.mockResolvedValue({
    saved: ["users", "orders"],
    errors: [],
    warnings: [],
  });
  mockSaveTableToIndexedDB.mockResolvedValue({ warning: null });
  mockRestoreDatabaseFromIndexedDB.mockResolvedValue({
    restoredCount: 0,
    tableNames: [],
  });
  mockClearAllDatabaseState.mockResolvedValue(undefined);
  mockRemoveTableFromIndexedDB.mockResolvedValue(undefined);
  mockExportTableToParquetBuffer.mockResolvedValue(new Uint8Array([1, 2, 3]));
});

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

      let restored = false;
      await act(async () => {
        restored = await result.current.restoreStateFromIndexedDB();
      });

      expect(restored).toBe(true);
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

      let restored = true;
      await act(async () => {
        restored = await result.current.restoreStateFromIndexedDB();
      });

      expect(restored).toBe(false);
      expect(mockRefreshTables).not.toHaveBeenCalled();
    });

    it("returns false when db is null", async () => {
      mockDb = null;
      const { result } = renderHook(() => usePersistence());

      let restored = true;
      await act(async () => {
        restored = await result.current.restoreStateFromIndexedDB();
      });

      expect(restored).toBe(false);
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
      expect(mockDb!._mockConnection.close).toHaveBeenCalled();
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
      expect(mockDb!._mockConnection.close).toHaveBeenCalled();
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

    it("exports parquet files with versioned metadata", async () => {
      const schemaResult = createMockArrowResult(
        [
          { column_name: "id", column_type: "INTEGER" },
          { column_name: "name", column_type: "VARCHAR" },
        ],
        ["column_name", "column_type"]
      );
      const countResult = createMockArrowResult([{ count: 10 }], ["count"]);
      mockDb!._mockConnection.query
        .mockResolvedValueOnce(schemaResult)
        .mockResolvedValueOnce(countResult)
        .mockResolvedValueOnce(schemaResult)
        .mockResolvedValueOnce(countResult);

      const jsZip = await getJsZipMock();
      const { result } = renderHook(() => usePersistence());

      await act(async () => {
        await result.current.exportDatabase();
      });

      expect(mockExportTableToParquetBuffer).toHaveBeenNthCalledWith(
        1,
        mockDb,
        "users",
        "table-0001.parquet"
      );
      expect(mockExportTableToParquetBuffer).toHaveBeenNthCalledWith(
        2,
        mockDb,
        "orders",
        "table-0002.parquet"
      );

      const metadataCall = jsZip._mockFile.mock.calls.find(
        ([name]) => name === "metadata.json"
      );
      expect(metadataCall).toBeDefined();
      expect(JSON.parse(metadataCall![1] as string)).toEqual(
        expect.objectContaining({
          format: "sql-for-files-parquet",
          version: "2.0",
          tables: [
            expect.objectContaining({
              name: "users",
              fileName: "table-0001.parquet",
            }),
            expect.objectContaining({
              name: "orders",
              fileName: "table-0002.parquet",
            }),
          ],
        })
      );
    });

    it("shows per-table error notifications on export failures", async () => {
      mockDb!._mockConnection.query.mockRejectedValue(new Error("query failed"));

      const { result } = renderHook(() => usePersistence());

      await act(async () => {
        await result.current.exportDatabase();
      });

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
      expect(mockDb!._mockConnection.close).toHaveBeenCalled();
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

    it("rejects legacy CSV zip bundles with a deterministic error", async () => {
      const jsZip = await getJsZipMock();
      jsZip._mockLoadAsync.mockResolvedValue({
        file: vi.fn((name: string) => {
          if (name === "metadata.json") {
            return {
              async: vi.fn().mockResolvedValue(
                JSON.stringify({
                  version: "1.0",
                  exportDate: "2026-03-09T00:00:00.000Z",
                  tables: [],
                })
              ),
            };
          }

          return null;
        }),
      });

      const { result } = renderHook(() => usePersistence());

      await act(async () => {
        await result.current.importDatabase(new File(["zip"], "legacy.zip"));
      });

      expect(mockAddNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error",
          title: "Unsupported database export format",
        })
      );
    });

    it("imports parquet tables with quoted identifiers", async () => {
      const jsZip = await getJsZipMock();
      const zipFile = vi.fn((name: string) => {
        if (name === "metadata.json") {
          return {
            async: vi.fn().mockResolvedValue(
              JSON.stringify({
                format: "sql-for-files-parquet",
                version: "2.0",
                exportDate: "2026-03-09T00:00:00.000Z",
                tables: [
                  {
                    name: 'Sales Orders',
                    fileName: "table-0001.parquet",
                    rowCount: 1,
                    columns: [],
                  },
                ],
              })
            ),
          };
        }

        if (name === "table-0001.parquet") {
          return {
            async: vi.fn().mockResolvedValue(new Uint8Array([9, 9, 9])),
          };
        }

        return null;
      });

      jsZip._mockLoadAsync.mockResolvedValue({ file: zipFile });

      const { result } = renderHook(() => usePersistence());

      await act(async () => {
        await result.current.importDatabase(new File(["zip"], "backup.zip"), true);
      });

      expect(mockDb!.registerFileBuffer).toHaveBeenCalledWith(
        "table-0001.parquet",
        expect.any(Uint8Array)
      );
      expect(mockDb!._mockConnection.query).toHaveBeenCalledWith(
        'CREATE OR REPLACE TABLE "Sales Orders" AS SELECT * FROM read_parquet(\'table-0001.parquet\')'
      );
      expect(mockSaveTableToIndexedDB).toHaveBeenCalledWith(
        mockDb,
        "Sales Orders"
      );
      expect(mockRefreshTables).toHaveBeenCalled();
      expect(mockDb!._mockConnection.close).toHaveBeenCalled();
    });

    it("shows persistence warnings after a successful import", async () => {
      mockSaveTableToIndexedDB.mockResolvedValue({
        warning: 'Table "Sales Orders" has 1,500,000 rows - saving may use significant memory.',
      });

      const jsZip = await getJsZipMock();
      jsZip._mockLoadAsync.mockResolvedValue({
        file: vi.fn((name: string) => {
          if (name === "metadata.json") {
            return {
              async: vi.fn().mockResolvedValue(
                JSON.stringify({
                  format: "sql-for-files-parquet",
                  version: "2.0",
                  exportDate: "2026-03-09T00:00:00.000Z",
                  tables: [
                    {
                      name: "Sales Orders",
                      fileName: "table-0001.parquet",
                      rowCount: 1,
                      columns: [],
                    },
                  ],
                })
              ),
            };
          }

          if (name === "table-0001.parquet") {
            return {
              async: vi.fn().mockResolvedValue(new Uint8Array([9, 9, 9])),
            };
          }

          return null;
        }),
      });

      const { result } = renderHook(() => usePersistence());

      await act(async () => {
        await result.current.importDatabase(new File(["zip"], "backup.zip"), true);
      });

      expect(mockAddNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "info",
          title: 'Table "Sales Orders" has 1,500,000 rows - saving may use significant memory.',
        })
      );
    });

    it("shows a follow-up error when imported tables fail to persist", async () => {
      mockSaveTableToIndexedDB.mockRejectedValue(new Error("Quota exceeded"));

      const jsZip = await getJsZipMock();
      jsZip._mockLoadAsync.mockResolvedValue({
        file: vi.fn((name: string) => {
          if (name === "metadata.json") {
            return {
              async: vi.fn().mockResolvedValue(
                JSON.stringify({
                  format: "sql-for-files-parquet",
                  version: "2.0",
                  exportDate: "2026-03-09T00:00:00.000Z",
                  tables: [
                    {
                      name: "Sales Orders",
                      fileName: "table-0001.parquet",
                      rowCount: 1,
                      columns: [],
                    },
                  ],
                })
              ),
            };
          }

          if (name === "table-0001.parquet") {
            return {
              async: vi.fn().mockResolvedValue(new Uint8Array([9, 9, 9])),
            };
          }

          return null;
        }),
      });

      const { result } = renderHook(() => usePersistence());

      await act(async () => {
        await result.current.importDatabase(new File(["zip"], "backup.zip"), true);
      });

      expect(mockAddNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "success",
          title: "Database imported (1/1 table)",
        })
      );
      expect(mockAddNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error",
          title: "Imported database, but failed to save some tables",
          message: expect.stringContaining("Sales Orders"),
        })
      );
    });

    it("does not persist skipped tables when create fails without replace", async () => {
      mockDb!._mockConnection.query.mockRejectedValue(new Error("Table already exists"));

      const jsZip = await getJsZipMock();
      jsZip._mockLoadAsync.mockResolvedValue({
        file: vi.fn((name: string) => {
          if (name === "metadata.json") {
            return {
              async: vi.fn().mockResolvedValue(
                JSON.stringify({
                  format: "sql-for-files-parquet",
                  version: "2.0",
                  exportDate: "2026-03-09T00:00:00.000Z",
                  tables: [
                    {
                      name: "Sales Orders",
                      fileName: "table-0001.parquet",
                      rowCount: 1,
                      columns: [],
                    },
                  ],
                })
              ),
            };
          }

          if (name === "table-0001.parquet") {
            return {
              async: vi.fn().mockResolvedValue(new Uint8Array([9, 9, 9])),
            };
          }

          return null;
        }),
      });

      const { result } = renderHook(() => usePersistence());

      await act(async () => {
        await result.current.importDatabase(new File(["zip"], "backup.zip"), false);
      });

      expect(mockSaveTableToIndexedDB).not.toHaveBeenCalled();
      expect(mockAddNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "success",
          title: "Database imported (0/1 table)",
        })
      );
    });
  });
});
