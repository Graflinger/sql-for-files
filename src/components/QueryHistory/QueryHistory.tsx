import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useQueryHistory } from '../../hooks/useQueryHistory';
import type { QueryHistoryEntry } from '../../hooks/useQueryHistory';

interface QueryHistoryProps {
  onLoadQuery: (query: string) => void;
}

/**
 * QueryHistory Component
 *
 * Dropdown showing recent query history with:
 * - Auto-save on execution
 * - Quick load queries
 * - Visual status badges
 * - Smart truncation with tooltips
 * - Relative timestamps
 * - Individual delete & clear all
 */
export default function QueryHistory({ onLoadQuery }: QueryHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { history, loading, deleteQuery, clearHistory, getRelativeTime, loadHistory } = useQueryHistory();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });

  // Update dropdown position to follow the button
  const updatePosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, []);

  // Calculate dropdown position when opened and reload history
  useEffect(() => {
    if (isOpen) {
      updatePosition();
      loadHistory();
    }
  }, [isOpen, loadHistory, updatePosition]);

  // Update position on scroll and resize (but don't close)
  useEffect(() => {
    if (!isOpen) return;

    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, updatePosition]);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleLoadQuery = (query: string) => {
    onLoadQuery(query);
    setIsOpen(false);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteQuery(id);
  };

  const handleSave = (e: React.MouseEvent, query: string) => {
    e.stopPropagation();

    if (!query.trim()) {
      return;
    }

    // Create a blob with the SQL content
    const blob = new Blob([query], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    // Create a temporary link and trigger download
    const link = document.createElement("a");
    link.href = url;
    link.download = `query_${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/:/g, "-")}.sql`;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all query history?')) {
      await clearHistory();
    }
  };

  /**
   * Truncate query for display
   */
  const truncateQuery = (query: string, maxLength: number = 60): string => {
    const cleaned = query.replace(/\s+/g, ' ').trim();
    if (cleaned.length <= maxLength) return cleaned;
    return cleaned.substring(0, maxLength) + '...';
  };

  // Render dropdown content
  const dropdownContent = isOpen && (
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: `${dropdownPosition.top}px`,
        right: `${dropdownPosition.right}px`,
      }}
      className="w-96 max-w-[calc(100vw-2rem)] bg-white border border-slate-300 rounded-lg shadow-2xl z-[9999] max-h-96 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50 rounded-t-lg">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Query History
        </h3>
        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* History List */}
      <div className="overflow-y-auto flex-1">
        {history.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-slate-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-slate-600 font-medium">No query history yet</p>
            <p className="text-xs text-slate-500 mt-1">Executed queries will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {history.map((entry) => (
              <HistoryEntry
                key={entry.id}
                entry={entry}
                onLoad={handleLoadQuery}
                onDelete={handleDelete}
                onSave={handleSave}
                getRelativeTime={getRelativeTime}
                truncateQuery={truncateQuery}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* History Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        aria-label="Query history"
        aria-expanded={isOpen}
        className="px-4 py-2 rounded-lg font-semibold transition-colors duration-200 text-sm bg-white border-2 border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50 active:scale-95 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        title="View query history"
      >
        <span className="flex items-center gap-2">
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
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="hidden sm:inline">History</span>
          {history.length > 0 && (
            <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              {history.length}
            </span>
          )}
        </span>
      </button>

      {/* Portal Dropdown - Rendered at document.body level */}
      {dropdownContent && createPortal(dropdownContent, document.body)}
    </>
  );
}

/**
 * Individual history entry component
 */
interface HistoryEntryProps {
  entry: QueryHistoryEntry;
  onLoad: (query: string) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  onSave: (e: React.MouseEvent, query: string) => void;
  getRelativeTime: (timestamp: number) => string;
  truncateQuery: (query: string, maxLength?: number) => string;
}

function HistoryEntry({ entry, onLoad, onDelete, onSave, getRelativeTime, truncateQuery }: HistoryEntryProps) {
  const [showFullQuery, setShowFullQuery] = useState(false);

  const statusBadge = entry.status === 'success' ? (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded">
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
      {entry.rowCount !== undefined ? `${entry.rowCount.toLocaleString()} ${entry.rowCount === 1 ? 'row' : 'rows'}` : 'Success'}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded">
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
      Error
    </span>
  );

  return (
    <button
      onClick={() => onLoad(entry.query)}
      className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors group"
    >
      <div className="flex items-start gap-2">
        {/* Query Text */}
        <div className="flex-1 min-w-0">
          <div
            className="text-sm text-slate-800 font-mono bg-slate-50 group-hover:bg-white px-2 py-1 rounded border border-slate-200 transition-colors mb-1.5"
            title={entry.query}
            onMouseEnter={() => setShowFullQuery(true)}
            onMouseLeave={() => setShowFullQuery(false)}
          >
            {showFullQuery ? entry.query : truncateQuery(entry.query)}
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-2 flex-wrap">
            {statusBadge}
            <span className="text-xs text-slate-500">
              {getRelativeTime(entry.timestamp)}
            </span>
            {entry.executionTime !== undefined && (
              <span className="text-xs text-slate-500">
                · {entry.executionTime.toFixed(2)}ms
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100">
          {/* Save/Download Button */}
          <button
            onClick={(e) => onSave(e, entry.query)}
            className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            aria-label="Download query as file"
            title="Download query"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>

          {/* Delete Button */}
          <button
            onClick={(e) => onDelete(e, entry.id)}
            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            aria-label="Delete query from history"
            title="Delete from history"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </button>
  );
}
