import { useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import SidebarSection from "./SidebarSection";
import ResizeHandle from "./ResizeHandle";
import EditorPanel from "./EditorPanel";
import ResultsPanel from "./ResultsPanel";

interface IDELayoutProps {
  sidebarContent: {
    upload: ReactNode;
    tables: ReactNode;
    tableCount?: number;
  };
  editorContent: ReactNode;
  resultsContent: ReactNode;
  resultStats?: {
    rowCount?: number;
    executionTime?: number;
    hasError?: boolean;
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
            title="Upload Data"
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
            {sidebarContent.upload}
          </SidebarSection>

          <SidebarSection
            title="Tables"
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
        </Sidebar>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
          {/* Editor Panel - Flex grow to fill available space */}
          <div className="flex-1 min-h-0 flex flex-col">
            <EditorPanel>{editorContent}</EditorPanel>
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
        {/* Mobile Toggle Button */}
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="fixed bottom-4 left-4 z-40 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
          aria-label="Open sidebar"
        >
          <svg
            className="w-6 h-6"
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
                title="Upload Data"
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
                {sidebarContent.upload}
              </SidebarSection>

              <SidebarSection
                title="Tables"
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
            </div>
          </div>
        )}

        {/* Mobile Main Content - Stacked vertically */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Editor */}
          <div className="flex-1 min-h-0">
            <EditorPanel>{editorContent}</EditorPanel>
          </div>

          {/* Results - Tap to toggle on mobile */}
          <div
            className={`${
              resultsCollapsed ? "" : "flex-1 min-h-[200px]"
            } border-t border-slate-200`}
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
    </>
  );
}
