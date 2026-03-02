import type {
  ChartType,
  ChartConfig,
  ChartTypeDescriptor,
} from "../types/visualisation";
import { DEFAULT_COLORS } from "../types/visualisation";
import type { EChartsCoreOption } from "echarts/core";

/* ─── Shared helpers ─── */

/**
 * Determine whether a column appears numeric by sampling the first rows.
 * Returns true if every non-null value is a number.
 */
export function isNumericColumn(
  data: Record<string, unknown>[],
  column: string
): boolean {
  const sample = data.slice(0, 20);
  return sample.every((row) => {
    const v = row[column];
    return v === null || v === undefined || typeof v === "number";
  });
}

/** Empty config with all fields set to their null/default values. */
export const EMPTY_CONFIG: ChartConfig = {
  chartType: "bar",
  title: "",
  subtitle: "",
  xAxisColumn: null,
  series: [],
  labelColumn: null,
  valueColumn: null,
};

/**
 * Detect whether a category column contains duplicate values.
 * Returns true when the same value appears in more than one row,
 * which typically means the data needs a GROUP BY aggregation for
 * a meaningful chart.
 */
export function detectDuplicateCategory(
  data: Record<string, unknown>[],
  categoryColumn: string | null
): boolean {
  if (!categoryColumn || data.length === 0) return false;
  const values = data.map((row) => row[categoryColumn]);
  return new Set(values).size < values.length;
}

/* ─── Axis-family (bar, line, scatter, area) ─── */

function autoDetectAxis(
  columns: string[],
  data: Record<string, unknown>[]
): Partial<ChartConfig> {
  const numericFlags = columns.map((col) => isNumericColumn(data, col));

  // First non-numeric column as x-axis, or first column if all numeric
  const xIndex = numericFlags.indexOf(false);
  const xAxisColumn = xIndex >= 0 ? columns[xIndex] : columns[0];

  // First numeric column that isn't the x-axis → initial y series
  const firstNumericIndex = numericFlags.findIndex(
    (isNum, i) => isNum && columns[i] !== xAxisColumn
  );

  const series =
    firstNumericIndex >= 0
      ? [{ column: columns[firstNumericIndex], color: DEFAULT_COLORS[0] }]
      : [];

  return { xAxisColumn, series };
}

function buildAxisOption(
  config: ChartConfig,
  data: Record<string, unknown>[]
): EChartsCoreOption | null {
  if (!config.xAxisColumn || config.series.length === 0 || data.length === 0) {
    return null;
  }

  const hasTitle = config.title || config.subtitle;
  const hasLegend = config.series.length > 1;

  // Compute top spacing: title + optional subtitle + optional legend + base gap
  let gridTop = 20;
  if (hasTitle) {
    gridTop = config.subtitle ? 70 : 50;
  } else if (hasLegend) {
    gridTop = 40;
  }

  return {
    title: hasTitle
      ? {
          text: config.title,
          subtext: config.subtitle,
          left: "center" as const,
        }
      : undefined,
    dataset: {
      source: data,
    },
    xAxis: {
      type: "category" as const,
      name: config.xAxisColumn,
      nameLocation: "center" as const,
      nameGap: 30,
    },
    yAxis: {
      type: "value" as const,
    },
    series: config.series.map((s) => ({
      type: config.chartType,
      name: s.column,
      encode: { x: config.xAxisColumn, y: s.column },
      itemStyle: { color: s.color },
    })),
    tooltip: {
      trigger: "axis" as const,
    },
    legend: {
      show: hasLegend,
      top: hasTitle ? (config.subtitle ? 50 : 30) : undefined,
    },
    grid: {
      left: 60,
      right: 30,
      top: hasLegend && hasTitle ? gridTop + 20 : gridTop,
      bottom: 50,
      containLabel: false,
    },
  };
}

function canRenderAxis(config: ChartConfig): boolean {
  return config.xAxisColumn !== null && config.series.length > 0;
}

/* ─── Pie-family ─── */

function autoDetectPie(
  columns: string[],
  data: Record<string, unknown>[]
): Partial<ChartConfig> {
  const numericFlags = columns.map((col) => isNumericColumn(data, col));

  // First non-numeric column as label, or first column if all numeric
  const labelIndex = numericFlags.indexOf(false);
  const labelColumn = labelIndex >= 0 ? columns[labelIndex] : columns[0];

  // First numeric column that isn't the label → value
  const valueIndex = numericFlags.findIndex(
    (isNum, i) => isNum && columns[i] !== labelColumn
  );
  const valueColumn = valueIndex >= 0 ? columns[valueIndex] : null;

  return { labelColumn, valueColumn };
}

function buildPieOption(
  config: ChartConfig,
  data: Record<string, unknown>[]
): EChartsCoreOption | null {
  if (!config.labelColumn || !config.valueColumn || data.length === 0) {
    return null;
  }

  const hasTitle = config.title || config.subtitle;

  return {
    title: hasTitle
      ? {
          text: config.title,
          subtext: config.subtitle,
          left: "center" as const,
        }
      : undefined,
    dataset: {
      source: data,
    },
    series: [
      {
        type: "pie" as const,
        radius: "60%",
        center: ["50%", "55%"],
        encode: {
          itemName: config.labelColumn,
          value: config.valueColumn,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
    tooltip: {
      trigger: "item" as const,
    },
    legend: {
      orient: "horizontal" as const,
      top: hasTitle ? (config.subtitle ? 50 : 30) : "top",
    },
  };
}

function canRenderPie(config: ChartConfig): boolean {
  return config.labelColumn !== null && config.valueColumn !== null;
}

/* ─── Registry ─── */

/**
 * Central registry mapping each chart type to its descriptor.
 * To add a new chart type: add a union member to ChartType, register the
 * ECharts chart in echartsSetup.ts, and add a descriptor entry here.
 */
export const CHART_TYPE_REGISTRY: Record<ChartType, ChartTypeDescriptor> = {
  bar: {
    id: "bar",
    family: "axis",
    buildOption: buildAxisOption,
    autoDetect: autoDetectAxis,
    canRender: canRenderAxis,
  },
  line: {
    id: "line",
    family: "axis",
    buildOption: buildAxisOption,
    autoDetect: autoDetectAxis,
    canRender: canRenderAxis,
  },
  pie: {
    id: "pie",
    family: "pie",
    buildOption: buildPieOption,
    autoDetect: autoDetectPie,
    canRender: canRenderPie,
  },
};

/**
 * Get the chart family for a given chart type.
 */
export function getChartFamily(chartType: ChartType) {
  return CHART_TYPE_REGISTRY[chartType].family;
}

/**
 * Intelligently map config fields when switching between chart type families.
 *
 * - Same family (e.g. bar↔line): only swaps chartType, everything else preserved.
 * - axis→pie: xAxisColumn→labelColumn, first series column→valueColumn.
 * - pie→axis: labelColumn→xAxisColumn, valueColumn→first series.
 * - Falls back to auto-detect when mapping produces incomplete fields.
 */
export function mapConfigToNewType(
  prev: ChartConfig,
  newType: ChartType,
  columns: string[],
  data: Record<string, unknown>[]
): ChartConfig {
  const prevFamily = getChartFamily(prev.chartType);
  const newFamily = getChartFamily(newType);

  // Same family — just swap the chart type string
  if (prevFamily === newFamily) {
    return { ...prev, chartType: newType };
  }

  const descriptor = CHART_TYPE_REGISTRY[newType];

  if (prevFamily === "axis" && newFamily === "pie") {
    // Carry over: xAxisColumn → labelColumn, first series → valueColumn
    const labelColumn = prev.xAxisColumn;
    const valueColumn = prev.series.length > 0 ? prev.series[0].column : null;

    if (labelColumn && valueColumn) {
      return {
        ...prev,
        chartType: newType,
        labelColumn,
        valueColumn,
      };
    }
  }

  if (prevFamily === "pie" && newFamily === "axis") {
    // Carry over: labelColumn → xAxisColumn, valueColumn → first series
    const xAxisColumn = prev.labelColumn;
    const series = prev.valueColumn
      ? [{ column: prev.valueColumn, color: DEFAULT_COLORS[0] }]
      : [];

    if (xAxisColumn && series.length > 0) {
      return {
        ...prev,
        chartType: newType,
        xAxisColumn,
        series,
      };
    }
  }

  // Mapping produced incomplete fields — fall back to auto-detect
  const detected =
    columns.length > 0 && data.length > 0
      ? descriptor.autoDetect(columns, data)
      : {};

  return {
    ...prev,
    ...detected,
    chartType: newType,
  };
}
