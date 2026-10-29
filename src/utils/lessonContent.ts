import type { Lesson } from "../types/learn";

/** A fenced or indented code block from lesson content. */
export interface LessonCodeBlock {
  type: "code";
  code: string;
  /** True for ```sql / ~~~sql fences, which get SQL syntax highlighting. */
  highlighted: boolean;
}

/** A paragraph of lesson prose with lightweight inline markup. */
export interface LessonTextBlock {
  type: "text";
  text: string;
}

export type LessonContentBlock = LessonCodeBlock | LessonTextBlock;

/** Split a plain-text section (no fences) into paragraphs and indented code blocks. */
function splitTextSection(text: string): LessonContentBlock[] {
  return text
    .split("\n\n")
    .filter((paragraph) => paragraph.trim())
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
            .map((line) => line.replace(/^ {2}/, ""))
            .join("\n"),
          highlighted: false,
        };
      }
      return { type: "text" as const, text: trimmed };
    });
}

/**
 * Parse lesson content into code and text blocks.
 *
 * Supports:
 * - Fenced code blocks: ```sql ... ``` or ~~~sql ... ~~~ (highlighted)
 *   and ``` ... ``` or ~~~ ... ~~~ (plain)
 * - Indented code blocks: lines starting with 2+ spaces (plain, backward compat)
 * - Regular text paragraphs (separated by blank lines)
 */
export function parseLessonContent(content: string): LessonContentBlock[] {
  const blocks: LessonContentBlock[] = [];
  const fenceRegex = /(```|~~~)(\w*)\n([\s\S]*?)\1/g;
  let lastIndex = 0;
  let match;

  while ((match = fenceRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      blocks.push(...splitTextSection(content.slice(lastIndex, match.index)));
    }
    blocks.push({
      type: "code",
      code: match[3].trimEnd(),
      highlighted: match[2].toLowerCase() === "sql",
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    blocks.push(...splitTextSection(content.slice(lastIndex)));
  }

  return blocks;
}

/** Remove inline code and bold markers and collapse whitespace. */
export function stripInlineMarkup(text: string): string {
  return text
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

/** Truncate text at a word boundary, adding an ellipsis when shortened. */
function truncateAtWord(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  const cut = text.slice(0, maxLength - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 40 ? cut.slice(0, lastSpace) : cut).replace(/[,;:.\s]+$/, "")}…`;
}

/**
 * Plain-text summary of a lesson built from its opening prose.
 *
 * Paragraphs that only introduce a following code example (ending with ":")
 * are skipped. Whole sentences are kept while they fit in `maxLength`.
 */
export function lessonSummary(lesson: Pick<Lesson, "content">, maxLength = 155): string {
  const paragraphs = parseLessonContent(lesson.content)
    .filter((block): block is LessonTextBlock => block.type === "text")
    .map((block) => stripInlineMarkup(block.text))
    .filter((text) => text && !text.endsWith(":") && !text.startsWith("•"));

  const sentences = paragraphs
    .join(" ")
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);

  let summary = "";
  for (const sentence of sentences) {
    const candidate = summary ? `${summary} ${sentence}` : sentence;
    if (candidate.length > maxLength) {
      break;
    }
    summary = candidate;
  }

  return summary || truncateAtWord(sentences[0] ?? "", maxLength);
}
