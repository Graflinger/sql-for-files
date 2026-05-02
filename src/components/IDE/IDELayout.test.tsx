import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

vi.mock("./ResultsPanel", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import IDELayout from "./IDELayout";

const mockEditorTabs = {
  tabs: [{ id: "tab-1", name: "Query 1", sql: "", result: null, error: null }],
  activeTabId: "tab-1",
  onSelectTab: vi.fn(),
  onAddTab: vi.fn(),
  onCloseTab: vi.fn(),
  onRenameTab: vi.fn(),
};

function renderIDELayout() {
  return render(
    <IDELayout
      sidebarContent={{
        addData: <div>Add data</div>,
        tables: <div>Tables</div>,
        queryHistory: <div>History</div>,
      }}
      editorContent={<div>Editor</div>}
      resultsContent={<div>Results</div>}
      result={null}
      editorTabs={mockEditorTabs}
      rightPanel={<div>Learn SQL Content</div>}
    />
  );
}

describe("IDELayout", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("loads the persisted Learn SQL panel width", () => {
    localStorage.setItem("ide-right-panel-width", "420");

    renderIDELayout();

    expect(screen.getByTestId("ide-right-panel")).toHaveStyle({ width: "420px" });
  });

  it("resizes and persists the Learn SQL panel width", () => {
    renderIDELayout();

    const resizeHandle = screen.getByRole("separator", { name: "Resize Learn SQL panel" });
    const rightPanel = screen.getByTestId("ide-right-panel");

    expect(rightPanel).toHaveStyle({ width: "384px" });

    fireEvent.mouseDown(resizeHandle);
    fireEvent.mouseMove(document, { movementX: -48 });
    fireEvent.mouseUp(document);

    expect(rightPanel).toHaveStyle({ width: "432px" });
    expect(localStorage.getItem("ide-right-panel-width")).toBe("432");
  });
});
