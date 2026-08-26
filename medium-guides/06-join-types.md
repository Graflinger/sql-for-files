# SQL JOINs Explained: INNER, LEFT, FULL OUTER, SELF, and CROSS JOIN

Real databases rarely store everything in one giant table.

Employees may live in one table. Departments may live in another. Orders, customers, and products may all be separate.

That keeps data cleaner.

But it also creates a need:

> How do we bring related facts back together?

That is what `JOIN` does.

## A quick intro to SQL for Files

[SQL for Files](https://sqlforfiles.app) is a browser-based SQL app for querying CSV, JSON, and Parquet files.

It includes guided lessons for joins and runs locally with DuckDB WASM. You can practice table relationships without installing a database server.

## JOINs connect tables through keys

A join condition explains how rows relate.

For example:

```sql
ON employees.department_id = departments.id
```

The employee table stores the department ID. The departments table stores the department name.

The join combines both facts into one result.

## INNER JOIN keeps matching rows

`INNER JOIN` returns rows where both sides match.

```sql
SELECT
  e.name AS employee_name,
  d.name AS department_name
FROM employees AS e
INNER JOIN departments AS d
  ON e.department_id = d.id;
```

If an employee does not have a matching department, that employee is excluded.

Use `INNER JOIN` when you only want records that exist in both tables.

## LEFT JOIN keeps the left side

`LEFT JOIN` keeps every row from the left table.

If the right table has no match, SQL fills the right-side columns with `NULL`.

```sql
SELECT
  d.name AS department_name,
  e.name AS employee_name
FROM departments AS d
LEFT JOIN employees AS e
  ON d.id = e.department_id;
```

This is useful when you want all departments, even departments with no employees.

## Find missing matches with LEFT JOIN and IS NULL

One common join pattern is finding rows with no match.

```sql
SELECT d.name AS department_name
FROM departments AS d
LEFT JOIN employees AS e
  ON d.id = e.department_id
WHERE e.id IS NULL;
```

This finds departments without employees.

The pattern is:

1. Start with the table you want to keep.
2. `LEFT JOIN` the related table.
3. Filter where the right side is `NULL`.

## FULL OUTER JOIN keeps unmatched rows from both sides

`FULL OUTER JOIN` keeps:

- matched rows
- rows only on the left
- rows only on the right

It is useful when you want a complete picture of overlap between two tables.

## SELF JOIN connects rows in the same table

A self join joins a table to itself.

This is common for hierarchies, such as employees and managers.

```sql
SELECT
  e.name AS employee_name,
  m.name AS manager_name
FROM employees AS e
LEFT JOIN employees AS m
  ON e.manager_id = m.id;
```

The same table appears twice with different aliases.

## CROSS JOIN creates all combinations

`CROSS JOIN` returns every possible combination of rows from two tables.

```sql
SELECT
  d.name AS department_name,
  m.day_name
FROM departments AS d
CROSS JOIN meeting_days AS m;
```

If one table has 4 rows and the other has 2, the result has 8 rows.

This is useful for schedules, calendars, test cases, and complete combinations.

## Practice the JOIN Types chapter

This article is based on SQL for Files’ **JOIN Types** chapter.

The chapter includes:

1. [Why JOINs Exist](https://sqlforfiles.app/editor/chapter6/01)
2. [INNER JOIN Basics](https://sqlforfiles.app/editor/chapter6/02)
3. [LEFT JOIN Keeps the Left Side](https://sqlforfiles.app/editor/chapter6/03)
4. [Finding Missing Matches](https://sqlforfiles.app/editor/chapter6/04)
5. [RIGHT JOIN and FULL OUTER JOIN](https://sqlforfiles.app/editor/chapter6/05)
6. [SELF JOIN for Hierarchies](https://sqlforfiles.app/editor/chapter6/06)
7. [CROSS JOIN for All Combinations](https://sqlforfiles.app/editor/chapter6/07)

Start with matching rows, then learn how to preserve unmatched rows, model hierarchies, and generate combinations.
