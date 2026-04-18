import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import About from "./pages/About";
import Docs from "./pages/Docs";
import Privacy from "./pages/Privacy";
import Legal from "./pages/Legal";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import { NotificationProvider } from "./contexts/NotificationContext";
import NotificationContainer from "./components/Notification/NotificationContainer";
import { DuckDBProvider } from "./contexts/DuckDBContext";
import { EditorTabsProvider } from "./contexts/EditorTabsContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LearnSQLProvider } from "./contexts/LearnSQLContext";

const SqlEditor = lazy(() => import("./pages/SQLEditor"));

/**
 * Main App Component
 *
 * Handles routing for the application.
 * DuckDBProvider and EditorTabsProvider are global so state
 * (database, tables, query results) survives page navigation.
 */
function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <DuckDBProvider>
          <EditorTabsProvider>
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
                    <Route path="/editor" element={<SqlEditor />} />
                    <Route path="/" element={<About />} />
                    <Route path="/docs" element={<Docs />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/legal" element={<Legal />} />
                  </Routes>
                </Suspense>
              </Layout>
            </LearnSQLProvider>
          </EditorTabsProvider>
        </DuckDBProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
