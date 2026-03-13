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
      <td className="px-3 py-1.5 text-right text-sm text-slate-800 dark:text-slate-100">
        {formatValue(stats.min)}
      </td>
      <td className="px-3 py-1.5 text-right text-sm text-slate-800 dark:text-slate-100">
        {formatValue(stats.max)}
      </td>
      <td className="px-3 py-1.5 text-right text-sm text-slate-800 dark:text-slate-100">
        {formatValue(stats.mean)}
      </td>
      <td className="px-3 py-1.5 text-right text-sm text-slate-800 dark:text-slate-100">
        {formatValue(stats.median)}
      </td>
      <td className="px-3 py-1.5 text-right text-sm text-slate-800 dark:text-slate-100">
        {formatValue(stats.mode)}
      </td>
      <td className="px-3 py-1.5 text-right text-sm text-slate-500 dark:text-slate-400">
        {stats.nullCount.toLocaleString()}
      </td>
    </>
  );
}

/** Render stats cells for a date column. */
function DateRow({ stats }: { stats: DateStats }) {
  return (
    <>
      <td className="px-3 py-1.5 text-right text-sm text-slate-800 dark:text-slate-100">
        {formatDate(stats.min)}
      </td>
      <td className="px-3 py-1.5 text-right text-sm text-slate-800 dark:text-slate-100">
        {formatDate(stats.max)}
      </td>
      <td className="px-3 py-1.5 text-right text-sm text-slate-800 dark:text-slate-100">
        {formatDate(stats.mean)}
      </td>
      <td className="px-3 py-1.5 text-right text-sm text-slate-800 dark:text-slate-100">
        {formatDate(stats.median)}
      </td>
      <td className="px-3 py-1.5 text-right text-sm text-slate-800 dark:text-slate-100">
        {formatDate(stats.mode)}
      </td>
      <td className="px-3 py-1.5 text-right text-sm text-slate-500 dark:text-slate-400">
        {stats.nullCount.toLocaleString()}
      </td>
    </>
  );
}

/** Render stats cells for a string column. */
function StringRow({ stats }: { stats: StringStats }) {
  return (
    <>
      <td className="px-3 py-1.5 text-right text-sm text-slate-800 dark:text-slate-100">
        {formatValue(stats.minLength)}
      </td>
      <td className="px-3 py-1.5 text-right text-sm text-slate-800 dark:text-slate-100">
        {formatValue(stats.maxLength)}
      </td>
      <td className="px-3 py-1.5 text-right text-sm text-slate-500 dark:text-slate-400" colSpan={3}>
        -
      </td>
      <td className="px-3 py-1.5 text-right text-sm text-slate-500 dark:text-slate-400">
        {stats.nullCount.toLocaleString()}
      </td>
    </>
  );
}

/** Render stats cells for a boolean column. */
function BooleanRow({ stats }: { stats: BooleanStats }) {
  return (
    <>
      <td className="px-3 py-1.5 text-right text-sm text-slate-800 dark:text-slate-100" colSpan={2}>
        <span className="text-green-700 dark:text-green-300">{stats.trueCount.toLocaleString()} true</span>
        {" / "}
        <span className="text-red-700 dark:text-red-300">{stats.falseCount.toLocaleString()} false</span>
      </td>
      <td className="px-3 py-1.5 text-right text-sm text-slate-500 dark:text-slate-400" colSpan={3}>
        -
      </td>
      <td className="px-3 py-1.5 text-right text-sm text-slate-500 dark:text-slate-400">
        {stats.nullCount.toLocaleString()}
      </td>
    </>
  );
}

/** Render stats cells for a column with no stats (other type). */
function OtherRow() {
  return (
    <td className="px-3 py-1.5 text-center text-sm italic text-slate-400 dark:text-slate-500" colSpan={6}>
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
      return "border border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-900/80 dark:bg-blue-500/15 dark:text-blue-300";
    case "date":
      return "border border-fuchsia-200 bg-fuchsia-100 text-fuchsia-700 dark:border-fuchsia-900/80 dark:bg-fuchsia-500/15 dark:text-fuchsia-300";
    case "string":
      return "border border-green-200 bg-green-100 text-green-700 dark:border-green-900/80 dark:bg-green-500/15 dark:text-green-300";
    case "boolean":
      return "border border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-900/80 dark:bg-amber-500/15 dark:text-amber-300";
    default:
      return "border border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300";
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
      <div className="flex h-full flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
        <svg
          className="mb-3 h-10 w-10 text-slate-300 dark:text-slate-600"
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
        <p className="text-sm font-medium text-slate-500 dark:text-slate-300">Classification</p>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          Run a query to see column statistics
        </p>
      </div>
    );
  }

  // Loading state
  if (computing) {
    return (
      <div className="flex h-full flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
        <svg
          className="mb-3 h-8 w-8 animate-spin text-blue-400 dark:text-blue-300"
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
        <p className="text-sm font-medium text-slate-500 dark:text-slate-300">
          Computing classification...
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center py-12 text-red-400 dark:text-red-300">
        <svg
          className="mb-3 h-10 w-10 text-red-300 dark:text-red-400"
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
        <p className="text-sm font-medium text-red-500 dark:text-red-300">
          Classification failed
        </p>
        <p className="mt-1 max-w-md text-center text-xs text-red-400 dark:text-red-300/90">
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
    <div className="relative h-full overflow-auto p-4">
      {/* Summary badges */}
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:border-blue-900/80 dark:bg-blue-500/15 dark:text-blue-300">
          {classification.totalRows.toLocaleString()}{" "}
          {classification.totalRows === 1 ? "row" : "rows"}
        </span>
        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
          {classification.columns.length}{" "}
          {classification.columns.length === 1 ? "column" : "columns"}
        </span>
        <span className="inline-flex items-center rounded-full border border-fuchsia-200 bg-fuchsia-100 px-2.5 py-0.5 text-xs font-medium text-fuchsia-700 dark:border-fuchsia-900/80 dark:bg-fuchsia-500/15 dark:text-fuchsia-300">
          {classification.computationTime.toFixed(1)}ms
        </span>
      </div>

      {/* Stats table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
              <th className="whitespace-nowrap border-b-2 border-slate-300 px-3 py-1.5 text-left text-xs font-bold uppercase tracking-wider text-slate-700 dark:border-slate-700 dark:text-slate-200">
                Column
              </th>
              <th className="whitespace-nowrap border-b-2 border-slate-300 px-3 py-1.5 text-left text-xs font-bold uppercase tracking-wider text-slate-700 dark:border-slate-700 dark:text-slate-200">
                Type
              </th>
              <th className="whitespace-nowrap border-b-2 border-slate-300 px-3 py-1.5 text-right text-xs font-bold uppercase tracking-wider text-slate-700 dark:border-slate-700 dark:text-slate-200">
                Min
              </th>
              <th className="whitespace-nowrap border-b-2 border-slate-300 px-3 py-1.5 text-right text-xs font-bold uppercase tracking-wider text-slate-700 dark:border-slate-700 dark:text-slate-200">
                Max
              </th>
              <th className="whitespace-nowrap border-b-2 border-slate-300 px-3 py-1.5 text-right text-xs font-bold uppercase tracking-wider text-slate-700 dark:border-slate-700 dark:text-slate-200">
                Mean
              </th>
              <th className="whitespace-nowrap border-b-2 border-slate-300 px-3 py-1.5 text-right text-xs font-bold uppercase tracking-wider text-slate-700 dark:border-slate-700 dark:text-slate-200">
                Median
              </th>
              <th className="whitespace-nowrap border-b-2 border-slate-300 px-3 py-1.5 text-right text-xs font-bold uppercase tracking-wider text-slate-700 dark:border-slate-700 dark:text-slate-200">
                Mode
              </th>
              <th className="whitespace-nowrap border-b-2 border-slate-300 px-3 py-1.5 text-right text-xs font-bold uppercase tracking-wider text-slate-700 dark:border-slate-700 dark:text-slate-200">
                Nulls
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-950">
            {classification.columns.map((col) => (
              <tr key={col.columnName} className="transition-colors hover:bg-blue-50/50 dark:hover:bg-blue-500/5">
                <td className="whitespace-nowrap px-3 py-1.5 text-sm font-medium text-slate-800 dark:text-slate-100">
                  {col.columnName}
                </td>
                <td className="whitespace-nowrap px-3 py-1.5">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${categoryBadge(col.category)}`}
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
        <p className="mt-2 text-[10px] text-slate-400 dark:text-slate-500">
          * String columns show Min Length / Max Length instead of value
          min/max.
        </p>
      )}
    </div>
  );
}
