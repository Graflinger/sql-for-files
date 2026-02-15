# AGENTS.md — Coding Agent Reference

Browser-based SQL query interface using DuckDB-WASM. All processing is client-side.
See `claude.md` for full product context, architecture, and implementation status.

## Build & Run Commands

```bash
npm install              # Install dependencies
npm run dev              # Start Vite dev server (port 5173, --host enabled)
npm run build            # TypeScript check + Vite build + prerender static pages
npm run lint             # ESLint (flat config, TS + React rules)
npm run preview          # Preview production build locally
```

### TypeScript Only

```bash
npx tsc -b               # Type-check all project references (app + node configs)
npx tsc -b --clean       # Clean build artifacts
```

### No Test Framework

There are **no tests** in this project. No vitest, jest, or testing-library is configured.
No `test` script exists in package.json. If adding tests, use Vitest (Vite-native).

## CI/CD

GitHub Actions deploys to GitHub Pages on push to `main` (`.github/workflows/static.yml`).
The build uses `VITE_BASE_PATH=/sql-for-files/` for the GitHub Pages subdirectory.

## Tech Stack

Vite 7, React 19, TypeScript 5.9 (strict), DuckDB-WASM 1.33 (via `duckdb-wasm-kit`),
Monaco Editor, Tailwind CSS 4 (PostCSS plugin), IndexedDB (`idb-keyval`), JSZip,
React Router DOM 7, Apache Arrow 21.

## Project Structure

```
src/
  contexts/         # React contexts (DuckDB, Notifications, EditorTabs)
  hooks/            # Custom hooks (useFileAdd, useQueryExecution, usePersistence, ...)
  components/       # UI components grouped by feature folder
    IDE/            # IDE shell (IDELayout, Sidebar, EditorPanel, ResultsPanel, ...)
    SQLEditor/      # Monaco editor wrapper with autocomplete
    QueryResults/   # Results table + CSV export
    FileAdder/      # Drag-and-drop file upload
    DatabaseManager/# Table list with schema viewer
    Notification/   # Toast notification system
  pages/            # Route-level page components (About, Docs, Privacy, Legal, SQLEditor)
  types/            # Shared TypeScript interfaces
  utils/            # Pure utility functions
```

## Code Style

### Imports

Order: 1) React, 2) third-party, 3) local (relative paths). Separate groups with blank lines.
Use `import type { ... }` for type-only imports (enforced by `verbatimModuleSyntax`).

```ts
import { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";

import Editor from "@monaco-editor/react";

import { useDuckDBContext } from "../../contexts/DuckDBContext";
import type { QueryResult } from "../types/query";
```

### Naming Conventions

| Element          | Convention         | Example                          |
|------------------|--------------------|----------------------------------|
| Components       | PascalCase         | `QueryResults`, `IDELayout`      |
| Component files  | PascalCase.tsx     | `SQLEditor.tsx`, `TableList.tsx`  |
| Hooks            | camelCase, `use*`  | `useFileAdd`, `useQueryExecution` |
| Hook files       | camelCase.ts       | `useFileAdd.ts`                  |
| Contexts         | PascalCase+Context | `DuckDBContext`, `NotificationContext` |
| Interfaces       | PascalCase         | `QueryResult`, `AddProgress`     |
| Constants        | UPPER_SNAKE_CASE   | `DISPLAY_LIMIT`, `STORAGE_KEYS`  |
| Utility files    | camelCase.ts       | `tableName.ts`                   |
| CSS classes      | Tailwind utilities | No CSS modules or custom classes |

### TypeScript

- **Strict mode** is enabled (`strict: true`, `noUnusedLocals`, `noUnusedParameters`)
- Prefer `interface` over `type` for object shapes
- Use `Record<string, unknown>` for generic row data, not `any`
- When `any` is unavoidable (DuckDB Arrow interop), add `// eslint-disable-next-line @typescript-eslint/no-explicit-any`
- Target: ES2022, module: ESNext, JSX: react-jsx
- Use `as Error` for catch clause typing: `catch (err) { const errorObj = err as Error; }`

### Components

- **Functional components only** — no class components
- **One component per file**, filename matches the component name
- Components use `export default function ComponentName()`
- Props defined as inline `interface` above the component; destructure in signature
- Use JSDoc `/** ... */` comments on exported components and hooks

```tsx
interface SQLEditorProps {
  onExecute: (sql: string) => Promise<void>;
  executing: boolean;
  disabled?: boolean;
}

/** SQLEditor provides a Monaco-based SQL code editor. */
export default function SQLEditor({ onExecute, executing, disabled = false }: SQLEditorProps) {
  // ...
}
```

### Hooks & Exports

- Hooks: named `export function useHookName()`
- Return object with named properties: `return { executeQuery, executing, result, error }`
- Use `useState<Type | null>(null)` for nullable state
- Components: `export default function` (one per file)
- Contexts: export both `Provider` component and `useXxxContext` hook from same file
- Types: named `export interface` / `export type`
- Barrel files (`index.ts`): re-export defaults as named for grouped components (see `components/IDE/index.ts`)

### Error Handling

- Wrap **all** async operations in try-catch
- Log errors with `console.error("descriptive message:", err)`
- Show user-facing errors via the notification system: `addNotification({ type: "error", title: "..." })`
- Store error state in hooks: `const [error, setError] = useState<Error | null>(null)`
- Clear previous errors before new operations: `setError(null)`
- Do NOT throw from hooks unless the caller explicitly needs it

### Formatting

- **2-space indentation**, **double quotes**, **semicolons**
- No explicit Prettier config — devcontainer uses Prettier with defaults + format-on-save
- **Tailwind CSS** for all styling — no inline `style` objects except for dynamic values (e.g., resize heights)
- Template literals for string interpolation, backtick SQL queries

### Async Patterns

- Always `async/await`, never raw `.then()` chains
- DuckDB connections must be closed after use: `const conn = await db.connect(); ... await conn.close();`
- Use `finally` blocks for cleanup (removing notifications, resetting loading state)
- Dynamic imports for heavy libraries: `const JSZip = (await import("jszip")).default;`

### Memory Constraints

Browser hard limit: ~4GB (practical: 2-3GB). Query results display max 1000 rows (`DISPLAY_LIMIT`).
Keep full Arrow table in memory for CSV export. Warn at >100K rows, strong warning at >1M.
All processing is in-memory — no disk spillover (OPFS is not used).

## Gitignore Notes

The `.gitignore` excludes all `*.md` files except `claude.md`, `README.md`, and `AGENTS.md`.
Local planning docs (implementation_plan.md, etc.) are intentionally untracked.
