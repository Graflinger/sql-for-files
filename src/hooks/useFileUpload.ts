import { useState } from 'react';
import { AsyncDuckDB } from '@duckdb/duckdb-wasm';
import { set as idbSet } from 'idb-keyval';

// Track progress for each file being uploaded
interface UploadProgress {
  fileName: string;
  progress: number; // 0-100
  status: 'uploading' | 'processing' | 'done' | 'error';
  error?: string;
}

/**
 * useFileUpload Hook
 *
 * Provides file upload functionality with progress tracking.
 * Handles CSV, JSON, and Parquet files.
 *
 * @param db - The DuckDB instance from DuckDBContext
 * @returns {uploadFile, uploading, progress, clearProgress}
 */
export function useFileUpload(db: AsyncDuckDB | null) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress[]>([]);

  /**
   * Upload a file and create a table in DuckDB
   *
   * Process:
   * 1. Store file in IndexedDB for persistence
   * 2. Register file buffer with DuckDB
   * 3. Create table using appropriate read_*_auto function
   */
  async function uploadFile(file: File): Promise<string> {
    if (!db) throw new Error('Database not initialized');

    const fileName = file.name;
    // Clean table name: remove extension and replace invalid chars with underscore
    const tableName = fileName
      .replace(/\.[^/.]+$/, '')        // Remove extension (.csv -> '')
      .replace(/[^a-zA-Z0-9_]/g, '_'); // Replace special chars with _

    // Initialize progress tracking
    setProgress(prev => [...prev, {
      fileName,
      progress: 0,
      status: 'uploading'
    }]);

    try {
      setUploading(true);

      // Step 1: Store original file in IndexedDB
      // This allows us to persist files across page refreshes
      await idbSet(`file:${fileName}`, file);

      // Step 2: Read file as ArrayBuffer (raw bytes)
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Step 3: Register file with DuckDB
      // This makes the file available to DuckDB's SQL functions
      await db.registerFileBuffer(fileName, uint8Array);

      // Update progress: file uploaded
      setProgress(prev => prev.map(p =>
        p.fileName === fileName
          ? { ...p, progress: 50, status: 'processing' }
          : p
      ));

      // Step 4: Create table based on file type
      const conn = await db.connect();

      if (fileName.endsWith('.csv')) {
        // read_csv_auto automatically detects delimiters, headers, types
        await conn.query(`
          CREATE TABLE ${tableName} AS
          SELECT * FROM read_csv_auto('${fileName}')
        `);
      } else if (fileName.endsWith('.json')) {
        // read_json_auto handles both JSON arrays and newline-delimited JSON
        await conn.query(`
          CREATE TABLE ${tableName} AS
          SELECT * FROM read_json_auto('${fileName}')
        `);
      } else if (fileName.endsWith('.parquet')) {
        // Parquet is a columnar format (like CSV but binary and compressed)
        await conn.query(`
          CREATE TABLE ${tableName} AS
          SELECT * FROM read_parquet('${fileName}')
        `);
      } else {
        throw new Error(`Unsupported file type: ${fileName}`);
      }

      await conn.close();

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
      setUploading(false);
    }
  }

  /**
   * Clear the progress list
   * Useful after all uploads are complete
   */
  function clearProgress() {
    setProgress([]);
  }

  return { uploadFile, uploading, progress, clearProgress };
}
