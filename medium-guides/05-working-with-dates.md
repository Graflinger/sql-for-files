# SQL Date Queries: Date Ranges, EXTRACT, and DATE_DIFF Explained

Dates turn rows into timelines.

They let you ask questions like:

- What happened in February?
- How many orders arrived each month?
- How long did shipping take?
- Which customers signed up this quarter?

SQL can answer those questions directly when date columns are treated as dates.

## A quick intro to SQL for Files

[SQL for Files](https://sqlforfiles.app) lets you query CSV, JSON, and Parquet files with SQL in your browser.

The app runs locally using DuckDB WASM and includes guided Learn SQL lessons, so you can practice date queries before using them on your own files.

## Filter date ranges with an exclusive upper bound

To find February orders, use a lower bound and an exclusive upper bound:

```sql
SELECT order_id, order_date
FROM orders
WHERE order_date >= DATE '2024-02-01'
  AND order_date < DATE '2024-03-01'
ORDER BY order_date;
```

This means:

- include dates on or after February 1
- exclude dates on or after March 1

This pattern is often safer than `BETWEEN` for month ranges, especially when timestamps are involved.

## Extract parts of a date

`EXTRACT` pulls out pieces of a date, such as month, year, quarter, or weekday.

For example, to count orders by month number:

```sql
SELECT
  EXTRACT(MONTH FROM order_date) AS order_month,
  COUNT(*) AS order_count
FROM orders
GROUP BY EXTRACT(MONTH FROM order_date)
ORDER BY order_month;
```

This is useful for quick summaries.

One warning: grouping by month number alone mixes January from every year. For real reports, consider `DATE_TRUNC` so year and month stay together.

```sql
SELECT DATE_TRUNC('month', order_date) AS month_start
FROM orders;
```

## Measure duration with DATE_DIFF

Date arithmetic helps you measure time between two events.

In DuckDB, `DATE_DIFF` is a convenient way to calculate the distance between dates.

```sql
SELECT
  order_id,
  DATE_DIFF('day', order_date, ship_date) AS days_to_ship
FROM orders
ORDER BY order_id;
```

This pattern applies to:

- shipping time
- lead time
- overdue tasks
- subscription length
- retention analysis
- event gaps

## Practice the Working with Dates chapter

This article is based on SQL for Files’ **Working with Dates** chapter.

The chapter includes:

1. [Filtering by Date Ranges](https://sqlforfiles.app/editor/chapter5/01)
2. [Extracting Parts of a Date](https://sqlforfiles.app/editor/chapter5/02)
3. [Date Arithmetic with DATE_DIFF](https://sqlforfiles.app/editor/chapter5/03)

Start with precise date ranges, then extract useful date parts, then calculate durations.
