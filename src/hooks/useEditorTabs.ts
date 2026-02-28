import { useState, useCallback, useEffect, useRef } from "react";
import type { QueryResult } from "../types/query";

export interface EditorTab {
  id: string;
  name: string;
  sql: string;
  result: QueryResult | null;
  error: Error | null;
}

interface UseEditorTabsReturn {
  tabs: EditorTab[];
  activeTabId: string;
  activeTab: EditorTab;
  setActiveTab: (id: string) => void;
  addTab: (options?: { name?: string; sql?: string }) => string;
  closeTab: (id: string) => void;
  updateTabSql: (id: string, sql: string) => void;
  updateTabResult: (id: string, result: QueryResult | null, error: Error | null) => void;
  renameTab: (id: string, name: string) => void;
}

const STORAGE_KEY = "ide-editor-tabs";
const ACTIVE_TAB_KEY = "ide-active-tab";

let nextTabNumber = 1;

function createTab(options?: { name?: string; sql?: string }): EditorTab {
  const id = `tab-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const tabName = options?.name || `Query ${nextTabNumber++}`;
  return {
    id,
    name: tabName,
    sql: options?.sql ?? "",
    result: null,
    error: null,
  };
}

function loadTabsFromStorage(): { tabs: EditorTab[]; activeTabId: string } | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const storedActiveId = localStorage.getItem(ACTIVE_TAB_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as Array<{
      id: string;
      name: string;
      sql: string;
    }>;

    if (!Array.isArray(parsed) || parsed.length === 0) return null;

    // Track the highest tab number from stored names for consistent numbering
    for (const tab of parsed) {
      const match = tab.name.match(/^Query (\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num >= nextTabNumber) {
          nextTabNumber = num + 1;
        }
      }
    }

    const tabs: EditorTab[] = parsed.map((t) => ({
      id: t.id,
      name: t.name,
      sql: t.sql,
      result: null,
      error: null,
    }));

    const activeTabId =
      storedActiveId && tabs.some((t) => t.id === storedActiveId)
        ? storedActiveId
        : tabs[0].id;

    return { tabs, activeTabId };
  } catch {
    return null;
  }
}

function saveTabsToStorage(tabs: EditorTab[], activeTabId: string) {
  try {
    const serializable = tabs.map((t) => ({
      id: t.id,
      name: t.name,
      sql: t.sql,
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
    localStorage.setItem(ACTIVE_TAB_KEY, activeTabId);
  } catch {
    // Silently ignore storage errors
  }
}

export function useEditorTabs(): UseEditorTabsReturn {
  const [tabs, setTabs] = useState<EditorTab[]>(() => {
    const loaded = loadTabsFromStorage();
    if (loaded) return loaded.tabs;
    return [createTab({ name: "Query 1" })];
  });

  const [activeTabId, setActiveTabId] = useState<string>(() => {
    const loaded = loadTabsFromStorage();
    if (loaded) return loaded.activeTabId;
    return tabs[0].id;
  });

  // Persist on changes (debounce slightly to avoid thrashing)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveTabsToStorage(tabs, activeTabId);
    }, 300);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [tabs, activeTabId]);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  const setActiveTab = useCallback((id: string) => {
    setActiveTabId(id);
  }, []);

  const addTab = useCallback((options?: { name?: string; sql?: string }) => {
    const newTab = createTab(options);
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
    return newTab.id;
  }, []);

  const closeTab = useCallback(
    (id: string) => {
      setTabs((prev) => {
        if (prev.length <= 1) return prev; // Never close the last tab
        const idx = prev.findIndex((t) => t.id === id);
        const next = prev.filter((t) => t.id !== id);

        // If closing the active tab, switch to an adjacent tab
        if (id === activeTabId) {
          const newActiveIdx = Math.min(idx, next.length - 1);
          setActiveTabId(next[newActiveIdx].id);
        }

        return next;
      });
    },
    [activeTabId]
  );

  const updateTabSql = useCallback((id: string, sql: string) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === id ? { ...t, sql } : t))
    );
  }, []);

  const updateTabResult = useCallback(
    (id: string, result: QueryResult | null, error: Error | null) => {
      setTabs((prev) =>
        prev.map((t) => (t.id === id ? { ...t, result, error } : t))
      );
    },
    []
  );

  const renameTab = useCallback((id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setTabs((prev) =>
      prev.map((t) => (t.id === id ? { ...t, name: trimmed } : t))
    );
  }, []);

  return {
    tabs,
    activeTabId,
    activeTab,
    setActiveTab,
    addTab,
    closeTab,
    updateTabSql,
    updateTabResult,
    renameTab,
  };
}
