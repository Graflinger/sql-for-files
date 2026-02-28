import { describe, it, expect, vi, beforeEach } from "vitest";
import { rowCountWarning, convertToCSV } from "./databasePersistence";

// Mock idb-keyval for the functions that use it
vi.mock("idb-keyval", () => ({
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  keys: vi.fn(() => Promise.resolve([])),
}));

describe("rowCountWarning", () => {
  it("returns null for small row counts", () => {
    expect(rowCountWarning("test", 100)).toBeNull();
    expect(rowCountWarning("test", 999_999)).toBeNull();
  });

  it("returns warn for counts over 1M", () => {
    const result = rowCountWarning("test", 1_000_001);
    expect(result).not.toBeNull();
    expect(result!.level).toBe("warn");
    expect(result!.message).toContain("test");
    expect(result!.message).toContain("1,000,001");
  });

  it("returns strong for counts over 5M", () => {
    const result = rowCountWarning("test", 5_000_001);
    expect(result).not.toBeNull();
    expect(result!.level).toBe("strong");
    expect(result!.message).toContain("test");
    expect(result!.message).toContain("significant memory");
  });

  it("returns warn (not strong) at exactly 1M + 1", () => {
    const result = rowCountWarning("t", 1_000_001);
    expect(result!.level).toBe("warn");
  });

  it("returns strong at exactly 5M + 1", () => {
    const result = rowCountWarning("t", 5_000_001);
    expect(result!.level).toBe("strong");
  });

  it("returns null at exactly 1M", () => {
    expect(rowCountWarning("t", 1_000_000)).toBeNull();
  });
});

describe("convertToCSV", () => {
  it("returns header-only for empty data", () => {
    const result = convertToCSV([], ["name", "age"]);
    expect(result).toBe("name,age\n");
  });

  it("converts simple data correctly", () => {
    const data = [
      { name: "Alice", age: 30 },
      { name: "Bob", age: 25 },
    ];
    const result = convertToCSV(data, ["name", "age"]);
    expect(result).toBe("name,age\nAlice,30\nBob,25");
  });

  it("handles null and undefined values", () => {
    const data = [{ name: null, age: undefined }];
    const result = convertToCSV(data, ["name", "age"]);
    expect(result).toBe("name,age\n,");
  });

  it("escapes values containing commas", () => {
    const data = [{ city: "San Francisco, CA" }];
    const result = convertToCSV(data, ["city"]);
    expect(result).toBe('city\n"San Francisco, CA"');
  });

  it("escapes values containing double quotes", () => {
    const data = [{ text: 'He said "hello"' }];
    const result = convertToCSV(data, ["text"]);
    expect(result).toBe('text\n"He said ""hello"""');
  });

  it("escapes values containing newlines", () => {
    const data = [{ text: "line1\nline2" }];
    const result = convertToCSV(data, ["text"]);
    expect(result).toBe('text\n"line1\nline2"');
  });

  it("escapes values containing carriage returns", () => {
    const data = [{ text: "line1\rline2" }];
    const result = convertToCSV(data, ["text"]);
    expect(result).toBe('text\n"line1\rline2"');
  });

  it("handles BigInt values", () => {
    const data = [{ count: BigInt(42) }];
    const result = convertToCSV(data, ["count"]);
    expect(result).toBe("count\n42");
  });

  it("handles Date values", () => {
    const date = new Date("2024-01-15T10:30:00.000Z");
    const data = [{ created: date }];
    const result = convertToCSV(data, ["created"]);
    expect(result).toBe("created\n2024-01-15T10:30:00.000Z");
  });

  it("respects column ordering", () => {
    const data = [{ b: 2, a: 1, c: 3 }];
    const result = convertToCSV(data, ["c", "a", "b"]);
    expect(result).toBe("c,a,b\n3,1,2");
  });

  it("handles boolean values", () => {
    const data = [{ active: true, archived: false }];
    const result = convertToCSV(data, ["active", "archived"]);
    expect(result).toBe("active,archived\ntrue,false");
  });

  it("handles column names that contain commas", () => {
    const data = [{ "name,first": "Alice" }];
    const result = convertToCSV(data, ["name,first"]);
    expect(result).toContain('"name,first"');
  });
});

describe("removeTableFromIndexedDB", () => {
  let removeTableFromIndexedDB: typeof import("./databasePersistence").removeTableFromIndexedDB;
  let idbDel: ReturnType<typeof vi.fn>;
  let idbGet: ReturnType<typeof vi.fn>;
  let idbSet: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    const idbModule = await import("idb-keyval");
    idbDel = idbModule.del as ReturnType<typeof vi.fn>;
    idbGet = idbModule.get as ReturnType<typeof vi.fn>;
    idbSet = idbModule.set as ReturnType<typeof vi.fn>;

    const mod = await import("./databasePersistence");
    removeTableFromIndexedDB = mod.removeTableFromIndexedDB;
  });

  it("deletes the parquet key and updates meta", async () => {
    idbGet.mockResolvedValue({
      savedAt: "2024-01-01",
      tableNames: ["users", "orders"],
    });

    await removeTableFromIndexedDB("users");

    expect(idbDel).toHaveBeenCalledWith("db-parquet:users");
    expect(idbSet).toHaveBeenCalledWith(
      "db-meta",
      expect.objectContaining({
        tableNames: ["orders"],
      })
    );
  });

  it("handles missing meta gracefully", async () => {
    idbGet.mockResolvedValue(undefined);
    await removeTableFromIndexedDB("users");
    expect(idbDel).toHaveBeenCalledWith("db-parquet:users");
    expect(idbSet).not.toHaveBeenCalled();
  });
});

describe("clearAllDatabaseState", () => {
  let clearAllDatabaseState: typeof import("./databasePersistence").clearAllDatabaseState;
  let idbDel: ReturnType<typeof vi.fn>;
  let idbKeys: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    const idbModule = await import("idb-keyval");
    idbDel = idbModule.del as ReturnType<typeof vi.fn>;
    idbKeys = idbModule.keys as ReturnType<typeof vi.fn>;

    const mod = await import("./databasePersistence");
    clearAllDatabaseState = mod.clearAllDatabaseState;
  });

  it("deletes all db-related keys", async () => {
    idbKeys.mockResolvedValue([
      "db-meta",
      "db-parquet:users",
      "db-parquet:orders",
      "file:test.csv",
      "other-key",
    ]);

    await clearAllDatabaseState();

    expect(idbDel).toHaveBeenCalledWith("db-meta");
    expect(idbDel).toHaveBeenCalledWith("db-parquet:users");
    expect(idbDel).toHaveBeenCalledWith("db-parquet:orders");
    expect(idbDel).toHaveBeenCalledWith("file:test.csv");
    expect(idbDel).not.toHaveBeenCalledWith("other-key");
  });

  it("handles empty keystore", async () => {
    idbKeys.mockResolvedValue([]);
    await clearAllDatabaseState();
    expect(idbDel).not.toHaveBeenCalled();
  });
});
