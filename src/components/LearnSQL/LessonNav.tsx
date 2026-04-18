import { useLearnSQL } from "../../contexts/LearnSQLContext";

interface LessonNavProps {
  onLessonSelect: (lessonId: string) => void;
}

/**
 * LessonNav Component
 *
 * Chapter/lesson tree with progress indicators.
 * Shows a collapsible tree: chapters as groups, lessons as items.
 */
export default function LessonNav({ onLessonSelect }: LessonNavProps) {
  const { chapters, completedLessons, currentLesson, completedCount, totalLessons, resetProgress } =
    useLearnSQL();

  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div className="flex flex-col gap-1">
      {/* Overall progress */}
      <div className="mb-3 px-1">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
          <span>
            {completedCount} / {totalLessons} completed
          </span>
          <span>{progressPercent}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className="h-1.5 rounded-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Chapter/lesson tree */}
      {chapters.map((chapter, chapterIdx) => {
        const chapterCompleted = chapter.lessons.every((l) =>
          completedLessons.has(l.id)
        );
        const chapterLessonsDone = chapter.lessons.filter((l) =>
          completedLessons.has(l.id)
        ).length;

        return (
          <div key={chapter.id} className="mb-2">
            {/* Chapter header */}
            <div className="flex items-center gap-2 px-1 py-1">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800">
                {String(chapterIdx + 1).padStart(2, "0")}
              </span>
              <span className="flex-1 text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                {chapter.title}
              </span>
              {chapterCompleted ? (
                <svg
                  className="w-4 h-4 flex-shrink-0 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : (
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  {chapterLessonsDone}/{chapter.lessons.length}
                </span>
              )}
            </div>

            {/* Lessons */}
            <div className="ml-3 border-l-2 border-slate-200 dark:border-slate-700 pl-3">
              {chapter.lessons.map((lesson) => {
                const isCompleted = completedLessons.has(lesson.id);
                const isActive = currentLesson?.id === lesson.id;

                return (
                  <button
                    key={lesson.id}
                    onClick={() => onLessonSelect(lesson.id)}
                    className={`
                      flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors
                      ${
                        isActive
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      }
                    `}
                  >
                    {/* Status indicator */}
                    {isCompleted ? (
                      <svg
                        className="w-3.5 h-3.5 flex-shrink-0 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <span
                        className={`flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full border ${
                          isActive
                            ? "border-blue-400 bg-blue-100 dark:border-blue-500 dark:bg-blue-500/20"
                            : "border-slate-300 dark:border-slate-600"
                        }`}
                      />
                    )}
                    <span className="truncate">{lesson.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Reset progress */}
      {completedCount > 0 && (
        <button
          onClick={resetProgress}
          className="mt-2 px-2 py-1 text-[10px] text-slate-400 transition-colors hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400"
        >
          Reset progress
        </button>
      )}
    </div>
  );
}
