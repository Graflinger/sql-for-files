import type { Chapter } from "../../types/learn";
import { formatArrowValueForDisplay } from "../../utils/arrowDisplay";

const ORDERS_SETUP = [
  `CREATE OR REPLACE TABLE orders (
    customer VARCHAR,
    items VARCHAR[],
    prices DECIMAL(8,2)[]
  )`,
  `INSERT INTO orders VALUES
    ('Alice', ['Widget', 'Gadget'], [9.99, 24.99]),
    ('Bob', ['Gizmo', 'Widget', 'Doohickey'], [14.99, 9.99, 4.99]),
    ('Carol', ['Gadget'], [24.99]),
    ('Dave', ['Sticker'], [4.99])`,
];

function getValue(row: Record<string, unknown>, column: string): unknown {
  const matchingKey = Object.keys(row).find((key) => key.toLowerCase() === column.toLowerCase());
  return matchingKey ? row[matchingKey] : undefined;
}

/**
 * Convert a list cell into numbers. DuckDB-WASM returns list columns as Arrow
 * vectors (not JS arrays), and DECIMAL elements need their scale applied.
 */
function listNumbers(value: unknown): number[] {
  if (Array.isArray(value)) {
    return value.map(Number);
  }

  if (value && typeof value === "object" && Symbol.iterator in value) {
    const vector = value as Iterable<unknown> & { type?: unknown };
    return Array.from(vector, (item) => Number(formatArrowValueForDisplay(item, vector.type)));
  }

  return [];
}

const arrayLambdas: Chapter = {
  id: "array-lambdas",
  title: "Array Lambdas",
  description:
    "Transform, filter, and reduce DuckDB list columns with lambda functions such as list_transform, list_filter, and list_reduce.",
  guideSlug: "duckdb-array-lambda-functions-transform-filter-reduce",
  lessons: [
    {
      id: "array-lambdas-transform",
      title: "Transforming Lists with list_transform",
      summary:
        "Apply a lambda to every element of a DuckDB list with list_transform, such as doubling each price in an order's price list.",
      content: `\`list_transform\` applies a function to every element of a list and returns a new list with the results. Think of it like a map operation.

The syntax uses a \`lambda\` expression:

\`\`\`sql
SELECT list_transform([1, 2, 3], lambda x : x * 10)
-- [10, 20, 30]
\`\`\`

Lambda expressions start with the keyword \`lambda\`, followed by a parameter name, a colon, and the expression to evaluate.

You can use this on table columns too. For example, adding 10% tax to every price in a list:

\`\`\`sql
SELECT customer, list_transform(prices, lambda p : round(p * 1.1, 2)) AS taxed
FROM orders
\`\`\`

\`NULL\` elements stay \`NULL\` after transformation. The return type of the new list is determined by the lambda expression.

The sample table stores \`items\` and \`prices\` as parallel lists. That means the first item belongs with the first price, the second item belongs with the second price, and so on. This is compact, but position-dependent data can be fragile if the lists get out of sync.`,
      sampleData: {
        label: "orders table (4 rows with item and price lists)",
        setupSql: ORDERS_SETUP,
        tableNames: ["orders"],
      },
      challenge: {
        prompt:
          "Use list_transform to double every price in the prices column. Return customer and the transformed list as doubled_prices, ordered by customer.",
        hint:
          "list_transform(prices, lambda p : p * 2)",
        initialSql: "-- Double every price in the list\n",
        solutionSql:
          "SELECT customer, list_transform(prices, lambda p : p * 2) AS doubled_prices\nFROM orders\nORDER BY customer;",
        validate: (result) => {
          if (result.rowCount !== 4) {
            return {
              passed: false,
              message: `Expected 4 rows but got ${result.rowCount}.`,
            };
          }

          const aliceRow = result.data.find((row) => String(getValue(row, "customer")) === "Alice");

          if (!aliceRow) {
            return {
              passed: false,
              message: "Could not find Alice in the result. Make sure to return the customer column.",
            };
          }

          const doubled = getValue(aliceRow, "doubled_prices");
          const values = listNumbers(doubled);

          if (values.length !== 2 || Math.abs(values[0] - 19.98) > 0.01 || Math.abs(values[1] - 49.98) > 0.01) {
            return {
              passed: false,
              message: "Alice's doubled prices should be [19.98, 49.98].",
            };
          }

          return {
            passed: true,
            message: "Correct! list_transform applied the lambda to every element in the list.",
          };
        },
      },
    },
    {
      id: "array-lambdas-filter",
      title: "Filtering Lists with list_filter",
      summary:
        "Keep only the list elements that match a condition with list_filter and a lambda, such as the prices above 10 in each order.",
      content: `\`list_filter\` keeps only the elements that satisfy a condition and returns a shorter list.

\`\`\`sql
SELECT list_filter([10, 3, 25, 8], lambda x : x > 9)
-- [10, 25]
\`\`\`

The \`lambda\` must return a boolean. Elements where it returns true are kept; the rest are dropped.

On a table column:

\`\`\`sql
SELECT customer, list_filter(prices, lambda p : p > 10) AS expensive
FROM orders
\`\`\`

If no elements match, the result is an empty list \`[]\`. This is useful for narrowing down list data before further processing.`,
      sampleData: {
        label: "orders table (4 rows with item and price lists)",
        setupSql: ORDERS_SETUP,
        tableNames: ["orders"],
      },
      challenge: {
        prompt:
          "Use list_filter to keep only prices greater than 10. Return customer and the filtered list as high_prices, ordered by customer.",
        hint:
          "list_filter(prices, lambda p : p > 10)",
        initialSql: "-- Keep only prices above 10\n",
        solutionSql:
          "SELECT customer, list_filter(prices, lambda p : p > 10) AS high_prices\nFROM orders\nORDER BY customer;",
        validate: (result) => {
          if (result.rowCount !== 4) {
            return {
              passed: false,
              message: `Expected 4 rows but got ${result.rowCount}.`,
            };
          }

          const bobRow = result.data.find((row) => String(getValue(row, "customer")) === "Bob");

          if (!bobRow) {
            return {
              passed: false,
              message: "Could not find Bob in the result.",
            };
          }

          const filtered = getValue(bobRow, "high_prices");
          const values = listNumbers(filtered);

          if (values.length !== 1 || Math.abs(values[0] - 14.99) > 0.01) {
            return {
              passed: false,
              message: "Bob's high_prices should be [14.99] — only the Gizmo is above 10.",
            };
          }

          return {
            passed: true,
            message: "Correct! list_filter kept only the elements matching the condition.",
          };
        },
      },
    },
    {
      id: "array-lambdas-reduce",
      title: "Reducing a List with list_reduce",
      summary:
        "Fold a DuckDB list into a single value with list_reduce, sum each order's prices, and learn why empty lists need a starting value.",
      content: `\`list_reduce\` collapses a list into a single value by applying a two-argument \`lambda\` across all elements, one at a time.

\`\`\`sql
SELECT list_reduce([1, 2, 3, 4], lambda acc, x : acc + x)
-- 10
\`\`\`

The first parameter (acc) is the running accumulator and the second (x) is the current element. The result of each step becomes the accumulator for the next.

This is perfect for summing a list column:

\`\`\`sql
SELECT customer, list_reduce(prices, lambda a, b : a + b) AS order_total
FROM orders
\`\`\`

If the list has exactly one element, that element is the result without calling the lambda. A \`NULL\` list returns \`NULL\`.

An empty list is different: DuckDB raises an error ("Cannot perform list_reduce on an empty input list") unless you pass a starting value as an optional third argument:

\`\`\`sql
SELECT list_reduce([], lambda acc, x : acc + x, 0)
-- 0
\`\`\`

The next lesson uses that starting value when a filter can leave a list empty.`,
      sampleData: {
        label: "orders table (4 rows with item and price lists)",
        setupSql: ORDERS_SETUP,
        tableNames: ["orders"],
      },
      challenge: {
        prompt:
          "Use list_reduce to compute the total price per order. Return customer and the sum as order_total, ordered by customer.",
        hint:
          "list_reduce(prices, lambda a, b : a + b)",
        initialSql: "-- Sum all prices in each order\n",
        solutionSql:
          "SELECT customer, list_reduce(prices, lambda a, b : a + b) AS order_total\nFROM orders\nORDER BY customer;",
        validate: (result) => {
          if (result.rowCount !== 4) {
            return {
              passed: false,
              message: `Expected 4 rows but got ${result.rowCount}.`,
            };
          }

          const expected: Array<[string, number]> = [
            ["Alice", 34.98],
            ["Bob", 29.97],
            ["Carol", 24.99],
            ["Dave", 4.99],
          ];

          for (let index = 0; index < expected.length; index += 1) {
            const row = result.data[index];
            const [expectedCustomer, expectedTotal] = expected[index];
            const customer = String(getValue(row, "customer"));
            const orderTotal = Number(getValue(row, "order_total"));

            if (customer !== expectedCustomer || Math.abs(orderTotal - expectedTotal) > 0.01) {
              return {
                passed: false,
                message: `${expectedCustomer}'s order total should be ${expectedTotal}.`,
              };
            }
          }

          return {
            passed: true,
            message: "Perfect! list_reduce folded each price list into a single total.",
          };
        },
      },
    },
    {
      id: "array-lambdas-combining",
      title: "Combining Lambda Functions",
      summary:
        "Nest list_filter inside list_reduce to build an inline list pipeline, summing only prices above 10 with a starting value of 0.",
      content: `Lambda functions can be nested. You can filter a list first, then transform or reduce the result.

For example, to sum only the prices above 10:

\`\`\`sql
SELECT customer,
       list_reduce(
         list_filter(prices, lambda p : p > 10),
         lambda a, b : a + b,
         0
       ) AS expensive_total
FROM orders
\`\`\`

The inner \`list_filter\` keeps prices above 10, then \`list_reduce\` sums the survivors. Some customers have no price above 10, so their filtered list is empty. The third argument, \`0\`, is the starting value: it makes an empty list reduce to \`0\` instead of raising an error.

You can also transform first and filter second:

\`\`\`sql
SELECT list_filter(
         list_transform([1, 2, 3, 4, 5], lambda x : x * x),
         lambda sq : sq > 10
       )
-- [16, 25]
\`\`\`

Nesting gives you a mini data pipeline inside a single \`SELECT\` expression.`,
      sampleData: {
        label: "orders table (4 rows with item and price lists)",
        setupSql: ORDERS_SETUP,
        tableNames: ["orders"],
      },
      challenge: {
        prompt:
          "Combine list_filter and list_reduce: for each customer, sum only the prices that are above 10. Return customer and the total as expensive_total, ordered by customer. Pass 0 as the starting value so customers without qualifying prices get 0.",
        hint:
          "list_reduce(list_filter(prices, lambda p : p > 10), lambda a, b : a + b, 0)",
        initialSql: "-- Sum only the expensive items per customer\n",
        solutionSql:
          "SELECT customer,\n  list_reduce(\n    list_filter(prices, lambda p : p > 10),\n    lambda a, b : a + b,\n    0\n  ) AS expensive_total\nFROM orders\nORDER BY customer;",
        validate: (result) => {
          if (result.rowCount !== 4) {
            return {
              passed: false,
              message: `Expected 4 rows but got ${result.rowCount}.`,
            };
          }

          const expected: Array<[string, number]> = [
            ["Alice", 24.99],
            ["Bob", 14.99],
            ["Carol", 24.99],
            ["Dave", 0],
          ];

          for (let index = 0; index < expected.length; index += 1) {
            const row = result.data[index];
            const [expectedCustomer, expectedTotal] = expected[index];
            const customer = String(getValue(row, "customer"));
            const total = Number(getValue(row, "expensive_total"));

            if (customer !== expectedCustomer || Math.abs(total - expectedTotal) > 0.01) {
              return {
                passed: false,
                message: `${expectedCustomer}'s expensive_total should be ${expectedTotal}.`,
              };
            }
          }

          return {
            passed: true,
            message: "Excellent! You combined list_filter and list_reduce into a powerful inline pipeline.",
          };
        },
      },
    },
  ],
};

export default arrayLambdas;
