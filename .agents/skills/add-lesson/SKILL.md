---
name: add-lesson
description: Add or update Learn SQL lessons in src/data/lessons, including chapter structure, sample data, challenges, validation, and supported lesson renderer markup. Use for lesson content, not route-level pages or generic UI changes.
---

# Add Lesson

Use this skill when creating or updating SQL learning lessons for SQL for Files.

## Goal

Create lessons that are:

- clear and beginner-friendly
- runnable in the browser DuckDB environment
- consistent with existing chapter and challenge patterns
- easy to maintain as TypeScript data
- formatted using only markup supported by the lesson renderer

## When to use this skill

Use this skill for:

- adding a new lesson to an existing chapter in `src/data/lessons/`
- adding a new chapter file and registering it in `src/data/lessons/index.ts`
- revising lesson copy, sample data, challenge SQL, or validation logic
- adding theory-only lessons with no challenge
- documenting SQL examples in lesson content

Do not use this skill for:

- route-level app pages in `src/pages/` — use `new-page` instead
- Monaco editor features, database import/export features, or result rendering UI
- broad curriculum planning without a concrete lesson change

## Key files

- `src/types/learn.ts`: lesson, chapter, sample data, and challenge interfaces
- `src/data/lessons/<chapter>.ts`: chapter definitions and lesson content
- `src/data/lessons/index.ts`: ordered chapter registration, route lookup, and numbering
- `src/components/LearnSQL/LessonContent.tsx`: lesson body parser and renderer
- `src/components/LearnSQL/ChallengeBlock.tsx`: sample-data loader and challenge UI
- `src/components/LearnSQL/LearnSQLPanel.tsx`: lesson navigation, data loading, and completion behavior

## Lesson data model

Each chapter exports a `Chapter` object:

```ts
const intro: Chapter = {
  id: "intro",
  title: "Introduction to SQL",
  lessons: [
    // Lesson objects here
  ],
};

export default intro;
```

Each lesson requires:

- `id`: stable unique kebab-case ID, usually prefixed by chapter ID
- `title`: short display title
- `content`: lesson body as a TypeScript template literal

Optional fields:

- `sampleData`: one-click SQL setup data
- `challenge`: interactive SQL exercise and validator

Theory-only lessons omit `challenge`. The UI then shows a “Mark complete” card.

## Sample data requirements

Use `sampleData` when the lesson needs tables available in DuckDB:

```ts
sampleData: {
  label: "employees table (8 rows)",
  setupSql: EMPLOYEES_SETUP,
  tableNames: ["employees"],
},
```

`setupSql` is an array of SQL statements executed in order. Prefer constants near the top of the chapter file:

```ts
const EMPLOYEES_SETUP = [
  `CREATE OR REPLACE TABLE employees (
    id INTEGER,
    name VARCHAR
  )`,
  `INSERT INTO employees VALUES
    (1, 'Alice'),
    (2, 'Bob')`,
];
```

Guidelines:

- Use `CREATE OR REPLACE TABLE` so reloading data is safe
- Keep datasets small enough for lessons, but large enough to show the concept
- Include all created table names in `tableNames` for data-loaded checks and cleanup
- If a chapter reuses common table names such as `sales`, consider a distinct name like `sales_2` when avoiding interference with nearby lessons matters
- SQL strings can use normal single quotes inside TypeScript template literals without escaping

## Challenge requirements

Use `challenge` for hands-on lessons:

```ts
challenge: {
  prompt: "Select only the name column from employees.",
  hint: "Use SELECT name FROM employees.",
  initialSql: "-- Select names\n",
  solutionSql: "SELECT name\nFROM employees;",
  validate: (result) => {
    // Return { passed, message }
  },
},
```

Required:

- `prompt`
- `validate`

Recommended:

- `hint` for most non-trivial challenges
- `initialSql` to guide the learner
- `solutionSql` so the UI can open the solution in the editor

Validation guidelines:

- Validate columns case-insensitively
- Validate row counts where relevant
- Validate values when ordering, grouping, ranking, or window results matter
- Provide actionable failure messages
- Return a positive confirmation message on success
- Avoid overly brittle validation unless the lesson specifically teaches ordering or exact shape
- Use helper functions such as `getValue` and `hasColumns` when a chapter has multiple validators

## Chapter registration and routing

Existing chapter files live in `src/data/lessons/` with numeric prefixes, such as:

- `01-intro.ts`
- `07-window-functions.ts`
- `12-array-lambdas.ts`

When adding a new chapter:

1. Create `src/data/lessons/<number>-<chapter-name>.ts`
2. Export a default `Chapter`
3. Import it in `src/data/lessons/index.ts`
4. Add it to the ordered `chapters` array
5. Check route-related tests if chapter order changes

Route paths are derived from chapter order and lesson order. Do not hard-code lesson URLs in the lesson data.

## Lesson content style

Write in short paragraphs with concrete examples. Prefer:

- one concept per lesson
- a small motivating example before syntax details
- explicit notes about common surprises
- challenge prompts that mirror the lesson content
- SQL examples that are runnable against the lesson sample data

Use beginner-friendly wording. Avoid unexplained jargon. When introducing a term, immediately show why it matters.

## Supported lesson renderer markup

The lesson body renderer is intentionally lightweight. It is not full Markdown.

Supported block markup:

- Paragraphs separated by blank lines
- SQL fenced code blocks with backticks:

````md
```sql
SELECT *
FROM employees
```
````

- SQL fenced code blocks with tildes, preferred inside TypeScript template literals because they avoid escaping backticks:

```md
~~~sql
SELECT *
FROM employees
~~~
```

- Plain fenced code blocks with either fence and no language:

```md
~~~
FROM
WHERE
SELECT
~~~
```

- Legacy indented code blocks where every line starts with at least two spaces

Supported inline markup:

- Inline code with single backticks: `` `SELECT` ``
- Bold text with double asterisks: `**Aggregate functions**`
- Literal bullets such as `•` inside paragraphs

Not supported unless you update the renderer first:

- Markdown headings like `## Heading`
- Markdown lists using `- item` as semantic lists
- Links like `[text](url)`
- Tables
- Italics
- Nested inline markup such as bold text containing inline code

## Code fence guidance

Prefer tilde fences in lesson `content` template literals:

```ts
content: `This query selects two columns:

~~~sql
SELECT name, salary
FROM employees
~~~

The result keeps one row per employee.`,
```

Use inline backticks for SQL keywords and identifiers in prose:

```ts
content: `Use `SELECT` to choose columns.` // wrong: breaks the template literal
```

Escape inline backticks inside template literals:

```ts
content: `Use \`SELECT\` to choose columns.`
```

For larger SQL examples, use `~~~sql` fences to avoid escaping triple backticks.

## Required workflow

1. Identify whether the change belongs in an existing chapter or a new chapter
2. Inspect nearby lessons for tone, sample data style, and validation patterns
3. Add or update the `Lesson` object in the correct chapter file
4. Add or reuse sample data constants as needed
5. If adding a challenge, include prompt, optional hint, initial SQL, solution SQL, and validation
6. Use only supported renderer markup, preferring `~~~sql` for code blocks
7. If adding a chapter, register it in `src/data/lessons/index.ts`
8. Run `npx tsc -b` after TypeScript lesson changes
9. Run targeted tests if route numbering, lesson lookup, or UI behavior changed

## Validation checklist

Before finishing, verify:

- lesson IDs are unique and kebab-case
- the chapter exports a valid `Chapter`
- new chapters are imported and included in `chapters`
- sample data table names match setup SQL exactly
- solution SQL uses the correct table names and columns
- validation matches the expected output from the sample data
- code fences render without escaping issues
- inline backticks inside template literals are escaped
- `npx tsc -b` passes
