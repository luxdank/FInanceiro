import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, ArrowDownRight, Wallet, Eye, EyeOff } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export interface MonthEvolutionItem {
  month: string;
  monthLabel: string;
  income: number;
  expense: number;
  accumulatedBalance: number;
  netSavings: number;
}

interface BalanceExpenseEvolutionChartProps {
  data: MonthEvolutionItem[];
  className?: string;
}

type SeriesVisibility = 'all' | 'balance_only' | 'expense_only';

export const BalanceExpenseEvolutionChart: React.FC<BalanceExpenseEvolutionChartProps> = ({
  data,
  className = '',
}) => {
  const [filterMode, setFilterMode] = useState<SeriesVisibility>('all');

  // Summary KPIs for the 6 months
  const kpis = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        currentBalance: 0,
        balanceChangePercent: 0,
        averageExpense: 0,
        highestExpenseMonth: null as MonthEvolutionItem | null,
      };
    }

    const currentBalance = data[data.length - 1]?.accumulatedBalance ?? 0;
    const initialBalance = data[0]?.accumulatedBalance ?? 0;
    const balanceDiff = currentBalance - initialBalance;
    const balanceChangePercent =
      initialBalance !== 0
        ? (balanceDiff / Math.abs(initialBalance)) * 100
        : currentBalance > 0
        ? 100
        : 0;

    const totalExpenses = data.reduce((sum, item) => sum + item.expense, 0);
    const averageExpense = totalExpenses / data.length;

    let highestExpenseMonth = data[0];
    for (const item of data) {
      if (item.expense > (highestExpenseMonth?.expense ?? 0)) {
        highestExpenseMonth = item;
      }
    }

    return {
      currentBalance,
      balanceChangePercent,
      averageExpense,
      highestExpenseMonth,
    };
  }, [data]);

  // Format Y-axis tick values concisely
  const formatYAxisTick = (val: number) => {
    if (Math.abs(val) >= 1000000) {
      return `R$ ${(val / 1000000).toFixed(1)}M`;
    }
    if (Math.abs(val) >= 1000) {
      return `R$ ${(val / 1000).toFixed(0)}k`;
    }
    return `R$ ${val}`;
  };

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const pointData = payload[0]?.payload as MonthEvolutionItem;
      const netSavings = pointData?.netSavings ?? 0;

      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white border border-slate-800 rounded-xl p-3.5 shadow-xl text-xs min-w-[210px] pointer-events-none">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2.5">
            <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              {label}
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                netSavings >= 0
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/20 text-rose-300'
              }`}
            >
              {netSavings >= 0 ? 'Superávit' : 'Déficit'}
            </span>
          </div>

          <div className="space-y-2">
            {(filterMode === 'all' || filterMode === 'balance_only') && (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-blue-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-xs" />
                  <span className="font-medium">Saldo Acumulado:</span>
                </div>
                <span className="font-bold text-white text-right">
                  {formatCurrency(pointData?.accumulatedBalance ?? 0)}
                </span>
              </div>
            )}

            {(filterMode === 'all' || filterMode === 'expense_only') && (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-rose-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs" />
                  <span className="font-medium">Despesas do Mês:</span>
                </div>
                <span className="font-bold text-white text-right">
                  {formatCurrency(pointData?.expense ?? 0)}
                </span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Resultado do mês:</span>
              <span
                className={`font-semibold ${
                  netSavings >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {netSavings >= 0 ? '+' : ''}
                {formatCurrency(netSavings)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const showBalance = filterMode === 'all' || filterMode === 'balance_only';
  const showExpense = filterMode === 'all' || filterMode === 'expense_only';

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between ${className}`}
    >
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Evolução: Saldo Acumulado x Despesas
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Histórico interativo dos últimos 6 meses com Recharts
          </p>
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200/60">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              filterMode === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ambos
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('balance_only')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              filterMode === 'balance_only'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-blue-700'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                filterMode === 'balance_only' ? 'bg-white' : 'bg-blue-500'
              }`}
            />
            Saldo
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('expense_only')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              filterMode === 'expense_only'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-rose-700'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                filterMode === 'expense_only' ? 'bg-white' : 'bg-rose-500'
              }`}
            />
            Despesas
          </button>
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-5 p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 text-xs">
        <div>
          <span className="text-slate-500 block text-[11px] font-medium">Saldo Atual</span>
          <span className="text-sm sm:text-base font-bold text-slate-900 block truncate">
            {formatCurrency(kpis.currentBalance)}
          </span>
          <span
            className={`text-[10px] font-semibold flex items-center gap-0.5 ${
              kpis.balanceChangePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {kpis.balanceChangePercent >= 0 ? '▲ +' : '▼ '}
            {kpis.balanceChangePercent.toFixed(1)}% no período
          </span>
        </div>

        <div>
          <span className="text-slate-500 block text-[11px] font-medium">Média de Despesas</span>
          <span className="text-sm sm:text-base font-bold text-slate-900 block truncate">
            {formatCurrency(kpis.averageExpense)}
          </span>
          <span className="text-[10px] text-slate-400">por mês (últimos 6 meses)</span>
        </div>

        <div className="col-span-2 sm:col-span-1">
          <span className="text-slate-500 block text-[11px] font-medium">Pico de Despesas</span>
          <span className="text-sm sm:text-base font-bold text-rose-600 block truncate">
            {kpis.highestExpenseMonth
              ? `${kpis.highestExpenseMonth.monthLabel} (${formatCurrency(
                  kpis.highestExpenseMonth.expense
                )})`
              : 'R$ 0,00'}
          </span>
          <span className="text-[10px] text-slate-400">mês com maior consumo</span>
        </div>
      </div>

      {/* Recharts Chart Area */}
      <div className="w-full h-72 sm:h-80 -ml-1 sm:ml-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 12, right: 16, left: 0, bottom: 6 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="monthLabel"
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
              dy={6}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              tickFormatter={formatYAxisTick}
              width={56}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#cbd5e1" strokeDasharray="3 3" />

            {/* Saldo Acumulado Line */}
            {showBalance && (
              <Line
                type="monotone"
                dataKey="accumulatedBalance"
                name="Saldo Acumulado"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{
                  r: 4.5,
                  fill: '#3b82f6',
                  stroke: '#ffffff',
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 7,
                  fill: '#2563eb',
                  stroke: '#ffffff',
                  strokeWidth: 3,
                }}
              />
            )}

            {/* Despesas do Mês Line */}
            {showExpense && (
              <Line
                type="monotone"
                dataKey="expense"
                name="Despesas"
                stroke="#f43f5e"
                strokeWidth={3}
                dot={{
                  r: 4.5,
                  fill: '#f43f5e',
                  stroke: '#ffffff',
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 7,
                  fill: '#e11d48',
                  stroke: '#ffffff',
                  strokeWidth: 3,
                }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Footer */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded-full bg-blue-500 inline-block" />
            <span className="font-semibold text-slate-700">Saldo Acumulado</span>
            <span className="text-[10px] text-slate-400">(Disponível)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded-full bg-rose-500 inline-block" />
            <span className="font-semibold text-slate-700">Despesas</span>
            <span className="text-[10px] text-slate-400">(Mensal)</span>
          </div>
        </div>
        <span className="text-[11px] text-slate-400 italic">
          Toque ou passe o mouse nos pontos para detalhar
        </span>
      </div>
    </div>
  );
};
