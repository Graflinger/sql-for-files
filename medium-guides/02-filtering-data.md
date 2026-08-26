# SQL WHERE Clause Explained: Filtering Rows with AND, OR, and LIKE

Filtering is where SQL starts to feel useful.

A table can show you everything. A filter lets you ask for only the rows that matter.

Instead of reading every employee, every order, or every event, you describe the condition you care about and let SQL do the scanning.

That is the job of the `WHERE` clause.

## A quick intro to SQL for Files

[SQL for Files](https://sqlforfiles.app) is a browser-based SQL app for querying CSV, JSON, and Parquet files.

You can practice with guided sample data or load your own files and query them locally in your browser using DuckDB WASM. There is no database server to configure, and your file analysis runs on your device.

## WHERE keeps rows that match a condition

The `WHERE` clause checks each row against a condition.

Rows that pass stay in the result. Rows that do not pass are left out.

For example:

```sql
SELECT *
FROM employees
WHERE salary > 80000;
```

This keeps only employees whose salary is greater than 80,000.

Common comparison operators include:

- `=` equal to
- `!=` or `<>` not equal to
- `>` greater than
- `<` less than
- `>=` greater than or equal to
- `<=` less than or equal to

For text values, remember to use single quotes:

```sql
SELECT *
FROM employees
WHERE department = 'Engineering';
```

## Combine conditions with AND and OR

Real questions often need more than one condition.

`AND` means every condition must be true.

```sql
SELECT *
FROM employees
WHERE department = 'Marketing'
  AND salary > 70000;
```

This returns Marketing employees who also earn more than 70,000.

`OR` means at least one condition must be true.

```sql
SELECT *
FROM employees
WHERE department = 'Sales'
   OR department = 'Marketing';
```

When you mix `AND` and `OR`, use parentheses to make your logic obvious:

```sql
SELECT *
FROM employees
WHERE (department = 'Sales' OR department = 'Marketing')
  AND salary > 70000;
```

Parentheses prevent subtle mistakes and make your query easier to read later.

## Find text patterns with LIKE

Sometimes exact matches are not enough.

You may want names that start with a letter, values that contain a word, or codes that match a pattern.

That is where `LIKE` helps.

```sql
SELECT name
FROM employees
WHERE name LIKE '%li%'
ORDER BY name;
```

The `%` wildcard matches any sequence of characters.

Examples:

```sql
WHERE name LIKE 'A%'    -- starts with A
WHERE name LIKE '%e'    -- ends with e
WHERE name LIKE '%li%'  -- contains li
```

The `_` wildcard matches exactly one character.

In DuckDB, `LIKE` is case-sensitive. Use `ILIKE` when you want case-insensitive matching.

## Practice the Filtering Data chapter

This article is based on SQL for Files’ **Filtering Data** chapter.

The chapter includes:

1. [WHERE Clause Basics](https://sqlforfiles.app/editor/chapter2/01)
2. [Combining Conditions](https://sqlforfiles.app/editor/chapter2/02)
3. [Pattern Matching with LIKE](https://sqlforfiles.app/editor/chapter2/03)

Start with simple row filters, then combine conditions, then search text with patterns.
