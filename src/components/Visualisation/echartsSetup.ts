/**
 * Tree-shaken ECharts setup.
 *
 * Only registers the chart types and components we actually use,
 * keeping the bundle small. Import `echarts` from this file instead
 * of from "echarts" directly.
 */
import * as echarts from "echarts/core";
import { BarChart, LineChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DatasetComponent,
} from "echarts/components";
import { SVGRenderer } from "echarts/renderers";

echarts.use([
  BarChart,
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DatasetComponent,
  SVGRenderer,
]);

export default echarts;
