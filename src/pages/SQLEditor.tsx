import { useCallback, useEffect, useRef } from "react";
import { useDuckDBContext } from "../contexts/DuckDBContext";
import { useEditorTabsContext } from "../contexts/EditorTabsContext";
import { useNotifications } from "../contexts/NotificationContext";
import FileAdder from "../components/FileAdder/FileAdder";
import SQLEditor from "../components/SQLEditor/SQLEditor";
import TableList from "../components/DatabaseManager/TableList";
import QueryResults from "../components/QueryResults/QueryResults";
import { IDELayout } from "../components/IDE";
import { useQueryExecution } from "../hooks/useQueryExecution";
import { useQueryHistory } from "../hooks/useQueryHistory";
import SEO from "../components/SEO/SEO";

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
  const { db, tables, refreshTables, restoredMessage } = useDuckDBContext();
  const { addQuery } = useQueryHistory();
  const { addNotification } = useNotifications();

  // Show restore notification once after page load
  const restoredShownRef = useRef(false);
  useEffect(() => {
    if (restoredMessage && !restoredShownRef.current) {
      restoredShownRef.current = true;
      addNotification({ type: "info", title: restoredMessage });
    }
  }, [restoredMessage, addNotification]);

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
      const sql = `SELECT * FROM ${tableName} LIMIT 100`;
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
      resultStats={resultStats}
      editorTabs={{
        tabs,
        activeTabId,
        onSelectTab: setActiveTab,
        onAddTab: addTab,
        onCloseTab: closeTab,
        onRenameTab: renameTab,
      }}
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
  return (
    <>
      <SEO
        title="SQL Editor for CSV, JSON & Parquet | SQL for Files"
        description="Run SQL queries on CSV, JSON, and Parquet files directly in your browser. Private, client-side data processing powered by DuckDB WASM."
        canonicalPath="/editor"
        ogType="website"
        imageAlt="SQL for Files SQL editor"
      />
      <SQLEditorContent />
    </>
  );
}
