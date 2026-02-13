import React, { createContext, useContext, useState, useEffect } from 'react';
import * as duckdb from '@duckdb/duckdb-wasm';
import { AsyncDuckDB, ConsoleLogger } from '@duckdb/duckdb-wasm';

// Self-hosted bundles from public/ directory
// These files are copied from node_modules/@duckdb/duckdb-wasm/dist/ via postinstall
const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
  mvp: {
    mainModule: new URL('/duckdb-mvp.wasm', import.meta.url).href,
    mainWorker: new URL('/duckdb-browser-mvp.worker.js', import.meta.url).href,
  },
  eh: {
    mainModule: new URL('/duckdb-eh.wasm', import.meta.url).href,
    mainWorker: new URL('/duckdb-browser-eh.worker.js', import.meta.url).href,
  },
};

// Define the shape of our context data
interface DuckDBContextType {
  db: AsyncDuckDB | null;           // The DuckDB instance (null while loading)
  loading: boolean;                 // Is the database still initializing?
  error: Error | null;              // Did initialization fail?
  tables: string[];                 // List of table names in the database
  refreshTables: () => Promise<void>; // Function to update the table list
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

  // Initialize DuckDB when component mounts
  useEffect(() => {
    async function init() {
      try {
        // Step 1: Select the best bundle for this browser (eh > mvp)
        const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);

        // Step 2: Create a Web Worker for DuckDB
        const worker_url = URL.createObjectURL(
          new Blob([`importScripts("${bundle.mainWorker}");`], {
            type: 'text/javascript',
          }),
        );
        const worker = new Worker(worker_url);

        // Step 3: Instantiate the async DuckDB instance
        const logger = new ConsoleLogger();
        const dbInstance = new AsyncDuckDB(logger, worker);
        await dbInstance.instantiate(bundle.mainModule, bundle.pthreadWorker);

        // Clean up the blob URL
        URL.revokeObjectURL(worker_url);

        setDb(dbInstance);

        // Step 4: Load the initial table list (empty on first load)
        await refreshTables(dbInstance);
      } catch (err) {
        console.error('Failed to initialize DuckDB:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []); // Empty dependency array = run once on mount

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

  // Provide the context value to all children
  return (
    <DuckDBContext.Provider value={{ db, loading, error, tables, refreshTables }}>
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
