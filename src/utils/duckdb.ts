import type { AsyncDuckDB } from "@duckdb/duckdb-wasm";

export async function withDuckDBConnection<T>(
  db: AsyncDuckDB,
  run: (connection: Awaited<ReturnType<AsyncDuckDB["connect"]>>) => Promise<T>
): Promise<T> {
  const connection = await db.connect();

  try {
    return await run(connection);
  } finally {
    await connection.close();
  }
}
