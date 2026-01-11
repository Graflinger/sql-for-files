import { useState, useRef } from "react";
import { useDuckDBContext } from "../../contexts/DuckDBContext";
import { usePersistence } from "../../hooks/usePersistence";

/**
 * TableList Component
 *
 * Displays all tables in the database with expandable schema details.
 * Shows a loading state while the database initializes.
 */

interface ColumnInfo {
  column_name: string;
  column_type: string;
  null: string;
}

export default function TableList() {
  const { db, tables, loading, error } = useDuckDBContext();
  const [expandedTable, setExpandedTable] = useState<string | null>(null);
  const [schemas, setSchemas] = useState<Record<string, ColumnInfo[]>>({});
  const [loadingSchema, setLoadingSchema] = useState<string | null>(null);

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
      <div className="text-center py-10">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-4"></div>
        <p className="text-sm font-semibold text-slate-700 mb-1">
          No tables yet
        </p>
        <p className="text-xs text-slate-500">Upload a file to get started</p>
      </div>
    );
  }

  // Table list
  return (
    <div className="space-y-2">
      {tables.map((tableName) => {
        const isExpanded = expandedTable === tableName;
        const schema = schemas[tableName];
        const isLoadingThisSchema = loadingSchema === tableName;

        return (
          <div
            key={tableName}
            className="bg-gradient-to-r from-slate-50 to-transparent border border-slate-200 rounded-lg overflow-hidden transition-all duration-200 hover:from-blue-50 hover:border-blue-300"
          >
            {/* Table Header - Clickable */}
            <div
              onClick={() => handleToggleExpand(tableName)}
              className="group relative flex items-center gap-3 p-3 cursor-pointer"
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
          </div>
        );
      })}
    </div>
  );
}
