# SQL Aggregate Functions: COUNT, SUM, MIN, MAX, and AVG Explained

Tables often contain too many rows to understand one at a time.

At some point, you stop asking:

> What is in each row?

And start asking:

> What do all these rows mean together?

That is where aggregate functions come in.

Aggregate functions turn many rows into summary values: counts, totals, minimums, maximums, and averages.

## A quick intro to SQL for Files

[SQL for Files](https://sqlforfiles.app) lets you query CSV, JSON, and Parquet files with SQL directly in your browser.

You can practice with guided lessons or load your own files. Query execution runs locally using DuckDB WASM, so you do not need to set up a database server.

## COUNT answers “how many?”

`COUNT` tells you how many rows match a question.

```sql
SELECT COUNT(*) AS sale_count
FROM sales;
```

You can combine it with `WHERE` to count only part of a table:

```sql
SELECT COUNT(*) AS sale_count
FROM sales
WHERE region = 'East';
```

Important distinction:

- `COUNT(*)` counts rows.
- `COUNT(column_name)` counts rows where that column is not `NULL`.

## SUM answers “how much?”

`SUM` adds numeric values.

It is useful for totals like revenue, quantity, cost, or hours.

```sql
SELECT SUM(amount) AS total_amount
FROM sales;
```

You can also filter first:

```sql
SELECT SUM(amount) AS total_amount
FROM sales
WHERE region = 'West';
```

That query answers:

> How much did the West region sell?

## COUNT and SUM work well together

Reporting queries often return more than one aggregate at a time.

```sql
SELECT
  COUNT(*) AS sale_count,
  SUM(amount) AS total_amount
FROM sales
WHERE region = 'West';
```

This gives you both the number of sales and the total amount in one row.

That is the foundation of many dashboards.

## MIN, MAX, and AVG describe the spread

`MIN` finds the smallest value.

`MAX` finds the largest value.

`AVG` calculates the mean.

Together, they give you a quick profile of a numeric column.

```sql
SELECT
  MIN(amount) AS smallest_sale,
  MAX(amount) AS largest_sale,
  AVG(amount) AS average_sale
FROM sales;
```

This is useful when you want to understand the range of values, not just the total.

## Aggregates usually return fewer rows

A plain aggregate query without `GROUP BY` usually returns one row.

That one row summarizes all matching rows after any `WHERE` filter has been applied.

This is why aggregate functions are so useful for quick checks:

- How many rows are there?
- What is the total amount?
- What is the smallest value?
- What is the largest value?
- What is the average?

## Practice the Simple Aggregates chapter

This article is based on SQL for Files’ **Simple Aggregates** chapter.

The chapter includes:

1. [COUNT Rows](https://sqlforfiles.app/editor/chapter3/01)
2. [SUM Values](https://sqlforfiles.app/editor/chapter3/02)
3. [COUNT and SUM Together](https://sqlforfiles.app/editor/chapter3/03)
4. [MIN Finds the Smallest Value](https://sqlforfiles.app/editor/chapter3/04)
5. [MAX Finds the Largest Value](https://sqlforfiles.app/editor/chapter3/05)
6. [AVG Computes the Mean](https://sqlforfiles.app/editor/chapter3/06)
7. [MIN, MAX, and AVG Together](https://sqlforfiles.app/editor/chapter3/07)

Start with `COUNT`, then add totals, then use `MIN`, `MAX`, and `AVG` to understand the shape of your data.
