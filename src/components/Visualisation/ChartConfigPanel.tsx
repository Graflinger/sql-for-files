import type { ChartType, ChartConfig, SeriesConfig } from "../../types/visualisation";

interface ChartConfigPanelProps {
  config: ChartConfig;
  availableColumns: string[];
  onChartTypeChange: (type: ChartType) => void;
  onXAxisChange: (column: string) => void;
  onAddSeries: (column: string) => void;
  onRemoveSeries: (index: number) => void;
  onUpdateSeriesColumn: (index: number, column: string) => void;
  onUpdateSeriesColor: (index: number, color: string) => void;
  onAnimationChange: (show: boolean) => void;
}

const CHART_TYPES: { id: ChartType; label: string; icon: string }[] = [
  { id: "bar", label: "Bar", icon: "M4 20h4V10H4v10zm6 0h4V4h-4v16zm6 0h4v-8h-4v8z" },
  { id: "line", label: "Line", icon: "M3.5 18.5l6-6 4 4L22 6.5" },
];

/**
 * ChartConfigPanel provides controls for configuring the chart:
 * chart type, x-axis column, y-axis series (with colors), and animation toggle.
 */
export default function ChartConfigPanel({
  config,
  availableColumns,
  onChartTypeChange,
  onXAxisChange,
  onAddSeries,
  onRemoveSeries,
  onUpdateSeriesColumn,
  onUpdateSeriesColor,
  onAnimationChange,
}: ChartConfigPanelProps) {
  // Columns not yet used in a series (for "Add series" dropdown)
  const unusedColumns = availableColumns.filter(
    (col) =>
      col !== config.xAxisColumn &&
      !config.series.some((s) => s.column === col)
  );

  return (
    <div className="flex flex-col gap-4 p-3 text-xs">
      {/* Chart Type */}
      <section>
        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
          Chart Type
        </label>
        <div className="flex gap-1">
          {CHART_TYPES.map((ct) => (
            <button
              key={ct.id}
              onClick={() => onChartTypeChange(ct.id)}
              className={`
                flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium
                transition-colors border
                ${
                  config.chartType === ct.id
                    ? "bg-blue-50 border-blue-300 text-blue-700"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }
              `}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={ct.icon} />
              </svg>
              {ct.label}
            </button>
          ))}
        </div>
      </section>

      {/* X-Axis */}
      <section>
        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
          X-Axis
        </label>
        <select
          value={config.xAxisColumn ?? ""}
          onChange={(e) => onXAxisChange(e.target.value)}
          className="w-full px-2 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
        >
          <option value="" disabled>
            Select column...
          </option>
          {availableColumns.map((col) => (
            <option key={col} value={col}>
              {col}
            </option>
          ))}
        </select>
      </section>

      {/* Y-Axis Series */}
      <section>
        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
          Y-Axis Series
        </label>
        <div className="flex flex-col gap-1.5">
          {config.series.map((s: SeriesConfig, i: number) => (
            <SeriesRow
              key={i}
              series={s}
              index={i}
              availableColumns={availableColumns}
              xAxisColumn={config.xAxisColumn}
              onUpdateColumn={(col) => onUpdateSeriesColumn(i, col)}
              onUpdateColor={(color) => onUpdateSeriesColor(i, color)}
              onRemove={() => onRemoveSeries(i)}
              canRemove={config.series.length > 1}
            />
          ))}
        </div>

        {/* Add series button */}
        {unusedColumns.length > 0 && (
          <button
            onClick={() => onAddSeries(unusedColumns[0])}
            className="mt-1.5 flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 font-medium"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add series
          </button>
        )}
      </section>

      {/* Animation Toggle */}
      <section>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={config.showAnimation}
            onChange={(e) => onAnimationChange(e.target.checked)}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-400 w-3.5 h-3.5"
          />
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
            Animation
          </span>
        </label>
      </section>
    </div>
  );
}

/* ─── Internal: Single series row ─── */

interface SeriesRowProps {
  series: SeriesConfig;
  index: number;
  availableColumns: string[];
  xAxisColumn: string | null;
  onUpdateColumn: (column: string) => void;
  onUpdateColor: (color: string) => void;
  onRemove: () => void;
  canRemove: boolean;
}

function SeriesRow({
  series,
  availableColumns,
  xAxisColumn,
  onUpdateColumn,
  onUpdateColor,
  onRemove,
  canRemove,
}: SeriesRowProps) {
  // All columns except the x-axis are available for y-axis
  const selectableColumns = availableColumns.filter(
    (col) => col !== xAxisColumn
  );

  return (
    <div className="flex items-center gap-1.5">
      {/* Color picker */}
      <input
        type="color"
        value={series.color}
        onChange={(e) => onUpdateColor(e.target.value)}
        className="w-6 h-6 rounded border border-slate-200 cursor-pointer p-0 bg-transparent"
        title="Series color"
      />

      {/* Column select */}
      <select
        value={series.column}
        onChange={(e) => onUpdateColumn(e.target.value)}
        className="flex-1 min-w-0 px-2 py-1.5 rounded border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
      >
        {selectableColumns.map((col) => (
          <option key={col} value={col}>
            {col}
          </option>
        ))}
      </select>

      {/* Remove button */}
      {canRemove && (
        <button
          onClick={onRemove}
          className="p-1 text-slate-400 hover:text-red-500 transition-colors"
          title="Remove series"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
