import { useEffect, useMemo, useState } from "react";
import type { AsyncDuckDB } from "@duckdb/duckdb-wasm";
import { defaultTableNameFromFile, sanitizeTableName } from "../../utils/tableName";

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

interface AdvancedUploadModalProps {
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
    parts.push(`delim='${escapeSqlString(options.delim)}'`);
  }

  if (options.quote) {
    parts.push(`quote='${escapeSqlString(options.quote)}'`);
  }

  if (options.escape) {
    parts.push(`escape='${escapeSqlString(options.escape)}'`);
  }

  if (options.nullStr) {
    parts.push(`nullstr='${escapeSqlString(options.nullStr)}'`);
  }

  if (options.dateformat) {
    parts.push(`dateformat='${escapeSqlString(options.dateformat)}'`);
  }

  if (options.decimal_separator) {
    parts.push(`decimal_separator='${escapeSqlString(options.decimal_separator)}'`);
  }

  if (parts.length === 0) return "";
  return `, ${parts.join(", ")}`;
}

function escapeSqlString(value: string): string {
  return value.replace(/'/g, "''");
}

function getPreviewQuery(file: File, csvOptions?: CsvOptions) {
  const fileName = file.name;
  if (isCsvFile(file)) {
    const optionsSql = buildCsvOptionsSql(csvOptions);
    return `SELECT * FROM read_csv_auto('${fileName}'${optionsSql}) LIMIT ${PREVIEW_LIMIT}`;
  }

  if (isJsonFile(file)) {
    return `SELECT * FROM read_json_auto('${fileName}') LIMIT ${PREVIEW_LIMIT}`;
  }

  if (isParquetFile(file)) {
    return `SELECT * FROM read_parquet('${fileName}') LIMIT ${PREVIEW_LIMIT}`;
  }

  return "";
}

export default function AdvancedUploadModal({
  isOpen,
  onClose,
  db,
  onCreateTable,
}: AdvancedUploadModalProps) {
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

      let conn: Awaited<ReturnType<typeof db.connect>> | null = null;
      try {
        const buffer = new Uint8Array(await selectedFile.arrayBuffer());
        await db.registerFileBuffer(selectedFile.name, buffer);

        conn = await db.connect();
        const sql = getPreviewQuery(selectedFile, isCsvFile(selectedFile) ? csvOptions : undefined);
        const result = await conn.query(sql);
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
        await conn.close();
        conn = null;
      } catch (error) {
        if (!isActive) return;
        setPreview(null);
        setPreviewError(
          error instanceof Error ? error.message : "Failed to load preview"
        );
      } finally {
        if (conn) {
          await conn.close();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-slate-900/60"
        onClick={onClose}
      ></div>
      <div className="relative bg-white w-[min(1100px,95vw)] max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Advanced Upload
            </h2>
            <p className="text-sm text-slate-500">
              Preview data and configure CSV settings before creating a table
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close advanced upload"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-0 max-h-[calc(90vh-120px)] overflow-hidden">
          <div className="border-r border-slate-200 p-6 overflow-y-auto">
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  File
                </label>
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200 border-slate-300 hover:border-blue-400 bg-slate-50 hover:bg-blue-50">
                  <input
                    type="file"
                    accept=".csv,.json,.parquet"
                    className="hidden"
                    onChange={(event) =>
                      handleFileChange(event.target.files?.[0] ?? null)
                    }
                  />
                  <div className="text-sm font-medium text-slate-700">
                    {selectedFile ? selectedFile.name : "Select a file"}
                  </div>
                  <div className="text-xs text-slate-500">
                    {selectedFile ? getFileTypeLabel(selectedFile) : "CSV, JSON, or Parquet"}
                  </div>
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700" htmlFor="table-name">
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
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {showSanitizedHint && (
                  <p className="text-xs text-slate-500">
                    Saved as <span className="font-mono text-slate-700">{sanitizedTableName}</span>
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-700">CSV options</h3>
                  {!isCsvFile(selectedFile) && (
                    <span className="text-xs text-slate-400">CSV only</span>
                  )}
                </div>

                <div className={`space-y-3 ${!isCsvFile(selectedFile) ? "opacity-50 pointer-events-none" : ""}`}>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-600">Skip rows</label>
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
                        className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600">Header row</label>
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
                        className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                      >
                        <option value="auto">Auto</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-600">Delimiter</label>
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
                        className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600">Quote</label>
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
                        className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-600">Escape</label>
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
                        className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600">Null string</label>
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
                        className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-600">Date format</label>
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
                        className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600">Decimal separator</label>
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
                        className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-700">Preview (first {PREVIEW_LIMIT} rows)</h3>
              {selectedFile && isSupportedFile(selectedFile) && (
                <span className="text-xs text-slate-500">
                  {getFileTypeLabel(selectedFile)}
                </span>
              )}
            </div>

            <div className="border border-slate-200 rounded-xl bg-white overflow-hidden">
              {previewState ? (
                <div className="p-6 text-sm text-slate-500 text-center">
                  {previewState}
                </div>
              ) : preview ? (
                <div className="overflow-auto max-h-[50vh]">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                      <tr>
                        {preview.columns.map((col) => (
                          <th
                            key={col}
                            className="px-3 py-2 text-left font-semibold border-b border-slate-200"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="text-slate-700">
                      {preview.rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="odd:bg-white even:bg-slate-50">
                          {preview.columns.map((col) => (
                            <td key={col} className="px-3 py-2 border-b border-slate-100">
                              {row[col] === null || row[col] === undefined ? (
                                <span className="text-xs text-slate-400">null</span>
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

        <div className="flex items-center justify-between gap-4 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <div className="text-xs text-slate-500">
            Preview does not create a table until you click Create table
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!db || !selectedFile || !sanitizedTableName || !isSupportedFile(selectedFile) || creating}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
            >
              {creating ? "Creating..." : "Create table"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
