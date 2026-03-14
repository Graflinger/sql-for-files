import { useEffect, useMemo, useState } from "react";
import type { AsyncDuckDB } from "@duckdb/duckdb-wasm";
import { defaultTableNameFromFile, sanitizeTableName } from "../../utils/tableName";
import { withDuckDBConnection } from "../../utils/duckdb";
import { quoteStringLiteral } from "../../utils/sql";

interface CsvOptions {
  skip?: number;
  header?: boolean;
  delim?: string;
  quote?: string;
  escape?: string;
  nullStr?: string;
  dateformat?: string;
  decimal_separator?: string;
}

interface PreviewResult {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
}

interface AdvancedAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  db: AsyncDuckDB | null;
  onCreateTable: (params: {
    file: File;
    tableName: string;
    csvOptions?: CsvOptions;
  }) => Promise<void>;
}

const PREVIEW_LIMIT = 10;

function isCsvFile(file?: File | null) {
  return file?.name.toLowerCase().endsWith(".csv");
}

function isJsonFile(file?: File | null) {
  return file?.name.toLowerCase().endsWith(".json");
}

function isParquetFile(file?: File | null) {
  return file?.name.toLowerCase().endsWith(".parquet");
}

function getFileTypeLabel(file?: File | null) {
  if (!file) return "";
  if (isCsvFile(file)) return "CSV";
  if (isJsonFile(file)) return "JSON";
  if (isParquetFile(file)) return "Parquet";
  return "Unsupported";
}

function isSupportedFile(file?: File | null) {
  return isCsvFile(file) || isJsonFile(file) || isParquetFile(file);
}

function toOptionalNumber(value: string): number | undefined {
  if (value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function buildCsvOptionsSql(options?: CsvOptions): string {
  if (!options) return "";

  const parts: string[] = [];

  if (typeof options.skip === "number") {
    parts.push(`skip=${options.skip}`);
  }

  if (typeof options.header === "boolean") {
    parts.push(`header=${options.header}`);
  }

  if (options.delim) {
    parts.push(`delim=${quoteStringLiteral(options.delim)}`);
  }

  if (options.quote) {
    parts.push(`quote=${quoteStringLiteral(options.quote)}`);
  }

  if (options.escape) {
    parts.push(`escape=${quoteStringLiteral(options.escape)}`);
  }

  if (options.nullStr) {
    parts.push(`nullstr=${quoteStringLiteral(options.nullStr)}`);
  }

  if (options.dateformat) {
    parts.push(`dateformat=${quoteStringLiteral(options.dateformat)}`);
  }

  if (options.decimal_separator) {
    parts.push(`decimal_separator=${quoteStringLiteral(options.decimal_separator)}`);
  }

  if (parts.length === 0) return "";
  return `, ${parts.join(", ")}`;
}

function getPreviewQuery(file: File, csvOptions?: CsvOptions) {
  const fileName = file.name;
  if (isCsvFile(file)) {
    const optionsSql = buildCsvOptionsSql(csvOptions);
    return `SELECT * FROM read_csv_auto(${quoteStringLiteral(fileName)}${optionsSql}) LIMIT ${PREVIEW_LIMIT}`;
  }

  if (isJsonFile(file)) {
    return `SELECT * FROM read_json_auto(${quoteStringLiteral(fileName)}) LIMIT ${PREVIEW_LIMIT}`;
  }

  if (isParquetFile(file)) {
    return `SELECT * FROM read_parquet(${quoteStringLiteral(fileName)}) LIMIT ${PREVIEW_LIMIT}`;
  }

  return "";
}

export default function AdvancedAddModal({
  isOpen,
  onClose,
  db,
  onCreateTable,
}: AdvancedAddModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rawTableName, setRawTableName] = useState("");
  const [tableNameTouched, setTableNameTouched] = useState(false);
  const [csvOptions, setCsvOptions] = useState<CsvOptions>({});
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const sanitizedTableName = useMemo(() => {
    if (!rawTableName.trim() && selectedFile) {
      return defaultTableNameFromFile(selectedFile.name);
    }
    if (!rawTableName.trim()) return "";
    return sanitizeTableName(rawTableName.trim());
  }, [rawTableName, selectedFile]);

  const showSanitizedHint =
    tableNameTouched && rawTableName.trim() && rawTableName.trim() !== sanitizedTableName;

  useEffect(() => {
    if (!isOpen) return;
    setSelectedFile(null);
    setRawTableName("");
    setTableNameTouched(false);
    setCsvOptions({});
    setPreview(null);
    setPreviewError(null);
    setCreating(false);
  }, [isOpen]);

  useEffect(() => {
    let isActive = true;

    async function loadPreview() {
      if (!db || !selectedFile || !isSupportedFile(selectedFile)) {
        setPreview(null);
        setPreviewError(null);
        return;
      }

      setPreviewLoading(true);
      setPreviewError(null);

      try {
        const buffer = new Uint8Array(await selectedFile.arrayBuffer());
        await db.registerFileBuffer(selectedFile.name, buffer);
        const sql = getPreviewQuery(selectedFile, isCsvFile(selectedFile) ? csvOptions : undefined);
        const result = await withDuckDBConnection(db, async (conn) => conn.query(sql));
        const columns = result.schema.fields.map((field: { name: string }) => field.name);
        const rows = result.toArray().map((row) => {
          const obj: Record<string, unknown> = {};
          columns.forEach((col) => {
            obj[col] = row[col];
          });
          return obj;
        });

        if (!isActive) return;
        setPreview({
          columns,
          rows,
          rowCount: result.numRows,
        });
      } catch (error) {
        if (!isActive) return;
        setPreview(null);
        setPreviewError(
          error instanceof Error ? error.message : "Failed to load preview"
        );
      } finally {
        try {
          await db.dropFile(selectedFile.name);
        } catch {
          // Ignore cleanup failures when preview setup did not register a file.
        }
        if (isActive) {
          setPreviewLoading(false);
        }
      }
    }

    loadPreview();

    return () => {
      isActive = false;
    };
  }, [db, selectedFile, csvOptions]);

  if (!isOpen) return null;

  const previewState = (() => {
    if (!db) {
      return "Database initializing...";
    }
    if (!selectedFile) {
      return "Select a file to preview";
    }
    if (!isSupportedFile(selectedFile)) {
      return "Unsupported file type";
    }
    if (previewLoading) {
      return "Loading preview...";
    }
    if (previewError) {
      return previewError;
    }
    if (!preview || preview.rows.length === 0) {
      return "No preview rows available";
    }
    return "";
  })();

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    setPreview(null);
    setPreviewError(null);
    if (file && !tableNameTouched) {
      setRawTableName(defaultTableNameFromFile(file.name));
    }
  };

  const handleCreate = async () => {
    if (!db || !selectedFile || !sanitizedTableName) return;

    setCreating(true);
    try {
      await onCreateTable({
        file: selectedFile,
        tableName: sanitizedTableName,
        csvOptions: isCsvFile(selectedFile) ? csvOptions : undefined,
      });
      onClose();
    } catch (error) {
      setPreviewError(error instanceof Error ? error.message : "Failed to create table");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60"
        onClick={onClose}
      ></div>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="advanced-options-title"
        className="relative w-[min(1100px,95vw)] max-h-[90vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div>
            <h2 id="advanced-options-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Advanced Options
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Preview data and configure CSV settings before creating a table
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Close advanced options"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-0 max-h-[calc(90vh-120px)] overflow-hidden">
          <div className="overflow-y-auto border-r border-slate-200 bg-slate-50/60 p-6 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  File
                </label>
                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-center transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-500 dark:hover:bg-blue-950/30">
                  <input
                    type="file"
                    accept=".csv,.json,.parquet"
                    className="hidden"
                    onChange={(event) =>
                      handleFileChange(event.target.files?.[0] ?? null)
                    }
                  />
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {selectedFile ? selectedFile.name : "Select a file"}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedFile ? getFileTypeLabel(selectedFile) : "CSV, JSON, or Parquet"}
                  </div>
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200" htmlFor="table-name">
                  Table name
                </label>
                <input
                  id="table-name"
                  type="text"
                  value={rawTableName}
                  onChange={(event) => {
                    setRawTableName(event.target.value);
                    setTableNameTouched(true);
                  }}
                  placeholder={selectedFile ? defaultTableNameFromFile(selectedFile.name) : "table_name"}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:placeholder:text-slate-500"
                />
                {showSanitizedHint && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Saved as <span className="font-mono text-slate-700 dark:text-slate-200">{sanitizedTableName}</span>
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">CSV options</h3>
                  {!isCsvFile(selectedFile) && (
                    <span className="text-xs text-slate-400 dark:text-slate-500">CSV only</span>
                  )}
                </div>

                <div className={`space-y-3 ${!isCsvFile(selectedFile) ? "pointer-events-none opacity-50" : ""}`}>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Skip rows</label>
                      <input
                        type="number"
                        min={0}
                        value={csvOptions.skip ?? ""}
                        onChange={(event) =>
                          setCsvOptions((prev) => ({
                            ...prev,
                            skip: toOptionalNumber(event.target.value),
                          }))
                        }
                        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Header row</label>
                      <select
                        value={
                          typeof csvOptions.header === "boolean"
                            ? String(csvOptions.header)
                            : "auto"
                        }
                        onChange={(event) =>
                          setCsvOptions((prev) => ({
                            ...prev,
                            header:
                              event.target.value === "auto"
                                ? undefined
                                : event.target.value === "true",
                          }))
                        }
                        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                      >
                        <option value="auto">Auto</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Delimiter</label>
                      <input
                        type="text"
                        value={csvOptions.delim ?? ""}
                        onChange={(event) =>
                          setCsvOptions((prev) => ({
                            ...prev,
                            delim: event.target.value || undefined,
                          }))
                        }
                        placeholder="," 
                        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:placeholder:text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Quote</label>
                      <input
                        type="text"
                        value={csvOptions.quote ?? ""}
                        onChange={(event) =>
                          setCsvOptions((prev) => ({
                            ...prev,
                            quote: event.target.value || undefined,
                          }))
                        }
                        placeholder={'"'}
                        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Escape</label>
                      <input
                        type="text"
                        value={csvOptions.escape ?? ""}
                        onChange={(event) =>
                          setCsvOptions((prev) => ({
                            ...prev,
                            escape: event.target.value || undefined,
                          }))
                        }
                        placeholder="\\"
                        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:placeholder:text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Null string</label>
                      <input
                        type="text"
                        value={csvOptions.nullStr ?? ""}
                        onChange={(event) =>
                          setCsvOptions((prev) => ({
                            ...prev,
                            nullStr: event.target.value || undefined,
                          }))
                        }
                        placeholder="NULL"
                        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Date format</label>
                      <input
                        type="text"
                        value={csvOptions.dateformat ?? ""}
                        onChange={(event) =>
                          setCsvOptions((prev) => ({
                            ...prev,
                            dateformat: event.target.value || undefined,
                          }))
                        }
                        placeholder="%Y-%m-%d"
                        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:placeholder:text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Decimal separator</label>
                      <input
                        type="text"
                        value={csvOptions.decimal_separator ?? ""}
                        onChange={(event) =>
                          setCsvOptions((prev) => ({
                            ...prev,
                            decimal_separator: event.target.value || undefined,
                          }))
                        }
                        placeholder="."
                        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Preview (first {PREVIEW_LIMIT} rows)</h3>
              {selectedFile && isSupportedFile(selectedFile) && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {getFileTypeLabel(selectedFile)}
                </span>
              )}
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
              {previewState ? (
                <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                  {previewState}
                </div>
              ) : preview ? (
                <div className="overflow-auto max-h-[50vh]">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                      <tr>
                        {preview.columns.map((col) => (
                          <th
                            key={col}
                            className="border-b border-slate-200 px-3 py-2 text-left font-semibold dark:border-slate-800"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="text-slate-700 dark:text-slate-200">
                      {preview.rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="odd:bg-white even:bg-slate-50 dark:odd:bg-slate-950 dark:even:bg-slate-900/80">
                          {preview.columns.map((col) => (
                            <td key={col} className="border-b border-slate-100 px-3 py-2 dark:border-slate-800/70">
                              {row[col] === null || row[col] === undefined ? (
                                <span className="text-xs text-slate-400 dark:text-slate-500">null</span>
                              ) : (
                                String(row[col])
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/80">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Preview does not create a table until you click Create table
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!db || !selectedFile || !sanitizedTableName || !isSupportedFile(selectedFile) || creating}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
            >
              {creating ? "Creating..." : "Create table"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
