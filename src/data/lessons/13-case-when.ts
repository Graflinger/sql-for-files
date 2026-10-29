import type { Chapter } from "../../types/learn";
import type { QueryResult } from "../../types/query";

const SHOP_ORDERS_SETUP = [
  `CREATE OR REPLACE TABLE shop_orders (
    order_id INTEGER,
    customer VARCHAR,
    amount DECIMAL(10,2),
    status VARCHAR,
    country VARCHAR,
    order_date DATE
  )`,
  `INSERT INTO shop_orders VALUES
    (1, 'Ava', 45.00, 'shipped', 'US', '2024-03-01'),
    (2, 'Ben', 180.00, 'shipped', 'DE', '2024-03-02'),
    (3, 'Cara', 95.50, 'pending', 'US', '2024-03-03'),
    (4, 'Dan', 320.00, 'cancelled', 'FR', '2024-03-04'),
    (5, 'Eli', 12.99, 'shipped', 'DE', '2024-03-05'),
    (6, 'Fay', 150.00, 'pending', 'US', '2024-03-06'),
    (7, 'Gus', 99.99, 'shipped', 'FR', '2024-03-07'),
    (8, 'Hana', 510.00, 'shipped', 'US', '2024-03-08'),
    (9, 'Ivo', 75.25, 'refunded', 'DE', '2024-03-09'),
    (10, 'Jun', NULL, 'pending', 'US', '2024-03-10')`,
];

const SAMPLE_DATA = {
  label: "shop_orders table (10 rows, one missing amount)",
  setupSql: SHOP_ORDERS_SETUP,
  tableNames: ["shop_orders"],
};

function getValue(row: Record<string, unknown>, column: string): unknown {
  const matchingKey = Object.keys(row).find((key) => key.toLowerCase() === column.toLowerCase());
  return matchingKey ? row[matchingKey] : undefined;
}

function hasColumns(result: QueryResult, columns: string[]): boolean {
  const lowerColumns = result.columns.map((column) => column.toLowerCase());
  return columns.every((column) => lowerColumns.includes(column));
}

/**
 * Compare a labelled column against expected values keyed by order_id.
 * Returns an error message, or null when every row matches.
 */
function checkLabels(
  result: QueryResult,
  labelColumn: string,
  expected: Record<number, string>
): string | null {
  const expectedIds = Object.keys(expected).map(Number);

  if (result.rowCount !== expectedIds.length) {
    return `Expected ${expectedIds.length} rows but got ${result.rowCount}.`;
  }

  if (!hasColumns(result, ["order_id", labelColumn])) {
    return `Return order_id and a column named ${labelColumn}.`;
  }

  for (let index = 0; index < expectedIds.length; index += 1) {
    const row = result.data[index];
    const orderId = Number(getValue(row, "order_id"));
    const label = getValue(row, labelColumn);

    if (orderId !== expectedIds[index]) {
      return "Order the result by order_id.";
    }

    if (label !== expected[orderId]) {
      return `Order ${orderId} should be labelled '${expected[orderId]}' but got '${String(label)}'.`;
    }
  }

  return null;
}

const caseWhen: Chapter = {
  id: "case-when",
  title: "CASE WHEN Expressions",
  description:
    "Add conditional logic to queries with CASE WHEN: label rows, bucket numbers, map codes to readable values, and count or sum only the rows that match.",
  guideSlug: "sql-case-when-conditional-logic",
  recommendedAfter: "grouping",
  lessons: [
    {
      id: "case-when-basics",
      title: "CASE WHEN Basics",
      summary:
        "Use a searched CASE WHEN expression to label each row, such as sorting orders into small, medium, and large buckets based on their amount.",
      content: `\`CASE\` is SQL's if/else. It checks conditions and returns a value for each row, so you can add a new label column without changing the table.

The most common form is the **searched CASE**: a list of \`WHEN condition THEN value\` branches, an optional \`ELSE\`, and \`END\`.

~~~sql
SELECT
  order_id,
  amount,
  CASE
    WHEN amount < 50 THEN 'small'
    WHEN amount < 200 THEN 'medium'
    ELSE 'large'
  END AS size_band
FROM shop_orders
WHERE amount IS NOT NULL
~~~

Each \`CASE\` expression produces one value per row. Give it an alias with \`AS\` so the result column has a readable name.

The \`WHERE amount IS NOT NULL\` filter keeps the order without an amount out of this first example. The next lesson shows why missing values need special care inside \`CASE\`.`,
      sampleData: SAMPLE_DATA,
      challenge: {
        prompt:
          "For orders that have an amount, return order_id, amount, and size_band: 'small' when amount is below 50, 'medium' when it is below 200, and 'large' otherwise. Order by order_id.",
        hint:
          "CASE WHEN amount < 50 THEN 'small' WHEN amount < 200 THEN 'medium' ELSE 'large' END AS size_band, plus WHERE amount IS NOT NULL.",
        initialSql: "-- Label each order by its amount\nSELECT order_id, amount\nFROM shop_orders\nWHERE amount IS NOT NULL\nORDER BY order_id;\n",
        solutionSql:
          "SELECT\n  order_id,\n  amount,\n  CASE\n    WHEN amount < 50 THEN 'small'\n    WHEN amount < 200 THEN 'medium'\n    ELSE 'large'\n  END AS size_band\nFROM shop_orders\nWHERE amount IS NOT NULL\nORDER BY order_id;",
        validate: (result) => {
          const error = checkLabels(result, "size_band", {
            1: "small",
            2: "medium",
            3: "medium",
            4: "large",
            5: "small",
            6: "medium",
            7: "medium",
            8: "large",
            9: "medium",
          });

          return error
            ? { passed: false, message: error }
            : { passed: true, message: "Correct! CASE WHEN turned each amount into a size band." };
        },
      },
    },
    {
      id: "case-when-else-null",
      title: "ELSE, NULL, and Branch Order",
      summary:
        "Learn why CASE stops at the first matching branch, what happens without ELSE, and why NULL values need an IS NULL check before any comparison.",
      content: `\`CASE\` checks its branches from top to bottom and stops at the **first** one that is true. Order your conditions from most specific to most general.

If no branch matches and there is no \`ELSE\`, the result is \`NULL\`:

~~~sql
SELECT order_id, CASE WHEN amount > 300 THEN 'big' END AS flag
FROM shop_orders
~~~

Missing values are the classic surprise. A comparison with \`NULL\`, such as \`NULL < 100\`, is neither true nor false, so it never matches a \`WHEN\`. The row falls through to \`ELSE\` and gets a label it does not deserve.

Handle missing values explicitly with a first branch that uses \`IS NULL\`:

~~~sql
SELECT
  order_id,
  CASE
    WHEN amount IS NULL THEN 'missing'
    WHEN amount < 100 THEN 'under 100'
    ELSE '100 or more'
  END AS amount_label
FROM shop_orders
~~~

Without that first branch, Jun's order (amount \`NULL\`) would be labelled '100 or more'.`,
      sampleData: SAMPLE_DATA,
      challenge: {
        prompt:
          "For all 10 orders, return order_id and amount_label: 'missing' when amount is NULL, 'under 100' when amount is below 100, and '100 or more' otherwise. Order by order_id.",
        hint: "Put WHEN amount IS NULL THEN 'missing' first, before the comparison branches.",
        initialSql: "-- Label amounts, including missing ones\nSELECT order_id\nFROM shop_orders\nORDER BY order_id;\n",
        solutionSql:
          "SELECT\n  order_id,\n  CASE\n    WHEN amount IS NULL THEN 'missing'\n    WHEN amount < 100 THEN 'under 100'\n    ELSE '100 or more'\n  END AS amount_label\nFROM shop_orders\nORDER BY order_id;",
        validate: (result) => {
          const error = checkLabels(result, "amount_label", {
            1: "under 100",
            2: "100 or more",
            3: "under 100",
            4: "100 or more",
            5: "under 100",
            6: "100 or more",
            7: "under 100",
            8: "100 or more",
            9: "under 100",
            10: "missing",
          });

          if (error?.startsWith("Order 10 ")) {
            return {
              passed: false,
              message: "Order 10 has a NULL amount and should be 'missing'. Check IS NULL in the first branch.",
            };
          }

          return error
            ? { passed: false, message: error }
            : { passed: true, message: "Exactly right. Checking IS NULL first keeps missing amounts out of the other buckets." };
        },
      },
    },
    {
      id: "case-when-simple",
      title: "Simple CASE for Value Mapping",
      summary:
        "Map codes to readable labels with the simple CASE form, CASE column WHEN value THEN label, such as grouping order statuses into open and closed.",
      content: `When every branch compares the **same column** to a fixed value, the **simple CASE** form is shorter:

~~~sql
SELECT
  order_id,
  status,
  CASE status
    WHEN 'shipped' THEN 'complete'
    WHEN 'pending' THEN 'open'
    ELSE 'closed'
  END AS status_group
FROM shop_orders
~~~

\`CASE status WHEN 'shipped'\` means the same as \`CASE WHEN status = 'shipped'\`. Use the simple form for lookups like status codes, country codes, or yes/no flags.

Two limits to remember:

• The simple form can only test equality. For ranges such as \`amount < 100\`, use the searched form.
• \`CASE status WHEN NULL\` never matches, because \`NULL = NULL\` is not true. Use \`WHEN status IS NULL\` in a searched CASE instead.`,
      sampleData: SAMPLE_DATA,
      challenge: {
        prompt:
          "Return order_id, status, and status_group: 'complete' for shipped orders, 'open' for pending orders, and 'closed' for everything else. Order by order_id.",
        hint: "CASE status WHEN 'shipped' THEN 'complete' WHEN 'pending' THEN 'open' ELSE 'closed' END AS status_group",
        initialSql: "-- Map each status to a status_group\nSELECT order_id, status\nFROM shop_orders\nORDER BY order_id;\n",
        solutionSql:
          "SELECT\n  order_id,\n  status,\n  CASE status\n    WHEN 'shipped' THEN 'complete'\n    WHEN 'pending' THEN 'open'\n    ELSE 'closed'\n  END AS status_group\nFROM shop_orders\nORDER BY order_id;",
        validate: (result) => {
          const error = checkLabels(result, "status_group", {
            1: "complete",
            2: "complete",
            3: "open",
            4: "closed",
            5: "complete",
            6: "open",
            7: "complete",
            8: "complete",
            9: "closed",
            10: "open",
          });

          return error
            ? { passed: false, message: error }
            : { passed: true, message: "Nice! The simple CASE mapped every status to a group." };
        },
      },
    },
    {
      id: "case-when-conditional-aggregation",
      title: "Conditional Aggregation",
      summary:
        "Put CASE inside COUNT and SUM to aggregate only matching rows, building pivot-style reports such as shipped orders and revenue per country.",
      content: `\`CASE\` becomes even more useful inside aggregate functions. Instead of filtering the whole query with \`WHERE\`, you can count or sum only the rows that match a condition, while keeping every group.

~~~sql
SELECT
  country,
  COUNT(*) AS all_orders,
  COUNT(CASE WHEN status = 'shipped' THEN 1 END) AS shipped_orders,
  SUM(CASE WHEN status = 'shipped' THEN amount ELSE 0 END) AS shipped_amount
FROM shop_orders
GROUP BY country
~~~

How it works:

• \`COUNT(CASE WHEN ... THEN 1 END)\` counts only matching rows, because \`COUNT\` ignores the \`NULL\` produced for non-matching rows.
• \`SUM(CASE WHEN ... THEN amount ELSE 0 END)\` adds the amount for matching rows and \`0\` for the rest.

This pattern is often called **conditional aggregation**. It turns rows into side-by-side columns, like a small pivot table.

DuckDB also supports the standard \`FILTER\` clause, which reads nicely for the same idea:

~~~sql
SELECT country, COUNT(*) FILTER (WHERE status = 'shipped') AS shipped_orders
FROM shop_orders
GROUP BY country
~~~`,
      sampleData: SAMPLE_DATA,
      challenge: {
        prompt:
          "For each country, return country, shipped_orders (the number of shipped orders), and shipped_amount (the total amount of shipped orders). Order by country.",
        hint:
          "COUNT(CASE WHEN status = 'shipped' THEN 1 END) and SUM(CASE WHEN status = 'shipped' THEN amount ELSE 0 END), grouped by country.",
        initialSql: "-- Count and sum shipped orders per country\nSELECT country\nFROM shop_orders\nGROUP BY country\nORDER BY country;\n",
        solutionSql:
          "SELECT\n  country,\n  COUNT(CASE WHEN status = 'shipped' THEN 1 END) AS shipped_orders,\n  SUM(CASE WHEN status = 'shipped' THEN amount ELSE 0 END) AS shipped_amount\nFROM shop_orders\nGROUP BY country\nORDER BY country;",
        validate: (result) => {
          if (result.rowCount !== 3) {
            return { passed: false, message: `Expected 3 countries but got ${result.rowCount}.` };
          }

          if (!hasColumns(result, ["country", "shipped_orders", "shipped_amount"])) {
            return { passed: false, message: "Return country, shipped_orders, and shipped_amount." };
          }

          const expected: Array<[string, number, number]> = [
            ["DE", 2, 192.99],
            ["FR", 1, 99.99],
            ["US", 2, 555],
          ];

          for (let index = 0; index < expected.length; index += 1) {
            const row = result.data[index];
            const [country, orders, amount] = expected[index];

            if (String(getValue(row, "country")) !== country) {
              return { passed: false, message: "Order the result by country." };
            }

            if (Number(getValue(row, "shipped_orders")) !== orders) {
              return { passed: false, message: `${country} should have ${orders} shipped order(s).` };
            }

            if (Math.abs(Number(getValue(row, "shipped_amount")) - amount) > 0.01) {
              return { passed: false, message: `${country}'s shipped_amount should be ${amount}.` };
            }
          }

          return {
            passed: true,
            message: "Great work! Conditional aggregation counted and summed only the shipped orders in each country.",
          };
        },
      },
    },
  ],
};

export default caseWhen;
