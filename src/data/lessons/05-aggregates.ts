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

const aggregates: Chapter = {
  id: "aggregates",
  title: "Simple Aggregates",
  lessons: [
    {
      id: "aggregates-count",
      title: "COUNT Rows",
      content: `COUNT tells you how many rows match a condition. It is one of the fastest ways to answer questions like “How many sales did we make?” or “How many orders came from the West region?”

The most common form is COUNT(*):

  SELECT COUNT(*) AS sale_count
  FROM sales

You can also add a WHERE clause to count only part of a table.

  SELECT COUNT(*) AS sale_count
  FROM sales
  WHERE region = 'East'

COUNT is often the first aggregate people learn because it turns many rows into one simple summary value.`,
      sampleData: {
        label: "sales table (8 rows)",
        setupSql: SALES_SETUP,
        tableNames: ["sales"],
      },
      challenge: {
        prompt: "Return the number of East region sales as sale_count.",
        hint: "Use COUNT(*) with WHERE region = 'East'.",
        initialSql: "-- Count East region sales\n",
        solutionSql: "SELECT COUNT(*) AS sale_count\nFROM sales\nWHERE region = 'East';",
        validate: (result) => {
          if (result.rowCount !== 1) {
            return {
              passed: false,
              message: "A COUNT query like this should return one summary row.",
            };
          }

          const saleCount = Number(getValue(result.data[0], "sale_count"));

          if (Number.isNaN(saleCount)) {
            return {
              passed: false,
              message: "Alias the result as sale_count.",
            };
          }

          if (saleCount !== 3) {
            return {
              passed: false,
              message: "There are 3 East region sales in the sample data.",
            };
          }

          return {
            passed: true,
            message: "Correct! COUNT(*) summarized the East rows into one number.",
          };
        },
      },
    },
    {
      id: "aggregates-sum",
      title: "SUM Values",
      content: `SUM adds the values in a numeric column. It is useful for totals like revenue, quantity, or cost.

For example:

  SELECT SUM(amount) AS total_amount
  FROM sales

You can combine SUM with WHERE to total only the rows you care about:

  SELECT SUM(amount) AS total_amount
  FROM sales
  WHERE region = 'West'

SUM answers questions like “What was our total revenue?” or “How much did the West region sell?”`,
      sampleData: {
        label: "sales table (8 rows)",
        setupSql: SALES_SETUP,
        tableNames: ["sales"],
      },
      challenge: {
        prompt: "Return the total sales amount for the West region as total_amount.",
        hint: "Use SUM(amount) with WHERE region = 'West'.",
        initialSql: "-- Sum West region sales\n",
        solutionSql: "SELECT SUM(amount) AS total_amount\nFROM sales\nWHERE region = 'West';",
        validate: (result) => {
          if (result.rowCount !== 1) {
            return {
              passed: false,
              message: "A SUM query like this should return one summary row.",
            };
          }

          const totalAmount = Number(getValue(result.data[0], "total_amount"));

          if (Number.isNaN(totalAmount)) {
            return {
              passed: false,
              message: "Alias the result as total_amount.",
            };
          }

          if (Math.abs(totalAmount - 3340) > 0.01) {
            return {
              passed: false,
              message: "West region sales add up to 3340.",
            };
          }

          return {
            passed: true,
            message: "Correct! SUM(amount) gave the West region total.",
          };
        },
      },
    },
    {
      id: "aggregates-count-and-sum",
      title: "COUNT and SUM Together",
      content: `Once you understand single aggregates, the next step is combining them. SQL lets you calculate several summaries in the same query.

For example:

  SELECT COUNT(*) AS order_count, SUM(amount) AS total_amount
  FROM sales
  WHERE region = 'West'

This is very common in reporting and dashboards because one query can return multiple useful summary values at once.`,
      sampleData: {
        label: "sales table (8 rows)",
        setupSql: SALES_SETUP,
        tableNames: ["sales"],
      },
      challenge: {
        prompt:
          "For the West region, return the number of sales as order_count and the total amount as total_amount.",
        hint:
          "Use COUNT(*) AS order_count and SUM(amount) AS total_amount with WHERE region = 'West'.",
        initialSql: "-- Count and sum West region sales\n",
        solutionSql:
          "SELECT COUNT(*) AS order_count, SUM(amount) AS total_amount\nFROM sales\nWHERE region = 'West';",
        validate: (result) => {
          if (result.rowCount !== 1) {
            return {
              passed: false,
              message: "Aggregate queries like this should return one summary row.",
            };
          }

          const row = result.data[0];
          const orderCount = Number(getValue(row, "order_count"));
          const totalAmount = Number(getValue(row, "total_amount"));

          if (Number.isNaN(orderCount) || Number.isNaN(totalAmount)) {
            return {
              passed: false,
              message: "Return your results with the aliases order_count and total_amount.",
            };
          }

          if (orderCount !== 3 || Math.abs(totalAmount - 3340) > 0.01) {
            return {
              passed: false,
              message: "West should have 3 sales totaling 3340.",
            };
          }

          return {
            passed: true,
            message: "Correct! COUNT and SUM condensed three West sales into one summary row.",
          };
        },
      },
    },
    {
      id: "aggregates-min",
      title: "MIN Finds the Smallest Value",
      content: `MIN returns the smallest value in a column.

  SELECT MIN(amount) AS smallest_sale
  FROM sales

This is useful when you want to know the lowest price, earliest date, or smallest score in a dataset.`,
      sampleData: {
        label: "sales table (8 rows)",
        setupSql: SALES_SETUP,
        tableNames: ["sales"],
      },
      challenge: {
        prompt: "Return the smallest sale amount as smallest_sale.",
        hint: "Use MIN(amount) AS smallest_sale.",
        initialSql: "-- Find the smallest sale\n",
        solutionSql: "SELECT MIN(amount) AS smallest_sale\nFROM sales;",
        validate: (result) => {
          if (result.rowCount !== 1) {
            return {
              passed: false,
              message: "This MIN query should return one row.",
            };
          }

          const smallestSale = Number(getValue(result.data[0], "smallest_sale"));

          if (Number.isNaN(smallestSale)) {
            return {
              passed: false,
              message: "Alias the result as smallest_sale.",
            };
          }

          if (Math.abs(smallestSale - 430) > 0.01) {
            return {
              passed: false,
              message: "The smallest sale amount is 430.",
            };
          }

          return {
            passed: true,
            message: "Correct! MIN found the smallest amount in the table.",
          };
        },
      },
    },
    {
      id: "aggregates-max",
      title: "MAX Finds the Largest Value",
      content: `MAX returns the largest value in a column.

  SELECT MAX(amount) AS largest_sale
  FROM sales

This is helpful for questions like “What was the biggest order?” or “What is the latest date in the dataset?”`,
      sampleData: {
        label: "sales table (8 rows)",
        setupSql: SALES_SETUP,
        tableNames: ["sales"],
      },
      challenge: {
        prompt: "Return the largest sale amount as largest_sale.",
        hint: "Use MAX(amount) AS largest_sale.",
        initialSql: "-- Find the largest sale\n",
        solutionSql: "SELECT MAX(amount) AS largest_sale\nFROM sales;",
        validate: (result) => {
          if (result.rowCount !== 1) {
            return {
              passed: false,
              message: "This MAX query should return one row.",
            };
          }

          const largestSale = Number(getValue(result.data[0], "largest_sale"));

          if (Number.isNaN(largestSale)) {
            return {
              passed: false,
              message: "Alias the result as largest_sale.",
            };
          }

          if (Math.abs(largestSale - 1500) > 0.01) {
            return {
              passed: false,
              message: "The largest sale amount is 1500.",
            };
          }

          return {
            passed: true,
            message: "Correct! MAX found the largest amount in the table.",
          };
        },
      },
    },
    {
      id: "aggregates-avg",
      title: "AVG Computes the Mean",
      content: `AVG calculates the average value of a numeric column.

  SELECT AVG(amount) AS average_sale
  FROM sales

AVG is useful when you want a typical value instead of a total or an extreme. For example, it can tell you the average order size or average score.`,
      sampleData: {
        label: "sales table (8 rows)",
        setupSql: SALES_SETUP,
        tableNames: ["sales"],
      },
      challenge: {
        prompt: "Return the average sale amount as average_sale.",
        hint: "Use AVG(amount) AS average_sale.",
        initialSql: "-- Find the average sale\n",
        solutionSql: "SELECT AVG(amount) AS average_sale\nFROM sales;",
        validate: (result) => {
          if (result.rowCount !== 1) {
            return {
              passed: false,
              message: "This AVG query should return one row.",
            };
          }

          const averageSale = Number(getValue(result.data[0], "average_sale"));

          if (Number.isNaN(averageSale)) {
            return {
              passed: false,
              message: "Alias the result as average_sale.",
            };
          }

          if (Math.abs(averageSale - 925) > 0.01) {
            return {
              passed: false,
              message: "The average sale amount is 925.",
            };
          }

          return {
            passed: true,
            message: "Correct! AVG calculated the mean sale amount.",
          };
        },
      },
    },
    {
      id: "aggregates-min-max-avg",
      title: "MIN, MAX, and AVG Together",
      content: `After learning each aggregate separately, you can combine them to get a compact summary of the spread of your data.

  SELECT
    MIN(amount) AS smallest_sale,
    MAX(amount) AS largest_sale,
    AVG(amount) AS average_sale
  FROM sales

This gives you the lowest value, highest value, and mean in one query. That makes it a useful “quick profile” of a numeric column.`,
      sampleData: {
        label: "sales table (8 rows)",
        setupSql: SALES_SETUP,
        tableNames: ["sales"],
      },
      challenge: {
        prompt:
          "Return the smallest sale as smallest_sale, the largest sale as largest_sale, and the average sale amount as average_sale.",
        hint:
          "Use MIN(amount), MAX(amount), and AVG(amount) with the requested aliases.",
        initialSql: "-- Find the min, max, and average sale\n",
        solutionSql:
          "SELECT\n  MIN(amount) AS smallest_sale,\n  MAX(amount) AS largest_sale,\n  AVG(amount) AS average_sale\nFROM sales;",
        validate: (result) => {
          if (result.rowCount !== 1) {
            return {
              passed: false,
              message: "This aggregate query should return one row.",
            };
          }

          const row = result.data[0];
          const smallestSale = Number(getValue(row, "smallest_sale"));
          const largestSale = Number(getValue(row, "largest_sale"));
          const averageSale = Number(getValue(row, "average_sale"));

          if ([smallestSale, largestSale, averageSale].some((value) => Number.isNaN(value))) {
            return {
              passed: false,
              message: "Return the three summary columns with the aliases smallest_sale, largest_sale, and average_sale.",
            };
          }

          if (
            Math.abs(smallestSale - 430) > 0.01
            || Math.abs(largestSale - 1500) > 0.01
            || Math.abs(averageSale - 925) > 0.01
          ) {
            return {
              passed: false,
              message: "The correct values are 430, 1500, and 925.",
            };
          }

          return {
            passed: true,
            message: "Nice! MIN, MAX, and AVG together give a quick snapshot of the sales distribution.",
          };
        },
      },
    },
  ],
};

export default aggregates;
