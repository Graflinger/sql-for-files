import type { Chapter } from "../../types/learn";
import type { QueryResult } from "../../types/query";

const BAD_ORDER_LINES_SETUP = [
  `CREATE OR REPLACE TABLE orders_flat (
    order_id INTEGER,
    customer_name VARCHAR,
    customer_email VARCHAR,
    customer_city VARCHAR,
    product_name VARCHAR,
    product_price DECIMAL(10,2),
    quantity INTEGER
  )`,
  `INSERT INTO orders_flat VALUES
    (1001, 'Alice Kim', 'alice@shop.test', 'Berlin', 'Keyboard', 89.00, 1),
    (1002, 'Alice Kim', 'alice@shop.test', 'Berlin', 'Mouse', 25.00, 2),
    (1003, 'Ben Fox', 'ben@shop.test', 'Hamburg', 'Keyboard', 89.00, 1),
    (1004, 'Alice Kim', 'alice@shop.test', 'Berlin', 'USB-C Hub', 45.00, 1),
    (1005, 'Cara Lane', 'cara@shop.test', 'Munich', 'Webcam', 120.00, 1),
    (1006, 'Dan Reed', 'dan@shop.test', 'Cologne', 'Desk Mat', 19.00, 1)` ,
];

const GOOD_SHOP_SETUP = [
  `CREATE OR REPLACE TABLE customers (
    customer_id INTEGER,
    customer_name VARCHAR,
    customer_email VARCHAR,
    customer_city VARCHAR
  )`,
  `INSERT INTO customers VALUES
    (1, 'Alice Kim', 'alice@shop.test', 'Berlin'),
    (2, 'Ben Fox', 'ben@shop.test', 'Hamburg'),
    (3, 'Cara Lane', 'cara@shop.test', 'Munich'),
    (4, 'Dan Reed', 'dan@shop.test', 'Cologne')`,
  `CREATE OR REPLACE TABLE products (
    product_id INTEGER,
    product_name VARCHAR,
    product_price DECIMAL(10,2)
  )`,
  `INSERT INTO products VALUES
    (1, 'Keyboard', 89.00),
    (2, 'Mouse', 25.00),
    (3, 'USB-C Hub', 45.00),
    (4, 'Webcam', 120.00),
    (5, 'Desk Mat', 19.00),
    (6, 'Monitor Stand', 59.00)`,
  `CREATE OR REPLACE TABLE orders (
    order_id INTEGER,
    customer_id INTEGER,
    order_date DATE
  )`,
  `INSERT INTO orders VALUES
    (1001, 1, '2024-01-05'),
    (1002, 1, '2024-01-07'),
    (1003, 2, '2024-01-09'),
    (1004, 1, '2024-01-10'),
    (1005, 3, '2024-01-14'),
    (1006, 4, '2024-01-15')`,
  `CREATE OR REPLACE TABLE order_items (
    order_id INTEGER,
    product_id INTEGER,
    quantity INTEGER
  )`,
  `INSERT INTO order_items VALUES
    (1001, 1, 1),
    (1002, 2, 2),
    (1003, 1, 1),
    (1004, 3, 1),
    (1005, 4, 1),
    (1006, 5, 1)` ,
];

const PACKED_ORDERS_SETUP = [
  `CREATE OR REPLACE TABLE orders_packed (
    order_id INTEGER,
    customer_name VARCHAR,
    products VARCHAR
  )`,
  `INSERT INTO orders_packed VALUES
    (2001, 'Alice Kim', 'Keyboard, Mouse'),
    (2002, 'Ben Fox', 'Webcam'),
    (2003, 'Cara Lane', 'Keyboard, USB-C Hub'),
    (2004, 'Dan Reed', 'Desk Mat')`,
];

function getValue(row: Record<string, unknown>, column: string): unknown {
  const matchingKey = Object.keys(row).find((key) => key.toLowerCase() === column.toLowerCase());
  return matchingKey ? row[matchingKey] : undefined;
}

function hasColumns(result: QueryResult, expectedColumns: string[]): boolean {
  const lowerColumns = result.columns.map((column) => column.toLowerCase());
  return expectedColumns.every((column) => lowerColumns.includes(column.toLowerCase()));
}

const normalization: Chapter = {
  id: "normalization",
  title: "Normalization",
  lessons: [
    {
      id: "normalization-why",
      title: "Why Normalization Matters",
      content: `Normalization is the process of splitting data into related tables so each fact is stored in the right place only once. We do this to reduce duplication and keep data consistent.

Imagine a single table that stores orders like this:

  order_id | customer_name | customer_email   | customer_city | product_name | product_price
  -------- | ------------- | ---------------- | ------------- | ------------ | -------------
  1001     | Alice Kim     | alice@shop.test  | Berlin        | Keyboard     | 89.00
  1002     | Alice Kim     | alice@shop.test  | Berlin        | Mouse        | 25.00
  1003     | Ben Fox       | ben@shop.test    | Hamburg       | Keyboard     | 89.00

Alice's email and city are repeated on every order row. The Keyboard price is also repeated. That repetition causes problems:

• Update anomaly: if Alice moves, you must update many rows
• Insert anomaly: you may not be able to add a new product until somebody orders it
• Delete anomaly: deleting the last order for a product can accidentally remove the product information itself

Normalization solves this by separating customers, products, orders, and order items into their own tables. Each table has a clear purpose, and relationships are connected with keys.`,
    },
    {
      id: "normalization-update-anomaly",
      title: "Feel the Update Anomaly",
      content: `Let's make the update problem concrete. In the bad schema below, customer details are copied into every order row.

If Alice moves from Berlin to Munich, you do not update one customer record. You must find every row where Alice appears and change all of them. Missing just one row leaves the database in an inconsistent state.

Load the sample data and query the rows that would need to be changed. You should notice that one real-world fact — Alice's city — is duplicated across multiple order rows.`,
      sampleData: {
        label: "orders_flat table (denormalized order lines)",
        setupSql: BAD_ORDER_LINES_SETUP,
        tableNames: ["orders_flat"],
      },
      challenge: {
        prompt:
          "Return the rows that would need updating if Alice Kim changed cities. Show order_id, customer_name, and customer_city, ordered by order_id.",
        hint:
          "Query orders_flat, filter to Alice Kim, select the three requested columns, and order by order_id.",
        initialSql: "-- Show every duplicated Alice row\n",
        solutionSql:
          "SELECT order_id, customer_name, customer_city\nFROM orders_flat\nWHERE customer_name = 'Alice Kim'\nORDER BY order_id;",
        validate: (result) => {
          if (!hasColumns(result, ["order_id", "customer_name", "customer_city"])) {
            return {
              passed: false,
              message: "Return the columns order_id, customer_name, and customer_city.",
            };
          }

          if (result.rowCount !== 3) {
            return {
              passed: false,
              message: `Expected 3 duplicated Alice rows but got ${result.rowCount}.`,
            };
          }

          const expectedOrderIds = [1001, 1002, 1004];

          for (let index = 0; index < expectedOrderIds.length; index += 1) {
            const row = result.data[index];
            const orderId = Number(getValue(row, "order_id"));
            const customerName = String(getValue(row, "customer_name"));
            const customerCity = String(getValue(row, "customer_city"));

            if (orderId !== expectedOrderIds[index] || customerName !== "Alice Kim" || customerCity !== "Berlin") {
              return {
                passed: false,
                message: "The result should show Alice's three duplicated rows in order_id order.",
              };
            }
          }

          return {
            passed: true,
            message: "Exactly. One city change would require three row updates in this bad design.",
          };
        },
      },
    },
    {
      id: "normalization-update-solved",
      title: "One Row to Update in a Good Schema",
      content: `Now compare that with a normalized design. Customer facts live in the customers table, while orders only store customer_id.

If Alice moves, you update her row once in customers. Her orders do not need their own copies of city and email.

This is one of the main reasons normalized tables are easier to maintain correctly.`,
      sampleData: {
        label: "customers, products, orders, and order_items tables",
        setupSql: GOOD_SHOP_SETUP,
        tableNames: ["customers", "products", "orders", "order_items"],
      },
      challenge: {
        prompt:
          "Return the single customer row you would update for Alice Kim. Show customer_id, customer_name, and customer_city.",
        hint:
          "Query the customers table and filter to Alice Kim.",
        initialSql: "-- Show the single customer row for Alice\n",
        solutionSql:
          "SELECT customer_id, customer_name, customer_city\nFROM customers\nWHERE customer_name = 'Alice Kim';",
        validate: (result) => {
          if (!hasColumns(result, ["customer_id", "customer_name", "customer_city"])) {
            return {
              passed: false,
              message: "Return customer_id, customer_name, and customer_city.",
            };
          }

          if (result.rowCount !== 1) {
            return {
              passed: false,
              message: `Expected 1 customer row but got ${result.rowCount}.`,
            };
          }

          const row = result.data[0];
          const customerId = Number(getValue(row, "customer_id"));
          const customerName = String(getValue(row, "customer_name"));
          const customerCity = String(getValue(row, "customer_city"));

          if (customerId !== 1 || customerName !== "Alice Kim" || customerCity !== "Berlin") {
            return {
              passed: false,
              message: "The result should contain Alice's single customer row from customers.",
            };
          }

          return {
            passed: true,
            message: "Right — in the normalized schema, Alice's city exists in one place only.",
          };
        },
      },
    },
    {
      id: "normalization-bad-1nf",
      title: "Feel Why Packed Lists Break 1NF",
      content: `First normal form says each column should hold one value, not a comma-separated list of values.

In the bad table below, each order stores multiple product names in a single text column. That means the database cannot reason about products cleanly. You end up searching inside strings instead of working with individual rows.

Try the challenge and notice how awkward it feels compared with a proper order_items table.`,
      sampleData: {
        label: "orders_packed table (products stored as text lists)",
        setupSql: PACKED_ORDERS_SETUP,
        tableNames: ["orders_packed"],
      },
      challenge: {
        prompt:
          "Find the orders whose products list mentions Keyboard. Return order_id and products, ordered by order_id.",
        hint:
          "You will probably need LIKE because products are packed into one text field.",
        initialSql: "-- Search inside a packed products list\n",
        solutionSql:
          "SELECT order_id, products\nFROM orders_packed\nWHERE products LIKE '%Keyboard%'\nORDER BY order_id;",
        validate: (result) => {
          if (!hasColumns(result, ["order_id", "products"])) {
            return {
              passed: false,
              message: "Return order_id and products.",
            };
          }

          if (result.rowCount !== 2) {
            return {
              passed: false,
              message: `Expected 2 matching packed orders but got ${result.rowCount}.`,
            };
          }

          const expected: Array<[number, string]> = [
            [2001, "Keyboard, Mouse"],
            [2003, "Keyboard, USB-C Hub"],
          ];

          for (let index = 0; index < expected.length; index += 1) {
            const row = result.data[index];
            const [expectedOrderId, expectedProducts] = expected[index];
            const orderId = Number(getValue(row, "order_id"));
            const products = String(getValue(row, "products"));

            if (orderId !== expectedOrderId || products !== expectedProducts) {
              return {
                passed: false,
                message: "The result should show the two packed orders that mention Keyboard.",
              };
            }
          }

          return {
            passed: true,
            message: "Yes — it works, but it feels brittle because the data is trapped inside text lists.",
          };
        },
      },
    },
    {
      id: "normalization-good-1nf",
      title: "Order Items Feel Better",
      content: `In a normalized schema, each ordered product gets its own row in order_items. That means products are queryable with normal joins and filters.

Instead of asking, “Does this big text blob contain Keyboard?”, you can say, “Which order_items rows point to the Keyboard product?” That is much cleaner and much more reliable.

Load the normalized tables and try the same business question again.`,
      sampleData: {
        label: "customers, products, orders, and order_items tables",
        setupSql: GOOD_SHOP_SETUP,
        tableNames: ["customers", "products", "orders", "order_items"],
      },
      challenge: {
        prompt:
          "List the orders that contain the Keyboard product. Return order_id and product_name, ordered by order_id.",
        hint:
          "Join order_items to products and filter to product_name = 'Keyboard'.",
        initialSql: "-- Find keyboard orders in the normalized schema\n",
        solutionSql:
          "SELECT oi.order_id, p.product_name\nFROM order_items AS oi\nINNER JOIN products AS p\n  ON oi.product_id = p.product_id\nWHERE p.product_name = 'Keyboard'\nORDER BY oi.order_id;",
        validate: (result) => {
          if (!hasColumns(result, ["order_id", "product_name"])) {
            return {
              passed: false,
              message: "Return order_id and product_name.",
            };
          }

          if (result.rowCount !== 2) {
            return {
              passed: false,
              message: `Expected 2 keyboard order rows but got ${result.rowCount}.`,
            };
          }

          const expected: Array<[number, string]> = [
            [1001, "Keyboard"],
            [1003, "Keyboard"],
          ];

          for (let index = 0; index < expected.length; index += 1) {
            const row = result.data[index];
            const [expectedOrderId, expectedProductName] = expected[index];
            const orderId = Number(getValue(row, "order_id"));
            const productName = String(getValue(row, "product_name"));

            if (orderId !== expectedOrderId || productName !== expectedProductName) {
              return {
                passed: false,
                message: "The result should show keyboard orders 1001 and 1003.",
              };
            }
          }

          return {
            passed: true,
            message: "Much better — the normalized design lets you answer the same question cleanly with joins.",
          };
        },
      },
    },
    {
      id: "normalization-delete-anomaly",
      title: "Feel the Delete Anomaly",
      content: `The flat table also has a delete problem. Product facts exist only because they are attached to order rows.

If a product appears in exactly one row, deleting that order would also delete the only stored record of that product. The database would forget that the product ever existed.

Try finding the products that are hanging by a single row.`,
      sampleData: {
        label: "orders_flat table (denormalized order lines)",
        setupSql: BAD_ORDER_LINES_SETUP,
        tableNames: ["orders_flat"],
      },
      challenge: {
        prompt:
          "Find the products that appear in exactly one order row. Return product_name and row_count, ordered by product_name.",
        hint:
          "GROUP BY product_name and keep only groups with COUNT(*) = 1.",
        initialSql: "-- Find products that would disappear with one delete\n",
        solutionSql:
          "SELECT product_name, COUNT(*) AS row_count\nFROM orders_flat\nGROUP BY product_name\nHAVING COUNT(*) = 1\nORDER BY product_name;",
        validate: (result) => {
          if (!hasColumns(result, ["product_name", "row_count"])) {
            return {
              passed: false,
              message: "Return product_name and row_count.",
            };
          }

          if (result.rowCount !== 4) {
            return {
              passed: false,
              message: `Expected 4 one-row products but got ${result.rowCount}.`,
            };
          }

          const expected: Array<[string, number]> = [
            ["Desk Mat", 1],
            ["Mouse", 1],
            ["USB-C Hub", 1],
            ["Webcam", 1],
          ];

          for (let index = 0; index < expected.length; index += 1) {
            const row = result.data[index];
            const [expectedProductName, expectedRowCount] = expected[index];
            const productName = String(getValue(row, "product_name"));
            const rowCount = Number(getValue(row, "row_count"));

            if (productName !== expectedProductName || rowCount !== expectedRowCount) {
              return {
                passed: false,
                message: "The result should list the four products that appear only once.",
              };
            }
          }

          return {
            passed: true,
            message: "Exactly. In the flat table, deleting one order could erase the only copy of a product fact.",
          };
        },
      },
    },
    {
      id: "normalization-insert-delete-solved",
      title: "Products Can Exist Without Orders",
      content: `A normalized schema fixes both insert and delete anomalies by giving products their own table.

That means a product can exist before the first order is placed, and it can still exist after the last order is deleted. Product facts are no longer tied to the survival of order rows.

In the sample below, Monitor Stand exists in the product catalog but has not been ordered yet. See if you can find it.`,
      sampleData: {
        label: "customers, products, orders, and order_items tables",
        setupSql: GOOD_SHOP_SETUP,
        tableNames: ["customers", "products", "orders", "order_items"],
      },
      challenge: {
        prompt:
          "Find the products that have not been ordered yet. Return product_name and times_ordered, ordered by product_name.",
        hint:
          "LEFT JOIN products to order_items, then group by product_name and count matching order_items rows.",
        initialSql: "-- Find products with no order_items yet\n",
        solutionSql:
          "SELECT p.product_name, COUNT(oi.order_id) AS times_ordered\nFROM products AS p\nLEFT JOIN order_items AS oi\n  ON p.product_id = oi.product_id\nGROUP BY p.product_name\nHAVING COUNT(oi.order_id) = 0\nORDER BY p.product_name;",
        validate: (result) => {
          if (!hasColumns(result, ["product_name", "times_ordered"])) {
            return {
              passed: false,
              message: "Return product_name and times_ordered.",
            };
          }

          if (result.rowCount !== 1) {
            return {
              passed: false,
              message: `Expected 1 unordered product but got ${result.rowCount}.`,
            };
          }

          const row = result.data[0];
          const productName = String(getValue(row, "product_name"));
          const timesOrdered = Number(getValue(row, "times_ordered"));

          if (productName !== "Monitor Stand" || timesOrdered !== 0) {
            return {
              passed: false,
              message: "The result should show Monitor Stand with times_ordered = 0.",
            };
          }

          return {
            passed: true,
            message: "Perfect. The normalized catalog can store products even when no orders reference them yet.",
          };
        },
      },
    },
    {
      id: "normalization-first-second-third",
      title: "1NF, 2NF, and 3NF",
      content: `Most application databases aim for first, second, and third normal form. These are practical rules for organizing data well.

First normal form (1NF) means each column contains a single atomic value, and each row can be identified uniquely. For example, a column like products = 'Keyboard, Mouse' breaks 1NF because it stores multiple values in one field.

Second normal form (2NF) builds on 1NF. It means every non-key column must depend on the whole key, not only part of it. This matters most when a table uses a composite key. If an order_items table is keyed by (order_id, product_id), then quantity depends on the whole key, but customer_name depends only on order_id and belongs somewhere else.

Third normal form (3NF) builds on 2NF. It means non-key columns should depend only on the key, not on other non-key columns. For example, if a customers table stores zip_code and city, and city is always determined by zip_code, then city depends indirectly on the customer key. That is a sign the design may need another table.

In practice, 3NF gives you a strong default structure:

  customers(id, name, email)
  products(id, name, price)
  orders(id, customer_id, order_date)
  order_items(order_id, product_id, quantity)

Each fact lives where it logically belongs, and the keys describe how the tables connect.`,
    },
    {
      id: "normalization-why-we-build-in-nf",
      title: "Why We Build Tables in Normal Forms",
      content: `Normal forms are not just theory. They give us concrete benefits when we design real systems.

Why teams prefer normalized schemas:

• Cleaner updates: change a customer's email in one place
• Better data quality: fewer contradictory copies of the same fact
• Smaller storage footprint: repeated text and attributes are removed
• Clearer ownership: customer data belongs in customers, not in every order row
• Safer application logic: inserts, updates, and deletes become more predictable

The trade-off is that normalized databases often need JOINs to bring related data back together. That is usually a good trade in transactional systems, because correctness matters more than squeezing everything into one giant table.

There are exceptions. Analytics systems sometimes denormalize on purpose to make reporting faster or simpler. The key idea is this: start with a well-normalized model so your data stays correct, then denormalize selectively when you have a proven performance or reporting reason.

For most beginner-to-intermediate SQL work, think of normalization as the reason your data is split into sensible tables — and JOINs as the tool that lets you combine them again when you query.`,
    },
  ],
};

export default normalization;
