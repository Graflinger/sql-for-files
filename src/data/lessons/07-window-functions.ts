import type { Chapter } from "../../types/learn";
import type { QueryResult } from "../../types/query";

const SALES_2_SETUP = [
  `CREATE OR REPLACE TABLE sales_2 (
    id INTEGER,
    salesperson VARCHAR,
    region VARCHAR,
    amount DECIMAL(10,2),
    quantity INTEGER,
    sale_date DATE
  )`,
  `INSERT INTO sales_2 VALUES
    (1, 'Alice', 'West', 1200, 3, '2024-01-05'),
    (2, 'Bob', 'East', 850, 2, '2024-01-08'),
    (3, 'Alice', 'West', 640, 1, '2024-01-11'),
    (4, 'Diana', 'South', 430, 5, '2024-01-12'),
    (5, 'Eve', 'West', 1500, 4, '2024-02-01'),
    (6, 'Frank', 'East', 920, 2, '2024-02-03'),
    (7, 'Grace', 'North', 760, 2, '2024-02-07'),
    (8, 'Bob', 'East', 1100, 3, '2024-02-10'),
    (9, 'Alice', 'West', 780, 2, '2024-03-02'),
    (10, 'Bob', 'East', 990, 3, '2024-03-05'),
    (11, 'Diana', 'South', 610, 2, '2024-03-08'),
    (12, 'Eve', 'West', 700, 1, '2024-03-12'),
    (13, 'Frank', 'East', 1150, 4, '2024-03-15'),
    (14, 'Grace', 'North', 840, 2, '2024-03-18'),
    (15, 'Alice', 'West', 1320, 5, '2024-04-01'),
    (16, 'Bob', 'East', 730, 1, '2024-04-05')`,
];

function getValue(row: Record<string, unknown>, column: string): unknown {
  const matchingKey = Object.keys(row).find((key) => key.toLowerCase() === column.toLowerCase());
  return matchingKey ? row[matchingKey] : undefined;
}

function hasColumns(result: QueryResult, expectedColumns: string[]): boolean {
  const lowerColumns = result.columns.map((column) => column.toLowerCase());
  return expectedColumns.every((column) => lowerColumns.includes(column.toLowerCase()));
}

const windowFunctions: Chapter = {
  id: "window-functions",
  title: "Window Functions",
  lessons: [
    {
      id: "window-functions-over",
      title: "OVER Keeps the Detail Rows",
      content: `A window function calculates across a set of related rows without collapsing the result into one row per group.

That is the big difference from \`GROUP BY\`. \`GROUP BY\` shrinks many rows into fewer summary rows. A window function keeps every original row visible and adds extra information beside it.

For example, this query shows every sale and the grand total repeated next to each row:

~~~sql
SELECT id, salesperson, amount,
       SUM(amount) OVER () AS grand_total
FROM sales_2
~~~

\`OVER ()\` means “use the whole result set as the window.” This is a great first example because it shows the basic idea clearly: same rows, extra context.`,
      sampleData: {
        label: "sales_2 table (16 rows)",
        setupSql: SALES_2_SETUP,
        tableNames: ["sales_2"],
      },
      challenge: {
        prompt:
          "Show every sale with the full-company total beside it. Return id, salesperson, amount, and grand_total, ordered by id.",
        hint:
          "Use SUM(amount) OVER () AS grand_total, then ORDER BY id.",
        initialSql: "-- Add the grand total beside each sale\n",
        solutionSql:
          "SELECT id, salesperson, amount, SUM(amount) OVER () AS grand_total\nFROM sales_2\nORDER BY id;",
        validate: (result) => {
          if (!hasColumns(result, ["id", "salesperson", "amount", "grand_total"])) {
            return {
              passed: false,
              message: "Return the columns id, salesperson, amount, and grand_total.",
            };
          }

          if (result.rowCount !== 16) {
            return {
              passed: false,
              message: `Expected 16 sale rows but got ${result.rowCount}. Window functions should keep every original row.`,
            };
          }

          const expectedSalespeople = [
            "Alice",
            "Bob",
            "Alice",
            "Diana",
            "Eve",
            "Frank",
            "Grace",
            "Bob",
            "Alice",
            "Bob",
            "Diana",
            "Eve",
            "Frank",
            "Grace",
            "Alice",
            "Bob",
          ];

          for (let index = 0; index < expectedSalespeople.length; index += 1) {
            const row = result.data[index];
            const id = Number(getValue(row, "id"));
            const salesperson = String(getValue(row, "salesperson"));
            const grandTotal = Number(getValue(row, "grand_total"));

            if (id !== index + 1 || salesperson !== expectedSalespeople[index] || Math.abs(grandTotal - 14520) > 0.01) {
              return {
                passed: false,
                message: "Order by id and make sure grand_total shows 14520 on every row.",
              };
            }
          }

          return {
            passed: true,
            message: "Exactly. OVER () kept all 16 sale rows and added the company-wide total to each one.",
          };
        },
      },
    },
    {
      id: "window-functions-partition",
      title: "PARTITION BY Creates Mini Windows",
      content: `\`PARTITION BY\` splits the result set into smaller windows before the function runs.

If you want each sale to carry its region total, you do not want one giant company-wide window anymore. You want one window per region:

~~~sql
SELECT id, region, amount,
       SUM(amount) OVER (PARTITION BY region) AS region_total
FROM sales_2
~~~

Now every East row gets the East total, every West row gets the West total, and so on.

This is one of the most useful patterns in SQL because it lets you compare a row to its group without losing row-level detail.`,
      sampleData: {
        label: "sales_2 table (16 rows)",
        setupSql: SALES_2_SETUP,
        tableNames: ["sales_2"],
      },
      challenge: {
        prompt:
          "Show each sale with its regional total. Return id, region, amount, and region_total, ordered by id.",
        hint:
          "Use SUM(amount) OVER (PARTITION BY region) AS region_total.",
        initialSql: "-- Add the region total beside each sale\n",
        solutionSql:
          "SELECT id, region, amount, SUM(amount) OVER (PARTITION BY region) AS region_total\nFROM sales_2\nORDER BY id;",
        validate: (result) => {
          if (!hasColumns(result, ["id", "region", "amount", "region_total"])) {
            return {
              passed: false,
              message: "Return id, region, amount, and region_total.",
            };
          }

          if (result.rowCount !== 16) {
            return {
              passed: false,
              message: `Expected 16 sale rows but got ${result.rowCount}.`,
            };
          }

          const expected: Array<[number, string, number]> = [
            [1, "West", 6140],
            [2, "East", 5740],
            [3, "West", 6140],
            [4, "South", 1040],
            [5, "West", 6140],
            [6, "East", 5740],
            [7, "North", 1600],
            [8, "East", 5740],
            [9, "West", 6140],
            [10, "East", 5740],
            [11, "South", 1040],
            [12, "West", 6140],
            [13, "East", 5740],
            [14, "North", 1600],
            [15, "West", 6140],
            [16, "East", 5740],
          ];

          for (let index = 0; index < expected.length; index += 1) {
            const row = result.data[index];
            const [expectedId, expectedRegion, expectedRegionTotal] = expected[index];
            const id = Number(getValue(row, "id"));
            const region = String(getValue(row, "region"));
            const regionTotal = Number(getValue(row, "region_total"));

            if (id !== expectedId || region !== expectedRegion || Math.abs(regionTotal - expectedRegionTotal) > 0.01) {
              return {
                passed: false,
                message: "Check your PARTITION BY region logic and order the rows by id.",
              };
            }
          }

          return {
            passed: true,
            message: "Nice! PARTITION BY region created a separate calculation context for each region.",
          };
        },
      },
    },
    {
      id: "window-functions-running-total",
      title: "Running Totals with ORDER BY",
      content: `Adding \`ORDER BY\` inside the window makes the function care about row sequence.

That is how you build running totals:

~~~sql
SELECT salesperson, sale_date, amount,
       SUM(amount) OVER (
         PARTITION BY salesperson
         ORDER BY sale_date
         ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
       ) AS running_amount
FROM sales_2
~~~

The frame clause \`ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\` says: start at the first row in this salesperson's partition and keep summing up to the current row.

Writing the frame explicitly avoids surprises. Some databases use a default frame when you add \`ORDER BY\`, and duplicate ordering values can make that default behave differently than a row-by-row running total.

This pattern is common in finance, analytics, and product dashboards whenever you want a cumulative view over time.`,
      sampleData: {
        label: "sales_2 table (16 rows)",
        setupSql: SALES_2_SETUP,
        tableNames: ["sales_2"],
      },
      challenge: {
        prompt:
          "For each salesperson, show their cumulative sales over time. Return salesperson, sale_date, amount, and running_amount, ordered by salesperson and sale_date.",
        hint:
          "Use SUM(amount) OVER (PARTITION BY salesperson ORDER BY sale_date ...) AS running_amount.",
        initialSql: "-- Build a running total per salesperson\n",
        solutionSql:
          "SELECT salesperson, sale_date, amount,\n  SUM(amount) OVER (\n    PARTITION BY salesperson\n    ORDER BY sale_date\n    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\n  ) AS running_amount\nFROM sales_2\nORDER BY salesperson, sale_date;",
        validate: (result) => {
          if (!hasColumns(result, ["salesperson", "sale_date", "amount", "running_amount"])) {
            return {
              passed: false,
              message: "Return salesperson, sale_date, amount, and running_amount.",
            };
          }

          if (result.rowCount !== 16) {
            return {
              passed: false,
              message: `Expected 16 sale rows but got ${result.rowCount}.`,
            };
          }

          const expected: Array<[string, string, number, number]> = [
            ["Alice", "2024-01-05", 1200, 1200],
            ["Alice", "2024-01-11", 640, 1840],
            ["Alice", "2024-03-02", 780, 2620],
            ["Alice", "2024-04-01", 1320, 3940],
            ["Bob", "2024-01-08", 850, 850],
            ["Bob", "2024-02-10", 1100, 1950],
            ["Bob", "2024-03-05", 990, 2940],
            ["Bob", "2024-04-05", 730, 3670],
            ["Diana", "2024-01-12", 430, 430],
            ["Diana", "2024-03-08", 610, 1040],
            ["Eve", "2024-02-01", 1500, 1500],
            ["Eve", "2024-03-12", 700, 2200],
            ["Frank", "2024-02-03", 920, 920],
            ["Frank", "2024-03-15", 1150, 2070],
            ["Grace", "2024-02-07", 760, 760],
            ["Grace", "2024-03-18", 840, 1600],
          ];

          for (let index = 0; index < expected.length; index += 1) {
            const row = result.data[index];
            const [expectedSalesperson, expectedSaleDate, expectedAmount, expectedRunningAmount] = expected[index];
            const salesperson = String(getValue(row, "salesperson"));
            const saleDate = String(getValue(row, "sale_date"));
            const amount = Number(getValue(row, "amount"));
            const runningAmount = Number(getValue(row, "running_amount"));

            if (
              salesperson !== expectedSalesperson
              || saleDate !== expectedSaleDate
              || Math.abs(amount - expectedAmount) > 0.01
              || Math.abs(runningAmount - expectedRunningAmount) > 0.01
            ) {
              return {
                passed: false,
                message: "Check your partitioning, your ORDER BY sale_date, and your running totals.",
              };
            }
          }

          return {
            passed: true,
            message: "Great! You turned each salesperson's sales into a time-based running total.",
          };
        },
      },
    },
    {
      id: "window-functions-row-number",
      title: "Ranking Rows with ROW_NUMBER",
      content: `Window functions are also great for ranking.

\`ROW_NUMBER\` gives each row a position inside its partition:

~~~sql
SELECT region, salesperson, amount,
       ROW_NUMBER() OVER (
         PARTITION BY region
         ORDER BY amount DESC
       ) AS region_row_number
FROM sales_2
~~~

This lets you answer questions like:

• What is the biggest sale in each region?
• What are the top 3 orders per customer?
• Which event happened first for each user?

\`RANK\` and \`DENSE_RANK\` are close relatives that handle ties differently, but \`ROW_NUMBER\` is the easiest place to start.

If two rows have the same sorting value, add a second column to make the order deterministic. For example, \`ORDER BY amount DESC, id\` breaks ties by \`id\`.`,
      sampleData: {
        label: "sales_2 table (16 rows)",
        setupSql: SALES_2_SETUP,
        tableNames: ["sales_2"],
      },
      challenge: {
        prompt:
          "Number the sales inside each region from largest amount to smallest. Return region, salesperson, amount, and region_row_number, ordered by region and region_row_number.",
        hint:
          "Use ROW_NUMBER() OVER (PARTITION BY region ORDER BY amount DESC, id).",
        initialSql: "-- Number sales within each region\n",
        solutionSql:
          "SELECT region, salesperson, amount,\n  ROW_NUMBER() OVER (\n    PARTITION BY region\n    ORDER BY amount DESC, id\n  ) AS region_row_number\nFROM sales_2\nORDER BY region, region_row_number;",
        validate: (result) => {
          if (!hasColumns(result, ["region", "salesperson", "amount", "region_row_number"])) {
            return {
              passed: false,
              message: "Return region, salesperson, amount, and region_row_number.",
            };
          }

          if (result.rowCount !== 16) {
            return {
              passed: false,
              message: `Expected 16 ranked sale rows but got ${result.rowCount}.`,
            };
          }

          const expected: Array<[string, string, number, number]> = [
            ["East", "Frank", 1150, 1],
            ["East", "Bob", 1100, 2],
            ["East", "Bob", 990, 3],
            ["East", "Frank", 920, 4],
            ["East", "Bob", 850, 5],
            ["East", "Bob", 730, 6],
            ["North", "Grace", 840, 1],
            ["North", "Grace", 760, 2],
            ["South", "Diana", 610, 1],
            ["South", "Diana", 430, 2],
            ["West", "Eve", 1500, 1],
            ["West", "Alice", 1320, 2],
            ["West", "Alice", 1200, 3],
            ["West", "Alice", 780, 4],
            ["West", "Eve", 700, 5],
            ["West", "Alice", 640, 6],
          ];

          for (let index = 0; index < expected.length; index += 1) {
            const row = result.data[index];
            const [expectedRegion, expectedSalesperson, expectedAmount, expectedRowNumber] = expected[index];
            const region = String(getValue(row, "region"));
            const salesperson = String(getValue(row, "salesperson"));
            const amount = Number(getValue(row, "amount"));
            const rowNumber = Number(getValue(row, "region_row_number"));

            if (
              region !== expectedRegion
              || salesperson !== expectedSalesperson
              || Math.abs(amount - expectedAmount) > 0.01
              || rowNumber !== expectedRowNumber
            ) {
              return {
                passed: false,
                message: "Check your per-region ranking and order the final result by region and region_row_number.",
              };
            }
          }

          return {
            passed: true,
            message: "Perfect. ROW_NUMBER assigned a clear position to each sale inside its region.",
          };
        },
      },
    },
    {
      id: "window-functions-lag",
      title: "Looking Back with LAG",
      content: `\`LAG\` lets you reach into an earlier row in the same partition.

For example, you can show each salesperson's previous sale amount beside the current one:

~~~sql
SELECT salesperson, sale_date, amount,
       LAG(amount) OVER (
         PARTITION BY salesperson
         ORDER BY sale_date
       ) AS previous_amount
FROM sales_2
~~~

The first row in each salesperson's partition has no earlier row, so \`LAG\` returns \`NULL\` there.

The companion function is \`LEAD\`, which looks forward instead of backward. For example, \`LEAD(amount) OVER (...)\` can show the next sale amount beside the current sale.

This is useful for change-over-time questions like month-over-month growth, previous status, or the gap from the last event.`,
      sampleData: {
        label: "sales_2 table (16 rows)",
        setupSql: SALES_2_SETUP,
        tableNames: ["sales_2"],
      },
      challenge: {
        prompt:
          "Show each sale together with the salesperson's previous sale amount. Return salesperson, sale_date, amount, and previous_amount, ordered by salesperson and sale_date.",
        hint:
          "Use LAG(amount) OVER (PARTITION BY salesperson ORDER BY sale_date).",
        initialSql: "-- Show the previous sale amount for each salesperson\n",
        solutionSql:
          "SELECT salesperson, sale_date, amount,\n  LAG(amount) OVER (\n    PARTITION BY salesperson\n    ORDER BY sale_date\n  ) AS previous_amount\nFROM sales_2\nORDER BY salesperson, sale_date;",
        validate: (result) => {
          if (!hasColumns(result, ["salesperson", "sale_date", "amount", "previous_amount"])) {
            return {
              passed: false,
              message: "Return salesperson, sale_date, amount, and previous_amount.",
            };
          }

          if (result.rowCount !== 16) {
            return {
              passed: false,
              message: `Expected 16 sale rows but got ${result.rowCount}.`,
            };
          }

          const expected: Array<[string, string, number, number | null]> = [
            ["Alice", "2024-01-05", 1200, null],
            ["Alice", "2024-01-11", 640, 1200],
            ["Alice", "2024-03-02", 780, 640],
            ["Alice", "2024-04-01", 1320, 780],
            ["Bob", "2024-01-08", 850, null],
            ["Bob", "2024-02-10", 1100, 850],
            ["Bob", "2024-03-05", 990, 1100],
            ["Bob", "2024-04-05", 730, 990],
            ["Diana", "2024-01-12", 430, null],
            ["Diana", "2024-03-08", 610, 430],
            ["Eve", "2024-02-01", 1500, null],
            ["Eve", "2024-03-12", 700, 1500],
            ["Frank", "2024-02-03", 920, null],
            ["Frank", "2024-03-15", 1150, 920],
            ["Grace", "2024-02-07", 760, null],
            ["Grace", "2024-03-18", 840, 760],
          ];

          for (let index = 0; index < expected.length; index += 1) {
            const row = result.data[index];
            const [expectedSalesperson, expectedSaleDate, expectedAmount, expectedPreviousAmount] = expected[index];
            const salesperson = String(getValue(row, "salesperson"));
            const saleDate = String(getValue(row, "sale_date"));
            const amount = Number(getValue(row, "amount"));
            const previousAmountValue = getValue(row, "previous_amount");
            const previousAmount = previousAmountValue == null ? null : Number(previousAmountValue);

            if (
              salesperson !== expectedSalesperson
              || saleDate !== expectedSaleDate
              || Math.abs(amount - expectedAmount) > 0.01
              || (expectedPreviousAmount == null
                ? previousAmount !== null
                : previousAmount == null || Math.abs(previousAmount - expectedPreviousAmount) > 0.01)
            ) {
              return {
                passed: false,
                message: "Check your LAG window and order the rows by salesperson and sale_date.",
              };
            }
          }

          return {
            passed: true,
            message: "Excellent. LAG let you compare each sale to the previous one without losing any rows.",
          };
        },
      },
    },
    {
      id: "window-functions-common-functions",
      title: "Other Common Window Functions",
      content: `You have now seen the main shape of window functions: a function call followed by an \`OVER (...)\` clause.

The same window definition can be paired with several families of functions:

**Aggregate window functions** reuse aggregates you already know, but without collapsing rows:

\`SUM(...) OVER (...)\`, \`AVG(...) OVER (...)\`, \`MIN(...) OVER (...)\`, \`MAX(...) OVER (...)\`, and \`COUNT(...) OVER (...)\`

Use these for totals, running totals, moving averages, group averages beside detail rows, and percent-of-total calculations.

**Ranking functions** assign positions inside an ordered window:

\`ROW_NUMBER()\` gives every row a unique sequence number.
\`RANK()\` gives tied rows the same rank and leaves gaps.
\`DENSE_RANK()\` gives tied rows the same rank without gaps.
\`NTILE(n)\` splits ordered rows into roughly equal buckets, such as quartiles with \`NTILE(4)\`.

Use these for top-N queries, leaderboards, deduplication, and percentile-style grouping.

**Offset functions** compare a row to nearby rows:

\`LAG(...)\` looks backward.
\`LEAD(...)\` looks forward.

Use these for change-over-time analysis, previous/next status, gaps between events, and month-over-month comparisons.

**Value functions** pick values from a window frame:

\`FIRST_VALUE(...)\` returns the first value in the current frame.
\`LAST_VALUE(...)\` returns the last value in the current frame.
\`NTH_VALUE(..., n)\` returns the nth value in the current frame.

These are powerful, but they depend heavily on the window frame. If \`LAST_VALUE\` surprises you, check whether your frame ends at the current row or at the end of the partition.

A useful rule of thumb: choose the function for the question, then choose \`PARTITION BY\` for the groups, \`ORDER BY\` for the sequence, and a frame when the exact row range matters.`,
    },
  ],
};

export default windowFunctions;
