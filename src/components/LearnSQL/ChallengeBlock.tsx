import { useState } from "react";

import type { Lesson } from "../../types/learn";
import type { QueryResult } from "../../types/query";
import type { ValidationResult } from "../../types/learn";

interface ChallengeBlockProps {
  lesson: Lesson;
  /** Latest query result from the editor (may be null). */
  lastResult: QueryResult | null;
  /** Callback to load sample data into DuckDB. */
  onLoadData: (setupSql: string[]) => Promise<void>;
  /** Callback to pre-fill the editor with SQL. */
  onSetEditorSql: (sql: string) => void;
  /** Callback to open the solution SQL in a new editor tab. */
  onShowSolution: (lessonTitle: string, sql: string) => void;
  /** Callback when the challenge is passed. */
  onChallengePassed: () => void;
}

/**
 * ChallengeBlock Component
 *
 * Renders the sample-data loader, challenge prompt, hint toggle,
 * and "Check Answer" validation for a lesson.
 */
export default function ChallengeBlock({
  lesson,
  lastResult,
  onLoadData,
  onSetEditorSql,
  onShowSolution,
  onChallengePassed,
}: ChallengeBlockProps) {
  const [loadingData, setLoadingData] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  const { sampleData, challenge } = lesson;

  const handleLoadData = async () => {
    if (!sampleData) return;
    setLoadingData(true);
    try {
      await onLoadData(sampleData.setupSql);
      setDataLoaded(true);
    } finally {
      setLoadingData(false);
    }
  };

  const handleStartChallenge = () => {
    if (challenge?.initialSql) {
      onSetEditorSql(challenge.initialSql);
    }
    setValidation(null);
  };

  const handleShowSolution = () => {
    if (!challenge?.solutionSql) return;
    onShowSolution(lesson.title, challenge.solutionSql);
    setValidation(null);
  };

  const handleCheckAnswer = () => {
    if (!challenge || !lastResult) {
      setValidation({
        passed: false,
        message: "Run a query first, then check your answer.",
      });
      return;
    }
    const result = challenge.validate(lastResult);
    setValidation(result);
    if (result.passed) {
      onChallengePassed();
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Sample Data Loader */}
      {sampleData && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <svg
                className="w-4 h-4 flex-shrink-0 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                />
              </svg>
              <span>{sampleData.label}</span>
            </div>
            <button
              onClick={handleLoadData}
              disabled={loadingData}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                dataLoaded
                  ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300"
                  : "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              } disabled:opacity-50`}
            >
              {loadingData ? "Loading..." : dataLoaded ? "Loaded" : "Load Data"}
            </button>
          </div>
        </div>
      )}

      {/* Challenge */}
      {challenge && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-700/50 dark:bg-amber-900/20">
          <div className="flex items-start gap-2 mb-2">
            <svg
              className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600 dark:text-amber-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <div>
              <h4 className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-1">
                Challenge
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-300/90">
                {challenge.prompt}
              </p>
            </div>
          </div>

          {/* Hint */}
          {challenge.hint && (
            <div className="mb-2">
              {showHint ? (
                <p className="text-[11px] text-amber-600 dark:text-amber-400/80 bg-amber-100 dark:bg-amber-800/30 rounded px-2 py-1 font-mono">
                  {challenge.hint}
                </p>
              ) : (
                <button
                  onClick={() => setShowHint(true)}
                  className="text-[11px] text-amber-500 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
                >
                  Show hint
                </button>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {challenge.initialSql && (
              <button
                onClick={handleStartChallenge}
                className="rounded-md border border-amber-300 bg-white px-3 py-1 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-50 dark:border-amber-600 dark:bg-slate-800 dark:text-amber-300 dark:hover:bg-slate-700"
              >
                Start in Editor
              </button>
            )}
            {challenge.solutionSql && (
              <button
                onClick={handleShowSolution}
                className="rounded-md border border-amber-300 bg-white px-3 py-1 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-50 dark:border-amber-600 dark:bg-slate-800 dark:text-amber-300 dark:hover:bg-slate-700"
              >
                Show Solution
              </button>
            )}
            <button
              onClick={handleCheckAnswer}
              className="rounded-md bg-amber-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600"
            >
              Check Answer
            </button>
          </div>

          {/* Validation result */}
          {validation && (
            <div
              className={`mt-2 rounded-md px-3 py-2 text-xs ${
                validation.passed
                  ? "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300"
                  : "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300"
              }`}
            >
              <div className="flex items-start gap-1.5">
                {validation.passed ? (
                  <svg
                    className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
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
                  <svg
                    className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
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
                )}
                <span>{validation.message}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
