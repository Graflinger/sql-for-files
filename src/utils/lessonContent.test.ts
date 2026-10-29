import { describe, expect, it } from "vitest";

import { lessonSummary, parseLessonContent, stripInlineMarkup } from "./lessonContent";

describe("parseLessonContent", () => {
  it("splits paragraphs and highlighted SQL fences", () => {
    const blocks = parseLessonContent("Intro text.\n\n~~~sql\nSELECT 1\n~~~\n\nOutro.");

    expect(blocks).toEqual([
      { type: "text", text: "Intro text." },
      { type: "code", code: "SELECT 1", highlighted: true },
      { type: "text", text: "Outro." },
    ]);
  });

  it("treats plain fences as unhighlighted code", () => {
    const blocks = parseLessonContent("```\nFROM\nWHERE\n```\n\nAfter.");

    expect(blocks).toEqual([
      { type: "code", code: "FROM\nWHERE", highlighted: false },
      { type: "text", text: "After." },
    ]);
  });
});

describe("lessonSummary", () => {
  it("strips inline markup", () => {
    expect(stripInlineMarkup("Use `WHERE` to **filter** rows.")).toBe("Use WHERE to filter rows.");
  });

  it("keeps whole sentences and skips paragraphs that introduce code", () => {
    const summary = lessonSummary({
      content: "`COUNT` counts rows. It ignores nothing.\n\nFor example:\n\n~~~sql\nSELECT COUNT(*) FROM t\n~~~",
    });

    expect(summary).toBe("COUNT counts rows. It ignores nothing.");
  });

  it("truncates a single long sentence at a word boundary", () => {
    const summary = lessonSummary({ content: `${"word ".repeat(60)}end.` }, 60);

    expect(summary.length).toBeLessThanOrEqual(60);
    expect(summary.endsWith("…")).toBe(true);
  });
});
