import type { ReactNode } from "react";

interface SidebarProps {
  children: ReactNode;
  isCollapsed: boolean;
  onToggle: () => void;
}

/**
 * Sidebar Component
 *
 * Collapsible sidebar container for the IDE layout.
 * Expands to 280px, collapses to 48px (icon-only mode).
 */
export default function Sidebar({ children, isCollapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={`
        relative flex-shrink-0 bg-white border-r border-slate-200
        transition-all duration-200 ease-out
        ${isCollapsed ? "w-12" : "w-72"}
        flex flex-col
      `}
    >
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={`
          absolute -right-3 top-4 z-10
          w-6 h-6 rounded-full
          bg-white border border-slate-200 shadow-sm
          flex items-center justify-center
          hover:bg-slate-50 hover:border-blue-400
          transition-colors
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        `}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        title={isCollapsed ? "Expand sidebar (Cmd+B)" : "Collapse sidebar (Cmd+B)"}
      >
        <svg
          className={`w-4 h-4 text-slate-600 transition-transform duration-200 ${
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
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Sidebar Content */}
      <div
        className={`
          flex-1 overflow-y-auto overflow-x-hidden
          ${isCollapsed ? "hidden" : "block"}
        `}
      >
        {children}
      </div>

      {/* Collapsed Icons - Show when collapsed */}
      {isCollapsed && (
        <div className="flex flex-col items-center py-4 gap-4">
          {/* Add Data Icon */}
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            title="Add Data"
          >
            <svg
              className="w-5 h-5 text-slate-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </button>

          {/* Database Icon */}
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            title="Database"
          >
            <svg
              className="w-5 h-5 text-slate-600"
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
          </button>
        </div>
      )}
    </aside>
  );
}
