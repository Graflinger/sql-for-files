# DuckDB SQL UNNEST Explained: Lists, Structs, Recursive Flattening, and max_depth

Nested data is everywhere.

JSON files contain arrays and objects. Parquet files can contain lists and structs. API exports often place multiple values inside a single field.

To analyze nested data with SQL, you often need to reshape it first.

That is what `UNNEST` does.

## A quick intro to SQL for Files

[SQL for Files](https://sqlforfiles.app) lets you query CSV, JSON, and Parquet files in your browser.

It runs locally using DuckDB WASM, which makes it a practical place to learn DuckDB features like `UNNEST` without uploading files or setting up a server.

## Lists become rows

When a column contains a list, `UNNEST` turns each element into its own row.

For example, imagine a products table with a `tags` list:

```sql
SELECT name, unnest(tags) AS tag
FROM products
ORDER BY name, tag;
```

If one product has two tags, it produces two rows.

The product name is repeated beside each tag.

Empty lists and `NULL` lists produce zero rows for that input.

## Structs become columns

A struct is different from a list.

Unnesting a struct expands its fields horizontally into columns.

```sql
SELECT name, unnest(address)
FROM contacts
ORDER BY name;
```

If `address` has fields like `city` and `zip`, the result contains separate `city` and `zip` columns.

The row count stays the same.

The simple rule:

- lists expand vertically into more rows
- structs expand horizontally into more columns

## Recursive UNNEST flattens nested lists

Sometimes lists contain other lists.

A single `UNNEST` removes only one layer. Recursive unnesting can flatten all levels.

```sql
SELECT label, unnest(grid, recursive := true) AS val
FROM matrices
ORDER BY label, val;
```

This is useful for deeply nested structures where you want the individual values.

## max_depth controls how much nesting is removed

Sometimes you do not want to flatten everything.

`max_depth` lets you remove only a specific number of layers.

```sql
SELECT label, unnest(grid, max_depth := 1) AS row_list
FROM matrices
ORDER BY label;
```

This can expand the outer list while preserving inner lists.

Use it when the nested structure itself still carries meaning.

## Practice the UNNEST chapter

This article is based on SQL for Files’ **UNNEST** chapter.

The chapter includes:

1. [Unnesting Lists into Rows](https://sqlforfiles.app/editor/chapter11/01)
2. [Unnesting Structs into Columns](https://sqlforfiles.app/editor/chapter11/02)
3. [Recursive UNNEST for Nested Data](https://sqlforfiles.app/editor/chapter11/03)
4. [Controlling Depth with max_depth](https://sqlforfiles.app/editor/chapter11/04)

Learn `UNNEST` when you want nested data to become queryable rows and columns.
