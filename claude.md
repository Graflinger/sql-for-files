# Agent Reference: SQL-for-Files Implementation

## Product Vision
Browser-based SQL query interface using **DuckDB-WASM**. Client-side first (privacy: "data never leaves device"), optional serverless backend for >500MB files.

**Status**: ✅ Core functionality complete | Database persistence implemented | Production-ready MVP

## Critical Constraints
- **Memory**: 4GB hard browser limit, 2-3GB practical working limit
- **File formats**: CSV, JSON, Parquet ✓ | Excel (.xlsx) ✗ (broken in WASM)
- **No disk spillover**: OPFS experimental/buggy, must handle all data in-memory
- **Bundle size**: DuckDB-WASM (~150MB), JSZip (~97KB gzipped)

## Tech Stack (Current - January 2026)
- **Framework**: Vite 7.3 + React 19.2 + TypeScript + Tailwind CSS
- **Database**: @duckdb/duckdb-wasm 1.33.1-dev5.0, duckdb-wasm-kit 0.1.39
- **Editor**: @monaco-editor/react 4.7.0 (SQL syntax highlighting, autocomplete)
- **Storage**: IndexedDB (via idb-keyval 6.2.2) for file persistence
- **ZIP**: JSZip 3.x for database export/import bundles
- **Routing**: React Router DOM 7.11.0
- **Data Format**: Apache Arrow 21.1.0 (DuckDB native format)

## Architecture Pattern (Current Implementation)

```
FileUploader Component
  ↓
  ├─→ Store file in IndexedDB (key: file:${filename})
  ├─→ Register buffer with DuckDB (db.registerFileBuffer)
  └─→ CREATE TABLE from read_csv_auto/read_json_auto/read_parquet
      ↓
      └─→ Refresh table registry (DuckDBContext)

SQL Editor
  ↓
  ├─→ Monaco Editor (autocomplete: tables, columns, SQL keywords)
  ├─→ Execute query (Ctrl/Cmd+Enter)
  └─→ DuckDB Connection
      ↓
      └─→ Arrow Table Result
          ↓
          ├─→ Convert to JS (max 1000 rows for display)
          ├─→ Keep full Arrow table for export
          └─→ QueryResults Component
              ↓
              └─→ CSV Export (all rows, not just displayed)

Database Export/Import
  ↓
  ├─→ Export: Query all tables → JSON → ZIP bundle
  └─→ Import: Extract ZIP → Register JSON → CREATE TABLE
```

## Core Components (src/ - Implemented)

### Contexts (2 files)
- ✅ `DuckDBContext.tsx`: Global DB instance, table registry, loading state, refreshTables()
- ✅ `NotificationContext.tsx`: Toast notification system (uploading, processing, success, error, info)

### Hooks (3 files)
- ✅ `useFileUpload.ts`: File validation, IndexedDB storage, table creation with progress tracking
- ✅ `useQueryExecution.ts`: Query execution, Arrow → JS conversion (1000 row limit), execution timing, memory warnings
- ✅ `usePersistence.ts`: **NEW** - Database export/import (ZIP bundles), IndexedDB state management

### Components
- ✅ `FileUploader/`: React Dropzone integration, file list, multi-file upload support
- ✅ `SQLEditor/`: Monaco editor with SQL autocomplete (tables, columns, keywords), Ctrl+Enter execution, query save
- ✅ `QueryResults/`: Results table, execution time, row count badges, CSV export (full data), null handling
- ✅ `DatabaseManager/TableList.tsx`: **UPDATED** - Table list, expandable schemas, export/import buttons
- ✅ `Notification/`: Toast container with auto-dismiss, error details, progress states
- ✅ `Navbar/`: Responsive navigation with mobile menu
- ✅ `Layout/`: Page layout wrapper

### Pages (5 pages)
- ✅ `SQLEditor.tsx`: Main application page with 3-column layout
- ✅ `About.tsx`: Landing page with gradient design, feature highlights
- ✅ `Docs.tsx`: Documentation page
- ✅ `Privacy.tsx`: Privacy policy
- ✅ `Legal.tsx`: Legal notice

## Implementation Status (Current)

### ✅ Phase 1: Foundation (Complete)
- ✅ Vite 7.3 + React 19.2 + TypeScript + Tailwind setup
- ✅ DuckDB-WASM 1.33 integration (duckdb-wasm-kit for React hooks)
- ✅ File upload (CSV, JSON, Parquet) with drag-and-drop
- ✅ Table creation with progress tracking
- ✅ Original files stored in IndexedDB for persistence

### ✅ Phase 2: SQL Interface (Complete)
- ✅ Monaco Editor 4.7 integration with SQL syntax highlighting
- ✅ **Smart Autocomplete**: Tables, columns (with types), SQL keywords
- ✅ Query execution with comprehensive error handling
- ✅ Results display (1000 row UI limit, full data for export)
- ✅ Keyboard shortcuts (Ctrl/Cmd+Enter to execute)
- ✅ Selection execution (run selected SQL or full query)
- ❌ Query history (not implemented - future feature)

### ✅ Phase 3: Data Management (Complete)
- ✅ Table list in sidebar with expandable schemas
- ✅ Schema viewer using DESCRIBE (column names, types, nullability)
- ✅ **Database Export**: Export all tables as JSON in ZIP bundle
- ✅ **Database Import**: Restore tables from exported ZIP
- ✅ Multi-table JOINs (DuckDB native support)
- ✅ Comprehensive notification system (5 states: uploading, processing, success, error, info)

### ⚠️ Phase 4: Polish & Deploy (Partial)
- ✅ CSV export from query results (full data, not just displayed rows)
- ❌ Parquet export (planned)
- ❌ JSON export (planned)
- ✅ Keyboard shortcuts (Ctrl+Enter)
- ❌ Dark mode (not implemented)
- ✅ Ready for deployment (static build, no server required)
- ✅ Modern landing page with gradient design
- ✅ Documentation and privacy pages

## NEW: Database Persistence (usePersistence Hook)

### Export Database
```typescript
const { exportDatabase } = usePersistence();
await exportDatabase();
```
**Process**:
1. Query all tables with `DESCRIBE` and `SELECT *`
2. Serialize each table to JSON format
3. Create metadata.json with table schemas, row counts
4. Bundle all JSON files into ZIP
5. Download as `database-export-YYYY-MM-DD.zip`

**ZIP Structure**:
```
database-export-2026-01-11.zip
├── metadata.json         # Table metadata, schemas, row counts
├── table1.json          # Table data (JSON array)
├── table2.json
└── table3.json
```

### Import Database
```typescript
const { importDatabase } = usePersistence();
await importDatabase(zipFile);
```
**Process**:
1. Extract ZIP and read metadata.json
2. For each table: extract JSON → convert to NDJSON → register with DuckDB
3. Execute `CREATE TABLE ... FROM read_json(..., format='newline_delimited')`
4. Refresh table registry
5. Show success notification with import stats

### Future: Auto-Restore (IndexedDB)
- `saveStateToIndexedDB()`: Persist database to IndexedDB
- `restoreStateFromIndexedDB()`: Auto-restore on page load
- `clearSavedState()`: Clear persisted state

## Key Implementation Rules

### Memory Management (Current Implementation)
- ✅ 1000 row limit for query result display (full data kept for export)
- ✅ Memory warnings at >100K rows (strong warning at >1M)
- ⚠️ File size warnings not implemented yet
- ⚠️ Table preview limits not enforced yet
- ⚠️ Performance API monitoring not implemented yet

### File Processing (Current)
```typescript
// CSV - auto-detect delimiters, headers, types
CREATE TABLE name AS SELECT * FROM read_csv_auto('file.csv')

// JSON - handles arrays and newline-delimited JSON
CREATE TABLE name AS SELECT * FROM read_json_auto('file.json')

// Parquet - columnar format with predicate pushdown
CREATE TABLE name AS SELECT * FROM read_parquet('file.parquet')

// Import from database export (NDJSON)
CREATE TABLE name AS SELECT * FROM read_json('file.json',
  auto_detect=true, format='newline_delimited')
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

## Quick Start Commands (Updated)
```bash
# Create Vite + React + TypeScript project
npm create vite@latest . -- --template react-ts

# Core dependencies
npm install @duckdb/duckdb-wasm duckdb-wasm-kit apache-arrow
npm install idb-keyval jszip                    # Storage + ZIP
npm install @monaco-editor/react               # SQL editor
npm install react-dropzone                     # File upload
npm install react-router-dom                   # Routing

# Optional (not currently used but installed)
npm install @tanstack/react-table              # Future: paginated tables

# Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Current package.json versions**:
```json
{
  "@duckdb/duckdb-wasm": "^1.33.1-dev5.0",
  "apache-arrow": "^21.1.0",
  "duckdb-wasm-kit": "^0.1.39",
  "@monaco-editor/react": "^4.7.0",
  "idb-keyval": "^6.2.2",
  "jszip": "^3.10.1",
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "react-dropzone": "^14.3.8",
  "react-router-dom": "^7.11.0"
}
```

## Development Priority (Current Status)

### ✅ Completed (MVP Ready)
1. ✅ **Core loop**: File upload → Table creation → Query → Results
2. ✅ **UX polish**: Loading states, error messages, progress indicators, notifications
3. ✅ **Data management**: Multiple tables, JOINs, schema viewer, expandable table details
4. ✅ **Database persistence**: Export/import as ZIP bundles (JSON format)
5. ✅ **CSV export**: Full data export from query results
6. ✅ **Modern UI**: Landing page, documentation, privacy pages, responsive design

### 🚧 Recommended Next Steps
1. **Query History**: Save executed queries to IndexedDB for easy re-execution
2. **Parquet/JSON Export**: Add export format options in QueryResults component
3. **Dark Mode**: Theme toggle with localStorage persistence
4. **File Size Warnings**: Alert users before uploading >200MB files
5. **Table Previews**: Quick "SELECT * LIMIT 100" buttons in TableList
6. **Auto-Restore**: Load last database state from IndexedDB on app start
7. **Query Cancellation**: Abort long-running queries
8. **Sample Datasets**: Pre-loaded example data for new users

## Feature Highlights (Current Build)

### 🎯 SQL Editor Features
- **Smart Autocomplete**: Type-ahead for tables, columns (with data types), and SQL keywords
- **Selection Execution**: Run highlighted SQL or entire query (Ctrl/Cmd+Enter)
- **Syntax Highlighting**: Full SQL syntax support via Monaco Editor
- **Query Save**: Download query as .txt file for sharing
- **Error Handling**: Friendly error messages with detailed console logs

### 📊 Query Results
- **Efficient Display**: Shows max 1000 rows in UI (warns if truncated)
- **Full Export**: CSV export includes ALL rows, not just displayed ones
- **Null Handling**: Styled "null" badges for null values
- **Performance Stats**: Execution time and row count badges
- **Smart Memory**: Keeps full Arrow table in memory for export

### 🗂️ Database Management
- **Table Explorer**: Expandable table list with schema details (columns, types, nullability)
- **Export Database**: One-click export of entire database as ZIP
- **Import Database**: Restore complete database state from ZIP export
- **Progress Tracking**: Real-time notifications for all operations

### 📁 File Upload
- **Drag & Drop**: Multi-file upload with visual feedback
- **Format Support**: CSV, JSON (array/NDJSON), Parquet
- **Smart Table Names**: Auto-sanitize filenames to valid SQL identifiers
- **Persistence**: Original files stored in IndexedDB (survives page refresh)

### 🎨 UI/UX
- **Modern Design**: Gradient-based aesthetic with Tailwind CSS
- **Responsive**: Mobile-friendly navigation and layout
- **Toast Notifications**: 5 states (uploading, processing, success, error, info)
- **Accessibility**: Semantic HTML, proper ARIA labels
- **Landing Page**: Feature showcase for new users

## Known Limitations
1. **Browser Memory**: Hard limit ~4GB (soft limit ~2-3GB for stability)
2. **Excel Files**: .xlsx not supported (DuckDB-WASM limitation)
3. **No Disk Spillover**: All data must fit in RAM (OPFS not used due to bugs)
4. **Query History**: Not implemented (future feature)
5. **Dark Mode**: Not implemented (future feature)

## References
- implementation_plan.md: Detailed 4-week sprint, code templates
- product_idea.md: Technology rationale, DuckDB-WASM capabilities
- DuckDB-WASM Docs: https://duckdb.org/docs/api/wasm/overview
- duckdb-wasm-kit: https://github.com/holdenmatt/duckdb-wasm-kit
- Apache Arrow JS: https://arrow.apache.org/js/
