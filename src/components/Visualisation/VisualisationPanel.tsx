import { useState, useRef } from "react";

import { useChartConfig } from "../../hooks/useChartConfig";
import { getChartFamily } from "../../utils/chartRegistry";
import { useEditorTabsContext } from "../../contexts/EditorTabsContext";
import type { QueryResult } from "../../types/query";
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
  } = useChartConfig(result, activeTabId);

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
        <p className="text-sm font-medium text-slate-500">Visualisation</p>
        <p className="text-xs text-slate-400 mt-1">
          Run a query to visualise results
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-1 min-h-0">
        {/* Collapsible sidebar */}
        {sidebarOpen && (
          <div className="w-56 flex-shrink-0 border-r border-slate-200 overflow-y-auto bg-white">
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
          <div className="flex items-center px-2 py-1 border-b border-slate-200 bg-slate-50/50">
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
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
            <span className="ml-auto text-[10px] text-slate-400 select-none">
              {result.displayRowCount.toLocaleString()} rows
              {result.wasTruncated && ` of ${result.rowCount.toLocaleString()}`}
            </span>
          </div>

          {/* Duplicate category warning */}
          {canRender && hasDuplicateCategories && (
            <div className="mx-2 mt-1.5 px-3 py-2 bg-amber-50 border border-amber-300 rounded text-xs text-amber-700 flex items-start gap-2">
              <svg
                className="w-4 h-4 text-amber-500 flex-shrink-0 mt-px"
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
                <code className="px-1 py-0.5 bg-amber-100 rounded text-[11px] font-mono">
                  GROUP BY
                </code>{" "}
                with an aggregation function (e.g.{" "}
                <code className="px-1 py-0.5 bg-amber-100 rounded text-[11px] font-mono">
                  SUM
                </code>
                ,{" "}
                <code className="px-1 py-0.5 bg-amber-100 rounded text-[11px] font-mono">
                  AVG
                </code>
                ,{" "}
                <code className="px-1 py-0.5 bg-amber-100 rounded text-[11px] font-mono">
                  COUNT
                </code>
                ) in your query for an accurate chart.
              </span>
            </div>
          )}

          {/* Chart render area */}
          <div className="flex-1 min-h-0">
            {canRender && echartsOption ? (
              <ChartRenderer ref={chartRef} option={echartsOption} />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
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
