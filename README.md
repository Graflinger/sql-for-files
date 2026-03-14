# SQL for Files 🗄️

**Query CSV, JSON, and Parquet files with SQL directly in your browser**

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?logo=react)](https://reactjs.org/)
[![Powered by DuckDB](https://img.shields.io/badge/Powered%20by-DuckDB-yellow)](https://duckdb.org/)

## 🚀 Overview

**SQL for Files** is a privacy-first, browser-based SQL query interface that allows you to analyze your data files without uploading them anywhere. All processing happens locally in your browser using WebAssembly technology.

Perfect for data analysts, developers, and anyone who needs to quickly query data files without installing database software or uploading sensitive data to cloud services.

🔗 **[Try it now](https://sqlforfiles.app)**

## ✨ Key Features

### 🔒 100% Private & Secure
- **No server uploads of your work** - Files, SQL queries, and query results are processed in your browser and are not uploaded by the app
- Imported files, persisted tables, and query history are stored locally in your browser using IndexedDB
- Theme, layout, and editor preferences are stored locally in your browser using localStorage
- No third-party tracking cookies are used by the app; the website uses privacy-friendly aggregate analytics via Cloudflare Web Analytics

### 📊 Multiple File Formats
- **CSV** - Automatic delimiter detection and type inference
- **JSON** - JSON arrays and newline-delimited JSON (NDJSON)
- **Parquet** - Columnar format with built-in compression

### 🎯 Professional SQL Editor
- **Monaco Editor** (VS Code's editor) with SQL syntax highlighting
- Smart autocomplete for tables, columns, and SQL keywords
- Keyboard shortcuts (Ctrl/Cmd + Enter to execute)
- Execute selected SQL or entire query

### 🔧 Full DuckDB SQL Support
- Complex queries with JOINs across multiple files
- Window functions and aggregations
- CTEs (Common Table Expressions) and subqueries
- Complete analytical SQL capabilities

### 💾 Data Management
- Export query results to CSV (with full dataset, not just displayed rows)
- Export/import entire databases as lossless Parquet ZIP backups
- View table schemas with column types and nullability
- Automatic local persistence in IndexedDB
- Multi-file table management

## 🎯 Use Cases

- **Data Analysis** - Explore CSV/JSON exports, analyze API responses, join multiple data sources
- **Data Engineering** - Test SQL queries, validate transformations, debug pipeline outputs
- **Business Intelligence** - Ad-hoc analysis, data quality checks, combine data from different systems
- **Education** - Learn and practice SQL without database installation

## 🛠️ Technology Stack

- **Frontend Framework**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Database Engine**: DuckDB WASM 1.33
- **SQL Editor**: Monaco Editor
- **Data Processing**: Apache Arrow
- **File Handling**: React Dropzone
- **Styling**: Tailwind CSS 4
- **State Management**: React Context API
- **Persistence**: IndexedDB (via idb-keyval)

## 🚀 Getting Started

### Try Online
Visit **[sqlforfiles.app](https://sqlforfiles.app)** and start querying immediately - no installation required!

### Run Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/graflinger/sql-for-files.git
   cd sql-for-files
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   Navigate to http://localhost:5173
   ```

### Build for Production

```bash
npm run build
npm run preview
```

## 📖 Usage

1. Upload a data file (CSV, JSON, or Parquet)
2. Select a table from the sidebar to view its schema
3. Write a SQL query in the editor
4. Press **Ctrl/Cmd + Enter** to execute
5. Export results to CSV or save the entire database as a Parquet ZIP backup

### Example Queries

```sql
-- Query a CSV file
SELECT * FROM my_data LIMIT 10;

-- Aggregate data
SELECT category, COUNT(*), AVG(price)
FROM products
GROUP BY category
ORDER BY AVG(price) DESC;

-- Join multiple files
SELECT o.order_id, c.customer_name, o.total
FROM orders o
JOIN customers c ON o.customer_id = c.id
WHERE o.order_date > '2024-01-01';

-- Window functions
SELECT
  name,
  salary,
  RANK() OVER (ORDER BY salary DESC) as salary_rank
FROM employees;
```

## 🔐 Privacy & Security

- **Local browser processing** - Files, SQL queries, and query results are processed in your browser and are not uploaded by the app
- **Local browser storage** - Imported files, persisted tables, and query history use IndexedDB; theme, layout, and editor state use localStorage
- **Privacy-friendly analytics only** - No third-party tracking cookies, no fingerprinting, and no query-data tracking; limited aggregate usage metrics are collected via Cloudflare Web Analytics
- **Open source** - Audit the entire codebase on GitHub

## 🤝 Contributing

Contributions are welcome! By contributing, you agree that your contributions will be licensed under the AGPL v3 license.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add YourFeature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)** - see the [LICENSE](LICENSE) file for details.

### Why AGPL v3?

AGPL v3 is specifically designed for web applications and ensures that:
- ✅ **You can freely use, modify, and study** the code
- ✅ **Anyone who deploys a modified version publicly must share their source code** with users
- ✅ **Prevents proprietary forks** - competitors can't take the code and run closed-source versions
- ✅ **Protects the commons** - improvements benefit everyone in the community

This license ensures SQL for Files remains open source while preventing others from running proprietary versions of the service.

## 🙏 Acknowledgments

- [DuckDB](https://duckdb.org/) - High-performance analytical database
- [DuckDB WASM](https://github.com/duckdb/duckdb-wasm) - WebAssembly port
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Code editor
- [Apache Arrow](https://arrow.apache.org/) - Columnar data format
- [React](https://reactjs.org/) - UI framework

## 🗺️ Roadmap

- Parquet and JSON export from query results
- Saved chart presets
- Broader file import options where DuckDB WASM supports them
- Shareable example datasets and starter queries

## 📧 Support

- **Website**: [sqlforfiles.app](https://sqlforfiles.app)
- **Issues**: [GitHub Issues](https://github.com/graflinger/sql-for-files/issues)
