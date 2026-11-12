"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export interface AdminBarChartSeries {
  dataKey: string;
  name?: string;
  fill?: string;
  radius?: [number, number, number, number];
  barSize?: number;
}

export interface AdminBarChartProps {
  data: object[];
  height: number;
  minWidth?: number;
  layout?: "horizontal" | "vertical";
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
  grid?: {
    horizontal?: boolean;
    vertical?: boolean;
    stroke?: string;
    opacity?: number;
  };
  xAxis?: {
    dataKey?: string;
    type?: "number" | "category";
    domain?: [number, number];
    unit?: string;
    percentTick?: boolean;
    tick?: Record<string, unknown>;
  };
  yAxis?: {
    dataKey?: string;
    type?: "number" | "category";
    width?: number;
    allowDecimals?: boolean;
    tickLine?: boolean;
    axisLine?: boolean;
    tick?: Record<string, unknown>;
  };
  tooltipLabel?: string;
  bars: AdminBarChartSeries[];
}

export default function AdminBarChart({
  data,
  height,
  minWidth,
  layout = "horizontal",
  margin,
  grid,
  xAxis,
  yAxis,
  tooltipLabel,
  bars,
}: AdminBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height} minWidth={minWidth}>
      <BarChart data={data} layout={layout} margin={margin}>
        <CartesianGrid
          strokeDasharray="3 3"
          horizontal={grid?.horizontal}
          vertical={grid?.vertical}
          stroke={grid?.stroke}
          opacity={grid?.stroke ? undefined : (grid?.opacity ?? 0.2)}
        />
        <XAxis
          dataKey={xAxis?.dataKey}
          type={xAxis?.type}
          domain={xAxis?.domain}
          unit={xAxis?.unit}
          tick={xAxis?.tick}
          tickFormatter={xAxis?.percentTick ? (n) => `${n}%` : undefined}
        />
        <YAxis
          dataKey={yAxis?.dataKey}
          type={yAxis?.type}
          width={yAxis?.width}
          allowDecimals={yAxis?.allowDecimals}
          tickLine={yAxis?.tickLine}
          axisLine={yAxis?.axisLine}
          tick={yAxis?.tick}
        />
        <Tooltip
          formatter={
            tooltipLabel
              ? (v) => [Number(v).toFixed(1) + "%", tooltipLabel]
              : undefined
          }
        />
        {bars.map((b) => (
          <Bar
            key={b.dataKey}
            dataKey={b.dataKey}
            name={b.name}
            fill={b.fill}
            radius={b.radius}
            barSize={b.barSize}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
