# SQL Window Functions Explained: OVER, PARTITION BY, Running Totals, and LAG

Aggregate functions summarize rows.

Window functions add summary context without removing the detail rows.

That difference is huge.

With `GROUP BY`, many rows become fewer rows. With a window function, every original row can stay visible while SQL adds totals, rankings, running totals, or previous values beside it.

## A quick intro to SQL for Files

[SQL for Files](https://sqlforfiles.app) is a browser-based SQL workspace for querying CSV, JSON, and Parquet files.

It runs locally using DuckDB WASM and includes guided lessons for advanced SQL topics like window functions.

## OVER defines the window

Every window function has an `OVER` clause.

The simplest version uses the whole result set as the window:

```sql
SELECT
  id,
  salesperson,
  amount,
  SUM(amount) OVER () AS grand_total
FROM sales_2;
```

This keeps every sale row and adds the company-wide total beside each one.

## PARTITION BY creates mini windows

`PARTITION BY` splits the rows into smaller windows.

For example, one window per region:

```sql
SELECT
  id,
  region,
  amount,
  SUM(amount) OVER (PARTITION BY region) AS region_total
FROM sales_2;
```

Every East row gets the East total. Every West row gets the West total.

This lets you compare a row to its group without losing row-level detail.

## ORDER BY enables running totals

Adding `ORDER BY` inside the window makes row sequence matter.

That is how you build running totals:

```sql
SELECT
  salesperson,
  sale_date,
  amount,
  SUM(amount) OVER (
    PARTITION BY salesperson
    ORDER BY sale_date
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) AS running_amount
FROM sales_2;
```

The frame says:

> Start at the first row in this salesperson’s partition and keep summing up to the current row.

Writing the frame explicitly helps avoid surprises.

## ROW_NUMBER ranks rows

`ROW_NUMBER` assigns a position inside each partition.

```sql
SELECT
  region,
  salesperson,
  amount,
  ROW_NUMBER() OVER (
    PARTITION BY region
    ORDER BY amount DESC
  ) AS region_row_number
FROM sales_2;
```

This is useful for:

- top sale per region
- top 3 orders per customer
- first event per user
- deduplication workflows

## LAG looks backward

`LAG` reaches into an earlier row in the same partition.

```sql
SELECT
  salesperson,
  sale_date,
  amount,
  LAG(amount) OVER (
    PARTITION BY salesperson
    ORDER BY sale_date
  ) AS previous_amount
FROM sales_2;
```

The first row in each salesperson’s partition has no previous row, so `LAG` returns `NULL`.

This is useful for change-over-time analysis.

## Practice the Window Functions chapter

This article is based on SQL for Files’ **Window Functions** chapter.

The chapter includes:

1. [OVER Keeps the Detail Rows](https://sqlforfiles.app/editor/chapter7/01)
2. [PARTITION BY Creates Mini Windows](https://sqlforfiles.app/editor/chapter7/02)
3. [Running Totals with ORDER BY](https://sqlforfiles.app/editor/chapter7/03)
4. [Ranking Rows with ROW_NUMBER](https://sqlforfiles.app/editor/chapter7/04)
5. [Looking Back with LAG](https://sqlforfiles.app/editor/chapter7/05)
6. [Other Common Window Functions](https://sqlforfiles.app/editor/chapter7/06)

Start with `OVER ()`, then add partitions, ordering, frames, ranking, and previous-row comparisons.
