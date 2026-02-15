import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useQueryExecution } from "./useQueryExecution";
import { createMockDuckDB, createMockArrowResult } from "../test/mocks/duckdb";
import type { AsyncDuckDB } from "@duckdb/duckdb-wasm";

describe("useQueryExecution", () => {
  let mockDb: ReturnType<typeof createMockDuckDB>;

  beforeEach(() => {
    mockDb = createMockDuckDB();
  });

  it("starts with no result and not executing", () => {
    const { result } = renderHook(() =>
      useQueryExecution(mockDb as unknown as AsyncDuckDB)
    );

    expect(result.current.executing).toBe(false);
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("throws if db is null", async () => {
    const { result } = renderHook(() => useQueryExecution(null));

    await expect(
      act(async () => {
        await result.current.executeQuery("SELECT 1");
      })
    ).rejects.toThrow("Database not initialized");
  });

  it("executes a query and returns results", async () => {
    const mockArrow = createMockArrowResult(
      [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
      ],
      ["id", "name"]
    );

    mockDb._mockConnection.query.mockResolvedValue(mockArrow);

    const { result } = renderHook(() =>
      useQueryExecution(mockDb as unknown as AsyncDuckDB)
    );

    await act(async () => {
      await result.current.executeQuery("SELECT * FROM users");
    });

    expect(result.current.result).not.toBeNull();
    expect(result.current.result!.columns).toEqual(["id", "name"]);
    expect(result.current.result!.rowCount).toBe(2);
    expect(result.current.result!.data).toHaveLength(2);
    expect(result.current.result!.wasTruncated).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("sets error on query failure", async () => {
    mockDb._mockConnection.query.mockRejectedValue(
      new Error("Syntax error")
    );

    const { result } = renderHook(() =>
      useQueryExecution(mockDb as unknown as AsyncDuckDB)
    );

    await act(async () => {
      await result.current.executeQuery("INVALID SQL");
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.error!.message).toBe("Syntax error");
    expect(result.current.result).toBeNull();
  });

  it("sets executing to false after completion", async () => {
    const mockArrow = createMockArrowResult([], []);
    mockDb._mockConnection.query.mockResolvedValue(mockArrow);

    const { result } = renderHook(() =>
      useQueryExecution(mockDb as unknown as AsyncDuckDB)
    );

    await act(async () => {
      await result.current.executeQuery("SELECT 1");
    });

    expect(result.current.executing).toBe(false);
  });

  it("sets executing to false after failure", async () => {
    mockDb._mockConnection.query.mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() =>
      useQueryExecution(mockDb as unknown as AsyncDuckDB)
    );

    await act(async () => {
      await result.current.executeQuery("SELECT 1");
    });

    expect(result.current.executing).toBe(false);
  });

  it("tracks execution time", async () => {
    const mockArrow = createMockArrowResult([{ a: 1 }], ["a"]);
    mockDb._mockConnection.query.mockResolvedValue(mockArrow);

    const { result } = renderHook(() =>
      useQueryExecution(mockDb as unknown as AsyncDuckDB)
    );

    await act(async () => {
      await result.current.executeQuery("SELECT 1 AS a");
    });

    expect(result.current.result!.executionTime).toBeGreaterThanOrEqual(0);
  });

  it("calls onQueryExecuted callback on success", async () => {
    const mockArrow = createMockArrowResult([{ a: 1 }], ["a"]);
    mockDb._mockConnection.query.mockResolvedValue(mockArrow);
    const onQueryExecuted = vi.fn();

    const { result } = renderHook(() =>
      useQueryExecution(mockDb as unknown as AsyncDuckDB, { onQueryExecuted })
    );

    await act(async () => {
      await result.current.executeQuery("SELECT 1 AS a");
    });

    expect(onQueryExecuted).toHaveBeenCalledWith(
      expect.objectContaining({
        query: "SELECT 1 AS a",
        status: "success",
        rowCount: 1,
      })
    );
  });

  it("calls onQueryExecuted callback on error", async () => {
    mockDb._mockConnection.query.mockRejectedValue(new Error("bad sql"));
    const onQueryExecuted = vi.fn();

    const { result } = renderHook(() =>
      useQueryExecution(mockDb as unknown as AsyncDuckDB, { onQueryExecuted })
    );

    await act(async () => {
      await result.current.executeQuery("BAD SQL");
    });

    expect(onQueryExecuted).toHaveBeenCalledWith(
      expect.objectContaining({
        query: "BAD SQL",
        status: "error",
        error: "bad sql",
      })
    );
  });

  it("marks results as truncated when exceeding DISPLAY_LIMIT", async () => {
    // Create data with more than 1000 rows
    const bigData = Array.from({ length: 1500 }, (_, i) => ({ id: i }));
    const mockArrow = {
      numRows: 1500,
      schema: { fields: [{ name: "id" }] },
      toArray: () => bigData,
      slice: (start: number, end: number) => ({
        toArray: () => bigData.slice(start, end),
      }),
      getChild: (col: string) => ({
        get: (i: number) => bigData[i]?.[col as keyof (typeof bigData)[0]] ?? null,
      }),
    };

    mockDb._mockConnection.query.mockResolvedValue(mockArrow);

    const { result } = renderHook(() =>
      useQueryExecution(mockDb as unknown as AsyncDuckDB)
    );

    await act(async () => {
      await result.current.executeQuery("SELECT * FROM big_table");
    });

    expect(result.current.result!.wasTruncated).toBe(true);
    expect(result.current.result!.rowCount).toBe(1500);
    expect(result.current.result!.displayRowCount).toBe(1000);
    expect(result.current.result!.data).toHaveLength(1000);
  });

  it("clears previous error before new execution", async () => {
    mockDb._mockConnection.query.mockRejectedValueOnce(new Error("first error"));

    const { result } = renderHook(() =>
      useQueryExecution(mockDb as unknown as AsyncDuckDB)
    );

    // First call — error
    await act(async () => {
      await result.current.executeQuery("BAD");
    });
    expect(result.current.error).not.toBeNull();

    // Second call — success
    const mockArrow = createMockArrowResult([{ a: 1 }], ["a"]);
    mockDb._mockConnection.query.mockResolvedValue(mockArrow);

    await act(async () => {
      await result.current.executeQuery("SELECT 1 AS a");
    });

    expect(result.current.error).toBeNull();
    expect(result.current.result).not.toBeNull();
  });
});
