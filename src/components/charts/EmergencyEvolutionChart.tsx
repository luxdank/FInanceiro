import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';

interface EmergencyEvolutionChartProps {
  data: Array<{
    month: string;
    monthLabel: string;
    emergency: number;
  }>;
  targetAmount: number;
}

export const EmergencyEvolutionChart: React.FC<EmergencyEvolutionChartProps> = ({
  data,
  targetAmount,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="h-56 flex items-center justify-center text-slate-400 text-sm">Sem dados disponíveis.</div>;
  }

  const maxVal = Math.max(...data.map((d) => d.emergency), targetAmount, 1000) * 1.15;
  const chartHeight = 180;
  const chartWidth = 500;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 25;
  const usableWidth = chartWidth - paddingLeft - paddingRight;
  const usableHeight = chartHeight - paddingTop - paddingBottom;

  const getX = (idx: number) => paddingLeft + (idx / (data.length - 1)) * usableWidth;
  const getY = (val: number) => paddingTop + usableHeight * (1 - val / maxVal);

  const points = data.map((d, i) => `${getX(i)},${getY(d.emergency)}`).join(' ');
  const areaPoints = `${getX(0)},${paddingTop + usableHeight} ${points} ${getX(data.length - 1)},${
    paddingTop + usableHeight
  }`;

  const targetY = getY(targetAmount);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2 text-xs text-slate-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-blue-600 inline-block" />
            <span>Saldo Acumulado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-500 border-t border-dashed border-emerald-500 inline-block" />
            <span className="text-emerald-700 font-medium">Meta ({formatCurrency(targetAmount)})</span>
          </div>
        </div>
        {hoveredIdx !== null && (
          <div className="text-xs font-semibold text-blue-700">
            {data[hoveredIdx].monthLabel}: {formatCurrency(data[hoveredIdx].emergency)}
          </div>
        )}
      </div>

      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto aspect-[500/180] max-h-52 overflow-visible">
        <defs>
          <linearGradient id="emergencyGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.5, 1].map((ratio) => {
          const y = paddingTop + usableHeight * (1 - ratio);
          const val = maxVal * ratio;
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

        {/* Target goal dashed line */}
        <line
          x1={paddingLeft}
          y1={targetY}
          x2={chartWidth - paddingRight}
          y2={targetY}
          stroke="#10b981"
          strokeDasharray="4,4"
          strokeWidth={1.5}
        />
        <text
          x={chartWidth - paddingRight - 4}
          y={targetY - 5}
          textAnchor="end"
          className="text-[9px] fill-emerald-600 font-semibold"
        >
          Meta {formatCurrency(targetAmount)}
        </text>

        {/* Area fill */}
        <polygon points={areaPoints} fill="url(#emergencyGradient)" />

        {/* Line curve */}
        <polyline points={points} fill="none" stroke="#2563eb" strokeWidth={2.5} strokeLinecap="round" />

        {/* Data points */}
        {data.map((d, i) => {
          const cx = getX(i);
          const cy = getY(d.emergency);
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
                stroke="#2563eb"
                strokeWidth={2.5}
                className="transition-all"
              />
              <text
                x={cx}
                y={chartHeight - 6}
                textAnchor="middle"
                className={`text-[10px] ${isHovered ? 'fill-blue-700 font-bold' : 'fill-slate-500'}`}
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
