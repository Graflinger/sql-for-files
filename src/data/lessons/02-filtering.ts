import type { Chapter } from "../../types/learn";

const EMPLOYEES_SETUP = [
  `CREATE OR REPLACE TABLE employees (
    id INTEGER,
    name VARCHAR,
    department VARCHAR,
    salary DECIMAL(10,2),
    hire_date DATE
  )`,
  `INSERT INTO employees VALUES
    (1, 'Alice', 'Engineering', 95000, '2021-03-15'),
    (2, 'Bob', 'Marketing', 72000, '2020-07-01'),
    (3, 'Charlie', 'Engineering', 110000, '2019-01-10'),
    (4, 'Diana', 'Sales', 68000, '2022-11-20'),
    (5, 'Eve', 'Marketing', 78000, '2021-09-05'),
    (6, 'Frank', 'Engineering', 102000, '2020-02-28'),
    (7, 'Grace', 'Sales', 71000, '2023-04-12'),
    (8, 'Hank', 'Marketing', 65000, '2022-06-30')`,
];

const filtering: Chapter = {
  id: "filtering",
  title: "Filtering Data",
  lessons: [
    {
      id: "filtering-where",
      title: "WHERE Clause Basics",
      content: `The \`WHERE\` clause filters rows based on a condition. Only rows that satisfy the condition are included in the result:

\`\`\`sql
SELECT * FROM employees WHERE department = 'Engineering'
\`\`\`

This returns only employees in the Engineering department.

Common comparison operators:
  =    Equal to
  !=   Not equal to (also written <>)
  >    Greater than
  <    Less than
  >=   Greater than or equal to
  <=   Less than or equal to

For text values, remember to wrap them in single quotes: \`'Engineering'\`.`,
      sampleData: {
        label: "employees table (8 rows)",
        setupSql: EMPLOYEES_SETUP,
        tableNames: ["employees"],
      },
      challenge: {
        prompt: "Find all employees with a salary greater than 80,000.",
        hint: "Use WHERE salary > 80000",
        initialSql: "-- Find high earners\n",
        solutionSql: "SELECT *\nFROM employees\nWHERE salary > 80000;",
        validate: (result) => {
          if (result.rowCount !== 3) {
            return {
              passed: false,
              message: `Expected 3 employees with salary > 80,000 but got ${result.rowCount}.`,
            };
          }
          const names = result.data.map((r) =>
            String(r.name ?? r.Name).toLowerCase()
          );
          if (
            !names.includes("alice") ||
            !names.includes("charlie") ||
            !names.includes("frank")
          ) {
            return {
              passed: false,
              message: "The result should include Alice, Charlie, and Frank.",
            };
          }
          return {
            passed: true,
            message:
              "Correct! Alice (95k), Charlie (110k), and Frank (102k) all earn more than 80,000.",
          };
        },
      },
    },
    {
      id: "filtering-and-or",
      title: "Combining Conditions",
      content: `You can combine multiple conditions using \`AND\` and \`OR\`:

\`AND\` — both conditions must be true:

\`\`\`sql
SELECT * FROM employees
WHERE department = 'Engineering' AND salary > 100000
\`\`\`

\`OR\` — at least one condition must be true:

\`\`\`sql
SELECT * FROM employees
WHERE department = 'Sales' OR department = 'Marketing'
\`\`\`

Use parentheses to control the order of evaluation when mixing \`AND\` and \`OR\`:

\`\`\`sql
SELECT * FROM employees
WHERE (department = 'Sales' OR department = 'Marketing')
  AND salary > 70000
\`\`\``,
      sampleData: {
        label: "employees table (8 rows)",
        setupSql: EMPLOYEES_SETUP,
        tableNames: ["employees"],
      },
      challenge: {
        prompt:
          "Find employees who are in Marketing AND have a salary greater than 70,000.",
        hint: "Use WHERE department = 'Marketing' AND salary > 70000",
        initialSql: "-- Marketing employees earning over 70k\n",
        solutionSql:
          "SELECT *\nFROM employees\nWHERE department = 'Marketing'\n  AND salary > 70000;",
        validate: (result) => {
          if (result.rowCount !== 2) {
            return {
              passed: false,
              message: `Expected 2 rows but got ${result.rowCount}. Look for Marketing employees with salary > 70,000.`,
            };
          }
          const names = result.data.map((r) =>
            String(r.name ?? r.Name).toLowerCase()
          );
          if (!names.includes("bob") || !names.includes("eve")) {
            return {
              passed: false,
              message: "The result should include Bob (72k) and Eve (78k).",
            };
          }
          return {
            passed: true,
            message:
              "Correct! Bob (72k) and Eve (78k) are both in Marketing with salary > 70,000.",
          };
        },
      },
    },
    {
      id: "filtering-like",
      title: "Pattern Matching with LIKE",
      content: `The \`LIKE\` operator matches text patterns using two wildcards:

\`%\` matches any sequence of characters (including none)
\`_\` matches exactly one character

Examples:

\`\`\`sql
WHERE name LIKE 'A%'       -- names starting with A
WHERE name LIKE '%e'       -- names ending with e
WHERE name LIKE '%li%'     -- names containing "li"
WHERE name LIKE '_o%'      -- names with "o" as the second letter
\`\`\`

In DuckDB, \`LIKE\` is case-sensitive. DuckDB also supports \`ILIKE\` for case-insensitive matching:

\`\`\`sql
WHERE name ILIKE '%alice%' -- matches Alice, ALICE, alice, etc.
\`\`\``,
      sampleData: {
        label: "employees table (8 rows)",
        setupSql: EMPLOYEES_SETUP,
        tableNames: ["employees"],
      },
      challenge: {
        prompt:
          "Find all employees whose name contains the letters li. Return name, ordered by name.",
        hint: "Use WHERE name LIKE '%li%' and ORDER BY name.",
        initialSql: "-- Names containing li\n",
        solutionSql:
          "SELECT name\nFROM employees\nWHERE name LIKE '%li%'\nORDER BY name;",
        validate: (result) => {
          const columns = result.columns.map((column) => column.toLowerCase());
          if (columns.length !== 1 || !columns.includes("name")) {
            return {
              passed: false,
              message: "Return exactly one column: name.",
            };
          }
          if (result.rowCount !== 2) {
            return {
              passed: false,
              message: `Expected 2 employees (Alice and Charlie) but got ${result.rowCount}.`,
            };
          }
          const names = result.data.map((r) =>
            String(r.name ?? r.Name).toLowerCase()
          );
          const expected = ["alice", "charlie"];
          const allPresent = expected.every((n, index) => names[index] === n);
          if (!allPresent) {
            return {
              passed: false,
              message:
                "The result should be Alice and Charlie, ordered by name.",
            };
          }
          return {
            passed: true,
            message: "You used LIKE to find names containing li.",
          };
        },
      },
    },
  ],
};

export default filtering;
