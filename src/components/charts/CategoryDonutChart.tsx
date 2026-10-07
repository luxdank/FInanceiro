import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';

interface CategoryDonutChartProps {
  data: Array<{
    categoryId: string;
    name: string;
    color: string;
    total: number;
    percentage: number;
  }>;
}

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({ data }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const totalExpense = data.reduce((sum, item) => sum + item.total, 0);

  if (!data || data.length === 0 || totalExpense === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-sm">
        <p>Nenhuma despesa registrada no período selecionado.</p>
      </div>
    );
  }

  // Calculate SVG donut paths
  const size = 180;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativeAngle = -90; // Start at 12 o'clock

  const slices = data.map((item, idx) => {
    const fraction = item.total / totalExpense;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const rotation = cumulativeAngle;
    cumulativeAngle += fraction * 360;

    return {
      ...item,
      strokeDasharray,
      rotation,
      index: idx,
    };
  });

  const activeItem = hoveredIndex !== null ? data[hoveredIndex] : null;

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      {/* SVG Donut */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />

          {slices.map((slice) => {
            const isHovered = hoveredIndex === slice.index;
            return (
              <circle
                key={slice.categoryId}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={slice.strokeDasharray}
                strokeDashoffset={0}
                transform={`rotate(${slice.rotation} ${center} ${center})`}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredIndex(slice.index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            {activeItem ? activeItem.name : 'Total Gasto'}
          </span>
          <span className="text-base font-bold text-slate-800">
            {formatCurrency(activeItem ? activeItem.total : totalExpense)}
          </span>
          {activeItem && (
            <span className="text-xs font-semibold text-blue-600">
              {activeItem.percentage.toFixed(1)}%
            </span>
          )}
        </div>
      </div>

      {/* Legend list */}
      <div className="flex-1 w-full space-y-2 max-h-52 overflow-y-auto pr-1">
        {data.map((item, idx) => (
          <div
            key={item.categoryId}
            className={`flex items-center justify-between p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
              hoveredIndex === idx ? 'bg-slate-100 font-semibold' : 'hover:bg-slate-50'
            }`}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="flex items-center gap-2 truncate">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="truncate text-slate-700">{item.name}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-slate-500 font-medium">{item.percentage.toFixed(1)}%</span>
              <span className="font-semibold text-slate-800">{formatCurrency(item.total)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
