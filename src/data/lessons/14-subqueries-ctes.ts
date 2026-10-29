import type { Chapter } from "../../types/learn";
import type { QueryResult } from "../../types/query";

const TEAM_SETUP = [
  `CREATE OR REPLACE TABLE team_members (
    id INTEGER,
    name VARCHAR,
    team VARCHAR,
    salary INTEGER,
    hire_date DATE
  )`,
  `INSERT INTO team_members VALUES
    (1, 'Alice', 'Engineering', 120000, '2019-04-01'),
    (2, 'Bruno', 'Engineering', 95000, '2021-06-15'),
    (3, 'Chen', 'Engineering', 105000, '2020-01-10'),
    (4, 'Dara', 'Marketing', 70000, '2022-03-01'),
    (5, 'Elif', 'Marketing', 82000, '2018-09-20'),
    (6, 'Femi', 'Sales', 60000, '2023-01-05'),
    (7, 'Gita', 'Sales', 75000, '2020-11-11'),
    (8, 'Hugo', 'Support', 52000, '2021-02-01')`,
  `CREATE OR REPLACE TABLE projects (
    project_id INTEGER,
    member_id INTEGER,
    project VARCHAR
  )`,
  `INSERT INTO projects VALUES
    (1, 1, 'Search'),
    (2, 1, 'Billing'),
    (3, 3, 'Search'),
    (4, 5, 'Rebrand'),
    (5, 7, 'Q3 Push'),
    (6, 2, 'Billing'),
    (7, NULL, 'Research spike')`,
];

const SAMPLE_DATA = {
  label: "team_members (8 rows) and projects (7 rows) tables",
  setupSql: TEAM_SETUP,
  tableNames: ["team_members", "projects"],
};

function getValue(row: Record<string, unknown>, column: string): unknown {
  const matchingKey = Object.keys(row).find((key) => key.toLowerCase() === column.toLowerCase());
  return matchingKey ? row[matchingKey] : undefined;
}

function hasColumns(result: QueryResult, columns: string[]): boolean {
  const lowerColumns = result.columns.map((column) => column.toLowerCase());
  return columns.every((column) => lowerColumns.includes(column));
}

function namesInOrder(result: QueryResult): string[] {
  return result.data.map((row) => String(getValue(row, "name")));
}

const subqueriesCtes: Chapter = {
  id: "subqueries-ctes",
  title: "Subqueries and CTEs",
  description:
    "Nest one query inside another with subqueries, test membership with IN and EXISTS, and break long queries into named steps with WITH (common table expressions).",
  guideSlug: "sql-subqueries-vs-ctes",
  recommendedAfter: "grouping",
  lessons: [
    {
      id: "subqueries-scalar",
      title: "Subqueries in WHERE",
      summary:
        "Compare each row with a value computed by another query, such as finding team members who earn more than the overall average salary.",
      content: `A **subquery** is a query inside another query, wrapped in parentheses. SQL runs the inner query and uses its result in the outer one.

A subquery that returns exactly one value is called a **scalar subquery**. You can use it anywhere a single value fits, such as a comparison in \`WHERE\`:

~~~sql
SELECT name, salary
FROM team_members
WHERE salary > (SELECT AVG(salary) FROM team_members)
ORDER BY salary DESC
~~~

Why not write \`WHERE salary > AVG(salary)\`? Because \`WHERE\` filters individual rows before any aggregation happens, so aggregate functions are not allowed there. The subquery computes the average first, as its own small query.

You can run the inner query on its own to check it:

~~~sql
SELECT AVG(salary) FROM team_members
~~~`,
      sampleData: SAMPLE_DATA,
      challenge: {
        prompt:
          "Return the name and salary of team members who earn more than the average salary of all team members, ordered by salary from highest to lowest.",
        hint: "WHERE salary > (SELECT AVG(salary) FROM team_members) ORDER BY salary DESC",
        initialSql: "-- Who earns more than the average?\nSELECT name, salary\nFROM team_members\n",
        solutionSql:
          "SELECT name, salary\nFROM team_members\nWHERE salary > (SELECT AVG(salary) FROM team_members)\nORDER BY salary DESC;",
        validate: (result) => {
          if (!hasColumns(result, ["name", "salary"])) {
            return { passed: false, message: "Return the name and salary columns." };
          }

          const expected = ["Alice", "Chen", "Bruno"];
          if (result.rowCount !== expected.length) {
            return {
              passed: false,
              message: `Expected ${expected.length} people above the average salary (82,375) but got ${result.rowCount}.`,
            };
          }

          if (namesInOrder(result).join(",") !== expected.join(",")) {
            return { passed: false, message: "Expected Alice, Chen, and Bruno, ordered by salary descending." };
          }

          return { passed: true, message: "Correct! The subquery computed the average before the outer query filtered rows." };
        },
      },
    },
    {
      id: "subqueries-in-exists",
      title: "IN, EXISTS, and the NOT IN Trap",
      summary:
        "Test whether related rows exist with IN and EXISTS subqueries, and learn why NOT IN returns nothing when the subquery contains a NULL.",
      content: `Subqueries that return a **list** of values work with \`IN\`. This finds team members who appear in the projects table:

~~~sql
SELECT name
FROM team_members
WHERE id IN (SELECT member_id FROM projects)
~~~

\`EXISTS\` asks a yes/no question instead: does the inner query return at least one row? The inner query can refer to the outer row, here through \`m.id\`:

~~~sql
SELECT m.name
FROM team_members AS m
WHERE EXISTS (
  SELECT 1 FROM projects AS p WHERE p.member_id = m.id
)
~~~

To find members **without** a project, \`NOT IN\` looks natural, but it has a trap. The projects table contains a project with no member yet, so \`member_id\` is \`NULL\` in one row. \`x NOT IN (1, 2, NULL)\` can never be true, because SQL cannot rule out that \`x\` equals the unknown value. The whole query returns no rows.

\`NOT EXISTS\` does not have this problem, which makes it the safer choice for "has no match" questions:

~~~sql
SELECT m.name
FROM team_members AS m
WHERE NOT EXISTS (
  SELECT 1 FROM projects AS p WHERE p.member_id = m.id
)
~~~`,
      sampleData: SAMPLE_DATA,
      challenge: {
        prompt:
          "Return the names of team members who are not assigned to any project, ordered by name. Watch out: projects contains a row with a NULL member_id.",
        hint: "Use WHERE NOT EXISTS (SELECT 1 FROM projects AS p WHERE p.member_id = m.id).",
        initialSql: "-- Who has no project?\nSELECT m.name\nFROM team_members AS m\n",
        solutionSql:
          "SELECT m.name\nFROM team_members AS m\nWHERE NOT EXISTS (\n  SELECT 1\n  FROM projects AS p\n  WHERE p.member_id = m.id\n)\nORDER BY m.name;",
        validate: (result) => {
          if (result.rowCount === 0) {
            return {
              passed: false,
              message: "No rows? NOT IN returns nothing when the subquery contains NULL. Try NOT EXISTS instead.",
            };
          }

          if (!hasColumns(result, ["name"])) {
            return { passed: false, message: "Return the name column." };
          }

          const expected = ["Dara", "Femi", "Hugo"];
          if (namesInOrder(result).join(",") !== expected.join(",")) {
            return { passed: false, message: "Expected Dara, Femi, and Hugo, ordered by name." };
          }

          return { passed: true, message: "Exactly right. NOT EXISTS ignored the NULL member_id and found everyone without a project." };
        },
      },
    },
    {
      id: "ctes-with",
      title: "Common Table Expressions with WITH",
      summary:
        "Name an intermediate result with WITH, then query it like a table, such as computing team salary averages first and filtering them in a second step.",
      content: `A **common table expression (CTE)** gives a subquery a name. You define it at the top of the query with \`WITH\`, then use it like a table:

~~~sql
WITH team_stats AS (
  SELECT team, AVG(salary) AS avg_salary
  FROM team_members
  GROUP BY team
)
SELECT team, avg_salary
FROM team_stats
WHERE avg_salary > 70000
ORDER BY avg_salary DESC
~~~

CTEs do not make queries more powerful than subqueries, but they make them much easier to read. Each step has a name, and the final \`SELECT\` reads like a summary of the steps.

You can define several CTEs, separated by commas, and later ones can use earlier ones:

~~~sql
WITH team_stats AS (
  SELECT team, AVG(salary) AS avg_salary
  FROM team_members
  GROUP BY team
),
top_teams AS (
  SELECT team FROM team_stats WHERE avg_salary > 70000
)
SELECT name, team
FROM team_members
WHERE team IN (SELECT team FROM top_teams)
~~~`,
      sampleData: SAMPLE_DATA,
      challenge: {
        prompt:
          "Use a CTE named team_stats that computes each team's average salary as avg_salary. Then return team and avg_salary for teams whose average is above 70000, ordered by avg_salary descending.",
        hint: "WITH team_stats AS (SELECT team, AVG(salary) AS avg_salary FROM team_members GROUP BY team) SELECT ...",
        initialSql: "-- Step 1: team averages. Step 2: filter them.\nWITH team_stats AS (\n  \n)\nSELECT *\nFROM team_stats;\n",
        solutionSql:
          "WITH team_stats AS (\n  SELECT team, AVG(salary) AS avg_salary\n  FROM team_members\n  GROUP BY team\n)\nSELECT team, avg_salary\nFROM team_stats\nWHERE avg_salary > 70000\nORDER BY avg_salary DESC;",
        validate: (result) => {
          if (!hasColumns(result, ["team", "avg_salary"])) {
            return { passed: false, message: "Return team and avg_salary." };
          }

          if (result.rowCount !== 2) {
            return { passed: false, message: `Expected 2 teams above 70000 but got ${result.rowCount}.` };
          }

          const expected: Array<[string, number]> = [
            ["Engineering", 106666.67],
            ["Marketing", 76000],
          ];

          for (let index = 0; index < expected.length; index += 1) {
            const row = result.data[index];
            const [team, average] = expected[index];

            if (String(getValue(row, "team")) !== team) {
              return { passed: false, message: "Expected Engineering first, then Marketing." };
            }

            if (Math.abs(Number(getValue(row, "avg_salary")) - average) > 0.5) {
              return { passed: false, message: `${team}'s avg_salary should be about ${average}.` };
            }
          }

          return { passed: true, message: "Great! The CTE named the first step, and the final query filtered it." };
        },
      },
    },
    {
      id: "subqueries-correlated",
      title: "Correlated Subqueries",
      summary:
        "Write a subquery that refers to the outer row to compare each person with their own team's average, and see how a CTE join expresses the same idea.",
      content: `So far, each subquery could run on its own. A **correlated subquery** refers to a column from the outer query, so it is evaluated for each outer row.

This compares every team member with the average of **their own** team:

~~~sql
SELECT m.name, m.team, m.salary
FROM team_members AS m
WHERE m.salary > (
  SELECT AVG(t.salary)
  FROM team_members AS t
  WHERE t.team = m.team
)
ORDER BY m.name
~~~

The condition \`t.team = m.team\` links the inner query to the current outer row. Table aliases (\`m\` and \`t\`) are required here, because both sides use the same table.

The same question can be answered with a CTE and a join, which some people find easier to read and debug:

~~~sql
WITH team_avg AS (
  SELECT team, AVG(salary) AS avg_salary
  FROM team_members
  GROUP BY team
)
SELECT m.name, m.team, m.salary
FROM team_members AS m
JOIN team_avg AS a ON a.team = m.team
WHERE m.salary > a.avg_salary
ORDER BY m.name
~~~

DuckDB optimizes both forms well, so choose the one that reads best for your question.`,
      sampleData: SAMPLE_DATA,
      challenge: {
        prompt:
          "Return name, team, and salary for team members who earn more than the average salary of their own team, ordered by name.",
        hint: "WHERE m.salary > (SELECT AVG(t.salary) FROM team_members AS t WHERE t.team = m.team)",
        initialSql: "-- Compare each person with their own team's average\nSELECT m.name, m.team, m.salary\nFROM team_members AS m\n",
        solutionSql:
          "SELECT m.name, m.team, m.salary\nFROM team_members AS m\nWHERE m.salary > (\n  SELECT AVG(t.salary)\n  FROM team_members AS t\n  WHERE t.team = m.team\n)\nORDER BY m.name;",
        validate: (result) => {
          if (!hasColumns(result, ["name", "team", "salary"])) {
            return { passed: false, message: "Return name, team, and salary." };
          }

          const expected = ["Alice", "Elif", "Gita"];
          if (result.rowCount !== expected.length) {
            return {
              passed: false,
              message: `Expected ${expected.length} people above their own team's average but got ${result.rowCount}. Compare with the team average, not the overall average.`,
            };
          }

          if (namesInOrder(result).join(",") !== expected.join(",")) {
            return {
              passed: false,
              message:
                "Expected Alice, Elif, and Gita, ordered by name. Compare each salary with their own team's average, not the overall average.",
            };
          }

          return { passed: true, message: "Well done! The correlated subquery computed a separate average for each person's team." };
        },
      },
    },
  ],
};

export default subqueriesCtes;
