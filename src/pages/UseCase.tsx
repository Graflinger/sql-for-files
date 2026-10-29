import { Link } from "react-router-dom";

import SEO from "../components/SEO/SEO";
import { guideBySlug, guidePath } from "../data/guides";
import { landingPages } from "../data/landingPages";
import type { LandingPageKind } from "../data/landingPages";
import { lessonById, lessonPath } from "../data/lessons";
import { canonicalUrl, SITE_NAME } from "../utils/siteUrl";

interface UseCaseProps {
  kind: LandingPageKind;
}

/** UseCase renders focused product pages for common SQL for Files discovery intents. */
export default function UseCase({ kind }: UseCaseProps) {
  const config = landingPages[kind];
  const pageUrl = canonicalUrl(config.canonicalPath);
  const guide = guideBySlug(config.guideSlug);
  const lessons = config.lessonIds
    .map((lessonId) => {
      const lesson = lessonById(lessonId);
      const path = lessonPath(lessonId);
      return lesson && path ? { lesson, path } : null;
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: config.heading,
      headline: config.heading,
      description: config.description,
      url: pageUrl,
      inLanguage: "en",
      dateModified: config.updatedAt,
      isPartOf: { "@type": "WebSite", name: SITE_NAME, url: canonicalUrl("/") },
      about: {
        "@type": "WebApplication",
        name: SITE_NAME,
        url: canonicalUrl("/"),
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web Browser",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: config.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
  ];

  return (
    <>
      <SEO
        title={config.title}
        description={config.description}
        canonicalPath={config.canonicalPath}
        ogType="website"
        imageAlt={config.heading}
        structuredData={structuredData}
      />
      <div className="theme-page min-h-screen bg-white">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-sm md:p-10 dark:bg-slate-950/40">
            <div className="max-w-3xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400">
                {config.eyebrow}
              </p>
              <h1 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
                {config.heading}
              </h1>
              <p className="text-base leading-7 text-slate-600 dark:text-slate-300">
                {config.intro}
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/editor"
                  className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                >
                  Open the editor
                </Link>
                <Link
                  to="/docs"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
                >
                  Read the docs
                </Link>
              </div>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {config.bullets.map((bullet) => (
                <div key={bullet} className="rounded-xl border border-slate-200 bg-slate-50/80 p-5">
                  <p className="text-sm leading-6 text-slate-700">{bullet}</p>
                </div>
              ))}
            </div>

            <section className="mt-12">
              <h2 className="mb-5 text-2xl font-bold text-slate-900">How it works</h2>
              <ol className="list-decimal space-y-3 pl-5 leading-7 text-slate-700 dark:text-slate-300">
                {config.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </section>

            <section className="mt-12">
              <h2 className="mb-5 text-2xl font-bold text-slate-900">
                Example queries
              </h2>
              <div className="grid gap-5 md:grid-cols-2">
                {config.examples.map((example) => (
                  <div key={example.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-3 text-sm font-semibold text-slate-900">
                      {example.label}
                    </h3>
                    <pre className="overflow-x-auto rounded-xl bg-slate-900 p-4 text-sm text-slate-100">
                      <code>{example.sql}</code>
                    </pre>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-12">
              <h2 className="mb-5 text-2xl font-bold text-slate-900">
                Frequently asked questions
              </h2>
              <div className="space-y-4">
                {config.faqs.map((faq) => (
                  <div key={faq.question} className="rounded-xl border border-slate-200 bg-slate-50/80 p-5">
                    <h3 className="text-sm font-semibold text-slate-900">{faq.question}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-12 grid gap-6 border-t border-slate-200 pt-10 md:grid-cols-2 dark:border-slate-800">
              {guide && (
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Go deeper</h2>
                  <Link
                    to={guidePath(guide.slug)}
                    className="mt-3 block rounded-xl border border-slate-200 bg-white p-4 text-sm transition-colors hover:border-blue-300 dark:border-slate-800 dark:bg-slate-950/30 dark:hover:border-blue-700"
                  >
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {guide.title}
                    </span>
                    <span className="mt-1 block leading-6 text-slate-600 dark:text-slate-300">
                      {guide.summary}
                    </span>
                  </Link>
                </div>
              )}
              {lessons.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Practice the SQL</h2>
                  <div className="mt-3 space-y-2">
                    {lessons.map(({ lesson, path }) => (
                      <Link
                        key={lesson.id}
                        to={path}
                        className="block rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-300 dark:hover:border-blue-700 dark:hover:text-blue-300"
                      >
                        {lesson.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
