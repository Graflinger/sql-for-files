import type { Chapter } from "../../types/learn";

const ORDERS_SETUP = [
  `CREATE OR REPLACE TABLE orders (
    order_id INTEGER,
    customer_name VARCHAR,
    order_date DATE,
    ship_date DATE,
    amount DECIMAL(10,2)
  )`,
  `INSERT INTO orders VALUES
    (1, 'Alice', '2024-01-03', '2024-01-05', 1200),
    (2, 'Bob', '2024-01-15', '2024-01-20', 850),
    (3, 'Charlie', '2024-02-01', '2024-02-04', 640),
    (4, 'Diana', '2024-02-18', '2024-02-25', 430),
    (5, 'Eve', '2024-03-02', '2024-03-03', 1500),
    (6, 'Frank', '2024-03-28', '2024-04-02', 920),
    (7, 'Grace', '2024-04-10', '2024-04-15', 760)`,
];

function getValue(row: Record<string, unknown>, column: string): unknown {
  const matchingKey = Object.keys(row).find((key) => key.toLowerCase() === column.toLowerCase());
  return matchingKey ? row[matchingKey] : undefined;
}

const dates: Chapter = {
  id: "dates",
  title: "Working with Dates",
  lessons: [
    {
      id: "dates-filtering",
      title: "Filtering by Date Ranges",
      content: `Dates are easier to work with when you treat them as dates, not strings. SQL lets you compare them directly.

To find February orders, you can write:

  SELECT order_id, order_date
  FROM orders
  WHERE order_date >= DATE '2024-02-01'
    AND order_date < DATE '2024-03-01'

This pattern is often safer than BETWEEN for month ranges, because the upper bound stays exclusive.

You can use the same idea for weeks, quarters, or any other date window.`,
      sampleData: {
        label: "orders table (7 rows)",
        setupSql: ORDERS_SETUP,
        tableNames: ["orders"],
      },
      challenge: {
        prompt:
          "Return the February 2024 orders with order_id and order_date, ordered by order_date.",
        hint:
          "Filter order_date from 2024-02-01 up to but not including 2024-03-01.",
        initialSql: "-- Find February orders\n",
        solutionSql:
          "SELECT order_id, order_date\nFROM orders\nWHERE order_date >= DATE '2024-02-01'\n  AND order_date < DATE '2024-03-01'\nORDER BY order_date;",
        validate: (result) => {
          if (result.rowCount !== 2) {
            return {
              passed: false,
              message: `Expected 2 February orders but got ${result.rowCount}.`,
            };
          }

          const orderIds = result.data.map((row) => Number(getValue(row, "order_id")));
          const expectedOrderIds = [3, 4];

          const allMatch = orderIds.length === expectedOrderIds.length
            && orderIds.every((orderId, index) => orderId === expectedOrderIds[index]);

          if (!allMatch) {
            return {
              passed: false,
              message: "The February orders should be order_id 3 and 4, in date order.",
            };
          }

          return {
            passed: true,
            message: "Correct! You filtered the table to a precise date range.",
          };
        },
      },
    },
    {
      id: "dates-extract",
      title: "Extracting Parts of a Date",
      content: `You can pull specific parts out of a date with EXTRACT.

For example, to get the month number from order_date:

  SELECT EXTRACT(MONTH FROM order_date) AS order_month
  FROM orders

This is useful when you want to group by year, month, quarter, weekday, and more. Another common option is DATE_TRUNC, which rounds a date down to a unit such as the start of the month.

  SELECT DATE_TRUNC('month', order_date) AS month_start
  FROM orders`,
      sampleData: {
        label: "orders table (7 rows)",
        setupSql: ORDERS_SETUP,
        tableNames: ["orders"],
      },
      challenge: {
        prompt:
          "Count how many orders were placed in each month. Return order_month and order_count, ordered by order_month.",
        hint:
          "Use EXTRACT(MONTH FROM order_date), GROUP BY the same expression, and COUNT(*).",
        initialSql: "-- Count orders per month\n",
        solutionSql:
          "SELECT EXTRACT(MONTH FROM order_date) AS order_month, COUNT(*) AS order_count\nFROM orders\nGROUP BY EXTRACT(MONTH FROM order_date)\nORDER BY order_month;",
        validate: (result) => {
          if (result.rowCount !== 4) {
            return {
              passed: false,
              message: `Expected 4 monthly groups but got ${result.rowCount}.`,
            };
          }

          const expected = [
            [1, 2],
            [2, 2],
            [3, 2],
            [4, 1],
          ];

          for (let index = 0; index < expected.length; index += 1) {
            const row = result.data[index];
            const [expectedMonth, expectedCount] = expected[index];
            const orderMonth = Number(getValue(row, "order_month"));
            const orderCount = Number(getValue(row, "order_count"));

            if (orderMonth !== expectedMonth || orderCount !== expectedCount) {
              return {
                passed: false,
                message: "Check your EXTRACT expression, grouping, and ordering by order_month.",
              };
            }
          }

          return {
            passed: true,
            message: "Nice! EXTRACT let you turn raw dates into month-based summaries.",
          };
        },
      },
    },
    {
      id: "dates-date-diff",
      title: "Date Arithmetic with DATE_DIFF",
      content: `SQL can calculate the distance between two dates. In DuckDB, DATE_DIFF is a convenient way to do that.

  SELECT order_id, DATE_DIFF('day', order_date, ship_date) AS days_to_ship
  FROM orders

This tells you how many days passed between each order and shipment.

Date arithmetic is useful for lead time, retention, overdue tasks, subscription length, and many other business questions.`,
      sampleData: {
        label: "orders table (7 rows)",
        setupSql: ORDERS_SETUP,
        tableNames: ["orders"],
      },
      challenge: {
        prompt:
          "Return order_id and the number of shipping days as days_to_ship, ordered by order_id.",
        hint:
          "Use DATE_DIFF('day', order_date, ship_date) AS days_to_ship.",
        initialSql: "-- Calculate shipping time in days\n",
        solutionSql:
          "SELECT order_id, DATE_DIFF('day', order_date, ship_date) AS days_to_ship\nFROM orders\nORDER BY order_id;",
        validate: (result) => {
          if (result.rowCount !== 7) {
            return {
              passed: false,
              message: `Expected 7 orders but got ${result.rowCount}.`,
            };
          }

          const expected = [
            [1, 2],
            [2, 5],
            [3, 3],
            [4, 7],
            [5, 1],
            [6, 5],
            [7, 5],
          ];

          for (let index = 0; index < expected.length; index += 1) {
            const row = result.data[index];
            const [expectedOrderId, expectedDays] = expected[index];
            const orderId = Number(getValue(row, "order_id"));
            const daysToShip = Number(getValue(row, "days_to_ship"));

            if (orderId !== expectedOrderId || daysToShip !== expectedDays) {
              return {
                passed: false,
                message: "Check your DATE_DIFF calculation and order the rows by order_id.",
              };
            }
          }

          return {
            passed: true,
            message: "Excellent! You used date arithmetic to measure shipping time.",
          };
        },
      },
    },
  ],
};

export default dates;
