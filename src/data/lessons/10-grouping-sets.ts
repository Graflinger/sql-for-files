import type { Chapter } from "../../types/learn";

const REVENUE_SETUP = [
  `CREATE OR REPLACE TABLE revenue (
    region VARCHAR,
    product VARCHAR,
    amount INTEGER
  )`,
  `INSERT INTO revenue VALUES
    ('East', 'Widget', 100),
    ('East', 'Gadget', 200),
    ('West', 'Widget', 150),
    ('West', 'Gadget', 250)`,
];

function getValue(row: Record<string, unknown>, column: string): unknown {
  const matchingKey = Object.keys(row).find((key) => key.toLowerCase() === column.toLowerCase());
  return matchingKey ? row[matchingKey] : undefined;
}

function normalizedGroup(row: Record<string, unknown>): string {
  const region = getValue(row, "region") ?? "__NULL__";
  const product = getValue(row, "product") ?? "__NULL__";
  const totalAmount = Number(getValue(row, "total_amount"));

  return `${String(region)}|${String(product)}|${totalAmount}`;
}

function hasExpectedGroups(
  resultRows: Record<string, unknown>[],
  expectedGroups: string[]
): boolean {
  const actualGroups = new Set(resultRows.map(normalizedGroup));

  return (
    actualGroups.size === expectedGroups.length &&
    expectedGroups.every((group) => actualGroups.has(group))
  );
}

const groupingSets: Chapter = {
  id: "grouping-sets",
  title: "GROUPING SETS, ROLLUP, and CUBE",
  lessons: [
    {
      id: "grouping-sets-basics",
      title: "Multi-Dimension Aggregates with GROUPING SETS",
      content: `Sometimes you need aggregates along several dimensions in one result. \`GROUPING SETS\` lets you specify exactly which groups to compute.

For example, totals by region, by product, and an overall grand total:

\`\`\`sql
SELECT region, product, SUM(amount) AS total_amount
FROM revenue
GROUP BY GROUPING SETS ((region), (product), ())
\`\`\`

Each grouping set is a parenthesised list of columns. The empty set \`()\` means "aggregate everything with no grouping" — the grand total row.

Columns not part of a particular grouping set appear as \`NULL\` in the result. So the \`(region)\` set shows \`NULL\` in the product column, and the \`()\` set shows \`NULL\` in both.

That can be ambiguous if your original data also contains real \`NULL\` values. DuckDB supports \`GROUPING(column)\` when you need to tell whether a \`NULL\` came from a subtotal row or from the data itself.

Without \`GROUPING SETS\` you would need a separate query and \`UNION ALL\` for each combination. \`GROUPING SETS\` produces the same output in a single scan of the table.`,
      sampleData: {
        label: "revenue table (4 rows)",
        setupSql: REVENUE_SETUP,
        tableNames: ["revenue"],
      },
      challenge: {
        prompt:
          "Use GROUPING SETS to compute SUM(amount) grouped by (region), (product), and the grand total (). Return region, product, and total_amount, ordered by region NULLS LAST, product NULLS LAST.",
        hint:
          "GROUP BY GROUPING SETS ((region), (product), ()) — remember to alias SUM(amount) as total_amount.",
        initialSql: "-- Aggregate by region, by product, and overall\n",
        solutionSql:
          "SELECT region, product, SUM(amount) AS total_amount\nFROM revenue\nGROUP BY GROUPING SETS ((region), (product), ())\nORDER BY region NULLS LAST, product NULLS LAST;",
        validate: (result) => {
          if (result.rowCount !== 5) {
            return {
              passed: false,
              message: `Expected 5 rows (2 region groups + 2 product groups + 1 grand total) but got ${result.rowCount}.`,
            };
          }

          const expectedGroups = [
            "East|__NULL__|300",
            "West|__NULL__|400",
            "__NULL__|Gadget|450",
            "__NULL__|Widget|250",
            "__NULL__|__NULL__|700",
          ];

          if (!hasExpectedGroups(result.data, expectedGroups)) {
            return {
              passed: false,
              message: "Check that you produced the region totals, product totals, and grand total exactly.",
            };
          }

          return {
            passed: true,
            message: "Correct! GROUPING SETS produced region totals, product totals, and a grand total in one query.",
          };
        },
      },
    },
    {
      id: "grouping-sets-rollup",
      title: "ROLLUP for Hierarchical Totals",
      content: `\`ROLLUP\` is a shorthand that creates progressively less detailed grouping sets, perfect for subtotals and a grand total.

\`\`\`sql
SELECT region, product, SUM(amount) AS total_amount
FROM revenue
GROUP BY ROLLUP (region, product)
\`\`\`

\`ROLLUP(region, product)\` expands to three grouping sets:

  (region, product)   — detail level
  (region)            — subtotal per region
  ()                  — grand total

In general, \`ROLLUP\` with n columns produces n+1 grouping sets, peeling one column off the right at each level. This mirrors how you build hierarchical reports: detail rows, then group subtotals, then a grand total.

The display order is not guaranteed by \`ROLLUP\` itself. Use \`ORDER BY\` to put subtotal and grand total rows where you want them.`,
      sampleData: {
        label: "revenue table (4 rows)",
        setupSql: REVENUE_SETUP,
        tableNames: ["revenue"],
      },
      challenge: {
        prompt:
          "Use ROLLUP(region, product) to compute SUM(amount) with detail rows, region subtotals, and a grand total. Return region, product, and total_amount, ordered by region NULLS LAST, product NULLS LAST.",
        hint:
          "GROUP BY ROLLUP (region, product) — this gives (region, product), (region), and () grouping sets.",
        initialSql: "-- Hierarchical totals with ROLLUP\n",
        solutionSql:
          "SELECT region, product, SUM(amount) AS total_amount\nFROM revenue\nGROUP BY ROLLUP (region, product)\nORDER BY region NULLS LAST, product NULLS LAST;",
        validate: (result) => {
          if (result.rowCount !== 7) {
            return {
              passed: false,
              message: `Expected 7 rows (4 detail + 2 region subtotals + 1 grand total) but got ${result.rowCount}.`,
            };
          }

          const expectedGroups = [
            "East|Gadget|200",
            "East|Widget|100",
            "East|__NULL__|300",
            "West|Gadget|250",
            "West|Widget|150",
            "West|__NULL__|400",
            "__NULL__|__NULL__|700",
          ];

          if (!hasExpectedGroups(result.data, expectedGroups)) {
            return {
              passed: false,
              message: "Check that ROLLUP produced detail rows, region subtotals, and the grand total exactly.",
            };
          }

          const thirdRow = result.data[2];
          const eastSubtotal = Number(getValue(thirdRow, "total_amount"));
          const eastRegion = getValue(thirdRow, "region");
          const eastProduct = getValue(thirdRow, "product");

          if (eastRegion !== "East" || eastProduct !== null || Math.abs(eastSubtotal - 300) > 0.01) {
            return {
              passed: false,
              message: "The East subtotal row should have region = East, product = NULL, and total_amount = 300.",
            };
          }

          return {
            passed: true,
            message: "Well done! ROLLUP produced detail rows, region subtotals, and a grand total in one pass.",
          };
        },
      },
    },
    {
      id: "grouping-sets-cube",
      title: "CUBE for All Combinations",
      content: `\`CUBE\` goes further than \`ROLLUP\`: it produces every possible combination of the listed columns.

\`\`\`sql
SELECT region, product, SUM(amount) AS total_amount
FROM revenue
GROUP BY CUBE (region, product)
\`\`\`

\`CUBE(region, product)\` expands to four grouping sets:

  (region, product)   — detail level
  (region)            — per region
  (product)           — per product
  ()                  — grand total

With n columns, \`CUBE\` produces 2^n grouping sets. That makes it ideal for full cross-tabulation reports where you want totals along every dimension.

\`CUBE\` is equivalent to writing out a \`GROUPING SETS\` clause that lists every subset of the columns. The result is the same, but \`CUBE\` is more concise.`,
      sampleData: {
        label: "revenue table (4 rows)",
        setupSql: REVENUE_SETUP,
        tableNames: ["revenue"],
      },
      challenge: {
        prompt:
          "Use CUBE(region, product) to compute SUM(amount) for every combination of region and product. Return region, product, and total_amount, ordered by region NULLS LAST, product NULLS LAST.",
        hint:
          "GROUP BY CUBE (region, product) — this produces 2^2 = 4 grouping sets.",
        initialSql: "-- All dimension combinations with CUBE\n",
        solutionSql:
          "SELECT region, product, SUM(amount) AS total_amount\nFROM revenue\nGROUP BY CUBE (region, product)\nORDER BY region NULLS LAST, product NULLS LAST;",
        validate: (result) => {
          if (result.rowCount !== 9) {
            return {
              passed: false,
              message: `Expected 9 rows (4 detail + 2 region + 2 product + 1 grand total) but got ${result.rowCount}.`,
            };
          }

          const expectedGroups = [
            "East|Gadget|200",
            "East|Widget|100",
            "East|__NULL__|300",
            "West|Gadget|250",
            "West|Widget|150",
            "West|__NULL__|400",
            "__NULL__|Gadget|450",
            "__NULL__|Widget|250",
            "__NULL__|__NULL__|700",
          ];

          if (!hasExpectedGroups(result.data, expectedGroups)) {
            return {
              passed: false,
              message: "Check that CUBE produced detail rows, region totals, product totals, and the grand total exactly.",
            };
          }

          return {
            passed: true,
            message: "Perfect! CUBE gave you every combination — detail, per-region, per-product, and the grand total.",
          };
        },
      },
    },
  ],
};

export default groupingSets;
