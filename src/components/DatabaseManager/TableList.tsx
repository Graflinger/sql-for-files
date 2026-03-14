import { useState, useRef } from "react";
import { useDuckDBContext } from "../../contexts/DuckDBContext";
import { usePersistence } from "../../hooks/usePersistence";
import { withDuckDBConnection } from "../../utils/duckdb";
import { quoteIdentifier } from "../../utils/sql";

/**
 * TableList Component
 *
 * Displays all tables in the database with expandable schema details.
 * Provides Save Database, Export/Import, Drop All, and per-table delete actions
 * with inline confirmation UX for destructive operations.
 */

interface ColumnInfo {
  column_name: string;
  column_type: string;
  null: string;
}

interface TableListProps {
  onPreviewTable?: (tableName: string) => void;
}

export default function TableList({ onPreviewTable }: TableListProps = {}) {
  const { db, tables, loading, error, saveDatabase } = useDuckDBContext();
  const { exportDatabase, importDatabase, dropTable, dropAllTables } =
    usePersistence();
  const [expandedTable, setExpandedTable] = useState<string | null>(null);
  const [schemas, setSchemas] = useState<Record<string, ColumnInfo[]>>({});
  const [loadingSchema, setLoadingSchema] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Confirmation states
  const [confirmingDeleteTable, setConfirmingDeleteTable] = useState<
    string | null
  >(null);
  const [confirmingDropAll, setConfirmingDropAll] = useState(false);
  const [droppingTable, setDroppingTable] = useState<string | null>(null);
  const [droppingAll, setDroppingAll] = useState(false);
  const [saving, setSaving] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [importing, setImporting] = useState(false);

  /**
   * Toggle table expansion and fetch schema if not already cached
   */
  const handleToggleExpand = async (tableName: string) => {
    // If clicking the already expanded table, collapse it
    if (expandedTable === tableName) {
      setExpandedTable(null);
      return;
    }

    // Expand the new table
    setExpandedTable(tableName);

    // If schema is already cached, no need to fetch again
    if (schemas[tableName]) {
      return;
    }

    // Fetch schema for this table
    if (!db) return;

    try {
      setLoadingSchema(tableName);
      const result = await withDuckDBConnection(db, async (conn) =>
        conn.query(`DESCRIBE ${quoteIdentifier(tableName)}`)
      );
      const schemaData = result.toArray() as ColumnInfo[];

      // Cache the schema
      setSchemas((prev) => ({
        ...prev,
        [tableName]: schemaData,
      }));
    } catch (err) {
      console.error(`Failed to fetch schema for ${tableName}:`, err);
    } finally {
      setLoadingSchema(null);
    }
  };

  /**
   * Handle database export
   */
  const handleExport = async () => {
    await exportDatabase();
  };

  /**
   * Handle database import
   */
  const handleImport = () => {
    fileInputRef.current?.click();
  };

  /**
   * Handle file selection for import — store the file and show confirmation dialog
   */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      setReplaceExisting(false);
      // Reset input so the same file can be selected again
      e.target.value = "";
    }
  };

  /**
   * Confirm import — run the actual import with the chosen option
   */
  const handleConfirmImport = async () => {
    if (!importFile) return;
    setImporting(true);
    try {
      await importDatabase(importFile, replaceExisting);
    } finally {
      setImporting(false);
      setImportFile(null);
    }
  };

  /**
   * Cancel import — discard the pending file
   */
  const handleCancelImport = () => {
    setImportFile(null);
  };

  /**
   * Handle Save Database button
   */
  const handleSaveDatabase = async () => {
    setSaving(true);
    try {
      await saveDatabase();
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handle per-table delete (with confirmation)
   */
  const handleDeleteTable = async (tableName: string) => {
    setDroppingTable(tableName);
    try {
      await dropTable(tableName);
      // Clear cached schema
      setSchemas((prev) => {
        const next = { ...prev };
        delete next[tableName];
        return next;
      });
      if (expandedTable === tableName) {
        setExpandedTable(null);
      }
    } finally {
      setDroppingTable(null);
      setConfirmingDeleteTable(null);
    }
  };

  /**
   * Handle Drop All (with confirmation)
   */
  const handleDropAll = async () => {
    setDroppingAll(true);
    try {
      await dropAllTables();
      setSchemas({});
      setExpandedTable(null);
    } finally {
      setDroppingAll(false);
      setConfirmingDropAll(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="relative mx-auto w-12 h-12 mb-3">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
        </div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
          Loading database...
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/80 dark:bg-red-950/40">
        <div className="flex items-start gap-2">
          <svg
            className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="text-sm font-semibold text-red-800 mb-1">
              Failed to load database
            </p>
            <p className="text-xs text-red-700">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (tables.length === 0) {
    return (
      <>
        {/* Import button even when empty */}
          <div className="mb-4 border-b border-slate-200 pb-4 dark:border-slate-800">
            <button
              onClick={handleImport}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-all duration-200 hover:border-blue-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            Import Database
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            onChange={handleFileSelect}
            className="hidden"
          />
          {importFile && (
             <div className="mt-3 space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900/80 dark:bg-blue-950/30">
               <p className="truncate text-xs font-medium text-slate-700 dark:text-slate-200">
                 Import: {importFile.name}
               </p>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={replaceExisting}
                  onChange={(e) => setReplaceExisting(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                 <span className="text-xs text-slate-600 dark:text-slate-300">
                   Replace existing tables
                 </span>
              </label>
              <div className="flex gap-2">
                <button
                  onClick={handleCancelImport}
                  disabled={importing}
                   className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                 >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmImport}
                  disabled={importing}
                  className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 border border-blue-700 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-60"
                >
                  {importing ? "Importing..." : "Import"}
                </button>
              </div>
            </div>
          )}
        </div>
         <div className="py-10 text-center">
           <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700"></div>
           <p className="mb-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
             No tables yet
           </p>
           <p className="text-xs text-slate-500 dark:text-slate-400">
             Add a file or import a database to get started
           </p>
        </div>
      </>
    );
  }

  // Table list
  return (
    <div className="space-y-4">
      {/* Database Management Actions */}
      {confirmingDropAll ? (
        /* Drop All Confirmation */
         <div className="flex items-center gap-2 border-b border-slate-200 pb-4 dark:border-slate-800">
          <span className="flex-1 text-sm font-medium text-red-700">
            Drop all {tables.length} {tables.length === 1 ? "table" : "tables"}?
          </span>
          <button
            onClick={() => setConfirmingDropAll(false)}
            disabled={droppingAll}
             className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
           >
            Cancel
          </button>
          <button
            onClick={handleDropAll}
            disabled={droppingAll}
            className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 border border-red-700 rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:opacity-60"
          >
            {droppingAll ? "Dropping..." : "Drop All"}
          </button>
        </div>
      ) : (
        /* Normal action buttons */
         <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4 dark:border-slate-800">
          <button
            onClick={handleExport}
            disabled={tables.length === 0}
            aria-label="Export database"
            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export
          </button>
          <button
            onClick={handleImport}
            aria-label="Import database"
             className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs font-medium text-slate-700 transition-all duration-200 hover:border-blue-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
           >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            Import
          </button>
          <button
            onClick={handleSaveDatabase}
            disabled={saving || tables.length === 0}
            aria-label="Save database to browser"
            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-xs font-medium rounded-lg hover:from-emerald-700 hover:to-emerald-800 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
              />
            </svg>
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={() => setConfirmingDropAll(true)}
            aria-label="Drop all tables"
             className="flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-2 py-2 text-xs font-medium text-red-600 transition-all duration-200 hover:border-red-400 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:border-red-900/80 dark:bg-slate-900 dark:text-red-300 dark:hover:bg-red-950/40"
           >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Drop All
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* Import Confirmation Dialog */}
      {importFile && (
         <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900/80 dark:bg-blue-950/30">
           <p className="truncate text-xs font-medium text-slate-700 dark:text-slate-200">
            Import: {importFile.name}
          </p>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={replaceExisting}
              onChange={(e) => setReplaceExisting(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
             <span className="text-xs text-slate-600 dark:text-slate-300">
               Replace existing tables
             </span>
          </label>
          <div className="flex gap-2">
            <button
              onClick={handleCancelImport}
              disabled={importing}
               className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
             >
              Cancel
            </button>
            <button
              onClick={handleConfirmImport}
              disabled={importing}
              className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 border border-blue-700 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-60"
            >
              {importing ? "Importing..." : "Import"}
            </button>
          </div>
        </div>
      )}

      {/* Tables Header */}
       <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
         Tables
       </h3>

      {/* Tables List */}
      <div className="space-y-2">
        {tables.map((tableName) => {
          const isExpanded = expandedTable === tableName;
          const schema = schemas[tableName];
          const isLoadingThisSchema = loadingSchema === tableName;
          const isConfirmingDelete = confirmingDeleteTable === tableName;
          const isDroppingThis = droppingTable === tableName;

          return (
            <div
              key={tableName}
              className={`overflow-hidden rounded-lg border transition-all duration-200 ${
                 isConfirmingDelete
                   ? "border-red-200 bg-red-50 dark:border-red-900/80 dark:bg-red-950/40"
                   : "border-slate-200 bg-slate-50/80 hover:border-blue-300 hover:bg-blue-50/50 dark:border-slate-800 dark:bg-slate-900/70 dark:hover:bg-blue-950/20"
               }`}
            >
              {isConfirmingDelete ? (
                /* Per-table delete confirmation */
                <div className="flex items-center gap-2 p-3">
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate text-sm font-medium text-red-700"
                      title={`Delete "${tableName}"?`}
                    >
                      Delete &quot;{tableName}&quot;?
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setConfirmingDeleteTable(null)}
                      disabled={isDroppingThis}
                       className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                     >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeleteTable(tableName)}
                      disabled={isDroppingThis}
                      className="rounded-md border border-red-700 bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:opacity-60"
                    >
                      {isDroppingThis ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-1 p-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleExpand(tableName)}
                      aria-expanded={isExpanded}
                      aria-label={`${isExpanded ? "Collapse" : "Expand"} ${tableName} table schema`}
                      className="group flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-1 text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                    >
                       <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors duration-200 group-hover:border-blue-300 group-hover:bg-blue-50 group-hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:group-hover:bg-blue-950/40 dark:group-hover:text-blue-300">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <span
                         className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700 transition-colors duration-200 group-hover:text-blue-700 dark:text-slate-200 dark:group-hover:text-blue-300"
                        title={tableName}
                      >
                        {tableName}
                      </span>
                      <svg
                         className={`h-3.5 w-3.5 flex-shrink-0 text-slate-400 transition-all duration-200 group-hover:text-blue-600 dark:text-slate-500 dark:group-hover:text-blue-300 ${
                           isExpanded ? "rotate-90" : ""
                         }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>

                     <div className="flex flex-shrink-0 items-center border-l border-slate-200 pl-1 dark:border-slate-800">
                      <div className="flex flex-col gap-0.5">
                      {onPreviewTable && (
                        <button
                          onClick={() => onPreviewTable(tableName)}
                          aria-label={`Preview ${tableName} table`}
                           className="rounded-sm p-0.5 text-slate-500 transition-colors hover:bg-blue-100 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-400 dark:hover:bg-blue-950/40 dark:hover:text-blue-300"
                          title="Quick preview (first 100 rows)"
                        >
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => setConfirmingDeleteTable(tableName)}
                        aria-label={`Delete ${tableName} table`}
                         className="rounded-sm p-0.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-slate-500 dark:hover:bg-red-950/40 dark:hover:text-red-300"
                        title={`Drop table ${tableName}`}
                      >
                        <svg
                          className="h-3 w-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                      </div>
                    </div>
                  </div>

                  {/* Schema Details - Expandable */}
                  {isExpanded && (
                     <div className="border-t border-slate-200 bg-white px-3 pb-3 pt-2 dark:border-slate-800 dark:bg-slate-950">
                       <div className="rounded-lg bg-slate-50/80 p-3 ring-1 ring-slate-200/70 dark:bg-slate-900/80 dark:ring-slate-800">
                         {isLoadingThisSchema ? (
                           <div className="flex items-center gap-2 py-2 text-xs text-slate-500 dark:text-slate-400">
                             <div className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-blue-500 dark:border-slate-600"></div>
                             Loading schema...
                           </div>
                         ) : schema ? (
                           <div className="space-y-1 py-1">
                             <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                               Columns ({schema.length})
                             </div>
                             {schema.map((col) => (
                               <div
                                 key={col.column_name}
                                 className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 dark:border-slate-800 dark:bg-slate-950"
                               >
                                 <div className="min-w-0">
                                   <div className="text-xs font-medium text-slate-700 whitespace-normal break-words [overflow-wrap:anywhere] dark:text-slate-200">
                                     {col.column_name}
                                   </div>
                                 </div>
                                 <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                   <span className="rounded bg-blue-50 px-1.5 py-0.5 text-xs font-mono text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
                                     {col.column_type}
                                   </span>
                                   {col.null === "YES" && (
                                     <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                       null
                                     </span>
                                   )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-2 text-xs text-red-500">
                            Failed to load schema
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
