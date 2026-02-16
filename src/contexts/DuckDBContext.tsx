import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AsyncDuckDB } from '@duckdb/duckdb-wasm';
import { getDuckDB, initializeDuckDb } from 'duckdb-wasm-kit';

import {
  restoreDatabaseFromIndexedDB,
  saveAllTablesToIndexedDB,
} from '../utils/databasePersistence';

// Define the shape of our context data
interface DuckDBContextType {
  db: AsyncDuckDB | null;           // The DuckDB instance (null while loading)
  loading: boolean;                 // Is the database still initializing?
  error: Error | null;              // Did initialization fail?
  tables: string[];                 // List of table names in the database
  refreshTables: () => Promise<void>; // Function to update the table list
  saveDatabase: () => Promise<{ saved: string[]; errors: Array<{ table: string; error: string }>; warnings: string[] } | null>; // Persist all tables to IndexedDB
  restoredMessage: string | null; // Set after auto-restore, consumed by notification display
}

// Create the context (initially undefined)
const DuckDBContext = createContext<DuckDBContextType | undefined>(undefined);

/**
 * DuckDBProvider Component
 *
 * Wraps your app and provides DuckDB access to all child components.
 * This initializes DuckDB when the app loads and manages its lifecycle.
 */
export function DuckDBProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<AsyncDuckDB | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tables, setTables] = useState<string[]>([]);
  const [restoredMessage, setRestoredMessage] = useState<string | null>(null);

  // Initialize DuckDB when component mounts
  useEffect(() => {
    async function init() {
      try {
        // Step 1: Initialize DuckDB-WASM (downloads and loads the WASM bundle)
        await initializeDuckDb();

        // Step 2: Get the database instance
        const dbInstance = await getDuckDB();
        setDb(dbInstance);

        // Step 3: Restore persisted tables from IndexedDB (before refreshing sidebar)
        try {
          const { restoredCount, tableNames: restoredNames } =
            await restoreDatabaseFromIndexedDB(dbInstance);
          if (restoredCount > 0) {
            console.log(`Restored ${restoredCount} table(s) from IndexedDB:`, restoredNames);
            setRestoredMessage(
              `Restored ${restoredCount} ${restoredCount === 1 ? "table" : "tables"} from previous session`
            );
          }
        } catch (restoreErr) {
          console.error("Failed to restore database from IndexedDB:", restoreErr);
        }

        // Step 4: Load the table list (includes any restored tables)
        await refreshTables(dbInstance);
      } catch (err) {
        console.error('Failed to initialize DuckDB:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init effect intentionally runs once on mount; refreshTables is called with explicit dbInstance param
  }, []);

  /**
   * refreshTables Function
   *
   * Queries the database for all tables in the 'main' schema
   * and updates the tables state.
   */
  async function refreshTables(dbInstance?: AsyncDuckDB) {
    const dbToUse = dbInstance || db;
    if (!dbToUse) return;

    try {
      // Create a connection to run queries
      const conn = await dbToUse.connect();

      // Query the information_schema to get all table names
      const result = await conn.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'main'
      `);

      // Convert Arrow result to array of table names
      const tableNames = result.toArray().map(row => row.table_name as string);
      setTables(tableNames);

      // Close the connection (important for cleanup)
      await conn.close();
    } catch (err) {
      console.error('Failed to refresh tables:', err);
    }
  }

  /**
   * saveDatabase Function
   *
   * Persists all current tables to IndexedDB as Parquet buffers.
   * Called explicitly by the user via the "Save Database" button.
   */
  const saveDatabase = useCallback(async () => {
    if (!db) return null;
    return saveAllTablesToIndexedDB(db, tables);
  }, [db, tables]);

  // Provide the context value to all children
  return (
    <DuckDBContext.Provider value={{ db, loading, error, tables, refreshTables, saveDatabase, restoredMessage }}>
      {children}
    </DuckDBContext.Provider>
  );
}

/**
 * useDuckDBContext Hook
 *
 * Custom hook to access the DuckDB context from any component.
 * Throws an error if used outside of DuckDBProvider.
 *
 * Usage:
 *   const { db, loading, tables, refreshTables } = useDuckDBContext();
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useDuckDBContext() {
  const context = useContext(DuckDBContext);
  if (!context) {
    throw new Error('useDuckDBContext must be used within DuckDBProvider');
  }
  return context;
}
