import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDuckDBContext } from '../../contexts/DuckDBContext';
import { useFileUpload } from '../../hooks/useFileUpload';

/**
 * FileUploader Component
 *
 * Provides a drag-and-drop zone for uploading CSV, JSON, and Parquet files.
 * Shows upload progress and refreshes the table list after successful upload.
 */
export default function FileUploader() {
  const { db, refreshTables } = useDuckDBContext();
  const { uploadFile, progress, clearProgress } = useFileUpload(db);

  /**
   * Handle dropped files
   * Called by react-dropzone when user drops or selects files
   */
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Clear previous progress
    clearProgress();

    // Upload each file sequentially
    for (const file of acceptedFiles) {
      try {
        const tableName = await uploadFile(file);
        console.log(`✅ Created table: ${tableName}`);

        // Refresh the table list in the sidebar
        await refreshTables();
      } catch (error) {
        console.error(`❌ Failed to upload ${file.name}:`, error);
      }
    }
  }, [uploadFile, refreshTables, clearProgress]);

  /**
   * Configure react-dropzone
   * - Accept only .csv, .json, .parquet files
   * - Allow multiple files
   */
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json'],
      'application/octet-stream': ['.parquet']
    },
    multiple: true
  });

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
          transition-all duration-300 overflow-hidden group
          ${isDragActive
            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg scale-[1.02]'
            : 'border-slate-300 hover:border-blue-400 bg-gradient-to-br from-slate-50 to-white hover:shadow-md'
          }
        `}
      >
        <input {...getInputProps()} />

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, #1e40af 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}></div>
        </div>

        {/* Icon */}
        <div className={`relative mx-auto w-20 h-20 mb-4 rounded-2xl flex items-center justify-center transition-all duration-300 ${
          isDragActive
            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 scale-110 shadow-lg'
            : 'bg-gradient-to-br from-slate-200 to-slate-300 group-hover:from-blue-400 group-hover:to-indigo-500 group-hover:scale-105'
        }`}>
          <svg
            className={`h-10 w-10 transition-colors duration-300 ${
              isDragActive ? 'text-white' : 'text-slate-600 group-hover:text-white'
            }`}
            width="40"
            height="40"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Text */}
        {isDragActive ? (
          <div className="relative">
            <p className="text-xl text-blue-700 font-bold mb-2">
              Drop the files here!
            </p>
            <p className="text-sm text-blue-600">
              Release to upload
            </p>
          </div>
        ) : (
          <div className="relative">
            <p className="text-lg text-slate-800 font-bold mb-2">
              Drag & drop files here
            </p>
            <p className="text-sm text-slate-600 mb-3">
              or click to browse your computer
            </p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                CSV
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                JSON
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                Parquet
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {progress.length > 0 && (
        <div className="space-y-3">
          {progress.map((item, index) => (
            <div key={index} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <svg className="w-5 h-5 text-slate-400 flex-shrink-0" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm font-semibold text-slate-700 truncate">
                    {item.fileName}
                  </span>
                </div>
                <span className={`text-sm font-medium whitespace-nowrap ml-3 ${
                  item.status === 'done' ? 'text-green-600' :
                  item.status === 'error' ? 'text-red-600' :
                  'text-blue-600'
                }`}>
                  {item.status === 'done' && (
                    <span className="inline-flex items-center gap-1">
                      <svg className="w-4 h-4" width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Complete
                    </span>
                  )}
                  {item.status === 'uploading' && '⬆️ Uploading...'}
                  {item.status === 'processing' && '⚙️ Creating table...'}
                  {item.status === 'error' && '❌ Error'}
                </span>
              </div>

              {/* Progress Bar */}
              {item.status !== 'error' && (
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      item.status === 'done'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                        : 'bg-gradient-to-r from-blue-500 to-indigo-500 animate-pulse'
                    }`}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              )}

              {/* Error Message */}
              {item.error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{item.error}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
