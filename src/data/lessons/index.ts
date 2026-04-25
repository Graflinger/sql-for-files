import type { Chapter, Lesson } from "../../types/learn";

import dataBasics from "./00-data-basics";
import intro from "./01-intro";
import filtering from "./02-filtering";
import normalization from "./03-normalization";
import joins from "./04-joins";
import aggregates from "./05-aggregates";
import grouping from "./06-grouping";
import dates from "./07-dates";
import windowFunctions from "./08-window-functions";
import executionOrder from "./09-execution-order";
import groupingSets from "./10-grouping-sets";
import unnest from "./11-unnest";
import arrayLambdas from "./12-array-lambdas";

/** All chapters in order. */
export const chapters: Chapter[] = [
  dataBasics,
  intro,
  filtering,
  aggregates,
  grouping,
  dates,
  joins,
  windowFunctions,
  executionOrder,
  normalization,
  groupingSets,
  unnest,
  arrayLambdas,
];

/** Flat list of all lessons across all chapters. */
export const allLessons = chapters.flatMap((ch) => ch.lessons);

/** Set of all valid lesson IDs for filtering persisted progress. */
export const validLessonIds = new Set(allLessons.map((lesson) => lesson.id));

/** Total number of lessons across all chapters. */
export const totalLessonCount = allLessons.length;

/** Look up which chapter a lesson belongs to. */
export function chapterForLesson(lessonId: string): Chapter | undefined {
  return chapters.find((ch) => ch.lessons.some((l) => l.id === lessonId));
}

/** Get a lesson by ID. */
export function lessonById(lessonId: string) {
  return allLessons.find((l) => l.id === lessonId);
}

/**
 * Returns display numbering for a lesson in chapter.lesson form.
 * Example: { chapterNumber: 1, lessonNumber: 2, display: "01.02" }
 */
export function lessonNumbering(lessonId: string): {
  chapterNumber: number;
  lessonNumber: number;
  display: string;
} | null {
  for (let chapterIndex = 0; chapterIndex < chapters.length; chapterIndex += 1) {
    const lessonIndex = chapters[chapterIndex].lessons.findIndex((lesson) => lesson.id === lessonId);
    if (lessonIndex >= 0) {
      const chapterNumber = chapterIndex;
      const lessonNumber = lessonIndex + 1;

      return {
        chapterNumber,
        lessonNumber,
        display: `${String(chapterNumber).padStart(2, "0")}.${String(lessonNumber).padStart(2, "0")}`,
      };
    }
  }

  return null;
}

function parseChapterSegment(chapterSegment: string): number | null {
  const match = chapterSegment.trim().toLowerCase().match(/^chapter0*(\d+)$/);
  if (!match) {
    return null;
  }

  const chapterNumber = Number(match[1]);
  return Number.isInteger(chapterNumber) && chapterNumber >= 0 ? chapterNumber : null;
}

function parseLessonSegment(lessonSegment: string): number | null {
  const match = lessonSegment.trim().match(/^0*(\d+)$/);
  if (!match) {
    return null;
  }

  const lessonNumber = Number(match[1]);
  return Number.isInteger(lessonNumber) && lessonNumber > 0 ? lessonNumber : null;
}

/** Build the shareable editor route for a lesson. */
export function lessonPath(lessonId: string): string | null {
  const numbering = lessonNumbering(lessonId);
  if (!numbering) {
    return null;
  }

  return `/editor/chapter${numbering.chapterNumber}/${String(numbering.lessonNumber).padStart(2, "0")}`;
}

/** Resolve chapter/lesson route segments to a lesson. */
export function lessonByRoute(chapterSegment: string, lessonSegment: string): Lesson | null {
  const chapterNumber = parseChapterSegment(chapterSegment);
  const lessonNumber = parseLessonSegment(lessonSegment);

  if (chapterNumber === null || !lessonNumber) {
    return null;
  }

  const chapter = chapters[chapterNumber];
  if (!chapter) {
    return null;
  }

  return chapter.lessons[lessonNumber - 1] ?? null;
}
