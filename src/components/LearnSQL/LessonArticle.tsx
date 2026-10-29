import { Link } from "react-router-dom";

import type { Chapter, Lesson } from "../../types/learn";
import { guidePath, guidesForLesson } from "../../data/guides";
import {
  adjacentLessons,
  chapterNumber,
  lessonDescription,
  lessonNumbering,
  lessonPath,
} from "../../data/lessons";
import LessonBody from "./LessonBody";

interface LessonArticleProps {
  lesson: Lesson;
  chapter: Chapter;
}

/** Link card for previous/next lesson navigation. */
function NeighborLink({ lesson, label }: { lesson: Lesson | null; label: string }) {
  const path = lesson ? lessonPath(lesson.id) : null;

  if (!lesson || !path) {
    return <span />;
  }

  return (
    <Link
      to={path}
      className="rounded-xl border border-slate-200 bg-white p-4 text-sm transition-colors hover:border-blue-300 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:border-blue-700"
    >
      <span className="block text-xs font-medium text-slate-400 dark:text-slate-500">{label}</span>
      <span className="mt-1 block font-semibold text-slate-900 dark:text-slate-100">
        {lesson.title}
      </span>
    </Link>
  );
}

/**
 * LessonArticle is the crawlable, static version of a Learn SQL lesson.
 *
 * The build prerenders it for every lesson URL so search engines and AI
 * crawlers that do not run the DuckDB editor still get the full lesson text,
 * sample data, challenge, and links to related lessons and guides.
 */
export default function LessonArticle({ lesson, chapter }: LessonArticleProps) {
  const numbering = lessonNumbering(lesson.id);
  const chapterIndex = chapterNumber(chapter.id);
  const currentPath = lessonPath(lesson.id) ?? "/editor";
  const { previous, next } = adjacentLessons(lesson.id);
  const relatedGuides = guidesForLesson(lesson.id, chapter.guideSlug);

  return (
    <div className="theme-page min-h-screen bg-white">
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500 dark:text-slate-400">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link to="/" className="hover:text-blue-700 dark:hover:text-blue-300">
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="text-slate-300 dark:text-slate-700">/</li>
            <li>
              <Link to="/learn-sql" className="hover:text-blue-700 dark:hover:text-blue-300">
                Learn SQL
              </Link>
            </li>
            <li aria-hidden="true" className="text-slate-300 dark:text-slate-700">/</li>
            <li>
              <Link
                to={`/learn-sql#${chapter.id}`}
                className="hover:text-blue-700 dark:hover:text-blue-300"
              >
                {chapter.title}
              </Link>
            </li>
          </ol>
        </nav>

        <div className="rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-sm md:p-10 dark:bg-slate-950/40">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400">
            Chapter {chapterIndex} · Lesson {numbering?.lessonNumber ?? 1} of{" "}
            {chapter.lessons.length}
          </p>
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl dark:text-slate-100">
            {lesson.title}
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">
            {lessonDescription(lesson)}
          </p>

          <div className="mt-8">
            <LessonBody content={lesson.content} variant="article" />
          </div>

          {lesson.sampleData && (
            <section className="mt-10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Sample data
              </h2>
              <p className="mt-2 leading-7 text-slate-600 dark:text-slate-300">
                This lesson loads the {lesson.sampleData.label} into DuckDB in your
                browser with one click, so you can run every example without
                uploading anything.
              </p>
              <details className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                <summary className="cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300">
                  Setup SQL for {lesson.sampleData.tableNames.join(", ")}
                </summary>
                <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
                  <code>{lesson.sampleData.setupSql.join(";\n\n")};</code>
                </pre>
              </details>
            </section>
          )}

          {lesson.challenge ? (
            <section className="mt-10 rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-900/80 dark:bg-blue-500/15">
              <h2 className="text-lg font-semibold text-blue-950 dark:text-blue-100">
                Practice challenge
              </h2>
              <p className="mt-2 text-sm leading-6 text-blue-900 dark:text-blue-100">
                {lesson.challenge.prompt}
              </p>
              {lesson.challenge.hint && (
                <p className="mt-2 text-sm leading-6 text-blue-900 dark:text-blue-100">
                  <strong className="font-semibold">Hint:</strong> {lesson.challenge.hint}
                </p>
              )}
              <p className="mt-3 text-xs leading-5 text-blue-800 dark:text-blue-200">
                Run your query in the editor and the lesson checks the result
                automatically.
              </p>
            </section>
          ) : (
            <p className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300">
              This lesson is theory-focused. Read it, then mark it complete in the
              Learn SQL panel before moving on.
            </p>
          )}

          <Link
            to={currentPath}
            className="mt-8 inline-flex rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 dark:bg-blue-500 dark:text-slate-950 dark:hover:bg-blue-400"
          >
            Open this lesson in the SQL editor
          </Link>
        </div>

        <nav aria-label="Lesson navigation" className="mt-8 grid gap-4 sm:grid-cols-2">
          <NeighborLink lesson={previous} label="Previous lesson" />
          <NeighborLink lesson={next} label="Next lesson" />
        </nav>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Lessons in {chapter.title}
          </h2>
          {chapter.description && (
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {chapter.description}
            </p>
          )}
          <ol className="mt-4 space-y-2">
            {chapter.lessons.map((chapterLesson, index) => {
              const path = lessonPath(chapterLesson.id) ?? "/editor";
              const isCurrent = chapterLesson.id === lesson.id;

              return (
                <li key={chapterLesson.id}>
                  <Link
                    to={path}
                    aria-current={isCurrent ? "page" : undefined}
                    className={`block rounded-lg border px-4 py-2 text-sm transition-colors ${
                      isCurrent
                        ? "border-blue-300 bg-blue-50 font-semibold text-blue-900 dark:border-blue-800 dark:bg-blue-500/15 dark:text-blue-100"
                        : "border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-700 dark:border-slate-800 dark:text-slate-300 dark:hover:border-blue-700"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")} · {chapterLesson.title}
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>

        {relatedGuides.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Related guides
            </h2>
            <div className="mt-4 grid gap-4">
              {relatedGuides.map((guide) => (
                <Link
                  key={guide.slug}
                  to={guidePath(guide.slug)}
                  className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 transition-colors hover:border-blue-300 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-blue-700"
                >
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{guide.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {guide.summary}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}
