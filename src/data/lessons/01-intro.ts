import type { Chapter } from "../../types/learn";

const EMPLOYEES_SETUP = [
  `CREATE OR REPLACE TABLE employees (
    id INTEGER,
    name VARCHAR,
    department VARCHAR,
    salary DECIMAL(10,2),
    hire_date DATE
  )`,
  `INSERT INTO employees VALUES
    (1, 'Alice', 'Engineering', 95000, '2021-03-15'),
    (2, 'Bob', 'Marketing', 72000, '2020-07-01'),
    (3, 'Charlie', 'Engineering', 110000, '2019-01-10'),
    (4, 'Diana', 'Sales', 68000, '2022-11-20'),
    (5, 'Eve', 'Marketing', 78000, '2021-09-05'),
    (6, 'Frank', 'Engineering', 102000, '2020-02-28'),
    (7, 'Grace', 'Sales', 71000, '2023-04-12'),
    (8, 'Hank', 'Marketing', 65000, '2022-06-30')`,
];

const intro: Chapter = {
  id: "intro",
  title: "Introduction to SQL",
  lessons: [
    {
      id: "intro-first-query",
      title: "Your First Query",
      content: `SQL (Structured Query Language) is the standard language for working with data in databases. The most fundamental SQL statement is SELECT, which retrieves data from a table.

The simplest query looks like this:

  SELECT * FROM table_name

The asterisk (*) means "all columns". This query returns every row and every column from the specified table.

Click "Load Data" below to create a sample employees table, then try running the query yourself!`,
      sampleData: {
        label: "employees table (8 rows)",
        setupSql: EMPLOYEES_SETUP,
        tableNames: ["employees"],
      },
      challenge: {
        prompt: "Select all rows and columns from the employees table.",
        initialSql: "-- Write your query here\n",
        validate: (result) => {
          if (result.columns.length < 8) {
            return {
              passed: false,
              message: "Make sure you select all columns. Try using SELECT *.",
            };
          }
          if (result.rowCount !== 8) {
            return {
              passed: false,
              message: `Expected 8 rows but got ${result.rowCount}. Make sure you're selecting from the employees table without any filters.`,
            };
          }
          return {
            passed: true,
            message: "You retrieved all 8 employees with all columns.",
          };
        },
      },
    },
    {
      id: "intro-select-columns",
      title: "Selecting Columns",
      content: `Instead of selecting all columns with *, you can pick specific columns by listing their names separated by commas:

  SELECT name, department FROM employees

This returns only the name and department columns. Selecting specific columns is good practice because:

• It makes your query's intent clear
• It can be faster when tables have many columns
• It returns only the data you actually need

You can list columns in any order — the result will follow the order you specify.`,
      sampleData: {
        label: "employees table (8 rows)",
        setupSql: EMPLOYEES_SETUP,
        tableNames: ["employees"],
      },
      challenge: {
        prompt:
          "Select only the name and salary columns from the employees table.",
        hint: "Use SELECT name, salary FROM ...",
        initialSql: "-- Select name and salary\n",
        validate: (result) => {
          const cols = result.columns.map((c) => c.toLowerCase());
          if (!cols.includes("name") || !cols.includes("salary")) {
            return {
              passed: false,
              message:
                "Your result should include the 'name' and 'salary' columns.",
            };
          }
          if (cols.length !== 2) {
            return {
              passed: false,
              message: `Expected exactly 2 columns but got ${cols.length}. Select only name and salary.`,
            };
          }
          if (result.rowCount !== 8) {
            return {
              passed: false,
              message: `Expected 8 rows but got ${result.rowCount}.`,
            };
          }
          return {
            passed: true,
            message: "You selected exactly the name and salary columns.",
          };
        },
      },
    },
    {
      id: "intro-order-by",
      title: "Sorting Results",
      content: `By default, SQL doesn't guarantee a particular row order. To sort your results, use ORDER BY:

  SELECT * FROM employees ORDER BY salary

This sorts rows by salary in ascending order (lowest first). To sort in descending order (highest first), add DESC:

  SELECT * FROM employees ORDER BY salary DESC

You can sort by multiple columns too:

  SELECT * FROM employees ORDER BY department, name

This sorts by department first, then by name within each department.`,
      sampleData: {
        label: "employees table (8 rows)",
        setupSql: EMPLOYEES_SETUP,
        tableNames: ["employees"],
      },
      challenge: {
        prompt:
          "Select the name and salary of all employees, sorted by salary from highest to lowest.",
        hint: "Use ORDER BY salary DESC",
        initialSql: "-- Sort employees by salary descending\n",
        validate: (result) => {
          const cols = result.columns.map((c) => c.toLowerCase());
          if (!cols.includes("name") || !cols.includes("salary")) {
            return {
              passed: false,
              message:
                "Your result should include 'name' and 'salary' columns.",
            };
          }
          if (result.rowCount !== 8) {
            return {
              passed: false,
              message: `Expected 8 rows but got ${result.rowCount}.`,
            };
          }
          // Check descending order
          const salaries = result.data.map((r) => Number(r.salary ?? r.Salary));
          for (let i = 1; i < salaries.length; i++) {
            if (salaries[i] > salaries[i - 1]) {
              return {
                passed: false,
                message:
                  "Results are not sorted by salary from highest to lowest. Add DESC after ORDER BY salary.",
              };
            }
          }
          return {
            passed: true,
            message:
              "Results are correctly sorted by salary in descending order.",
          };
        },
      },
    },
  ],
};

export default intro;
