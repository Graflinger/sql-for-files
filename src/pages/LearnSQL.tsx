import { Link } from "react-router-dom";

import SEO from "../components/SEO/SEO";
import { chapters, lessonPath, totalLessonCount } from "../data/lessons";

/** LearnSQL provides a crawlable overview of the built-in SQL lesson track. */
export default function LearnSQL() {
  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "Learn SQL with SQL for Files",
    description:
      "A practical SQL learning track with browser-based lessons, sample data, and hands-on challenges inside SQL for Files.",
    url: "https://sqlforfiles.app/learn-sql",
    provider: {
      "@type": "Organization",
      name: "SQL for Files",
      url: "https://sqlforfiles.app/",
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: `${totalLessonCount} short SQL lessons`,
    },
  };

  return (
    <>
      <SEO
        title="Learn SQL in Your Browser | SQL for Files"
        description="Learn SQL with guided lessons, sample data, and hands-on challenges inside a private browser-based DuckDB editor."
        canonicalPath="/learn-sql"
        ogType="article"
        imageAlt="Learn SQL with SQL for Files"
        structuredData={courseSchema}
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
                SQL for Files includes {totalLessonCount} guided lessons that
                open directly in the editor. Load sample tables, run SQL with
                autocomplete, and solve challenges without installing a database.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/editor/chapter0/01"
                  className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                >
                  Start the first lesson
                </Link>
                <Link
                  to="/docs#learn-sql"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
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

            <div className="mt-12 space-y-8">
              {chapters.map((chapter, chapterIndex) => (
                <section key={chapter.id}>
                  <div className="mb-4 flex items-baseline gap-3 border-b border-slate-200 pb-3">
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500">
                      {String(chapterIndex).padStart(2, "0")}
                    </span>
                    <h2 className="text-xl font-bold text-slate-900">
                      {chapter.title}
                    </h2>
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
                          </p>
                          <h3 className="text-sm font-semibold text-slate-900">
                            {lesson.title}
                          </h3>
                          <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                            {lesson.content.split("\n")[0]}
                          </p>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
