import type { Chapter } from "../../types/learn";

const dataBasics: Chapter = {
  id: "data-basics",
  title: "Understanding Data",
  lessons: [
    {
      id: "data-basics-tables",
      title: "Tables, Rows, and Columns",
      content: `Before writing any SQL, it helps to understand how data is organized in a database.

The core building block is a table. A table is a lot like a spreadsheet: data is arranged in rows and columns.

Each column represents a property — for example "name", "department", or "salary". Every column has a header that describes what it holds.

Each row is one record — one employee, one order, one measurement. Every row contains a value for each column.

This is what makes the data structured: every row follows the same shape. There are no surprises — if the table has five columns, every row has exactly five values.`,
    },
    {
      id: "data-basics-types",
      title: "Data Types",
      content: `Every column in a table stores a specific kind of data. These are called data types. The most common ones are:

• Text — words and characters, like a name or department ("Alice", "Engineering")
• Numbers — whole numbers or decimals, like an ID or salary (1, 95000.00)
• Dates — calendar values like a hire date (2021-03-15)

Why does this matter? The type determines what you can do with the data. You can calculate an average salary because it is a number, sort employees by hire date because it is a date, but you cannot add two names together — that would not make sense.

Consider a table with these columns:

• \`id\` — number (\`INTEGER\`)
• \`name\` — text (\`VARCHAR\`)
• \`department\` — text (\`VARCHAR\`)
• \`salary\` — number (\`DECIMAL\`)
• \`hire_date\` — date (\`DATE\`)

In the next chapter you will learn your first steps with SQL — the language used to ask questions about data stored in tables like this.`,
    },
    {
      id: "data-basics-null",
      title: "Missing Values with NULL",
      content: `Real data often has missing or unknown values. SQL represents those values with \`NULL\`.

\`NULL\` is not the same as an empty string, zero, or the word "unknown". It means the value is absent.

This matters because normal comparisons do not work the way beginners often expect:

\`\`\`sql
WHERE department = NULL
\`\`\`

That does not find missing departments. To test for missing values, use \`IS NULL\`:

\`\`\`sql
WHERE department IS NULL
\`\`\`

To find rows where a value is present, use \`IS NOT NULL\`.

You will see \`NULL\` again in later lessons. A \`LEFT JOIN\` uses \`NULL\` when there is no matching row. Aggregates like \`SUM\` and \`AVG\` usually ignore \`NULL\` values. Advanced subtotal queries can also use \`NULL\` to mark totals.`,
    },
  ],
};

export default dataBasics;
