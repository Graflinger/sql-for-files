import type { Chapter } from "../../types/learn";
import type { QueryResult } from "../../types/query";

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

const SALES_SETUP = [
  `CREATE OR REPLACE TABLE sales (
    id INTEGER,
    salesperson VARCHAR,
    region VARCHAR,
    amount DECIMAL(10,2),
    quantity INTEGER,
    sale_date DATE
  )`,
  `INSERT INTO sales VALUES
    (1, 'Alice', 'West', 1200, 3, '2024-01-05'),
    (2, 'Bob', 'East', 850, 2, '2024-01-08'),
    (3, 'Alice', 'West', 640, 1, '2024-01-11'),
    (4, 'Diana', 'South', 430, 5, '2024-01-12'),
    (5, 'Eve', 'West', 1500, 4, '2024-02-01'),
    (6, 'Frank', 'East', 920, 2, '2024-02-03'),
    (7, 'Grace', 'North', 760, 2, '2024-02-07'),
    (8, 'Bob', 'East', 1100, 3, '2024-02-10')`,
];

function getValue(row: Record<string, unknown>, column: string): unknown {
  const matchingKey = Object.keys(row).find((key) => key.toLowerCase() === column.toLowerCase());
  return matchingKey ? row[matchingKey] : undefined;
}

function hasColumns(result: QueryResult, expectedColumns: string[]): boolean {
  const lowerColumns = result.columns.map((column) => column.toLowerCase());
  return expectedColumns.every((column) => lowerColumns.includes(column.toLowerCase()));
}

const executionOrder: Chapter = {
  id: "execution-order",
  title: "Execution Order",
  lessons: [
    {
      id: "execution-order-logical-order",
      title: "Written Order vs Logical Order",
      content: `SQL is written one way but logically evaluated in another order. A useful mental model is:

  FROM
  JOIN
  WHERE
  GROUP BY
  HAVING
  WINDOW FUNCTIONS
  SELECT
  DISTINCT
  ORDER BY
  LIMIT

This matters because each step can only use what earlier steps have already produced. For example, WHERE usually cannot use a SELECT alias because SELECT has not happened yet.

When a query feels confusing, try reading it in logical order instead of written order. That often explains why a clause works — or why it does not.`,
    },
    {
      id: "execution-order-from-join-where",
      title: "FROM and JOIN Build the Rows First",
      content: `The first big step is FROM plus JOIN. SQL first decides which tables participate and how their rows connect.

Only after the joined row set exists does WHERE filter it.

That is why a query like this works:

  SELECT e.name AS employee_name, d.name AS department_name
  FROM employees AS e
  JOIN departments AS d
    ON e.department_id = d.id
  WHERE d.name = 'Engineering'

The WHERE clause can filter on department data because the JOIN has already happened logically.`,
      sampleData: {
        label: "employees + departments tables",
        setupSql: COMPANY_SETUP,
        tableNames: ["employees", "departments"],
      },
      challenge: {
        prompt:
          "Return the Engineering employees after joining employees and departments. Show employee_name and department_name, ordered by employee_name.",
        hint:
          "JOIN employees to departments on the department id, then filter to department_name = 'Engineering'.",
        initialSql: "-- Join first, then filter\n",
        solutionSql:
          "SELECT e.name AS employee_name, d.name AS department_name\nFROM employees AS e\nJOIN departments AS d\n  ON e.department_id = d.id\nWHERE d.name = 'Engineering'\nORDER BY employee_name;",
        validate: (result) => {
          if (!hasColumns(result, ["employee_name", "department_name"])) {
            return {
              passed: false,
              message: "Return employee_name and department_name.",
            };
          }

          if (result.rowCount !== 3) {
            return {
              passed: false,
              message: `Expected 3 Engineering employees but got ${result.rowCount}.`,
            };
          }

          const expected: Array<[string, string]> = [
            ["Alice", "Engineering"],
            ["Charlie", "Engineering"],
            ["Frank", "Engineering"],
          ];

          for (let index = 0; index < expected.length; index += 1) {
            const row = result.data[index];
            const [expectedEmployeeName, expectedDepartmentName] = expected[index];
            const employeeName = String(getValue(row, "employee_name"));
            const departmentName = String(getValue(row, "department_name"));

            if (employeeName !== expectedEmployeeName || departmentName !== expectedDepartmentName) {
              return {
                passed: false,
                message: "Check the JOIN, the WHERE filter, and the ORDER BY employee_name.",
              };
            }
          }

          return {
            passed: true,
            message: "Correct! SQL built the joined rows first, then filtered them to Engineering.",
          };
        },
      },
    },
    {
      id: "execution-order-where-before-group-by",
      title: "WHERE Filters Before GROUP BY",
      content: `WHERE removes individual rows before any grouping or aggregation happens.

If you write:

  SELECT region, SUM(amount) AS total_amount
  FROM sales
  WHERE amount >= 900
  GROUP BY region

only sales with amount >= 900 participate in the grouped totals. Smaller rows are gone before GROUP BY ever runs.

This is why WHERE is for row-level filters, not group-level filters.`,
      sampleData: {
        label: "sales table (8 rows)",
        setupSql: SALES_SETUP,
        tableNames: ["sales"],
      },
      challenge: {
        prompt:
          "Only consider sales with amount >= 900. Then return region and total_amount, ordered by region.",
        hint:
          "Use WHERE amount >= 900 before GROUP BY region.",
        initialSql: "-- Filter rows before grouping\n",
        solutionSql:
          "SELECT region, SUM(amount) AS total_amount\nFROM sales\nWHERE amount >= 900\nGROUP BY region\nORDER BY region;",
        validate: (result) => {
          if (!hasColumns(result, ["region", "total_amount"])) {
            return {
              passed: false,
              message: "Return region and total_amount.",
            };
          }

          if (result.rowCount !== 2) {
            return {
              passed: false,
              message: `Expected 2 grouped regions but got ${result.rowCount}.`,
            };
          }

          const expected: Array<[string, number]> = [
            ["East", 2020],
            ["West", 2700],
          ];

          for (let index = 0; index < expected.length; index += 1) {
            const row = result.data[index];
            const [expectedRegion, expectedTotal] = expected[index];
            const region = String(getValue(row, "region"));
            const totalAmount = Number(getValue(row, "total_amount"));

            if (region !== expectedRegion || Math.abs(totalAmount - expectedTotal) > 0.01) {
              return {
                passed: false,
                message: "Make sure the WHERE filter happens before grouping and order the rows by region.",
              };
            }
          }

          return {
            passed: true,
            message: "Nice! The lower sales were removed before the regional totals were calculated.",
          };
        },
      },
    },
    {
      id: "execution-order-having-after-group-by",
      title: "HAVING Filters After GROUP BY",
      content: `HAVING runs after GROUP BY. Instead of filtering individual rows, it filters the aggregated groups.

That means this pattern works:

  SELECT region, SUM(amount) AS total_amount
  FROM sales
  GROUP BY region
  HAVING SUM(amount) > 2000

SQL first forms one group per region, calculates each total, and only then removes the groups that do not pass the HAVING condition.`,
      sampleData: {
        label: "sales table (8 rows)",
        setupSql: SALES_SETUP,
        tableNames: ["sales"],
      },
      challenge: {
        prompt:
          "Return the regions whose total sales are greater than 2000. Show region and total_amount, ordered by region.",
        hint:
          "GROUP BY region, then use HAVING SUM(amount) > 2000.",
        initialSql: "-- Filter groups after grouping\n",
        solutionSql:
          "SELECT region, SUM(amount) AS total_amount\nFROM sales\nGROUP BY region\nHAVING SUM(amount) > 2000\nORDER BY region;",
        validate: (result) => {
          if (!hasColumns(result, ["region", "total_amount"])) {
            return {
              passed: false,
              message: "Return region and total_amount.",
            };
          }

          if (result.rowCount !== 2) {
            return {
              passed: false,
              message: `Expected 2 qualifying regions but got ${result.rowCount}.`,
            };
          }

          const expected: Array<[string, number]> = [
            ["East", 2870],
            ["West", 3340],
          ];

          for (let index = 0; index < expected.length; index += 1) {
            const row = result.data[index];
            const [expectedRegion, expectedTotal] = expected[index];
            const region = String(getValue(row, "region"));
            const totalAmount = Number(getValue(row, "total_amount"));

            if (region !== expectedRegion || Math.abs(totalAmount - expectedTotal) > 0.01) {
              return {
                passed: false,
                message: "Check the grouped totals, the HAVING filter, and the ORDER BY region.",
              };
            }
          }

          return {
            passed: true,
            message: "Exactly. HAVING filtered the grouped results after the totals were computed.",
          };
        },
      },
    },
    {
      id: "execution-order-window-functions",
      title: "Where Window Functions Fit",
      content: `Window functions belong later in SQL's logical order. A good mental model is:

  FROM → WHERE → GROUP BY → HAVING → WINDOW FUNCTIONS → SELECT → ORDER BY → LIMIT

That means window functions run after filtering and grouping, but before the final ordering and limiting.

This is why window functions can do things like rank grouped results, but usually cannot be used directly in WHERE or GROUP BY.

For example, this query first groups sales by region, then ranks those regional totals:

  SELECT region,
         SUM(amount) AS total_amount,
         ROW_NUMBER() OVER (ORDER BY SUM(amount) DESC) AS region_rank
  FROM sales
  GROUP BY region

The grouped rows exist first, and then the window function ranks them.`,
      sampleData: {
        label: "sales table (8 rows)",
        setupSql: SALES_SETUP,
        tableNames: ["sales"],
      },
      challenge: {
        prompt:
          "Group sales by region, then rank those grouped totals from highest to lowest. Return region, total_amount, and region_rank, ordered by region_rank.",
        hint:
          "Use SUM(amount) AS total_amount plus ROW_NUMBER() OVER (ORDER BY SUM(amount) DESC).",
        initialSql: "-- Rank grouped totals with a window function\n",
        solutionSql:
          "SELECT region,\n  SUM(amount) AS total_amount,\n  ROW_NUMBER() OVER (ORDER BY SUM(amount) DESC) AS region_rank\nFROM sales\nGROUP BY region\nORDER BY region_rank;",
        validate: (result) => {
          if (!hasColumns(result, ["region", "total_amount", "region_rank"])) {
            return {
              passed: false,
              message: "Return region, total_amount, and region_rank.",
            };
          }

          if (result.rowCount !== 4) {
            return {
              passed: false,
              message: `Expected 4 ranked regions but got ${result.rowCount}.`,
            };
          }

          const expected: Array<[string, number, number]> = [
            ["West", 3340, 1],
            ["East", 2870, 2],
            ["North", 760, 3],
            ["South", 430, 4],
          ];

          for (let index = 0; index < expected.length; index += 1) {
            const row = result.data[index];
            const [expectedRegion, expectedTotalAmount, expectedRegionRank] = expected[index];
            const region = String(getValue(row, "region"));
            const totalAmount = Number(getValue(row, "total_amount"));
            const regionRank = Number(getValue(row, "region_rank"));

            if (
              region !== expectedRegion
              || Math.abs(totalAmount - expectedTotalAmount) > 0.01
              || regionRank !== expectedRegionRank
            ) {
              return {
                passed: false,
                message: "Make sure you group first, then rank the grouped totals, and order by region_rank.",
              };
            }
          }

          return {
            passed: true,
            message: "Perfect! GROUP BY created the regional totals, and the window function ranked those grouped rows afterward.",
          };
        },
      },
    },
    {
      id: "execution-order-select-alias-order-by",
      title: "Why SELECT Aliases Work in ORDER BY",
      content: `SELECT runs later than WHERE but earlier than ORDER BY.

That has an important consequence:

• WHERE usually cannot use a SELECT alias
• ORDER BY can use a SELECT alias

Example:

  SELECT name, salary * 0.10 AS annual_bonus
  FROM employees
  ORDER BY annual_bonus DESC

By the time ORDER BY runs, annual_bonus already exists in the result shape, so sorting by it is allowed.`,
      sampleData: {
        label: "employees table (8 rows)",
        setupSql: EMPLOYEES_SETUP,
        tableNames: ["employees"],
      },
      challenge: {
        prompt:
          "Return name and annual_bonus, where annual_bonus is salary * 0.10. Order the result by annual_bonus descending.",
        hint:
          "Select salary * 0.10 AS annual_bonus, then ORDER BY annual_bonus DESC.",
        initialSql: "-- Sort by a SELECT alias\n",
        solutionSql:
          "SELECT name, salary * 0.10 AS annual_bonus\nFROM employees\nORDER BY annual_bonus DESC;",
        validate: (result) => {
          if (!hasColumns(result, ["name", "annual_bonus"])) {
            return {
              passed: false,
              message: "Return name and annual_bonus.",
            };
          }

          if (result.rowCount !== 8) {
            return {
              passed: false,
              message: `Expected 8 employees but got ${result.rowCount}.`,
            };
          }

          const bonuses = result.data.map((row) => Number(getValue(row, "annual_bonus")));
          for (let index = 1; index < bonuses.length; index += 1) {
            if (bonuses[index] > bonuses[index - 1]) {
              return {
                passed: false,
                message: "Order the rows by annual_bonus from highest to lowest.",
              };
            }
          }

          const firstName = String(getValue(result.data[0], "name"));
          const firstBonus = Number(getValue(result.data[0], "annual_bonus"));

          if (firstName !== "Charlie" || Math.abs(firstBonus - 11000) > 0.01) {
            return {
              passed: false,
              message: "Charlie should appear first with the largest annual_bonus of 11000.",
            };
          }

          return {
            passed: true,
            message: "Correct! ORDER BY could use the alias because SELECT had already produced it.",
          };
        },
      },
    },
    {
      id: "execution-order-limit-last",
      title: "LIMIT Happens at the End",
      content: `LIMIT is one of the last steps. It cuts down the final ordered result, not the raw table.

So in a query like:

  SELECT name, salary
  FROM employees
  WHERE department = 'Engineering'
  ORDER BY salary DESC
  LIMIT 2

SQL first filters to Engineering, then sorts those rows, and only then keeps the top 2.

If LIMIT happened earlier, you would often get the wrong rows.`,
      sampleData: {
        label: "employees table (8 rows)",
        setupSql: EMPLOYEES_SETUP,
        tableNames: ["employees"],
      },
      challenge: {
        prompt:
          "Show the top 2 highest-paid Engineering employees. Return name and salary, ordered by salary descending.",
        hint:
          "Filter to Engineering, order by salary DESC, then LIMIT 2.",
        initialSql: "-- Limit the final ordered result\n",
        solutionSql:
          "SELECT name, salary\nFROM employees\nWHERE department = 'Engineering'\nORDER BY salary DESC\nLIMIT 2;",
        validate: (result) => {
          if (!hasColumns(result, ["name", "salary"])) {
            return {
              passed: false,
              message: "Return name and salary.",
            };
          }

          if (result.rowCount !== 2) {
            return {
              passed: false,
              message: `Expected 2 employees but got ${result.rowCount}.`,
            };
          }

          const expected: Array<[string, number]> = [
            ["Charlie", 110000],
            ["Frank", 102000],
          ];

          for (let index = 0; index < expected.length; index += 1) {
            const row = result.data[index];
            const [expectedName, expectedSalary] = expected[index];
            const name = String(getValue(row, "name"));
            const salary = Number(getValue(row, "salary"));

            if (name !== expectedName || Math.abs(salary - expectedSalary) > 0.01) {
              return {
                passed: false,
                message: "Make sure WHERE, ORDER BY, and LIMIT work together to keep the top two engineers.",
              };
            }
          }

          return {
            passed: true,
            message: "Great! LIMIT kept only the final top two rows after filtering and sorting.",
          };
        },
      },
    },
  ],
};

export default executionOrder;
