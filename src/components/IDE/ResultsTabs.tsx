import { useState } from "react";
import type { ReactNode } from "react";

import ClassificationResults from "../Classification/ClassificationResults";
import VisualisationPanel from "../Visualisation/VisualisationPanel";
import type { QueryResult } from "../../types/query";

export type ResultTabId = "data" | "visualisation" | "classification";

interface ResultTab {
  id: ResultTabId;
  label: string;
  icon: ReactNode;
}

const RESULT_TABS: ResultTab[] = [
  {
    id: "data",
    label: "Data",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    id: "visualisation",
    label: "Visualisation",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
  {
    id: "classification",
    label: "Classification",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
        />
      </svg>
    ),
  },
];

interface ResultsTabsProps {
  activeTab: ResultTabId;
  onTabChange: (tab: ResultTabId) => void;
}

/**
 * ResultsTabs Component
 *
 * Tab bar for the results pane: Data, Visualisation, Classification.
 */
function ResultsTabBar({ activeTab, onTabChange }: ResultsTabsProps) {
  return (
    <div className="flex items-center border-b border-slate-200 bg-white px-2">
      {RESULT_TABS.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative flex items-center gap-1.5 px-3 py-2 text-xs font-medium
              transition-colors whitespace-nowrap
              ${
                isActive
                  ? "text-blue-700"
                  : "text-slate-500 hover:text-slate-700"
              }
            `}
          >
            <span className={isActive ? "text-blue-600" : "text-slate-400"}>
              {tab.icon}
            </span>
            {tab.label}
            {isActive && (
              <span className="absolute bottom-0 left-1 right-1 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}

interface ResultsTabsContainerProps {
  /** Content for the Data tab (QueryResults component) */
  dataContent: ReactNode;
  /** Query result for the Classification tab */
  result: QueryResult | null;
}

/**
 * ResultsTabsContainer
 *
 * Manages result tab state and renders the correct tab content.
 * - Data tab: renders the passed dataContent (QueryResults)
 * - Visualisation: interactive chart builder with ECharts
 * - Classification: per-column statistics
 */
export default function ResultsTabsContainer({
  dataContent,
  result,
}: ResultsTabsContainerProps) {
  const [activeTab, setActiveTab] = useState<ResultTabId>("data");

  return (
    <div className="flex flex-col h-full">
      <ResultsTabBar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 min-h-0 overflow-auto">
        {activeTab === "data" && dataContent}

        {activeTab === "visualisation" && (
          <VisualisationPanel result={result} />
        )}

        {activeTab === "classification" && (
          <ClassificationResults result={result} />
        )}
      </div>
    </div>
  );
}
