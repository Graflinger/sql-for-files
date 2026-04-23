import type { QueryResult } from "./query";

/** Result of validating a user's query against the challenge expectations. */
export interface ValidationResult {
  passed: boolean;
  message: string;
}

/** A single challenge within a lesson. */
export interface Challenge {
  /** Short description of what the user should accomplish. */
  prompt: string;
  /** Optional hint shown on request. */
  hint?: string;
  /** SQL pre-filled into the editor when the user clicks "Start Challenge". */
  initialSql?: string;
  /** Correct SQL solution shown on request in a new editor tab. */
  solutionSql?: string;
  /** Validates the query result and returns pass/fail with feedback. */
  validate: (result: QueryResult) => ValidationResult;
}

/** SQL statements that create and populate sample tables for a lesson. */
export interface SampleData {
  /** Human-readable label for the dataset (e.g. "employees table"). */
  label: string;
  /** SQL statements executed in order to set up the data. */
  setupSql: string[];
  /** Table names created by this sample data (used for cleanup). */
  tableNames: string[];
}

/** A single lesson within a chapter. */
export interface Lesson {
  /** Unique identifier (e.g. "intro-first-query"). */
  id: string;
  /** Display title. */
  title: string;
  /** Lesson body — plain text with simple markdown-style formatting. */
  content: string;
  /** Optional sample data to load with one click. */
  sampleData?: SampleData;
  /** Optional challenge for the user to solve. */
  challenge?: Challenge;
}

/** A chapter groups related lessons into a numbered section. */
export interface Chapter {
  /** Unique identifier (e.g. "intro"). */
  id: string;
  /** Display title (e.g. "Introduction to SQL"). */
  title: string;
  /** Ordered list of lessons in this chapter. */
  lessons: Lesson[];
}

/** Persisted progress: set of completed lesson IDs. */
export interface LearnProgress {
  completedLessons: string[];
}
