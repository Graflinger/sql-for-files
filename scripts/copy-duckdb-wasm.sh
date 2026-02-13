#!/bin/sh
# Copies DuckDB worker JS files from node_modules to public/ for self-hosting.
# WASM files are loaded from CDN (too large for Cloudflare Pages 25 MiB limit).
# Run automatically via npm postinstall.

DIST="node_modules/@duckdb/duckdb-wasm/dist"
DEST="public"

cp "$DIST/duckdb-browser-mvp.worker.js" "$DEST/"
cp "$DIST/duckdb-browser-eh.worker.js" "$DEST/"

echo "DuckDB worker JS files copied to $DEST/"
