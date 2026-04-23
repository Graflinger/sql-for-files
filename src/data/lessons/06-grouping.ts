import type { Chapter } from "../../types/learn";

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

const grouping: Chapter = {
  id: "grouping",
  title: "DISTINCT and GROUP BY",
  lessons: [
    {
      id: "grouping-distinct",
      title: "Removing Duplicates with DISTINCT",
      content: `DISTINCT removes duplicate rows from a result set.

If you only want the unique regions in the sales table, you can write:

  SELECT DISTINCT region
  FROM sales

DISTINCT works on the full combination of selected columns. That means:

  SELECT DISTINCT salesperson, region
  FROM sales

returns unique salesperson-region pairs, not just unique salespeople.

Use DISTINCT when you want a clean list of unique values.`,
      sampleData: {
        label: "sales table (8 rows)",
        setupSql: SALES_SETUP,
        tableNames: ["sales"],
      },
      challenge: {
        prompt: "Return the unique regions from the sales table, ordered alphabetically.",
        hint: "SELECT DISTINCT region FROM sales ORDER BY region",
        initialSql: "-- Show each region once\n",
        solutionSql: "SELECT DISTINCT region\nFROM sales\nORDER BY region;",
        validate: (result) => {
          if (result.rowCount !== 4) {
            return {
              passed: false,
              message: `Expected 4 unique regions but got ${result.rowCount}.`,
            };
          }

          const regions = result.data.map((row) => String(getValue(row, "region")));
          const expectedRegions = ["East", "North", "South", "West"];

          const allMatch = regions.length === expectedRegions.length
            && regions.every((region, index) => region === expectedRegions[index]);

          if (!allMatch) {
            return {
              passed: false,
              message: "The result should be East, North, South, and West in alphabetical order.",
            };
          }

          return {
            passed: true,
            message: "Correct! DISTINCT removed the repeated region values.",
          };
        },
      },
    },
    {
      id: "grouping-group-by",
      title: "Summarizing with GROUP BY",
      content: `GROUP BY collects rows into groups before applying aggregate functions.

For example, to total sales by region:

  SELECT region, SUM(amount) AS total_amount
  FROM sales
  GROUP BY region

Now SUM(amount) runs once per region instead of once for the whole table.

Remember this rule: when you use GROUP BY, every selected column must either be grouped or aggregated.`,
      sampleData: {
        label: "sales table (8 rows)",
        setupSql: SALES_SETUP,
        tableNames: ["sales"],
      },
      challenge: {
        prompt:
          "Show total sales by region. Return region and total_amount, ordered by total_amount descending.",
        hint:
          "SELECT region, SUM(amount) AS total_amount FROM sales GROUP BY region ORDER BY total_amount DESC",
        initialSql: "-- Group sales by region\n",
        solutionSql:
          "SELECT region, SUM(amount) AS total_amount\nFROM sales\nGROUP BY region\nORDER BY total_amount DESC;",
        validate: (result) => {
          if (result.rowCount !== 4) {
            return {
              passed: false,
              message: `Expected 4 grouped rows but got ${result.rowCount}.`,
            };
          }

          const expected: Array<[string, number]> = [
            ["West", 3340],
            ["East", 2870],
            ["North", 760],
            ["South", 430],
          ];

          for (let index = 0; index < expected.length; index += 1) {
            const row = result.data[index];
            const [expectedRegion, expectedAmount] = expected[index];
            const region = String(getValue(row, "region"));
            const totalAmount = Number(getValue(row, "total_amount"));

            if (region !== expectedRegion || Math.abs(totalAmount - expectedAmount) > 0.01) {
              return {
                passed: false,
                message: "Check both your grouped totals and the DESC ordering.",
              };
            }
          }

          return {
            passed: true,
            message: "Great! GROUP BY created one summary row per region.",
          };
        },
      },
    },
    {
      id: "grouping-having",
      title: "Filtering Groups with HAVING",
      content: `WHERE filters individual rows before grouping. HAVING filters the groups after aggregation.

For example, to find salespeople with more than one sale:

  SELECT salesperson, COUNT(*) AS sale_count
  FROM sales
  GROUP BY salesperson
  HAVING COUNT(*) > 1

This is useful when you want to keep only groups that meet an aggregate condition.`,
      sampleData: {
        label: "sales table (8 rows)",
        setupSql: SALES_SETUP,
        tableNames: ["sales"],
      },
      challenge: {
        prompt:
          "Find salespeople with more than one sale. Return salesperson and sale_count, ordered by salesperson.",
        hint:
          "GROUP BY salesperson, then use HAVING COUNT(*) > 1.",
        initialSql: "-- Filter grouped results with HAVING\n",
        solutionSql:
          "SELECT salesperson, COUNT(*) AS sale_count\nFROM sales\nGROUP BY salesperson\nHAVING COUNT(*) > 1\nORDER BY salesperson;",
        validate: (result) => {
          if (result.rowCount !== 2) {
            return {
              passed: false,
              message: `Expected 2 salespeople with more than one sale but got ${result.rowCount}.`,
            };
          }

          const expected: Array<[string, number]> = [
            ["Alice", 2],
            ["Bob", 2],
          ];

          for (let index = 0; index < expected.length; index += 1) {
            const row = result.data[index];
            const [expectedSalesperson, expectedCount] = expected[index];
            const salesperson = String(getValue(row, "salesperson"));
            const saleCount = Number(getValue(row, "sale_count"));

            if (salesperson !== expectedSalesperson || saleCount !== expectedCount) {
              return {
                passed: false,
                message: "The grouped result should contain Alice and Bob with a sale_count of 2.",
              };
            }
          }

          return {
            passed: true,
            message: "Exactly right. HAVING filtered the grouped result after COUNT(*).",
          };
        },
      },
    },
  ],
};

export default grouping;
