# SQL GROUPING SETS, ROLLUP, and CUBE Explained for Subtotals and Grand Totals

Standard `GROUP BY` gives you one level of summary.

But real reports often need more:

- detail totals
- subtotals
- totals by another dimension
- grand totals

You can write several queries and combine them with `UNION ALL`, but SQL has better tools: `GROUPING SETS`, `ROLLUP`, and `CUBE`.

## A quick intro to SQL for Files

[SQL for Files](https://sqlforfiles.app) is a browser-based SQL app for querying files locally with DuckDB WASM.

It includes guided Learn SQL lessons for advanced grouping features using small examples you can run directly in the browser.

## GROUPING SETS lets you choose exact summary levels

`GROUPING SETS` lists the exact group combinations you want.

```sql
SELECT region, product, SUM(amount) AS total_amount
FROM revenue
GROUP BY GROUPING SETS ((region), (product), ());
```

This computes:

- totals by region
- totals by product
- one grand total

The empty grouping set `()` means:

> aggregate everything with no grouping.

## ROLLUP creates hierarchical totals

`ROLLUP` is shorthand for progressively less detailed grouping levels.

```sql
SELECT region, product, SUM(amount) AS total_amount
FROM revenue
GROUP BY ROLLUP (region, product);
```

`ROLLUP(region, product)` expands to:

```text
(region, product)  -- detail level
(region)           -- subtotal per region
()                 -- grand total
```

This is ideal for hierarchical reports.

## CUBE creates every combination

`CUBE` goes further.

It produces every possible grouping combination for the listed columns.

```sql
SELECT region, product, SUM(amount) AS total_amount
FROM revenue
GROUP BY CUBE (region, product);
```

For two columns, this creates:

```text
(region, product)
(region)
(product)
()
```

That means detail rows, region totals, product totals, and the grand total.

## Why NULL appears in subtotal rows

Columns that are not part of a grouping level appear as `NULL`.

For example, a region subtotal may have:

```text
region = East
product = NULL
```

That `NULL` means the row is not for one product. It is the subtotal for all products in East.

This can be ambiguous if your original data also contains real `NULL` values, so advanced reports sometimes use `GROUPING(column)` to distinguish subtotal NULLs from data NULLs.

## Practice the GROUPING SETS, ROLLUP, and CUBE chapter

This article is based on SQL for Files’ **GROUPING SETS, ROLLUP, and CUBE** chapter.

The chapter includes:

1. [Multi-Dimension Aggregates with GROUPING SETS](https://sqlforfiles.app/editor/chapter10/01)
2. [ROLLUP for Hierarchical Totals](https://sqlforfiles.app/editor/chapter10/02)
3. [CUBE for All Combinations](https://sqlforfiles.app/editor/chapter10/03)

Use these tools when one `GROUP BY` is not enough for the report you need.
