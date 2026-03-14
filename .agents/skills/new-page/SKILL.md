---
name: new-page
description: Add a new route-level page that matches this repo's existing layout, Tailwind styling, SEO, and routing conventions. Use for pages in src/pages, not for components, hooks, or IDE subfeatures.
---

# New Page

Use this skill when creating a new route-level page for SQL for Files.

## Goal

Create a page that feels native to the existing site:

- clean
- minimal
- Tailwind-based
- slate-first visual language
- consistent with current spacing, cards, and typography

## Inputs to confirm

Before implementing, confirm or infer carefully:

- page name
- route path
- page purpose
- whether it should appear in navigation or footer
- whether it needs structured data beyond standard SEO
- whether related content or links should be updated

Ask only when a missing detail materially changes the result.

## Required workflow

1. Create the page in `src/pages/<PageName>.tsx`
2. Use `export default function <PageName>()`
3. Add a short JSDoc comment above the exported component
4. Import and render `SEO` from `../components/SEO/SEO`
5. Set appropriate `title`, `description`, `canonicalPath`, `ogType`, and `imageAlt`
6. Add structured data only when it clearly helps the page
7. Register the route in `src/App.tsx`
8. Update navigation, footer, or internal links only when the request implies discoverability
9. Keep the implementation simple and readable

## Styling rules

Follow existing patterns from `src/pages/About.tsx`, `src/pages/Docs.tsx`, `src/pages/Privacy.tsx`, and `src/pages/Legal.tsx`.

Prefer:

- top-level wrappers using `theme-page`
- centered containers such as `max-w-4xl` or `max-w-5xl`
- horizontal padding patterns like `px-4 sm:px-6 lg:px-8`
- headings in `text-slate-900`
- body copy in `text-slate-500` or `text-slate-700`
- cards and content sections using `rounded-xl border border-slate-200`
- restrained accent usage, mainly blue/green/amber when helpful

Avoid:

- new visual systems
- custom CSS modules
- inline style objects for static styling
- unnecessary abstractions for simple page content

## Structure guidance

For simple informational pages, a strong default is:

- fragment wrapper
- `SEO`
- page wrapper with `theme-page`
- constrained container
- optional bordered card
- `h1` plus clear supporting sections

For richer marketing pages, use:

- `max-w-5xl`
- section dividers like `border-t border-slate-100`
- consistent CTA styling already used elsewhere in the app

## Validation checklist

Before finishing, verify:

- file location and component naming are correct
- imports follow repo ordering
- route path matches `canonicalPath`
- no unused imports or variables remain
- styling matches existing page patterns
- any added links are intentional and consistent

If asked to verify with commands, run the relevant checks such as lint or build.
