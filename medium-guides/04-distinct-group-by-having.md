# SQL DISTINCT, GROUP BY, and HAVING: From Unique Values to Grouped Reports

Once you know how to summarize a whole table, the next question is obvious:

> Can I summarize by category?

Total sales are useful.

Total sales by region are more useful.

That is where `DISTINCT`, `GROUP BY`, and `HAVING` come in.

## A quick intro to SQL for Files

[SQL for Files](https://sqlforfiles.app) is a browser-based SQL workspace for querying CSV, JSON, and Parquet files.

It includes guided Learn SQL lessons and runs queries locally in your browser with DuckDB WASM. You can practice with sample data first, then apply the same patterns to your own files.

## DISTINCT removes duplicate result rows

`DISTINCT` is useful when you want a clean list of unique values.

For example, to see every region in a sales table:

```sql
SELECT DISTINCT region
FROM sales
ORDER BY region;
```

If the table contains many sales in the same region, each region still appears only once.

One important detail:

> DISTINCT applies to the full selected row.

This query returns unique salesperson-region pairs:

```sql
SELECT DISTINCT salesperson, region
FROM sales;
```

It does not return unique salespeople only.

## GROUP BY summarizes one group at a time

`GROUP BY` collects rows into groups before aggregate functions run.

For example:

```sql
SELECT region, SUM(amount) AS total_amount
FROM sales
GROUP BY region
ORDER BY total_amount DESC;
```

Instead of one total for the whole table, this produces one total per region.

That is the basic shape of many reports:

```sql
SELECT category, aggregate_function(value)
FROM table
GROUP BY category;
```

The key rule:

> When you use GROUP BY, every selected column must either be grouped or aggregated.

## HAVING filters grouped results

`WHERE` filters rows before grouping.

`HAVING` filters groups after aggregation.

For example, to find salespeople with more than one sale:

```sql
SELECT salesperson, COUNT(*) AS sale_count
FROM sales
GROUP BY salesperson
HAVING COUNT(*) > 1
ORDER BY salesperson;
```

The sequence is:

1. Group rows by salesperson.
2. Count rows inside each group.
3. Keep only groups where the count is greater than one.

Use `HAVING` when your filter depends on an aggregate.

## Practice the DISTINCT and GROUP BY chapter

This article is based on SQL for Files’ **DISTINCT and GROUP BY** chapter.

The chapter includes:

1. [Removing Duplicates with DISTINCT](https://sqlforfiles.app/editor/chapter4/01)
2. [Summarizing with GROUP BY](https://sqlforfiles.app/editor/chapter4/02)
3. [Filtering Groups with HAVING](https://sqlforfiles.app/editor/chapter4/03)

Start by removing duplicates, then summarize by category, then filter grouped results with `HAVING`.
