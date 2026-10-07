import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

interface StatCardProps {
  title: string;
  value: number;
  prevValue?: number;
  changePercent?: number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  type?: 'neutral' | 'positive_good' | 'negative_good';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  prevValue,
  changePercent,
  subtitle,
  icon,
  iconBgColor = 'bg-blue-50 text-blue-600',
  type = 'positive_good',
  onClick,
}) => {
  const hasComparison = changePercent !== undefined && !isNaN(changePercent);

  let isPositiveTrend = false;
  let isNegativeTrend = false;

  if (hasComparison) {
    if (type === 'negative_good') {
      isPositiveTrend = changePercent < 0;
      isNegativeTrend = changePercent > 0;
    } else {
      isPositiveTrend = changePercent > 0;
      isNegativeTrend = changePercent < 0;
    }
  }

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-5 shadow-xs transition-all duration-200 hover:shadow-md hover:border-blue-200 active:scale-[0.99] flex flex-col justify-between min-h-[115px] sm:min-h-[135px] ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
        <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
          {title}
        </span>
        <div className={`p-1.5 sm:p-2.5 rounded-xl shrink-0 ${iconBgColor}`}>
          {icon}
        </div>
      </div>

      <div className="space-y-0.5 sm:space-y-1">
        <div className="text-base sm:text-xl lg:text-2xl font-extrabold tracking-tight text-slate-900 truncate">
          {formatCurrency(value)}
        </div>

        {hasComparison ? (
          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 pt-0.5 text-[10px] sm:text-xs">
            <span
              className={`inline-flex items-center gap-0.5 px-1 sm:px-1.5 py-0.2 rounded-md font-semibold text-[9px] sm:text-[11px] ${
                isPositiveTrend
                  ? 'bg-emerald-50 text-emerald-700'
                  : isNegativeTrend
                  ? 'bg-rose-50 text-rose-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {changePercent > 0 ? (
                <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              ) : changePercent < 0 ? (
                <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              ) : (
                <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              )}
              {formatPercentage(Math.abs(changePercent))}
            </span>

            <span className="text-slate-400 truncate text-[9px] sm:text-xs">
              vs. ant.
            </span>
          </div>
        ) : subtitle ? (
          <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate pt-0.5">
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
};
