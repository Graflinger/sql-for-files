import { quoteStringLiteral } from "./sql";

const DEFAULT_AUTO_TYPE_CANDIDATES = [
  "NULL",
  "BOOLEAN",
  "BIGINT",
  "DOUBLE",
  "TIME",
  "DATE",
  "TIMESTAMP",
  "VARCHAR",
];

export interface CsvAddOptions {
  skip?: number;
  header?: boolean;
  delim?: string;
  quote?: string;
  escape?: string;
  nullStr?: string;
  dateformat?: string;
  timestampformat?: string;
  decimal_separator?: string;
  types?: Record<string, string>;
  /**
   * When not explicitly false, VARCHAR columns whose values all parse as
   * TIMESTAMP are promoted to TIMESTAMP after import. This is a post-import
   * step (not a read_csv option) and is therefore ignored by
   * {@link buildCsvOptionsSql}.
   */
  autoDetectDatetime?: boolean;
}

/**
 * Build DuckDB read_csv options shared by preview and table creation.
 *
 * DuckDB 1.3+ can auto-detect ISO-8601 values ending in Z as TIMESTAMP WITH
 * TIME ZONE, which can fail in DuckDB-WASM during import. Restricting the
 * default candidate list keeps the previous safe behavior while still allowing
 * explicit timestamp formats or per-column type overrides from advanced import.
 */
export function buildCsvOptionsSql(options?: CsvAddOptions): string {
  const parts = [
    `auto_type_candidates=${buildStringListSql(DEFAULT_AUTO_TYPE_CANDIDATES)}`,
  ];

  if (!options) return `, ${parts.join(", ")}`;

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

  if (options.timestampformat) {
    parts.push(`timestampformat=${quoteStringLiteral(options.timestampformat)}`);
  }

  if (options.decimal_separator) {
    parts.push(
      `decimal_separator=${quoteStringLiteral(options.decimal_separator)}`
    );
  }

  const typesSql = buildTypesSql(options.types);
  if (typesSql) {
    parts.push(`types=${typesSql}`);
  }

  return `, ${parts.join(", ")}`;
}

function buildStringListSql(values: string[]): string {
  return `[${values.map((value) => quoteStringLiteral(value)).join(", ")}]`;
}

function buildTypesSql(types?: Record<string, string>): string {
  if (!types) return "";

  const entries = Object.entries(types)
    .map(([column, typeName]) => [column.trim(), typeName.trim()] as const)
    .filter(([column, typeName]) => column && typeName);

  if (entries.length === 0) return "";

  return `{${entries
    .map(
      ([column, typeName]) =>
        `${quoteStringLiteral(column)}: ${quoteStringLiteral(typeName)}`
    )
    .join(", ")}}`;
}
