import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import type { Lesson } from "../../types/learn";

const mockUseLearnSQL = vi.fn();
const mockUseDuckDBContext = vi.fn();
const mockUseEditorTabsContext = vi.fn();

vi.mock("../../contexts/LearnSQLContext", () => ({
  useLearnSQL: () => mockUseLearnSQL(),
}));

vi.mock("../../contexts/DuckDBContext", () => ({
  useDuckDBContext: () => mockUseDuckDBContext(),
}));

vi.mock("../../contexts/EditorTabsContext", () => ({
  useEditorTabsContext: () => mockUseEditorTabsContext(),
}));

import LearnSQLPanel from "./LearnSQLPanel";

const lessonWithSolution: Lesson = {
  id: "intro-first-query",
  title: "Your First Query",
  content: "Practice writing your first SQL query.",
  sampleData: {
    label: "employees table",
    setupSql: ["SELECT 1"],
    tableNames: ["employees"],
  },
  challenge: {
    prompt: "Select all rows and columns from the employees table.",
    initialSql: "-- Write your query here\n",
    solutionSql: "SELECT *\nFROM employees;",
    validate: () => ({
      passed: true,
      message: "ok",
    }),
  },
};

describe("LearnSQLPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("opens the lesson solution in a new editor tab", () => {
    const addTab = vi.fn();

    mockUseLearnSQL.mockReturnValue({
      panelOpen: true,
      closePanel: vi.fn(),
      currentLesson: lessonWithSolution,
      openLesson: vi.fn(),
      selectLesson: vi.fn(),
      showOverview: vi.fn(),
      hasNext: false,
      hasPrevious: false,
      completedLessons: new Set<string>(),
      completeLesson: vi.fn(),
      completedCount: 0,
      totalLessons: 1,
      currentLessonPath: "/editor/chapter1/01",
    });

    mockUseDuckDBContext.mockReturnValue({
      db: null,
      loading: false,
      error: null,
      refreshTables: vi.fn(),
    });

    mockUseEditorTabsContext.mockReturnValue({
      activeTabId: "tab-1",
      addTab,
      updateTabSql: vi.fn(),
    });

    render(
      <MemoryRouter>
        <LearnSQLPanel lastResult={null} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "Show Solution" }));

    expect(addTab).toHaveBeenCalledWith({
      name: "Solution: Your First Query",
      sql: "SELECT *\nFROM employees;",
    });
  });

  it("keeps sample data unloaded while DuckDB is still initializing", () => {
    mockUseLearnSQL.mockReturnValue({
      panelOpen: true,
      closePanel: vi.fn(),
      currentLesson: lessonWithSolution,
      openLesson: vi.fn(),
      selectLesson: vi.fn(),
      showOverview: vi.fn(),
      hasNext: false,
      hasPrevious: false,
      completedLessons: new Set<string>(),
      completeLesson: vi.fn(),
      completedCount: 0,
      totalLessons: 1,
      currentLessonPath: "/editor/chapter1/01",
    });

    mockUseDuckDBContext.mockReturnValue({
      db: null,
      loading: true,
      error: null,
      refreshTables: vi.fn(),
    });

    mockUseEditorTabsContext.mockReturnValue({
      activeTabId: "tab-1",
      addTab: vi.fn(),
      updateTabSql: vi.fn(),
    });

    render(
      <MemoryRouter>
        <LearnSQLPanel lastResult={null} />
      </MemoryRouter>
    );

    const button = screen.getByRole("button", { name: "Preparing DB" });

    expect(button).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Loaded" })).not.toBeInTheDocument();
  });

  it("marks sample data as loaded only after setup SQL runs", async () => {
    const query = vi.fn().mockResolvedValue(undefined);
    const close = vi.fn().mockResolvedValue(undefined);
    const db = {
      connect: vi.fn().mockResolvedValue({ query, close }),
    };
    const refreshTables = vi.fn().mockResolvedValue(undefined);

    mockUseLearnSQL.mockReturnValue({
      panelOpen: true,
      closePanel: vi.fn(),
      currentLesson: lessonWithSolution,
      openLesson: vi.fn(),
      selectLesson: vi.fn(),
      showOverview: vi.fn(),
      hasNext: false,
      hasPrevious: false,
      completedLessons: new Set<string>(),
      completeLesson: vi.fn(),
      completedCount: 0,
      totalLessons: 1,
      currentLessonPath: "/editor/chapter1/01",
    });

    mockUseDuckDBContext.mockReturnValue({
      db,
      loading: false,
      error: null,
      refreshTables,
    });

    mockUseEditorTabsContext.mockReturnValue({
      activeTabId: "tab-1",
      addTab: vi.fn(),
      updateTabSql: vi.fn(),
    });

    render(
      <MemoryRouter>
        <LearnSQLPanel lastResult={null} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "Load Data" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Loaded" })).toBeInTheDocument();
    });
    expect(query).toHaveBeenCalledWith("SELECT 1");
    expect(close).toHaveBeenCalled();
    expect(refreshTables).toHaveBeenCalled();
  });

  it("shows an error and does not mark sample data loaded when setup SQL fails", async () => {
    const query = vi.fn().mockRejectedValue(new Error("setup failed"));
    const close = vi.fn().mockResolvedValue(undefined);
    const db = {
      connect: vi.fn().mockResolvedValue({ query, close }),
    };
    const refreshTables = vi.fn().mockResolvedValue(undefined);

    mockUseLearnSQL.mockReturnValue({
      panelOpen: true,
      closePanel: vi.fn(),
      currentLesson: lessonWithSolution,
      openLesson: vi.fn(),
      selectLesson: vi.fn(),
      showOverview: vi.fn(),
      hasNext: false,
      hasPrevious: false,
      completedLessons: new Set<string>(),
      completeLesson: vi.fn(),
      completedCount: 0,
      totalLessons: 1,
      currentLessonPath: "/editor/chapter1/01",
    });

    mockUseDuckDBContext.mockReturnValue({
      db,
      loading: false,
      error: null,
      refreshTables,
    });

    mockUseEditorTabsContext.mockReturnValue({
      activeTabId: "tab-1",
      addTab: vi.fn(),
      updateTabSql: vi.fn(),
    });

    render(
      <MemoryRouter>
        <LearnSQLPanel lastResult={null} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "Load Data" }));

    expect(await screen.findByText("setup failed")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Load Data" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Loaded" })).not.toBeInTheDocument();
    expect(refreshTables).not.toHaveBeenCalled();
    expect(close).toHaveBeenCalled();
  });
});
