import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { useDuckDBContext } from '../../contexts/DuckDBContext';
import { useQueryExecution } from '../../hooks/useQueryExecution';

/**
 * SQLEditor Component
 *
 * Provides a SQL code editor with syntax highlighting.
 * Executes queries and displays results in the ResultsViewer component.
 */
export default function SQLEditor() {
  const { db } = useDuckDBContext();
  const { executeQuery, executing, result, error } = useQueryExecution(db);

  // SQL query text
  const [sql, setSql] = useState('SELECT * FROM your_table LIMIT 10;');

  /**
   * Handle query execution
   * Triggered by "Run Query" button or Ctrl+Enter
   */
  const handleRunQuery = async () => {
    if (!sql.trim()) {
      alert('Please enter a SQL query');
      return;
    }

    await executeQuery(sql);
  };

  /**
   * Handle keyboard shortcuts
   * Ctrl+Enter / Cmd+Enter = Run query
   */
  const handleEditorKeyDown = (event: React.KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      handleRunQuery();
    }
  };

  return (
    <div className="space-y-4">
      {/* Editor Container */}
      <div
        className="border rounded-lg overflow-hidden"
        onKeyDown={handleEditorKeyDown}
      >
        <Editor
          height="200px"
          defaultLanguage="sql"
          value={sql}
          onChange={(value) => setSql(value || '')}
          theme="vs-light"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
          }}
        />
      </div>

      {/* Run Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleRunQuery}
          disabled={executing || !db}
          className={`
            px-6 py-2 rounded-lg font-medium transition-colors
            ${executing || !db
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
            }
          `}
        >
          {executing ? 'Executing...' : 'Run Query'}
        </button>

        {/* Keyboard Shortcut Hint */}
        <span className="text-sm text-gray-500">
          Press <kbd className="px-2 py-1 bg-gray-100 border rounded">Ctrl+Enter</kbd> to run
        </span>
      </div>

      {/* Results Section */}
      {result && (
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Query Results</h3>
            <div className="text-sm text-gray-500">
              {result.rowCount} rows • {result.executionTime.toFixed(2)}ms
            </div>
          </div>

          {/* Results Table */}
          {result.rowCount > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {result.columns.map((col) => (
                      <th
                        key={col}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {result.data.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      {result.columns.map((col) => (
                        <td
                          key={col}
                          className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap"
                        >
                          {row[col] !== null && row[col] !== undefined
                            ? String(row[col])
                            : <span className="text-gray-400 italic">null</span>
                          }
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Query executed successfully but returned no rows.
            </p>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <span className="text-red-600 font-semibold mr-2">Error:</span>
            <p className="text-red-700 text-sm">{error.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
