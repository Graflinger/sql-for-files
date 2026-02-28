import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

vi.mock("idb-keyval", () => ({
  get: vi.fn(),
  set: vi.fn().mockResolvedValue(undefined),
}));

describe("useQueryHistory", () => {
  let idbGet: ReturnType<typeof vi.fn>;
  let idbSet: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.resetModules();

    const idb = await import("idb-keyval");
    idbGet = idb.get as unknown as ReturnType<typeof vi.fn>;
    idbSet = idb.set as unknown as ReturnType<typeof vi.fn>;

    idbGet.mockResolvedValue(undefined);
    idbSet.mockResolvedValue(undefined);
  });

  async function importHook() {
    const mod = await import("./useQueryHistory");
    return mod.useQueryHistory;
  }

  it("starts with empty history and loading=true", async () => {
    const useQueryHistory = await importHook();
    const { result } = renderHook(() => useQueryHistory());

    // Initially loading
    expect(result.current.loading).toBe(true);

    // Wait for load to complete
    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.history).toEqual([]);
  });

  it("loads history from IndexedDB on mount", async () => {
    idbGet.mockResolvedValue([
      { id: "1", query: "SELECT 1", timestamp: 1000, status: "success" },
    ]);

    const useQueryHistory = await importHook();
    const { result } = renderHook(() => useQueryHistory());

    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].query).toBe("SELECT 1");
  });

  it("adds a query entry", async () => {
    const useQueryHistory = await importHook();
    const { result } = renderHook(() => useQueryHistory());

    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.addQuery({
        query: "SELECT * FROM users",
        status: "success",
        rowCount: 10,
        executionTime: 42,
      });
    });

    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].query).toBe("SELECT * FROM users");
    expect(result.current.history[0].status).toBe("success");
    expect(result.current.history[0].rowCount).toBe(10);
    expect(idbSet).toHaveBeenCalledWith("query-history", expect.any(Array));
  });

  it("adds new entries to the front", async () => {
    const useQueryHistory = await importHook();
    const { result } = renderHook(() => useQueryHistory());

    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.addQuery({
        query: "SELECT 1",
        status: "success",
      });
    });

    await act(async () => {
      await result.current.addQuery({
        query: "SELECT 2",
        status: "success",
      });
    });

    expect(result.current.history[0].query).toBe("SELECT 2");
    expect(result.current.history[1].query).toBe("SELECT 1");
  });

  it("deletes a query entry", async () => {
    idbGet.mockResolvedValue([
      { id: "to-delete", query: "SELECT 1", timestamp: 1000, status: "success" },
      { id: "keep", query: "SELECT 2", timestamp: 2000, status: "success" },
    ]);

    const useQueryHistory = await importHook();
    const { result } = renderHook(() => useQueryHistory());

    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.deleteQuery("to-delete");
    });

    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].id).toBe("keep");
  });

  it("clears all history", async () => {
    idbGet.mockResolvedValue([
      { id: "1", query: "SELECT 1", timestamp: 1000, status: "success" },
    ]);

    const useQueryHistory = await importHook();
    const { result } = renderHook(() => useQueryHistory());

    await vi.waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.clearHistory();
    });

    expect(result.current.history).toEqual([]);
    expect(idbSet).toHaveBeenCalledWith("query-history", []);
  });

  it("getRelativeTime returns 'just now' for recent timestamps", async () => {
    const useQueryHistory = await importHook();
    const { result } = renderHook(() => useQueryHistory());

    const time = result.current.getRelativeTime(Date.now() - 5000);
    expect(time).toBe("just now");
  });

  it("getRelativeTime returns minutes for older timestamps", async () => {
    const useQueryHistory = await importHook();
    const { result } = renderHook(() => useQueryHistory());

    const time = result.current.getRelativeTime(Date.now() - 120_000);
    expect(time).toBe("2 minutes ago");
  });

  it("getRelativeTime returns hours", async () => {
    const useQueryHistory = await importHook();
    const { result } = renderHook(() => useQueryHistory());

    const time = result.current.getRelativeTime(Date.now() - 3_600_000);
    expect(time).toBe("1 hour ago");
  });

  it("getRelativeTime returns days", async () => {
    const useQueryHistory = await importHook();
    const { result } = renderHook(() => useQueryHistory());

    const time = result.current.getRelativeTime(Date.now() - 86_400_000 * 3);
    expect(time).toBe("3 days ago");
  });
});
