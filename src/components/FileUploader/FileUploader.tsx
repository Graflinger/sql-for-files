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
  const { uploadFile, uploading, progress, clearProgress } = useFileUpload(db);

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
          border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
          }
        `}
      >
        <input {...getInputProps()} />

        {/* Icon */}
        <svg
          className="mx-auto h-12 w-12 text-gray-400 mb-4"
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

        {/* Text */}
        {isDragActive ? (
          <p className="text-lg text-blue-600 font-medium">
            Drop the files here...
          </p>
        ) : (
          <div>
            <p className="text-lg text-gray-700 font-medium mb-2">
              Drag & drop files here, or click to select
            </p>
            <p className="text-sm text-gray-500">
              Supports CSV, JSON, and Parquet files
            </p>
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {progress.length > 0 && (
        <div className="space-y-2">
          {progress.map((item, index) => (
            <div key={index} className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {item.fileName}
                </span>
                <span className="text-sm text-gray-500">
                  {item.status === 'done' && '✅ Complete'}
                  {item.status === 'uploading' && '⬆️ Uploading...'}
                  {item.status === 'processing' && '⚙️ Creating table...'}
                  {item.status === 'error' && '❌ Error'}
                </span>
              </div>

              {/* Progress Bar */}
              {item.status !== 'error' && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      item.status === 'done' ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              )}

              {/* Error Message */}
              {item.error && (
                <p className="text-sm text-red-600 mt-2">{item.error}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Status */}
      {uploading && (
        <div className="text-center text-sm text-gray-500">
          Uploading files...
        </div>
      )}
    </div>
  );
}
