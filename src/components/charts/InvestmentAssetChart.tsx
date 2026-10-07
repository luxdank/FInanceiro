import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';

interface InvestmentAssetChartProps {
  data: Array<{
    assetClass: string;
    total: number;
    percentage: number;
    color: string;
  }>;
}

export const InvestmentAssetChart: React.FC<InvestmentAssetChartProps> = ({ data }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const total = data.reduce((sum, item) => sum + item.total, 0);

  if (!data || data.length === 0 || total === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
        Nenhum ativo cadastrado na carteira.
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Horizontal Multi-color Stacked Bar */}
      <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
        {data.map((item, idx) => (
          <div
            key={item.assetClass}
            style={{
              width: `${Math.max(item.percentage, 1)}%`,
              backgroundColor: item.color,
            }}
            className="h-full transition-all hover:opacity-85 cursor-pointer"
            title={`${item.assetClass}: ${item.percentage.toFixed(1)}%`}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
          />
        ))}
      </div>

      {/* Grid of asset classes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {data.map((item, idx) => {
          const isHovered = hoveredIdx === idx;
          return (
            <div
              key={item.assetClass}
              className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                isHovered
                  ? 'border-blue-500 bg-blue-50/50 shadow-xs'
                  : 'border-slate-100 bg-slate-50/70 hover:bg-slate-100/70'
              }`}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs font-semibold text-slate-700 truncate">
                  {item.assetClass}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold text-slate-900">
                  {formatCurrency(item.total)}
                </span>
                <span className="text-[11px] font-medium text-slate-500">
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
