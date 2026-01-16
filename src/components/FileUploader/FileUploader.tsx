import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useDuckDBContext } from "../../contexts/DuckDBContext";
import { useFileUpload } from "../../hooks/useFileUpload";
import { useNotifications } from "../../contexts/NotificationContext";

/**
 * FileUploader Component
 *
 * Provides a drag-and-drop zone for uploading CSV, JSON, and Parquet files.
 * Shows toast notifications for upload progress and errors.
 */
export default function FileUploader() {
  const { db, refreshTables } = useDuckDBContext();
  const { uploadFile } = useFileUpload(db);
  const { addNotification, updateNotification } = useNotifications();

  /**
   * Handle dropped files
   * Called by react-dropzone when user drops or selects files
   */
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // Upload each file sequentially
      for (const file of acceptedFiles) {
        // Show uploading notification
        const notificationId = addNotification({
          type: 'uploading',
          title: file.name,
          message: 'Uploading file...',
        });

        try {
          // Update to processing
          updateNotification(notificationId, {
            type: 'processing',
            message: 'Creating table...',
          });

          const tableName = await uploadFile(file);

          // Update to success
          updateNotification(notificationId, {
            type: 'success',
            title: file.name,
            message: `Table "${tableName}" created successfully`,
            autoClose: true,
          });

          // Refresh the table list in the sidebar
          await refreshTables();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

          // Update to error
          updateNotification(notificationId, {
            type: 'error',
            title: `Failed to upload ${file.name}`,
            message: 'Click "Show details" to see the error',
            error: errorMessage,
            autoClose: false,
          });
        }
      }
    },
    [uploadFile, refreshTables, addNotification, updateNotification]
  );

  /**
   * Configure react-dropzone
   * - Accept only .csv, .json, .parquet files
   * - Allow multiple files
   */
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/json": [".json"],
      "application/octet-stream": [".parquet"],
    },
    multiple: true,
  });

  return (
    <div className="space-y-4">
      {/* Mobile: Simple Button */}
      <div className="md:hidden">
        <button
          {...getRootProps()}
          className="w-full relative bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <input {...getInputProps()} aria-label="Upload data files" />

          <div className="flex items-center justify-center gap-3">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span className="font-semibold text-lg">Choose Files</span>
          </div>

          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
              CSV
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
              JSON
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
              Parquet
            </span>
          </div>
        </button>
      </div>

      {/* Desktop: Drag & Drop Area */}
      <div
        {...getRootProps()}
        className={`
          hidden md:block
          relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
          transition-all duration-300 overflow-hidden group
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${
            isDragActive
              ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg scale-[1.02]"
              : "border-slate-300 hover:border-blue-400 bg-gradient-to-br from-slate-50 to-white hover:shadow-md"
          }
        `}
      >
        <input {...getInputProps()} aria-label="Upload data files" />

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle, #1e40af 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          ></div>
        </div>

        {/* Icon */}
        <div
          className={`relative mx-auto w-14 h-14 mb-3 rounded-xl flex items-center justify-center transition-all duration-300 ${
            isDragActive
              ? "bg-gradient-to-br from-blue-500 to-indigo-600 scale-110 shadow-lg"
              : "bg-gradient-to-br from-slate-200 to-slate-300 group-hover:from-blue-400 group-hover:to-indigo-500 group-hover:scale-105"
          }`}
        >
          <svg
            className={`h-8 w-8 transition-colors duration-300 ${
              isDragActive
                ? "text-white"
                : "text-slate-600 group-hover:text-white"
            }`}
            width="32"
            height="32"
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
            <p className="text-sm text-blue-600">Release to upload</p>
          </div>
        ) : (
          <div className="relative">
            <p className="text-lg text-slate-800 font-bold mb-2">
              Drag & drop files here
            </p>
            <p className="text-sm text-slate-600 mb-3">
              or click to browse your device
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

      {/* Sample Data Download */}
      <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
        <span>Don't have a file?</span>
        <a
          href="/sample_data.csv"
          download="sample_data.csv"
          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Download sample data
        </a>
      </div>
    </div>
  );
}
