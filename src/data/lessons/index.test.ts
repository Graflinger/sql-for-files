import { describe, expect, it } from "vitest";

import { guideBySlug } from "../guides";
import {
  adjacentLessons,
  allLessons,
  chapters,
  lessonByRoute,
  lessonDescription,
  lessonPageTitle,
  lessonPath,
} from "./index";

describe("lesson routes", () => {
  it("builds a shareable path for the execution-order chapter after window functions", () => {
    expect(lessonPath("execution-order-logical-order")).toBe("/editor/chapter8/01");
  });

  it("resolves a lesson from the execution-order chapter route", () => {
    expect(lessonByRoute("chapter8", "01")?.id).toBe("execution-order-logical-order");
  });

  it("builds a shareable lesson path", () => {
    expect(lessonPath("intro-order-by")).toBe("/editor/chapter1/04");
  });

  it("resolves a lesson from chapter and lesson segments", () => {
    expect(lessonByRoute("chapter1", "04")?.id).toBe("intro-order-by");
  });

  it("accepts zero-padded chapter segments", () => {
    expect(lessonByRoute("chapter01", "4")?.id).toBe("intro-order-by");
  });

  it("returns null for invalid lesson routes", () => {
    expect(lessonByRoute("chapter99", "01")).toBeNull();
    expect(lessonByRoute("intro", "01")).toBeNull();
  });
});

describe("lesson metadata", () => {
  it("gives every lesson a unique hand-written summary sized for meta descriptions", () => {
    const summaries = allLessons.map((lesson) => lesson.summary ?? "");

    allLessons.forEach((lesson) => {
      expect(lesson.summary, `${lesson.id} needs a summary`).toBeTruthy();
      expect(lesson.summary?.length, `${lesson.id} summary length`).toBeGreaterThanOrEqual(100);
      expect(lesson.summary?.length, `${lesson.id} summary length`).toBeLessThanOrEqual(160);
      expect(lessonDescription(lesson)).toBe(lesson.summary);
    });
    expect(new Set(summaries).size).toBe(summaries.length);
  });

  it("keeps lesson page titles unique and within 65 characters", () => {
    const titles = allLessons.map(lessonPageTitle);

    titles.forEach((title) => expect(title.length).toBeLessThanOrEqual(65));
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("describes every chapter and links it to an existing companion guide", () => {
    const chapterIds = new Set(chapters.map((chapter) => chapter.id));

    chapters.forEach((chapter) => {
      expect(chapter.description, `${chapter.id} description`).toBeTruthy();
      expect(chapter.guideSlug, `${chapter.id} guideSlug`).toBeTruthy();
      expect(guideBySlug(chapter.guideSlug ?? ""), `${chapter.id} guide`).toBeDefined();
      if (chapter.recommendedAfter) {
        expect(chapterIds.has(chapter.recommendedAfter)).toBe(true);
      }
    });
  });

  it("finds previous and next lessons across chapter boundaries", () => {
    const { previous, next } = adjacentLessons("intro-order-by");

    expect(previous?.id).toBe("intro-aliases");
    expect(next?.id).toBe("filtering-where");
    expect(adjacentLessons(allLessons[0].id).previous).toBeNull();
    expect(adjacentLessons(allLessons[allLessons.length - 1].id).next).toBeNull();
  });
});
