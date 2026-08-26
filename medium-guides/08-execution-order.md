# SQL Execution Order Explained: Why WHERE, GROUP BY, HAVING, SELECT, and LIMIT Behave Differently

SQL is written in one order, but logically understood in another.

That single idea explains many beginner surprises:

- why `WHERE` cannot usually use a `SELECT` alias
- why `HAVING` can filter aggregates
- why window functions often need a subquery before filtering
- why `LIMIT` happens after sorting

## A quick intro to SQL for Files

[SQL for Files](https://sqlforfiles.app) lets you learn and run SQL directly in your browser.

You can use guided lessons or query your own CSV, JSON, and Parquet files locally with DuckDB WASM.

## A useful logical order model

A helpful teaching model for SQL logical order is:

```text
FROM
JOIN
WHERE
GROUP BY
HAVING
WINDOW FUNCTIONS
SELECT
DISTINCT
ORDER BY
LIMIT
```

Database engines optimize internally, but this model explains most SQL behavior.

## FROM and JOIN build rows first

SQL first decides which tables participate and how rows connect.

Only after that joined row set exists can `WHERE` filter it.

```sql
SELECT
  e.name AS employee_name,
  d.name AS department_name
FROM employees AS e
JOIN departments AS d
  ON e.department_id = d.id
WHERE d.name = 'Engineering';
```

The `WHERE` clause can filter on department data because the join has already happened logically.

## WHERE filters before GROUP BY

`WHERE` removes individual rows before grouping.

```sql
SELECT region, SUM(amount) AS total_amount
FROM sales
WHERE amount >= 900
GROUP BY region;
```

Only rows with `amount >= 900` participate in the grouped totals.

## HAVING filters after GROUP BY

`HAVING` filters aggregate groups after grouped values exist.

```sql
SELECT region, SUM(amount) AS total_amount
FROM sales
GROUP BY region
HAVING SUM(amount) > 2000;
```

Use `WHERE` for row-level filters.

Use `HAVING` for group-level filters.

## Window functions happen late

Window functions run after filtering and grouping, but before the final ordering and limiting.

That is why this pattern usually does not work:

```sql
SELECT
  salesperson,
  amount,
  ROW_NUMBER() OVER (PARTITION BY region ORDER BY amount DESC) AS region_rank
FROM sales
WHERE region_rank = 1;
```

At the moment `WHERE` runs, `region_rank` does not exist yet.

The usual fix is a CTE:

```sql
WITH ranked_sales AS (
  SELECT
    region,
    salesperson,
    amount,
    ROW_NUMBER() OVER (PARTITION BY region ORDER BY amount DESC) AS region_rank
  FROM sales
)
SELECT region, salesperson, amount
FROM ranked_sales
WHERE region_rank = 1;
```

## ORDER BY can use SELECT aliases

`SELECT` runs before `ORDER BY`, so `ORDER BY` can use a selected alias.

```sql
SELECT
  name,
  salary * 0.10 AS annual_bonus
FROM employees
ORDER BY annual_bonus DESC;
```

By the time ordering happens, `annual_bonus` exists in the result shape.

## LIMIT happens at the end

`LIMIT` cuts down the final result.

```sql
SELECT name, salary
FROM employees
WHERE department = 'Engineering'
ORDER BY salary DESC
LIMIT 2;
```

SQL filters to Engineering, sorts by salary, then keeps the top two rows.

## Practice the Execution Order chapter

This article is based on SQL for Files’ **Execution Order** chapter.

The chapter includes:

1. [Written Order vs Logical Order](https://sqlforfiles.app/editor/chapter8/01)
2. [FROM and JOIN Build the Rows First](https://sqlforfiles.app/editor/chapter8/02)
3. [WHERE Filters Before GROUP BY](https://sqlforfiles.app/editor/chapter8/03)
4. [HAVING Filters After GROUP BY](https://sqlforfiles.app/editor/chapter8/04)
5. [Where Window Functions Fit](https://sqlforfiles.app/editor/chapter8/05)
6. [Why Window Functions Cannot Go Directly in WHERE](https://sqlforfiles.app/editor/chapter8/06)
7. [Why SELECT Aliases Work in ORDER BY](https://sqlforfiles.app/editor/chapter8/07)
8. [LIMIT Happens at the End](https://sqlforfiles.app/editor/chapter8/08)

If SQL feels confusing, try reading your query in logical order instead of written order.
