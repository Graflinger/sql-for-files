import { useCallback, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import { useDuckDBContext } from "../contexts/DuckDBContext";
import { useEditorTabsContext } from "../contexts/EditorTabsContext";
import { useNotifications } from "../contexts/NotificationContext";
import { useLearnSQL } from "../contexts/LearnSQLContext";
import { chapterForLesson, lessonByRoute, lessonNumbering } from "../data/lessons";
import FileAdder from "../components/FileAdder/FileAdder";
import SQLEditor from "../components/SQLEditor/SQLEditor";
import TableList from "../components/DatabaseManager/TableList";
import QueryResults from "../components/QueryResults/QueryResults";
import QueryHistorySidebar from "../components/QueryHistory/QueryHistorySidebar";
import LearnSQLPanel from "../components/LearnSQL/LearnSQLPanel";
import { IDELayout } from "../components/IDE";
import { useQueryExecution } from "../hooks/useQueryExecution";
import { useQueryHistory } from "../hooks/useQueryHistory";
import SEO from "../components/SEO/SEO";
import { quoteIdentifier } from "../utils/sql";

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

/**
 * SQL Editor Page
 *
 * DuckDB and editor tab providers are global (in App.tsx),
 * so this component is just SEO + content.
 */
export default function SqlEditorPage() {
  const location = useLocation();
  const { chapterSlug, lessonSlug } = useParams();
  const isPrerenderSnapshot = new URLSearchParams(location.search).has("prerender");
  const routeLesson =
    chapterSlug && lessonSlug ? lessonByRoute(chapterSlug, lessonSlug) : null;
  const canonicalPath =
    chapterSlug && lessonSlug && routeLesson
      ? `/editor/${chapterSlug}/${lessonSlug}`
      : "/editor";
  const pageTitle = routeLesson
    ? `${routeLesson.title} | Learn SQL | SQL for Files`
    : "SQL Editor for CSV, JSON & Parquet | SQL for Files";
  const pageDescription = routeLesson
    ? `Open the ${routeLesson.title} Learn SQL lesson directly in the SQL for Files editor.`
    : "Run SQL queries on CSV, JSON, and Parquet files directly in your browser. Files, SQL queries, and results stay local in your browser.";
  const routeChapter = routeLesson ? chapterForLesson(routeLesson.id) : null;
  const routeNumbering = routeLesson ? lessonNumbering(routeLesson.id) : null;
  const structuredData = routeLesson
    ? [
        {
          "@context": "https://schema.org",
          "@type": "LearningResource",
          name: routeLesson.title,
          description: pageDescription,
          url: `https://sqlforfiles.app${canonicalPath}`,
          learningResourceType: "Lesson",
          teaches: routeChapter?.title ?? "SQL",
          position: routeNumbering?.lessonNumber,
          provider: {
            "@type": "Organization",
            name: "SQL for Files",
            url: "https://sqlforfiles.app/",
          },
        },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: "https://sqlforfiles.app/",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Learn SQL",
              item: "https://sqlforfiles.app/learn-sql",
            },
            {
              "@type": "ListItem",
              position: 3,
              name: routeLesson.title,
              item: `https://sqlforfiles.app${canonicalPath}`,
            },
          ],
        },
      ]
    : {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "SQL for Files Editor",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web Browser",
        url: "https://sqlforfiles.app/editor",
        description: pageDescription,
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
        ogType="website"
        imageAlt="SQL for Files SQL editor"
        structuredData={structuredData}
      />
      {isPrerenderSnapshot ? (
        <SQLEditorSnapshot lesson={routeLesson} />
      ) : (
        <SQLEditorContent />
      )}
    </>
  );
}

interface SQLEditorSnapshotProps {
  lesson: ReturnType<typeof lessonByRoute>;
}

function SQLEditorSnapshot({ lesson }: SQLEditorSnapshotProps) {
  if (lesson) {
    return (
      <div className="theme-page min-h-screen bg-white">
        <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-sm md:p-10">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
              Learn SQL Lesson
            </p>
            <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
              {lesson.title}
            </h1>
            <div className="mt-6 space-y-5 text-base leading-7 text-slate-700">
              {lesson.content.split("\n\n").map((block) => {
                const trimmed = block.trim();
                const isSqlBlock = trimmed.startsWith("```sql") && trimmed.endsWith("```");

                if (isSqlBlock) {
                  return (
                    <pre
                      key={trimmed}
                      className="overflow-x-auto rounded-xl bg-slate-900 p-4 text-sm text-slate-100"
                    >
                      <code>{trimmed.replace(/^```sql\n/, "").replace(/```$/, "")}</code>
                    </pre>
                  );
                }

                return <p key={trimmed}>{trimmed}</p>;
              })}
            </div>
            {lesson.challenge && (
              <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-5">
                <h2 className="text-lg font-semibold text-blue-950">
                  Practice challenge
                </h2>
                <p className="mt-2 text-sm leading-6 text-blue-900">
                  {lesson.challenge.prompt}
                </p>
              </div>
            )}
            <Link
              to="/editor"
              className="mt-8 inline-flex rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white"
            >
              Open interactive editor
            </Link>
          </div>
        </article>
      </div>
    );
  }

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
          <Link
            to="/editor"
            className="mt-8 inline-flex rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white"
          >
            Open interactive editor
          </Link>
        </div>
      </section>
    </div>
  );
}
