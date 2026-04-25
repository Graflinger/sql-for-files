import type { Lesson } from "../../types/learn";
import type { QueryResult } from "../../types/query";
import type { SqlTokenType } from "../../utils/sqlHighlight";

import { tokenizeSql } from "../../utils/sqlHighlight";
import ChallengeBlock from "./ChallengeBlock";

// ---------------------------------------------------------------------------
// Content parsing helpers
// ---------------------------------------------------------------------------

interface CodeBlock {
  type: "code";
  code: string;
  highlighted: boolean;
}

interface TextBlock {
  type: "text";
  text: string;
}

type ContentBlock = CodeBlock | TextBlock;

/** Split a plain-text section (no fences) into paragraphs and indented code blocks. */
function splitTextSection(text: string): ContentBlock[] {
  return text
    .split("\n\n")
    .filter((p) => p.trim())
    .map((paragraph) => {
      const trimmed = paragraph.trim();
      // Backward-compat: detect indented code blocks (every line starts with 2+ spaces)
      if (
        trimmed
          .split("\n")
          .every((line) => line.startsWith("  ") || line.trim() === "")
      ) {
        return {
          type: "code" as const,
          code: trimmed
            .split("\n")
            .map((l) => l.replace(/^ {2}/, ""))
            .join("\n"),
          highlighted: false,
        };
      }
      return { type: "text" as const, text: trimmed };
    });
}

/**
 * Parse lesson content into an array of code and text blocks.
 *
 * Supports:
 * - Fenced code blocks: ```sql ... ``` (highlighted) or ``` ... ``` (plain)
 * - Indented code blocks: lines starting with 2+ spaces (plain, backward compat)
 * - Regular text paragraphs (separated by blank lines)
 */
function parseContent(content: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const fenceRegex = /```(\w*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = fenceRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      blocks.push(...splitTextSection(content.slice(lastIndex, match.index)));
    }
    blocks.push({
      type: "code",
      code: match[2].trimEnd(),
      highlighted: match[1].toLowerCase() === "sql",
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    blocks.push(...splitTextSection(content.slice(lastIndex)));
  }

  return blocks;
}

// ---------------------------------------------------------------------------
// Rendering helpers
// ---------------------------------------------------------------------------

/** Map a token type to Tailwind colour classes. */
function tokenClassName(type: SqlTokenType): string {
  switch (type) {
    case "keyword":
      return "text-blue-600 dark:text-blue-400 font-semibold";
    case "function":
      return "text-violet-600 dark:text-violet-400";
    case "string":
      return "text-emerald-600 dark:text-emerald-400";
    case "number":
      return "text-amber-600 dark:text-amber-400";
    case "comment":
      return "text-slate-400 dark:text-slate-500 italic";
    case "operator":
      return "text-rose-600 dark:text-rose-400";
    default:
      return "";
  }
}

/** Render a SQL string with syntax-highlighted spans. */
function renderSqlHighlighted(code: string) {
  return tokenizeSql(code).map((token, i) => {
    const cn = tokenClassName(token.type);
    return cn ? (
      <span key={i} className={cn}>
        {token.text}
      </span>
    ) : (
      <span key={i}>{token.text}</span>
    );
  });
}

/** Render a text string with inline `code` backtick support. */
function renderInlineCode(text: string) {
  const parts = text.split(/(`[^`]+`)/g);
  if (parts.length === 1) return text;
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
          return (
            <code
              key={i}
              className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px] text-slate-700 dark:bg-slate-700 dark:text-slate-200"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface LessonContentProps {
  lesson: Lesson;
  /** Display lesson number, e.g. 01.02. */
  lessonNumber: string | null;
  /** Chapter title shown above the lesson title. */
  chapterLabel: string | null;
  /** Latest query result from the editor (may be null). */
  lastResult: QueryResult | null;
  /** Callback to load sample data into DuckDB. */
  onLoadData: (setupSql: string[]) => Promise<void>;
  /** Whether DuckDB is ready to accept lesson sample-data setup SQL. */
  canLoadData: boolean;
  /** Message shown when sample data cannot be loaded yet. */
  dataLoadUnavailableMessage: string;
  /** Callback to open SQL in a new editor tab. */
  onOpenInEditor: (name: string, sql: string) => void;
  /** Called when the lesson is completed. */
  onCompleteLesson: () => void;
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
 * Renders the full lesson view: back button, title, content paragraphs
 * (with SQL syntax highlighting and inline code), challenge block,
 * and prev/next navigation.
 */
export default function LessonContent({
  lesson,
  lessonNumber,
  chapterLabel,
  lastResult,
  onLoadData,
  canLoadData,
  dataLoadUnavailableMessage,
  onOpenInEditor,
  onCompleteLesson,
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
      {chapterLabel && (
        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {chapterLabel}
        </p>
      )}
      <div className="flex items-start gap-2">
        <h3 className="flex-1 text-sm font-bold text-slate-800 dark:text-slate-100">
          {lessonNumber
            ? `${lessonNumber.split(".")[1]} ${lesson.title}`
            : lesson.title}
        </h3>
        {isCompleted && (
          <span className="flex-shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-500/15 dark:text-green-300">
            Completed
          </span>
        )}
      </div>

      {/* Lesson body */}
      <div className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 space-y-3">
        {parseContent(lesson.content).map((block, i) => {
          if (block.type === "code") {
            return (
              <pre
                key={i}
                className="rounded-md bg-slate-100 p-2.5 font-mono text-[11px] text-slate-700 dark:bg-slate-800 dark:text-slate-300 overflow-x-auto"
              >
                {block.highlighted
                  ? renderSqlHighlighted(block.code)
                  : block.code}
              </pre>
            );
          }
          return (
            <p key={i} className="whitespace-pre-wrap">
              {renderInlineCode(block.text)}
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
          canLoadData={canLoadData}
          dataLoadUnavailableMessage={dataLoadUnavailableMessage}
          onOpenInEditor={onOpenInEditor}
          onChallengePassed={onCompleteLesson}
        />
      )}

      {!lesson.challenge && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              This lesson is theory-focused. Mark it complete when you're ready
              to continue.
            </p>
            {isCompleted ? (
              <span className="flex-shrink-0 rounded-full bg-green-100 px-2 py-1 text-[10px] font-medium text-green-700 dark:bg-green-500/15 dark:text-green-300">
                Completed
              </span>
            ) : (
              <button
                onClick={onCompleteLesson}
                className="flex-shrink-0 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Mark complete
              </button>
            )}
          </div>
        </div>
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
