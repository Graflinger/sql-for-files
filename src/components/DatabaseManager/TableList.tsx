import { useDuckDBContext } from '../../contexts/DuckDBContext';

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
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-sm text-gray-500">Loading database...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded p-3">
        <p className="text-sm text-red-700">
          Failed to load database: {error.message}
        </p>
      </div>
    );
  }

  // Empty state
  if (tables.length === 0) {
    return (
      <div className="text-center py-8">
        <svg
          className="mx-auto h-12 w-12 text-gray-400 mb-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <p className="text-sm text-gray-500">No tables yet</p>
        <p className="text-xs text-gray-400 mt-1">
          Upload a file to get started
        </p>
      </div>
    );
  }

  // Table list
  return (
    <div className="space-y-2">
      {tables.map((tableName) => (
        <div
          key={tableName}
          className="group flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
        >
          <div className="flex items-center space-x-2">
            {/* Table Icon */}
            <svg
              className="h-5 w-5 text-gray-400"
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

            {/* Table Name */}
            <span className="text-sm font-medium text-gray-700">
              {tableName}
            </span>
          </div>

          {/* Info Badge (appears on hover) */}
          <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
            Table
          </span>
        </div>
      ))}
    </div>
  );
}
