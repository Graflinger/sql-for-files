import { useState } from "react";

import { useQueryHistory } from "../../hooks/useQueryHistory";
import type { QueryHistoryEntry } from "../../hooks/useQueryHistory";

interface QueryHistorySidebarProps {
  onLoadQuery: (query: string) => void;
}

/**
 * QueryHistorySidebar displays query history as a scrollable list
 * designed for the IDE sidebar accordion section.
 */
export default function QueryHistorySidebar({
  onLoadQuery,
}: QueryHistorySidebarProps) {
  const { history, loading, deleteQuery, clearHistory, getRelativeTime } =
    useQueryHistory();

  const handleClearAll = async () => {
    if (window.confirm("Are you sure you want to clear all query history?")) {
      await clearHistory();
    }
  };

  const handleSave = (e: React.MouseEvent, query: string) => {
    e.stopPropagation();
    if (!query.trim()) return;

    const blob = new Blob([query], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `query_${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/:/g, "-")}.sql`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="px-3 py-4 text-center text-xs text-slate-400 dark:text-slate-500">
        Loading history...
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="px-3 py-6 text-center">
        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800/80">
          <svg
            className="h-5 w-5 text-slate-400 dark:text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-300">No history yet</p>
        <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
          Executed queries appear here
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Clear All */}
      <div className="flex justify-end px-2 pb-1">
        <button
          onClick={handleClearAll}
          className="rounded px-1.5 py-0.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
        >
          Clear All
        </button>
      </div>

      {/* History List */}
      <div className="space-y-1 px-1">
        {history.map((entry) => (
          <SidebarHistoryEntry
            key={entry.id}
            entry={entry}
            onLoad={onLoadQuery}
            onDelete={deleteQuery}
            onSave={handleSave}
            getRelativeTime={getRelativeTime}
          />
        ))}
      </div>
    </div>
  );
}

interface SidebarHistoryEntryProps {
  entry: QueryHistoryEntry;
  onLoad: (query: string) => void;
  onDelete: (id: string) => Promise<void>;
  onSave: (e: React.MouseEvent, query: string) => void;
  getRelativeTime: (timestamp: number) => string;
}

function SidebarHistoryEntry({
  entry,
  onLoad,
  onDelete,
  onSave,
  getRelativeTime,
}: SidebarHistoryEntryProps) {
  const [expanded, setExpanded] = useState(false);

  const truncated = truncateQuery(entry.query, 80);
  const isTruncated = truncated !== entry.query.replace(/\s+/g, " ").trim();

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await onDelete(entry.id);
  };

  return (
    <div className="group rounded-md border border-transparent transition-colors hover:border-slate-200 hover:bg-slate-50/80 dark:hover:border-slate-700 dark:hover:bg-slate-900/60">
      {/* Clickable query area */}
      <button
        onClick={() => onLoad(entry.query)}
        className="w-full px-2 py-1.5 text-left"
        title="Click to load query into editor"
      >
        {/* Query text */}
        <div
          className="cursor-pointer break-all rounded border border-slate-200 bg-slate-50 px-1.5 py-1 font-mono text-xs leading-relaxed text-slate-700 transition-colors group-hover:border-slate-200 group-hover:bg-white dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:group-hover:border-slate-600 dark:group-hover:bg-slate-900"
          onClick={(e) => {
            if (isTruncated) {
              e.stopPropagation();
              setExpanded(!expanded);
            }
          }}
        >
          {expanded ? entry.query : truncated}
          {isTruncated && !expanded && (
            <span className="ml-0.5 text-[10px] text-blue-500 dark:text-blue-400">more</span>
          )}
        </div>

        {/* Metadata row */}
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {/* Status badge */}
          {entry.status === "success" ? (
            <span className="inline-flex items-center gap-0.5 rounded bg-green-50 px-1.5 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-500/10 dark:text-green-300">
              <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              {entry.rowCount !== undefined
                ? `${entry.rowCount.toLocaleString()} ${entry.rowCount === 1 ? "row" : "rows"}`
                : "OK"}
            </span>
          ) : (
            <span className="inline-flex items-center gap-0.5 rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-300">
              <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              Error
            </span>
          )}

          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            {getRelativeTime(entry.timestamp)}
          </span>

          {entry.executionTime !== undefined && (
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              {entry.executionTime.toFixed(1)}ms
            </span>
          )}
        </div>
      </button>

      {/* Action buttons — visible on hover */}
      <div className="flex items-center gap-0.5 px-2 pb-1.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <button
          onClick={(e) => onSave(e, entry.query)}
          className="rounded p-1 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:text-slate-500 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
          aria-label="Download query as file"
          title="Download .sql"
        >
          <svg
            className="h-3.5 w-3.5"
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
        </button>
        <button
          onClick={handleDelete}
          className="rounded p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:bg-red-500/10 dark:hover:text-red-300"
          aria-label="Delete from history"
          title="Delete"
        >
          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

/** Truncate query for display, collapsing whitespace. */
function truncateQuery(query: string, maxLength: number = 80): string {
  const cleaned = query.replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.substring(0, maxLength) + "...";
}
