import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";

import type { Lesson } from "../types/learn";
import { chapters, allLessons, totalLessonCount } from "../data/lessons";

const STORAGE_KEY = "learn-sql-progress";
const PANEL_STORAGE_KEY = "learn-sql-panel-open";

interface LearnSQLContextValue {
  /** Whether the learn panel is visible. */
  panelOpen: boolean;
  /** Toggle the learn panel open/closed. */
  togglePanel: () => void;
  /** Open the panel. */
  openPanel: () => void;
  /** Close the panel. */
  closePanel: () => void;

  /** The currently selected lesson (null = show overview). */
  currentLesson: Lesson | null;
  /** Navigate to a specific lesson by ID. */
  selectLesson: (lessonId: string) => void;
  /** Go back to the chapter/lesson overview. */
  showOverview: () => void;
  /** Navigate to the next lesson (if any). */
  nextLesson: () => void;
  /** Navigate to the previous lesson (if any). */
  previousLesson: () => void;
  /** Whether there is a next lesson from the current one. */
  hasNext: boolean;
  /** Whether there is a previous lesson from the current one. */
  hasPrevious: boolean;

  /** Set of completed lesson IDs. */
  completedLessons: Set<string>;
  /** Mark a lesson as completed. */
  completeLesson: (lessonId: string) => void;
  /** Reset all progress. */
  resetProgress: () => void;
  /** Total number of lessons. */
  totalLessons: number;
  /** Number of completed lessons. */
  completedCount: number;

  /** All chapters (for rendering navigation). */
  chapters: typeof chapters;
}

const LearnSQLContext = createContext<LearnSQLContextValue | null>(null);

/** Load completed lesson IDs from localStorage. */
function loadProgress(): Set<string> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as string[];
      return new Set(parsed);
    }
  } catch {
    // Ignore corrupt data
  }
  return new Set();
}

/** Persist completed lesson IDs to localStorage. */
function saveProgress(completed: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]));
}

/** Load panel open/closed state from localStorage. */
function loadPanelState(): boolean {
  try {
    const saved = localStorage.getItem(PANEL_STORAGE_KEY);
    if (saved !== null) {
      return JSON.parse(saved);
    }
  } catch {
    // Ignore corrupt data
  }
  return false;
}

export function LearnSQLProvider({ children }: { children: ReactNode }) {
  const [panelOpen, setPanelOpen] = useState(loadPanelState);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(loadProgress);

  const currentLesson = currentLessonId
    ? allLessons.find((l) => l.id === currentLessonId) ?? null
    : null;

  // Compute next/previous availability
  const currentIndex = currentLessonId
    ? allLessons.findIndex((l) => l.id === currentLessonId)
    : -1;
  const hasNext = currentIndex >= 0 && currentIndex < allLessons.length - 1;
  const hasPrevious = currentIndex > 0;

  const togglePanel = useCallback(() => {
    setPanelOpen((prev) => {
      const next = !prev;
      localStorage.setItem(PANEL_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const openPanel = useCallback(() => {
    setPanelOpen(true);
    localStorage.setItem(PANEL_STORAGE_KEY, "true");
  }, []);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
    localStorage.setItem(PANEL_STORAGE_KEY, "false");
  }, []);

  const selectLesson = useCallback((lessonId: string) => {
    setCurrentLessonId(lessonId);
  }, []);

  const showOverview = useCallback(() => {
    setCurrentLessonId(null);
  }, []);

  const nextLesson = useCallback(() => {
    if (currentIndex >= 0 && currentIndex < allLessons.length - 1) {
      setCurrentLessonId(allLessons[currentIndex + 1].id);
    }
  }, [currentIndex]);

  const previousLesson = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentLessonId(allLessons[currentIndex - 1].id);
    }
  }, [currentIndex]);

  const completeLesson = useCallback((lessonId: string) => {
    setCompletedLessons((prev) => {
      const next = new Set(prev);
      next.add(lessonId);
      saveProgress(next);
      return next;
    });
  }, []);

  const resetProgress = useCallback(() => {
    setCompletedLessons(new Set());
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <LearnSQLContext.Provider
      value={{
        panelOpen,
        togglePanel,
        openPanel,
        closePanel,
        currentLesson,
        selectLesson,
        showOverview,
        nextLesson,
        previousLesson,
        hasNext,
        hasPrevious,
        completedLessons,
        completeLesson,
        resetProgress,
        totalLessons: totalLessonCount,
        completedCount: completedLessons.size,
        chapters,
      }}
    >
      {children}
    </LearnSQLContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLearnSQL(): LearnSQLContextValue {
  const context = useContext(LearnSQLContext);
  if (!context) {
    throw new Error("useLearnSQL must be used within a LearnSQLProvider");
  }
  return context;
}
