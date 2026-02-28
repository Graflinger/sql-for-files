import { useState, useMemo, useCallback } from "react";

import type { ChartType, ChartConfig, SeriesConfig } from "../types/visualisation";
import { DEFAULT_COLORS } from "../types/visualisation";
import type { QueryResult } from "../types/query";
import type { EChartsCoreOption } from "echarts/core";

/**
 * Determine whether a column appears numeric by sampling the first rows.
 * Returns true if every non-null value is a number.
 */
function isNumericColumn(
  data: Record<string, unknown>[],
  column: string
): boolean {
  const sample = data.slice(0, 20);
  return sample.every((row) => {
    const v = row[column];
    return v === null || v === undefined || typeof v === "number";
  });
}

/**
 * Auto-detect a sensible initial chart configuration from query results.
 *
 * Strategy:
 * - First non-numeric column → x-axis (fallback: first column)
 * - First numeric column → initial y-axis series
 * - Default chart type: bar, animation: on
 */
function autoDetectConfig(
  columns: string[],
  data: Record<string, unknown>[]
): ChartConfig {
  if (columns.length === 0 || data.length === 0) {
    return {
      chartType: "bar",
      xAxisColumn: null,
      series: [],
      showAnimation: true,
    };
  }

  const numericFlags = columns.map((col) => isNumericColumn(data, col));

  // First non-numeric column as x-axis, or first column if all numeric
  const xIndex = numericFlags.indexOf(false);
  const xAxisColumn = xIndex >= 0 ? columns[xIndex] : columns[0];

  // First numeric column that isn't the x-axis → initial y series
  const firstNumericIndex = numericFlags.findIndex(
    (isNum, i) => isNum && columns[i] !== xAxisColumn
  );

  const series: SeriesConfig[] =
    firstNumericIndex >= 0
      ? [{ column: columns[firstNumericIndex], color: DEFAULT_COLORS[0] }]
      : [];

  return {
    chartType: "bar",
    xAxisColumn,
    series,
    showAnimation: true,
  };
}

/**
 * Build an ECharts option object from a ChartConfig and query result data.
 */
function buildEChartsOption(
  config: ChartConfig,
  data: Record<string, unknown>[]
): EChartsCoreOption | null {
  if (!config.xAxisColumn || config.series.length === 0 || data.length === 0) {
    return null;
  }

  return {
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
      show: config.series.length > 1,
    },
    animation: config.showAnimation,
    grid: {
      left: 60,
      right: 30,
      top: config.series.length > 1 ? 40 : 20,
      bottom: 50,
      containLabel: false,
    },
  };
}

interface UseChartConfigReturn {
  /** Current chart configuration */
  config: ChartConfig;
  /** Derived ECharts option (null if config is incomplete) */
  echartsOption: EChartsCoreOption | null;
  /** Whether a valid chart can be rendered */
  canRender: boolean;
  /** Available column names from current result */
  availableColumns: string[];
  /** Set the chart type */
  setChartType: (type: ChartType) => void;
  /** Set the x-axis column */
  setXAxisColumn: (column: string) => void;
  /** Add a new y-axis series */
  addSeries: (column: string) => void;
  /** Remove a y-axis series by index */
  removeSeries: (index: number) => void;
  /** Update a series column by index */
  updateSeriesColumn: (index: number, column: string) => void;
  /** Update a series color by index */
  updateSeriesColor: (index: number, color: string) => void;
  /** Toggle animation on/off */
  setShowAnimation: (show: boolean) => void;
}

/**
 * useChartConfig manages the chart configuration state for the Visualisation tab.
 *
 * - Auto-detects sensible defaults when the query result changes
 * - Provides setters for each config property
 * - Derives the ECharts option object reactively
 */
export function useChartConfig(
  result: QueryResult | null
): UseChartConfigReturn {
  const [config, setConfig] = useState<ChartConfig>({
    chartType: "bar",
    xAxisColumn: null,
    series: [],
    showAnimation: true,
  });

  const availableColumns = useMemo(
    () => result?.columns ?? [],
    [result?.columns]
  );

  // Adjust config when result changes (React "derive state from props" pattern)
  // See: https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [prevResult, setPrevResult] = useState<QueryResult | null>(null);
  if (result !== prevResult) {
    setPrevResult(result);
    const nextConfig =
      result && result.columns.length > 0 && result.data.length > 0
        ? autoDetectConfig(result.columns, result.data)
        : { chartType: "bar" as const, xAxisColumn: null, series: [] as SeriesConfig[], showAnimation: true };
    setConfig(nextConfig);
  }

  const echartsOption = useMemo(
    () => buildEChartsOption(config, result?.data ?? []),
    [config, result?.data]
  );

  const canRender =
    echartsOption !== null &&
    config.xAxisColumn !== null &&
    config.series.length > 0;

  const setChartType = useCallback((chartType: ChartType) => {
    setConfig((prev) => ({ ...prev, chartType }));
  }, []);

  const setXAxisColumn = useCallback((xAxisColumn: string) => {
    setConfig((prev) => ({ ...prev, xAxisColumn }));
  }, []);

  const addSeries = useCallback(
    (column: string) => {
      setConfig((prev) => {
        const nextColorIndex = prev.series.length % DEFAULT_COLORS.length;
        return {
          ...prev,
          series: [
            ...prev.series,
            { column, color: DEFAULT_COLORS[nextColorIndex] },
          ],
        };
      });
    },
    []
  );

  const removeSeries = useCallback((index: number) => {
    setConfig((prev) => ({
      ...prev,
      series: prev.series.filter((_, i) => i !== index),
    }));
  }, []);

  const updateSeriesColumn = useCallback((index: number, column: string) => {
    setConfig((prev) => ({
      ...prev,
      series: prev.series.map((s, i) => (i === index ? { ...s, column } : s)),
    }));
  }, []);

  const updateSeriesColor = useCallback((index: number, color: string) => {
    setConfig((prev) => ({
      ...prev,
      series: prev.series.map((s, i) => (i === index ? { ...s, color } : s)),
    }));
  }, []);

  const setShowAnimation = useCallback((showAnimation: boolean) => {
    setConfig((prev) => ({ ...prev, showAnimation }));
  }, []);

  return {
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
    setShowAnimation,
  };
}
