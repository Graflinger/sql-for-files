/** Token types for SQL syntax highlighting. */
export type SqlTokenType =
  | "keyword"
  | "function"
  | "string"
  | "number"
  | "comment"
  | "operator"
  | "punctuation"
  | "text";

/** A single token from SQL tokenization. */
export interface SqlToken {
  text: string;
  type: SqlTokenType;
}

const SQL_KEYWORDS = new Set([
  "ADD", "ALL", "ALTER", "AND", "AS", "ASC",
  "BETWEEN", "BOOLEAN", "BY",
  "CASE", "COLUMN", "CREATE", "CROSS", "CUBE", "CURRENT",
  "DATE", "DECIMAL", "DELETE", "DESC", "DISTINCT", "DROP",
  "ELSE", "END", "EXCEPT", "EXCLUDE", "EXISTS",
  "FALSE", "FILTER", "FIRST", "FOLLOWING", "FROM", "FULL",
  "GROUP", "GROUPING",
  "HAVING",
  "IF", "ILIKE", "IN", "INNER", "INSERT", "INTEGER", "INTERSECT", "INTO", "IS",
  "JOIN",
  "LAMBDA", "LAST", "LATERAL", "LEFT", "LIKE", "LIMIT",
  "NOT", "NULL", "NULLS",
  "OFFSET", "ON", "OR", "ORDER", "OUTER", "OVER",
  "PARTITION", "PRECEDING",
  "RANGE", "RECURSIVE", "REPLACE", "RIGHT", "ROLLUP", "ROW", "ROWS",
  "SELECT", "SET", "SETS", "STRUCT",
  "TABLE", "TEMP", "TEMPORARY", "THEN", "TRUE",
  "UNBOUNDED", "UNION", "UPDATE",
  "VALUES", "VARCHAR",
  "WHEN", "WHERE", "WINDOW", "WITH",
]);

const SQL_FUNCTIONS = new Set([
  "ABS", "ARRAY_AGG", "AVG",
  "CEIL", "COALESCE", "CONCAT", "COUNT", "CURRENT_DATE",
  "DATE_DIFF", "DATE_PART", "DATE_TRUNC", "DENSE_RANK",
  "EPOCH", "EXTRACT",
  "FIRST_VALUE", "FLOOR",
  "GENERATE_SERIES",
  "LAG", "LAST_VALUE", "LEAD", "LENGTH", "LIST",
  "LIST_FILTER", "LIST_REDUCE", "LIST_TRANSFORM", "LOWER",
  "MAX", "MIN", "MOD",
  "NOW", "NTH_VALUE", "NTILE", "NULLIF",
  "RANK", "ROUND", "ROW_NUMBER",
  "CAST", "STRFTIME", "STRING_AGG", "SUBSTRING", "SUM",
  "TRIM",
  "UNNEST", "UPPER",
]);

/**
 * Tokenize a SQL string for syntax highlighting.
 *
 * Returns an array of tokens with text and type, suitable for rendering
 * with colour-coded spans.
 */
export function tokenizeSql(sql: string): SqlToken[] {
  const tokens: SqlToken[] = [];
  let i = 0;

  while (i < sql.length) {
    // Single-line comment
    if (sql[i] === "-" && sql[i + 1] === "-") {
      const end = sql.indexOf("\n", i);
      const commentEnd = end === -1 ? sql.length : end;
      tokens.push({ text: sql.slice(i, commentEnd), type: "comment" });
      i = commentEnd;
      continue;
    }

    // String literal (single-quoted)
    if (sql[i] === "'") {
      let j = i + 1;
      while (j < sql.length) {
        if (sql[j] === "'" && sql[j + 1] === "'") {
          j += 2;
        } else if (sql[j] === "'") {
          j++;
          break;
        } else {
          j++;
        }
      }
      tokens.push({ text: sql.slice(i, j), type: "string" });
      i = j;
      continue;
    }

    // Number (not immediately after a letter/underscore)
    if (/\d/.test(sql[i]) && (i === 0 || !/[a-zA-Z_]/.test(sql[i - 1]))) {
      let j = i;
      while (j < sql.length && /[\d.]/.test(sql[j])) j++;
      tokens.push({ text: sql.slice(i, j), type: "number" });
      i = j;
      continue;
    }

    // Word (keyword, function, or identifier)
    if (/[a-zA-Z_]/.test(sql[i])) {
      let j = i;
      while (j < sql.length && /[a-zA-Z0-9_]/.test(sql[j])) j++;
      const word = sql.slice(i, j);
      const upper = word.toUpperCase();

      if (SQL_KEYWORDS.has(upper)) {
        tokens.push({ text: word, type: "keyword" });
      } else if (SQL_FUNCTIONS.has(upper)) {
        tokens.push({ text: word, type: "function" });
      } else {
        tokens.push({ text: word, type: "text" });
      }
      i = j;
      continue;
    }

    // Multi-char operators
    if (i + 1 < sql.length) {
      const twoChar = sql.slice(i, i + 2);
      if (
        twoChar === ">=" ||
        twoChar === "<=" ||
        twoChar === "!=" ||
        twoChar === "<>" ||
        twoChar === ":=" ||
        twoChar === "||"
      ) {
        tokens.push({ text: twoChar, type: "operator" });
        i += 2;
        continue;
      }
    }

    // Single-char operators
    if ("=<>+-*/%!".includes(sql[i])) {
      tokens.push({ text: sql[i], type: "operator" });
      i++;
      continue;
    }

    // Punctuation
    if ("(),;.:[]{}".includes(sql[i])) {
      tokens.push({ text: sql[i], type: "punctuation" });
      i++;
      continue;
    }

    // Whitespace
    if (/\s/.test(sql[i])) {
      let j = i + 1;
      while (j < sql.length && /\s/.test(sql[j])) j++;
      tokens.push({ text: sql.slice(i, j), type: "text" });
      i = j;
      continue;
    }

    // Any other character
    tokens.push({ text: sql[i], type: "text" });
    i++;
  }

  return tokens;
}
