import type { Chapter } from "../../types/learn";
import type { QueryResult } from "../../types/query";

const COMPANY_SETUP = [
  `CREATE OR REPLACE TABLE departments (
    id INTEGER,
    name VARCHAR
  )`,
  `INSERT INTO departments VALUES
    (1, 'Engineering'),
    (2, 'Marketing'),
    (3, 'Sales'),
    (4, 'Support')`,
  `CREATE OR REPLACE TABLE employees (
    id INTEGER,
    name VARCHAR,
    department_id INTEGER,
    manager_id INTEGER
  )`,
  `INSERT INTO employees VALUES
    (1, 'Alice', 1, NULL),
    (2, 'Bob', 2, 1),
    (3, 'Charlie', 1, 1),
    (4, 'Diana', 3, 2),
    (5, 'Eve', NULL, 2),
    (6, 'Frank', 1, 3)`,
];

const CROSS_JOIN_SETUP = [
  `CREATE OR REPLACE TABLE departments (
    id INTEGER,
    name VARCHAR
  )`,
  `INSERT INTO departments VALUES
    (1, 'Engineering'),
    (2, 'Marketing'),
    (3, 'Sales'),
    (4, 'Support')`,
  `CREATE OR REPLACE TABLE meeting_days (
    day_name VARCHAR
  )`,
  `INSERT INTO meeting_days VALUES
    ('Tuesday'),
    ('Thursday')`,
];

function getValue(row: Record<string, unknown>, column: string): unknown {
  const matchingKey = Object.keys(row).find((key) => key.toLowerCase() === column.toLowerCase());
  return matchingKey ? row[matchingKey] : undefined;
}

function hasColumns(result: QueryResult, expectedColumns: string[]): boolean {
  const lowerColumns = result.columns.map((column) => column.toLowerCase());
  return expectedColumns.every((column) => lowerColumns.includes(column.toLowerCase()));
}

function nullableText(value: unknown) {
  return value == null ? "__NULL__" : String(value);
}

const joins: Chapter = {
  id: "joins",
  title: "JOIN Types",
  lessons: [
    {
      id: "joins-why",
      title: "Why JOINs Exist",
      content: `When a database is normalized, related facts live in different tables. That keeps the data clean, but it also means you need a way to bring those facts back together when you query.

That is what JOIN does. It combines rows from two tables based on a matching key.

For example, employees.department_id points to departments.id. The employees table knows which department an employee belongs to, and the departments table knows the department name. A JOIN lets you combine both facts into one result.

The most important thing in a JOIN is the matching condition:

  ON employees.department_id = departments.id

If you understand which columns connect the tables, the rest of the JOIN becomes much easier to reason about.`,
    },
    {
      id: "joins-inner",
      title: "INNER JOIN Basics",
      content: `An INNER JOIN keeps only rows that match on both sides.

For example, employees.department_id points to departments.id. To show each employee with their department name, you can write:

  SELECT e.name AS employee_name, d.name AS department_name
  FROM employees AS e
  INNER JOIN departments AS d
    ON e.department_id = d.id

The ON clause defines how the rows relate. With INNER JOIN, employees that do not have a matching department are excluded.

Use INNER JOIN when you only want records that exist in both tables.`,
      sampleData: {
        label: "employees + departments tables",
        setupSql: COMPANY_SETUP,
        tableNames: ["employees", "departments"],
      },
      challenge: {
        prompt:
          "List employee names with their department names for employees that have a matching department. Return employee_name and department_name, ordered by employee_name.",
        hint:
          "SELECT e.name AS employee_name, d.name AS department_name FROM employees AS e INNER JOIN departments AS d ON e.department_id = d.id ORDER BY employee_name",
        initialSql: "-- Join employees to departments\n",
        solutionSql:
          "SELECT e.name AS employee_name, d.name AS department_name\nFROM employees AS e\nINNER JOIN departments AS d\n  ON e.department_id = d.id\nORDER BY employee_name;",
        validate: (result) => {
          if (!hasColumns(result, ["employee_name", "department_name"])) {
            return {
              passed: false,
              message: "Alias your columns as employee_name and department_name so the result is easy to read.",
            };
          }

          if (result.rowCount !== 5) {
            return {
              passed: false,
              message: `Expected 5 matched employees but got ${result.rowCount}. INNER JOIN should exclude Eve because she has no department.`,
            };
          }

          const expectedPairs = new Set([
            "Alice|Engineering",
            "Bob|Marketing",
            "Charlie|Engineering",
            "Diana|Sales",
            "Frank|Engineering",
          ]);

          const actualPairs = new Set(
            result.data.map((row) => `${String(getValue(row, "employee_name"))}|${String(getValue(row, "department_name"))}`)
          );

          const allPairsMatch = expectedPairs.size === actualPairs.size
            && [...expectedPairs].every((pair) => actualPairs.has(pair));

          if (!allPairsMatch) {
            return {
              passed: false,
              message: "Your join should match each employee to the correct department.",
            };
          }

          return {
            passed: true,
            message: "Correct! INNER JOIN kept only employees that have a matching department row.",
          };
        },
      },
    },
    {
      id: "joins-left",
      title: "LEFT JOIN Keeps the Left Side",
      content: `A LEFT JOIN keeps every row from the left table and fills missing right-side values with NULL.

  SELECT d.name AS department_name, e.name AS employee_name
  FROM departments AS d
  LEFT JOIN employees AS e
    ON d.id = e.department_id

This is useful when you want to keep all rows from one table, even if some of them do not have a match in the other table.

In this example, Support still appears even though nobody works there.`,
      sampleData: {
        label: "employees + departments tables",
        setupSql: COMPANY_SETUP,
        tableNames: ["employees", "departments"],
      },
      challenge: {
        prompt:
          "Show every department and any employee assigned to it. Return department_name and employee_name, ordered by department_name and then employee_name. Make sure Support still appears even though nobody works there.",
        hint:
          "Start from departments, then LEFT JOIN employees ON departments.id = employees.department_id.",
        initialSql: "-- Show all departments, even empty ones\n",
        solutionSql:
          "SELECT d.name AS department_name, e.name AS employee_name\nFROM departments AS d\nLEFT JOIN employees AS e\n  ON d.id = e.department_id\nORDER BY department_name, employee_name;",
        validate: (result) => {
          if (!hasColumns(result, ["department_name", "employee_name"])) {
            return {
              passed: false,
              message: "Alias your columns as department_name and employee_name.",
            };
          }

          if (result.rowCount !== 6) {
            return {
              passed: false,
              message: `Expected 6 rows but got ${result.rowCount}. A LEFT JOIN from departments should include Support with a NULL employee.`,
            };
          }

          const expectedPairs = new Set([
            "Engineering|Alice",
            "Engineering|Charlie",
            "Engineering|Frank",
            "Marketing|Bob",
            "Sales|Diana",
            "Support|__NULL__",
          ]);

          const actualPairs = new Set(
            result.data.map((row) => `${String(getValue(row, "department_name"))}|${nullableText(getValue(row, "employee_name"))}`)
          );

          const allPairsMatch = expectedPairs.size === actualPairs.size
            && [...expectedPairs].every((pair) => actualPairs.has(pair));

          if (!allPairsMatch) {
            return {
              passed: false,
              message: "Check that all departments appear, including Support with a NULL employee_name.",
            };
          }

          return {
            passed: true,
            message: "Nice work! LEFT JOIN preserved the unmatched Support department.",
          };
        },
      },
    },
    {
      id: "joins-find-missing",
      title: "Finding Missing Matches",
      content: `One common use of LEFT JOIN is to find rows that do not have a match.

Start with the table you want to keep, LEFT JOIN the related table, then filter to rows where the right side is NULL.

For example, to find departments without employees:

  SELECT d.name AS department_name
  FROM departments AS d
  LEFT JOIN employees AS e
    ON d.id = e.department_id
  WHERE e.id IS NULL

This pattern is very useful for spotting missing data and gaps in relationships.`,
      sampleData: {
        label: "employees + departments tables",
        setupSql: COMPANY_SETUP,
        tableNames: ["employees", "departments"],
      },
      challenge: {
        prompt:
          "Find departments that do not currently have any employees. Return department_name.",
        hint:
          "LEFT JOIN employees to departments, then keep only rows where the employee side is NULL.",
        initialSql: "-- Find departments with no employees\n",
        solutionSql:
          "SELECT d.name AS department_name\nFROM departments AS d\nLEFT JOIN employees AS e\n  ON d.id = e.department_id\nWHERE e.id IS NULL;",
        validate: (result) => {
          if (!hasColumns(result, ["department_name"])) {
            return {
              passed: false,
              message: "Return department_name.",
            };
          }

          if (result.rowCount !== 1) {
            return {
              passed: false,
              message: `Expected 1 unmatched department but got ${result.rowCount}.`,
            };
          }

          const departmentName = String(getValue(result.data[0], "department_name"));

          if (departmentName !== "Support") {
            return {
              passed: false,
              message: "Support is the only department without employees.",
            };
          }

          return {
            passed: true,
            message: "Correct! LEFT JOIN plus IS NULL is a great way to find missing matches.",
          };
        },
      },
    },
    {
      id: "joins-full-outer",
      title: "RIGHT JOIN and FULL OUTER JOIN",
      content: `RIGHT JOIN is the mirror image of LEFT JOIN: it keeps every row from the right table.

FULL OUTER JOIN goes one step further and keeps unmatched rows from both sides.

That means a FULL OUTER JOIN can show:

• matched rows
• rows that only exist on the left
• rows that only exist on the right

This is useful when you want a complete picture of how two tables overlap. In the sample data, Support has no employees, and Eve has no department. FULL OUTER JOIN can show both situations in one result.`,
      sampleData: {
        label: "employees + departments tables",
        setupSql: COMPANY_SETUP,
        tableNames: ["employees", "departments"],
      },
      challenge: {
        prompt:
          "Show all departments and all employees, even when there is no match. Return department_name and employee_name.",
        hint:
          "Use a FULL OUTER JOIN between departments and employees on the department id.",
        initialSql: "-- Show all matched and unmatched rows\n",
        solutionSql:
          "SELECT d.name AS department_name, e.name AS employee_name\nFROM departments AS d\nFULL OUTER JOIN employees AS e\n  ON d.id = e.department_id;",
        validate: (result) => {
          if (!hasColumns(result, ["department_name", "employee_name"])) {
            return {
              passed: false,
              message: "Return department_name and employee_name.",
            };
          }

          if (result.rowCount !== 7) {
            return {
              passed: false,
              message: `Expected 7 rows but got ${result.rowCount}. FULL OUTER JOIN should include both Support and Eve.`,
            };
          }

          const expectedPairs = new Set([
            "Engineering|Alice",
            "Marketing|Bob",
            "Engineering|Charlie",
            "Sales|Diana",
            "__NULL__|Eve",
            "Engineering|Frank",
            "Support|__NULL__",
          ]);

          const actualPairs = new Set(
            result.data.map((row) => `${nullableText(getValue(row, "department_name"))}|${nullableText(getValue(row, "employee_name"))}`)
          );

          const allPairsMatch = expectedPairs.size === actualPairs.size
            && [...expectedPairs].every((pair) => actualPairs.has(pair));

          if (!allPairsMatch) {
            return {
              passed: false,
              message: "Your FULL OUTER JOIN should include all matched rows plus Support and Eve as unmatched rows.",
            };
          }

          return {
            passed: true,
            message: "Great! FULL OUTER JOIN kept unmatched rows from both tables.",
          };
        },
      },
    },
    {
      id: "joins-self",
      title: "SELF JOIN for Hierarchies",
      content: `A SELF JOIN joins a table to itself. This is common when rows relate to other rows in the same table, such as employees and managers.

  SELECT e.name AS employee_name, m.name AS manager_name
  FROM employees AS e
  LEFT JOIN employees AS m
    ON e.manager_id = m.id

The employees table appears twice with different aliases. One copy represents the employee, and the other represents the manager.

This pattern is useful for org charts, parent-child relationships, and tree-like data.`,
      sampleData: {
        label: "employees + departments tables",
        setupSql: COMPANY_SETUP,
        tableNames: ["employees", "departments"],
      },
      challenge: {
        prompt:
          "List every employee together with their manager. Return employee_name and manager_name, ordered by employee_name. Include Alice with a NULL manager_name.",
        hint:
          "Join employees to itself with two aliases, and use a LEFT JOIN so Alice still appears.",
        initialSql: "-- Self join employees to managers\n",
        solutionSql:
          "SELECT e.name AS employee_name, m.name AS manager_name\nFROM employees AS e\nLEFT JOIN employees AS m\n  ON e.manager_id = m.id\nORDER BY employee_name;",
        validate: (result) => {
          if (!hasColumns(result, ["employee_name", "manager_name"])) {
            return {
              passed: false,
              message: "Alias your columns as employee_name and manager_name.",
            };
          }

          if (result.rowCount !== 6) {
            return {
              passed: false,
              message: `Expected 6 employees but got ${result.rowCount}. Use a LEFT JOIN so the top-level manager still appears.`,
            };
          }

          const expectedPairs = new Set([
            "Alice|__NULL__",
            "Bob|Alice",
            "Charlie|Alice",
            "Diana|Bob",
            "Eve|Bob",
            "Frank|Charlie",
          ]);

          const actualPairs = new Set(
            result.data.map((row) => `${String(getValue(row, "employee_name"))}|${nullableText(getValue(row, "manager_name"))}`)
          );

          const allPairsMatch = expectedPairs.size === actualPairs.size
            && [...expectedPairs].every((pair) => actualPairs.has(pair));

          if (!allPairsMatch) {
            return {
              passed: false,
              message: "Each employee should be paired with the correct manager from the same table.",
            };
          }

          return {
            passed: true,
            message: "Correct! You used a SELF JOIN to connect employees to their managers.",
          };
        },
      },
    },
    {
      id: "joins-cross",
      title: "CROSS JOIN for All Combinations",
      content: `CROSS JOIN returns every possible combination of rows from both tables.

If one table has 4 rows and the other has 2, the result has 8 rows.

  SELECT d.name AS department_name, m.day_name
  FROM departments AS d
  CROSS JOIN meeting_days AS m

CROSS JOIN is useful for generating schedules, calendars, test cases, and other complete combinations. Be careful though: the result size grows very quickly.`,
      sampleData: {
        label: "departments + meeting_days tables",
        setupSql: CROSS_JOIN_SETUP,
        tableNames: ["departments", "meeting_days"],
      },
      challenge: {
        prompt:
          "Create every department/day combination. Return department_name and day_name, ordered by department_name and day_name.",
        hint:
          "Use CROSS JOIN between departments and meeting_days.",
        initialSql: "-- Create all department/day combinations\n",
        solutionSql:
          "SELECT d.name AS department_name, m.day_name\nFROM departments AS d\nCROSS JOIN meeting_days AS m\nORDER BY department_name, day_name;",
        validate: (result) => {
          if (!hasColumns(result, ["department_name", "day_name"])) {
            return {
              passed: false,
              message: "Return department_name and day_name.",
            };
          }

          if (result.rowCount !== 8) {
            return {
              passed: false,
              message: `Expected 8 department/day combinations but got ${result.rowCount}.`,
            };
          }

          const expectedPairs = new Set([
            "Engineering|Thursday",
            "Engineering|Tuesday",
            "Marketing|Thursday",
            "Marketing|Tuesday",
            "Sales|Thursday",
            "Sales|Tuesday",
            "Support|Thursday",
            "Support|Tuesday",
          ]);

          const actualPairs = new Set(
            result.data.map((row) => `${String(getValue(row, "department_name"))}|${String(getValue(row, "day_name"))}`)
          );

          const allPairsMatch = expectedPairs.size === actualPairs.size
            && [...expectedPairs].every((pair) => actualPairs.has(pair));

          if (!allPairsMatch) {
            return {
              passed: false,
              message: "A CROSS JOIN should create every possible department/day pairing.",
            };
          }

          return {
            passed: true,
            message: "Exactly! CROSS JOIN created the full set of combinations.",
          };
        },
      },
    },
  ],
};

export default joins;
