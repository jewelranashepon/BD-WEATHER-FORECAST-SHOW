"use client";

import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Scatter,
  ComposedChart,
} from "recharts";
import { Menu } from "lucide-react";

const data = [
  { month: "18-Oct", soilMoisture: 25, longTermAverage: 25 },
  { month: "18-Nov", soilMoisture: 20, longTermAverage: 22 },
  { month: "18-Dec", soilMoisture: 20, longTermAverage: 22 },
  { month: "19-Jan", soilMoisture: 22, longTermAverage: 25 },
  { month: "19-Feb", soilMoisture: 25, longTermAverage: 28 },
  { month: "19-Mar", soilMoisture: 40, longTermAverage: 25 },
  { month: "19-Apr", soilMoisture: 35, longTermAverage: 22 },
  { month: "19-May", soilMoisture: 25, longTermAverage: 25 },
  { month: "19-Jun", soilMoisture: 22, longTermAverage: 30 },
];

export default function SoilMoistureChart() {
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
                value: "kg/m²",
                angle: -90,
                position: "insideLeft",
                fontSize: 10,
              }}
              domain={[0, 60]}
            />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="soilMoisture"
              stroke="#ff9f40"
              name="Soil Moisture"
              dot={{ r: 6 }}
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
          <div className="w-3 h-3 rounded-full bg-[#ff9f40]"></div>
          <span className="text-xs">Soil Moisture</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-black transform rotate-45"></div>
          <span className="text-xs">Long Term Average</span>
        </div>
      </div>
    </div>
  );
}
