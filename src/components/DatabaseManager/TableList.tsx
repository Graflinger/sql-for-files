import { useState, useRef } from "react";
import { useDuckDBContext } from "../../contexts/DuckDBContext";
import { usePersistence } from "../../hooks/usePersistence";

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
      const conn = await db.connect();

      // Use DESCRIBE to get column information
      const result = await conn.query(`DESCRIBE ${tableName}`);
      const schemaData = result.toArray() as ColumnInfo[];

      // Cache the schema
      setSchemas((prev) => ({
        ...prev,
        [tableName]: schemaData,
      }));

      await conn.close();
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
        <p className="text-sm text-slate-600 font-medium">
          Loading database...
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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
        <div className="mb-4 pb-4 border-b border-slate-200">
          <button
            onClick={handleImport}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 hover:border-blue-400 transition-all duration-200"
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
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
              <p className="text-xs font-medium text-slate-700 truncate">
                Import: {importFile.name}
              </p>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={replaceExisting}
                  onChange={(e) => setReplaceExisting(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-600">
                  Replace existing tables
                </span>
              </label>
              <div className="flex gap-2">
                <button
                  onClick={handleCancelImport}
                  disabled={importing}
                  className="flex-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1"
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
        <div className="text-center py-10">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-4"></div>
          <p className="text-sm font-semibold text-slate-700 mb-1">
            No tables yet
          </p>
          <p className="text-xs text-slate-500">
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
        <div className="flex items-center gap-2 pb-4 border-b border-slate-200">
          <span className="flex-1 text-sm font-medium text-red-700">
            Drop all {tables.length} {tables.length === 1 ? "table" : "tables"}?
          </span>
          <button
            onClick={() => setConfirmingDropAll(false)}
            disabled={droppingAll}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1"
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
        <div className="flex gap-2 pb-4 border-b border-slate-200 flex-wrap">
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
            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50 hover:border-blue-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
            className="flex items-center justify-center gap-1.5 px-2 py-2 bg-white border border-red-200 text-red-600 text-xs font-medium rounded-lg hover:bg-red-50 hover:border-red-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
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
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
          <p className="text-xs font-medium text-slate-700 truncate">
            Import: {importFile.name}
          </p>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={replaceExisting}
              onChange={(e) => setReplaceExisting(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs text-slate-600">
              Replace existing tables
            </span>
          </label>
          <div className="flex gap-2">
            <button
              onClick={handleCancelImport}
              disabled={importing}
              className="flex-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1"
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
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
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
              className={`border rounded-lg overflow-hidden transition-all duration-200 ${
                isConfirmingDelete
                  ? "bg-red-50 border-red-200"
                  : "bg-gradient-to-r from-slate-50 to-transparent border-slate-200 hover:from-blue-50 hover:border-blue-300"
              }`}
            >
              {isConfirmingDelete ? (
                /* Per-table delete confirmation */
                <div className="flex items-center gap-2 p-3">
                  <span className="flex-1 text-sm font-medium text-red-700 truncate">
                    Delete &quot;{tableName}&quot;?
                  </span>
                  <button
                    onClick={() => setConfirmingDeleteTable(null)}
                    disabled={isDroppingThis}
                    className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteTable(tableName)}
                    disabled={isDroppingThis}
                    className="px-2.5 py-1 text-xs font-medium text-white bg-red-600 border border-red-700 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:opacity-60"
                  >
                    {isDroppingThis ? "Deleting..." : "Delete"}
                  </button>
                </div>
              ) : (
                <>
                  {/* Table Header - Clickable */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => handleToggleExpand(tableName)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleToggleExpand(tableName);
                      }
                    }}
                    aria-expanded={isExpanded}
                    aria-label={`${isExpanded ? "Collapse" : "Expand"} ${tableName} table schema`}
                    className="group relative flex items-center gap-3 p-3 cursor-pointer w-full text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 rounded-lg"
                  >
                    {/* Expand/Collapse Icon */}
                    <div className="flex-shrink-0">
                      <svg
                        className={`w-5 h-5 text-slate-500 group-hover:text-blue-600 transition-all duration-200 ${
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
                    </div>

                    {/* Table Icon */}
                    <div className="flex-shrink-0 w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center group-hover:border-blue-300 group-hover:bg-blue-50 transition-all duration-200">
                      <svg
                        className="w-4 h-4 text-slate-400 group-hover:text-blue-500"
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

                    {/* Table Name */}
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-700 transition-colors duration-200 truncate flex-1">
                      {tableName}
                    </span>

                    {/* Preview Button */}
                    {onPreviewTable && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPreviewTable(tableName);
                        }}
                        aria-label={`Preview ${tableName} table`}
                        className="flex-shrink-0 p-1.5 rounded-md text-slate-500 hover:text-blue-600 hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                        title="Quick preview (first 10 rows)"
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

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmingDeleteTable(tableName);
                      }}
                      aria-label={`Delete ${tableName} table`}
                      className="flex-shrink-0 p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                      title={`Drop table ${tableName}`}
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Schema Details - Expandable */}
                  {isExpanded && (
                    <div className="px-3 pb-3 pt-0">
                      <div className="ml-8 pl-3 border-l-2 border-slate-200">
                        {isLoadingThisSchema ? (
                          <div className="py-2 flex items-center gap-2 text-xs text-slate-500">
                            <div className="w-3 h-3 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin"></div>
                            Loading schema...
                          </div>
                        ) : schema ? (
                          <div className="space-y-1 py-1">
                            <div className="text-xs font-semibold text-slate-500 mb-2">
                              Columns ({schema.length})
                            </div>
                            {schema.map((col) => (
                              <div
                                key={col.column_name}
                                className="flex items-start gap-2 py-1.5 px-2 bg-white rounded border border-slate-100"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-medium text-slate-700 truncate">
                                    {col.column_name}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                    {col.column_type}
                                  </span>
                                  {col.null === "YES" && (
                                    <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
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
