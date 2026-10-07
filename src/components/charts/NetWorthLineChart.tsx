import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';

interface NetWorthLineChartProps {
  data: Array<{
    month: string;
    monthLabel: string;
    netWorth: number;
  }>;
}

export const NetWorthLineChart: React.FC<NetWorthLineChartProps> = ({ data }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="h-56 flex items-center justify-center text-slate-400 text-sm">Sem dados.</div>;
  }

  const values = data.map((d) => d.netWorth);
  const minVal = Math.max(0, Math.min(...values) * 0.9);
  const maxVal = Math.max(...values, 1000) * 1.08;

  const chartHeight = 190;
  const chartWidth = 520;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 25;
  const usableWidth = chartWidth - paddingLeft - paddingRight;
  const usableHeight = chartHeight - paddingTop - paddingBottom;

  const getX = (idx: number) => paddingLeft + (idx / (data.length - 1)) * usableWidth;
  const getY = (val: number) => {
    const range = maxVal - minVal;
    if (range <= 0) return paddingTop + usableHeight / 2;
    return paddingTop + usableHeight * (1 - (val - minVal) / range);
  };

  const points = data.map((d, i) => `${getX(i)},${getY(d.netWorth)}`).join(' ');
  const areaPoints = `${getX(0)},${paddingTop + usableHeight} ${points} ${getX(data.length - 1)},${
    paddingTop + usableHeight
  }`;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-0.5 bg-indigo-600 inline-block" />
          <span className="text-slate-600 font-medium">Evolução do Patrimônio Líquido</span>
        </div>
        {hoveredIdx !== null && (
          <div className="bg-indigo-900 text-white px-2 py-0.5 rounded text-xs font-semibold shadow-xs">
            {data[hoveredIdx].monthLabel}: {formatCurrency(data[hoveredIdx].netWorth)}
          </div>
        )}
      </div>

      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto aspect-[520/190] max-h-52 overflow-visible">
        <defs>
          <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.5, 1].map((ratio) => {
          const y = paddingTop + usableHeight * (1 - ratio);
          const val = minVal + (maxVal - minVal) * ratio;
          return (
            <g key={ratio}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={chartWidth - paddingRight}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray="2,2"
                strokeWidth={1}
              />
              <text x={paddingLeft - 8} y={y + 3} textAnchor="end" className="text-[9px] fill-slate-400">
                R$ {(val / 1000).toFixed(0)}k
              </text>
            </g>
          );
        })}

        {/* Gradient polygon */}
        <polygon points={areaPoints} fill="url(#netWorthGradient)" />

        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke="#4f46e5"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {data.map((d, i) => {
          const cx = getX(i);
          const cy = getY(d.netWorth);
          const isHovered = hoveredIdx === i;

          return (
            <g
              key={d.month}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <circle
                cx={cx}
                cy={cy}
                r={isHovered ? 6 : 4}
                fill="#ffffff"
                stroke="#4f46e5"
                strokeWidth={2.5}
                className="transition-all"
              />
              <text
                x={cx}
                y={chartHeight - 6}
                textAnchor="middle"
                className={`text-[10px] ${isHovered ? 'fill-indigo-700 font-bold' : 'fill-slate-500'}`}
              >
                {d.monthLabel}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
