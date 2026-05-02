import type { Chapter } from "../../types/learn";

const PRODUCTS_SETUP = [
  `CREATE OR REPLACE TABLE products (
    name VARCHAR,
    tags VARCHAR[]
  )`,
  `INSERT INTO products VALUES
    ('Widget', ['electronics', 'sale']),
    ('Gadget', ['electronics', 'premium']),
    ('Gizmo', ['accessories', 'sale', 'new']),
    ('Doodad', []::VARCHAR[]),
    ('Mystery', NULL)`,
];

const CONTACTS_SETUP = [
  `CREATE OR REPLACE TABLE contacts (
    name VARCHAR,
    address STRUCT(city VARCHAR, zip VARCHAR)
  )`,
  `INSERT INTO contacts VALUES
    ('Alice', {'city': 'Boston', 'zip': '02101'}),
    ('Bob', {'city': 'Denver', 'zip': '80201'}),
    ('Carol', {'city': 'Boston', 'zip': '02102'})`,
];

const NESTED_SETUP = [
  `CREATE OR REPLACE TABLE matrices (
    label VARCHAR,
    grid INTEGER[][]
  )`,
  `INSERT INTO matrices VALUES
    ('A', [[1, 2], [3, 4]]),
    ('B', [[5, 6, 7], [8]])`,
];

function getValue(row: Record<string, unknown>, column: string): unknown {
  const matchingKey = Object.keys(row).find((key) => key.toLowerCase() === column.toLowerCase());
  return matchingKey ? row[matchingKey] : undefined;
}

const unnest: Chapter = {
  id: "unnest",
  title: "UNNEST",
  lessons: [
    {
      id: "unnest-lists",
      title: "Unnesting Lists into Rows",
      content: `\`UNNEST\` turns each element of a list column into its own row. This is essential when working with JSON or other data that stores arrays inside columns.

If the products table has a \`tags\` column of type \`VARCHAR[]\`, you can expand it:

\`\`\`sql
SELECT name, unnest(tags) AS tag
FROM products
\`\`\`

For a product with two tags, this produces two rows — one per tag. The other columns are repeated for each expanded element.

An empty list produces zero rows for that input, so the parent row disappears from the result. \`NULL\` lists also produce zero rows. The sample data includes both cases so you can see that they do not appear after unnesting.

DuckDB supports the convenient \`SELECT unnest(...)\` form. Other databases often use a lateral join or \`CROSS JOIN UNNEST\` syntax instead.`,
      sampleData: {
        label: "products table (5 rows with tag lists)",
        setupSql: PRODUCTS_SETUP,
        tableNames: ["products"],
      },
      challenge: {
        prompt:
          "Unnest the tags column so each tag gets its own row. Return name and tag, ordered by name, then tag.",
        hint:
          "SELECT name, unnest(tags) AS tag FROM products ORDER BY name, tag",
        initialSql: "-- Expand tags into rows\n",
        solutionSql:
          "SELECT name, unnest(tags) AS tag\nFROM products\nORDER BY name, tag;",
        validate: (result) => {
          if (result.rowCount !== 7) {
            return {
              passed: false,
              message: `Expected 7 rows (2 + 2 + 3 + 0 + 0 tags) but got ${result.rowCount}.`,
            };
          }

          const firstTag = String(getValue(result.data[0], "tag"));
          const firstName = String(getValue(result.data[0], "name"));

          if (firstName !== "Gadget" || firstTag !== "electronics") {
            return {
              passed: false,
              message: "The first row should be Gadget / electronics when ordered by name, tag.",
            };
          }

          return {
            passed: true,
            message: "Correct! UNNEST expanded each tag list into individual rows.",
          };
        },
      },
    },
    {
      id: "unnest-structs",
      title: "Unnesting Structs into Columns",
      content: `When a column holds a \`STRUCT\`, \`UNNEST\` expands its fields into separate columns.

If the contacts table has an \`address\` column of type \`STRUCT(city VARCHAR, zip VARCHAR)\`:

\`\`\`sql
SELECT name, unnest(address)
FROM contacts
\`\`\`

This produces columns \`name\`, \`city\`, and \`zip\` — one column per struct field.

Note the difference from list unnesting: lists expand vertically (more rows), while structs expand horizontally (more columns). The row count stays the same.

This is especially useful when importing JSON data where objects are stored as DuckDB structs.`,
      sampleData: {
        label: "contacts table (3 rows with address structs)",
        setupSql: CONTACTS_SETUP,
        tableNames: ["contacts"],
      },
      challenge: {
        prompt:
          "Unnest the address struct so city and zip become their own columns. Return name, city, and zip, ordered by name.",
        hint:
          "SELECT name, unnest(address) FROM contacts ORDER BY name",
        initialSql: "-- Expand the address struct into columns\n",
        solutionSql:
          "SELECT name, unnest(address)\nFROM contacts\nORDER BY name;",
        validate: (result) => {
          if (result.rowCount !== 3) {
            return {
              passed: false,
              message: `Expected 3 rows (one per contact) but got ${result.rowCount}.`,
            };
          }

          const columns = Object.keys(result.data[0]).map((key) => key.toLowerCase());
          const hasCity = columns.includes("city");
          const hasZip = columns.includes("zip");

          if (!hasCity || !hasZip) {
            return {
              passed: false,
              message: "The result should have city and zip columns from the unnested struct.",
            };
          }

          const firstCity = String(getValue(result.data[0], "city"));

          if (firstCity !== "Boston") {
            return {
              passed: false,
              message: "Alice lives in Boston — check that unnest is expanding the struct correctly.",
            };
          }

          return {
            passed: true,
            message: "Nice! UNNEST expanded the struct fields into separate columns.",
          };
        },
      },
    },
    {
      id: "unnest-recursive",
      title: "Recursive UNNEST for Nested Data",
      content: `When lists contain other lists, a single \`UNNEST\` only peels off one layer. Use the \`recursive\` parameter to flatten all levels at once.

\`\`\`sql
SELECT unnest([[1, 2], [3, 4, 5]], recursive := true)
\`\`\`

Without \`recursive\` this returns two rows — each inner list as a value.
With \`recursive := true\` it returns five rows — the individual integers.

This works on structs too. A list of structs with recursive unnesting first expands the list into rows, then expands each struct into columns:

\`\`\`sql
SELECT unnest([{'a': 1, 'b': 2}, {'a': 3, 'b': 4}], recursive := true)
\`\`\`

Note that lists inside structs are not unnested — recursive unnesting first fully unnests all lists, then fully unnests all structs.`,
      sampleData: {
        label: "matrices table (2 rows with nested integer lists)",
        setupSql: NESTED_SETUP,
        tableNames: ["matrices"],
      },
      challenge: {
        prompt:
          "Recursively unnest the grid column to get individual integers. Return label and the unnested value as val, ordered by label, val.",
        hint:
          "SELECT label, unnest(grid, recursive := true) AS val FROM matrices ORDER BY label, val",
        initialSql: "-- Flatten nested lists into individual values\n",
        solutionSql:
          "SELECT label, unnest(grid, recursive := true) AS val\nFROM matrices\nORDER BY label, val;",
        validate: (result) => {
          if (result.rowCount !== 8) {
            return {
              passed: false,
              message: `Expected 8 rows (4 from A + 4 from B) but got ${result.rowCount}.`,
            };
          }

          const firstVal = Number(getValue(result.data[0], "val"));
          const lastVal = Number(getValue(result.data[result.rowCount - 1], "val"));

          if (firstVal !== 1) {
            return {
              passed: false,
              message: "The first value for label A should be 1.",
            };
          }

          if (lastVal !== 8) {
            return {
              passed: false,
              message: "The last value for label B should be 8.",
            };
          }

          return {
            passed: true,
            message: "Correct! Recursive UNNEST flattened the nested lists into individual integers.",
          };
        },
      },
    },
    {
      id: "unnest-max-depth",
      title: "Controlling Depth with max_depth",
      content: `Sometimes you want to peel off only a few layers of nesting rather than flattening everything. The \`max_depth\` parameter controls how many levels \`UNNEST\` removes.

\`\`\`sql
SELECT unnest([[[1, 2], [3]], [[4, 5]]], max_depth := 1) AS inner_list
\`\`\`

With \`max_depth := 1\` this returns two rows — each is still a list of lists:
  [[1, 2], [3]]
  [[4, 5]]

With \`max_depth := 2\` it goes one level deeper, returning inner lists:
  [1, 2]
  [3]
  [4, 5]

\`max_depth\` implies recursive unnesting, so you do not need to specify \`recursive := true\` separately.

This is useful when your data has a known structure and you want to stop at a specific level — for instance, unnesting groups but keeping the items within each group as a list.`,
      sampleData: {
        label: "matrices table (2 rows with nested integer lists)",
        setupSql: NESTED_SETUP,
        tableNames: ["matrices"],
      },
      challenge: {
        prompt:
          "Use UNNEST with max_depth := 1 on the grid column to expand only the outer list. Return label and the partially unnested value as row_list, ordered by label. The result should have inner lists as values.",
        hint:
          "SELECT label, unnest(grid, max_depth := 1) AS row_list FROM matrices ORDER BY label",
        initialSql: "-- Unnest one level only\n",
        solutionSql:
          "SELECT label, unnest(grid, max_depth := 1) AS row_list\nFROM matrices\nORDER BY label;",
        validate: (result) => {
          if (result.rowCount !== 4) {
            return {
              passed: false,
              message: `Expected 4 rows (2 inner lists from A + 2 from B) but got ${result.rowCount}.`,
            };
          }

          const firstLabel = String(getValue(result.data[0], "label"));

          if (firstLabel !== "A") {
            return {
              passed: false,
              message: "The first rows should be from label A when ordered by label.",
            };
          }

          return {
            passed: true,
            message: "Correct! max_depth := 1 removed only the outer list layer, leaving the inner lists intact.",
          };
        },
      },
    },
  ],
};

export default unnest;
