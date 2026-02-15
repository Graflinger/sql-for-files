import { useState, useEffect, useCallback, useRef } from "react";
import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import SidebarSection from "./SidebarSection";
import ResizeHandle from "./ResizeHandle";
import EditorPanel from "./EditorPanel";
import ResultsPanel from "./ResultsPanel";
import type { EditorTab } from "../../hooks/useEditorTabs";

interface IDELayoutProps {
  sidebarContent: {
    addData: ReactNode;
    tables: ReactNode;
    tableCount?: number;
    queryHistory: ReactNode;
    historyCount?: number;
  };
  editorContent: ReactNode;
  resultsContent: ReactNode;
  resultStats?: {
    rowCount?: number;
    executionTime?: number;
    hasError?: boolean;
  };
  editorTabs: {
    tabs: EditorTab[];
    activeTabId: string;
    onSelectTab: (id: string) => void;
    onAddTab: () => void;
    onCloseTab: (id: string) => void;
    onRenameTab: (id: string, name: string) => void;
  };
}

// localStorage keys
const STORAGE_KEYS = {
  SIDEBAR_COLLAPSED: "ide-sidebar-collapsed",
  RESULTS_HEIGHT: "ide-results-height",
  RESULTS_COLLAPSED: "ide-results-collapsed",
};

// Default values
const DEFAULTS = {
  RESULTS_HEIGHT: 300,
  MIN_RESULTS_HEIGHT: 100,
  MAX_RESULTS_HEIGHT: 600,
};

/**
 * IDELayout Component
 *
 * Main container shell for the IDE-like interface.
 * Manages:
 * - Collapsible sidebar (left)
 * - SQL editor (top-right)
 * - Resizable results panel (bottom-right)
 * - Layout state persistence to localStorage
 */
export default function IDELayout({
  sidebarContent,
  editorContent,
  resultsContent,
  resultStats,
  editorTabs,
}: IDELayoutProps) {
  // Layout state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED);
    return saved ? JSON.parse(saved) : false;
  });

  const [resultsHeight, setResultsHeight] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RESULTS_HEIGHT);
    return saved ? parseInt(saved, 10) : DEFAULTS.RESULTS_HEIGHT;
  });

  const [resultsCollapsed, setResultsCollapsed] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RESULTS_COLLAPSED);
    return saved ? JSON.parse(saved) : false;
  });

  // Mobile drawer state
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Mobile tab state: 'editor' or 'results'
  const [mobileActiveTab, setMobileActiveTab] = useState<"editor" | "results">(
    "editor"
  );

  // Track previous resultStats to detect new query completions
  const prevResultStatsRef = useRef(resultStats);

  // Auto-switch to Results tab on mobile when a query completes
  useEffect(() => {
    const prev = prevResultStatsRef.current;
    prevResultStatsRef.current = resultStats;

    // Switch to results if we got new results (rowCount changed or executionTime changed)
    if (
      resultStats &&
      (resultStats.rowCount !== prev?.rowCount ||
        resultStats.executionTime !== prev?.executionTime ||
        resultStats.hasError !== prev?.hasError)
    ) {
      setMobileActiveTab("results");
    }
  }, [resultStats]);

  // Persist layout changes to localStorage
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.SIDEBAR_COLLAPSED,
      JSON.stringify(sidebarCollapsed)
    );
  }, [sidebarCollapsed]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RESULTS_HEIGHT, String(resultsHeight));
  }, [resultsHeight]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.RESULTS_COLLAPSED,
      JSON.stringify(resultsCollapsed)
    );
  }, [resultsCollapsed]);

  // Handle resize of results panel
  const handleResultsResize = useCallback((delta: number) => {
    setResultsHeight((prev) => {
      const newHeight = prev - delta; // Subtract because dragging down should shrink results
      return Math.max(
        DEFAULTS.MIN_RESULTS_HEIGHT,
        Math.min(DEFAULTS.MAX_RESULTS_HEIGHT, newHeight)
      );
    });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + B: Toggle sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        setSidebarCollapsed((prev: boolean) => !prev);
      }
      // Cmd/Ctrl + J: Toggle results panel
      if ((e.metaKey || e.ctrlKey) && e.key === "j") {
        e.preventDefault();
        setResultsCollapsed((prev: boolean) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden md:flex h-[calc(100vh-8rem)] overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          <SidebarSection
            title="Add Data"
            icon={
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            }
            defaultExpanded={true}
          >
            <div className="text-xs text-slate-500 mb-2">
              Your data never leaves your device
            </div>
            {sidebarContent.addData}
          </SidebarSection>

          <SidebarSection
            title="Database"
            icon={
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            }
            defaultExpanded={true}
            badge={sidebarContent.tableCount}
          >
            {sidebarContent.tables}
          </SidebarSection>

          <SidebarSection
            title="Query History"
            icon={
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            defaultExpanded={false}
            badge={sidebarContent.historyCount}
          >
            {sidebarContent.queryHistory}
          </SidebarSection>
        </Sidebar>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
          {/* Editor Panel - Flex grow to fill available space */}
          <div className="flex-1 min-h-0 flex flex-col">
            <EditorPanel
              tabs={editorTabs.tabs}
              activeTabId={editorTabs.activeTabId}
              onSelectTab={editorTabs.onSelectTab}
              onAddTab={editorTabs.onAddTab}
              onCloseTab={editorTabs.onCloseTab}
              onRenameTab={editorTabs.onRenameTab}
            >
              {editorContent}
            </EditorPanel>
          </div>

          {/* Resize Handle */}
          {!resultsCollapsed && (
            <ResizeHandle
              orientation="horizontal"
              onResize={handleResultsResize}
            />
          )}

          {/* Results Panel - Fixed height or collapsed */}
          <div
            style={{
              height: resultsCollapsed ? "auto" : `${resultsHeight}px`,
            }}
            className={resultsCollapsed ? "" : "flex-shrink-0"}
          >
            <ResultsPanel
              isCollapsed={resultsCollapsed}
              onToggle={() => setResultsCollapsed(!resultsCollapsed)}
              rowCount={resultStats?.rowCount}
              executionTime={resultStats?.executionTime}
              hasError={resultStats?.hasError}
            >
              {resultsContent}
            </ResultsPanel>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col h-[calc(100vh-8rem)]">
        {/* Mobile Toolbar: sidebar toggle + tab switcher */}
        <div className="flex items-center bg-white border-b border-slate-200 flex-shrink-0">
          {/* Sidebar Toggle */}
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="flex items-center justify-center w-11 h-11 text-slate-600 hover:bg-slate-100 transition-colors border-r border-slate-200"
            aria-label="Open sidebar"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Tab Switcher */}
          <div className="flex flex-1 min-w-0">
            <button
              onClick={() => setMobileActiveTab("editor")}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold transition-colors relative ${
                mobileActiveTab === "editor"
                  ? "text-blue-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
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
                  d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Editor
              {/* Active indicator */}
              {mobileActiveTab === "editor" && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setMobileActiveTab("results")}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold transition-colors relative ${
                mobileActiveTab === "results"
                  ? "text-blue-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <svg
                className={`w-4 h-4 ${
                  resultStats?.hasError ? "text-red-500" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
              Results
              {/* Row count badge */}
              {resultStats?.rowCount !== undefined && (
                <span
                  className={`ml-1 px-1.5 py-0.5 text-xs font-medium rounded-full ${
                    resultStats.hasError
                      ? "bg-red-100 text-red-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {resultStats.hasError
                    ? "!"
                    : resultStats.rowCount.toLocaleString()}
                </span>
              )}
              {/* Active indicator */}
              {mobileActiveTab === "results" && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Overlay */}
        {mobileDrawerOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setMobileDrawerOpen(false)}
          >
            {/* Drawer Content */}
            <div
              className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <span className="font-semibold text-slate-800">Menu</span>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
                  aria-label="Close menu"
                >
                  <svg
                    className="w-6 h-6 text-slate-600"
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
                </button>
              </div>

              {/* Sidebar Content */}
              <SidebarSection
                title="Add Data"
                icon={
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                }
              >
                <div className="text-xs text-slate-500 mb-2">
                  Your data never leaves your device
                </div>
                {sidebarContent.addData}
              </SidebarSection>

              <SidebarSection
                title="Database"
                icon={
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                }
                badge={sidebarContent.tableCount}
              >
                {sidebarContent.tables}
              </SidebarSection>

              <SidebarSection
                title="Query History"
                icon={
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
                defaultExpanded={false}
                badge={sidebarContent.historyCount}
              >
                {sidebarContent.queryHistory}
              </SidebarSection>
            </div>
          </div>
        )}

        {/* Mobile Main Content - Tab-based full-height */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Editor Tab */}
          {mobileActiveTab === "editor" && (
            <div className="flex-1 min-h-0 flex flex-col">
              <EditorPanel
                tabs={editorTabs.tabs}
                activeTabId={editorTabs.activeTabId}
                onSelectTab={editorTabs.onSelectTab}
                onAddTab={editorTabs.onAddTab}
                onCloseTab={editorTabs.onCloseTab}
                onRenameTab={editorTabs.onRenameTab}
              >
                {editorContent}
              </EditorPanel>
            </div>
          )}

          {/* Results Tab */}
          {mobileActiveTab === "results" && (
            <div className="flex-1 min-h-0 overflow-auto bg-white">
              {resultsContent}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
