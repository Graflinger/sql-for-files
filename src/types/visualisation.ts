// Supported chart types (extensible — add "scatter", "area", etc. later)
export type ChartType = "bar" | "line" | "pie";

// Chart family determines which config fields and UI controls are relevant
export type ChartFamily = "axis" | "pie";

// Configuration for a single Y-axis series (axis-family charts only)
export interface SeriesConfig {
  column: string;
  color: string;
}

// Full chart configuration managed by useChartConfig
export interface ChartConfig {
  chartType: ChartType;
  title: string;
  subtitle: string;
  // Axis-family fields (bar, line, scatter, area)
  xAxisColumn: string | null;
  series: SeriesConfig[];
  // Pie-family fields
  labelColumn: string | null;
  valueColumn: string | null;
}

import type { EChartsCoreOption } from "echarts/core";

/**
 * Descriptor for a chart type in the registry.
 * Each chart type provides its own ECharts option builder, auto-detection
 * heuristic, and render-readiness check.
 */
export interface ChartTypeDescriptor {
  id: ChartType;
  family: ChartFamily;
  /** Build a complete ECharts option, or null if config is incomplete. */
  buildOption: (
    config: ChartConfig,
    data: Record<string, unknown>[]
  ) => EChartsCoreOption | null;
  /** Auto-detect sensible defaults for this chart type from query columns and data. */
  autoDetect: (
    columns: string[],
    data: Record<string, unknown>[]
  ) => Partial<ChartConfig>;
  /** Check whether enough config is set to render this chart type. */
  canRender: (config: ChartConfig) => boolean;
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
