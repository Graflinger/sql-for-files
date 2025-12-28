# Agent Reference: SQL-for-Files Implementation

## Product Vision
Browser-based SQL query interface using **DuckDB-WASM**. Client-side first (privacy: "data never leaves device"), optional serverless backend for >500MB files.

## Critical Constraints
- **Memory**: 4GB hard browser limit, 2-3GB practical working limit
- **File formats**: CSV, JSON, Parquet ✓ | Excel (.xlsx) ✗ (broken in WASM)
- **No disk spillover**: OPFS experimental/buggy, must handle all data in-memory
- **Bundle size**: DuckDB-WASM = 3.5MB

## Tech Stack
- **Framework**: Vite + React 18+ + TypeScript + Tailwind CSS
- **Database**: @duckdb/duckdb-wasm 1.30.0, duckdb-wasm-kit (React hooks)
- **Editor**: Monaco Editor (SQL syntax highlighting)
- **Storage**: IndexedDB (via idb-keyval) for query history, file metadata
- **Tables**: @tanstack/react-table
- **Workers**: Web Worker for DuckDB (prevent UI blocking)

## Architecture Pattern

```
FileUploader → IndexedDB (original file)
           → DuckDB.registerFileBuffer()
           → CREATE TABLE AS SELECT * FROM read_csv_auto('file')
           → Update table registry

SQLEditor → Web Worker (DuckDB query)
         → Arrow IPC results
         → Convert to JS objects
         → ResultsViewer
         → Save to query history
```

## Core Components (src/)

### Contexts
- `DuckDBContext.tsx`: Global DB instance, table registry, loading state

### Hooks
- `useDuckDB.ts`: DB initialization, connection management
- `useFileUpload.ts`: File validation, upload progress, table creation
- `useQueryExecution.ts`: Query execution, Arrow → JS conversion, timing
- `usePersistence.ts`: IndexedDB operations for history/exports

### Components
- `FileUploader/`: Dropzone, file list, progress indicators
- `SQLEditor/`: Monaco editor, query history, saved queries
- `ResultsViewer/`: Table display, pagination, CSV/Parquet/JSON export
- `DatabaseManager/`: Table list, schema viewer, database export

## Implementation Phases (4 weeks)

### Week 1: Foundation
- Vite + React + TS + Tailwind setup
- DuckDB-WASM integration with Web Worker
- File upload (CSV, JSON, Parquet)
- Basic table creation

### Week 2: SQL Interface
- Monaco Editor integration
- Query execution with error handling
- Results display with pagination
- Query history (IndexedDB)

### Week 3: Data Management
- Table schema viewer (DESCRIBE TABLE)
- Database persistence (Arrow IPC → IndexedDB)
- Multi-table JOINs
- Export database as Parquet

### Week 4: Polish & Deploy
- Export results (CSV/Parquet/JSON)
- Keyboard shortcuts (Ctrl+Enter)
- Dark mode
- Deploy to Cloudflare Pages/Vercel

## Key Implementation Rules

### Memory Management
- Add file size warnings (>200MB)
- Default LIMIT 1000 for query results
- Use LIMIT 100 for table previews
- Monitor browser memory via Performance API

### File Processing
```typescript
// CSV
CREATE TABLE name AS SELECT * FROM read_csv_auto('file.csv')

// JSON
CREATE TABLE name AS SELECT * FROM read_json_auto('file.json')

// Parquet (optimized: predicate pushdown)
CREATE TABLE name AS SELECT * FROM read_parquet('file.parquet')
```

### Error Handling
- Wrap all async in try-catch
- 30-second query timeout
- User-friendly messages (detailed errors to console)
- Show loading states for all async operations

### Performance
- Web Workers prevent UI blocking
- Virtual scrolling for large results
- React.memo for expensive components
- Cache query results in state

### Security
- Client-only processing (no server data transmission)
- Clear privacy messaging in UI
- No query content analytics
- HTTPS-only deployment

## Serverless Backend (Optional)
**Trigger**: Files >500MB OR mobile memory constraints

### Architecture
- AWS Lambda (10GB memory, 15min timeout)
- S3 temporary storage (1-hour auto-delete lifecycle)
- Ephemeral processing: upload → process → return → delete
- Never log query contents

### Cost (10K users, 1K cloud queries/month)
- Lambda: $10-30
- S3: $5-10
- CloudFront: $10-20
- **Total**: ~$30-65/month

## Quick Start Commands
```bash
npm create vite@latest . -- --template react-ts
npm install @duckdb/duckdb-wasm duckdb-wasm-kit apache-arrow
npm install -D tailwindcss postcss autoprefixer
npm install idb-keyval react-dropzone @monaco-editor/react
npm install @tanstack/react-table
npx tailwindcss init -p
```

## Development Priority
1. **Core loop**: File upload → Table creation → Query → Results
2. **UX polish**: Loading states, error messages, progress indicators
3. **Data management**: Multiple tables, JOINs, schema viewer
4. **Persistence**: Query history, database export/restore
5. **Exports**: CSV/Parquet/JSON from results
6. **Deploy**: Static hosting (Cloudflare Pages/Vercel)

## References
- implementation_plan.md: Detailed 4-week sprint, code templates
- product_idea.md: Technology rationale, DuckDB-WASM capabilities
- DuckDB-WASM Docs: https://duckdb.org/docs/api/wasm/overview
- duckdb-wasm-kit: https://github.com/holdenmatt/duckdb-wasm-kit
