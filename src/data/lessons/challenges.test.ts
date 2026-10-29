import path from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import * as duckdb from "@duckdb/duckdb-wasm/dist/duckdb-node-blocking.cjs";
import type { DuckDBConnection } from "@duckdb/duckdb-wasm/blocking";

import type { QueryResult } from "../../types/query";
import { formatArrowValueForDisplay } from "../../utils/arrowDisplay";
import { guideBySlug } from "../guides";
import { chapters, lessonById, lessonPath } from "./index";

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

  /** Typical wrong answers must fail with a message that points at the mistake. */
  const commonMistakes: Array<{ lessonId: string; sql: string; message: RegExp }> = [
    {
      lessonId: "case-when-else-null",
      sql: "SELECT order_id, CASE WHEN amount < 100 THEN 'under 100' ELSE '100 or more' END AS amount_label FROM shop_orders ORDER BY order_id",
      message: /IS NULL/,
    },
    {
      lessonId: "case-when-conditional-aggregation",
      sql: "SELECT country, COUNT(*) AS shipped_orders, SUM(amount) AS shipped_amount FROM shop_orders GROUP BY country ORDER BY country",
      message: /shipped order/,
    },
    {
      lessonId: "subqueries-in-exists",
      sql: "SELECT name FROM team_members WHERE id NOT IN (SELECT member_id FROM projects) ORDER BY name",
      message: /NOT EXISTS/,
    },
    {
      lessonId: "subqueries-correlated",
      sql: "SELECT name, team, salary FROM team_members WHERE salary > (SELECT AVG(salary) FROM team_members) ORDER BY name",
      message: /own team's average/,
    },
    {
      lessonId: "set-operations-union",
      sql: "SELECT email FROM newsletter_2023 UNION ALL SELECT email FROM newsletter_2024 ORDER BY email",
      message: /UNION removes them/,
    },
    {
      lessonId: "set-operations-except",
      sql: "SELECT email FROM newsletter_2024 EXCEPT SELECT email FROM newsletter_2023 ORDER BY email",
      message: /Expected cho@example.com, eva@example.com/,
    },
    {
      lessonId: "set-operations-union-all-label",
      sql: "WITH s AS (SELECT email, country FROM newsletter_2023 UNION SELECT email, country FROM newsletter_2024) SELECT country, COUNT(*) AS subscriptions FROM s GROUP BY country ORDER BY subscriptions DESC, country",
      message: /use UNION ALL/,
    },
    {
      lessonId: "string-functions-case-trim",
      sql: "SELECT id, LOWER(email) AS clean_email FROM contacts_raw WHERE email IS NOT NULL ORDER BY id",
      message: /Check spaces and letter case/,
    },
    {
      lessonId: "string-functions-replace",
      sql: "SELECT id, REGEXP_REPLACE(phone, '[^0-9]', '') AS phone_digits FROM contacts_raw WHERE phone IS NOT NULL ORDER BY id",
      message: /'g'/,
    },
  ];

  it.each(commonMistakes.map((mistake) => [mistake.lessonId, mistake] as const))(
    "%s rejects a common mistake with a helpful message",
    (_lessonId, { lessonId, sql, message }) => {
      const lesson = lessonById(lessonId);
      if (!connection || !lesson) {
        throw new Error(`Missing connection or lesson ${lessonId}`);
      }
      const conn = connection;

      lesson.sampleData?.setupSql.forEach((setupSql) => conn.query(setupSql));
      const validation = lesson.challenge?.validate(toQueryResult(conn.query(sql)));

      expect(validation?.passed).toBe(false);
      expect(validation?.message).toMatch(message);
    }
  );

  /** Companion guides for chapters with sample data must only show SQL that runs on that data. */
  const runnableGuides: Array<{ slug: string; sampleLessonId: string }> = [
    { slug: "sql-case-when-conditional-logic", sampleLessonId: "case-when-basics" },
    { slug: "sql-subqueries-vs-ctes", sampleLessonId: "subqueries-scalar" },
    { slug: "sql-union-intersect-except", sampleLessonId: "set-operations-union" },
    { slug: "sql-string-functions-clean-text", sampleLessonId: "string-functions-case-trim" },
  ];

  it.each(runnableGuides.map((entry) => [entry.slug, entry] as const))(
    "%s code examples run against the chapter sample data",
    (_slug, { slug, sampleLessonId }) => {
      const guide = guideBySlug(slug);
      const lesson = lessonById(sampleLessonId);
      if (!connection || !guide || !lesson?.sampleData) {
        throw new Error(`Missing connection, guide ${slug}, or sample data`);
      }
      const conn = connection;
      lesson.sampleData.setupSql.forEach((setupSql) => conn.query(setupSql));

      const codeBlocks = guide.sections.flatMap((section) =>
        section.blocks.filter((block) => block.kind === "code").map((block) => block.code ?? "")
      );
      expect(codeBlocks.length).toBeGreaterThan(3);
      codeBlocks.forEach((code) => {
        expect(() => conn.query(code), code).not.toThrow();
      });
    }
  );
});
