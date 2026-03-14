import { useState, useRef } from "react";

import { useTheme } from "../../contexts/ThemeContextDef";
import { useChartConfig } from "../../hooks/useChartConfig";
import { useEditorTabsContext } from "../../contexts/EditorTabsContext";
import type { QueryResult } from "../../types/query";
import { getChartFamily } from "../../utils/chartRegistry";
import ChartConfigPanel from "./ChartConfigPanel";
import ChartRenderer from "./ChartRenderer";
import type { ChartRendererHandle } from "./ChartRenderer";
import ChartExportBar from "./ChartExportBar";

interface VisualisationPanelProps {
  result: QueryResult | null;
}

/**
 * VisualisationPanel is the main container for the Visualisation tab.
 *
 * Layout: collapsible config sidebar (left) + chart area (right) + export bar (bottom).
 * Auto-detects sensible chart defaults from query results.
 */
export default function VisualisationPanel({
  result,
}: VisualisationPanelProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const chartRef = useRef<ChartRendererHandle>(null);
  const { activeTabId } = useEditorTabsContext();
  const { resolvedTheme } = useTheme();

  const {
    config,
    echartsOption,
    canRender,
    availableColumns,
    setChartType,
    setXAxisColumn,
    addSeries,
    removeSeries,
    updateSeriesColumn,
    updateSeriesColor,
    setLabelColumn,
    setValueColumn,
    setTitle,
    setSubtitle,
    hasDuplicateCategories,
  } = useChartConfig(result, activeTabId, resolvedTheme);

  // Determine the category column name for the warning message
  const family = getChartFamily(config.chartType);
  const categoryColumnName =
    family === "axis" ? config.xAxisColumn : config.labelColumn;

  // No result yet
  if (!result || result.columns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
        <svg
          className="w-10 h-10 mb-3 text-slate-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-300">Visualisation</p>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          Run a query to visualise results
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-white dark:bg-slate-950">
      <div className="flex flex-1 min-h-0">
        {/* Collapsible sidebar */}
        {sidebarOpen && (
          <div className="w-56 flex-shrink-0 overflow-y-auto border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
            <ChartConfigPanel
              config={config}
              availableColumns={availableColumns}
              onChartTypeChange={setChartType}
              onXAxisChange={setXAxisColumn}
              onAddSeries={addSeries}
              onRemoveSeries={removeSeries}
              onUpdateSeriesColumn={updateSeriesColumn}
              onUpdateSeriesColor={updateSeriesColor}
              onLabelColumnChange={setLabelColumn}
              onValueColumnChange={setValueColumn}
              onTitleChange={setTitle}
              onSubtitleChange={setSubtitle}
            />
          </div>
        )}

        {/* Chart area */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Sidebar toggle */}
          <div className="flex items-center border-b border-slate-200 bg-slate-50/80 px-2 py-1 dark:border-slate-800 dark:bg-slate-900/80">
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              title={sidebarOpen ? "Hide config panel" : "Show config panel"}
            >
              <svg
                className={`w-3.5 h-3.5 transition-transform ${
                  sidebarOpen ? "" : "rotate-180"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              </svg>
              {sidebarOpen ? "Hide Config" : "Show Config"}
            </button>

            {/* Chart info */}
            <span className="ml-auto select-none text-[10px] text-slate-400 dark:text-slate-500">
              {result.displayRowCount.toLocaleString()} rows
              {result.wasTruncated && ` of ${result.rowCount.toLocaleString()}`}
            </span>
          </div>

          {/* Duplicate category warning */}
          {canRender && hasDuplicateCategories && (
            <div className="mx-2 mt-1.5 flex items-start gap-2 rounded border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-900/80 dark:bg-amber-950/40 dark:text-amber-100/90">
              <svg
                className="mt-px h-4 w-4 flex-shrink-0 text-amber-500 dark:text-amber-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>
                Column <strong>&quot;{categoryColumnName}&quot;</strong> has
                duplicate values. Consider using{" "}
                <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-[11px] dark:bg-amber-900/70 dark:text-amber-50">
                  GROUP BY
                </code>{" "}
                with an aggregation function (e.g.{" "}
                <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-[11px] dark:bg-amber-900/70 dark:text-amber-50">
                  SUM
                </code>
                ,{" "}
                <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-[11px] dark:bg-amber-900/70 dark:text-amber-50">
                  AVG
                </code>
                ,{" "}
                <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-[11px] dark:bg-amber-900/70 dark:text-amber-50">
                  COUNT
                </code>
                ) in your query for an accurate chart.
              </span>
            </div>
          )}

          {/* Chart render area */}
          <div className="min-h-0 flex-1 bg-white dark:bg-slate-950">
            {canRender && echartsOption ? (
              <ChartRenderer ref={chartRef} option={echartsOption} />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400 dark:text-slate-500">
                <p className="text-xs">
                  Configure chart options in the sidebar to render a
                  visualisation.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Export bar — only show when chart is rendered */}
      {canRender && <ChartExportBar chartRef={chartRef} />}
    </div>
  );
}
