import type { Guide } from "../types/guides";

export const guides: Guide[] = [
  {
    slug: "introduction-to-sql-select-columns-aliases-sorting",
    title: "Introduction to SQL: SELECT, Columns, Aliases, and Sorting Results",
    description:
      "Learn the first SQL commands beginners need: SELECT all rows, choose specific columns, rename results with aliases, and sort rows with ORDER BY.",
    summary:
      "Your first SQL queries do not need to be complicated. Start with SELECT, choose the columns you need, name results clearly, and sort rows intentionally.",
    publishedAt: "2026-05-09",
    updatedAt: "2026-05-09",
    category: "Learn SQL",
    keywords: [
      "introduction to SQL",
      "SQL SELECT tutorial",
      "SQL aliases explained",
      "SQL ORDER BY beginners",
    ],
    relatedGuideSlugs: [
      "what-is-a-database-table",
      "sql-data-types-explained",
      "query-csv-files-with-sql",
    ],
    relatedLessonIds: [
      "intro-first-query",
      "intro-select-columns",
      "intro-aliases",
      "intro-order-by",
    ],
    sections: [
      {
        id: "first-queries-should-feel-small",
        title: "Your first SQL queries should feel small",
        blocks: [
          {
            kind: "paragraph",
            text: "SQL can eventually join tables, calculate rankings, reshape nested data, and summarize millions of rows. But the first chapter of real SQL practice should feel much smaller: ask for rows, choose columns, name results clearly, and sort the output.",
          },
          {
            kind: "paragraph",
            text: "SQL for Files is designed for that kind of practice. You can open the browser app, load guided sample data or your own CSV, JSON, and Parquet files, and run SQL locally with DuckDB WASM. There is no database server to configure before writing your first query.",
          },
          {
            kind: "callout",
            title: "Chapter focus",
            text: "The Introduction to SQL chapter covers SELECT, selecting columns, aliases, and ORDER BY using a small employees table.",
          },
        ],
      },
      {
        id: "select-all-rows",
        title: "Start with SELECT * to see the table",
        blocks: [
          {
            kind: "paragraph",
            text: "The most fundamental SQL statement is SELECT. When you are exploring a table for the first time, SELECT * is a useful way to inspect every column and every row in a small sample table.",
          },
          {
            kind: "code",
            code: "SELECT *\nFROM employees;",
          },
          {
            kind: "paragraph",
            text: "The asterisk means all columns. This is not always what you want in production analysis, but it is a clear starting point when you are learning what a table contains.",
          },
        ],
      },
      {
        id: "choose-specific-columns",
        title: "Choose only the columns you need",
        blocks: [
          {
            kind: "paragraph",
            text: "Once you know the shape of the table, the next step is to request only the columns that matter. This makes your query easier to read and keeps your result focused.",
          },
          {
            kind: "code",
            code: "SELECT name, department\nFROM employees;",
          },
          {
            kind: "list",
            items: [
              "Selecting specific columns makes your intent clear.",
              "It avoids returning data you do not need.",
              "It prepares you for larger real-world tables with many columns.",
            ],
          },
        ],
      },
      {
        id: "name-results-with-aliases",
        title: "Use aliases to make results readable",
        blocks: [
          {
            kind: "paragraph",
            text: "Aliases let you give query results clearer temporary names. The table itself does not change. Only the output of that query uses the alias.",
          },
          {
            kind: "code",
            code: "SELECT\n  name AS employee_name,\n  salary AS annual_salary\nFROM employees;",
          },
          {
            kind: "paragraph",
            text: "Aliases become especially helpful when you calculate new values or write longer queries. A name like annual_bonus is much easier to understand than an unnamed expression such as salary * 0.10.",
          },
        ],
      },
      {
        id: "sort-with-order-by",
        title: "Sort intentionally with ORDER BY",
        blocks: [
          {
            kind: "paragraph",
            text: "SQL does not guarantee a meaningful row order unless you ask for one. ORDER BY tells SQL how the result should be sorted.",
          },
          {
            kind: "code",
            code: "SELECT name, salary\nFROM employees\nORDER BY salary DESC;",
          },
          {
            kind: "paragraph",
            text: "Use ASC for ascending order and DESC for descending order. You can also sort by more than one column, such as department first and name second.",
          },
          {
            kind: "code",
            code: "SELECT name, department, salary\nFROM employees\nORDER BY department, name;",
          },
        ],
      },
      {
        id: "practice-the-chapter",
        title: "Practice the full Introduction to SQL chapter",
        blocks: [
          {
            kind: "paragraph",
            text: "The second Learn SQL chapter in SQL for Files turns these ideas into short hands-on exercises. You load a small employees table, run your first SELECT query, pick individual columns, rename output columns, and sort the result set.",
          },
          {
            kind: "steps",
            items: [
              "Start with Your First Query to retrieve every row and column.",
              "Continue to Selecting Columns to focus the result.",
              "Use Naming Results with Aliases to make output easier to read.",
              "Finish with Sorting Results to control row order with ORDER BY.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "sql-where-filtering-data",
    title: "SQL WHERE Clause Explained: Filtering Rows with AND, OR, and LIKE",
    description:
      "Learn how SQL WHERE filters rows, how to combine conditions with AND and OR, and how LIKE finds text patterns in real tables.",
    summary:
      "Filtering is where SQL starts to feel useful: keep only the rows that answer your question, then combine conditions as your questions get sharper.",
    publishedAt: "2026-05-09",
    updatedAt: "2026-05-09",
    category: "Learn SQL",
    keywords: [
      "SQL WHERE clause",
      "SQL AND OR examples",
      "SQL LIKE pattern matching",
      "filter rows SQL",
    ],
    relatedGuideSlugs: [
      "introduction-to-sql-select-columns-aliases-sorting",
      "sql-null-missing-values",
      "query-csv-files-with-sql",
    ],
    relatedLessonIds: [
      "filtering-where",
      "filtering-and-or",
      "filtering-like",
    ],
    sections: [
      {
        id: "filtering-turns-tables-into-answers",
        title: "Filtering turns tables into answers",
        blocks: [
          {
            kind: "paragraph",
            text: "A SELECT query can show you a table. A WHERE clause turns that table into an answer. Instead of reading every row, you tell SQL which rows matter for the question in front of you.",
          },
          {
            kind: "paragraph",
            text: "SQL for Files lets you practice this in the browser with guided lessons or your own CSV, JSON, and Parquet files. Queries run locally with DuckDB WASM, so you can learn filtering without setting up a database server.",
          },
        ],
      },
      {
        id: "where-keeps-matching-rows",
        title: "WHERE keeps rows that match a condition",
        blocks: [
          {
            kind: "paragraph",
            text: "The WHERE clause checks each row against a condition. Rows that pass stay in the result. Rows that do not pass are left out.",
          },
          {
            kind: "code",
            code: "SELECT *\nFROM employees\nWHERE salary > 80000;",
          },
          {
            kind: "paragraph",
            text: "Comparison operators like equals, not equals, greater than, and less than are the building blocks of row-level filtering.",
          },
        ],
      },
      {
        id: "combine-conditions",
        title: "Combine conditions with AND and OR",
        blocks: [
          {
            kind: "paragraph",
            text: "Real questions often need more than one condition. AND means every condition must be true. OR means at least one condition must be true.",
          },
          {
            kind: "code",
            code: "SELECT *\nFROM employees\nWHERE department = 'Marketing'\n  AND salary > 70000;",
          },
          {
            kind: "callout",
            title: "Use parentheses when mixing AND and OR",
            text: "Parentheses make your intended logic obvious and prevent subtle mistakes when multiple conditions are combined.",
          },
        ],
      },
      {
        id: "find-text-patterns",
        title: "Find text patterns with LIKE",
        blocks: [
          {
            kind: "paragraph",
            text: "LIKE searches text using patterns. The percent sign matches any sequence of characters, while the underscore matches exactly one character.",
          },
          {
            kind: "code",
            code: "SELECT name\nFROM employees\nWHERE name LIKE '%li%'\nORDER BY name;",
          },
          {
            kind: "paragraph",
            text: "In DuckDB, LIKE is case-sensitive and ILIKE is available when you want case-insensitive matching.",
          },
        ],
      },
      {
        id: "practice-filtering",
        title: "Practice the Filtering Data chapter",
        blocks: [
          {
            kind: "steps",
            items: [
              "Start with WHERE Clause Basics to filter salary and department rows.",
              "Use Combining Conditions to practice AND, OR, and parentheses.",
              "Finish with Pattern Matching with LIKE to search text values.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "sql-aggregate-functions-count-sum-min-max-avg",
    title: "SQL Aggregate Functions: COUNT, SUM, MIN, MAX, and AVG Explained",
    description:
      "Learn how SQL aggregate functions summarize rows with COUNT, SUM, MIN, MAX, and AVG, including examples for beginner reporting queries.",
    summary:
      "Aggregate functions turn many rows into useful summary values, which is the foundation of reporting, dashboards, and quick data checks.",
    publishedAt: "2026-05-09",
    updatedAt: "2026-05-09",
    category: "Learn SQL",
    keywords: [
      "SQL aggregate functions",
      "SQL COUNT SUM AVG",
      "SQL MIN MAX examples",
      "SQL summary query",
    ],
    relatedGuideSlugs: [
      "sql-where-filtering-data",
      "sql-distinct-group-by-having",
      "sql-examples-for-csv-json-parquet",
    ],
    relatedLessonIds: [
      "aggregates-count",
      "aggregates-sum",
      "aggregates-count-and-sum",
      "aggregates-min",
      "aggregates-max",
      "aggregates-avg",
      "aggregates-min-max-avg",
    ],
    sections: [
      {
        id: "summaries-are-the-first-reports",
        title: "Summaries are the first reports",
        blocks: [
          {
            kind: "paragraph",
            text: "A table can contain hundreds, thousands, or millions of rows. Aggregate functions help you compress those rows into numbers you can understand quickly: counts, totals, extremes, and averages.",
          },
          {
            kind: "paragraph",
            text: "In SQL for Files, you can practice aggregates on sample sales data or run the same ideas against local files in your browser with DuckDB WASM.",
          },
        ],
      },
      {
        id: "count-and-sum",
        title: "COUNT and SUM answer how many and how much",
        blocks: [
          {
            kind: "paragraph",
            text: "COUNT tells you how many rows match a question. SUM adds numeric values such as revenue, quantity, or cost.",
          },
          {
            kind: "code",
            code: "SELECT\n  COUNT(*) AS sale_count,\n  SUM(amount) AS total_amount\nFROM sales\nWHERE region = 'West';",
          },
          {
            kind: "callout",
            title: "COUNT(*) vs COUNT(column)",
            text: "COUNT(*) counts rows. COUNT(column_name) counts rows where that column is not NULL.",
          },
        ],
      },
      {
        id: "min-max-and-avg",
        title: "MIN, MAX, and AVG describe the spread",
        blocks: [
          {
            kind: "paragraph",
            text: "MIN finds the smallest value, MAX finds the largest value, and AVG calculates the mean. Together, they give you a quick profile of a numeric column.",
          },
          {
            kind: "code",
            code: "SELECT\n  MIN(amount) AS smallest_sale,\n  MAX(amount) AS largest_sale,\n  AVG(amount) AS average_sale\nFROM sales;",
          },
        ],
      },
      {
        id: "aggregates-return-fewer-rows",
        title: "Aggregates usually return fewer rows",
        blocks: [
          {
            kind: "paragraph",
            text: "A plain aggregate query without GROUP BY usually returns one row. That one row represents a summary of all matching rows after WHERE filtering has been applied.",
          },
          {
            kind: "paragraph",
            text: "This is why aggregates are so useful for dashboards: one query can return the headline numbers your reader needs first.",
          },
        ],
      },
      {
        id: "practice-aggregates",
        title: "Practice the Simple Aggregates chapter",
        blocks: [
          {
            kind: "steps",
            items: [
              "Use COUNT to count matching rows.",
              "Use SUM to total sales amounts.",
              "Combine COUNT and SUM for compact reporting.",
              "Finish with MIN, MAX, and AVG to profile values.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "sql-distinct-group-by-having",
    title: "SQL DISTINCT, GROUP BY, and HAVING: From Unique Values to Grouped Reports",
    description:
      "Learn how DISTINCT removes duplicates, GROUP BY summarizes rows by category, and HAVING filters grouped aggregate results.",
    summary:
      "DISTINCT cleans up repeated values, GROUP BY creates summaries per category, and HAVING filters those summaries after aggregation.",
    publishedAt: "2026-05-09",
    updatedAt: "2026-05-09",
    category: "Learn SQL",
    keywords: [
      "SQL DISTINCT",
      "SQL GROUP BY tutorial",
      "SQL HAVING clause",
      "grouped SQL reports",
    ],
    relatedGuideSlugs: [
      "sql-aggregate-functions-count-sum-min-max-avg",
      "sql-execution-order-explained",
      "query-csv-files-with-sql",
    ],
    relatedLessonIds: [
      "grouping-distinct",
      "grouping-group-by",
      "grouping-having",
    ],
    sections: [
      {
        id: "from-rows-to-categories",
        title: "From rows to categories",
        blocks: [
          {
            kind: "paragraph",
            text: "After you learn aggregate functions, the next step is asking for summaries by category: totals by region, counts by status, averages by department, and so on.",
          },
          {
            kind: "paragraph",
            text: "SQL for Files helps you practice these reporting patterns locally in the browser before applying them to your own CSV, JSON, or Parquet files.",
          },
        ],
      },
      {
        id: "distinct-removes-duplicates",
        title: "DISTINCT removes duplicate result rows",
        blocks: [
          {
            kind: "paragraph",
            text: "DISTINCT is useful when you want a clean list of unique values, such as every region that appears in a sales table.",
          },
          {
            kind: "code",
            code: "SELECT DISTINCT region\nFROM sales\nORDER BY region;",
          },
          {
            kind: "callout",
            title: "DISTINCT applies to the full selected row",
            text: "SELECT DISTINCT salesperson, region returns unique salesperson-region pairs, not just unique salespeople.",
          },
        ],
      },
      {
        id: "group-by-summarizes",
        title: "GROUP BY summarizes one group at a time",
        blocks: [
          {
            kind: "paragraph",
            text: "GROUP BY collects rows into groups before aggregate functions run. Instead of one total for the whole table, you get one total per group.",
          },
          {
            kind: "code",
            code: "SELECT region, SUM(amount) AS total_amount\nFROM sales\nGROUP BY region\nORDER BY total_amount DESC;",
          },
        ],
      },
      {
        id: "having-filters-groups",
        title: "HAVING filters after aggregation",
        blocks: [
          {
            kind: "paragraph",
            text: "WHERE filters individual rows before grouping. HAVING filters the grouped results after aggregate values exist.",
          },
          {
            kind: "code",
            code: "SELECT salesperson, COUNT(*) AS sale_count\nFROM sales\nGROUP BY salesperson\nHAVING COUNT(*) > 1;",
          },
        ],
      },
      {
        id: "practice-grouping",
        title: "Practice the DISTINCT and GROUP BY chapter",
        blocks: [
          {
            kind: "steps",
            items: [
              "Use DISTINCT to remove duplicate values.",
              "Use GROUP BY to summarize sales by region.",
              "Use HAVING to keep only groups that match aggregate conditions.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "sql-date-queries-date-ranges-extract-date-diff",
    title: "SQL Date Queries: Date Ranges, EXTRACT, and DATE_DIFF Explained",
    description:
      "Learn practical SQL date query patterns for filtering date ranges, extracting date parts, and measuring time between dates.",
    summary:
      "Date queries become much easier when you filter with clear ranges, extract useful parts, and calculate durations directly in SQL.",
    publishedAt: "2026-05-09",
    updatedAt: "2026-05-09",
    category: "Learn SQL",
    keywords: [
      "SQL date queries",
      "SQL date range filter",
      "SQL EXTRACT date",
      "DuckDB DATE_DIFF",
    ],
    relatedGuideSlugs: [
      "sql-where-filtering-data",
      "sql-distinct-group-by-having",
      "sql-examples-for-csv-json-parquet",
    ],
    relatedLessonIds: [
      "dates-filtering",
      "dates-extract",
      "dates-date-diff",
    ],
    sections: [
      {
        id: "dates-are-analysis-questions",
        title: "Dates turn rows into timelines",
        blocks: [
          {
            kind: "paragraph",
            text: "Dates answer some of the most common business questions: what happened this month, how long did shipping take, and how many orders arrived each week? SQL can answer those questions directly when date columns are treated as dates.",
          },
          {
            kind: "paragraph",
            text: "In SQL for Files, you can practice date queries in the browser using guided order data or your own local files with DuckDB WASM.",
          },
        ],
      },
      {
        id: "filter-date-ranges",
        title: "Filter date ranges with an exclusive upper bound",
        blocks: [
          {
            kind: "paragraph",
            text: "For month ranges, a lower bound plus an exclusive upper bound is often safer than BETWEEN, especially when timestamp values enter the picture.",
          },
          {
            kind: "code",
            code: "SELECT order_id, order_date\nFROM orders\nWHERE order_date >= DATE '2024-02-01'\n  AND order_date < DATE '2024-03-01';",
          },
        ],
      },
      {
        id: "extract-date-parts",
        title: "Extract parts of a date",
        blocks: [
          {
            kind: "paragraph",
            text: "EXTRACT pulls out useful pieces like month, year, quarter, or day. This is helpful for grouped reports and quick checks.",
          },
          {
            kind: "code",
            code: "SELECT EXTRACT(MONTH FROM order_date) AS order_month, COUNT(*) AS order_count\nFROM orders\nGROUP BY EXTRACT(MONTH FROM order_date)\nORDER BY order_month;",
          },
          {
            kind: "callout",
            title: "Watch out for month-only grouping",
            text: "Month number alone mixes January from every year. For real reports, DATE_TRUNC can keep year and month together.",
          },
        ],
      },
      {
        id: "measure-duration",
        title: "Measure duration with DATE_DIFF",
        blocks: [
          {
            kind: "paragraph",
            text: "DATE_DIFF measures the distance between two dates. That makes it useful for shipping time, lead time, overdue tasks, retention, and subscription length.",
          },
          {
            kind: "code",
            code: "SELECT order_id, DATE_DIFF('day', order_date, ship_date) AS days_to_ship\nFROM orders\nORDER BY order_id;",
          },
        ],
      },
      {
        id: "practice-dates",
        title: "Practice the Working with Dates chapter",
        blocks: [
          {
            kind: "steps",
            items: [
              "Filter February orders with a precise date range.",
              "Extract month values to build monthly counts.",
              "Use DATE_DIFF to calculate days between order and shipment.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "sql-joins-explained-inner-left-full-self-cross",
    title: "SQL JOINs Explained: INNER, LEFT, FULL OUTER, SELF, and CROSS JOIN",
    description:
      "Learn why SQL JOINs exist and how INNER JOIN, LEFT JOIN, FULL OUTER JOIN, SELF JOIN, and CROSS JOIN combine related tables.",
    summary:
      "JOINs bring related tables back together: matched rows, missing matches, hierarchies, and all-combination grids all use different JOIN patterns.",
    publishedAt: "2026-05-09",
    updatedAt: "2026-05-09",
    category: "Learn SQL",
    keywords: [
      "SQL joins explained",
      "INNER JOIN LEFT JOIN",
      "FULL OUTER JOIN SQL",
      "SELF JOIN CROSS JOIN",
    ],
    relatedGuideSlugs: [
      "database-normalization-explained",
      "sql-null-missing-values",
      "sql-examples-for-csv-json-parquet",
    ],
    relatedLessonIds: [
      "joins-why",
      "joins-inner",
      "joins-left",
      "joins-find-missing",
      "joins-full-outer",
      "joins-self",
      "joins-cross",
    ],
    sections: [
      {
        id: "joins-reconnect-related-facts",
        title: "JOINs reconnect related facts",
        blocks: [
          {
            kind: "paragraph",
            text: "Normalized data often stores related facts in separate tables. Employees can live in one table, departments in another, and orders in another. JOINs let you bring those facts together when you query.",
          },
          {
            kind: "paragraph",
            text: "SQL for Files lets you practice JOINs in the browser with sample tables before trying the same patterns on your own local files.",
          },
        ],
      },
      {
        id: "inner-join-matches",
        title: "INNER JOIN keeps matching rows",
        blocks: [
          {
            kind: "paragraph",
            text: "INNER JOIN returns rows where the join condition matches on both sides. If an employee has no matching department, that employee is excluded.",
          },
          {
            kind: "code",
            code: "SELECT e.name AS employee_name, d.name AS department_name\nFROM employees AS e\nINNER JOIN departments AS d\n  ON e.department_id = d.id;",
          },
        ],
      },
      {
        id: "left-and-full-joins",
        title: "LEFT and FULL OUTER JOIN keep unmatched rows",
        blocks: [
          {
            kind: "paragraph",
            text: "LEFT JOIN keeps every row from the left table and uses NULL when the right side has no match. FULL OUTER JOIN keeps unmatched rows from both sides.",
          },
          {
            kind: "code",
            code: "SELECT d.name AS department_name, e.name AS employee_name\nFROM departments AS d\nLEFT JOIN employees AS e\n  ON d.id = e.department_id;",
          },
          {
            kind: "callout",
            title: "Finding missing matches",
            text: "LEFT JOIN plus WHERE right_table.id IS NULL is a classic pattern for finding gaps in related data.",
          },
        ],
      },
      {
        id: "self-and-cross-joins",
        title: "SELF JOIN and CROSS JOIN solve special shapes",
        blocks: [
          {
            kind: "paragraph",
            text: "A SELF JOIN connects rows in a table to other rows in the same table, such as employees to managers. A CROSS JOIN creates every possible combination between two tables, such as departments and meeting days.",
          },
          {
            kind: "code",
            code: "SELECT e.name AS employee_name, m.name AS manager_name\nFROM employees AS e\nLEFT JOIN employees AS m\n  ON e.manager_id = m.id;",
          },
        ],
      },
      {
        id: "practice-joins",
        title: "Practice the JOIN Types chapter",
        blocks: [
          {
            kind: "steps",
            items: [
              "Start with why JOINs exist and how keys connect tables.",
              "Use INNER JOIN for matching rows and LEFT JOIN for preserving one side.",
              "Find missing matches with LEFT JOIN and IS NULL.",
              "Finish with FULL OUTER, SELF, and CROSS JOIN patterns.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "sql-window-functions-over-partition-running-total",
    title: "SQL Window Functions Explained: OVER, PARTITION BY, Running Totals, and LAG",
    description:
      "Learn how SQL window functions add totals, rankings, running totals, and previous-row comparisons without collapsing detail rows.",
    summary:
      "Window functions add context beside each row: totals, group totals, ranks, running totals, and previous values without losing detail.",
    publishedAt: "2026-05-09",
    updatedAt: "2026-05-09",
    category: "Learn SQL",
    keywords: [
      "SQL window functions",
      "SQL OVER PARTITION BY",
      "SQL running total",
      "SQL LAG ROW_NUMBER",
    ],
    relatedGuideSlugs: [
      "sql-aggregate-functions-count-sum-min-max-avg",
      "sql-execution-order-explained",
      "sql-examples-for-csv-json-parquet",
    ],
    relatedLessonIds: [
      "window-functions-over",
      "window-functions-partition",
      "window-functions-running-total",
      "window-functions-row-number",
      "window-functions-lag",
      "window-functions-common-functions",
    ],
    sections: [
      {
        id: "detail-with-context",
        title: "Window functions keep detail and add context",
        blocks: [
          {
            kind: "paragraph",
            text: "GROUP BY summarizes rows and collapses detail. Window functions are different: they keep every detail row visible and add calculations beside it.",
          },
          {
            kind: "paragraph",
            text: "In SQL for Files, you can practice these patterns on sample sales data and then reuse them on local files in your browser with DuckDB WASM.",
          },
        ],
      },
      {
        id: "over-and-partition",
        title: "OVER defines the window",
        blocks: [
          {
            kind: "paragraph",
            text: "OVER () means the whole result set is the calculation window. PARTITION BY splits that window into smaller groups, such as one window per region.",
          },
          {
            kind: "code",
            code: "SELECT id, region, amount,\n  SUM(amount) OVER (PARTITION BY region) AS region_total\nFROM sales_2;",
          },
        ],
      },
      {
        id: "running-total-and-ranking",
        title: "ORDER BY enables running totals and rankings",
        blocks: [
          {
            kind: "paragraph",
            text: "ORDER BY inside a window makes row sequence matter. That is how you build running totals, rankings, and time-based comparisons.",
          },
          {
            kind: "code",
            code: "SELECT salesperson, sale_date, amount,\n  SUM(amount) OVER (\n    PARTITION BY salesperson\n    ORDER BY sale_date\n    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\n  ) AS running_amount\nFROM sales_2;",
          },
        ],
      },
      {
        id: "row-number-and-lag",
        title: "ROW_NUMBER and LAG answer practical questions",
        blocks: [
          {
            kind: "paragraph",
            text: "ROW_NUMBER ranks rows inside each group. LAG looks backward to a previous row. Together, they support top-N queries, deduplication, and change-over-time analysis.",
          },
          {
            kind: "code",
            code: "SELECT salesperson, sale_date, amount,\n  LAG(amount) OVER (PARTITION BY salesperson ORDER BY sale_date) AS previous_amount\nFROM sales_2;",
          },
        ],
      },
      {
        id: "practice-window-functions",
        title: "Practice the Window Functions chapter",
        blocks: [
          {
            kind: "steps",
            items: [
              "Use OVER () to add a company-wide total beside each row.",
              "Use PARTITION BY for region-specific totals.",
              "Add ORDER BY and a frame for running totals.",
              "Practice ROW_NUMBER, LAG, and other common window functions.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "sql-execution-order-explained",
    title: "SQL Execution Order Explained: Why WHERE, GROUP BY, HAVING, SELECT, and LIMIT Behave Differently",
    description:
      "Learn SQL logical execution order and why FROM, JOIN, WHERE, GROUP BY, HAVING, window functions, SELECT, ORDER BY, and LIMIT behave the way they do.",
    summary:
      "SQL is written in one order but understood in another; learning the logical order explains many beginner surprises.",
    publishedAt: "2026-05-09",
    updatedAt: "2026-05-09",
    category: "Learn SQL",
    keywords: [
      "SQL execution order",
      "SQL logical order",
      "WHERE before GROUP BY",
      "SQL HAVING SELECT ORDER BY",
    ],
    relatedGuideSlugs: [
      "sql-distinct-group-by-having",
      "sql-window-functions-over-partition-running-total",
      "sql-where-filtering-data",
    ],
    relatedLessonIds: [
      "execution-order-logical-order",
      "execution-order-from-join-where",
      "execution-order-where-before-group-by",
      "execution-order-having-after-group-by",
      "execution-order-window-functions",
      "execution-order-window-functions-not-in-where",
      "execution-order-select-alias-order-by",
      "execution-order-limit-last",
    ],
    sections: [
      {
        id: "written-order-is-not-logical-order",
        title: "SQL is written one way and reasoned about another way",
        blocks: [
          {
            kind: "paragraph",
            text: "SQL queries are written for humans, but the logical steps happen in a different order. Once you learn that order, confusing behavior starts to make sense.",
          },
          {
            kind: "paragraph",
            text: "SQL for Files gives you guided exercises that make this visible with small tables before you apply the same reasoning to your own data files.",
          },
        ],
      },
      {
        id: "logical-order-model",
        title: "A useful logical order model",
        blocks: [
          {
            kind: "code",
            code: "FROM\nJOIN\nWHERE\nGROUP BY\nHAVING\nWINDOW FUNCTIONS\nSELECT\nDISTINCT\nORDER BY\nLIMIT",
          },
          {
            kind: "paragraph",
            text: "Real engines optimize internally, but this teaching model explains most SQL rules and error messages.",
          },
        ],
      },
      {
        id: "where-group-by-having",
        title: "WHERE, GROUP BY, and HAVING happen at different times",
        blocks: [
          {
            kind: "paragraph",
            text: "WHERE filters individual rows before grouping. GROUP BY forms summary groups. HAVING filters those groups after aggregate values have been calculated.",
          },
          {
            kind: "code",
            code: "SELECT region, SUM(amount) AS total_amount\nFROM sales\nGROUP BY region\nHAVING SUM(amount) > 2000;",
          },
        ],
      },
      {
        id: "windows-aliases-and-limit",
        title: "Window functions, aliases, and LIMIT make more sense late in the order",
        blocks: [
          {
            kind: "paragraph",
            text: "Window functions run after filtering and grouping, which is why you often need a subquery to filter on a window result. SELECT aliases are visible to ORDER BY because ORDER BY happens later. LIMIT cuts down the final result at the end.",
          },
          {
            kind: "code",
            code: "SELECT name, salary * 0.10 AS annual_bonus\nFROM employees\nORDER BY annual_bonus DESC\nLIMIT 5;",
          },
        ],
      },
      {
        id: "practice-execution-order",
        title: "Practice the Execution Order chapter",
        blocks: [
          {
            kind: "steps",
            items: [
              "Read queries in logical order, not only written order.",
              "Practice how JOINs build rows before WHERE filters them.",
              "Compare WHERE and HAVING with grouped results.",
              "Use subqueries for filtering window function results.",
              "Finish by seeing why ORDER BY can use SELECT aliases and LIMIT happens last.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "database-normalization-explained",
    title: "Database Normalization Explained: Why Clean Tables Need Keys, JOINs, and Normal Forms",
    description:
      "Learn database normalization, update anomalies, first normal form, good schema design, and why normalized tables are joined back together in SQL.",
    summary:
      "Normalization keeps each fact in the right place, reducing duplicated data and making updates, inserts, and deletes safer.",
    publishedAt: "2026-05-09",
    updatedAt: "2026-05-09",
    category: "Learn SQL",
    keywords: [
      "database normalization explained",
      "first normal form SQL",
      "update anomaly database",
      "normalized schema joins",
    ],
    relatedGuideSlugs: [
      "sql-joins-explained-inner-left-full-self-cross",
      "what-is-a-database-table",
      "sql-null-missing-values",
    ],
    relatedLessonIds: [
      "normalization-why",
      "normalization-update-anomaly",
      "normalization-update-solved",
      "normalization-bad-1nf",
      "normalization-good-1nf",
      "normalization-delete-anomaly",
      "normalization-insert-delete-solved",
      "normalization-first-second-third",
      "normalization-why-we-build-in-nf",
    ],
    sections: [
      {
        id: "normalization-is-about-trust",
        title: "Normalization is about keeping data trustworthy",
        blocks: [
          {
            kind: "paragraph",
            text: "Normalization is the process of splitting data into related tables so each fact is stored in the right place only once. It is less about theory and more about avoiding contradictory copies of the same fact.",
          },
          {
            kind: "paragraph",
            text: "SQL for Files teaches normalization with small examples that make duplication, anomalies, keys, and JOINs easier to see.",
          },
        ],
      },
      {
        id: "flat-tables-create-anomalies",
        title: "Flat tables create update, insert, and delete anomalies",
        blocks: [
          {
            kind: "paragraph",
            text: "If customer details are copied into every order row, one customer move can require many updates. If product facts only exist inside order rows, deleting an order might accidentally erase the only copy of a product fact.",
          },
          {
            kind: "list",
            items: [
              "Update anomaly: changing one real-world fact requires many row updates.",
              "Insert anomaly: you cannot add a fact until another fact exists.",
              "Delete anomaly: deleting one row accidentally removes information you still need.",
            ],
          },
        ],
      },
      {
        id: "normal-forms",
        title: "1NF, 2NF, and 3NF are practical design habits",
        blocks: [
          {
            kind: "paragraph",
            text: "First normal form avoids packed lists. Second normal form keeps non-key facts dependent on the whole key. Third normal form avoids non-key facts depending on other non-key facts.",
          },
          {
            kind: "code",
            code: "customers(id, name, email)\nproducts(id, name, price)\norders(id, customer_id, order_date)\norder_items(order_id, product_id, quantity)",
          },
        ],
      },
      {
        id: "joins-are-the-payoff",
        title: "JOINs are the payoff of normalization",
        blocks: [
          {
            kind: "paragraph",
            text: "Normalized tables are cleaner, but related data is split apart. JOINs bring it back together when you need a readable result or report.",
          },
          {
            kind: "callout",
            title: "Start normalized, denormalize intentionally",
            text: "Analytics systems sometimes denormalize for speed or convenience, but a normalized model is the safer default for correctness.",
          },
        ],
      },
      {
        id: "practice-normalization",
        title: "Practice the Normalization chapter",
        blocks: [
          {
            kind: "steps",
            items: [
              "Feel update and delete anomalies in a flat orders table.",
              "Compare the same questions in a normalized schema.",
              "See why packed lists break first normal form.",
              "Finish with 1NF, 2NF, 3NF, and why teams build this way.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "sql-grouping-sets-rollup-cube",
    title: "SQL GROUPING SETS, ROLLUP, and CUBE Explained for Subtotals and Grand Totals",
    description:
      "Learn how SQL GROUPING SETS, ROLLUP, and CUBE create multi-dimensional totals, subtotals, and grand totals in one query.",
    summary:
      "GROUPING SETS, ROLLUP, and CUBE help you build subtotal reports without stitching together many UNION ALL queries.",
    publishedAt: "2026-05-09",
    updatedAt: "2026-05-09",
    category: "Learn SQL",
    keywords: [
      "SQL GROUPING SETS",
      "SQL ROLLUP",
      "SQL CUBE",
      "SQL subtotals grand total",
    ],
    relatedGuideSlugs: [
      "sql-distinct-group-by-having",
      "sql-aggregate-functions-count-sum-min-max-avg",
      "sql-examples-for-csv-json-parquet",
    ],
    relatedLessonIds: [
      "grouping-sets-basics",
      "grouping-sets-rollup",
      "grouping-sets-cube",
    ],
    sections: [
      {
        id: "subtotal-reports-need-many-levels",
        title: "Subtotal reports need more than one grouping level",
        blocks: [
          {
            kind: "paragraph",
            text: "Standard GROUP BY gives you one grouping level. Real reports often need detail totals, subtotals, totals by another dimension, and a grand total. GROUPING SETS, ROLLUP, and CUBE make that possible in one query.",
          },
          {
            kind: "paragraph",
            text: "SQL for Files uses small revenue examples so you can see exactly which rows each advanced grouping feature creates.",
          },
        ],
      },
      {
        id: "grouping-sets-choose-levels",
        title: "GROUPING SETS lets you choose exact grouping levels",
        blocks: [
          {
            kind: "paragraph",
            text: "GROUPING SETS lists the exact group combinations you want. The empty grouping set means the grand total.",
          },
          {
            kind: "code",
            code: "SELECT region, product, SUM(amount) AS total_amount\nFROM revenue\nGROUP BY GROUPING SETS ((region), (product), ());",
          },
        ],
      },
      {
        id: "rollup-hierarchical-totals",
        title: "ROLLUP creates hierarchical totals",
        blocks: [
          {
            kind: "paragraph",
            text: "ROLLUP is shorthand for detail rows, progressively broader subtotals, and a grand total. It is ideal when your dimensions have a natural hierarchy.",
          },
          {
            kind: "code",
            code: "SELECT region, product, SUM(amount) AS total_amount\nFROM revenue\nGROUP BY ROLLUP (region, product);",
          },
        ],
      },
      {
        id: "cube-all-combinations",
        title: "CUBE creates every combination",
        blocks: [
          {
            kind: "paragraph",
            text: "CUBE produces every grouping combination for the listed columns. With two columns, that means detail rows, region totals, product totals, and the grand total.",
          },
          {
            kind: "callout",
            title: "NULL can mark subtotal rows",
            text: "Columns not included in a grouping level appear as NULL, which can be ambiguous if your original data also has NULL values.",
          },
        ],
      },
      {
        id: "practice-grouping-sets",
        title: "Practice the GROUPING SETS, ROLLUP, and CUBE chapter",
        blocks: [
          {
            kind: "steps",
            items: [
              "Use GROUPING SETS to choose exact subtotal levels.",
              "Use ROLLUP for hierarchical subtotals and a grand total.",
              "Use CUBE for every dimension combination.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "duckdb-sql-unnest-lists-structs-nested-data",
    title: "DuckDB SQL UNNEST Explained: Lists, Structs, Recursive Flattening, and max_depth",
    description:
      "Learn how DuckDB SQL UNNEST expands list columns into rows, struct columns into fields, and nested data with recursive and max_depth options.",
    summary:
      "UNNEST is the bridge from nested data to queryable rows and columns, especially when working with JSON-like lists and structs.",
    publishedAt: "2026-05-09",
    updatedAt: "2026-05-09",
    category: "Learn SQL",
    keywords: [
      "DuckDB UNNEST",
      "SQL unnest lists",
      "SQL unnest structs",
      "flatten nested JSON SQL",
    ],
    relatedGuideSlugs: [
      "query-json-files-with-sql",
      "duckdb-wasm-browser-sql",
      "duckdb-array-lambda-functions-transform-filter-reduce",
    ],
    relatedLessonIds: [
      "unnest-lists",
      "unnest-structs",
      "unnest-recursive",
      "unnest-max-depth",
    ],
    sections: [
      {
        id: "nested-data-needs-shaping",
        title: "Nested data needs shaping before analysis",
        blocks: [
          {
            kind: "paragraph",
            text: "CSV data is usually flat. JSON and Parquet data often contain lists and structs. UNNEST helps turn that nested shape into rows and columns you can filter, join, and aggregate.",
          },
          {
            kind: "paragraph",
            text: "SQL for Files runs DuckDB in the browser, making it a useful place to practice UNNEST on local nested files without uploading them.",
          },
        ],
      },
      {
        id: "lists-become-rows",
        title: "Lists become rows",
        blocks: [
          {
            kind: "paragraph",
            text: "When a column holds a list, UNNEST turns each list element into its own row. The other selected columns are repeated for each element.",
          },
          {
            kind: "code",
            code: "SELECT name, unnest(tags) AS tag\nFROM products\nORDER BY name, tag;",
          },
        ],
      },
      {
        id: "structs-become-columns",
        title: "Structs become columns",
        blocks: [
          {
            kind: "paragraph",
            text: "A struct is different from a list. Unnesting a struct expands its fields horizontally into separate columns while keeping the row count the same.",
          },
          {
            kind: "code",
            code: "SELECT name, unnest(address)\nFROM contacts\nORDER BY name;",
          },
        ],
      },
      {
        id: "recursive-and-depth",
        title: "Recursive UNNEST and max_depth control nested layers",
        blocks: [
          {
            kind: "paragraph",
            text: "recursive := true flattens nested lists all the way down. max_depth lets you peel off only a limited number of layers when you want to preserve part of the nested structure.",
          },
          {
            kind: "code",
            code: "SELECT label, unnest(grid, recursive := true) AS val\nFROM matrices\nORDER BY label, val;",
          },
        ],
      },
      {
        id: "practice-unnest",
        title: "Practice the UNNEST chapter",
        blocks: [
          {
            kind: "steps",
            items: [
              "Unnest list columns into one row per element.",
              "Unnest struct columns into separate fields.",
              "Use recursive unnesting for deeply nested lists.",
              "Use max_depth to control how much nesting is removed.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "duckdb-array-lambda-functions-transform-filter-reduce",
    title: "DuckDB Array Lambda Functions: list_transform, list_filter, and list_reduce Explained",
    description:
      "Learn how DuckDB array lambda functions transform, filter, reduce, and combine list values directly inside SQL queries.",
    summary:
      "DuckDB list lambdas let you map, filter, and reduce arrays inside SQL, creating compact pipelines for nested list data.",
    publishedAt: "2026-05-09",
    updatedAt: "2026-05-09",
    category: "Learn SQL",
    keywords: [
      "DuckDB list_transform",
      "DuckDB list_filter",
      "DuckDB list_reduce",
      "SQL lambda functions arrays",
    ],
    relatedGuideSlugs: [
      "duckdb-sql-unnest-lists-structs-nested-data",
      "query-json-files-with-sql",
      "duckdb-wasm-browser-sql",
    ],
    relatedLessonIds: [
      "array-lambdas-transform",
      "array-lambdas-filter",
      "array-lambdas-reduce",
      "array-lambdas-combining",
    ],
    sections: [
      {
        id: "lists-can-be-processed-in-place",
        title: "Lists can be processed in place",
        blocks: [
          {
            kind: "paragraph",
            text: "Sometimes nested list data does not need to be unnested first. DuckDB list lambda functions let you transform, filter, and reduce list values directly inside a SELECT expression.",
          },
          {
            kind: "paragraph",
            text: "SQL for Files gives you a browser-based way to practice these DuckDB features on guided sample data or your own local files.",
          },
        ],
      },
      {
        id: "transform-is-map",
        title: "list_transform is the map operation",
        blocks: [
          {
            kind: "paragraph",
            text: "list_transform applies a lambda expression to every element and returns a new list with the transformed values.",
          },
          {
            kind: "code",
            code: "SELECT customer, list_transform(prices, lambda p : p * 2) AS doubled_prices\nFROM orders\nORDER BY customer;",
          },
        ],
      },
      {
        id: "filter-keeps-elements",
        title: "list_filter keeps matching elements",
        blocks: [
          {
            kind: "paragraph",
            text: "list_filter keeps only elements where the lambda returns true. If no elements qualify, the result is an empty list.",
          },
          {
            kind: "code",
            code: "SELECT customer, list_filter(prices, lambda p : p > 10) AS high_prices\nFROM orders\nORDER BY customer;",
          },
        ],
      },
      {
        id: "reduce-collapses-lists",
        title: "list_reduce collapses a list into one value",
        blocks: [
          {
            kind: "paragraph",
            text: "list_reduce uses an accumulator to fold a list into one value, such as an order total. Combined with list_filter, it becomes a compact list-processing pipeline.",
          },
          {
            kind: "code",
            code: "SELECT customer,\n  COALESCE(\n    list_reduce(\n      list_filter(prices, lambda p : p > 10),\n      lambda a, b : a + b\n    ),\n    0\n  ) AS expensive_total\nFROM orders\nORDER BY customer;",
          },
        ],
      },
      {
        id: "practice-array-lambdas",
        title: "Practice the Array Lambdas chapter",
        blocks: [
          {
            kind: "steps",
            items: [
              "Use list_transform to apply a calculation to every price.",
              "Use list_filter to keep only prices above a threshold.",
              "Use list_reduce to calculate totals from list elements.",
              "Combine list functions into compact SQL pipelines.",
            ],
          },
        ],
      },
    ],
  },
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
