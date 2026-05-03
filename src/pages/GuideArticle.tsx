import { Link, useParams } from "react-router-dom";

import SEO from "../components/SEO/SEO";
import { guideBySlug, guidePath } from "../data/guides";
import { lessonPath, lessonById } from "../data/lessons";
import type { Guide, GuideBlock } from "../types/guides";

const SITE_URL = "https://sqlforfiles.app";

function renderBlock(block: GuideBlock, index: number) {
  if (block.kind === "paragraph") {
    return (
      <p key={index} className="leading-7 text-slate-700 dark:text-slate-300">
        {block.text}
      </p>
    );
  }

  if (block.kind === "list") {
    return (
      <ul
        key={index}
        className="mb-0 list-disc space-y-2 pl-5 leading-7 text-slate-700 dark:text-slate-300"
      >
        {block.items?.map((item) => <li key={item}>{item}</li>)}
      </ul>
    );
  }

  if (block.kind === "steps") {
    return (
      <ol
        key={index}
        className="mb-0 list-decimal space-y-2 pl-5 leading-7 text-slate-700 dark:text-slate-300"
      >
        {block.items?.map((item) => <li key={item}>{item}</li>)}
      </ol>
    );
  }

  if (block.kind === "code") {
    return (
      <pre
        key={index}
        className="overflow-x-auto rounded-xl bg-slate-900 p-4 text-sm text-slate-100 shadow-sm"
      >
        <code>{block.code}</code>
      </pre>
    );
  }

  return (
    <div
      key={index}
      className="rounded-xl border border-blue-200 bg-blue-50/80 p-4 text-sm leading-6 text-blue-900 dark:border-blue-900/80 dark:bg-blue-500/15 dark:text-blue-100"
    >
      {block.title && <p className="mb-1 font-semibold">{block.title}</p>}
      <p>{block.text}</p>
    </div>
  );
}

function articleStructuredData(guide: Guide) {
  const articleUrl = `${SITE_URL}${guidePath(guide.slug)}`;
  const techArticle = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: guide.title,
    description: guide.description,
    url: articleUrl,
    datePublished: guide.publishedAt,
    dateModified: guide.updatedAt,
    keywords: guide.keywords.join(", "),
    author: {
      "@type": "Organization",
      name: "SQL for Files",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "SQL for Files",
      url: SITE_URL,
    },
    mainEntityOfPage: articleUrl,
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${SITE_URL}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Guides",
        item: `${SITE_URL}/guides`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: guide.title,
        item: articleUrl,
      },
    ],
  };
  const howTo = guide.howTo
    ? {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: guide.title,
        description: guide.description,
        step: guide.sections.flatMap((section) =>
          section.blocks
            .filter((block) => block.kind === "steps")
            .flatMap((block) =>
              (block.items ?? []).map((item) => ({
                "@type": "HowToStep",
                name: item,
                text: item,
              }))
            )
        ),
      }
    : null;

  return howTo ? [techArticle, breadcrumb, howTo] : [techArticle, breadcrumb];
}

/** Guide article page for evergreen SQL for Files guides. */
export default function GuideArticle() {
  const { guideSlug } = useParams();
  const guide = guideSlug ? guideBySlug(guideSlug) : undefined;

  if (!guide) {
    return (
      <>
        <SEO
          title="Guide Not Found | SQL for Files"
          description="The requested SQL for Files guide could not be found. Browse all guides for CSV, JSON, Parquet, DuckDB WASM, and local SQL examples."
          canonicalPath="/guides"
          robots="noindex,follow"
        />
        <div className="theme-page min-h-screen bg-white">
          <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-sm dark:bg-slate-950/40">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400">
                Guides
              </p>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Guide not found
              </h1>
              <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">
                This guide does not exist or may have moved. Browse the full
                guide index to find practical SQL examples and file-analysis
                walkthroughs.
              </p>
              <Link
                to="/guides"
                className="mt-6 inline-flex rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 dark:bg-blue-500 dark:text-slate-950 dark:hover:bg-blue-400"
              >
                Browse guides
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  const relatedGuides = guide.relatedGuideSlugs
    .map((slug) => guideBySlug(slug))
    .filter((relatedGuide): relatedGuide is Guide => Boolean(relatedGuide));
  const relatedLessons = guide.relatedLessonIds
    .map((lessonId) => {
      const lesson = lessonById(lessonId);
      const path = lessonPath(lessonId);
      return lesson && path ? { lesson, path } : null;
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <>
      <SEO
        title={`${guide.title} | SQL for Files`}
        description={guide.description}
        canonicalPath={guidePath(guide.slug)}
        ogType="article"
        imageAlt={`${guide.title} guide`}
        keywords={guide.keywords.join(", ")}
        structuredData={articleStructuredData(guide)}
      />
      <div className="theme-page min-h-screen bg-white">
        <article className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-sm backdrop-blur-sm md:p-10 dark:bg-slate-950/40">
            <nav className="mb-8 text-sm text-slate-500 dark:text-slate-400">
              <Link to="/guides" className="hover:text-blue-700 dark:hover:text-blue-300">
                Guides
              </Link>
              <span className="mx-2 text-slate-300 dark:text-slate-700">/</span>
              <span>{guide.category}</span>
            </nav>

            <header className="max-w-3xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400">
                {guide.category}
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl dark:text-slate-100">
                {guide.title}
              </h1>
              <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
                {guide.summary}
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span>Published {guide.publishedAt}</span>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span>Updated {guide.updatedAt}</span>
              </div>
            </header>

            <div className="mt-10 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/50">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400">
                On This Page
              </p>
              <div className="flex flex-wrap gap-2">
                {guide.sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-300 dark:hover:border-blue-700 dark:hover:text-blue-300"
                  >
                    {section.title}
                  </a>
                ))}
              </div>
            </div>

            <div className="mt-12 space-y-14">
              {guide.sections.map((section) => (
                <section key={section.id} id={section.id} className="space-y-5">
                  <div className="border-b border-slate-200 pb-4 dark:border-slate-800">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {section.title}
                    </h2>
                  </div>
                  <div className="space-y-5 text-base">
                    {section.blocks.map(renderBlock)}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-14 grid gap-6 border-t border-slate-200 pt-10 dark:border-slate-800 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-6 dark:border-slate-800 dark:bg-slate-900/50">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Continue in the editor
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Open SQL for Files to add your own CSV, JSON, or Parquet files
                  and try these examples locally in your browser.
                </p>
                <Link
                  to="/editor"
                  className="mt-5 inline-flex rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 dark:bg-blue-500 dark:text-slate-950 dark:hover:bg-blue-400"
                >
                  Open editor
                </Link>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-6 dark:border-slate-800 dark:bg-slate-900/50">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Related Learn SQL lessons
                </h2>
                <div className="mt-4 space-y-2">
                  {relatedLessons.map(({ lesson, path }) => (
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
            </div>

            {relatedGuides.length > 0 && (
              <div className="mt-10 border-t border-slate-200 pt-10 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Related guides
                </h2>
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  {relatedGuides.map((relatedGuide) => (
                    <Link
                      key={relatedGuide.slug}
                      to={guidePath(relatedGuide.slug)}
                      className="rounded-xl border border-slate-200 bg-white p-4 text-sm transition-colors hover:border-blue-300 dark:border-slate-800 dark:bg-slate-950/30 dark:hover:border-blue-700"
                    >
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {relatedGuide.title}
                      </p>
                      <p className="mt-2 leading-6 text-slate-600 dark:text-slate-300">
                        {relatedGuide.summary}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>
      </div>
    </>
  );
}
