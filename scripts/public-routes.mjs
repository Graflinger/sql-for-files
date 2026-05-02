export const SITE_URL = "https://sqlforfiles.app";

export const staticRoutes = [
  {
    path: "/",
    changefreq: "weekly",
    priority: "1.0",
  },
  {
    path: "/editor",
    changefreq: "monthly",
    priority: "0.9",
  },
  {
    path: "/docs",
    changefreq: "monthly",
    priority: "0.8",
  },
  {
    path: "/privacy",
    changefreq: "yearly",
    priority: "0.3",
  },
  {
    path: "/legal",
    changefreq: "yearly",
    priority: "0.3",
  },
];

export const learnRoutes = [
  {
    path: "/editor/chapter0/01",
    title: "Tables, Rows, and Columns",
    chapter: "Understanding Data",
  },
  {
    path: "/editor/chapter0/02",
    title: "Data Types",
    chapter: "Understanding Data",
  },
  {
    path: "/editor/chapter0/03",
    title: "Missing Values with NULL",
    chapter: "Understanding Data",
  },
  {
    path: "/editor/chapter1/01",
    title: "Your First Query",
    chapter: "Introduction to SQL",
  },
  {
    path: "/editor/chapter1/02",
    title: "Selecting Columns",
    chapter: "Introduction to SQL",
  },
  {
    path: "/editor/chapter1/03",
    title: "Naming Results with Aliases",
    chapter: "Introduction to SQL",
  },
  {
    path: "/editor/chapter1/04",
    title: "Sorting Results",
    chapter: "Introduction to SQL",
  },
  {
    path: "/editor/chapter2/01",
    title: "WHERE Clause Basics",
    chapter: "Filtering Data",
  },
  {
    path: "/editor/chapter2/02",
    title: "Combining Conditions",
    chapter: "Filtering Data",
  },
  {
    path: "/editor/chapter2/03",
    title: "Pattern Matching with LIKE",
    chapter: "Filtering Data",
  },
  {
    path: "/editor/chapter3/01",
    title: "COUNT Rows",
    chapter: "Simple Aggregates",
  },
  {
    path: "/editor/chapter3/02",
    title: "SUM Values",
    chapter: "Simple Aggregates",
  },
  {
    path: "/editor/chapter3/03",
    title: "COUNT and SUM Together",
    chapter: "Simple Aggregates",
  },
  {
    path: "/editor/chapter3/04",
    title: "MIN Finds the Smallest Value",
    chapter: "Simple Aggregates",
  },
  {
    path: "/editor/chapter3/05",
    title: "MAX Finds the Largest Value",
    chapter: "Simple Aggregates",
  },
  {
    path: "/editor/chapter3/06",
    title: "AVG Computes the Mean",
    chapter: "Simple Aggregates",
  },
  {
    path: "/editor/chapter3/07",
    title: "MIN, MAX, and AVG Together",
    chapter: "Simple Aggregates",
  },
  {
    path: "/editor/chapter4/01",
    title: "Removing Duplicates with DISTINCT",
    chapter: "DISTINCT and GROUP BY",
  },
  {
    path: "/editor/chapter4/02",
    title: "Summarizing with GROUP BY",
    chapter: "DISTINCT and GROUP BY",
  },
  {
    path: "/editor/chapter4/03",
    title: "Filtering Groups with HAVING",
    chapter: "DISTINCT and GROUP BY",
  },
  {
    path: "/editor/chapter5/01",
    title: "Filtering by Date Ranges",
    chapter: "Working with Dates",
  },
  {
    path: "/editor/chapter5/02",
    title: "Extracting Parts of a Date",
    chapter: "Working with Dates",
  },
  {
    path: "/editor/chapter5/03",
    title: "Date Arithmetic with DATE_DIFF",
    chapter: "Working with Dates",
  },
  {
    path: "/editor/chapter6/01",
    title: "Why JOINs Exist",
    chapter: "JOIN Types",
  },
  {
    path: "/editor/chapter6/02",
    title: "INNER JOIN Basics",
    chapter: "JOIN Types",
  },
  {
    path: "/editor/chapter6/03",
    title: "LEFT JOIN Keeps the Left Side",
    chapter: "JOIN Types",
  },
  {
    path: "/editor/chapter6/04",
    title: "Finding Missing Matches",
    chapter: "JOIN Types",
  },
  {
    path: "/editor/chapter6/05",
    title: "RIGHT JOIN and FULL OUTER JOIN",
    chapter: "JOIN Types",
  },
  {
    path: "/editor/chapter6/06",
    title: "SELF JOIN for Hierarchies",
    chapter: "JOIN Types",
  },
  {
    path: "/editor/chapter6/07",
    title: "CROSS JOIN for All Combinations",
    chapter: "JOIN Types",
  },
  {
    path: "/editor/chapter7/01",
    title: "OVER Keeps the Detail Rows",
    chapter: "Window Functions",
  },
  {
    path: "/editor/chapter7/02",
    title: "PARTITION BY Creates Mini Windows",
    chapter: "Window Functions",
  },
  {
    path: "/editor/chapter7/03",
    title: "Running Totals with ORDER BY",
    chapter: "Window Functions",
  },
  {
    path: "/editor/chapter7/04",
    title: "Ranking Rows with ROW_NUMBER",
    chapter: "Window Functions",
  },
  {
    path: "/editor/chapter7/05",
    title: "Looking Back with LAG",
    chapter: "Window Functions",
  },
  {
    path: "/editor/chapter7/06",
    title: "Other Common Window Functions",
    chapter: "Window Functions",
  },
  {
    path: "/editor/chapter8/01",
    title: "Written Order vs Logical Order",
    chapter: "Execution Order",
  },
  {
    path: "/editor/chapter8/02",
    title: "FROM and JOIN Build the Rows First",
    chapter: "Execution Order",
  },
  {
    path: "/editor/chapter8/03",
    title: "WHERE Filters Before GROUP BY",
    chapter: "Execution Order",
  },
  {
    path: "/editor/chapter8/04",
    title: "HAVING Filters After GROUP BY",
    chapter: "Execution Order",
  },
  {
    path: "/editor/chapter8/05",
    title: "Where Window Functions Fit",
    chapter: "Execution Order",
  },
  {
    path: "/editor/chapter8/06",
    title: "Why Window Functions Cannot Go Directly in WHERE",
    chapter: "Execution Order",
  },
  {
    path: "/editor/chapter8/07",
    title: "Why SELECT Aliases Work in ORDER BY",
    chapter: "Execution Order",
  },
  {
    path: "/editor/chapter8/08",
    title: "LIMIT Happens at the End",
    chapter: "Execution Order",
  },
  {
    path: "/editor/chapter9/01",
    title: "Why Normalization Matters",
    chapter: "Normalization",
  },
  {
    path: "/editor/chapter9/02",
    title: "Feel the Update Anomaly",
    chapter: "Normalization",
  },
  {
    path: "/editor/chapter9/03",
    title: "One Row to Update in a Good Schema",
    chapter: "Normalization",
  },
  {
    path: "/editor/chapter9/04",
    title: "Feel Why Packed Lists Break 1NF",
    chapter: "Normalization",
  },
  {
    path: "/editor/chapter9/05",
    title: "Order Items Feel Better",
    chapter: "Normalization",
  },
  {
    path: "/editor/chapter9/06",
    title: "Feel the Delete Anomaly",
    chapter: "Normalization",
  },
  {
    path: "/editor/chapter9/07",
    title: "Products Can Exist Without Orders",
    chapter: "Normalization",
  },
  {
    path: "/editor/chapter9/08",
    title: "1NF, 2NF, and 3NF",
    chapter: "Normalization",
  },
  {
    path: "/editor/chapter9/09",
    title: "Why We Build Tables in Normal Forms",
    chapter: "Normalization",
  },
  {
    path: "/editor/chapter10/01",
    title: "Multi-Dimension Aggregates with GROUPING SETS",
    chapter: "GROUPING SETS, ROLLUP, and CUBE",
  },
  {
    path: "/editor/chapter10/02",
    title: "ROLLUP for Hierarchical Totals",
    chapter: "GROUPING SETS, ROLLUP, and CUBE",
  },
  {
    path: "/editor/chapter10/03",
    title: "CUBE for All Combinations",
    chapter: "GROUPING SETS, ROLLUP, and CUBE",
  },
  {
    path: "/editor/chapter11/01",
    title: "Unnesting Lists into Rows",
    chapter: "UNNEST",
  },
  {
    path: "/editor/chapter11/02",
    title: "Unnesting Structs into Columns",
    chapter: "UNNEST",
  },
  {
    path: "/editor/chapter11/03",
    title: "Recursive UNNEST for Nested Data",
    chapter: "UNNEST",
  },
  {
    path: "/editor/chapter11/04",
    title: "Controlling Depth with max_depth",
    chapter: "UNNEST",
  },
  {
    path: "/editor/chapter12/01",
    title: "Transforming Lists with list_transform",
    chapter: "Array Lambdas",
  },
  {
    path: "/editor/chapter12/02",
    title: "Filtering Lists with list_filter",
    chapter: "Array Lambdas",
  },
  {
    path: "/editor/chapter12/03",
    title: "Reducing a List with list_reduce",
    chapter: "Array Lambdas",
  },
  {
    path: "/editor/chapter12/04",
    title: "Combining Lambda Functions",
    chapter: "Array Lambdas",
  },
].map((route) => ({
  ...route,
  changefreq: "monthly",
  priority: "0.6",
}));

export const publicRoutes = [...staticRoutes, ...learnRoutes];
