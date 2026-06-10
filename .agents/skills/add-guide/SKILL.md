---
name: add-guide
description: Add SEO guide/blog articles in src/data/guides, especially Medium-style posts that cross-reference Learn SQL lessons. Use for guide content entries, not generic pages or lesson definitions.
---

# Add Guide

Use this skill when adding a new SEO guide or blog-style article to SQL for Files.

## Goal

Create guide entries that:

- live in `src/data/guides.ts`
- render through the existing `/guides/:guideSlug` route
- match the existing guide data model and article renderer
- cross-link to relevant Learn SQL lessons and related guides
- support SEO through metadata, sitemap inclusion, and structured data already wired into the guide page

## When to use

Use this skill for requests such as:

- "Create Medium-style blog posts for the next lessons"
- "Add SEO articles for Learn SQL lessons"
- "Add a guide that links back to lesson X"
- "Write blog-style SQL for Files guide content"

## When not to use

Do not use this skill for:

- editing lesson content in `src/data/lessons` — use `add-lesson`
- creating route-level pages in `src/pages` — use `new-page`
- generic UI changes, hooks, or components
- external blog publishing outside this repo

## Required context

Before writing guide entries, inspect:

1. `src/data/guides.ts` for existing guide style, slugs, related links, and helper functions
2. `src/types/guides.ts` for supported guide block kinds
3. `src/data/lessons/index.ts` and the relevant files in `src/data/lessons/` for valid lesson IDs and lesson order
4. `src/pages/GuideArticle.tsx` if renderer support is unclear

Supported block kinds are currently:

- `paragraph`
- `list`
- `steps`
- `code`
- `callout`

Do not invent new block kinds unless you also update the renderer and tests.

## Content workflow

1. Identify the target lesson or lesson range.
2. Find the lesson IDs and lesson titles in `src/data/lessons`.
3. Choose one guide article per lesson unless the user asks for a combined article.
4. Create concise, SEO-friendly kebab-case slugs.
5. Add each guide object to `guides` in `src/data/guides.ts`.
6. Prefer adding new lesson-focused articles near the top of the array so they appear prominently on `/guides`.
7. Include metadata:
   - `slug`
   - `title`
   - `description` with more than 80 characters
   - `summary` with more than 40 characters
   - `publishedAt`
   - `updatedAt`
   - `category`, usually `Learn SQL` for lesson companion posts
   - at least 3 `keywords`
   - `relatedGuideSlugs`
   - `relatedLessonIds`
   - at least 4 `sections`
8. Cross-link thoughtfully:
   - include the matching lesson ID first in `relatedLessonIds`
   - include adjacent or prerequisite lesson IDs when useful
   - include related guide slugs that already exist
   - if adding multiple guides together, cross-link them to each other by slug
9. Use a Medium-style editorial structure:
   - clear hook in the first section
   - short paragraphs
   - practical examples
   - one or more lists or callouts
   - a final section that invites the reader to continue in the related Learn SQL lesson
10. Include a quick intro to SQL for Files when appropriate:
    - browser-based SQL query interface
    - supports CSV, JSON, and Parquet files
    - runs locally with DuckDB WASM
    - no database server setup required

## SEO guidance

- Use natural, search-oriented titles rather than keyword stuffing.
- Target beginner search phrases for lesson companion posts, such as:
  - "what is a database table"
  - "SQL data types explained"
  - "how to use SELECT in SQL"
  - "SQL WHERE clause examples"
- Keep descriptions readable and specific to the article.
- Avoid duplicate slugs, duplicate titles, and identical descriptions.
- Prefer evergreen wording unless the user asks for news or release content.

## Style guidance

- Keep the voice approachable, practical, and beginner-friendly.
- Write like a concise technical blog post, not documentation bullets only.
- Use `code` blocks for SQL snippets and small table examples.
- Use `callout` blocks for important practical notes.
- Avoid unsupported Markdown inside guide text; the renderer outputs plain text for paragraph/list/callout blocks.
- Escape apostrophes only when TypeScript string syntax requires it.

## Validation

After editing, run when available:

```bash
npm test -- --run src/data/guides.test.ts src/data/publicRoutes.test.ts
npx tsc -b
```

If package commands are unavailable in the environment, report that clearly.

Before finishing, verify:

- all new `relatedLessonIds` exist in `validLessonIds`
- all new `relatedGuideSlugs` point to real guide slugs and do not point to the same guide
- every section ID is kebab-case
- each guide has at least 4 sections
- no route path conflicts are introduced through duplicate slugs
