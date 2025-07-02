"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Menu } from "lucide-react";

const data = [
  { month: "18-Oct", minTemp: 0, maxTemp: 25 },
  { month: "18-Nov", minTemp: -5, maxTemp: 20 },
  { month: "18-Dec", minTemp: -10, maxTemp: 15 },
  { month: "19-Jan", minTemp: -15, maxTemp: 15 },
  { month: "19-Feb", minTemp: -10, maxTemp: 20 },
  { month: "19-Mar", minTemp: -5, maxTemp: 25 },
  { month: "19-Apr", minTemp: 0, maxTemp: 25 },
  { month: "19-May", minTemp: 5, maxTemp: 25 },
  { month: "19-Jun", minTemp: 10, maxTemp: 25 },
];

export default function TemperatureChart() {
  return (
    <div className="relative">
      <div className="absolute top-0 right-0">
        <Menu className="h-5 w-5 text-gray-500" />
      </div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
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
                value: "°C",
                angle: -90,
                position: "insideLeft",
                fontSize: 10,
              }}
              domain={[-25, 50]}
            />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="minTemp"
              stroke="#36a2eb"
              name="Min Temperature"
              dot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="maxTemp"
              stroke="#ff6384"
              name="Max Temperature"
              dot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-4 justify-center mt-2">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-[#36a2eb]"></div>
          <span className="text-xs">Min Temperature</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-[#ff6384]"></div>
          <span className="text-xs">Max Temperature</span>
        </div>
      </div>
    </div>
  );
}
