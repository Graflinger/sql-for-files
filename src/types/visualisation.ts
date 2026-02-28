// Supported chart types (extensible — add "scatter", "area", etc. later)
export type ChartType = "bar" | "line";

// Configuration for a single Y-axis series
export interface SeriesConfig {
  column: string;
  color: string;
}

// Full chart configuration managed by useChartConfig
export interface ChartConfig {
  chartType: ChartType;
  xAxisColumn: string | null;
  series: SeriesConfig[];
  showAnimation: boolean;
}

// Default ECharts-inspired color palette
export const DEFAULT_COLORS = [
  "#5470c6",
  "#91cc75",
  "#fac858",
  "#ee6666",
  "#73c0de",
  "#3ba272",
  "#fc8452",
  "#9a60b4",
  "#ea7ccc",
];
