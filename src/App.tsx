import { DuckDBProvider } from './contexts/DuckDBContext';
import FileUploader from './components/FileUploader/FileUploader';
import SQLEditor from './components/SQLEditor/SQLEditor';
import TableList from './components/DatabaseManager/TableList';

/**
 * Main App Component
 *
 * Layout:
 * - Header with app title
 * - Left sidebar: Table list
 * - Main content: File uploader + SQL editor + results
 */
function App() {
  return (
    <DuckDBProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">
              SQL for Files
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Query CSV, JSON, and Parquet files using SQL — entirely in your browser
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar - Table List */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow p-4 sticky top-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-900">
                  Tables
                </h2>
                <TableList />
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-9 space-y-6">
              {/* File Upload Section */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-900">
                  Upload Data
                </h2>
                <FileUploader />
              </div>

              {/* SQL Editor Section */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-900">
                  SQL Query
                </h2>
                <SQLEditor />
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-12 pb-6 text-center text-sm text-gray-500">
          <p>
            Your data never leaves your device. All processing happens in your browser.
          </p>
        </footer>
      </div>
    </DuckDBProvider>
  );
}

export default App;
