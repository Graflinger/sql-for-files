import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";

import { EditorTabsProvider, useEditorTabsContext } from "./EditorTabsContext";

// The EditorTabsContext wraps useEditorTabs, which uses localStorage.
// We test the context layer (provider access, error on missing provider).

function wrapper({ children }: { children: ReactNode }) {
  return <EditorTabsProvider>{children}</EditorTabsProvider>;
}

beforeEach(() => {
  localStorage.clear();
});

describe("EditorTabsContext", () => {
  it("throws when used outside provider", () => {
    expect(() => {
      renderHook(() => useEditorTabsContext());
    }).toThrow(
      "useEditorTabsContext must be used within an EditorTabsProvider"
    );
  });

  it("provides tabs from useEditorTabs", () => {
    const { result } = renderHook(() => useEditorTabsContext(), { wrapper });

    expect(result.current.tabs).toBeDefined();
    expect(result.current.tabs.length).toBeGreaterThanOrEqual(1);
    expect(result.current.activeTab).toBeDefined();
    expect(result.current.activeTabId).toBeDefined();
  });

  it("exposes addTab function", () => {
    const { result } = renderHook(() => useEditorTabsContext(), { wrapper });

    act(() => {
      result.current.addTab({ name: "Test Tab", sql: "SELECT 1;" });
    });

    expect(result.current.tabs.length).toBe(2);
    const newTab = result.current.tabs.find((t) => t.name === "Test Tab");
    expect(newTab).toBeDefined();
    expect(newTab!.sql).toBe("SELECT 1;");
  });

  it("exposes closeTab function", () => {
    const { result } = renderHook(() => useEditorTabsContext(), { wrapper });

    let newId: string;
    act(() => {
      newId = result.current.addTab({ name: "To Close" });
    });

    act(() => {
      result.current.closeTab(newId!);
    });

    expect(result.current.tabs.find((t) => t.id === newId!)).toBeUndefined();
  });

  it("exposes updateTabSql function", () => {
    const { result } = renderHook(() => useEditorTabsContext(), { wrapper });
    const tabId = result.current.activeTabId;

    act(() => {
      result.current.updateTabSql(tabId, "SELECT * FROM test;");
    });

    expect(result.current.activeTab.sql).toBe("SELECT * FROM test;");
  });

  it("exposes setActiveTab function", () => {
    const { result } = renderHook(() => useEditorTabsContext(), { wrapper });

    let newId: string;
    act(() => {
      newId = result.current.addTab({ name: "Second" });
    });

    act(() => {
      result.current.setActiveTab(newId!);
    });

    expect(result.current.activeTabId).toBe(newId!);
  });

  it("exposes renameTab function", () => {
    const { result } = renderHook(() => useEditorTabsContext(), { wrapper });
    const tabId = result.current.activeTabId;

    act(() => {
      result.current.renameTab(tabId, "Renamed Tab");
    });

    expect(result.current.activeTab.name).toBe("Renamed Tab");
  });
});
