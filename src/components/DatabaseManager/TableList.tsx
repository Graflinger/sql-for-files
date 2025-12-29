import { useDuckDBContext } from "../../contexts/DuckDBContext";

/**
 * TableList Component
 *
 * Displays all tables in the database.
 * Shows a loading state while the database initializes.
 */
export default function TableList() {
  const { tables, loading, error } = useDuckDBContext();

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
      {tables.map((tableName) => (
        <div
          key={tableName}
          className="group relative flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-transparent border border-slate-200 rounded-lg hover:from-blue-50 hover:border-blue-300 transition-all duration-200 cursor-pointer"
        >
          {/* Table Icon */}
          <div className="flex-shrink-0 w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center group-hover:border-blue-300 group-hover:bg-blue-50 transition-all duration-200"></div>

          {/* Table Name */}
          <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-700 transition-colors duration-200 truncate">
            {tableName}
          </span>

          {/* Hover indicator */}
          <div className="absolute right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <svg
              className="w-4 h-4 text-blue-500"
              width="16"
              height="16"
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
        </div>
      ))}
    </div>
  );
}
