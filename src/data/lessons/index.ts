import type { Chapter, Lesson } from "../../types/learn";
import { lessonSummary } from "../../utils/lessonContent";

import dataBasics from "./00-data-basics";
import intro from "./01-intro";
import filtering from "./02-filtering";
import aggregates from "./03-aggregates";
import grouping from "./04-grouping";
import dates from "./05-dates";
import joins from "./06-joins";
import windowFunctions from "./07-window-functions";
import executionOrder from "./08-execution-order";
import normalization from "./09-normalization";
import groupingSets from "./10-grouping-sets";
import unnest from "./11-unnest";
import arrayLambdas from "./12-array-lambdas";

/** Name of the Learn SQL course used in structured data. */
export const LEARN_SQL_COURSE_NAME = "Learn SQL with SQL for Files";

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

/** Zero-based chapter number used in lesson URLs (e.g. 1 for /editor/chapter1/01). */
export function chapterNumber(chapterId: string): number {
  return chapters.findIndex((chapter) => chapter.id === chapterId);
}

/** Plain-text lesson description for metadata, overview cards, and llms.txt. */
export function lessonDescription(lesson: Lesson): string {
  return lesson.summary ?? lessonSummary(lesson);
}

/** Previous and next lessons in course order, crossing chapter boundaries. */
export function adjacentLessons(lessonId: string): {
  previous: Lesson | null;
  next: Lesson | null;
} {
  const index = allLessons.findIndex((lesson) => lesson.id === lessonId);
  if (index < 0) {
    return { previous: null, next: null };
  }

  return {
    previous: index > 0 ? allLessons[index - 1] : null,
    next: index < allLessons.length - 1 ? allLessons[index + 1] : null,
  };
}

const MAX_TITLE_LENGTH = 65;

/**
 * HTML title for a lesson page. Lesson pages target practice intent
 * ("interactive SQL lesson") so they do not compete with the companion guides,
 * which target explanation intent. Longer lesson titles drop suffixes to stay
 * within typical search-result title widths.
 */
export function lessonPageTitle(lesson: Lesson): string {
  const candidates = [
    `${lesson.title}: Interactive SQL Lesson | SQL for Files`,
    `${lesson.title}: Interactive SQL Lesson`,
    `${lesson.title} | Learn SQL`,
  ];

  return candidates.find((title) => title.length <= MAX_TITLE_LENGTH) ?? lesson.title;
}
