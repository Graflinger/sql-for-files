import { lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Layout from "./components/Layout/Layout";
import About from "./pages/About";
import Docs from "./pages/Docs";
import Privacy from "./pages/Privacy";
import Legal from "./pages/Legal";
import Guides from "./pages/Guides";
import GuideArticle from "./pages/GuideArticle";
import LearnSQL from "./pages/LearnSQL";
import UseCase from "./pages/UseCase";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import { NotificationProvider } from "./contexts/NotificationContext";
import NotificationContainer from "./components/Notification/NotificationContainer";
import { DuckDBProvider } from "./contexts/DuckDBContext";
import { EditorTabsProvider } from "./contexts/EditorTabsContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LearnSQLProvider } from "./contexts/LearnSQLContext";

const SqlEditor = lazy(() => import("./pages/SQLEditor"));

/** Wraps editor-only providers so public content routes avoid editor state setup. */
function EditorRoute() {
  const location = useLocation();
  const isPrerenderSnapshot = new URLSearchParams(location.search).has("prerender");

  return (
    <DuckDBProvider enabled={!isPrerenderSnapshot}>
      <EditorTabsProvider>
        <SqlEditor />
      </EditorTabsProvider>
    </DuckDBProvider>
  );
}

/**
 * Main App Component
 *
 * Handles routing for the application.
 * Editor-specific providers are scoped to editor routes so public content pages
 * prerender without DuckDB-WASM initialization.
 */
function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <LearnSQLProvider>
          <ScrollToTop />
          <NotificationContainer />
          <Layout>
            <Suspense
              fallback={
                <div className="mx-auto max-w-5xl px-4 py-16 text-center text-slate-600 dark:text-slate-300">
                  Loading the SQL editor...
                </div>
              }
            >
              <Routes>
                <Route path="/editor" element={<EditorRoute />} />
                <Route path="/editor/:chapterSlug/:lessonSlug" element={<EditorRoute />} />
                <Route path="/" element={<About />} />
                <Route path="/docs" element={<Docs />} />
                <Route path="/guides" element={<Guides />} />
                <Route path="/guides/:guideSlug" element={<GuideArticle />} />
                <Route path="/learn-sql" element={<LearnSQL />} />
                <Route path="/query-csv-with-sql" element={<UseCase kind="csv" />} />
                <Route path="/query-json-with-sql" element={<UseCase kind="json" />} />
                <Route path="/query-parquet-with-sql" element={<UseCase kind="parquet" />} />
                <Route path="/duckdb-wasm-sql-editor" element={<UseCase kind="duckdb" />} />
                <Route path="/private-local-data-analysis" element={<UseCase kind="private" />} />
                <Route path="/sql-examples-for-files" element={<UseCase kind="examples" />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/legal" element={<Legal />} />
              </Routes>
            </Suspense>
          </Layout>
        </LearnSQLProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
