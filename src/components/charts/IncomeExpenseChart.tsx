import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';

interface IncomeExpenseChartProps {
  data: Array<{
    month: string;
    monthLabel: string;
    income: number;
    expense: number;
  }>;
}

export const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({ data }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
        Sem dados para exibição no período.
      </div>
    );
  }

  const maxVal = Math.max(
    ...data.flatMap((d) => [d.income, d.expense]),
    1000
  ) * 1.15; // 15% headroom

  const chartHeight = 200;
  const chartWidth = 520;
  const paddingLeft = 45;
  const paddingBottom = 30;
  const paddingTop = 20;
  const usableHeight = chartHeight - paddingTop - paddingBottom;
  const groupWidth = (chartWidth - paddingLeft) / data.length;
  const barWidth = Math.min(22, (groupWidth - 14) / 2);

  return (
    <div className="relative w-full">
      {/* Chart Legend */}
      <div className="flex items-center justify-between mb-3 text-xs text-slate-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block shadow-xs" />
            <span className="font-medium text-slate-700">Receitas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block shadow-xs" />
            <span className="font-medium text-slate-700">Despesas</span>
          </div>
        </div>
        {hoveredIdx !== null && (
          <div className="text-right text-xs bg-slate-900 text-white px-2.5 py-1 rounded shadow-md transition-all">
            <span className="font-semibold">{data[hoveredIdx].monthLabel}: </span>
            <span className="text-emerald-300">+{formatCurrency(data[hoveredIdx].income)}</span> /{' '}
            <span className="text-rose-300">-{formatCurrency(data[hoveredIdx].expense)}</span>
          </div>
        )}
      </div>

      {/* SVG canvas */}
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full h-auto aspect-[520/200] max-h-56 overflow-visible"
      >
        {/* Horizontal gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = paddingTop + usableHeight * (1 - ratio);
          const val = maxVal * ratio;
          return (
            <g key={ratio}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={chartWidth}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray={ratio === 0 ? '0' : '3,3'}
                strokeWidth={1}
              />
              <text
                x={paddingLeft - 8}
                y={y + 3}
                textAnchor="end"
                className="text-[9px] fill-slate-400 font-medium"
              >
                {ratio === 0 ? '0' : `R$ ${(val / 1000).toFixed(0)}k`}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((item, idx) => {
          const centerX = paddingLeft + idx * groupWidth + groupWidth / 2;
          const incomeHeight = (item.income / maxVal) * usableHeight;
          const expenseHeight = (item.expense / maxVal) * usableHeight;
          const incomeY = paddingTop + usableHeight - incomeHeight;
          const expenseY = paddingTop + usableHeight - expenseHeight;
          const isHovered = hoveredIdx === idx;

          return (
            <g
              key={item.month}
              className="cursor-pointer transition-opacity"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Highlight background on hover */}
              {isHovered && (
                <rect
                  x={paddingLeft + idx * groupWidth + 4}
                  y={paddingTop}
                  width={groupWidth - 8}
                  height={usableHeight}
                  fill="#f1f5f9"
                  rx={6}
                  opacity={0.7}
                />
              )}

              {/* Income bar (green) */}
              <rect
                x={centerX - barWidth - 2}
                y={incomeY}
                width={barWidth}
                height={Math.max(2, incomeHeight)}
                rx={3}
                fill="#10b981"
                className="transition-all duration-300 hover:brightness-110"
              />

              {/* Expense bar (rose) */}
              <rect
                x={centerX + 2}
                y={expenseY}
                width={barWidth}
                height={Math.max(2, expenseHeight)}
                rx={3}
                fill="#f43f5e"
                className="transition-all duration-300 hover:brightness-110"
              />

              {/* Month X label */}
              <text
                x={centerX}
                y={chartHeight - 8}
                textAnchor="middle"
                className={`text-[10px] font-medium transition-colors ${
                  isHovered ? 'fill-blue-600 font-bold' : 'fill-slate-500'
                }`}
              >
                {item.monthLabel}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
