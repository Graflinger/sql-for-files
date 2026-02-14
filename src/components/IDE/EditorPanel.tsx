import type { ReactNode } from "react";
import EditorTabs from "./EditorTabs";
import type { EditorTab } from "../../hooks/useEditorTabs";

interface EditorPanelProps {
  children: ReactNode;
  tabs: EditorTab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onAddTab: () => void;
  onCloseTab: (id: string) => void;
  onRenameTab: (id: string, name: string) => void;
}

/**
 * EditorPanel Component
 *
 * Wrapper for the SQL editor area in the IDE layout.
 * Shows a tab bar for multiple open queries.
 */
export default function EditorPanel({
  children,
  tabs,
  activeTabId,
  onSelectTab,
  onAddTab,
  onCloseTab,
  onRenameTab,
}: EditorPanelProps) {
  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white">
      {/* Tab Bar */}
      <EditorTabs
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={onSelectTab}
        onAddTab={onAddTab}
        onCloseTab={onCloseTab}
        onRenameTab={onRenameTab}
      />

      {/* Editor Content */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">{children}</div>
    </div>
  );
}
