import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";

import SqlEditorPage from "./SQLEditor";
import { ThemeProvider } from "../contexts/ThemeContext";
import { NotificationProvider } from "../contexts/NotificationContext";
import { DuckDBProvider } from "../contexts/DuckDBContext";
import { EditorTabsProvider } from "../contexts/EditorTabsContext";
import { LearnSQLProvider } from "../contexts/LearnSQLContext";

vi.mock("../contexts/DuckDBContext", () => ({
  DuckDBProvider: ({ children }: { children: ReactNode }) => children,
  useDuckDBContext: () => ({
    db: null,
    tables: [],
    refreshTables: vi.fn(),
    restoredMessage: null,
    clearRestoredMessage: vi.fn(),
  }),
}));

vi.mock("../contexts/EditorTabsContext", () => ({
  EditorTabsProvider: ({ children }: { children: ReactNode }) => children,
  useEditorTabsContext: () => ({
    tabs: [{ id: "tab-1", name: "Query 1", sql: "", result: null, error: null }],
    activeTabId: "tab-1",
    activeTab: { id: "tab-1", name: "Query 1", sql: "", result: null, error: null },
    setActiveTab: vi.fn(),
    addTab: vi.fn(() => "tab-2"),
    closeTab: vi.fn(),
    updateTabSql: vi.fn(),
    updateTabResult: vi.fn(),
    renameTab: vi.fn(),
  }),
}));

vi.mock("../hooks/useQueryExecution", () => ({
  useQueryExecution: () => ({
    executeQuery: vi.fn(),
    executing: false,
    result: null,
    error: null,
  }),
}));

vi.mock("../hooks/useQueryHistory", () => ({
  useQueryHistory: () => ({
    addQuery: vi.fn(),
    history: [],
    loading: false,
    deleteQuery: vi.fn(),
    clearHistory: vi.fn(),
    getRelativeTime: vi.fn(() => "just now"),
  }),
}));

vi.mock("../components/FileAdder/FileAdder", () => ({
  default: () => <div>File Adder</div>,
}));

vi.mock("../components/SQLEditor/SQLEditor", () => ({
  default: () => <div>SQL Editor</div>,
}));

vi.mock("../components/DatabaseManager/TableList", () => ({
  default: () => <div>Table List</div>,
}));

vi.mock("../components/QueryResults/QueryResults", () => ({
  default: () => <div>Query Results</div>,
}));

vi.mock("../components/QueryHistory/QueryHistorySidebar", () => ({
  default: () => <div>Query History</div>,
}));

vi.mock("../components/IDE", () => ({
  IDELayout: ({ rightPanel }: { rightPanel?: ReactNode }) => <div>{rightPanel}</div>,
}));

function renderEditor(initialRoute: string) {
  return render(
    <ThemeProvider>
      <NotificationProvider>
        <DuckDBProvider>
          <EditorTabsProvider>
            <LearnSQLProvider>
              <MemoryRouter initialEntries={[initialRoute]}>
                <Routes>
                  <Route path="/editor" element={<SqlEditorPage />} />
                  <Route path="/editor/:chapterSlug/:lessonSlug" element={<SqlEditorPage />} />
                </Routes>
              </MemoryRouter>
            </LearnSQLProvider>
          </EditorTabsProvider>
        </DuckDBProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

describe("SqlEditorPage lesson routes", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("opens the requested lesson from the URL", async () => {
    renderEditor("/editor/chapter1/03");

    await waitFor(() => {
      expect(screen.getByText("01.03 Sorting Results")).toBeInTheDocument();
    });
  });

  it("uses the lesson route as canonical URL", async () => {
    renderEditor("/editor/chapter1/03");

    await waitFor(() => {
      const canonicalLink = document.querySelector('link[rel="canonical"]');
      expect(canonicalLink).toHaveAttribute("href", "https://sqlforfiles.app/editor/chapter1/03");
    });
  });
});
