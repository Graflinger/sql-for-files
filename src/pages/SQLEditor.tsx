import { useCallback, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import { useDuckDBContext } from "../contexts/DuckDBContext";
import { useEditorTabsContext } from "../contexts/EditorTabsContext";
import { useNotifications } from "../contexts/NotificationContext";
import { useLearnSQL } from "../contexts/LearnSQLContext";
import {
  chapterForLesson,
  LEARN_SQL_COURSE_NAME,
  lessonByRoute,
  lessonDescription,
  lessonNumbering,
  lessonPageTitle,
  lessonPath,
} from "../data/lessons";
import FileAdder from "../components/FileAdder/FileAdder";
import SQLEditor from "../components/SQLEditor/SQLEditor";
import TableList from "../components/DatabaseManager/TableList";
import QueryResults from "../components/QueryResults/QueryResults";
import QueryHistorySidebar from "../components/QueryHistory/QueryHistorySidebar";
import LearnSQLPanel from "../components/LearnSQL/LearnSQLPanel";
import LessonArticle from "../components/LearnSQL/LessonArticle";
import { IDELayout } from "../components/IDE";
import { useQueryExecution } from "../hooks/useQueryExecution";
import { useQueryHistory } from "../hooks/useQueryHistory";
import SEO from "../components/SEO/SEO";
import { quoteIdentifier } from "../utils/sql";
import { canonicalUrl, SITE_NAME } from "../utils/siteUrl";
import type { Chapter, Lesson } from "../types/learn";

/**
 * SQL Editor Page Content
 *
 * Uses the IDE layout with:
 * - Collapsible sidebar (file adder + table list)
 * - SQL editor panel with tabs (top)
 * - Resizable results panel with Data/Visualisation/Classification tabs (bottom)
 *
 * DuckDBProvider and EditorTabsProvider live in App.tsx (global)
 * so state survives navigation between pages.
 */
function SQLEditorContent() {
  const navigate = useNavigate();
  const { chapterSlug, lessonSlug } = useParams();
  const { db, tables, refreshTables, restoredMessage, clearRestoredMessage } = useDuckDBContext();
  const { addQuery, history, loading, deleteQuery, clearHistory, getRelativeTime } = useQueryHistory();
  const { addNotification } = useNotifications();
  const { panelOpen, openLesson, showOverview } = useLearnSQL();
  const routeLesson =
    chapterSlug && lessonSlug ? lessonByRoute(chapterSlug, lessonSlug) : null;
  const hasLessonRoute = Boolean(chapterSlug && lessonSlug);

  // Show restore notification once, then clear so it won't re-show on navigation.
  // A ref guard prevents Strict Mode double-invocation from firing the toast twice.
  const restoredShownRef = useRef<string | null>(null);
  useEffect(() => {
    if (restoredMessage && restoredMessage !== restoredShownRef.current) {
      restoredShownRef.current = restoredMessage;
      addNotification({ type: "info", title: restoredMessage });
      clearRestoredMessage();
    }
  }, [restoredMessage, addNotification, clearRestoredMessage]);

  // Editor tabs state (from global context)
  const {
    tabs,
    activeTabId,
    activeTab,
    setActiveTab,
    addTab,
    closeTab,
    updateTabSql,
    updateTabResult,
    renameTab,
  } = useEditorTabsContext();

  const { executeQuery, executing, result, error } = useQueryExecution(db, {
    onQueryExecuted: async (params) => {
      await addQuery(params);
    },
  });

  // Track which tab initiated the current query execution
  const executingTabIdRef = useRef<string>(activeTabId);

  // Sync hook's result/error into the tab that initiated the query
  useEffect(() => {
    if (result) {
      updateTabResult(executingTabIdRef.current, result, null);
    }
  }, [result, updateTabResult]);

  useEffect(() => {
    if (error) {
      updateTabResult(executingTabIdRef.current, null, error);
    }
  }, [error, updateTabResult]);

  useEffect(() => {
    if (!hasLessonRoute) {
      showOverview();
      return;
    }

    if (!routeLesson) {
      navigate("/editor", { replace: true });
      return;
    }

    openLesson(routeLesson.id);
  }, [hasLessonRoute, navigate, openLesson, routeLesson, showOverview]);

  const handleExecute = useCallback(
    async (sql: string) => {
      // Remember which tab started this execution
      executingTabIdRef.current = activeTabId;
      await executeQuery(sql);
      // Refresh sidebar to catch DDL changes (CREATE/DROP/ALTER)
      await refreshTables();
    },
    [executeQuery, activeTabId, refreshTables]
  );

  const handlePreviewTable = useCallback(
    async (tableName: string) => {
      const sql = `SELECT * FROM ${quoteIdentifier(tableName)} LIMIT 100`;
      const newTabId = addTab({ name: `Preview: ${tableName}`, sql });
      executingTabIdRef.current = newTabId;
      await executeQuery(sql);
    },
    [addTab, executeQuery]
  );

  const handleSqlChange = useCallback(
    (sql: string) => {
      updateTabSql(activeTabId, sql);
    },
    [activeTabId, updateTabSql]
  );

  /** Load a query from history into the active editor tab. */
  const handleLoadQuery = useCallback(
    (sql: string) => {
      updateTabSql(activeTabId, sql);
    },
    [activeTabId, updateTabSql]
  );

  // Result stats for the results panel header (from active tab)
  const resultStats = activeTab.result
    ? {
        rowCount: activeTab.result.rowCount,
        executionTime: activeTab.result.executionTime,
        hasError: false,
      }
    : activeTab.error
    ? { hasError: true }
    : undefined;

  return (
    <IDELayout
      sidebarContent={{
        addData: <FileAdder compact />,
        tables: <TableList onPreviewTable={handlePreviewTable} />,
        tableCount: tables.length > 0 ? tables.length : undefined,
        queryHistory: (
          <QueryHistorySidebar
            history={history}
            loading={loading}
            deleteQuery={deleteQuery}
            clearHistory={clearHistory}
            getRelativeTime={getRelativeTime}
            onLoadQuery={handleLoadQuery}
          />
        ),
        historyCount: history.length > 0 ? history.length : undefined,
      }}
      editorContent={
        <SQLEditor
          onExecute={handleExecute}
          executing={executing}
          disabled={!db}
          flexHeight
          value={activeTab.sql}
          onChange={handleSqlChange}
        />
      }
      resultsContent={
        <QueryResults
          result={activeTab.result}
          error={activeTab.error}
          embedded
        />
      }
      result={activeTab.result}
      resultStats={resultStats}
      editorTabs={{
        tabs,
        activeTabId,
        onSelectTab: setActiveTab,
        onAddTab: addTab,
        onCloseTab: closeTab,
        onRenameTab: renameTab,
      }}
      rightPanel={
        panelOpen ? <LearnSQLPanel lastResult={activeTab.result} /> : undefined
      }
    />
  );
}

/** Structured data for a lesson page: the lesson as part of the Learn SQL course, plus breadcrumbs. */
function lessonStructuredData(lesson: Lesson, chapter: Chapter | null, description: string) {
  const lessonUrl = canonicalUrl(lessonPath(lesson.id) ?? "/editor");
  const courseUrl = canonicalUrl("/learn-sql");
  const numbering = lessonNumbering(lesson.id);

  return [
    {
      "@context": "https://schema.org",
      "@type": "LearningResource",
      name: lesson.title,
      description,
      url: lessonUrl,
      inLanguage: "en",
      isAccessibleForFree: true,
      learningResourceType: lesson.challenge ? ["Lesson", "Exercise"] : "Lesson",
      interactivityType: lesson.challenge ? "active" : "expositive",
      teaches: chapter?.title ?? "SQL",
      position: numbering?.lessonNumber,
      isPartOf: {
        "@type": "Course",
        name: LEARN_SQL_COURSE_NAME,
        url: courseUrl,
      },
      provider: {
        "@type": "Organization",
        name: SITE_NAME,
        url: canonicalUrl("/"),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: canonicalUrl("/") },
        { "@type": "ListItem", position: 2, name: "Learn SQL", item: courseUrl },
        { "@type": "ListItem", position: 3, name: lesson.title, item: lessonUrl },
      ],
    },
  ];
}

/**
 * SQL Editor Page
 *
 * DuckDB and editor tab providers wrap the editor route in App.tsx,
 * so this component is just SEO + content.
 */
export default function SqlEditorPage() {
  const location = useLocation();
  const { chapterSlug, lessonSlug } = useParams();
  const isPrerenderSnapshot = new URLSearchParams(location.search).has("prerender");
  const routeLesson =
    chapterSlug && lessonSlug ? lessonByRoute(chapterSlug, lessonSlug) : null;
  // Always canonicalize to the generated lesson path so alias segments such as
  // /editor/chapter01/4 do not declare themselves as separate URLs.
  const canonicalPath = (routeLesson ? lessonPath(routeLesson.id) : null) ?? "/editor";
  const routeChapter = routeLesson ? chapterForLesson(routeLesson.id) ?? null : null;
  const pageTitle = routeLesson
    ? lessonPageTitle(routeLesson)
    : "SQL Editor for CSV, JSON & Parquet | SQL for Files";
  const pageDescription = routeLesson
    ? lessonDescription(routeLesson)
    : "Run SQL queries on CSV, JSON, and Parquet files directly in your browser. Files, SQL queries, and results stay local in your browser.";
  const structuredData = routeLesson
    ? lessonStructuredData(routeLesson, routeChapter, pageDescription)
    : {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "SQL for Files Editor",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web Browser",
        url: canonicalUrl("/editor"),
        description: pageDescription,
        isAccessibleForFree: true,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      };

  return (
    <>
      <SEO
        title={pageTitle}
        description={pageDescription}
        canonicalPath={canonicalPath}
        ogType={routeLesson ? "article" : "website"}
        imageAlt={routeLesson ? `${routeLesson.title} - Learn SQL lesson` : "SQL for Files SQL editor"}
        structuredData={structuredData}
      />
      {isPrerenderSnapshot ? (
        routeLesson && routeChapter ? (
          <LessonArticle lesson={routeLesson} chapter={routeChapter} />
        ) : (
          <EditorSnapshot />
        )
      ) : (
        <SQLEditorContent />
      )}
    </>
  );
}

/** Static editor landing content used for the prerendered /editor HTML. */
function EditorSnapshot() {
  return (
    <div className="theme-page min-h-screen bg-white">
      <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-sm md:p-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
            Browser SQL Editor
          </p>
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
            SQL editor for CSV, JSON, and Parquet files
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600">
            Run DuckDB-WASM queries on local files in your browser. SQL for Files
            includes table import, schema browsing, query history, charts,
            classification, CSV export, and local database backups.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/editor"
              className="inline-flex rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white"
            >
              Open interactive editor
            </Link>
            <Link
              to="/learn-sql"
              className="inline-flex rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700"
            >
              Browse Learn SQL lessons
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
