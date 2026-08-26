# DuckDB Array Lambda Functions: list_transform, list_filter, and list_reduce Explained

Sometimes nested list data does not need to be unnested first.

You may want to transform every value in a list, keep only some elements, or reduce the list to a single number.

DuckDB has list lambda functions for exactly that.

They let you build small data pipelines inside a SQL expression.

## A quick intro to SQL for Files

[SQL for Files](https://sqlforfiles.app) is a browser-based SQL app for querying CSV, JSON, and Parquet files.

It runs locally with DuckDB WASM and includes guided lessons for DuckDB features such as arrays, lists, and lambda functions.

## list_transform is the map operation

`list_transform` applies a lambda expression to every element and returns a new list.

```sql
SELECT list_transform([1, 2, 3], lambda x : x * 10);
```

Result:

```text
[10, 20, 30]
```

On a table column, you can transform every price in a list:

```sql
SELECT
  customer,
  list_transform(prices, lambda p : p * 2) AS doubled_prices
FROM orders
ORDER BY customer;
```

Think of it as map for SQL lists.

## list_filter keeps matching elements

`list_filter` keeps only elements where the lambda returns true.

```sql
SELECT list_filter([10, 3, 25, 8], lambda x : x > 9);
```

Result:

```text
[10, 25]
```

On table data:

```sql
SELECT
  customer,
  list_filter(prices, lambda p : p > 10) AS high_prices
FROM orders
ORDER BY customer;
```

If no elements match, the result is an empty list.

## list_reduce collapses a list into one value

`list_reduce` folds a list into a single value using an accumulator.

```sql
SELECT list_reduce([1, 2, 3, 4], lambda acc, x : acc + x);
```

Result:

```text
10
```

This is useful for calculating totals from list columns:

```sql
SELECT
  customer,
  list_reduce(prices, lambda a, b : a + b) AS order_total
FROM orders
ORDER BY customer;
```

## Combine lambda functions into a pipeline

Lambda functions can be nested.

For example, filter prices first, then reduce the remaining values:

```sql
SELECT
  customer,
  COALESCE(
    list_reduce(
      list_filter(prices, lambda p : p > 10),
      lambda a, b : a + b
    ),
    0
  ) AS expensive_total
FROM orders
ORDER BY customer;
```

This says:

1. Keep only prices above 10.
2. Sum the remaining prices.
3. Return 0 when no prices qualify.

That is a compact SQL pipeline inside one expression.

## Practice the Array Lambdas chapter

This article is based on SQL for Files’ **Array Lambdas** chapter.

The chapter includes:

1. [Transforming Lists with list_transform](https://sqlforfiles.app/editor/chapter12/01)
2. [Filtering Lists with list_filter](https://sqlforfiles.app/editor/chapter12/02)
3. [Reducing a List with list_reduce](https://sqlforfiles.app/editor/chapter12/03)
4. [Combining Lambda Functions](https://sqlforfiles.app/editor/chapter12/04)

Use list lambdas when you want to work with arrays directly instead of flattening them first.
