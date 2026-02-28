import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFileAdd } from "./useFileAdd";
import { createMockDuckDB } from "../test/mocks/duckdb";
import type { AsyncDuckDB } from "@duckdb/duckdb-wasm";

vi.mock("idb-keyval", () => ({
  set: vi.fn().mockResolvedValue(undefined),
  get: vi.fn(),
  del: vi.fn(),
  keys: vi.fn(() => Promise.resolve([])),
}));

describe("useFileAdd", () => {
  let mockDb: ReturnType<typeof createMockDuckDB>;

  beforeEach(() => {
    mockDb = createMockDuckDB();
  });

  function createFile(name: string, content: string): File {
    return new File([content], name, {
      type: name.endsWith(".csv") ? "text/csv" : "application/json",
    });
  }

  it("starts with adding=false and empty progress", () => {
    const { result } = renderHook(() =>
      useFileAdd(mockDb as unknown as AsyncDuckDB)
    );

    expect(result.current.adding).toBe(false);
    expect(result.current.progress).toEqual([]);
  });

  it("throws if db is null", async () => {
    const { result } = renderHook(() => useFileAdd(null));

    await expect(
      act(async () => {
        await result.current.addFile(createFile("test.csv", "a,b\n1,2"));
      })
    ).rejects.toThrow("Database not initialized");
  });

  it("adds a CSV file successfully", async () => {
    const { result } = renderHook(() =>
      useFileAdd(mockDb as unknown as AsyncDuckDB)
    );

    let tableName: string;
    await act(async () => {
      tableName = await result.current.addFile(
        createFile("users.csv", "name,age\nAlice,30")
      );
    });

    expect(tableName!).toBe("users");
    expect(mockDb.registerFileBuffer).toHaveBeenCalledWith(
      "users.csv",
      expect.any(Uint8Array)
    );
    expect(mockDb._mockConnection.query).toHaveBeenCalledWith(
      expect.stringContaining("read_csv_auto")
    );
  });

  it("adds a JSON file successfully", async () => {
    const { result } = renderHook(() =>
      useFileAdd(mockDb as unknown as AsyncDuckDB)
    );

    await act(async () => {
      await result.current.addFile(
        createFile("data.json", '[{"a":1}]')
      );
    });

    expect(mockDb._mockConnection.query).toHaveBeenCalledWith(
      expect.stringContaining("read_json_auto")
    );
  });

  it("adds a Parquet file successfully", async () => {
    const file = new File([new ArrayBuffer(10)], "data.parquet", {
      type: "application/octet-stream",
    });

    const { result } = renderHook(() =>
      useFileAdd(mockDb as unknown as AsyncDuckDB)
    );

    await act(async () => {
      await result.current.addFile(file);
    });

    expect(mockDb._mockConnection.query).toHaveBeenCalledWith(
      expect.stringContaining("read_parquet")
    );
  });

  it("rejects unsupported file types", async () => {
    const file = new File(["data"], "test.xlsx", {
      type: "application/vnd.openxmlformats",
    });

    const { result } = renderHook(() =>
      useFileAdd(mockDb as unknown as AsyncDuckDB)
    );

    await expect(
      act(async () => {
        await result.current.addFile(file);
      })
    ).rejects.toThrow("Unsupported file type");
  });

  it("uses tableNameOverride when provided", async () => {
    const { result } = renderHook(() =>
      useFileAdd(mockDb as unknown as AsyncDuckDB)
    );

    let tableName: string;
    await act(async () => {
      tableName = await result.current.addFile(
        createFile("users.csv", "name\nAlice"),
        { tableNameOverride: "my_users" }
      );
    });

    expect(tableName!).toBe("my_users");
  });

  it("sanitizes tableNameOverride", async () => {
    const { result } = renderHook(() =>
      useFileAdd(mockDb as unknown as AsyncDuckDB)
    );

    let tableName: string;
    await act(async () => {
      tableName = await result.current.addFile(
        createFile("users.csv", "name\nAlice"),
        { tableNameOverride: "my-users table" }
      );
    });

    expect(tableName!).toBe("my_users_table");
  });

  it("passes CSV options to the query", async () => {
    const { result } = renderHook(() =>
      useFileAdd(mockDb as unknown as AsyncDuckDB)
    );

    await act(async () => {
      await result.current.addFile(
        createFile("data.csv", "a;b\n1;2"),
        {
          csvOptions: {
            delim: ";",
            header: true,
            skip: 1,
          },
        }
      );
    });

    const queryCall = mockDb._mockConnection.query.mock.calls[0][0] as string;
    expect(queryCall).toContain("delim=';'");
    expect(queryCall).toContain("header=true");
    expect(queryCall).toContain("skip=1");
  });

  it("updates progress during file addition", async () => {
    const { result } = renderHook(() =>
      useFileAdd(mockDb as unknown as AsyncDuckDB)
    );

    await act(async () => {
      await result.current.addFile(
        createFile("test.csv", "a\n1")
      );
    });

    // After completion, progress should show done
    const p = result.current.progress.find((p) => p.fileName === "test.csv");
    expect(p).toBeDefined();
    expect(p!.status).toBe("done");
    expect(p!.progress).toBe(100);
  });

  it("clears progress", async () => {
    const { result } = renderHook(() =>
      useFileAdd(mockDb as unknown as AsyncDuckDB)
    );

    await act(async () => {
      await result.current.addFile(createFile("test.csv", "a\n1"));
    });

    act(() => {
      result.current.clearProgress();
    });

    expect(result.current.progress).toEqual([]);
  });

  it("records error in progress on failure", async () => {
    mockDb._mockConnection.query.mockRejectedValue(
      new Error("Parse error")
    );

    const { result } = renderHook(() =>
      useFileAdd(mockDb as unknown as AsyncDuckDB)
    );

    let thrownError: Error | undefined;
    await act(async () => {
      try {
        await result.current.addFile(createFile("bad.csv", "not csv"));
      } catch (err) {
        thrownError = err as Error;
      }
    });

    expect(thrownError).toBeDefined();
    expect(thrownError!.message).toBe("Parse error");

    const p = result.current.progress.find((p) => p.fileName === "bad.csv");
    expect(p).toBeDefined();
    expect(p!.status).toBe("error");
    expect(p!.error).toBe("Parse error");
  });
});

// Test the buildCsvOptionsSql and escapeSqlString functions indirectly
// by checking the SQL generated for various CSV options
describe("CSV options SQL generation", () => {
  let mockDb: ReturnType<typeof createMockDuckDB>;

  beforeEach(() => {
    mockDb = createMockDuckDB();
  });

  function createCsv(content: string): File {
    return new File([content], "test.csv", { type: "text/csv" });
  }

  it("generates no options when none provided", async () => {
    const { result } = renderHook(() =>
      useFileAdd(mockDb as unknown as AsyncDuckDB)
    );

    await act(async () => {
      await result.current.addFile(createCsv("a\n1"));
    });

    const query = mockDb._mockConnection.query.mock.calls[0][0] as string;
    expect(query).toContain("read_csv_auto('test.csv')");
    // No trailing options
    expect(query).not.toContain("delim=");
  });

  it("escapes single quotes in option values", async () => {
    const { result } = renderHook(() =>
      useFileAdd(mockDb as unknown as AsyncDuckDB)
    );

    await act(async () => {
      await result.current.addFile(createCsv("a\n1"), {
        csvOptions: { quote: "'" },
      });
    });

    const query = mockDb._mockConnection.query.mock.calls[0][0] as string;
    expect(query).toContain("quote=''''");
  });

  it("generates all CSV options when provided", async () => {
    const { result } = renderHook(() =>
      useFileAdd(mockDb as unknown as AsyncDuckDB)
    );

    await act(async () => {
      await result.current.addFile(createCsv("a\n1"), {
        csvOptions: {
          skip: 2,
          header: false,
          delim: "\t",
          quote: '"',
          escape: "\\",
          nullStr: "NA",
          dateformat: "%Y-%m-%d",
          decimal_separator: ",",
        },
      });
    });

    const query = mockDb._mockConnection.query.mock.calls[0][0] as string;
    expect(query).toContain("skip=2");
    expect(query).toContain("header=false");
    expect(query).toContain("delim='\t'");
    expect(query).toContain("nullstr='NA'");
    expect(query).toContain("dateformat='%Y-%m-%d'");
    expect(query).toContain("decimal_separator=','");
  });
});
