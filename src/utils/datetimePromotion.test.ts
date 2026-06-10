import { describe, it, expect, vi } from "vitest";

import { promoteDatetimeColumns } from "./datetimePromotion";
import type { AsyncDuckDB } from "@duckdb/duckdb-wasm";

interface DescribeColumn {
  column_name: string;
  column_type: string;
}

/**
 * Build a mock DuckDB connection that returns canned results for DESCRIBE and
 * the batched probe query, and records every SQL statement it receives.
 */
function createConn(
  describeRows: DescribeColumn[],
  probeRow: Record<string, unknown>
) {
  const queries: string[] = [];
  const query = vi.fn(async (sql: string) => {
    queries.push(sql);
    if (sql.startsWith("DESCRIBE")) {
      return { toArray: () => describeRows };
    }
    if (sql.startsWith("SELECT")) {
      return { toArray: () => [probeRow] };
    }
    // ALTER statements
    return { toArray: () => [] };
  });

  return { conn: { query }, queries, query };
}

function asConn(conn: { query: unknown }) {
  return conn as unknown as Awaited<ReturnType<AsyncDuckDB["connect"]>>;
}

describe("promoteDatetimeColumns", () => {
  it("promotes a VARCHAR column when every non-null value parses as TIMESTAMP", async () => {
    const { conn, queries } = createConn(
      [
        { column_name: "id", column_type: "BIGINT" },
        { column_name: "due", column_type: "VARCHAR" },
      ],
      { nn_0: 2n, fail_0: 0n }
    );

    const promoted = await promoteDatetimeColumns(asConn(conn), "tasks");

    expect(promoted).toEqual(["due"]);
    const alter = queries.find((q) => q.startsWith("ALTER TABLE"));
    expect(alter).toContain('ALTER COLUMN "due" SET DATA TYPE TIMESTAMP');
    expect(alter).toContain('TRY_CAST("due" AS TIMESTAMP)');
  });

  it("leaves a text column as VARCHAR when some values fail to parse", async () => {
    const { conn, queries } = createConn(
      [{ column_name: "note", column_type: "VARCHAR" }],
      { nn_0: 3n, fail_0: 3n }
    );

    const promoted = await promoteDatetimeColumns(asConn(conn), "tasks");

    expect(promoted).toEqual([]);
    expect(queries.some((q) => q.startsWith("ALTER TABLE"))).toBe(false);
  });

  it("leaves an all-null column as VARCHAR (no evidence to promote)", async () => {
    const { conn } = createConn(
      [{ column_name: "empty", column_type: "VARCHAR" }],
      { nn_0: 0n, fail_0: 0n }
    );

    const promoted = await promoteDatetimeColumns(asConn(conn), "tasks");

    expect(promoted).toEqual([]);
  });

  it("ignores non-VARCHAR columns entirely (no probe issued)", async () => {
    const { conn, queries } = createConn(
      [
        { column_name: "id", column_type: "BIGINT" },
        { column_name: "ts", column_type: "TIMESTAMP" },
      ],
      {}
    );

    const promoted = await promoteDatetimeColumns(asConn(conn), "tasks");

    expect(promoted).toEqual([]);
    // Only the DESCRIBE query should run; no probe SELECT, no ALTER.
    expect(queries).toHaveLength(1);
    expect(queries[0]).toContain("DESCRIBE");
  });

  it("respects skipColumns so explicit user overrides are untouched", async () => {
    const { conn, queries } = createConn(
      [{ column_name: "due", column_type: "VARCHAR" }],
      { nn_0: 2n, fail_0: 0n }
    );

    const promoted = await promoteDatetimeColumns(asConn(conn), "tasks", [
      "due",
    ]);

    expect(promoted).toEqual([]);
    expect(queries).toHaveLength(1); // DESCRIBE only
  });

  it("promotes only the qualifying columns in a mixed table", async () => {
    const { conn } = createConn(
      [
        { column_name: "due", column_type: "VARCHAR" },
        { column_name: "note", column_type: "VARCHAR" },
        { column_name: "empty", column_type: "VARCHAR" },
      ],
      { nn_0: 2n, fail_0: 0n, nn_1: 3n, fail_1: 3n, nn_2: 0n, fail_2: 0n }
    );

    const promoted = await promoteDatetimeColumns(asConn(conn), "tasks");

    expect(promoted).toEqual(["due"]);
  });
});
