#!/bin/sh
# Copies DuckDB WASM bundles from node_modules to public/ for self-hosting.
# Run automatically via npm postinstall.

DIST="node_modules/@duckdb/duckdb-wasm/dist"
DEST="public"

cp "$DIST/duckdb-mvp.wasm" "$DEST/"
cp "$DIST/duckdb-eh.wasm" "$DEST/"
cp "$DIST/duckdb-browser-mvp.worker.js" "$DEST/"
cp "$DIST/duckdb-browser-eh.worker.js" "$DEST/"

echo "DuckDB WASM bundles copied to $DEST/"
