import type { Guide } from "../types/guides";

export const guides: Guide[] = [
  {
    slug: "what-is-a-database-table",
    title: "What Is a Database Table? Rows, Columns, and the Mental Model Behind SQL",
    description:
      "A beginner-friendly explanation of database tables, rows, and columns, with a quick intro to practicing SQL locally in SQL for Files.",
    summary:
      "Before SQL feels natural, you need one simple mental model: tables are structured collections of records with predictable columns.",
    publishedAt: "2026-05-09",
    updatedAt: "2026-05-09",
    category: "Learn SQL",
    keywords: [
      "what is a database table",
      "SQL rows and columns",
      "learn SQL basics",
      "SQL for Files lessons",
    ],
    relatedGuideSlugs: [
      "sql-data-types-explained",
      "sql-null-missing-values",
      "query-csv-files-with-sql",
    ],
    relatedLessonIds: [
      "data-basics-tables",
      "data-basics-types",
      "data-basics-null",
    ],
    sections: [
      {
        id: "start-with-the-shape",
        title: "Start with the shape of data",
        blocks: [
          {
            kind: "paragraph",
            text: "Most people start learning SQL by memorizing SELECT statements. That works for a few minutes, but it misses the deeper idea: SQL is a language for asking questions about structured data. Before the syntax matters, the shape matters.",
          },
          {
            kind: "paragraph",
            text: "SQL for Files is built to make that first step practical. You can open the app in your browser, load CSV, JSON, or Parquet files, and query them with SQL locally using DuckDB WASM. The Learn SQL lessons give you small, guided examples before you bring in your own files.",
          },
          {
            kind: "callout",
            title: "No server required",
            text: "SQL for Files runs file import and query execution in the browser, so your practice data and query results stay on your device.",
          },
        ],
      },
      {
        id: "tables-are-familiar",
        title: "A table is the spreadsheet idea with stronger rules",
        blocks: [
          {
            kind: "paragraph",
            text: "If you have ever opened a spreadsheet, you already know the basic picture. Data sits in a grid. Columns run vertically. Rows run horizontally. A database table uses the same visual idea, but with more consistency and clearer expectations.",
          },
          {
            kind: "list",
            items: [
              "Each column describes one property, such as name, department, salary, or hire date.",
              "Each row represents one record, such as one employee, one order, or one measurement.",
              "Every row follows the same structure, so SQL can ask reliable questions across the whole table.",
            ],
          },
          {
            kind: "code",
            code: "id | name    | department  | salary\n---|---------|-------------|-------\n1  | Alice   | Engineering | 95000\n2  | Bob     | Marketing   | 72000\n3  | Charlie | Engineering | 110000",
          },
        ],
      },
      {
        id: "rows-and-columns",
        title: "Rows are records; columns are properties",
        blocks: [
          {
            kind: "paragraph",
            text: "The fastest way to understand a table is to read it in two directions. Across a row, you see a complete record. Down a column, you see the same property repeated for many records. SQL becomes powerful because it can move in both directions without manual copying, filtering, or scrolling.",
          },
          {
            kind: "paragraph",
            text: "For example, one employee row might contain an ID, a name, a department, a salary, and a hire date. The salary column, read downward, lets you ask questions like who earns the most, what the average salary is, or which departments have higher payroll costs.",
          },
        ],
      },
      {
        id: "why-structure-matters",
        title: "Why structure matters before your first query",
        blocks: [
          {
            kind: "paragraph",
            text: "SQL depends on predictable structure. When a table has a salary column, SQL can calculate averages. When it has a hire_date column, SQL can sort by tenure or filter a date range. When every row follows the same shape, a single query can inspect thousands or millions of records at once.",
          },
          {
            kind: "list",
            items: [
              "A clear table shape makes queries easier to write.",
              "Consistent columns make results easier to trust.",
              "Structured records let you move from manual inspection to repeatable analysis.",
            ],
          },
        ],
      },
      {
        id: "try-the-lesson",
        title: "Try the matching Learn SQL lesson",
        blocks: [
          {
            kind: "paragraph",
            text: "The first Learn SQL lesson in SQL for Files focuses on this foundation: tables, rows, and columns. It is intentionally simple because it gives every later SQL topic a place to land.",
          },
          {
            kind: "steps",
            items: [
              "Open the related lesson from the cards at the bottom of this article.",
              "Read the short explanation of table structure.",
              "Then continue to the next lesson on data types before writing your first SELECT query.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "sql-data-types-explained",
    title: "SQL Data Types Explained: Text, Numbers, Dates, and Better Questions",
    description:
      "Learn why SQL data types matter, how text, numbers, and dates behave differently, and how SQL for Files helps beginners practice locally.",
    summary:
      "Data types are the reason SQL knows the difference between a name, a salary, and a hire date — and that difference shapes every query you write.",
    publishedAt: "2026-05-09",
    updatedAt: "2026-05-09",
    category: "Learn SQL",
    keywords: [
      "SQL data types explained",
      "learn SQL data types",
      "text numbers dates SQL",
      "SQL for Files tutorial",
    ],
    relatedGuideSlugs: [
      "what-is-a-database-table",
      "sql-null-missing-values",
      "query-csv-files-with-sql",
    ],
    relatedLessonIds: [
      "data-basics-types",
      "data-basics-tables",
      "data-basics-null",
    ],
    sections: [
      {
        id: "types-give-values-meaning",
        title: "Data types give values meaning",
        blocks: [
          {
            kind: "paragraph",
            text: "A table tells you where data lives. Data types tell you what the values mean. That distinction sounds small, but it is one of the reasons SQL can do more than display rows on a screen.",
          },
          {
            kind: "paragraph",
            text: "In SQL for Files, you can practice this idea without setting up a database server. Load sample lesson data or bring your own CSV, JSON, or Parquet file into the browser, inspect the inferred columns, and run SQL locally with DuckDB WASM.",
          },
        ],
      },
      {
        id: "three-common-types",
        title: "The three beginner types you will see everywhere",
        blocks: [
          {
            kind: "paragraph",
            text: "Most beginner SQL examples start with three everyday categories: text, numbers, and dates. They look obvious in a small table, but SQL treats them differently because they support different kinds of questions.",
          },
          {
            kind: "list",
            items: [
              "Text stores words and characters, such as employee names, departments, product codes, or regions.",
              "Numbers store quantities and measures, such as salaries, prices, counts, and percentages.",
              "Dates store calendar or time values, such as hire dates, order dates, timestamps, and event times.",
            ],
          },
          {
            kind: "code",
            code: "id          INTEGER\nname        VARCHAR\ndepartment  VARCHAR\nsalary      DECIMAL\nhire_date   DATE",
          },
        ],
      },
      {
        id: "different-types-different-questions",
        title: "Different types unlock different questions",
        blocks: [
          {
            kind: "paragraph",
            text: "A salary is not just characters on a screen. Because SQL understands it as a number, you can calculate a minimum, maximum, average, or total. A hire date is not just a label. Because SQL understands it as a date, you can sort chronologically or filter people hired after a certain day.",
          },
          {
            kind: "code",
            code: "SELECT\n  AVG(salary) AS average_salary,\n  MIN(hire_date) AS earliest_hire_date\nFROM employees;",
          },
          {
            kind: "paragraph",
            text: "Text has its own strengths. You can search for names, group by departments, match patterns, and label results. The important part is not that one type is better than another. The important part is that SQL chooses behavior based on type.",
          },
        ],
      },
      {
        id: "when-types-go-wrong",
        title: "When a value has the wrong type, queries get weird",
        blocks: [
          {
            kind: "paragraph",
            text: "A common beginner surprise is that a value can look right but behave wrong. The value 2026 might be a number, part of a date, or text inside an ID. SQL needs the type to know whether it should add it, sort it alphabetically, compare it as a date, or preserve it exactly as written.",
          },
          {
            kind: "callout",
            title: "Practical habit",
            text: "When you import a file, inspect the detected schema before writing a serious query. A column that looks numeric or date-like may still be stored as text depending on the file contents.",
          },
        ],
      },
      {
        id: "practice-in-sql-for-files",
        title: "Practice data types in SQL for Files",
        blocks: [
          {
            kind: "paragraph",
            text: "The second Learn SQL lesson introduces data types using a simple employee table. It shows why names, departments, salaries, and hire dates are not interchangeable, even when they all sit side by side in one row.",
          },
          {
            kind: "steps",
            items: [
              "Open the related Data Types lesson below.",
              "Notice which columns are text, numbers, and dates.",
              "Then continue toward SELECT queries, where those types start to affect real results.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "sql-null-missing-values",
    title: "SQL NULL Explained: How Missing Values Work and Why They Matter",
    description:
      "Learn what SQL NULL means, why it is different from zero or an empty string, and how beginners should query missing values correctly.",
    summary:
      "NULL is SQL's way of saying a value is missing or unknown — and it behaves differently from almost every other value beginners expect.",
    publishedAt: "2026-05-09",
    updatedAt: "2026-05-09",
    category: "Learn SQL",
    keywords: [
      "SQL NULL explained",
      "missing values in SQL",
      "IS NULL SQL",
      "learn SQL NULL",
    ],
    relatedGuideSlugs: [
      "what-is-a-database-table",
      "sql-data-types-explained",
      "private-local-data-analysis",
    ],
    relatedLessonIds: [
      "data-basics-null",
      "data-basics-tables",
      "data-basics-types",
    ],
    sections: [
      {
        id: "missing-is-not-empty",
        title: "Missing is not the same as empty",
        blocks: [
          {
            kind: "paragraph",
            text: "Real datasets are rarely complete. A customer may not have provided a phone number. An employee may not have a department assigned yet. A measurement may have failed before the value was recorded. SQL represents those absent or unknown values with NULL.",
          },
          {
            kind: "paragraph",
            text: "SQL for Files gives you a practical place to learn this behavior. You can open the app in your browser, work through the Learn SQL lessons, and later inspect missing values in your own CSV, JSON, or Parquet files locally with DuckDB WASM.",
          },
          {
            kind: "callout",
            title: "Beginner rule",
            text: "NULL does not mean zero, blank text, false, or the word unknown. It means the value is absent or not known.",
          },
        ],
      },
      {
        id: "why-null-exists",
        title: "Why SQL needs NULL",
        blocks: [
          {
            kind: "paragraph",
            text: "Without NULL, every missing value would need to be disguised as something else. A missing salary might become 0. A missing department might become an empty string. A missing date might become a fake placeholder date. Those shortcuts can make analysis misleading.",
          },
          {
            kind: "list",
            items: [
              "A salary of 0 means the known salary is zero; NULL means the salary is not known.",
              "An empty string means text is present but blank; NULL means no value was provided.",
              "A placeholder date can look real; NULL clearly marks that the date is missing.",
            ],
          },
        ],
      },
      {
        id: "how-to-check-null",
        title: "How to check for NULL correctly",
        blocks: [
          {
            kind: "paragraph",
            text: "The most important beginner mistake is trying to compare a column to NULL with an equals sign. It looks reasonable, but it does not work the way normal comparisons do.",
          },
          {
            kind: "code",
            code: "-- This does not find missing departments\nSELECT *\nFROM employees\nWHERE department = NULL;",
          },
          {
            kind: "paragraph",
            text: "To find missing values, use IS NULL. To find values that are present, use IS NOT NULL.",
          },
          {
            kind: "code",
            code: "SELECT *\nFROM employees\nWHERE department IS NULL;\n\nSELECT *\nFROM employees\nWHERE department IS NOT NULL;",
          },
        ],
      },
      {
        id: "null-affects-analysis",
        title: "NULL changes how analysis behaves",
        blocks: [
          {
            kind: "paragraph",
            text: "NULL values show up again and again as you learn more SQL. Aggregates like SUM and AVG usually ignore NULL values. LEFT JOIN results use NULL when no matching row exists. Grouping and subtotal queries can also use NULL in ways that deserve careful reading.",
          },
          {
            kind: "list",
            items: [
              "COUNT(*) counts rows, including rows that contain NULL values.",
              "COUNT(column_name) counts only rows where that specific column is not NULL.",
              "AVG(column_name) usually averages the known values and skips missing ones.",
            ],
          },
        ],
      },
      {
        id: "practice-null-in-sql-for-files",
        title: "Practice NULL in SQL for Files",
        blocks: [
          {
            kind: "paragraph",
            text: "The third lesson in the Understanding Data chapter introduces NULL before you move into your first SQL queries. That timing is intentional: missing values are not an advanced edge case. They are part of everyday data work.",
          },
          {
            kind: "steps",
            items: [
              "Open the related Missing Values with NULL lesson below.",
              "Compare NULL with empty strings, zero, and ordinary text values.",
              "Remember to use IS NULL and IS NOT NULL when you start filtering rows later.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "query-csv-files-with-sql",
    title: "How to Query CSV Files with SQL in Your Browser",
    description:
      "Learn how to load CSV files into SQL for Files, inspect columns, run SQL queries, aggregate data, and export results without uploading your data.",
    summary:
      "Use SQL for Files as a local CSV analysis workspace: add a file, inspect the generated table, write SQL, and export the rows you need.",
    publishedAt: "2026-05-02",
    updatedAt: "2026-05-02",
    category: "CSV analysis",
    keywords: [
      "query CSV with SQL",
      "browser CSV analysis",
      "DuckDB WASM CSV",
      "local CSV query tool",
    ],
    howTo: true,
    relatedGuideSlugs: [
      "sql-examples-for-csv-json-parquet",
      "private-local-data-analysis",
      "duckdb-wasm-browser-sql",
    ],
    relatedLessonIds: [
      "intro-first-query",
      "intro-select-columns",
      "filtering-where",
      "grouping-group-by",
    ],
    sections: [
      {
        id: "why-sql-for-csv",
        title: "Why query CSV files with SQL?",
        blocks: [
          {
            kind: "paragraph",
            text: "CSV is easy to export but awkward to inspect once files grow beyond a few thousand rows. SQL gives you a direct way to filter, group, sort, and join CSV data without first importing it into a spreadsheet or database server.",
          },
          {
            kind: "list",
            items: [
              "Filter rows with WHERE instead of manual spreadsheet filters.",
              "Summarize numeric columns with COUNT, SUM, AVG, MIN, and MAX.",
              "Join multiple CSV files when IDs or names connect them.",
              "Export a smaller result set after the query is finished.",
            ],
          },
        ],
      },
      {
        id: "add-csv",
        title: "Add a CSV file",
        blocks: [
          {
            kind: "steps",
            items: [
              "Open the SQL for Files editor.",
              "Drag a CSV file into the Add Data area, or choose it from your file picker.",
              "Review the detected table name in the Database sidebar.",
              "Expand the table to inspect column names before writing a query.",
            ],
          },
          {
            kind: "callout",
            title: "Advanced CSV options",
            text: "If your CSV uses a custom delimiter, skipped rows, unusual quote character, or a regional decimal separator, use advanced add options before creating the table.",
          },
        ],
      },
      {
        id: "basic-queries",
        title: "Start with simple queries",
        blocks: [
          {
            kind: "paragraph",
            text: "Begin with a small preview query so you can verify column names and row shape before running larger aggregations.",
          },
          {
            kind: "code",
            code: "SELECT *\nFROM sales\nLIMIT 20;",
          },
          {
            kind: "paragraph",
            text: "Then filter, sort, or select only the columns that matter for your analysis.",
          },
          {
            kind: "code",
            code: "SELECT order_date, region, revenue\nFROM sales\nWHERE revenue > 1000\nORDER BY revenue DESC;",
          },
        ],
      },
      {
        id: "aggregate-csv",
        title: "Aggregate CSV rows",
        blocks: [
          {
            kind: "paragraph",
            text: "SQL is especially useful when you want totals by category, region, month, customer segment, or another repeated value in the CSV file.",
          },
          {
            kind: "code",
            code: "SELECT\n  region,\n  COUNT(*) AS order_count,\n  SUM(revenue) AS total_revenue,\n  AVG(revenue) AS average_revenue\nFROM sales\nGROUP BY region\nORDER BY total_revenue DESC;",
          },
        ],
      },
      {
        id: "join-csv-files",
        title: "Join multiple CSV files",
        blocks: [
          {
            kind: "paragraph",
            text: "Add more than one CSV when your analysis needs lookup data, product names, account metadata, or another table that connects through a shared key.",
          },
          {
            kind: "code",
            code: "SELECT\n  orders.order_id,\n  customers.customer_name,\n  orders.revenue\nFROM orders\nJOIN customers\n  ON orders.customer_id = customers.customer_id\nORDER BY orders.revenue DESC;",
          },
        ],
      },
      {
        id: "privacy-and-export",
        title: "Keep results local and export only what you need",
        blocks: [
          {
            kind: "paragraph",
            text: "SQL for Files runs the CSV import and query execution in your browser with DuckDB WASM. The app does not upload your files, SQL, or result rows to a backend service.",
          },
          {
            kind: "paragraph",
            text: "After a query finishes, use CSV export for the result set, or save the local database in your browser if you want to keep working across sessions.",
          },
        ],
      },
    ],
  },
  {
    slug: "query-json-files-with-sql",
    title: "How to Analyze JSON Files Locally with SQL",
    description:
      "Use SQL for Files to query JSON arrays and NDJSON files locally with DuckDB WASM, including filtering, flattening, and aggregation examples.",
    summary:
      "Load JSON or NDJSON into a local DuckDB table, then use SQL to inspect records, filter fields, and work with nested values.",
    publishedAt: "2026-05-02",
    updatedAt: "2026-05-02",
    category: "JSON analysis",
    keywords: [
      "query JSON with SQL",
      "local JSON analysis",
      "NDJSON SQL",
      "DuckDB WASM JSON",
    ],
    howTo: true,
    relatedGuideSlugs: [
      "sql-examples-for-csv-json-parquet",
      "query-parquet-files-in-browser",
      "private-local-data-analysis",
    ],
    relatedLessonIds: [
      "filtering-like",
      "unnest-lists",
      "unnest-structs",
      "unnest-recursive",
    ],
    sections: [
      {
        id: "json-shapes",
        title: "Supported JSON shapes",
        blocks: [
          {
            kind: "paragraph",
            text: "SQL for Files is a good fit for JSON arrays and newline-delimited JSON where each object represents one row. That makes logs, API exports, product catalogs, and event files easier to inspect with SQL.",
          },
          {
            kind: "list",
            items: [
              "JSON array files such as [{...}, {...}].",
              "NDJSON files where each line is one JSON object.",
              "Nested arrays or structs that you can inspect and flatten with SQL patterns.",
            ],
          },
        ],
      },
      {
        id: "add-json",
        title: "Add JSON data",
        blocks: [
          {
            kind: "steps",
            items: [
              "Open the editor and add your JSON or NDJSON file.",
              "Review the created table in the Database sidebar.",
              "Preview the first rows to confirm field names and inferred types.",
              "Run focused queries before writing larger transformations.",
            ],
          },
        ],
      },
      {
        id: "query-fields",
        title: "Query top-level fields",
        blocks: [
          {
            kind: "paragraph",
            text: "When your JSON records have consistent top-level fields, you can query them like columns in a regular table.",
          },
          {
            kind: "code",
            code: "SELECT event_type, user_id, created_at\nFROM events\nWHERE event_type = 'purchase'\nORDER BY created_at DESC\nLIMIT 100;",
          },
        ],
      },
      {
        id: "summarize-json",
        title: "Summarize JSON records",
        blocks: [
          {
            kind: "paragraph",
            text: "Aggregation works well for event counts, API status codes, product categories, and user activity summaries.",
          },
          {
            kind: "code",
            code: "SELECT\n  event_type,\n  COUNT(*) AS events\nFROM events\nGROUP BY event_type\nORDER BY events DESC;",
          },
        ],
      },
      {
        id: "nested-json",
        title: "Work with nested JSON",
        blocks: [
          {
            kind: "paragraph",
            text: "Nested JSON often needs one extra step: unnest lists into rows or expand structs into columns. DuckDB includes SQL features for these patterns, and the Learn SQL track includes lessons on UNNEST for nested data.",
          },
          {
            kind: "code",
            code: "SELECT\n  order_id,\n  item.name AS item_name,\n  item.quantity\nFROM orders,\nUNNEST(items) AS item;",
          },
        ],
      },
      {
        id: "json-privacy",
        title: "Analyze JSON without uploading it",
        blocks: [
          {
            kind: "paragraph",
            text: "JSON exports can contain logs, customer IDs, analytics events, or sensitive operational data. SQL for Files keeps JSON processing in the browser, so you can inspect files without sending them to a hosted database or converter.",
          },
        ],
      },
    ],
  },
  {
    slug: "query-parquet-files-in-browser",
    title: "How to Query Parquet Files in the Browser",
    description:
      "Query Parquet files directly in your browser with DuckDB WASM, inspect schemas, aggregate columns, and keep analysis local.",
    summary:
      "Use browser-based DuckDB to inspect Parquet files, run fast analytical queries, and export compact results without a local database install.",
    publishedAt: "2026-05-02",
    updatedAt: "2026-05-02",
    category: "Parquet analysis",
    keywords: [
      "query Parquet in browser",
      "Parquet SQL tool",
      "DuckDB WASM Parquet",
      "local Parquet analysis",
    ],
    howTo: true,
    relatedGuideSlugs: [
      "duckdb-wasm-browser-sql",
      "private-local-data-analysis",
      "sql-examples-for-csv-json-parquet",
    ],
    relatedLessonIds: [
      "aggregates-count",
      "aggregates-sum",
      "grouping-group-by",
      "window-functions-running-total",
    ],
    sections: [
      {
        id: "why-parquet",
        title: "Why Parquet works well for analytics",
        blocks: [
          {
            kind: "paragraph",
            text: "Parquet is a columnar file format designed for analytical queries. It stores schema information and is often smaller and faster to scan than equivalent CSV exports.",
          },
          {
            kind: "list",
            items: [
              "Column types are preserved better than in plain text files.",
              "Analytical queries can read only the columns they need.",
              "Parquet is common in data warehouses, lakehouses, and Python/R workflows.",
            ],
          },
        ],
      },
      {
        id: "add-parquet",
        title: "Add a Parquet file",
        blocks: [
          {
            kind: "steps",
            items: [
              "Open the SQL for Files editor.",
              "Add a .parquet file from your device.",
              "Inspect the table and schema in the Database sidebar.",
              "Write SQL against the generated table name.",
            ],
          },
        ],
      },
      {
        id: "inspect-schema",
        title: "Inspect schema before querying",
        blocks: [
          {
            kind: "paragraph",
            text: "Because Parquet stores typed columns, the schema view helps you quickly identify dates, numeric measures, dimensions, booleans, and nested fields.",
          },
          {
            kind: "code",
            code: "SELECT *\nFROM transactions\nLIMIT 25;",
          },
        ],
      },
      {
        id: "aggregate-parquet",
        title: "Run analytical queries",
        blocks: [
          {
            kind: "paragraph",
            text: "Parquet is strongest when you want to summarize large sets of rows by a smaller number of dimensions.",
          },
          {
            kind: "code",
            code: "SELECT\n  date_trunc('month', order_date) AS month,\n  product_category,\n  SUM(revenue) AS revenue\nFROM transactions\nGROUP BY month, product_category\nORDER BY month, revenue DESC;",
          },
        ],
      },
      {
        id: "browser-limits",
        title: "Know the browser memory limits",
        blocks: [
          {
            kind: "paragraph",
            text: "Parquet can be efficient, but SQL for Files still runs inside browser memory. Very large files may hit browser limits earlier than a native DuckDB process or server-side database.",
          },
          {
            kind: "callout",
            title: "Practical guidance",
            text: "Start with focused queries that select only the columns you need, and export aggregated results instead of trying to display millions of rows.",
          },
        ],
      },
    ],
  },
  {
    slug: "sql-examples-for-csv-json-parquet",
    title: "Practical SQL Examples for CSV, JSON, and Parquet Files",
    description:
      "Copy practical SQL examples for filtering, grouping, joining, sorting, and analyzing local CSV, JSON, and Parquet files.",
    summary:
      "A compact collection of SQL patterns you can adapt for local file analysis in SQL for Files.",
    publishedAt: "2026-05-02",
    updatedAt: "2026-05-02",
    category: "SQL examples",
    keywords: [
      "SQL examples",
      "CSV SQL examples",
      "JSON SQL examples",
      "Parquet SQL examples",
    ],
    relatedGuideSlugs: [
      "query-csv-files-with-sql",
      "query-json-files-with-sql",
      "query-parquet-files-in-browser",
    ],
    relatedLessonIds: [
      "intro-first-query",
      "filtering-and-or",
      "grouping-having",
      "joins-inner",
      "dates-filtering",
      "window-functions-row-number",
    ],
    sections: [
      {
        id: "select-preview",
        title: "Preview rows",
        blocks: [
          {
            kind: "paragraph",
            text: "Use a small LIMIT query whenever you start with a new file. It helps confirm table names, column names, and data shape.",
          },
          {
            kind: "code",
            code: "SELECT *\nFROM my_table\nLIMIT 20;",
          },
        ],
      },
      {
        id: "filtering",
        title: "Filter rows",
        blocks: [
          {
            kind: "paragraph",
            text: "WHERE filters rows before grouping or sorting. Combine conditions when you need a precise slice of a file.",
          },
          {
            kind: "code",
            code: "SELECT *\nFROM orders\nWHERE status = 'paid'\n  AND revenue >= 100\n  AND order_date >= DATE '2026-01-01';",
          },
        ],
      },
      {
        id: "grouping",
        title: "Group and aggregate",
        blocks: [
          {
            kind: "paragraph",
            text: "GROUP BY turns many detail rows into summaries. It is useful for totals by region, customer, product, status, or time period.",
          },
          {
            kind: "code",
            code: "SELECT\n  region,\n  COUNT(*) AS rows,\n  SUM(revenue) AS revenue\nFROM orders\nGROUP BY region\nHAVING SUM(revenue) > 10000\nORDER BY revenue DESC;",
          },
        ],
      },
      {
        id: "joins",
        title: "Join related files",
        blocks: [
          {
            kind: "paragraph",
            text: "After adding multiple files, use JOIN to combine detail rows with lookup tables, metadata, or related entities.",
          },
          {
            kind: "code",
            code: "SELECT\n  orders.order_id,\n  customers.customer_name,\n  orders.revenue\nFROM orders\nLEFT JOIN customers\n  ON orders.customer_id = customers.customer_id;",
          },
        ],
      },
      {
        id: "dates",
        title: "Work with dates",
        blocks: [
          {
            kind: "paragraph",
            text: "Date queries help with monthly reporting, retention checks, and time-window analysis.",
          },
          {
            kind: "code",
            code: "SELECT\n  date_trunc('month', order_date) AS month,\n  COUNT(*) AS orders\nFROM orders\nGROUP BY month\nORDER BY month;",
          },
        ],
      },
      {
        id: "window-functions",
        title: "Rank rows with window functions",
        blocks: [
          {
            kind: "paragraph",
            text: "Window functions keep detail rows while calculating ranks, running totals, or comparisons inside groups.",
          },
          {
            kind: "code",
            code: "SELECT\n  customer_id,\n  order_id,\n  revenue,\n  ROW_NUMBER() OVER (\n    PARTITION BY customer_id\n    ORDER BY revenue DESC\n  ) AS revenue_rank\nFROM orders;",
          },
        ],
      },
    ],
  },
  {
    slug: "duckdb-wasm-browser-sql",
    title: "What Is DuckDB WASM and Why Use It for Browser SQL?",
    description:
      "Understand how DuckDB WASM powers local SQL analysis in the browser and why it works well for CSV, JSON, and Parquet files.",
    summary:
      "DuckDB WASM brings an analytical SQL engine into the browser, enabling local file analysis without a server-side database.",
    publishedAt: "2026-05-02",
    updatedAt: "2026-05-02",
    category: "DuckDB WASM",
    keywords: [
      "DuckDB WASM",
      "browser SQL",
      "WebAssembly SQL engine",
      "local data analysis",
    ],
    relatedGuideSlugs: [
      "private-local-data-analysis",
      "query-parquet-files-in-browser",
      "query-csv-files-with-sql",
    ],
    relatedLessonIds: [
      "data-basics-tables",
      "data-basics-types",
      "aggregates-count",
    ],
    sections: [
      {
        id: "duckdb-basics",
        title: "DuckDB in one minute",
        blocks: [
          {
            kind: "paragraph",
            text: "DuckDB is an analytical SQL database designed for local data work. It is especially useful for querying files, running aggregations, and exploring data without setting up a server database.",
          },
        ],
      },
      {
        id: "wasm",
        title: "What WebAssembly changes",
        blocks: [
          {
            kind: "paragraph",
            text: "WebAssembly lets compiled software run inside modern browsers. DuckDB WASM packages DuckDB so SQL queries can run client-side, using browser APIs instead of a remote database service.",
          },
          {
            kind: "list",
            items: [
              "No database server is required for normal file analysis.",
              "Files can be processed locally in the browser session.",
              "The same SQL concepts apply across CSV, JSON, and Parquet inputs.",
            ],
          },
        ],
      },
      {
        id: "how-sql-for-files-uses-it",
        title: "How SQL for Files uses DuckDB WASM",
        blocks: [
          {
            kind: "paragraph",
            text: "SQL for Files uses DuckDB WASM as the local query engine. The interface adds file import, table browsing, a Monaco SQL editor, result display, charts, column classification, and export workflows around that engine.",
          },
        ],
      },
      {
        id: "strengths",
        title: "Where browser SQL works well",
        blocks: [
          {
            kind: "list",
            items: [
              "Quickly inspecting downloaded CSV, JSON, or Parquet files.",
              "Joining a few related files without loading a warehouse.",
              "Learning SQL with realistic file-backed examples.",
              "Filtering sensitive files without uploading them to a third-party tool.",
            ],
          },
        ],
      },
      {
        id: "limits",
        title: "When to use native or server DuckDB instead",
        blocks: [
          {
            kind: "paragraph",
            text: "Browser SQL is convenient, but it is still constrained by browser memory, tab lifecycle, and local device performance. For very large datasets, automated production jobs, or shared multi-user workloads, native DuckDB or a server-side system may be a better fit.",
          },
        ],
      },
    ],
  },
  {
    slug: "private-local-data-analysis",
    title: "Private Local Data Analysis in the Browser",
    description:
      "Learn how SQL for Files keeps file analysis local in your browser, what is stored locally, and what privacy tradeoffs still matter.",
    summary:
      "Understand the local processing model behind SQL for Files and how to work safely with sensitive CSV, JSON, and Parquet files.",
    publishedAt: "2026-05-02",
    updatedAt: "2026-05-02",
    category: "Privacy",
    keywords: [
      "private data analysis",
      "local browser data analysis",
      "SQL without upload",
      "private CSV analysis",
    ],
    relatedGuideSlugs: [
      "duckdb-wasm-browser-sql",
      "query-csv-files-with-sql",
      "query-json-files-with-sql",
    ],
    relatedLessonIds: [
      "data-basics-null",
      "filtering-where",
      "joins-left",
    ],
    sections: [
      {
        id: "local-model",
        title: "The local processing model",
        blocks: [
          {
            kind: "paragraph",
            text: "SQL for Files is built around client-side processing. Files are loaded into DuckDB WASM in your browser, SQL runs locally, and query results are rendered locally in the page.",
          },
          {
            kind: "callout",
            title: "Core privacy claim",
            text: "The app does not upload your files, SQL queries, or query result rows to a backend service for processing.",
          },
        ],
      },
      {
        id: "what-stays-local",
        title: "What stays local",
        blocks: [
          {
            kind: "list",
            items: [
              "Added CSV, JSON, and Parquet file contents.",
              "Tables created inside the browser DuckDB session.",
              "Query text and query history stored by the app.",
              "Saved table data when you choose local persistence.",
            ],
          },
        ],
      },
      {
        id: "browser-storage",
        title: "Browser storage and persistence",
        blocks: [
          {
            kind: "paragraph",
            text: "When persistence is used, data is stored in browser storage such as IndexedDB. That is useful for continuing later, but it also means anyone with access to the same browser profile may be able to access saved work.",
          },
          {
            kind: "paragraph",
            text: "Use export/import backups when you want to move work between browsers, and clear browser storage if you do not want data retained on the device.",
          },
        ],
      },
      {
        id: "sensitive-data-checklist",
        title: "Sensitive data checklist",
        blocks: [
          {
            kind: "list",
            items: [
              "Use a trusted device and browser profile.",
              "Avoid shared computers for confidential files.",
              "Clear local data after one-off sensitive analysis.",
              "Review exports before sending them elsewhere.",
              "Prefer aggregated results when sharing outputs with others.",
            ],
          },
        ],
      },
      {
        id: "what-local-does-not-solve",
        title: "What local processing does not solve",
        blocks: [
          {
            kind: "paragraph",
            text: "Local processing reduces upload risk, but it does not replace device security, browser profile hygiene, file access controls, or organizational data handling policies. Treat the browser as part of your local workstation security boundary.",
          },
        ],
      },
    ],
  },
];

export function guidePath(slug: string): string {
  return `/guides/${slug}`;
}

export function guideBySlug(slug: string): Guide | undefined {
  return guides.find((guide) => guide.slug === slug);
}
