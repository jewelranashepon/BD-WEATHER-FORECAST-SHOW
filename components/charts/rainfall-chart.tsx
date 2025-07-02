"use client";

import {
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Scatter,
} from "recharts";
import { Menu } from "lucide-react";

const data = [
  {
    month: "18-Oct",
    meanRainfall: 0,
    aggregatedRainfall: 5,
    longTermAverage: 10,
  },
  {
    month: "18-Nov",
    meanRainfall: 0,
    aggregatedRainfall: 5,
    longTermAverage: 5,
  },
  {
    month: "18-Dec",
    meanRainfall: 0,
    aggregatedRainfall: 5,
    longTermAverage: 8,
  },
  {
    month: "19-Jan",
    meanRainfall: 5,
    aggregatedRainfall: 10,
    longTermAverage: 15,
  },
  {
    month: "19-Feb",
    meanRainfall: 15,
    aggregatedRainfall: 20,
    longTermAverage: 25,
  },
  {
    month: "19-Mar",
    meanRainfall: 25,
    aggregatedRainfall: 50,
    longTermAverage: 30,
  },
  {
    month: "19-Apr",
    meanRainfall: 35,
    aggregatedRainfall: 90,
    longTermAverage: 35,
  },
  {
    month: "19-May",
    meanRainfall: 40,
    aggregatedRainfall: 120,
    longTermAverage: 40,
  },
  {
    month: "19-Jun",
    meanRainfall: 40,
    aggregatedRainfall: 150,
    longTermAverage: 35,
  },
];

export default function RainfallChart() {
  return (
    <div className="relative">
      <div className="absolute top-0 right-0">
        <Menu className="h-5 w-5 text-gray-500" />
      </div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis
              yAxisId="left"
              label={{
                value: "Rainfall",
                angle: -90,
                position: "insideLeft",
                fontSize: 10,
              }}
              domain={[0, 150]}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              label={{
                value: "Accumulated Rainfall",
                angle: 90,
                position: "insideRight",
                fontSize: 10,
              }}
              domain={[0, 180]}
            />
            <Tooltip />
            <Bar
              yAxisId="left"
              dataKey="meanRainfall"
              fill="#36a2eb"
              name="Mean Rainfall"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="aggregatedRainfall"
              stroke="#9966ff"
              name="Aggregated Rainfall"
              dot={{ r: 6 }}
            />
            <Scatter
              yAxisId="left"
              dataKey="longTermAverage"
              fill="#000"
              name="Long Term Average"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-4 justify-center mt-2">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[#36a2eb]"></div>
          <span className="text-xs">Mean Rainfall</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-[#9966ff]"></div>
          <span className="text-xs">Aggregated Rainfall</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-black transform rotate-45"></div>
          <span className="text-xs">Long Term Average</span>
        </div>
      </div>
    </div>
  );
}
