import { useDuckDBContext } from "../contexts/DuckDBContext";
import { useNotifications } from "../contexts/NotificationContext";
import {
  convertToCSV,
  saveAllTablesToIndexedDB,
  restoreDatabaseFromIndexedDB,
  clearAllDatabaseState,
  removeTableFromIndexedDB,
} from "../utils/databasePersistence";

interface DatabaseMetadata {
  version: string;
  exportDate: string;
  tables: {
    name: string;
    rowCount: number;
    columns: Array<{
      name: string;
      type: string;
    }>;
  }[];
}

export const usePersistence = () => {
  const { db, tables: tableNames, refreshTables } = useDuckDBContext();
  const { addNotification, removeNotification } = useNotifications();

  // ── ZIP Export (CSV-based, for human-readable sharing) ──────────────────

  /**
   * Export the entire database as a downloadable ZIP file.
   * Each table is stored as CSV + a metadata.json manifest.
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

      const conn = await db.connect();
      const metadata: DatabaseMetadata = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        tables: [],
      };

      // Dynamic import of JSZip (will be loaded when needed)
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      // Export each table
      for (const tableName of tableNames) {
        try {
          // Get table schema
          const schemaResult = await conn.query(`DESCRIBE ${tableName}`);
          const schemaData = schemaResult.toArray();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const columns = schemaData.map((row: any) => ({
            name: row.column_name,
            type: row.column_type,
          }));

          // Get row count
          const countResult = await conn.query(
            `SELECT COUNT(*) as count FROM ${tableName}`
          );
          const rowCountRaw = countResult.toArray()[0].count;
          // Convert BigInt to number (DuckDB returns BigInt for COUNT)
          const rowCount =
            typeof rowCountRaw === "bigint" ? Number(rowCountRaw) : rowCountRaw;

          metadata.tables.push({
            name: tableName,
            rowCount,
            columns,
          });

          // Export table data as CSV
          // Query all data from the table
          const dataResult = await conn.query(`SELECT * FROM ${tableName}`);

          // Convert to array of objects
          const data = dataResult.toArray();

          // Convert to CSV format
          const csvData = convertToCSV(data, columns.map((col: { name: string }) => col.name));

          // Add to ZIP with .csv extension
          const fileName = `${tableName}.csv`;
          zip.file(fileName, csvData);
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

      conn.close();
      addNotification({
        type: "success",
        title: `Database exported (${tableNames.length} ${tableNames.length === 1 ? 'table' : 'tables'})`,
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

  // ── ZIP Import (CSV-based) ──────────────────────────────────────────────

  /**
   * Import a database from a ZIP file.
   * Restores all tables from CSV files + metadata.
   * @param replaceExisting If true, uses CREATE OR REPLACE to overwrite existing tables.
   *                        If false (default), skips tables that already exist.
   */
  const importDatabase = async (file: File, replaceExisting = false): Promise<void> => {
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
      const metadata: DatabaseMetadata = JSON.parse(metadataText);

      const conn = await db.connect();
      let importedCount = 0;

      // Import each table
      for (const tableInfo of metadata.tables) {
        try {
          const fileName = `${tableInfo.name}.csv`;
          const csvFile = zip.file(fileName);

          if (!csvFile) {
            console.warn(`Table file not found: ${fileName}`);
            continue;
          }

          // Get CSV file as text
          const csvText = await csvFile.async("text");

          // Register the CSV buffer with DuckDB
          const csvBuffer = new TextEncoder().encode(csvText);
          await db.registerFileBuffer(fileName, csvBuffer);

          // Create table from CSV data using read_csv_auto
          const createStatement = replaceExisting
            ? `CREATE OR REPLACE TABLE ${tableInfo.name} AS SELECT * FROM read_csv_auto('${fileName}')`
            : `CREATE TABLE ${tableInfo.name} AS SELECT * FROM read_csv_auto('${fileName}')`;
          await conn.query(createStatement);

          importedCount++;
        } catch (error) {
          console.error(`Error importing table ${tableInfo.name}:`, error);
          addNotification({
            type: "error",
            title: replaceExisting
              ? `Failed to import table: ${tableInfo.name}`
              : `Skipped table "${tableInfo.name}": already exists`,
          });
        }
      }

      conn.close();
      await refreshTables();
      addNotification({
        type: "success",
        title: `Database imported (${importedCount}/${metadata.tables.length} ${metadata.tables.length === 1 ? 'table' : 'tables'})`,
      });
    } catch (error) {
      console.error("Database import error:", error);
      addNotification({
        type: "error",
        title: "Failed to import database",
      });
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
          title: `Database saved (${result.saved.length} ${result.saved.length === 1 ? "table" : "tables"})`,
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
          title: `Restored ${restoredCount} ${restoredCount === 1 ? "table" : "tables"} from previous session`,
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
      const conn = await db.connect();
      try {
        await conn.query(`DROP TABLE IF EXISTS "${tableName}"`);
      } finally {
        await conn.close();
      }

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
      const conn = await db.connect();
      try {
        for (const tableName of tableNames) {
          await conn.query(`DROP TABLE IF EXISTS "${tableName}"`);
        }
      } finally {
        await conn.close();
      }

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
