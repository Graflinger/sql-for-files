import { Link } from "react-router-dom";

import SEO from "../components/SEO/SEO";
import { guideBySlug, guidePath } from "../data/guides";
import {
  chapters,
  LEARN_SQL_COURSE_NAME,
  lessonDescription,
  lessonPath,
  totalLessonCount,
} from "../data/lessons";
import { canonicalUrl, SITE_NAME } from "../utils/siteUrl";

const COURSE_DESCRIPTION =
  "A free, practical SQL course with interactive lessons, one-click sample data, and validated challenges that run locally in your browser with DuckDB.";

const challengeCount = chapters.reduce(
  (count, chapter) => count + chapter.lessons.filter((lesson) => lesson.challenge).length,
  0
);

/** LearnSQL provides a crawlable overview of the built-in SQL lesson track. */
export default function LearnSQL() {
  const courseUrl = canonicalUrl("/learn-sql");
  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: LEARN_SQL_COURSE_NAME,
    description: COURSE_DESCRIPTION,
    url: courseUrl,
    inLanguage: "en",
    isAccessibleForFree: true,
    teaches: chapters.map((chapter) => chapter.title),
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: canonicalUrl("/"),
    },
    offers: {
      "@type": "Offer",
      category: "Free",
      price: "0",
      priceCurrency: "USD",
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "Online",
    },
    syllabusSections: chapters.map((chapter) => ({
      "@type": "Syllabus",
      name: chapter.title,
      description: chapter.description ?? chapter.title,
    })),
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: canonicalUrl("/") },
      { "@type": "ListItem", position: 2, name: "Learn SQL", item: courseUrl },
    ],
  };

  return (
    <>
      <SEO
        title="Learn SQL Online with Interactive Lessons | SQL for Files"
        description={`Learn SQL for free with ${totalLessonCount} interactive lessons, sample data, and ${challengeCount} validated challenges that run in your browser with DuckDB.`}
        canonicalPath="/learn-sql"
        ogType="website"
        imageAlt="Learn SQL with SQL for Files"
        structuredData={[courseSchema, breadcrumbSchema]}
      />
      <div className="theme-page min-h-screen bg-white">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-sm md:p-10 dark:bg-slate-950/40">
            <div className="max-w-3xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400">
                Built-In Course
              </p>
              <h1 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
                Learn SQL while querying real files
              </h1>
              <p className="text-base leading-7 text-slate-600 dark:text-slate-300">
                SQL for Files includes {totalLessonCount} guided lessons in{" "}
                {chapters.length} chapters, with {challengeCount} hands-on
                challenges that check your query result automatically. Lessons
                open directly in the editor: load sample tables, run SQL with
                autocomplete, and practice without installing a database.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  to={lessonPath(chapters[0].lessons[0].id) ?? "/editor"}
                  className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 dark:bg-blue-500 dark:text-slate-950 dark:hover:bg-blue-400"
                >
                  Start the first lesson
                </Link>
                <Link
                  to="/docs#learn-sql"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-900"
                >
                  Read how lessons work
                </Link>
              </div>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-5">
                <h2 className="mb-2 text-sm font-semibold text-slate-900">
                  Practice in the editor
                </h2>
                <p className="text-sm leading-6 text-slate-600">
                  Lessons use the same Monaco editor, DuckDB engine, and results
                  panel as your own imported files.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-5">
                <h2 className="mb-2 text-sm font-semibold text-slate-900">
                  Load sample data
                </h2>
                <p className="text-sm leading-6 text-slate-600">
                  One-click sample tables make it easy to run examples before
                  bringing your own CSV, JSON, or Parquet files.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-5">
                <h2 className="mb-2 text-sm font-semibold text-slate-900">
                  Keep data local
                </h2>
                <p className="text-sm leading-6 text-slate-600">
                  Use AI to draft SQL if you want, then run it locally without
                  uploading sensitive file data to an AI provider.
                </p>
              </div>
            </div>

            <nav aria-label="Chapters" className="mt-12">
              <h2 className="text-xl font-bold text-slate-900">Chapters</h2>
              <ol className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                {chapters.map((chapter, chapterIndex) => (
                  <li key={chapter.id}>
                    <a
                      href={`#${chapter.id}`}
                      className="text-slate-600 transition-colors hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300"
                    >
                      {String(chapterIndex).padStart(2, "0")} · {chapter.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="mt-12 space-y-12">
              {chapters.map((chapter, chapterIndex) => {
                const guide = chapter.guideSlug ? guideBySlug(chapter.guideSlug) : undefined;
                const recommendedAfter = chapter.recommendedAfter
                  ? chapters.findIndex((candidate) => candidate.id === chapter.recommendedAfter)
                  : -1;

                return (
                  <section key={chapter.id} id={chapter.id} className="scroll-mt-24">
                    <div className="mb-4 border-b border-slate-200 pb-3">
                      <div className="flex items-baseline gap-3">
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500">
                          {String(chapterIndex).padStart(2, "0")}
                        </span>
                        <h2 className="text-xl font-bold text-slate-900">
                          {chapter.title}
                        </h2>
                      </div>
                      {chapter.description && (
                        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                          {chapter.description}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                        {recommendedAfter >= 0 && (
                          <span>
                            Works well after chapter {recommendedAfter}:{" "}
                            {chapters[recommendedAfter].title}
                          </span>
                        )}
                        {guide && (
                          <Link
                            to={guidePath(guide.slug)}
                            className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            Companion guide: {guide.title}
                          </Link>
                        )}
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {chapter.lessons.map((lesson, lessonIndex) => {
                        const path = lessonPath(lesson.id) ?? "/editor";

                        return (
                          <Link
                            key={lesson.id}
                            to={path}
                            className="rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-blue-300 hover:bg-blue-50/40"
                          >
                            <p className="mb-1 text-xs font-medium text-slate-400">
                              Lesson {String(lessonIndex + 1).padStart(2, "0")}
                              {lesson.challenge ? " · Challenge" : " · Theory"}
                            </p>
                            <h3 className="text-sm font-semibold text-slate-900">
                              {lesson.title}
                            </h3>
                            <p className="mt-2 text-xs leading-5 text-slate-500">
                              {lessonDescription(lesson)}
                            </p>
                          </Link>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
