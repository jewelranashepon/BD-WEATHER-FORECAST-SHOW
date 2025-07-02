"use client";

import {
  Bar,
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
  { month: "18-Oct", evapotranspiration: 25, longTermAverage: 25 },
  { month: "18-Nov", evapotranspiration: 15, longTermAverage: 15 },
  { month: "18-Dec", evapotranspiration: 10, longTermAverage: 12 },
  { month: "19-Jan", evapotranspiration: 10, longTermAverage: 12 },
  { month: "19-Feb", evapotranspiration: 15, longTermAverage: 18 },
  { month: "19-Mar", evapotranspiration: 20, longTermAverage: 25 },
  { month: "19-Apr", evapotranspiration: 30, longTermAverage: 28 },
  { month: "19-May", evapotranspiration: 35, longTermAverage: 30 },
  { month: "19-Jun", evapotranspiration: 30, longTermAverage: 30 },
];

export default function EvapotranspirationChart() {
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
              label={{
                value: "mm/day",
                angle: -90,
                position: "insideLeft",
                fontSize: 10,
              }}
              domain={[0, 50]}
            />
            <Tooltip />
            <Bar
              dataKey="evapotranspiration"
              fill="#36a2eb"
              name="Total Evapotranspiration"
            />
            <Scatter
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
          <span className="text-xs">Total Evapotranspiration</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-black"></div>
          <span className="text-xs">Long Term Average</span>
        </div>
      </div>
    </div>
  );
}
