import React from 'react';
import {
  Landmark,
  Wallet,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  PieChart,
  CheckCircle2,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { NetWorthLineChart } from '../charts/NetWorthLineChart';

export const NetWorthView: React.FC = () => {
  const { summary, monthlyChartData, accounts, investments, creditCards } = useFinance();

  const totalAssets =
    summary.availableBalance + summary.emergencyFundBalance + summary.investmentsCurrentValue;
  const totalLiabilities = summary.creditCardsDebt;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-800 via-indigo-700 to-blue-800 rounded-2xl p-6 text-white shadow-lg shadow-indigo-900/15 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-200">
            Balanço Patrimonial Consolidado
          </span>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight mt-0.5">
            Evolução do Patrimônio Líquido
          </h2>
          <p className="text-xs md:text-sm text-indigo-100 max-w-xl mt-1">
            Fórmula: Dinheiro Disponível + Reserva de Emergência + Investimentos - Dívidas e Faturas.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shrink-0 text-right">
          <span className="text-[11px] font-medium text-indigo-200 uppercase block">
            Patrimônio Líquido Atual
          </span>
          <span className="text-2xl md:text-3xl font-extrabold text-white">
            {formatCurrency(summary.netWorth)}
          </span>
          <div className="flex items-center justify-end gap-1 text-xs text-emerald-300 font-bold mt-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{formatPercentage(summary.netWorthChangePercent, true)} este mês</span>
          </div>
        </div>
      </div>

      {/* Formula breakdown cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Disponível */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">1. Disponível</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            {formatCurrency(summary.availableBalance)}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            Contas bancárias e carteira
          </span>
        </div>

        {/* 2. Reserva de Emergência */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">2. Reserva</span>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-teal-700">
            {formatCurrency(summary.emergencyFundBalance)}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            Liquidez imediata para proteção
          </span>
        </div>

        {/* 3. Investimentos */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">3. Investimentos</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-purple-700">
            {formatCurrency(summary.investmentsCurrentValue)}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            Renda fixa, ações, FIIs e cripto
          </span>
        </div>

        {/* 4. Dívidas / Faturas */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">4. Dívidas (Subtrai)</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-rose-600">
            -{formatCurrency(summary.creditCardsDebt)}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            Faturas em aberto de cartões
          </span>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-900">
            Trajetória Histórica do Patrimônio
          </h3>
          <p className="text-xs text-slate-500">
            Evolução consolidada mês a mês mostrando crescimento sustentável
          </p>
        </div>
        <NetWorthLineChart data={monthlyChartData} />
      </div>

      {/* Assets vs Liabilities Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ativos */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h3 className="text-sm font-bold text-slate-900">Ativos Totais</h3>
            </div>
            <span className="text-base font-extrabold text-emerald-600">
              {formatCurrency(totalAssets)}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block">Saldos Bancários</span>
                <span className="text-slate-400">{accounts.length} contas cadastradas</span>
              </div>
              <span className="font-extrabold text-slate-800">
                {formatCurrency(summary.availableBalance)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block">Reserva de Emergência</span>
                <span className="text-slate-400">
                  {summary.emergencyMonthsCovered.toFixed(1)} meses de despesas
                </span>
              </div>
              <span className="font-extrabold text-teal-700">
                {formatCurrency(summary.emergencyFundBalance)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block">Carteira de Investimentos</span>
                <span className="text-slate-400">{investments.length} ativos em custódia</span>
              </div>
              <span className="font-extrabold text-purple-700">
                {formatCurrency(summary.investmentsCurrentValue)}
              </span>
            </div>
          </div>
        </div>

        {/* Passivos & Dívidas */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <h3 className="text-sm font-bold text-slate-900">Passivos e Obrigações</h3>
            </div>
            <span className="text-base font-extrabold text-rose-600">
              {formatCurrency(totalLiabilities)}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {creditCards.map((card) => (
              <div
                key={card.id}
                className="p-3 rounded-xl bg-slate-50 flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-slate-800 block">{card.name}</span>
                  <span className="text-slate-400">
                    Vence dia {card.dueDay} (Limite: {formatCurrency(card.limit)})
                  </span>
                </div>
                <span className="font-extrabold text-rose-600">
                  {formatCurrency(card.currentInvoice)}
                </span>
              </div>
            ))}

            {creditCards.length === 0 && (
              <div className="py-6 text-center text-slate-400">
                Nenhuma fatura de cartão em aberto.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
