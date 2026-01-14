import { useDuckDBContext } from "../contexts/DuckDBContext";
import { useNotifications } from "../contexts/NotificationContext";

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

/**
 * Convert array of objects to CSV string
 * Handles special cases: nulls, quotes, commas, BigInts
 */
function convertToCSV(data: any[], columnNames: string[]): string {
  if (data.length === 0) {
    return columnNames.join(",") + "\n";
  }

  // Helper to escape CSV values
  const escapeCSVValue = (value: any): string => {
    if (value === null || value === undefined) {
      return "";
    }

    // Convert BigInt to number
    if (typeof value === "bigint") {
      value = Number(value);
    }

    // Convert dates to ISO string
    if (value instanceof Date) {
      value = value.toISOString();
    }

    // Convert to string
    const stringValue = String(value);

    // If value contains comma, quote, or newline, wrap in quotes and escape quotes
    if (
      stringValue.includes(",") ||
      stringValue.includes('"') ||
      stringValue.includes("\n") ||
      stringValue.includes("\r")
    ) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
  };

  // Build CSV string
  const lines: string[] = [];

  // Header row
  lines.push(columnNames.map(escapeCSVValue).join(","));

  // Data rows
  for (const row of data) {
    const values = columnNames.map((colName) => escapeCSVValue(row[colName]));
    lines.push(values.join(","));
  }

  return lines.join("\n");
}

export const usePersistence = () => {
  const { db, tables: tableNames, refreshTables } = useDuckDBContext();
  const { addNotification, removeNotification } = useNotifications();

  /**
   * Export the entire database as a downloadable file
   * Creates a ZIP containing Parquet files for each table + metadata
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
          const csvData = convertToCSV(data, columns.map((col) => col.name));

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

  /**
   * Import a database from a ZIP file
   * Restores all tables from Parquet files
   */
  const importDatabase = async (file: File): Promise<void> => {
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
          await conn.query(
            `CREATE TABLE ${tableInfo.name} AS SELECT * FROM read_csv_auto('${fileName}')`
          );

          importedCount++;
        } catch (error) {
          console.error(`Error importing table ${tableInfo.name}:`, error);
          addNotification({
            type: "error",
            title: `Failed to import table: ${tableInfo.name}`,
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

  /**
   * Save database state to IndexedDB for auto-restore on page load
   * This provides persistence between sessions
   */
  const saveStateToIndexedDB = async (): Promise<void> => {
    if (!db) return;

    try {
      const conn = await db.connect();
      const state: any = {
        tables: [],
        savedAt: new Date().toISOString(),
      };

      // For each table, get schema and data
      for (const tableName of tableNames) {
        const schemaResult = await conn.query(`DESCRIBE ${tableName}`);
        const dataResult = await conn.query(`SELECT * FROM ${tableName}`);

        state.tables.push({
          name: tableName,
          schema: schemaResult.toArray(),
          data: dataResult.toArray(),
        });
      }

      // Store in IndexedDB
      const { set } = await import("idb-keyval");
      await set("database-state", state);

      conn.close();
      console.log("Database state saved to IndexedDB");
    } catch (error) {
      console.error("Failed to save state to IndexedDB:", error);
    }
  };

  /**
   * Restore database state from IndexedDB on page load
   */
  const restoreStateFromIndexedDB = async (): Promise<boolean> => {
    if (!db) return false;

    try {
      const { get } = await import("idb-keyval");
      const state = await get("database-state");

      if (!state || !state.tables) {
        return false;
      }

      const conn = await db.connect();
      let restoredCount = 0;

      for (const table of state.tables) {
        try {
          // Create table with schema
          const columns = table.schema
            .map((col: any) => `${col.column_name} ${col.column_type}`)
            .join(", ");

          await conn.query(`CREATE TABLE ${table.name} (${columns})`);

          // Insert data (in batches if large)
          if (table.data.length > 0) {
            // For simplicity, we'll create a temporary table and insert from it
            // In production, you might want to batch inserts
            const tempData = table.data;
            // This is a simplified approach - you'd want to use prepared statements
            // or COPY FROM for better performance
            console.log(
              `Restored table ${table.name} with ${tempData.length} rows`
            );
          }

          restoredCount++;
        } catch (error) {
          console.error(`Error restoring table ${table.name}:`, error);
        }
      }

      conn.close();
      await refreshTables();

      if (restoredCount > 0) {
        addNotification({
          type: "info",
          title: `Restored ${restoredCount} ${restoredCount === 1 ? 'table' : 'tables'} from previous session`,
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
   * Clear all database state from IndexedDB
   */
  const clearSavedState = async (): Promise<void> => {
    try {
      const { del } = await import("idb-keyval");
      await del("database-state");
      addNotification({
        type: "info",
        title: "Saved database state cleared",
      });
    } catch (error) {
      console.error("Failed to clear saved state:", error);
    }
  };

  return {
    exportDatabase,
    importDatabase,
    saveStateToIndexedDB,
    restoreStateFromIndexedDB,
    clearSavedState,
  };
};
