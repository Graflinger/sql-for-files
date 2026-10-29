import path from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import * as duckdb from "@duckdb/duckdb-wasm/dist/duckdb-node-blocking.cjs";
import type { DuckDBConnection } from "@duckdb/duckdb-wasm/blocking";

import type { QueryResult } from "../../types/query";
import { formatArrowValueForDisplay } from "../../utils/arrowDisplay";
import { chapters, lessonPath } from "./index";

/**
 * Runs every Learn SQL challenge solution against its own sample data in a real
 * DuckDB-WASM instance and checks that the lesson validator accepts the result.
 * This keeps lesson SQL, sample data, and validators in sync.
 */

const duckdbDist = path.resolve(process.cwd(), "node_modules/@duckdb/duckdb-wasm/dist");
const bundles = {
  mvp: {
    mainModule: path.join(duckdbDist, "duckdb-mvp.wasm"),
    mainWorker: path.join(duckdbDist, "duckdb-node-mvp.worker.cjs"),
  },
  eh: {
    mainModule: path.join(duckdbDist, "duckdb-eh.wasm"),
    mainWorker: path.join(duckdbDist, "duckdb-node-eh.worker.cjs"),
  },
};

let connection: DuckDBConnection | null = null;

/** Convert an Arrow result into the same QueryResult shape useQueryExecution builds. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- DuckDB-WASM bundles its own Apache Arrow
function toQueryResult(arrowResult: any): QueryResult {
  const fields: Array<{ name: string; type?: unknown }> = arrowResult.schema.fields;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Arrow row proxies are untyped here
  const data = arrowResult.toArray().map((row: any) => {
    const obj: Record<string, unknown> = {};
    fields.forEach((field) => {
      obj[field.name] = formatArrowValueForDisplay(row[field.name], field.type);
    });
    return obj;
  });

  return {
    data,
    columns: fields.map((field) => field.name),
    rowCount: arrowResult.numRows,
    displayRowCount: arrowResult.numRows,
    executionTime: 0,
    arrowTable: arrowResult,
    wasTruncated: false,
  };
}

const lessonsWithSolutions = chapters.flatMap((chapter) =>
  chapter.lessons
    .filter((lesson) => lesson.challenge?.solutionSql)
    .map((lesson) => ({ chapter, lesson, path: lessonPath(lesson.id) }))
);

describe("Learn SQL challenge solutions", () => {
  beforeAll(async () => {
    const db = await duckdb.createDuckDB(bundles, new duckdb.VoidLogger(), duckdb.NODE_RUNTIME);
    await db.instantiate();
    connection = db.connect();
  });

  afterAll(() => {
    connection?.close();
  });

  it("covers every lesson that ships a solution", () => {
    expect(lessonsWithSolutions.length).toBeGreaterThan(40);
  });

  it.each(lessonsWithSolutions.map((entry) => [entry.path, entry] as const))(
    "%s solution passes its validator",
    (_path, { lesson }) => {
      if (!connection) {
        throw new Error("DuckDB connection was not initialized");
      }
      const conn = connection;

      lesson.sampleData?.setupSql.forEach((sql) => conn.query(sql));

      const result = toQueryResult(conn.query(lesson.challenge?.solutionSql ?? ""));
      const validation = lesson.challenge?.validate(result);

      expect(validation, `${lesson.id}: ${validation?.message}`).toMatchObject({ passed: true });
    }
  );
});
