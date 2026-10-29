import type { Chapter } from "../../types/learn";
import type { QueryResult } from "../../types/query";

const NEWSLETTER_SETUP = [
  `CREATE OR REPLACE TABLE newsletter_2023 (
    email VARCHAR,
    country VARCHAR
  )`,
  `INSERT INTO newsletter_2023 VALUES
    ('ana@example.com', 'DE'),
    ('ben@example.com', 'US'),
    ('cho@example.com', 'KR'),
    ('dev@example.com', 'IN'),
    ('eva@example.com', 'DE')`,
  `CREATE OR REPLACE TABLE newsletter_2024 (
    email VARCHAR,
    country VARCHAR
  )`,
  `INSERT INTO newsletter_2024 VALUES
    ('ben@example.com', 'US'),
    ('dev@example.com', 'IN'),
    ('fia@example.com', 'SE'),
    ('gus@example.com', 'US'),
    ('ana@example.com', 'DE')`,
];

const SAMPLE_DATA = {
  label: "newsletter_2023 and newsletter_2024 tables (5 subscribers each)",
  setupSql: NEWSLETTER_SETUP,
  tableNames: ["newsletter_2023", "newsletter_2024"],
};

function getValue(row: Record<string, unknown>, column: string): unknown {
  const matchingKey = Object.keys(row).find((key) => key.toLowerCase() === column.toLowerCase());
  return matchingKey ? row[matchingKey] : undefined;
}

/** Check a single-column email result against an expected ordered list. */
function checkEmails(result: QueryResult, expected: string[], hintOnCount: string) {
  if (!result.columns.some((column) => column.toLowerCase() === "email")) {
    return { passed: false, message: "Return a column named email." };
  }

  if (result.rowCount !== expected.length) {
    return {
      passed: false,
      message: `Expected ${expected.length} emails but got ${result.rowCount}. ${hintOnCount}`,
    };
  }

  const emails = result.data.map((row) => String(getValue(row, "email")));
  if (emails.join(",") !== expected.join(",")) {
    return { passed: false, message: `Expected ${expected.join(", ")}, ordered by email.` };
  }

  return null;
}

const setOperations: Chapter = {
  id: "set-operations",
  title: "Set Operations: UNION, INTERSECT, EXCEPT",
  description:
    "Combine the results of two queries: stack rows with UNION and UNION ALL, find rows both sides share with INTERSECT, and find rows only one side has with EXCEPT.",
  guideSlug: "sql-union-intersect-except",
  recommendedAfter: "grouping",
  lessons: [
    {
      id: "set-operations-union",
      title: "UNION vs UNION ALL",
      summary:
        "Stack the rows of two queries with UNION ALL, remove duplicate rows with UNION, and learn the column rules both sides of a set operation must follow.",
      content: `Joins combine tables **side by side**. Set operations combine query results **on top of each other**.

\`UNION ALL\` stacks every row from both queries:

~~~sql
SELECT email FROM newsletter_2023
UNION ALL
SELECT email FROM newsletter_2024
~~~

That returns 10 rows, because three people subscribed in both years. \`UNION\` removes duplicate rows from the combined result:

~~~sql
SELECT email FROM newsletter_2023
UNION
SELECT email FROM newsletter_2024
ORDER BY email
~~~

Rules for every set operation:

• Both queries must return the same number of columns.
• Columns are matched **by position**, not by name, so keep them in the same order with compatible types.
• \`ORDER BY\` goes at the very end and sorts the combined result.

Prefer \`UNION ALL\` when you know there are no duplicates or you want to keep them. It skips the duplicate check, so it is cheaper.`,
      sampleData: SAMPLE_DATA,
      challenge: {
        prompt:
          "Return every distinct email that appears in either newsletter_2023 or newsletter_2024, ordered by email.",
        hint: "SELECT email FROM newsletter_2023 UNION SELECT email FROM newsletter_2024 ORDER BY email",
        initialSql: "-- Everyone who ever subscribed, listed once\n",
        solutionSql:
          "SELECT email FROM newsletter_2023\nUNION\nSELECT email FROM newsletter_2024\nORDER BY email;",
        validate: (result) => {
          const error = checkEmails(
            result,
            [
              "ana@example.com",
              "ben@example.com",
              "cho@example.com",
              "dev@example.com",
              "eva@example.com",
              "fia@example.com",
              "gus@example.com",
            ],
            "UNION ALL keeps duplicates; UNION removes them."
          );

          return error ?? { passed: true, message: "Correct! UNION combined both lists and removed the three repeat subscribers." };
        },
      },
    },
    {
      id: "set-operations-intersect",
      title: "INTERSECT Finds Rows in Both",
      summary:
        "Use INTERSECT to return only rows that appear in both query results, such as the newsletter subscribers who signed up in two consecutive years.",
      content: `\`INTERSECT\` keeps only the rows that appear in **both** results:

~~~sql
SELECT email FROM newsletter_2023
INTERSECT
SELECT email FROM newsletter_2024
ORDER BY email
~~~

Like \`UNION\`, \`INTERSECT\` compares whole rows. If you select \`email, country\`, a person only counts as "in both" when the email **and** the country match.

You could answer the same question with a join or \`EXISTS\`, but \`INTERSECT\` states the intent directly: "rows common to both lists". It also treats \`NULL\` values as equal to each other, which joins do not.

DuckDB also supports \`INTERSECT ALL\`, which keeps duplicates as many times as they appear on both sides.`,
      sampleData: SAMPLE_DATA,
      challenge: {
        prompt: "Return the emails that appear in both newsletter_2023 and newsletter_2024, ordered by email.",
        hint: "SELECT email FROM newsletter_2023 INTERSECT SELECT email FROM newsletter_2024 ORDER BY email",
        initialSql: "-- Who subscribed in both years?\n",
        solutionSql:
          "SELECT email FROM newsletter_2023\nINTERSECT\nSELECT email FROM newsletter_2024\nORDER BY email;",
        validate: (result) => {
          const error = checkEmails(
            result,
            ["ana@example.com", "ben@example.com", "dev@example.com"],
            "INTERSECT keeps only rows found in both results."
          );

          return error ?? { passed: true, message: "Exactly right. INTERSECT kept the three people on both lists." };
        },
      },
    },
    {
      id: "set-operations-except",
      title: "EXCEPT Finds Rows Only on One Side",
      summary:
        "Use EXCEPT to return rows from the first query that are missing from the second, such as subscribers who did not come back the following year.",
      content: `\`EXCEPT\` returns rows from the first query that do **not** appear in the second:

~~~sql
SELECT email FROM newsletter_2023
EXCEPT
SELECT email FROM newsletter_2024
ORDER BY email
~~~

Order matters. Swap the two queries and you get the opposite question: who is new in 2024?

~~~sql
SELECT email FROM newsletter_2024
EXCEPT
SELECT email FROM newsletter_2023
ORDER BY email
~~~

\`EXCEPT\` is a compact way to compare two lists, for example to find records that disappeared between two exports of the same file. Some databases call it \`MINUS\`. DuckDB also supports \`EXCEPT ALL\`, which subtracts matching rows one at a time instead of removing every copy.`,
      sampleData: SAMPLE_DATA,
      challenge: {
        prompt:
          "Return the emails of 2023 subscribers who are not in newsletter_2024, ordered by email.",
        hint: "SELECT email FROM newsletter_2023 EXCEPT SELECT email FROM newsletter_2024 ORDER BY email",
        initialSql: "-- Who did not come back in 2024?\n",
        solutionSql:
          "SELECT email FROM newsletter_2023\nEXCEPT\nSELECT email FROM newsletter_2024\nORDER BY email;",
        validate: (result) => {
          const error = checkEmails(
            result,
            ["cho@example.com", "eva@example.com"],
            "Put newsletter_2023 first: EXCEPT keeps rows from the first query only."
          );

          return error ?? { passed: true, message: "Nice! EXCEPT found the two 2023 subscribers who did not return." };
        },
      },
    },
    {
      id: "set-operations-union-all-label",
      title: "Stacking and Summarizing Results",
      summary:
        "Stack similar tables with UNION ALL and a literal label column, then group the combined rows, and see why UNION would silently drop repeated rows.",
      content: `A common real-world pattern: you have the same kind of data split across several files, such as one export per year. Stack them with \`UNION ALL\` and add a literal column so you still know where each row came from:

~~~sql
SELECT 2023 AS signup_year, email, country FROM newsletter_2023
UNION ALL
SELECT 2024 AS signup_year, email, country FROM newsletter_2024
~~~

Wrap the stacked rows in a CTE or subquery and summarize them like any other table:

~~~sql
WITH all_signups AS (
  SELECT 2023 AS signup_year, email, country FROM newsletter_2023
  UNION ALL
  SELECT 2024 AS signup_year, email, country FROM newsletter_2024
)
SELECT signup_year, COUNT(*) AS subscribers
FROM all_signups
GROUP BY signup_year
~~~

Be careful with plain \`UNION\` here. If two rows are identical, \`UNION\` keeps only one, and your counts quietly shrink.

When files have the same columns in a different order, DuckDB's \`UNION ALL BY NAME\` matches columns by name instead of position.`,
      sampleData: SAMPLE_DATA,
      challenge: {
        prompt:
          "Stack email and country from both tables with UNION ALL, then return country and subscriptions (the number of stacked rows per country), ordered by subscriptions descending, then country.",
        hint:
          "WITH all_signups AS (SELECT email, country FROM newsletter_2023 UNION ALL SELECT email, country FROM newsletter_2024) SELECT country, COUNT(*) AS subscriptions ...",
        initialSql: "-- Count subscriptions per country across both years\nWITH all_signups AS (\n  \n)\nSELECT *\nFROM all_signups;\n",
        solutionSql:
          "WITH all_signups AS (\n  SELECT email, country FROM newsletter_2023\n  UNION ALL\n  SELECT email, country FROM newsletter_2024\n)\nSELECT country, COUNT(*) AS subscriptions\nFROM all_signups\nGROUP BY country\nORDER BY subscriptions DESC, country;",
        validate: (result) => {
          const lowerColumns = result.columns.map((column) => column.toLowerCase());
          if (!lowerColumns.includes("country") || !lowerColumns.includes("subscriptions")) {
            return { passed: false, message: "Return country and subscriptions." };
          }

          const expected: Array<[string, number]> = [
            ["DE", 3],
            ["US", 3],
            ["IN", 2],
            ["KR", 1],
            ["SE", 1],
          ];

          if (result.rowCount !== expected.length) {
            return { passed: false, message: `Expected ${expected.length} countries but got ${result.rowCount}.` };
          }

          for (let index = 0; index < expected.length; index += 1) {
            const row = result.data[index];
            const [country, count] = expected[index];
            const actualCountry = String(getValue(row, "country"));
            const actualCount = Number(getValue(row, "subscriptions"));

            if (actualCountry === country && actualCount !== count) {
              return {
                passed: false,
                message: `${country} should have ${count} subscriptions. UNION removes repeated rows; use UNION ALL.`,
              };
            }

            if (actualCountry !== country) {
              return { passed: false, message: "Order by subscriptions descending, then by country." };
            }
          }

          return { passed: true, message: "Great! UNION ALL kept every subscription before you grouped them." };
        },
      },
    },
  ],
};

export default setOperations;
