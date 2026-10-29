import type { SqlTokenType } from "../../utils/sqlHighlight";

import { tokenizeSql } from "../../utils/sqlHighlight";
import { parseLessonContent } from "../../utils/lessonContent";

interface LessonBodyProps {
  /** Lesson body using the lightweight lesson markup. */
  content: string;
  /** `panel` matches the compact Learn SQL side panel; `article` is for full lesson pages. */
  variant?: "panel" | "article";
}

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

/** Render a text string with inline code and bold markup. */
function renderInlineMarkdown(text: string, codeClassName: string) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  if (parts.length === 1) return text;
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
          return (
            <code key={i} className={codeClassName}>
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
          return (
            <strong key={i} className="font-semibold text-slate-800 dark:text-slate-100">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

const variantClasses = {
  panel: {
    container: "text-xs leading-relaxed text-slate-600 dark:text-slate-300 space-y-3",
    pre: "rounded-md bg-slate-100 p-2.5 font-mono text-[11px] text-slate-700 dark:bg-slate-800 dark:text-slate-300 overflow-x-auto",
    inlineCode:
      "rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px] text-slate-700 dark:bg-slate-700 dark:text-slate-200",
  },
  article: {
    container: "space-y-5 text-base leading-7 text-slate-700 dark:text-slate-300",
    pre: "overflow-x-auto rounded-xl bg-slate-100 p-4 font-mono text-sm text-slate-800 dark:bg-slate-900 dark:text-slate-200",
    inlineCode:
      "rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.9em] text-slate-800 dark:bg-slate-800 dark:text-slate-200",
  },
};

/**
 * LessonBody renders lesson markup: paragraphs with inline code and bold text,
 * and fenced SQL blocks with syntax highlighting.
 */
export default function LessonBody({ content, variant = "panel" }: LessonBodyProps) {
  const classes = variantClasses[variant];

  return (
    <div className={classes.container}>
      {parseLessonContent(content).map((block, i) => {
        if (block.type === "code") {
          return (
            <pre key={i} className={classes.pre}>
              {block.highlighted ? <code>{renderSqlHighlighted(block.code)}</code> : <code>{block.code}</code>}
            </pre>
          );
        }
        return (
          <p key={i} className="whitespace-pre-wrap">
            {renderInlineMarkdown(block.text, classes.inlineCode)}
          </p>
        );
      })}
    </div>
  );
}
