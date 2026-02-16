import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

// Reset module-level state before each test
beforeEach(() => {
  localStorage.clear();
  vi.resetModules();
});

async function importHook() {
  const mod = await import("./useEditorTabs");
  return mod.useEditorTabs;
}

describe("useEditorTabs", () => {
  it("initializes with a single default tab", async () => {
    const useEditorTabs = await importHook();
    const { result } = renderHook(() => useEditorTabs());

    expect(result.current.tabs).toHaveLength(1);
    expect(result.current.tabs[0].name).toMatch(/^Query \d+$/);
    expect(result.current.tabs[0].sql).toBe("");
    expect(result.current.tabs[0].result).toBeNull();
    expect(result.current.tabs[0].error).toBeNull();
  });

  it("returns the active tab", async () => {
    const useEditorTabs = await importHook();
    const { result } = renderHook(() => useEditorTabs());

    expect(result.current.activeTab).toBeDefined();
    expect(result.current.activeTab.id).toBe(result.current.activeTabId);
  });

  it("adds a new tab", async () => {
    const useEditorTabs = await importHook();
    const { result } = renderHook(() => useEditorTabs());

    act(() => {
      result.current.addTab();
    });

    expect(result.current.tabs).toHaveLength(2);
  });

  it("adds a tab with custom name and SQL", async () => {
    const useEditorTabs = await importHook();
    const { result } = renderHook(() => useEditorTabs());

    act(() => {
      result.current.addTab({ name: "My Query", sql: "SELECT 1" });
    });

    const newTab = result.current.tabs[result.current.tabs.length - 1];
    expect(newTab.name).toBe("My Query");
    expect(newTab.sql).toBe("SELECT 1");
  });

  it("switches active tab on add", async () => {
    const useEditorTabs = await importHook();
    const { result } = renderHook(() => useEditorTabs());
    const firstTabId = result.current.activeTabId;

    let newId: string;
    act(() => {
      newId = result.current.addTab();
    });

    expect(result.current.activeTabId).not.toBe(firstTabId);
    expect(result.current.activeTabId).toBe(newId!);
  });

  it("closes a tab that is not the last one", async () => {
    const useEditorTabs = await importHook();
    const { result } = renderHook(() => useEditorTabs());

    act(() => {
      result.current.addTab();
    });

    const firstTabId = result.current.tabs[0].id;

    act(() => {
      result.current.closeTab(firstTabId);
    });

    expect(result.current.tabs).toHaveLength(1);
    expect(result.current.tabs.find((t) => t.id === firstTabId)).toBeUndefined();
  });

  it("does not close the last remaining tab", async () => {
    const useEditorTabs = await importHook();
    const { result } = renderHook(() => useEditorTabs());

    const onlyTabId = result.current.tabs[0].id;

    act(() => {
      result.current.closeTab(onlyTabId);
    });

    expect(result.current.tabs).toHaveLength(1);
  });

  it("switches to adjacent tab when closing active tab", async () => {
    const useEditorTabs = await importHook();
    const { result } = renderHook(() => useEditorTabs());

    act(() => {
      result.current.addTab();
    });

    const secondTabId = result.current.tabs[1].id;

    act(() => {
      result.current.setActiveTab(secondTabId);
    });

    act(() => {
      result.current.closeTab(secondTabId);
    });

    expect(result.current.activeTabId).toBe(result.current.tabs[0].id);
  });

  it("updates SQL for a tab", async () => {
    const useEditorTabs = await importHook();
    const { result } = renderHook(() => useEditorTabs());

    const tabId = result.current.tabs[0].id;

    act(() => {
      result.current.updateTabSql(tabId, "SELECT * FROM users");
    });

    expect(result.current.tabs[0].sql).toBe("SELECT * FROM users");
  });

  it("updates result and error for a tab", async () => {
    const useEditorTabs = await importHook();
    const { result } = renderHook(() => useEditorTabs());

    const tabId = result.current.tabs[0].id;
    const mockResult = {
      data: [{ id: 1 }],
      columns: ["id"],
      rowCount: 1,
      displayRowCount: 1,
      executionTime: 10,
      arrowTable: null,
      wasTruncated: false,
    };

    act(() => {
      result.current.updateTabResult(tabId, mockResult, null);
    });

    expect(result.current.tabs[0].result).toEqual(mockResult);
    expect(result.current.tabs[0].error).toBeNull();
  });

  it("renames a tab", async () => {
    const useEditorTabs = await importHook();
    const { result } = renderHook(() => useEditorTabs());

    const tabId = result.current.tabs[0].id;

    act(() => {
      result.current.renameTab(tabId, "Revenue Query");
    });

    expect(result.current.tabs[0].name).toBe("Revenue Query");
  });

  it("does not rename with empty string", async () => {
    const useEditorTabs = await importHook();
    const { result } = renderHook(() => useEditorTabs());

    const tabId = result.current.tabs[0].id;
    const originalName = result.current.tabs[0].name;

    act(() => {
      result.current.renameTab(tabId, "   ");
    });

    expect(result.current.tabs[0].name).toBe(originalName);
  });

  it("trims whitespace when renaming", async () => {
    const useEditorTabs = await importHook();
    const { result } = renderHook(() => useEditorTabs());

    const tabId = result.current.tabs[0].id;

    act(() => {
      result.current.renameTab(tabId, "  My Query  ");
    });

    expect(result.current.tabs[0].name).toBe("My Query");
  });

  it("sets active tab by id", async () => {
    const useEditorTabs = await importHook();
    const { result } = renderHook(() => useEditorTabs());

    act(() => {
      result.current.addTab();
    });

    const firstTabId = result.current.tabs[0].id;

    act(() => {
      result.current.setActiveTab(firstTabId);
    });

    expect(result.current.activeTabId).toBe(firstTabId);
  });

  it("persists tabs to localStorage", async () => {
    const useEditorTabs = await importHook();
    const { result } = renderHook(() => useEditorTabs());

    act(() => {
      result.current.updateTabSql(result.current.tabs[0].id, "SELECT 1");
    });

    // Wait for debounced save
    await vi.waitFor(() => {
      const stored = localStorage.getItem("ide-editor-tabs");
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed[0].sql).toBe("SELECT 1");
    }, { timeout: 500 });
  });
});
