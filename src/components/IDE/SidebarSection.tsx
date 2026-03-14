import { useState } from "react";
import type { ReactNode } from "react";

interface SidebarSectionProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  defaultExpanded?: boolean;
  badge?: string | number;
}

/**
 * SidebarSection Component
 *
 * An accordion-style section for the sidebar. Provides a header with
 * icon and title, and collapsible content area.
 */
export default function SidebarSection({
  title,
  icon,
  children,
  defaultExpanded = true,
  badge,
}: SidebarSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border-b border-slate-200 last:border-b-0 dark:border-slate-800">
      {/* Section Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="group flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/80"
        aria-expanded={isExpanded}
      >
        {/* Expand/Collapse Chevron */}
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 dark:text-slate-500 ${
            isExpanded ? "rotate-90" : ""
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

        {/* Icon */}
        <span className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400">{icon}</span>

        {/* Title */}
        <span className="flex-1 text-sm font-semibold text-slate-700 group-hover:text-slate-900 dark:text-slate-200 dark:group-hover:text-white">
          {title}
        </span>

        {/* Optional Badge */}
        {badge !== undefined && (
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {badge}
          </span>
        )}
      </button>

      {/* Collapsible Content */}
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-3 pb-3">{children}</div>
      </div>
    </div>
  );
}
