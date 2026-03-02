import { forwardRef, useImperativeHandle, useRef } from "react";

import EChartsReactCore from "echarts-for-react/lib/core";
import type { EChartsCoreOption } from "echarts/core";

import echarts from "./echartsSetup";

export interface ChartRendererHandle {
  /** Get the underlying ECharts instance for export operations */
  getEChartsInstance: () => ReturnType<EChartsReactCore["getEchartsInstance"]> | null;
}

interface ChartRendererProps {
  option: EChartsCoreOption;
}

/**
 * ChartRenderer wraps echarts-for-react with our tree-shaken ECharts setup.
 * Exposes a ref handle for export operations (SVG, PNG, clipboard).
 */
const ChartRenderer = forwardRef<ChartRendererHandle, ChartRendererProps>(
  function ChartRenderer({ option }, ref) {
    const chartRef = useRef<EChartsReactCore>(null);

    useImperativeHandle(ref, () => ({
      getEChartsInstance: () => {
        return chartRef.current?.getEchartsInstance() ?? null;
      },
    }));

    return (
      <EChartsReactCore
        ref={chartRef}
        echarts={echarts}
        option={option}
        opts={{ renderer: "svg" }}
        style={{ width: "100%", height: "100%" }}
        notMerge={true}
      />
    );
  }
);

export default ChartRenderer;
