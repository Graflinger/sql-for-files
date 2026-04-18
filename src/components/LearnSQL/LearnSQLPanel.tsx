import { useCallback } from "react";

import { useLearnSQL } from "../../contexts/LearnSQLContext";
import { useDuckDBContext } from "../../contexts/DuckDBContext";
import { useEditorTabsContext } from "../../contexts/EditorTabsContext";
import { withDuckDBConnection } from "../../utils/duckdb";
import type { QueryResult } from "../../types/query";
import LessonNav from "./LessonNav";
import LessonContent from "./LessonContent";

interface LearnSQLPanelProps {
  /** Latest query result from the active editor tab. */
  lastResult: QueryResult | null;
}

/**
 * LearnSQLPanel Component
 *
 * Right-side slide-over panel for the Learn SQL track.
 * Shows either the lesson overview (chapter/lesson tree) or the
 * active lesson content with challenge and data loading.
 */
export default function LearnSQLPanel({ lastResult }: LearnSQLPanelProps) {
  const {
    panelOpen,
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
    completedCount,
    totalLessons,
  } = useLearnSQL();

  const { db, refreshTables } = useDuckDBContext();
  const { activeTabId, updateTabSql } = useEditorTabsContext();

  /** Execute setup SQL to load sample data for a lesson. */
  const handleLoadData = useCallback(
    async (setupSql: string[]) => {
      if (!db) return;
      await withDuckDBConnection(db, async (conn) => {
        for (const sql of setupSql) {
          await conn.query(sql);
        }
      });
      await refreshTables();
    },
    [db, refreshTables]
  );

  /** Pre-fill the active editor tab with SQL. */
  const handleSetEditorSql = useCallback(
    (sql: string) => {
      updateTabSql(activeTabId, sql);
    },
    [activeTabId, updateTabSql]
  );

  /** Mark the current lesson as completed. */
  const handleChallengePassed = useCallback(() => {
    if (currentLesson) {
      completeLesson(currentLesson.id);
    }
  }, [currentLesson, completeLesson]);

  if (!panelOpen) return null;

  return (
    <aside className="flex h-full flex-col border-l border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      {/* Panel header */}
      <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-200 px-3 py-2 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-blue-600 dark:text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Learn SQL
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            {completedCount}/{totalLessons}
          </span>
        </div>
        <button
          onClick={closePanel}
          className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          aria-label="Close Learn SQL panel"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Panel content — scrollable */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {currentLesson ? (
          <LessonContent
            lesson={currentLesson}
            lastResult={lastResult}
            onLoadData={handleLoadData}
            onSetEditorSql={handleSetEditorSql}
            onChallengePassed={handleChallengePassed}
            onNext={nextLesson}
            onPrevious={previousLesson}
            hasNext={hasNext}
            hasPrevious={hasPrevious}
            isCompleted={completedLessons.has(currentLesson.id)}
            onBack={showOverview}
          />
        ) : (
          <LessonNav onLessonSelect={selectLesson} />
        )}
      </div>
    </aside>
  );
}
