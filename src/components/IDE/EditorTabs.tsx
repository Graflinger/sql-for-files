import { useState, useRef, useEffect, useCallback } from "react";
import type { EditorTab } from "../../hooks/useEditorTabs";

interface EditorTabsProps {
  tabs: EditorTab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onAddTab: () => void;
  onCloseTab: (id: string) => void;
  onRenameTab: (id: string, name: string) => void;
}

const MAX_TAB_NAME_LENGTH = 30;

/**
 * EditorTabs Component
 *
 * Horizontal tab bar for multiple open SQL queries.
 * Double-click a tab name to rename it inline.
 */
export default function EditorTabs({
  tabs,
  activeTabId,
  onSelectTab,
  onAddTab,
  onCloseTab,
  onRenameTab,
}: EditorTabsProps) {
  const canClose = tabs.length > 1;

  // Inline rename state
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus and select-all when entering edit mode
  useEffect(() => {
    if (editingTabId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingTabId]);

  const startEditing = useCallback(
    (tab: EditorTab) => {
      setEditingTabId(tab.id);
      setEditValue(tab.name);
    },
    []
  );

  const commitRename = useCallback(() => {
    if (!editingTabId) return;
    const trimmed = editValue.trim();
    if (trimmed) {
      onRenameTab(editingTabId, trimmed);
    }
    setEditingTabId(null);
    setEditValue("");
  }, [editingTabId, editValue, onRenameTab]);

  const cancelRename = useCallback(() => {
    setEditingTabId(null);
    setEditValue("");
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        commitRename();
      } else if (e.key === "Escape") {
        e.preventDefault();
        cancelRename();
      }
    },
    [commitRename, cancelRename]
  );

  return (
    <div className="flex items-center bg-slate-50/80 border-b border-slate-200 overflow-x-auto scrollbar-thin">
      {/* Tab list */}
      <div className="flex items-center min-w-0">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const isEditing = tab.id === editingTabId;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (!isEditing) onSelectTab(tab.id);
              }}
              onDoubleClick={(e) => {
                e.preventDefault();
                startEditing(tab);
              }}
              className={`
                group relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium
                border-r border-slate-200 whitespace-nowrap transition-colors
                ${
                  isActive
                    ? "bg-white text-blue-700"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                }
              `}
              title={isEditing ? undefined : tab.name}
            >
              {/* Code icon */}
              <svg
                className={`w-3.5 h-3.5 flex-shrink-0 ${
                  isActive ? "text-blue-600" : "text-slate-400"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>

              {isEditing ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={handleKeyDown}
                  onClick={(e) => e.stopPropagation()}
                  maxLength={MAX_TAB_NAME_LENGTH}
                  className="w-[120px] bg-white border border-blue-400 rounded px-1 py-0 text-sm font-medium text-slate-800 outline-none focus:ring-1 focus:ring-blue-400"
                  aria-label="Rename tab"
                />
              ) : (
                <span className="max-w-[120px] truncate">{tab.name}</span>
              )}

              {/* Close button */}
              {canClose && !isEditing && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation();
                      onCloseTab(tab.id);
                    }
                  }}
                  className={`
                    ml-1 p-0.5 rounded hover:bg-slate-200 transition-colors
                    ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
                  `}
                  aria-label={`Close ${tab.name}`}
                >
                  <svg
                    className="w-3 h-3 text-slate-400 hover:text-slate-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </span>
              )}

              {/* Active indicator line */}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600" />
              )}
            </button>
          );
        })}
      </div>

      {/* Add tab button */}
      <button
        onClick={onAddTab}
        className="flex-shrink-0 p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
        aria-label="New query tab"
        title="New query tab"
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
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>
    </div>
  );
}
