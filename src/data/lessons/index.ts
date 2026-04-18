import type { Chapter } from "../../types/learn";

import intro from "./01-intro";
import filtering from "./02-filtering";

/** All chapters in order. */
export const chapters: Chapter[] = [intro, filtering];

/** Flat list of all lessons across all chapters. */
export const allLessons = chapters.flatMap((ch) => ch.lessons);

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
