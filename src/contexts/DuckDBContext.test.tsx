import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";

import { DuckDBProvider, useDuckDBContext } from "./DuckDBContext";

// Mock duckdb-wasm-kit
vi.mock("duckdb-wasm-kit", () => ({
  initializeDuckDb: vi.fn(),
  getDuckDB: vi.fn(),
}));

// Mock databasePersistence
vi.mock("../utils/databasePersistence", () => ({
  restoreDatabaseFromIndexedDB: vi.fn(),
  saveAllTablesToIndexedDB: vi.fn(),
}));

import { initializeDuckDb, getDuckDB } from "duckdb-wasm-kit";
import {
  restoreDatabaseFromIndexedDB,
  saveAllTablesToIndexedDB,
} from "../utils/databasePersistence";

const mockInitializeDuckDb = initializeDuckDb as ReturnType<typeof vi.fn>;
const mockGetDuckDB = getDuckDB as ReturnType<typeof vi.fn>;
const mockRestore = restoreDatabaseFromIndexedDB as ReturnType<typeof vi.fn>;
const mockSaveAll = saveAllTablesToIndexedDB as ReturnType<typeof vi.fn>;

/** Helper component to display context values. */
function ContextConsumer() {
  const ctx = useDuckDBContext();
  return (
    <div>
      <span data-testid="loading">{String(ctx.loading)}</span>
      <span data-testid="error">{ctx.error ? ctx.error.message : "none"}</span>
      <span data-testid="db">{ctx.db ? "ready" : "null"}</span>
      <span data-testid="tables">{JSON.stringify(ctx.tables)}</span>
      <span data-testid="restoredMessage">{ctx.restoredMessage ?? "null"}</span>
      <button onClick={() => ctx.refreshTables()}>refresh</button>
      <button onClick={() => ctx.saveDatabase()}>save</button>
    </div>
  );
}

function createMockDb() {
  const mockConn = {
    query: vi.fn().mockResolvedValue({
      toArray: () => [],
    }),
    close: vi.fn().mockResolvedValue(undefined),
  };
  return {
    connect: vi.fn().mockResolvedValue(mockConn),
    _mockConnection: mockConn,
  };
}

describe("DuckDBContext", () => {
  let mockDb: ReturnType<typeof createMockDb>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDb = createMockDb();
    mockInitializeDuckDb.mockResolvedValue(undefined);
    mockGetDuckDB.mockResolvedValue(mockDb);
    mockRestore.mockResolvedValue({ restoredCount: 0, tableNames: [] });
  });

  it("shows loading state initially then resolves", async () => {
    render(
      <DuckDBProvider>
        <ContextConsumer />
      </DuckDBProvider>
    );

    // Initially loading
    expect(screen.getByTestId("loading").textContent).toBe("true");

    // After init
    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });
    expect(screen.getByTestId("db").textContent).toBe("ready");
    expect(screen.getByTestId("error").textContent).toBe("none");
  });

  it("sets error when initialization fails", async () => {
    mockInitializeDuckDb.mockRejectedValue(new Error("WASM load failed"));

    render(
      <DuckDBProvider>
        <ContextConsumer />
      </DuckDBProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });
    expect(screen.getByTestId("error").textContent).toBe("WASM load failed");
    expect(screen.getByTestId("db").textContent).toBe("null");
  });

  it("restores tables from IndexedDB on init", async () => {
    mockRestore.mockResolvedValue({
      restoredCount: 2,
      tableNames: ["orders", "products"],
    });

    // After restore, refreshTables queries for tables
    mockDb._mockConnection.query.mockResolvedValue({
      toArray: () => [
        { table_name: "orders" },
        { table_name: "products" },
      ],
    });

    render(
      <DuckDBProvider>
        <ContextConsumer />
      </DuckDBProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });

    expect(screen.getByTestId("restoredMessage").textContent).toBe(
      "Restored 2 tables from previous session"
    );
    expect(screen.getByTestId("tables").textContent).toBe(
      JSON.stringify(["orders", "products"])
    );
  });

  it("handles restore failure gracefully (does not block init)", async () => {
    mockRestore.mockRejectedValue(new Error("IndexedDB corrupt"));

    render(
      <DuckDBProvider>
        <ContextConsumer />
      </DuckDBProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });

    // Should still be ready, just without restored tables
    expect(screen.getByTestId("db").textContent).toBe("ready");
    expect(screen.getByTestId("error").textContent).toBe("none");
  });

  it("shows singular message when 1 table is restored", async () => {
    mockRestore.mockResolvedValue({
      restoredCount: 1,
      tableNames: ["users"],
    });

    mockDb._mockConnection.query.mockResolvedValue({
      toArray: () => [{ table_name: "users" }],
    });

    render(
      <DuckDBProvider>
        <ContextConsumer />
      </DuckDBProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("restoredMessage").textContent).toBe(
        "Restored 1 table from previous session"
      );
    });
  });

  it("refreshTables updates table list", async () => {
    render(
      <DuckDBProvider>
        <ContextConsumer />
      </DuckDBProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });

    // Simulate adding a table
    mockDb._mockConnection.query.mockResolvedValue({
      toArray: () => [{ table_name: "new_table" }],
    });

    await act(async () => {
      screen.getByText("refresh").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("tables").textContent).toBe(
        JSON.stringify(["new_table"])
      );
    });
  });

  it("saveDatabase calls saveAllTablesToIndexedDB", async () => {
    mockSaveAll.mockResolvedValue({ saved: ["t1"], errors: [], warnings: [] });

    mockDb._mockConnection.query.mockResolvedValue({
      toArray: () => [{ table_name: "t1" }],
    });

    render(
      <DuckDBProvider>
        <ContextConsumer />
      </DuckDBProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });

    await act(async () => {
      screen.getByText("save").click();
    });

    expect(mockSaveAll).toHaveBeenCalledWith(mockDb, ["t1"]);
  });

  it("throws when useDuckDBContext is used outside provider", () => {
    // Suppress console.error for expected error
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<ContextConsumer />);
    }).toThrow("useDuckDBContext must be used within DuckDBProvider");

    consoleSpy.mockRestore();
  });
});
