import { useState } from 'react';
import { AsyncDuckDB } from '@duckdb/duckdb-wasm';
import { set as idbSet } from 'idb-keyval';
import { defaultTableNameFromFile, sanitizeTableName } from '../utils/tableName';
import { withDuckDBConnection } from '../utils/duckdb';
import { quoteIdentifier, quoteStringLiteral } from '../utils/sql';

// Track progress for each file being added
interface AddProgress {
  fileName: string;
  progress: number; // 0-100
  status: 'adding' | 'processing' | 'done' | 'error';
  error?: string;
}

/**
 * useFileAdd Hook
 *
 * Provides file add functionality with progress tracking.
 * Handles CSV, JSON, and Parquet files.
 *
 * @param db - The DuckDB instance from DuckDBContext
 * @returns {addFile, adding, progress, clearProgress}
 */
interface CsvAddOptions {
  skip?: number;
  header?: boolean;
  delim?: string;
  quote?: string;
  escape?: string;
  nullStr?: string;
  dateformat?: string;
  decimal_separator?: string;
}

interface AddOptions {
  tableNameOverride?: string;
  csvOptions?: CsvAddOptions;
}

export function useFileAdd(db: AsyncDuckDB | null) {
  const [adding, setAdding] = useState(false);
  const [progress, setProgress] = useState<AddProgress[]>([]);

  /**
   * Add a file and create a table in DuckDB
   *
   * Process:
   * 1. Store file in IndexedDB for persistence
   * 2. Register file buffer with DuckDB
   * 3. Create table using appropriate read_*_auto function
   */
  async function addFile(file: File, options?: AddOptions): Promise<string> {
    if (!db) throw new Error('Database not initialized');

    const fileName = file.name;
    const defaultTableName = defaultTableNameFromFile(fileName);
    const tableName = options?.tableNameOverride
      ? sanitizeTableName(options.tableNameOverride)
      : defaultTableName;

    // Initialize progress tracking
    setProgress(prev => [...prev, {
      fileName,
      progress: 0,
      status: 'adding'
    }]);

    try {
      setAdding(true);

      // Step 1: Store original file in IndexedDB
      // This allows us to persist files across page refreshes
      await idbSet(`file:${fileName}`, file);

      // Step 2: Read file as ArrayBuffer (raw bytes)
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Step 3: Register file with DuckDB
      // This makes the file available to DuckDB's SQL functions
      await db.registerFileBuffer(fileName, uint8Array);

      // Update progress: file registered
      setProgress(prev => prev.map(p =>
        p.fileName === fileName
          ? { ...p, progress: 50, status: 'processing' }
          : p
      ));

      // Step 4: Create table based on file type
      if (fileName.endsWith('.csv')) {
        const csvOptions = options?.csvOptions;
        const csvOptionsSql = buildCsvOptionsSql(csvOptions);
        // read_csv_auto automatically detects delimiters, headers, types
        await withDuckDBConnection(db, async (conn) => {
          await conn.query(`
            CREATE TABLE ${quoteIdentifier(tableName)} AS
            SELECT * FROM read_csv_auto(${quoteStringLiteral(fileName)}${csvOptionsSql})
          `);
        });
      } else if (fileName.endsWith('.json')) {
        // read_json_auto handles both JSON arrays and newline-delimited JSON
        await withDuckDBConnection(db, async (conn) => {
          await conn.query(`
            CREATE TABLE ${quoteIdentifier(tableName)} AS
            SELECT * FROM read_json_auto(${quoteStringLiteral(fileName)})
          `);
        });
      } else if (fileName.endsWith('.parquet')) {
        // Parquet is a columnar format (like CSV but binary and compressed)
        await withDuckDBConnection(db, async (conn) => {
          await conn.query(`
            CREATE TABLE ${quoteIdentifier(tableName)} AS
            SELECT * FROM read_parquet(${quoteStringLiteral(fileName)})
          `);
        });
      } else {
        throw new Error(`Unsupported file type: ${fileName}`);
      }

      // Update progress: table created successfully
      setProgress(prev => prev.map(p =>
        p.fileName === fileName
          ? { ...p, progress: 100, status: 'done' }
          : p
      ));

      return tableName;

    } catch (error) {
      // Update progress with error
      setProgress(prev => prev.map(p =>
        p.fileName === fileName
          ? { ...p, status: 'error', error: (error as Error).message }
          : p
      ));
      throw error;
    } finally {
      try {
        await db.dropFile(fileName);
      } catch {
        // Ignore cleanup failures when the virtual file was never registered.
      }
      setAdding(false);
    }
  }

  /**
   * Clear the progress list
   * Useful after all additions are complete
   */
  function clearProgress() {
    setProgress([]);
  }

  return { addFile, adding, progress, clearProgress };
}

function buildCsvOptionsSql(options?: CsvAddOptions): string {
  if (!options) return '';

  const parts: string[] = [];

  if (typeof options.skip === 'number') {
    parts.push(`skip=${options.skip}`);
  }

  if (typeof options.header === 'boolean') {
    parts.push(`header=${options.header}`);
  }

  if (options.delim) {
    parts.push(`delim=${quoteStringLiteral(options.delim)}`);
  }

  if (options.quote) {
    parts.push(`quote=${quoteStringLiteral(options.quote)}`);
  }

  if (options.escape) {
    parts.push(`escape=${quoteStringLiteral(options.escape)}`);
  }

  if (options.nullStr) {
    parts.push(`nullstr=${quoteStringLiteral(options.nullStr)}`);
  }

  if (options.dateformat) {
    parts.push(`dateformat=${quoteStringLiteral(options.dateformat)}`);
  }

  if (options.decimal_separator) {
    parts.push(`decimal_separator=${quoteStringLiteral(options.decimal_separator)}`);
  }

  if (parts.length === 0) return '';
  return `, ${parts.join(', ')}`;
}
