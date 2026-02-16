import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { useEditorTabs } from "../hooks/useEditorTabs";
import type { EditorTab } from "../hooks/useEditorTabs";
import type { QueryResult } from "../types/query";

interface EditorTabsContextValue {
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

const EditorTabsContext = createContext<EditorTabsContextValue | null>(null);

export function EditorTabsProvider({ children }: { children: ReactNode }) {
  const editorTabs = useEditorTabs();

  return (
    <EditorTabsContext.Provider value={editorTabs}>
      {children}
    </EditorTabsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useEditorTabsContext(): EditorTabsContextValue {
  const context = useContext(EditorTabsContext);
  if (!context) {
    throw new Error("useEditorTabsContext must be used within an EditorTabsProvider");
  }
  return context;
}
