import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useDuckDBContext } from "../../contexts/DuckDBContext";
import { useFileAdd } from "../../hooks/useFileAdd";
import { useNotifications } from "../../contexts/NotificationContext";
import { saveTableToIndexedDB } from "../../utils/databasePersistence";
import AdvancedAddModal from "./AdvancedAddModal";

interface FileAdderProps {
  compact?: boolean;
}

/**
 * FileAdder Component
 *
 * Provides a drag-and-drop zone for adding CSV, JSON, and Parquet files.
 * Shows toast notifications for progress and errors.
 *
 * @param compact - When true, renders a simplified version for sidebar use
 */
export default function FileAdder({ compact = false }: FileAdderProps) {
  const { db, refreshTables } = useDuckDBContext();
  const { addFile } = useFileAdd(db);
  const { addNotification, updateNotification } = useNotifications();
  const [advancedOpen, setAdvancedOpen] = useState(false);

  /**
   * Handle dropped files
   * Called by react-dropzone when user drops or selects files
   */
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // Add each file sequentially
      for (const file of acceptedFiles) {
        // Show adding notification
        const notificationId = addNotification({
          type: 'adding',
          title: file.name,
          message: 'Adding file...',
        });

        try {
          // Update to processing
          updateNotification(notificationId, {
            type: 'processing',
            message: 'Creating table...',
          });

          const tableName = await addFile(file);

          // Update to success
          updateNotification(notificationId, {
            type: 'success',
            title: file.name,
            message: `Table "${tableName}" created successfully`,
            autoClose: true,
          });

          // Refresh the table list in the sidebar
          await refreshTables();

          // Auto-persist the new table to IndexedDB (Parquet)
          if (db) {
            try {
              const { warning } = await saveTableToIndexedDB(db, tableName);
              if (warning) {
                addNotification({ type: "info", title: warning });
              }
            } catch (persistErr) {
              console.error("Failed to persist table to IndexedDB:", persistErr);
            }
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

          // Update to error
          updateNotification(notificationId, {
            type: 'error',
            title: `Failed to add ${file.name}`,
            message: 'Click "Show details" to see the error',
            error: errorMessage,
            autoClose: false,
          });
        }
      }
    },
    [addFile, refreshTables, addNotification, updateNotification, db]
  );

  const handleAdvancedCreate = useCallback(
    async (params: {
      file: File;
      tableName: string;
      csvOptions?: {
        skip?: number;
        header?: boolean;
        delim?: string;
        quote?: string;
        escape?: string;
        nullStr?: string;
        dateformat?: string;
        decimal_separator?: string;
      };
    }) => {
      const { file, tableName, csvOptions } = params;
      const notificationId = addNotification({
        type: "adding",
        title: file.name,
        message: "Adding file...",
      });

      try {
        updateNotification(notificationId, {
          type: "processing",
          message: "Creating table...",
        });

        const createdTable = await addFile(file, {
          tableNameOverride: tableName,
          csvOptions,
        });

        updateNotification(notificationId, {
          type: "success",
          title: file.name,
          message: `Table "${createdTable}" created successfully`,
          autoClose: true,
        });

        await refreshTables();

        // Auto-persist the new table to IndexedDB (Parquet)
        if (db) {
          try {
            const { warning } = await saveTableToIndexedDB(db, createdTable);
            if (warning) {
              addNotification({ type: "info", title: warning });
            }
          } catch (persistErr) {
            console.error("Failed to persist table to IndexedDB:", persistErr);
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";

        updateNotification(notificationId, {
          type: "error",
          title: `Failed to add ${file.name}`,
          message: 'Click "Show details" to see the error',
          error: errorMessage,
          autoClose: false,
        });
        throw error;
      }
    },
    [addNotification, refreshTables, updateNotification, addFile, db]
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

  // Compact mode for sidebar
  const adderContent = compact ? (
    <div className="space-y-3">
      {/* Compact Add Button */}
      <div
        {...getRootProps()}
        className={`
          relative border border-dashed rounded-lg p-3 text-center cursor-pointer
          transition-all duration-150 group
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
          ${
            isDragActive
              ? "border-blue-400 bg-blue-50"
              : "border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50"
          }
        `}
      >
        <input {...getInputProps()} aria-label="Add data files" />

        <div className="flex items-center justify-center gap-2">
          <svg
            className={`h-4 w-4 transition-colors ${
              isDragActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-500"
            }`}
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
          <span className={`text-sm font-medium ${isDragActive ? "text-blue-600" : "text-slate-600"}`}>
            {isDragActive ? "Drop files here" : "Drop or click to add"}
          </span>
        </div>

        <div className="flex items-center justify-center gap-1.5 mt-1.5">
          <span className="text-xs text-slate-400">CSV</span>
          <span className="text-slate-200">·</span>
          <span className="text-xs text-slate-400">JSON</span>
          <span className="text-slate-200">·</span>
          <span className="text-xs text-slate-400">Parquet</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setAdvancedOpen(true)}
        className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors"
      >
        Advanced options
      </button>

      {/* Sample Data Link */}
      <a
        href="/sample_data.csv"
        download="sample_data.csv"
        className="flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        Try sample data
      </a>
    </div>
  ) : (
    <div className="space-y-4">
      {/* Mobile: Simple Button */}
      <div className="md:hidden">
        <button
          {...getRootProps()}
          className="w-full relative bg-slate-900 hover:bg-slate-800 text-white rounded-xl p-4 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <input {...getInputProps()} aria-label="Add data files" />

          <div className="flex items-center justify-center gap-3">
            <svg
              className="h-5 w-5"
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
            <span className="font-medium text-base">Choose Files</span>
          </div>

          <div className="flex items-center justify-center gap-2 mt-2.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/15 text-white/80">
              CSV
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/15 text-white/80">
              JSON
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/15 text-white/80">
              Parquet
            </span>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setAdvancedOpen(true)}
          className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors"
        >
          Advanced options
        </button>
      </div>

      {/* Desktop: Drag & Drop Area */}
      <div
        {...getRootProps()}
        className={`
          hidden md:block
          relative border border-dashed rounded-xl p-6 text-center cursor-pointer
          transition-all duration-150 group
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${
            isDragActive
              ? "border-blue-400 bg-blue-50"
              : "border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50"
          }
        `}
      >
        <input {...getInputProps()} aria-label="Add data files" />

        {/* Icon */}
        <div
          className={`mx-auto w-12 h-12 mb-3 rounded-xl flex items-center justify-center transition-colors duration-150 ${
            isDragActive
              ? "bg-blue-100"
              : "bg-slate-100 group-hover:bg-slate-200"
          }`}
        >
          <svg
            className={`h-6 w-6 transition-colors duration-150 ${
              isDragActive
                ? "text-blue-600"
                : "text-slate-400 group-hover:text-slate-500"
            }`}
            width="24"
            height="24"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>

        {/* Text */}
        {isDragActive ? (
          <div>
            <p className="text-base text-blue-600 font-medium mb-1">
              Drop files here
            </p>
            <p className="text-sm text-blue-500">Release to add</p>
          </div>
        ) : (
          <div>
            <p className="text-base text-slate-700 font-medium mb-1">
              Drag &amp; drop files here
            </p>
            <p className="text-sm text-slate-500 mb-3">
              or click to browse
            </p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                CSV
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                JSON
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                Parquet
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="hidden md:flex items-center justify-center">
        <button
          type="button"
          onClick={() => setAdvancedOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors"
        >
          Advanced options
        </button>
      </div>

      {/* Sample Data Download */}
      <div className="flex flex-col items-center justify-center gap-2 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <span>Don't have a file?</span>
          <a
            href="/sample_data.csv"
            download="sample_data.csv"
            className="inline-flex items-center gap-1 text-slate-600 font-medium hover:text-slate-900 transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
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
    </div>
  );

  return (
    <>
      {adderContent}
      <AdvancedAddModal
        isOpen={advancedOpen}
        onClose={() => setAdvancedOpen(false)}
        db={db}
        onCreateTable={handleAdvancedCreate}
      />
    </>
  );
}
