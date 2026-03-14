import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";

import { ThemeProvider } from "../../contexts/ThemeContext";
import SQLEditor from "./SQLEditor";

vi.mock("@monaco-editor/react", () => ({
  default: ({
    value,
    onChange,
    theme,
  }: {
    value?: string;
    onChange?: (value: string | undefined) => void;
    theme?: string;
  }) => (
    <textarea
      data-testid="mock-editor"
      data-theme={theme}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    />
  ),
}));

vi.mock("../../contexts/DuckDBContext", () => ({
  useDuckDBContext: vi.fn(() => ({
    db: null,
    tables: [],
  })),
}));

function renderWithTheme(ui: ReactNode) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe("SQLEditor", () => {
  const mockOnExecute = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders the editor", () => {
    renderWithTheme(<SQLEditor onExecute={mockOnExecute} executing={false} />);
    expect(screen.getByTestId("mock-editor")).toBeInTheDocument();
  });

  it("renders Run Query button", () => {
    renderWithTheme(<SQLEditor onExecute={mockOnExecute} executing={false} />);
    expect(screen.getByLabelText("Run SQL query")).toBeInTheDocument();
  });

  it("shows default SQL in uncontrolled mode", () => {
    renderWithTheme(<SQLEditor onExecute={mockOnExecute} executing={false} />);
    const editor = screen.getByTestId("mock-editor") as HTMLTextAreaElement;
    expect(editor.value).toContain("SELECT * FROM your_table LIMIT 10");
  });

  it("uses controlled value when provided", () => {
    renderWithTheme(
      <SQLEditor
        onExecute={mockOnExecute}
        executing={false}
        value="SELECT 1"
        onChange={vi.fn()}
      />
    );
    const editor = screen.getByTestId("mock-editor") as HTMLTextAreaElement;
    expect(editor.value).toBe("SELECT 1");
  });

  it("calls onChange in controlled mode", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    renderWithTheme(
      <SQLEditor
        onExecute={mockOnExecute}
        executing={false}
        value=""
        onChange={handleChange}
      />
    );

    await user.type(screen.getByTestId("mock-editor"), "S");
    expect(handleChange).toHaveBeenCalled();
  });

  it("shows executing state with spinner", () => {
    renderWithTheme(<SQLEditor onExecute={mockOnExecute} executing={true} />);
    expect(screen.getByText("Executing...")).toBeInTheDocument();
    const runBtn = screen.getByLabelText("Run SQL query");
    expect(runBtn).toBeDisabled();
  });

  it("disables Run Query button when disabled prop is true", () => {
    renderWithTheme(
      <SQLEditor onExecute={mockOnExecute} executing={false} disabled />
    );
    const runBtn = screen.getByLabelText("Run SQL query");
    expect(runBtn).toBeDisabled();
  });

  it("calls onExecute when Run Query is clicked", async () => {
    const user = userEvent.setup();
    renderWithTheme(<SQLEditor onExecute={mockOnExecute} executing={false} />);

    await user.click(screen.getByLabelText("Run SQL query"));
    expect(mockOnExecute).toHaveBeenCalledWith(
      "SELECT * FROM your_table LIMIT 10;"
    );
  });

  it("shows keyboard shortcut hint", () => {
    renderWithTheme(<SQLEditor onExecute={mockOnExecute} executing={false} />);
    expect(screen.getByText("Ctrl+Enter")).toBeInTheDocument();
    expect(screen.getByText("to run")).toBeInTheDocument();
  });

  it("has keyboard shortcuts info button", () => {
    renderWithTheme(<SQLEditor onExecute={mockOnExecute} executing={false} />);
    expect(
      screen.getByLabelText("View all keyboard shortcuts")
    ).toBeInTheDocument();
  });

  it("shows shortcuts popover when info button is clicked", async () => {
    const user = userEvent.setup();
    renderWithTheme(<SQLEditor onExecute={mockOnExecute} executing={false} />);

    await user.click(screen.getByLabelText("View all keyboard shortcuts"));
    expect(screen.getByText("Keyboard Shortcuts")).toBeInTheDocument();
    expect(screen.getByText("Execute query")).toBeInTheDocument();
  });

  it("uses light Monaco theme by default", () => {
    renderWithTheme(<SQLEditor onExecute={mockOnExecute} executing={false} />);
    expect(screen.getByTestId("mock-editor")).toHaveAttribute(
      "data-theme",
      "vs-light"
    );
  });

  it("uses dark Monaco theme when theme mode is dark", () => {
    localStorage.setItem("ui-theme-mode", "dark");
    renderWithTheme(<SQLEditor onExecute={mockOnExecute} executing={false} />);
    expect(screen.getByTestId("mock-editor")).toHaveAttribute(
      "data-theme",
      "vs-dark"
    );
  });
});
