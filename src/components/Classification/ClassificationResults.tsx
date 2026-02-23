import { useDuckDBContext } from "../../contexts/DuckDBContext";
import { useClassification } from "../../hooks/useClassification";
import type { QueryResult } from "../../types/query";
import type {
  ColumnClassification,
  NumericStats,
  DateStats,
  StringStats,
  BooleanStats,
} from "../../types/classification";

interface ClassificationResultsProps {
  result: QueryResult | null;
}

/** Format a number for display, handling large values and decimals. */
function formatValue(value: number | null): string {
  if (value == null) return "-";
  if (Number.isInteger(value)) return value.toLocaleString();
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

/** Format a date string for display, trimming excessive precision. */
function formatDate(value: string | null): string {
  if (value == null) return "-";
  return value;
}

/** Render stats cells for a numeric column. */
function NumericRow({ stats }: { stats: NumericStats }) {
  return (
    <>
      <td className="px-3 py-2 text-xs text-slate-700 text-right">
        {formatValue(stats.min)}
      </td>
      <td className="px-3 py-2 text-xs text-slate-700 text-right">
        {formatValue(stats.max)}
      </td>
      <td className="px-3 py-2 text-xs text-slate-700 text-right">
        {formatValue(stats.mean)}
      </td>
      <td className="px-3 py-2 text-xs text-slate-700 text-right">
        {formatValue(stats.median)}
      </td>
      <td className="px-3 py-2 text-xs text-slate-700 text-right">
        {formatValue(stats.mode)}
      </td>
      <td className="px-3 py-2 text-xs text-slate-500 text-right">
        {stats.nullCount.toLocaleString()}
      </td>
    </>
  );
}

/** Render stats cells for a date column. */
function DateRow({ stats }: { stats: DateStats }) {
  return (
    <>
      <td className="px-3 py-2 text-xs text-slate-700 text-right">
        {formatDate(stats.min)}
      </td>
      <td className="px-3 py-2 text-xs text-slate-700 text-right">
        {formatDate(stats.max)}
      </td>
      <td className="px-3 py-2 text-xs text-slate-700 text-right">
        {formatDate(stats.mean)}
      </td>
      <td className="px-3 py-2 text-xs text-slate-700 text-right">
        {formatDate(stats.median)}
      </td>
      <td className="px-3 py-2 text-xs text-slate-700 text-right">
        {formatDate(stats.mode)}
      </td>
      <td className="px-3 py-2 text-xs text-slate-500 text-right">
        {stats.nullCount.toLocaleString()}
      </td>
    </>
  );
}

/** Render stats cells for a string column. */
function StringRow({ stats }: { stats: StringStats }) {
  return (
    <>
      <td className="px-3 py-2 text-xs text-slate-700 text-right">
        {formatValue(stats.minLength)}
      </td>
      <td className="px-3 py-2 text-xs text-slate-700 text-right">
        {formatValue(stats.maxLength)}
      </td>
      <td className="px-3 py-2 text-xs text-slate-500 text-right" colSpan={3}>
        -
      </td>
      <td className="px-3 py-2 text-xs text-slate-500 text-right">
        {stats.nullCount.toLocaleString()}
      </td>
    </>
  );
}

/** Render stats cells for a boolean column. */
function BooleanRow({ stats }: { stats: BooleanStats }) {
  return (
    <>
      <td className="px-3 py-2 text-xs text-slate-700 text-right" colSpan={2}>
        <span className="text-green-700">{stats.trueCount.toLocaleString()} true</span>
        {" / "}
        <span className="text-red-700">{stats.falseCount.toLocaleString()} false</span>
      </td>
      <td className="px-3 py-2 text-xs text-slate-500 text-right" colSpan={3}>
        -
      </td>
      <td className="px-3 py-2 text-xs text-slate-500 text-right">
        {stats.nullCount.toLocaleString()}
      </td>
    </>
  );
}

/** Render stats cells for a column with no stats (other type). */
function OtherRow() {
  return (
    <td className="px-3 py-2 text-xs text-slate-400 italic text-center" colSpan={6}>
      Not classified
    </td>
  );
}

/** Render the appropriate stats row for a column classification. */
function StatsRow({ col }: { col: ColumnClassification }) {
  if (!col.stats) return <OtherRow />;

  switch (col.category) {
    case "numeric":
      return <NumericRow stats={col.stats as NumericStats} />;
    case "date":
      return <DateRow stats={col.stats as DateStats} />;
    case "string":
      return <StringRow stats={col.stats as StringStats} />;
    case "boolean":
      return <BooleanRow stats={col.stats as BooleanStats} />;
    default:
      return <OtherRow />;
  }
}

/** Category badge colour mapping. */
function categoryBadge(category: string): string {
  switch (category) {
    case "numeric":
      return "bg-blue-100 text-blue-700";
    case "date":
      return "bg-purple-100 text-purple-700";
    case "string":
      return "bg-green-100 text-green-700";
    case "boolean":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-slate-100 text-slate-500";
  }
}

/**
 * ClassificationResults Component
 *
 * Displays per-column statistics for the current query result.
 * Uses the useClassification hook to compute stats via DuckDB SQL
 * on the full Arrow result set.
 */
export default function ClassificationResults({
  result,
}: ClassificationResultsProps) {
  const { db } = useDuckDBContext();
  const { classification, computing, error } = useClassification(
    db,
    result?.arrowTable
  );

  // Empty state: no query result
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
        <svg
          className="w-10 h-10 mb-3 text-slate-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
        <p className="text-sm font-medium text-slate-500">Classification</p>
        <p className="text-xs text-slate-400 mt-1">
          Run a query to see column statistics
        </p>
      </div>
    );
  }

  // Loading state
  if (computing) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
        <svg
          className="w-8 h-8 mb-3 text-blue-400 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <p className="text-sm font-medium text-slate-500">
          Computing classification...
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-400 py-12">
        <svg
          className="w-10 h-10 mb-3 text-red-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-sm font-medium text-red-500">
          Classification failed
        </p>
        <p className="text-xs text-red-400 mt-1 max-w-md text-center">
          {error.message}
        </p>
      </div>
    );
  }

  // No classification data yet (shouldn't happen but guard)
  if (!classification) {
    return null;
  }

  return (
    <div className="p-4">
      {/* Summary badges */}
      <div className="flex items-center gap-2 mb-3">
        <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
          {classification.totalRows.toLocaleString()}{" "}
          {classification.totalRows === 1 ? "row" : "rows"}
        </span>
        <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
          {classification.columns.length}{" "}
          {classification.columns.length === 1 ? "column" : "columns"}
        </span>
        <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
          {classification.computationTime.toFixed(1)}ms
        </span>
      </div>

      {/* Stats table */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-3 py-2 text-xs font-semibold text-slate-600 whitespace-nowrap">
                Column
              </th>
              <th className="px-3 py-2 text-xs font-semibold text-slate-600 whitespace-nowrap">
                Type
              </th>
              <th className="px-3 py-2 text-xs font-semibold text-slate-600 text-right whitespace-nowrap">
                Min
              </th>
              <th className="px-3 py-2 text-xs font-semibold text-slate-600 text-right whitespace-nowrap">
                Max
              </th>
              <th className="px-3 py-2 text-xs font-semibold text-slate-600 text-right whitespace-nowrap">
                Mean
              </th>
              <th className="px-3 py-2 text-xs font-semibold text-slate-600 text-right whitespace-nowrap">
                Median
              </th>
              <th className="px-3 py-2 text-xs font-semibold text-slate-600 text-right whitespace-nowrap">
                Mode
              </th>
              <th className="px-3 py-2 text-xs font-semibold text-slate-600 text-right whitespace-nowrap">
                Nulls
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {classification.columns.map((col) => (
              <tr key={col.columnName} className="hover:bg-slate-50/50">
                <td className="px-3 py-2 text-xs font-medium text-slate-800 whitespace-nowrap">
                  {col.columnName}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span
                    className={`inline-block px-1.5 py-0.5 text-[10px] font-medium rounded ${categoryBadge(col.category)}`}
                  >
                    {col.category}
                  </span>
                </td>
                <StatsRow col={col} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer note for string columns */}
      {classification.columns.some((c) => c.category === "string") && (
        <p className="text-[10px] text-slate-400 mt-2">
          * String columns show Min Length / Max Length instead of value
          min/max.
        </p>
      )}
    </div>
  );
}
