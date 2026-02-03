import { DuckDBProvider, useDuckDBContext } from "../contexts/DuckDBContext";
import FileUploader from "../components/FileUploader/FileUploader";
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
 * - Collapsible sidebar (file upload + table list)
 * - SQL editor panel (top)
 * - Resizable results panel (bottom)
 */
function SQLEditorContent() {
  const { db, tables } = useDuckDBContext();
  const { addQuery } = useQueryHistory();

  const { executeQuery, executing, result, error } = useQueryExecution(db, {
    onQueryExecuted: async (params) => {
      await addQuery(params);
    },
  });

  const handleExecute = async (sql: string) => {
    await executeQuery(sql);
  };

  const handlePreviewTable = async (tableName: string) => {
    await executeQuery(`SELECT * FROM ${tableName} LIMIT 10`);
  };

  // Result stats for the results panel header
  const resultStats = result
    ? {
        rowCount: result.rowCount,
        executionTime: result.executionTime,
        hasError: false,
      }
    : error
    ? { hasError: true }
    : undefined;

  return (
    <IDELayout
      sidebarContent={{
        upload: <FileUploader compact />,
        tables: <TableList onPreviewTable={handlePreviewTable} />,
        tableCount: tables.length > 0 ? tables.length : undefined,
      }}
      editorContent={
        <SQLEditor
          onExecute={handleExecute}
          executing={executing}
          disabled={!db}
          flexHeight
        />
      }
      resultsContent={<QueryResults result={result} error={error} embedded />}
      resultStats={resultStats}
    />
  );
}

/**
 * SQL Editor Page
 *
 * Wraps content with DuckDB provider for database access.
 */
export default function SqlEditorPage() {
  return (
    <DuckDBProvider>
      <SEO
        title="SQL Editor for CSV, JSON & Parquet | SQL for Files"
        description="Run SQL queries on CSV, JSON, and Parquet files directly in your browser. Private, client-side data processing powered by DuckDB WASM."
        canonicalPath="/editor"
        ogType="website"
        imageAlt="SQL for Files SQL editor"
      />
      <SQLEditorContent />
    </DuckDBProvider>
  );
}
