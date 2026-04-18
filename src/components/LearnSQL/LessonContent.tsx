import type { Lesson } from "../../types/learn";
import type { QueryResult } from "../../types/query";
import ChallengeBlock from "./ChallengeBlock";

interface LessonContentProps {
  lesson: Lesson;
  /** Latest query result from the editor (may be null). */
  lastResult: QueryResult | null;
  /** Callback to load sample data into DuckDB. */
  onLoadData: (setupSql: string[]) => Promise<void>;
  /** Callback to pre-fill the editor with SQL. */
  onSetEditorSql: (sql: string) => void;
  /** Called when the challenge is passed. */
  onChallengePassed: () => void;
  /** Navigate to the next lesson. */
  onNext: () => void;
  /** Navigate to the previous lesson. */
  onPrevious: () => void;
  /** Whether there is a next lesson. */
  hasNext: boolean;
  /** Whether there is a previous lesson. */
  hasPrevious: boolean;
  /** Whether this lesson is already completed. */
  isCompleted: boolean;
  /** Go back to overview. */
  onBack: () => void;
}

/**
 * LessonContent Component
 *
 * Renders the full lesson view: back button, title, content paragraphs,
 * challenge block, and prev/next navigation.
 */
export default function LessonContent({
  lesson,
  lastResult,
  onLoadData,
  onSetEditorSql,
  onChallengePassed,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
  isCompleted,
  onBack,
}: LessonContentProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Back to overview */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 self-start text-xs text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        All lessons
      </button>

      {/* Title + completion badge */}
      <div className="flex items-start gap-2">
        <h3 className="flex-1 text-sm font-bold text-slate-800 dark:text-slate-100">
          {lesson.title}
        </h3>
        {isCompleted && (
          <span className="flex-shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-500/15 dark:text-green-300">
            Completed
          </span>
        )}
      </div>

      {/* Lesson body */}
      <div className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 space-y-3">
        {lesson.content.split("\n\n").map((paragraph, i) => {
          const trimmed = paragraph.trim();
          // Detect indented code blocks (lines starting with 2+ spaces)
          if (trimmed.split("\n").every((line) => line.startsWith("  ") || line.trim() === "")) {
            return (
              <pre
                key={i}
                className="rounded-md bg-slate-100 p-2.5 font-mono text-[11px] text-slate-700 dark:bg-slate-800 dark:text-slate-300 overflow-x-auto"
              >
                {trimmed
                  .split("\n")
                  .map((l) => l.replace(/^ {2}/, ""))
                  .join("\n")}
              </pre>
            );
          }
          return (
            <p key={i} className="whitespace-pre-wrap">
              {trimmed}
            </p>
          );
        })}
      </div>

      {/* Challenge + data loader */}
      {(lesson.sampleData || lesson.challenge) && (
        <ChallengeBlock
          lesson={lesson}
          lastResult={lastResult}
          onLoadData={onLoadData}
          onSetEditorSql={onSetEditorSql}
          onChallengePassed={onChallengePassed}
        />
      )}

      {/* Prev / Next navigation */}
      <div className="flex items-center justify-between border-t border-slate-200 pt-3 dark:border-slate-700">
        <button
          onClick={onPrevious}
          disabled={!hasPrevious}
          className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Previous
        </button>
        <button
          onClick={onNext}
          disabled={!hasNext}
          className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed dark:text-slate-400 dark:hover:bg-slate-800"
        >
          Next
          <svg
            className="w-3.5 h-3.5"
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
        </button>
      </div>
    </div>
  );
}
