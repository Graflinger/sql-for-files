import type { ReactNode } from "react";

interface EditorPanelProps {
  children: ReactNode;
}

/**
 * EditorPanel Component
 *
 * Wrapper for the SQL editor area in the IDE layout.
 * Designed for future extensibility (e.g., query tabs).
 */
export default function EditorPanel({ children }: EditorPanelProps) {
  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white">
      {/* Header Bar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-200 bg-slate-50">
        <svg
          className="w-4 h-4 text-blue-600"
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
        <span className="text-sm font-semibold text-slate-700">SQL Query</span>
      </div>

      {/* Editor Content */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">{children}</div>
    </div>
  );
}
