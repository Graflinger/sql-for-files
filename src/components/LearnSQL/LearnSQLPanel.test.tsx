import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import type { Lesson } from "../../types/learn";

const mockUseLearnSQL = vi.fn();
const mockUseDuckDBContext = vi.fn();
const mockUseEditorTabsContext = vi.fn();
const mockUseNotifications = vi.fn();

vi.mock("../../contexts/LearnSQLContext", () => ({
  useLearnSQL: () => mockUseLearnSQL(),
}));

vi.mock("../../contexts/DuckDBContext", () => ({
  useDuckDBContext: () => mockUseDuckDBContext(),
}));

vi.mock("../../contexts/EditorTabsContext", () => ({
  useEditorTabsContext: () => mockUseEditorTabsContext(),
}));

vi.mock("../../contexts/NotificationContext", () => ({
  useNotifications: () => mockUseNotifications(),
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
    const addNotification = vi.fn();

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
      refreshTables: vi.fn(),
    });

    mockUseEditorTabsContext.mockReturnValue({
      activeTabId: "tab-1",
      addTab,
      updateTabSql: vi.fn(),
    });

    mockUseNotifications.mockReturnValue({
      addNotification,
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
    expect(addNotification).toHaveBeenCalledWith({
      type: "info",
      title: "Opened solution for Your First Query",
    });
  });
});
