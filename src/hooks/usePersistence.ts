import { useDuckDBContext } from "../contexts/DuckDBContext";
import { useNotifications } from "../contexts/NotificationContext";
import {
  exportTableToParquetBuffer,
  saveTableToIndexedDB,
  saveAllTablesToIndexedDB,
  restoreDatabaseFromIndexedDB,
  clearAllDatabaseState,
  removeTableFromIndexedDB,
} from "../utils/databasePersistence";
import { withDuckDBConnection } from "../utils/duckdb";
import { quoteIdentifier, quoteStringLiteral } from "../utils/sql";

interface DatabaseMetadata {
  format: string;
  version: string;
  exportDate: string;
  tables: {
    name: string;
    fileName: string;
    rowCount: number;
    columns: Array<{
      name: string;
      type: string;
    }>;
  }[];
}

const DATABASE_EXPORT_FORMAT = "sql-for-files-parquet";
const DATABASE_EXPORT_VERSION = "2.0";

function createExportFileName(index: number): string {
  return `table-${String(index + 1).padStart(4, "0")}.parquet`;
}

function isDatabaseMetadata(value: unknown): value is DatabaseMetadata {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<DatabaseMetadata>;
  return (
    candidate.format === DATABASE_EXPORT_FORMAT &&
    candidate.version === DATABASE_EXPORT_VERSION &&
    typeof candidate.exportDate === "string" &&
    Array.isArray(candidate.tables) &&
    candidate.tables.every(
      (table) =>
        table &&
        typeof table === "object" &&
        typeof table.name === "string" &&
        typeof table.fileName === "string" &&
        typeof table.rowCount === "number" &&
        Array.isArray(table.columns)
    )
  );
}

function getImportErrorNotification(error: unknown): {
  type: "error";
  title: string;
  message?: string;
} {
  if (
    error instanceof Error &&
    error.message === "UNSUPPORTED_DATABASE_EXPORT_FORMAT"
  ) {
    return {
      type: "error",
      title: "Unsupported database export format",
      message:
        "Import a Parquet backup created by the current version of SQL for Files.",
    };
  }

  return {
    type: "error",
    title: "Failed to import database",
  };
}

export const usePersistence = () => {
  const { db, tables: tableNames, refreshTables } = useDuckDBContext();
  const { addNotification, removeNotification } = useNotifications();

  // ── ZIP Export (Parquet-based, lossless round-tripping) ─────────────────

  /**
   * Export the entire database as a downloadable ZIP file.
   * Each table is stored as Parquet + a metadata.json manifest.
   */
  const exportDatabase = async (): Promise<void> => {
    if (!db) {
      addNotification({
        type: "error",
        title: "Database not initialized",
      });
      return;
    }

    let exportingNotificationId: string | undefined;
    try {
      exportingNotificationId = addNotification({
        type: "info",
        title: "Exporting database...",
      });

      const metadata: DatabaseMetadata = {
        format: DATABASE_EXPORT_FORMAT,
        version: DATABASE_EXPORT_VERSION,
        exportDate: new Date().toISOString(),
        tables: [],
      };

      // Dynamic import of JSZip (will be loaded when needed)
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      // Export each table
      for (const [index, tableName] of tableNames.entries()) {
        try {
          const schemaResult = await withDuckDBConnection(db, async (conn) =>
            conn.query(`DESCRIBE ${quoteIdentifier(tableName)}`)
          );
          const schemaData = schemaResult.toArray();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const columns = schemaData.map((row: any) => ({
            name: row.column_name,
            type: row.column_type,
          }));

          const countResult = await withDuckDBConnection(db, async (conn) =>
            conn.query(
              `SELECT COUNT(*) as count FROM ${quoteIdentifier(tableName)}`
            )
          );
          const rowCountRaw = countResult.toArray()[0].count;
          // Convert BigInt to number (DuckDB returns BigInt for COUNT)
          const rowCount =
            typeof rowCountRaw === "bigint" ? Number(rowCountRaw) : rowCountRaw;
          const fileName = createExportFileName(index);

          metadata.tables.push({
            name: tableName,
            fileName,
            rowCount,
            columns,
          });

          const parquetBuffer = await exportTableToParquetBuffer(
            db,
            tableName,
            fileName
          );
          zip.file(fileName, parquetBuffer);
        } catch (error) {
          console.error(`Error exporting table ${tableName}:`, error);
          addNotification({
            type: "error",
            title: `Failed to export table: ${tableName}`,
          });
        }
      }

      // Add metadata with BigInt handling
      zip.file(
        "metadata.json",
        JSON.stringify(
          metadata,
          (_key, value) => (typeof value === "bigint" ? Number(value) : value),
          2
        )
      );

      // Generate ZIP and download
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `database-export-${
        new Date().toISOString().split("T")[0]
      }.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addNotification({
        type: "success",
        title: `Database exported (${tableNames.length} ${
          tableNames.length === 1 ? "table" : "tables"
        })`,
      });
    } catch (error) {
      console.error("Database export error:", error);
      addNotification({
        type: "error",
        title: "Failed to export database",
      });
    } finally {
      if (exportingNotificationId) {
        removeNotification(exportingNotificationId);
      }
    }
  };

  // ── ZIP Import (Parquet-based) ───────────────────────────────────────────

  /**
   * Import a database from a ZIP file.
   * Restores all tables from Parquet files + metadata.
   * @param replaceExisting If true, uses CREATE OR REPLACE to overwrite existing tables.
   *                        If false (default), skips tables that already exist.
   */
  const importDatabase = async (
    file: File,
    replaceExisting = false
  ): Promise<void> => {
    if (!db) {
      addNotification({
        type: "error",
        title: "Database not initialized",
      });
      return;
    }

    let importingNotificationId: string | undefined;
    try {
      importingNotificationId = addNotification({
        type: "info",
        title: "Importing database...",
      });

      // Dynamic import of JSZip
      const JSZip = (await import("jszip")).default;
      const zip = await JSZip.loadAsync(file);

      // Read metadata
      const metadataFile = zip.file("metadata.json");
      if (!metadataFile) {
        throw new Error("Invalid database export: metadata.json not found");
      }

      const metadataText = await metadataFile.async("text");
      const parsedMetadata = JSON.parse(metadataText) as unknown;
      if (!isDatabaseMetadata(parsedMetadata)) {
        throw new Error("UNSUPPORTED_DATABASE_EXPORT_FORMAT");
      }

      const metadata = parsedMetadata;
      let importedCount = 0;
      const importedTableNames: string[] = [];

      // Import each table
      for (const tableInfo of metadata.tables) {
        try {
          const fileName = tableInfo.fileName;
          const parquetFile = zip.file(fileName);

          if (!parquetFile) {
            console.warn(`Table file not found: ${fileName}`);
            continue;
          }

          const parquetBuffer = await parquetFile.async("uint8array");
          await db.registerFileBuffer(fileName, parquetBuffer);

          const createStatement = replaceExisting
            ? `CREATE OR REPLACE TABLE ${quoteIdentifier(
                tableInfo.name
              )} AS SELECT * FROM read_parquet(${quoteStringLiteral(fileName)})`
            : `CREATE TABLE ${quoteIdentifier(
                tableInfo.name
              )} AS SELECT * FROM read_parquet(${quoteStringLiteral(
                fileName
              )})`;
          await withDuckDBConnection(db, async (conn) => {
            await conn.query(createStatement);
          });

          importedCount++;
          importedTableNames.push(tableInfo.name);
        } catch (error) {
          console.error(`Error importing table ${tableInfo.name}:`, error);
          addNotification({
            type: "error",
            title: replaceExisting
              ? `Failed to import table: ${tableInfo.name}`
              : `Skipped table "${tableInfo.name}": already exists`,
          });
        } finally {
          try {
            await db.dropFile(tableInfo.fileName);
          } catch {
            // Ignore cleanup failures for files that were not registered.
          }
        }
      }

      const persistenceWarnings: string[] = [];
      const persistenceErrors: string[] = [];

      for (const tableName of importedTableNames) {
        try {
          const { warning } = await saveTableToIndexedDB(db, tableName);
          if (warning) {
            persistenceWarnings.push(warning);
          }
        } catch (error) {
          console.error(
            `Failed to persist imported table "${tableName}":`,
            error
          );
          persistenceErrors.push(tableName);
        }
      }

      await refreshTables();
      addNotification({
        type: "success",
        title: `Database imported (${importedCount}/${metadata.tables.length} ${
          metadata.tables.length === 1 ? "table" : "tables"
        })`,
      });

      for (const warning of persistenceWarnings) {
        addNotification({
          type: "info",
          title: warning,
        });
      }

      if (persistenceErrors.length > 0) {
        addNotification({
          type: "error",
          title: "Imported database, but failed to save some tables",
          message:
            persistenceErrors.length === 1
              ? `The table "${persistenceErrors[0]}" was imported, but it will not be restored next session unless you save it again.`
              : `${persistenceErrors.length} imported tables will not be restored next session unless you save them again.`,
        });
      }
    } catch (error) {
      console.error("Database import error:", error);
      addNotification(getImportErrorNotification(error));
    } finally {
      if (importingNotificationId) {
        removeNotification(importingNotificationId);
      }
    }
  };

  // ── IndexedDB Persistence (Parquet-based) ───────────────────────────────

  /**
   * Save all tables to IndexedDB as Parquet.
   * Delegates to the databasePersistence utility.
   */
  const saveStateToIndexedDB = async (): Promise<void> => {
    if (!db) return;

    try {
      const result = await saveAllTablesToIndexedDB(db, tableNames);

      for (const warning of result.warnings) {
        addNotification({ type: "info", title: warning });
      }

      for (const err of result.errors) {
        addNotification({
          type: "error",
          title: `Failed to save table: ${err.table}`,
        });
      }

      if (result.saved.length > 0) {
        addNotification({
          type: "success",
          title: `Database saved (${result.saved.length} ${
            result.saved.length === 1 ? "table" : "tables"
          })`,
        });
      }
    } catch (error) {
      console.error("Failed to save state to IndexedDB:", error);
      addNotification({
        type: "error",
        title: "Failed to save database",
      });
    }
  };

  /**
   * Restore all tables from IndexedDB.
   * Delegates to the databasePersistence utility.
   */
  const restoreStateFromIndexedDB = async (): Promise<boolean> => {
    if (!db) return false;

    try {
      const { restoredCount } = await restoreDatabaseFromIndexedDB(db);
      if (restoredCount > 0) {
        await refreshTables();
        addNotification({
          type: "info",
          title: `Restored ${restoredCount} ${
            restoredCount === 1 ? "table" : "tables"
          } from previous session`,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to restore state from IndexedDB:", error);
      return false;
    }
  };

  /**
   * Clear all saved database state from IndexedDB.
   */
  const clearSavedState = async (): Promise<void> => {
    try {
      await clearAllDatabaseState();
    } catch (error) {
      console.error("Failed to clear saved state:", error);
    }
  };

  // ── Drop Table(s) ──────────────────────────────────────────────────────

  /**
   * Drop a single table from DuckDB and remove its Parquet from IndexedDB.
   */
  const dropTable = async (tableName: string): Promise<void> => {
    if (!db) return;

    try {
      await withDuckDBConnection(db, async (conn) => {
        await conn.query(`DROP TABLE IF EXISTS ${quoteIdentifier(tableName)}`);
      });

      await removeTableFromIndexedDB(tableName);
      await refreshTables();

      addNotification({
        type: "success",
        title: `Table "${tableName}" dropped`,
      });
    } catch (error) {
      console.error(`Failed to drop table "${tableName}":`, error);
      addNotification({
        type: "error",
        title: `Failed to drop table: ${tableName}`,
      });
    }
  };

  /**
   * Drop ALL tables from DuckDB and clear all IndexedDB persistence state.
   */
  const dropAllTables = async (): Promise<void> => {
    if (!db) return;

    try {
      await withDuckDBConnection(db, async (conn) => {
        for (const tableName of tableNames) {
          await conn.query(
            `DROP TABLE IF EXISTS ${quoteIdentifier(tableName)}`
          );
        }
      });

      await clearAllDatabaseState();
      await refreshTables();

      addNotification({
        type: "success",
        title: "All tables dropped",
      });
    } catch (error) {
      console.error("Failed to drop all tables:", error);
      addNotification({
        type: "error",
        title: "Failed to drop all tables",
      });
    }
  };

  return {
    exportDatabase,
    importDatabase,
    saveStateToIndexedDB,
    restoreStateFromIndexedDB,
    clearSavedState,
    dropTable,
    dropAllTables,
  };
};
