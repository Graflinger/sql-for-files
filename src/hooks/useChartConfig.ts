import { useState, useMemo, useCallback } from "react";

import type { ChartType, ChartConfig } from "../types/visualisation";
import { DEFAULT_COLORS } from "../types/visualisation";
import type { QueryResult } from "../types/query";
import type { EChartsCoreOption } from "echarts/core";

import {
  CHART_TYPE_REGISTRY,
  EMPTY_CONFIG,
  mapConfigToNewType,
  detectDuplicateCategory,
  getChartFamily,
} from "../utils/chartRegistry";

/**
 * Module-level cache: persists chart configs across hook mount/unmount cycles.
 * Keyed by editor tab ID so each tab retains its own chart settings.
 */
interface CacheEntry {
  config: ChartConfig;
  resultRef: QueryResult | null;
}

const configCache = new Map<string, CacheEntry>();

/**
 * Auto-detect a sensible initial chart configuration from query results.
 * Defaults to a bar chart and merges type-specific detected fields.
 */
function autoDetectConfig(
  columns: string[],
  data: Record<string, unknown>[]
): ChartConfig {
  if (columns.length === 0 || data.length === 0) {
    return { ...EMPTY_CONFIG };
  }

  const defaultType: ChartType = "bar";
  const descriptor = CHART_TYPE_REGISTRY[defaultType];
  const detected = descriptor.autoDetect(columns, data);

  return {
    ...EMPTY_CONFIG,
    chartType: defaultType,
    ...detected,
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
  /** Set the chart type (smart-maps config when switching families) */
  setChartType: (type: ChartType) => void;
  /** Set the x-axis column (axis-family charts) */
  setXAxisColumn: (column: string) => void;
  /** Add a new y-axis series (axis-family charts) */
  addSeries: (column: string) => void;
  /** Remove a y-axis series by index (axis-family charts) */
  removeSeries: (index: number) => void;
  /** Update a series column by index (axis-family charts) */
  updateSeriesColumn: (index: number, column: string) => void;
  /** Update a series color by index (axis-family charts) */
  updateSeriesColor: (index: number, color: string) => void;
  /** Set the label column (pie-family charts) */
  setLabelColumn: (column: string) => void;
  /** Set the value column (pie-family charts) */
  setValueColumn: (column: string) => void;
  /** Set chart title */
  setTitle: (title: string) => void;
  /** Set chart subtitle */
  setSubtitle: (subtitle: string) => void;
  /** Whether the category column has duplicate values (needs GROUP BY) */
  hasDuplicateCategories: boolean;
}

/**
 * useChartConfig manages the chart configuration state for the Visualisation tab.
 *
 * - Auto-detects sensible defaults when the query result changes
 * - Caches config per editor tab so switching tabs preserves chart settings
 * - Provides setters for each config property
 * - Derives the ECharts option object reactively via the chart type registry
 *
 * @param result  Current query result (may be null)
 * @param tabId   Editor tab identifier used as cache key
 */
export function useChartConfig(
  result: QueryResult | null,
  tabId: string
): UseChartConfigReturn {
  const [config, setConfig] = useState<ChartConfig>(() => {
    const cached = configCache.get(tabId);
    if (cached && cached.resultRef === result) {
      return cached.config;
    }
    if (result && result.columns.length > 0 && result.data.length > 0) {
      return autoDetectConfig(result.columns, result.data);
    }
    return { ...EMPTY_CONFIG };
  });

  /**
   * Wrapper around setConfig that also writes the new config to the
   * module-level cache so it survives tab switches (mount/unmount).
   */
  const setConfigAndCache = useCallback(
    (updater: ChartConfig | ((prev: ChartConfig) => ChartConfig)) => {
      setConfig((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        const existing = configCache.get(tabId);
        configCache.set(tabId, {
          config: next,
          resultRef: existing?.resultRef ?? null,
        });
        return next;
      });
    },
    [tabId]
  );

  const availableColumns = useMemo(
    () => result?.columns ?? [],
    [result?.columns]
  );

  // Detect changes in result or tabId and restore/reset config accordingly.
  // Uses the React "derive state from props" pattern (no useEffect).
  const [prevResult, setPrevResult] = useState<QueryResult | null>(result);
  const [prevTabId, setPrevTabId] = useState(tabId);

  if (tabId !== prevTabId) {
    // Editor tab switched — restore from cache or auto-detect
    setPrevTabId(tabId);
    setPrevResult(result);

    const cached = configCache.get(tabId);
    if (cached && cached.resultRef === result) {
      setConfig(cached.config);
    } else {
      const nextConfig =
        result && result.columns.length > 0 && result.data.length > 0
          ? autoDetectConfig(result.columns, result.data)
          : { ...EMPTY_CONFIG };
      setConfig(nextConfig);
      configCache.set(tabId, { config: nextConfig, resultRef: result });
    }
  } else if (result !== prevResult) {
    // Same tab, but result changed — user ran a new query, auto-detect
    setPrevResult(result);

    const nextConfig =
      result && result.columns.length > 0 && result.data.length > 0
        ? autoDetectConfig(result.columns, result.data)
        : { ...EMPTY_CONFIG };
    setConfig(nextConfig);
    configCache.set(tabId, { config: nextConfig, resultRef: result });
  }

  // Delegate to the registry's per-type builder
  const echartsOption = useMemo(() => {
    const descriptor = CHART_TYPE_REGISTRY[config.chartType];
    return descriptor.buildOption(config, result?.data ?? []);
  }, [config, result?.data]);

  // Universal: if the builder produced an option, the chart can render
  const canRender = echartsOption !== null;

  // Detect duplicate values in the category column (x-axis or pie label)
  const hasDuplicateCategories = useMemo(() => {
    const family = getChartFamily(config.chartType);
    const categoryColumn =
      family === "axis" ? config.xAxisColumn : config.labelColumn;
    return detectDuplicateCategory(result?.data ?? [], categoryColumn);
  }, [config.chartType, config.xAxisColumn, config.labelColumn, result?.data]);

  // --- Setters ---

  const setChartType = useCallback(
    (chartType: ChartType) => {
      setConfigAndCache((prev) =>
        mapConfigToNewType(
          prev,
          chartType,
          result?.columns ?? [],
          result?.data ?? []
        )
      );
    },
    [setConfigAndCache, result?.columns, result?.data]
  );

  const setXAxisColumn = useCallback(
    (xAxisColumn: string) => {
      setConfigAndCache((prev) => ({ ...prev, xAxisColumn }));
    },
    [setConfigAndCache]
  );

  const addSeries = useCallback(
    (column: string) => {
      setConfigAndCache((prev) => {
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
    [setConfigAndCache]
  );

  const removeSeries = useCallback(
    (index: number) => {
      setConfigAndCache((prev) => ({
        ...prev,
        series: prev.series.filter((_, i) => i !== index),
      }));
    },
    [setConfigAndCache]
  );

  const updateSeriesColumn = useCallback(
    (index: number, column: string) => {
      setConfigAndCache((prev) => ({
        ...prev,
        series: prev.series.map((s, i) => (i === index ? { ...s, column } : s)),
      }));
    },
    [setConfigAndCache]
  );

  const updateSeriesColor = useCallback(
    (index: number, color: string) => {
      setConfigAndCache((prev) => ({
        ...prev,
        series: prev.series.map((s, i) => (i === index ? { ...s, color } : s)),
      }));
    },
    [setConfigAndCache]
  );

  const setLabelColumn = useCallback(
    (labelColumn: string) => {
      setConfigAndCache((prev) => ({ ...prev, labelColumn }));
    },
    [setConfigAndCache]
  );

  const setValueColumn = useCallback(
    (valueColumn: string) => {
      setConfigAndCache((prev) => ({ ...prev, valueColumn }));
    },
    [setConfigAndCache]
  );

  const setTitle = useCallback(
    (title: string) => {
      setConfigAndCache((prev) => ({ ...prev, title }));
    },
    [setConfigAndCache]
  );

  const setSubtitle = useCallback(
    (subtitle: string) => {
      setConfigAndCache((prev) => ({ ...prev, subtitle }));
    },
    [setConfigAndCache]
  );

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
    setLabelColumn,
    setValueColumn,
    setTitle,
    setSubtitle,
    hasDuplicateCategories,
  };
}
