import type {
  ChartType,
  ChartConfig,
  ChartFamily,
  SeriesConfig,
} from "../../types/visualisation";
import { CHART_TYPE_REGISTRY } from "../../utils/chartRegistry";

interface ChartConfigPanelProps {
  config: ChartConfig;
  availableColumns: string[];
  onChartTypeChange: (type: ChartType) => void;
  onXAxisChange: (column: string) => void;
  onAddSeries: (column: string) => void;
  onRemoveSeries: (index: number) => void;
  onUpdateSeriesColumn: (index: number, column: string) => void;
  onUpdateSeriesColor: (index: number, color: string) => void;
  onLabelColumnChange: (column: string) => void;
  onValueColumnChange: (column: string) => void;
  onTitleChange: (title: string) => void;
  onSubtitleChange: (subtitle: string) => void;
}

const CHART_TYPES: { id: ChartType; label: string; icon: string; fill?: boolean }[] = [
  {
    id: "bar",
    label: "Bar",
    icon: "M4 20h4V10H4v10zm6 0h4V4h-4v16zm6 0h4v-8h-4v8z",
  },
  { id: "line", label: "Line", icon: "M3.5 18.5l6-6 4 4L22 6.5" },
  {
    id: "pie",
    label: "Pie",
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8v8l5.66 5.66C14.83 19.02 13.46 20 12 20z",
    fill: true,
  },
];

/**
 * ChartConfigPanel provides controls for configuring the chart:
 * chart type selection, and type-specific axis/data mapping controls.
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
  onLabelColumnChange,
  onValueColumnChange,
  onTitleChange,
  onSubtitleChange,
}: ChartConfigPanelProps) {
  const family: ChartFamily = CHART_TYPE_REGISTRY[config.chartType].family;

  // Columns not yet used in a series (for "Add series" dropdown — axis charts only)
  const unusedColumns = availableColumns.filter(
    (col) =>
      col !== config.xAxisColumn && !config.series.some((s) => s.column === col)
  );

  return (
    <div className="flex flex-col gap-4 p-3 text-xs">
      {/* Title & Subtitle */}
      <section>
        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Title
        </label>
        <input
          type="text"
          value={config.title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Chart title"
          className="mb-1.5 w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
        <input
          type="text"
          value={config.subtitle}
          onChange={(e) => onSubtitleChange(e.target.value)}
          placeholder="Subtitle (optional)"
          className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
      </section>

      {/* Chart Type */}
      <section>
        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
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
                    ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                 }
               `}
            >
              <svg
                className="w-3.5 h-3.5"
                fill={ct.fill ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                stroke={ct.fill ? "none" : "currentColor"}
                strokeWidth={ct.fill ? 0 : 2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={ct.icon}
                />
              </svg>
              {ct.label}
            </button>
          ))}
        </div>
      </section>

      {/* Type-specific config sections */}
      {family === "axis" && (
        <AxisConfig
          config={config}
          availableColumns={availableColumns}
          unusedColumns={unusedColumns}
          onXAxisChange={onXAxisChange}
          onAddSeries={onAddSeries}
          onRemoveSeries={onRemoveSeries}
          onUpdateSeriesColumn={onUpdateSeriesColumn}
          onUpdateSeriesColor={onUpdateSeriesColor}
        />
      )}

      {family === "pie" && (
        <PieConfig
          config={config}
          availableColumns={availableColumns}
          onLabelColumnChange={onLabelColumnChange}
          onValueColumnChange={onValueColumnChange}
        />
      )}
    </div>
  );
}

/* ─── Axis-family config sections ─── */

interface AxisConfigProps {
  config: ChartConfig;
  availableColumns: string[];
  unusedColumns: string[];
  onXAxisChange: (column: string) => void;
  onAddSeries: (column: string) => void;
  onRemoveSeries: (index: number) => void;
  onUpdateSeriesColumn: (index: number, column: string) => void;
  onUpdateSeriesColor: (index: number, color: string) => void;
}

function AxisConfig({
  config,
  availableColumns,
  unusedColumns,
  onXAxisChange,
  onAddSeries,
  onRemoveSeries,
  onUpdateSeriesColumn,
  onUpdateSeriesColor,
}: AxisConfigProps) {
  return (
    <>
      {/* X-Axis */}
      <section>
        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          X-Axis
        </label>
        <select
          value={config.xAxisColumn ?? ""}
          onChange={(e) => onXAxisChange(e.target.value)}
          className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
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
        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
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
            className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add series
          </button>
        )}
      </section>
    </>
  );
}

/* ─── Pie-family config sections ─── */

interface PieConfigProps {
  config: ChartConfig;
  availableColumns: string[];
  onLabelColumnChange: (column: string) => void;
  onValueColumnChange: (column: string) => void;
}

function PieConfig({
  config,
  availableColumns,
  onLabelColumnChange,
  onValueColumnChange,
}: PieConfigProps) {
  return (
    <>
      {/* Label Column */}
      <section>
        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Label Column
        </label>
        <select
          value={config.labelColumn ?? ""}
          onChange={(e) => onLabelColumnChange(e.target.value)}
          className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
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

      {/* Value Column */}
      <section>
        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Value Column
        </label>
        <select
          value={config.valueColumn ?? ""}
          onChange={(e) => onValueColumnChange(e.target.value)}
          className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          <option value="" disabled>
            Select column...
          </option>
          {availableColumns
            .filter((col) => col !== config.labelColumn)
            .map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
        </select>
      </section>
    </>
  );
}

/* ─── Internal: Single series row (axis charts) ─── */

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
        className="h-6 w-6 cursor-pointer rounded border border-slate-200 bg-transparent p-0 dark:border-slate-700"
        title="Series color"
      />

      {/* Column select */}
      <select
        value={series.column}
        onChange={(e) => onUpdateColumn(e.target.value)}
        className="min-w-0 flex-1 rounded border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
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
          className="p-1 text-slate-400 transition-colors hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400"
          title="Remove series"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
