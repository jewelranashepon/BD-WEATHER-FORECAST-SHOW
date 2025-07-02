// components/charts.tsx
import React from "react";

export const LineChart = ({
  data,
  color,
  className,
}: {
  data: { name: string; value: number }[];
  color: string;
  className?: string;
}) => {
  const maxValue = Math.max(...data.map((item) => item.value));

  return (
    <div className={`relative ${className}`}>
      <svg viewBox={`0 0 300 120`} className="w-full h-full">
        <path
          d={data
            .map((item, i) => {
              const x = (i / (data.length - 1)) * 280 + 10;
              const y = 110 - (item.value / maxValue) * 90;
              return `${i === 0 ? "M" : "L"} ${x} ${y}`;
            })
            .join(" ")}
          stroke={`var(--${color}-500)`}
          strokeWidth="2"
          fill="none"
        />
        {data.map((item, i) => {
          const x = (i / (data.length - 1)) * 280 + 10;
          const y = 110 - (item.value / maxValue) * 90;
          return (
            <React.Fragment key={i}>
              <circle cx={x} cy={y} r="3" fill={`var(--${color}-500)`} />
              <text
                x={x}
                y="115"
                fontSize="8"
                textAnchor="middle"
                fill="currentColor"
                className="text-gray-500 dark:text-gray-400"
              >
                {item.name}
              </text>
            </React.Fragment>
          );
        })}
      </svg>
    </div>
  );
};

export const BarChart = ({
  data,
  color,
  className,
}: {
  data: { name: string; value: number }[];
  color: string;
  className?: string;
}) => {
  const maxValue = Math.max(...data.map((item) => item.value));

  return (
    <div className={`relative ${className}`}>
      <svg viewBox={`0 0 300 120`} className="w-full h-full">
        {data.map((item, i) => {
          const x = (i / data.length) * 300 + (300 / data.length) * 0.1;
          const width = (300 / data.length) * 0.8;
          const height = (item.value / maxValue) * 90;
          return (
            <React.Fragment key={i}>
              <rect
                x={x}
                y={110 - height}
                width={width}
                height={height}
                fill={`var(--${color}-500)`}
                opacity="0.8"
              />
              <text
                x={x + width / 2}
                y="115"
                fontSize="8"
                textAnchor="middle"
                fill="currentColor"
                className="text-gray-500 dark:text-gray-400"
              >
                {item.name}
              </text>
            </React.Fragment>
          );
        })}
      </svg>
    </div>
  );
};

export const RadialChart = ({
  value,
  maxValue,
  color,
  label,
  className,
}: {
  value: number;
  maxValue: number;
  color: string;
  label: string;
  className?: string;
}) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / maxValue) * circumference;

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={`var(--${color}-100)`}
          strokeWidth="8"
          className="dark:stroke-gray-700"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={`var(--${color}-500)`}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="middle"
          fill={`var(--${color}-500)`}
          fontSize="16"
          fontWeight="bold"
        >
          {value}
        </text>
        <text
          x="50"
          y="65"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="currentColor"
          fontSize="8"
          className="text-gray-500 dark:text-gray-400"
        >
          {label}
        </text>
      </svg>
    </div>
  );
};

export const DonutChart = ({
  data,
  colors,
  className,
}: {
  data: { name: string; value: number }[];
  colors: string[];
  className?: string;
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulativePercent = 0;

  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {data.map((item, i) => {
          const percent = item.value / total;
          const startX = 50 + 40 * Math.cos(2 * Math.PI * cumulativePercent);
          const startY = 50 + 40 * Math.sin(2 * Math.PI * cumulativePercent);
          cumulativePercent += percent;
          const endX = 50 + 40 * Math.cos(2 * Math.PI * cumulativePercent);
          const endY = 50 + 40 * Math.sin(2 * Math.PI * cumulativePercent);

          const largeArcFlag = percent > 0.5 ? 1 : 0;

          return (
            <path
              key={i}
              d={`M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
              fill={`var(--${colors[i]}-500)`}
              opacity="0.8"
            />
          );
        })}
        <circle
          cx="50"
          cy="50"
          r="30"
          fill="white"
          className="dark:fill-gray-800"
        />
      </svg>
    </div>
  );
};
