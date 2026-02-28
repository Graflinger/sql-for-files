import { vi } from "vitest";

/**
 * Creates a mock DuckDB connection with configurable query results.
 */
export function createMockConnection(queryResults?: Record<string, unknown>) {
  return {
    query: vi.fn().mockResolvedValue({
      numRows: 0,
      toArray: () => [],
      schema: { fields: [] },
      slice: () => ({ toArray: () => [] }),
      getChild: () => ({ get: () => null }),
      ...queryResults,
    }),
    close: vi.fn().mockResolvedValue(undefined),
  };
}

/**
 * Creates a mock DuckDB instance.
 */
export function createMockDuckDB(connectionOverride?: ReturnType<typeof createMockConnection>) {
  const mockConn = connectionOverride ?? createMockConnection();

  return {
    connect: vi.fn().mockResolvedValue(mockConn),
    registerFileBuffer: vi.fn().mockResolvedValue(undefined),
    copyFileToBuffer: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
    dropFile: vi.fn().mockResolvedValue(undefined),
    // Expose mock connection for assertions
    _mockConnection: mockConn,
  };
}

/**
 * Creates a mock Arrow result for query tests.
 */
export function createMockArrowResult(
  data: Record<string, unknown>[],
  columns: string[]
) {
  const fields = columns.map((name) => ({ name }));

  return {
    numRows: data.length,
    schema: { fields },
    toArray: () =>
      data.map((row) => {
        const proxy: Record<string, unknown> = { ...row };
        return proxy;
      }),
    slice: (start: number, end: number) => {
      const sliced = data.slice(start, end);
      return {
        toArray: () =>
          sliced.map((row) => {
            const proxy: Record<string, unknown> = { ...row };
            return proxy;
          }),
      };
    },
    getChild: (col: string) => ({
      get: (i: number) => data[i]?.[col] ?? null,
    }),
  };
}
