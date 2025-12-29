import { useState } from 'react';
import Editor from '@monaco-editor/react';

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
export default function SQLEditor({ onExecute, executing, disabled = false }: SQLEditorProps) {

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

    await onExecute(sql);
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
        className="border border-slate-300 rounded-xl overflow-hidden shadow-sm hover:border-blue-400 transition-colors"
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
          disabled={executing || disabled}
          className={`
            group relative px-8 py-3 rounded-xl font-semibold transition-all duration-200 overflow-hidden
            ${executing || disabled
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl active:scale-95'
            }
          `}
        >
          {executing ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" width="16" height="16" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Executing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Run Query
            </span>
          )}
        </button>

        {/* Keyboard Shortcut Hint */}
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span>Press</span>
          <kbd className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs font-semibold shadow-sm">
            Ctrl+Enter
          </kbd>
          <span>to run</span>
        </div>
      </div>
    </div>
  );
}
