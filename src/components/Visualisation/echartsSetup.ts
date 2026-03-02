/**
 * Tree-shaken ECharts setup.
 *
 * Only registers the chart types and components we actually use,
 * keeping the bundle small. Import `echarts` from this file instead
 * of from "echarts" directly.
 */
import * as echarts from "echarts/core";
import { BarChart, LineChart, PieChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DatasetComponent,
  TitleComponent,
} from "echarts/components";
import { SVGRenderer } from "echarts/renderers";

echarts.use([
  BarChart,
  LineChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DatasetComponent,
  TitleComponent,
  SVGRenderer,
]);

export default echarts;
