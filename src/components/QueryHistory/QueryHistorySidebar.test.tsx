import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import QueryHistorySidebar from "./QueryHistorySidebar";

// Mock the useQueryHistory hook
const mockDeleteQuery = vi.fn().mockResolvedValue(undefined);
const mockClearHistory = vi.fn().mockResolvedValue(undefined);
const mockGetRelativeTime = vi.fn().mockReturnValue("just now");
let mockHistory: Array<{
  id: string;
  query: string;
  timestamp: number;
  status: "success" | "error";
  rowCount?: number;
  executionTime?: number;
  error?: string;
}> = [];
let mockLoading = false;

vi.mock("../../hooks/useQueryHistory", () => ({
  useQueryHistory: () => ({
    history: mockHistory,
    loading: mockLoading,
    deleteQuery: mockDeleteQuery,
    clearHistory: mockClearHistory,
    getRelativeTime: mockGetRelativeTime,
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockHistory = [];
  mockLoading = false;
});

describe("QueryHistorySidebar", () => {
  it("shows loading state", () => {
    mockLoading = true;
    render(<QueryHistorySidebar onLoadQuery={vi.fn()} />);
    expect(screen.getByText("Loading history...")).toBeInTheDocument();
  });

  it("shows empty state when no history", () => {
    render(<QueryHistorySidebar onLoadQuery={vi.fn()} />);
    expect(screen.getByText("No history yet")).toBeInTheDocument();
    expect(
      screen.getByText("Executed queries appear here")
    ).toBeInTheDocument();
  });

  it("renders history entries", () => {
    mockHistory = [
      {
        id: "1",
        query: "SELECT * FROM users",
        timestamp: Date.now(),
        status: "success",
        rowCount: 10,
        executionTime: 5.2,
      },
    ];

    render(<QueryHistorySidebar onLoadQuery={vi.fn()} />);
    expect(screen.getByText(/SELECT \* FROM users/)).toBeInTheDocument();
  });

  it("shows success badge with row count", () => {
    mockHistory = [
      {
        id: "1",
        query: "SELECT 1",
        timestamp: Date.now(),
        status: "success",
        rowCount: 42,
      },
    ];

    render(<QueryHistorySidebar onLoadQuery={vi.fn()} />);
    expect(screen.getByText(/42 rows/)).toBeInTheDocument();
  });

  it("shows error badge for failed queries", () => {
    mockHistory = [
      {
        id: "1",
        query: "INVALID SQL",
        timestamp: Date.now(),
        status: "error",
      },
    ];

    render(<QueryHistorySidebar onLoadQuery={vi.fn()} />);
    expect(screen.getByText("Error")).toBeInTheDocument();
  });

  it("shows execution time", () => {
    mockHistory = [
      {
        id: "1",
        query: "SELECT 1",
        timestamp: Date.now(),
        status: "success",
        executionTime: 12.5,
      },
    ];

    render(<QueryHistorySidebar onLoadQuery={vi.fn()} />);
    expect(screen.getByText("12.5ms")).toBeInTheDocument();
  });

  it("shows relative time", () => {
    mockGetRelativeTime.mockReturnValue("5 min ago");
    mockHistory = [
      {
        id: "1",
        query: "SELECT 1",
        timestamp: Date.now(),
        status: "success",
      },
    ];

    render(<QueryHistorySidebar onLoadQuery={vi.fn()} />);
    expect(screen.getByText("5 min ago")).toBeInTheDocument();
  });

  it("calls onLoadQuery when an entry is clicked", async () => {
    const user = userEvent.setup();
    const onLoadQuery = vi.fn();
    mockHistory = [
      {
        id: "1",
        query: "SELECT * FROM test",
        timestamp: Date.now(),
        status: "success",
      },
    ];

    render(<QueryHistorySidebar onLoadQuery={onLoadQuery} />);

    // Click the query entry button
    const button = screen.getByTitle("Click to load query into editor");
    await user.click(button);

    expect(onLoadQuery).toHaveBeenCalledWith("SELECT * FROM test");
  });

  it("truncates long queries", () => {
    const longQuery = "SELECT " + "a, ".repeat(100) + "b FROM very_long_table";
    mockHistory = [
      {
        id: "1",
        query: longQuery,
        timestamp: Date.now(),
        status: "success",
      },
    ];

    render(<QueryHistorySidebar onLoadQuery={vi.fn()} />);

    // Should show truncated version with "more" indicator
    expect(screen.getByText("more")).toBeInTheDocument();
  });

  it("shows Clear All button when history exists", () => {
    mockHistory = [
      {
        id: "1",
        query: "SELECT 1",
        timestamp: Date.now(),
        status: "success",
      },
    ];

    render(<QueryHistorySidebar onLoadQuery={vi.fn()} />);
    expect(screen.getByText("Clear All")).toBeInTheDocument();
  });

  it("calls clearHistory on Clear All with confirmation", async () => {
    const user = userEvent.setup();
    window.confirm = vi.fn().mockReturnValue(true);
    mockHistory = [
      {
        id: "1",
        query: "SELECT 1",
        timestamp: Date.now(),
        status: "success",
      },
    ];

    render(<QueryHistorySidebar onLoadQuery={vi.fn()} />);
    await user.click(screen.getByText("Clear All"));

    expect(window.confirm).toHaveBeenCalled();
    expect(mockClearHistory).toHaveBeenCalled();
  });

  it("does not clear when confirmation is cancelled", async () => {
    const user = userEvent.setup();
    window.confirm = vi.fn().mockReturnValue(false);
    mockHistory = [
      {
        id: "1",
        query: "SELECT 1",
        timestamp: Date.now(),
        status: "success",
      },
    ];

    render(<QueryHistorySidebar onLoadQuery={vi.fn()} />);
    await user.click(screen.getByText("Clear All"));

    expect(window.confirm).toHaveBeenCalled();
    expect(mockClearHistory).not.toHaveBeenCalled();
  });

  it("has delete button for each entry", () => {
    mockHistory = [
      {
        id: "1",
        query: "SELECT 1",
        timestamp: Date.now(),
        status: "success",
      },
    ];

    render(<QueryHistorySidebar onLoadQuery={vi.fn()} />);
    expect(screen.getByLabelText("Delete from history")).toBeInTheDocument();
  });

  it("has download button for each entry", () => {
    mockHistory = [
      {
        id: "1",
        query: "SELECT 1",
        timestamp: Date.now(),
        status: "success",
      },
    ];

    render(<QueryHistorySidebar onLoadQuery={vi.fn()} />);
    expect(
      screen.getByLabelText("Download query as file")
    ).toBeInTheDocument();
  });
});
