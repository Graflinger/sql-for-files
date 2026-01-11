# SQL for Files 🗄️

**Query CSV, JSON, and Parquet files with SQL directly in your browser**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?logo=react)](https://reactjs.org/)
[![Powered by DuckDB](https://img.shields.io/badge/Powered%20by-DuckDB-yellow)](https://duckdb.org/)

## 🚀 Overview

**SQL for Files** is a privacy-first, browser-based SQL query interface that allows you to analyze your data files without uploading them anywhere. All processing happens locally in your browser using WebAssembly technology.

Perfect for data analysts, developers, and anyone who needs to quickly query data files without installing database software or uploading sensitive data to cloud services.

🔗 **[Try it now](https://sqlforfiles.app)**

## ✨ Key Features

### 🔒 100% Private & Secure
- **Zero server uploads** - Your data never leaves your device
- All processing happens client-side in your browser
- No data collection, no tracking, no analytics
- Perfect for sensitive or confidential data

### 📊 Multiple File Formats
- **CSV** - Comma-separated values with automatic delimiter detection
- **JSON** - JSON arrays and line-delimited JSON
- **Parquet** - Columnar storage format with efficient compression

### ⚡ Lightning Fast Performance
- Powered by **DuckDB WASM** - a high-performance analytical database
- In-memory processing for fast query execution
- Handle datasets with millions of rows
- Optimized for complex analytical queries

### 🎯 Professional SQL Editor
- **Monaco Editor** - The same editor that powers VS Code
- SQL syntax highlighting and auto-completion
- Intelligent code suggestions
- Query history and saved queries
- Keyboard shortcuts (Ctrl/Cmd + Enter to execute)

### 🔧 Advanced SQL Capabilities
- Complex queries with JOINs across multiple files
- Window functions and aggregations
- CTEs (Common Table Expressions)
- Subqueries and nested queries
- Full DuckDB SQL dialect support

### 💾 Flexible Export Options
- Export query results to CSV, JSON, or Parquet
- Download processed data in your preferred format
- Save entire database state for later use

### 🎨 Modern User Interface
- Clean, intuitive design
- Responsive layout works on desktop and mobile
- Dark mode support (coming soon)
- Real-time query result visualization

## 🎯 Use Cases

### Data Analysis
- Quickly explore CSV exports from spreadsheets
- Analyze JSON API responses
- Query log files and event data
- Join data from multiple sources

### Data Engineering
- Test SQL queries before deploying to production
- Validate data transformations
- Debug data pipeline outputs
- Prototype data models

### Business Intelligence
- Ad-hoc analysis of business data
- Quick data quality checks
- Create custom reports from exports
- Combine data from different systems

### Education & Learning
- Learn SQL without installing a database
- Practice queries on sample datasets
- Teach data analysis concepts
- Demonstrate SQL capabilities

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
   git clone https://github.com/yourusername/sql-for-files.git
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

## 📖 Quick Start Guide

1. **Upload a data file** (CSV, JSON, or Parquet)
2. **Select the table** from the sidebar to see its schema
3. **Write a SQL query** in the editor
4. **Press Ctrl/Cmd + Enter** to execute
5. **View results** in the table below
6. **Export results** to your preferred format

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

## 🌟 Why SQL for Files?

### vs. Excel/Google Sheets
- ✅ Handle larger datasets (millions of rows)
- ✅ More powerful query capabilities
- ✅ Better for complex transformations
- ✅ Reproducible analysis with SQL

### vs. Installing PostgreSQL/MySQL
- ✅ Zero installation required
- ✅ Works anywhere with a browser
- ✅ No database server to maintain
- ✅ Instant setup and teardown

### vs. Cloud Analytics Tools
- ✅ Complete data privacy
- ✅ No upload wait times
- ✅ Works offline
- ✅ Free forever

## 🔐 Privacy & Security

- **No server communication** - All processing is client-side
- **No data persistence** - Data is stored only in browser memory
- **No tracking or analytics** - We don't collect any usage data
- **Open source** - Audit the code yourself
- **HTTPS-only** - Secure connection when deployed

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [DuckDB](https://duckdb.org/) - High-performance analytical database
- [DuckDB WASM](https://github.com/duckdb/duckdb-wasm) - WebAssembly port
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Code editor
- [Apache Arrow](https://arrow.apache.org/) - Columnar data format
- [React](https://reactjs.org/) - UI framework

## 📧 Contact & Support

- **Website**: [sqlforfiles.app](https://sqlforfiles.app)
- **Issues**: [GitHub Issues](https://github.com/yourusername/sql-for-files/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/sql-for-files/discussions)

## 🗺️ Roadmap

- [ ] Dark mode support
- [ ] Excel (.xlsx) file support
- [ ] CSV/JSON/Parquet export from query results
- [ ] Query result visualization (charts/graphs)
- [ ] Keyboard shortcuts customization
- [ ] Database schema export
- [ ] SQL query templates library
- [ ] Cloud storage integration (optional)
- [ ] Collaborative query sharing

---

**Built with ❤️ for data enthusiasts everywhere**

*Keywords: SQL editor, CSV query tool, JSON analyzer, Parquet viewer, browser database, DuckDB WASM, data analysis, privacy-first analytics, client-side SQL, WebAssembly database*
