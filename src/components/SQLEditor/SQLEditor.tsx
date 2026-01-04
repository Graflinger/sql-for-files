import { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { useDuckDBContext } from "../../contexts/DuckDBContext";
import type { editor } from "monaco-editor";

interface SQLEditorProps {
  onExecute: (sql: string) => Promise<void>;
  executing: boolean;
  disabled?: boolean;
}

/**
 * SQLEditor Component
 *
 * Provides a SQL code editor with syntax highlighting.
 */
export default function SQLEditor({
  onExecute,
  executing,
  disabled = false,
}: SQLEditorProps) {
  // SQL query text
  const [sql, setSql] = useState("SELECT * FROM your_table LIMIT 10;");

  // Get DuckDB context
  const { db, tables } = useDuckDBContext();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [tableColumns, setTableColumns] = useState<
    Record<string, Array<{ name: string; type: string }>>
  >({});

  // Use refs to store latest values for the completion provider
  const tablesRef = useRef(tables);
  const tableColumnsRef = useRef(tableColumns);

  // Update refs when state changes
  useEffect(() => {
    tablesRef.current = tables;
  }, [tables]);

  useEffect(() => {
    tableColumnsRef.current = tableColumns;
  }, [tableColumns]);

  // Fetch columns for all tables when tables change
  useEffect(() => {
    async function fetchColumns() {
      if (!db || tables.length === 0) return;

      const columnsMap: Record<
        string,
        Array<{ name: string; type: string }>
      > = {};

      for (const tableName of tables) {
        try {
          const conn = await db.connect();
          const result = await conn.query(`
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = '${tableName}'
            ORDER BY ordinal_position
          `);

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          columnsMap[tableName] = result.toArray().map((row: any) => ({
            name: row.column_name as string,
            type: row.data_type as string,
          }));

          await conn.close();
        } catch (err) {
          console.error(`Failed to fetch columns for ${tableName}:`, err);
        }
      }

      setTableColumns(columnsMap);
    }

    fetchColumns();
  }, [db, tables]);

  /**
   * Handle editor mount - register autocomplete provider
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditorMount = (
    editorInstance: editor.IStandaloneCodeEditor,
    monaco: any
  ) => {
    editorRef.current = editorInstance;

    // Register SQL completion provider
    monaco.languages.registerCompletionItemProvider("sql", {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      provideCompletionItems: (_model: any, position: any) => {
        const suggestions = [];

        // Use refs to get latest values (fixes closure issue)
        const currentTables = tablesRef.current;
        const currentTableColumns = tableColumnsRef.current;

        // Add table names
        for (const tableName of currentTables) {
          suggestions.push({
            label: tableName,
            kind: monaco.languages.CompletionItemKind.Class,
            detail: "Table",
            insertText: tableName,
            range: {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: position.column,
              endColumn: position.column,
            },
          });

          // Add columns for each table
          const columns = currentTableColumns[tableName] || [];
          for (const column of columns) {
            suggestions.push({
              label: `${tableName}.${column.name}`,
              kind: monaco.languages.CompletionItemKind.Field,
              detail: `${tableName} (${column.type})`,
              insertText: `${tableName}.${column.name}`,
              documentation: `Column: ${column.name}\nType: ${column.type}\nTable: ${tableName}`,
              range: {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: position.column,
                endColumn: position.column,
              },
            });

            // Also add just the column name
            suggestions.push({
              label: column.name,
              kind: monaco.languages.CompletionItemKind.Field,
              detail: `${column.type} (from ${tableName})`,
              insertText: column.name,
              documentation: `Column: ${column.name}\nType: ${column.type}\nTable: ${tableName}`,
              range: {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: position.column,
                endColumn: position.column,
              },
            });
          }
        }

        // Add common SQL keywords
        const sqlKeywords = [
          "SELECT",
          "FROM",
          "WHERE",
          "GROUP BY",
          "ORDER BY",
          "HAVING",
          "JOIN",
          "LEFT JOIN",
          "RIGHT JOIN",
          "INNER JOIN",
          "OUTER JOIN",
          "LIMIT",
          "OFFSET",
          "AS",
          "DISTINCT",
          "COUNT",
          "SUM",
          "AVG",
          "MAX",
          "MIN",
          "AND",
          "OR",
          "NOT",
          "IN",
          "BETWEEN",
          "LIKE",
          "IS NULL",
          "IS NOT NULL",
          "CASE",
          "WHEN",
          "THEN",
          "ELSE",
          "END",
        ];

        for (const keyword of sqlKeywords) {
          suggestions.push({
            label: keyword,
            kind: monaco.languages.CompletionItemKind.Keyword,
            detail: "SQL Keyword",
            insertText: keyword,
            range: {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: position.column,
              endColumn: position.column,
            },
          });
        }

        return { suggestions };
      },
    });
  };

  /**
   * Handle query execution
   * Triggered by "Run Query" button or Ctrl+Enter
   *
   * If text is selected, executes only the selection.
   * Otherwise, executes the entire query.
   */
  const handleRunQuery = async () => {
    let queryToExecute = sql;

    // Check if there's a text selection in the editor
    if (editorRef.current) {
      const selection = editorRef.current.getSelection();
      const model = editorRef.current.getModel();

      // If there's a selection (not just cursor position)
      if (selection && model && !selection.isEmpty()) {
        // Get the selected text
        const selectedText = model.getValueInRange(selection);
        if (selectedText.trim()) {
          queryToExecute = selectedText;
        }
      }
    }

    if (!queryToExecute.trim()) {
      alert("Please enter a SQL query");
      return;
    }

    await onExecute(queryToExecute);
  };

  /**
   * Handle keyboard shortcuts
   * Ctrl+Enter / Cmd+Enter = Run query
   */
  const handleEditorKeyDown = (event: React.KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      handleRunQuery();
    }
  };

  return (
    <div className="space-y-4">
      {/* Editor Container */}
      <div
        className="border border-slate-300 rounded-xl overflow-hidden shadow-sm hover:border-blue-400 transition-colors"
        onKeyDown={handleEditorKeyDown}
      >
        <Editor
          height="200px"
          defaultLanguage="sql"
          value={sql}
          onChange={(value) => setSql(value || "")}
          onMount={handleEditorMount}
          theme="vs-light"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
          }}
        />
      </div>

      {/* Run Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleRunQuery}
          disabled={executing || disabled}
          className={`
            group relative px-8 py-3 rounded-xl font-semibold transition-all duration-200 overflow-hidden
            ${
              executing || disabled
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl active:scale-95"
            }
          `}
        >
          {executing ? (
            <span className="flex items-center gap-2 justify-center sm:justify-start">
              <svg
                className="animate-spin h-4 w-4"
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Executing...
            </span>
          ) : (
            <span className="flex items-center gap-2 justify-center sm:justify-start">
              <svg
                className="w-4 h-4"
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Run Query
            </span>
          )}
        </button>

        {/* Keyboard Shortcut Hint */}
        <div className=" items-center gap-2 text-sm text-slate-600 hidden sm:flex">
          <span>Press</span>
          <kbd className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs font-semibold shadow-sm">
            Ctrl+Enter
          </kbd>
          <span>to run</span>
          <span className="text-slate-400 ml-2">(selection or full query)</span>
        </div>
      </div>
    </div>
  );
}
