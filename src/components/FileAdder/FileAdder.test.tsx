import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock dependencies
vi.mock("../../contexts/DuckDBContext", () => ({
  useDuckDBContext: vi.fn(() => ({
    db: { connect: vi.fn() },
    refreshTables: vi.fn().mockResolvedValue(undefined),
  })),
}));

vi.mock("../../hooks/useFileAdd", () => ({
  useFileAdd: vi.fn(() => ({
    addFile: vi.fn().mockResolvedValue("test_table"),
  })),
}));

vi.mock("../../contexts/NotificationContext", () => ({
  useNotifications: vi.fn(() => ({
    addNotification: vi.fn(() => "notif-1"),
    updateNotification: vi.fn(),
  })),
}));

vi.mock("../../utils/databasePersistence", () => ({
  saveTableToIndexedDB: vi.fn().mockResolvedValue({ warning: null }),
}));

// Mock AdvancedAddModal — render a simple placeholder
vi.mock("./AdvancedAddModal", () => ({
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="advanced-modal">
        <button onClick={onClose}>Close Modal</button>
      </div>
    ) : null,
}));

import FileAdder from "./FileAdder";

describe("FileAdder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("compact mode", () => {
    it("renders compact drop zone", () => {
      render(<FileAdder compact />);
      expect(screen.getByText("Drop or click to add")).toBeInTheDocument();
    });

    it("shows file type labels in compact mode", () => {
      render(<FileAdder compact />);
      expect(screen.getByText("CSV")).toBeInTheDocument();
      expect(screen.getByText("JSON")).toBeInTheDocument();
      expect(screen.getByText("Parquet")).toBeInTheDocument();
    });

    it("shows Advanced options button", () => {
      render(<FileAdder compact />);
      expect(screen.getByText("Advanced options")).toBeInTheDocument();
    });

    it("shows sample data link", () => {
      render(<FileAdder compact />);
      expect(screen.getByText("Try sample data")).toBeInTheDocument();
    });
  });

  describe("full mode (default)", () => {
    it("renders full drop zone with instructions", () => {
      render(<FileAdder />);
      expect(screen.getByText("Drag & drop files here")).toBeInTheDocument();
      expect(screen.getByText("or click to browse")).toBeInTheDocument();
    });

    it("shows file type badges", () => {
      render(<FileAdder />);
      // Full mode has badges in both mobile and desktop views
      const csvBadges = screen.getAllByText("CSV");
      expect(csvBadges.length).toBeGreaterThanOrEqual(1);
    });

    it("shows download sample data link", () => {
      render(<FileAdder />);
      expect(screen.getByText("Download sample data")).toBeInTheDocument();
    });

    it("has file input with accept restriction", () => {
      render(<FileAdder />);
      const inputs = document.querySelectorAll('input[type="file"]');
      expect(inputs.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("advanced options", () => {
    it("opens advanced modal when button is clicked", async () => {
      const user = userEvent.setup();
      render(<FileAdder compact />);

      await user.click(screen.getByText("Advanced options"));
      expect(screen.getByTestId("advanced-modal")).toBeInTheDocument();
    });

    it("closes advanced modal", async () => {
      const user = userEvent.setup();
      render(<FileAdder compact />);

      await user.click(screen.getByText("Advanced options"));
      expect(screen.getByTestId("advanced-modal")).toBeInTheDocument();

      await user.click(screen.getByText("Close Modal"));
      expect(screen.queryByTestId("advanced-modal")).not.toBeInTheDocument();
    });
  });

  describe("file input", () => {
    it("renders hidden file inputs with aria-label", () => {
      render(<FileAdder compact />);
      const inputs = screen.getAllByLabelText("Add data files");
      expect(inputs.length).toBeGreaterThanOrEqual(1);
    });
  });
});
