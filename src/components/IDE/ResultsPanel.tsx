import type { ReactNode } from "react";
import ResultsTabsContainer from "./ResultsTabs";
import type { QueryResult } from "../../types/query";

interface ResultsPanelProps {
  children: ReactNode;
  isCollapsed: boolean;
  onToggle: () => void;
  rowCount?: number;
  executionTime?: number;
  hasError?: boolean;
  result: QueryResult | null;
}

/**
 * ResultsPanel Component
 *
 * Wrapper for query results with collapsible summary bar.
 * Shows row count and execution time when collapsed.
 * Contains result tabs (Data / Visualisation / Classification).
 */
export default function ResultsPanel({
  children,
  isCollapsed,
  onToggle,
  rowCount,
  executionTime,
  hasError,
  result,
}: ResultsPanelProps) {
  const hasResults = rowCount !== undefined || executionTime !== undefined;

  return (
    <div className="flex h-full flex-col bg-white dark:bg-slate-950">
      {/* Header Bar - Always visible, clickable to toggle */}
      <button
        onClick={onToggle}
        className={`
          flex w-full items-center gap-2 border-t border-slate-200 bg-slate-50/80 px-4 py-1.5 text-left transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:bg-slate-900
          ${isCollapsed ? "" : "border-b"}
        `}
        aria-expanded={!isCollapsed}
        aria-label={isCollapsed ? "Expand results panel" : "Collapse results panel"}
      >
        {/* Collapse/Expand Icon */}
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 dark:text-slate-500 ${
            isCollapsed ? "" : "rotate-180"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 15l7-7 7 7"
          />
        </svg>

        {/* Results Icon */}
        <svg
          className={`w-4 h-4 ${hasError ? "text-red-600" : "text-green-600"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={
              hasError
                ? "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                : "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            }
          />
        </svg>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-100">Results</span>

        {/* Summary badges - visible when collapsed or always */}
        {hasResults && (
          <div className="flex items-center gap-2 ml-auto">
            {rowCount !== undefined && (
               <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                 {rowCount.toLocaleString()} {rowCount === 1 ? "row" : "rows"}
               </span>
             )}
             {executionTime !== undefined && (
               <span className="rounded-full bg-fuchsia-100 px-2 py-0.5 text-xs font-medium text-fuchsia-700 dark:bg-fuchsia-500/15 dark:text-fuchsia-300">
                 {executionTime.toFixed(2)}ms
               </span>
             )}
          </div>
        )}

        {/* Keyboard hint */}
         <span className="ml-2 hidden text-xs text-slate-400 sm:inline dark:text-slate-500">
          {isCollapsed ? "(click to expand)" : "(Cmd+J)"}
        </span>
      </button>

      {/* Results Content with Tabs - Hidden when collapsed */}
      {!isCollapsed && (
        <div className="flex-1 min-h-0">
          <ResultsTabsContainer dataContent={children} result={result} />
        </div>
      )}
    </div>
  );
}
