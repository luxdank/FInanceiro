import React, { useState } from 'react';
import {
  TrendingUp,
  Plus,
  RefreshCw,
  Trash2,
  Edit2,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Building,
  Calendar,
  Layers,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Investment, AssetClass } from '../../types/finance';
import { formatCurrency, formatPercentage, formatDate } from '../../utils/formatters';
import { InvestmentAssetChart } from '../charts/InvestmentAssetChart';
import { InvestmentModal } from './InvestmentModal';

export const InvestmentsView: React.FC = () => {
  const {
    investments,
    investmentsByClass,
    summary,
    updateInvestmentValue,
    deleteInvestment,
    depositInvestment,
    withdrawInvestment,
    transactions,
    selectedMonth,
  } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInv, setEditingInv] = useState<Investment | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [quickUpdateId, setQuickUpdateId] = useState<string | null>(null);
  const [quickUpdateValue, setQuickUpdateValue] = useState<string>('');
  const [quickActionId, setQuickActionId] = useState<string | null>(null);
  const [quickActionType, setQuickActionType] = useState<'deposit' | 'withdraw'>('deposit');
  const [quickActionAmount, setQuickActionAmount] = useState<string>('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Aportes no mês corrente
  const monthInvestmentDeposits = transactions
    .filter((t) => t.date.startsWith(selectedMonth) && t.type === 'investment_deposit')
    .reduce((s, t) => s + t.amount, 0);

  const filteredInvestments = investments.filter((inv) =>
    selectedClass === 'all' ? true : inv.assetClass === selectedClass
  );

  const handleOpenEdit = (inv: Investment) => {
    setEditingInv(inv);
    setIsModalOpen(true);
  };

  const handleOpenNew = () => {
    setEditingInv(null);
    setIsModalOpen(true);
  };

  const handleSaveQuickUpdate = (id: string) => {
    const val = parseFloat(quickUpdateValue.replace(',', '.'));
    if (!isNaN(val) && val >= 0) {
      updateInvestmentValue(id, val);
    }
    setQuickUpdateId(null);
  };

  const handleExecuteQuickAction = (id: string) => {
    const val = parseFloat(quickActionAmount.replace(',', '.'));
    if (!isNaN(val) && val > 0) {
      if (quickActionType === 'deposit') {
        depositInvestment(id, val);
      } else {
        withdrawInvestment(id, val);
      }
    }
    setQuickActionId(null);
    setQuickActionAmount('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Carteira de Investimentos
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Acompanhe seus ativos de renda fixa, fundos imobiliários, ações e criptomoedas.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Novo Ativo</span>
        </button>
      </div>

      {/* Top 4 Indicator Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Investido */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Investido (Custo)
          </span>
          <div className="text-2xl font-extrabold text-slate-800">
            {formatCurrency(summary.investedTotal)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            Capital inicial aportado
          </span>
        </div>

        {/* Valor Atual */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Valor Atual Total
          </span>
          <div className="text-2xl font-extrabold text-blue-600">
            {formatCurrency(summary.investmentsCurrentValue)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            Saldo de mercado consolidado
          </span>
        </div>

        {/* Rentabilidade Total */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Rentabilidade Bruta
          </span>
          <div
            className={`text-2xl font-extrabold ${
              summary.investmentsGainAmount >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {summary.investmentsGainAmount >= 0 ? '+' : ''}
            {formatCurrency(summary.investmentsGainAmount)}
          </div>
          <span
            className={`text-xs font-semibold mt-1 block ${
              summary.investmentsGainPercent >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {formatPercentage(summary.investmentsGainPercent, true)} sobre o valor aportado
          </span>
        </div>

        {/* Aportes no Mês */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Aportes no Mês
          </span>
          <div className="text-2xl font-extrabold text-purple-600">
            {formatCurrency(monthInvestmentDeposits)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            Direcionados a novos investimentos
          </span>
        </div>
      </div>

      {/* Asset Allocation Chart Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Distribuição da Carteira por Classe
            </h3>
            <p className="text-xs text-slate-500">
              Diversificação por categorias de risco e rendimento
            </p>
          </div>
        </div>
        <InvestmentAssetChart data={investmentsByClass} />
      </div>

      {/* Assets List / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Meus Ativos</h3>
            <p className="text-xs text-slate-500">
              {investments.length} ativos cadastrados. Você pode atualizar o valor atual a qualquer momento.
            </p>
          </div>

          {/* Filter by Asset Class */}
          <div className="w-full sm:w-56">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
            >
              <option value="all">Todas as Classes</option>
              {investmentsByClass.map((c) => (
                <option key={c.assetClass} value={c.assetClass}>
                  {c.assetClass} ({c.percentage.toFixed(0)}%)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* List of Investments */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredInvestments.map((inv) => {
            const gain = inv.currentValue - inv.investedAmount;
            const gainPct = inv.investedAmount > 0 ? (gain / inv.investedAmount) * 100 : 0;
            const isEditingValue = quickUpdateId === inv.id;
            const isActionModal = quickActionId === inv.id;

            return (
              <div
                key={inv.id}
                className="border border-slate-200/90 rounded-xl p-4 bg-slate-50/50 hover:bg-white hover:border-blue-200 transition-all shadow-2xs space-y-3"
              >
                {/* Header of Card */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{inv.name}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {inv.assetClass}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Building className="w-3 h-3" />
                        {inv.institution}
                      </span>
                      <span>•</span>
                      <span>Aporte: {formatDate(inv.startDate)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(inv)}
                      className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirmDeleteId === inv.id) {
                          deleteInvestment(inv.id);
                          setConfirmDeleteId(null);
                        } else {
                          setConfirmDeleteId(inv.id);
                          setTimeout(() => setConfirmDeleteId(null), 3000);
                        }
                      }}
                      className={`p-1 rounded transition-colors ${
                        confirmDeleteId === inv.id
                          ? 'bg-rose-600 text-white font-bold text-[10px] px-1.5'
                          : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                      title="Excluir"
                    >
                      {confirmDeleteId === inv.id ? 'Excluir?' : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Values Comparison */}
                <div className="grid grid-cols-2 gap-2 bg-white rounded-lg p-2.5 border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Investido
                    </span>
                    <span className="font-bold text-slate-700">
                      {formatCurrency(inv.investedAmount)}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                      Valor Atual
                    </span>
                    {isEditingValue ? (
                      <div className="flex items-center gap-1 mt-0.5">
                        <input
                          type="number"
                          step="0.01"
                          autoFocus
                          value={quickUpdateValue}
                          onChange={(e) => setQuickUpdateValue(e.target.value)}
                          className="w-24 px-1.5 py-0.5 border border-blue-400 rounded text-xs font-bold"
                        />
                        <button
                          onClick={() => handleSaveQuickUpdate(inv.id)}
                          className="px-1.5 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold"
                        >
                          OK
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-blue-600">
                          {formatCurrency(inv.currentValue)}
                        </span>
                        <button
                          onClick={() => {
                            setQuickUpdateId(inv.id);
                            setQuickUpdateValue(String(inv.currentValue));
                          }}
                          className="text-slate-400 hover:text-blue-600"
                          title="Atualizar valor atual"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rentabilidade & Footer */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`font-semibold flex items-center ${
                        gain >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {gain >= 0 ? '+' : ''}
                      {formatCurrency(gain)} ({formatPercentage(gainPct, true)})
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setQuickActionId(inv.id);
                        setQuickActionType('deposit');
                        setQuickActionAmount('');
                      }}
                      className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md font-semibold text-[11px] transition-colors"
                    >
                      + Aporte
                    </button>
                    <button
                      onClick={() => {
                        setQuickActionId(inv.id);
                        setQuickActionType('withdraw');
                        setQuickActionAmount('');
                      }}
                      className="px-2 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md font-semibold text-[11px] transition-colors"
                    >
                      Resgatar
                    </button>
                  </div>
                </div>

                {/* Quick Action Input inside card */}
                {isActionModal && (
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2 animate-in fade-in">
                    <span className="text-[11px] font-bold text-slate-600">
                      {quickActionType === 'deposit' ? 'Aporte (R$):' : 'Resgate (R$):'}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      autoFocus
                      placeholder="0,00"
                      value={quickActionAmount}
                      onChange={(e) => setQuickActionAmount(e.target.value)}
                      className="w-28 px-2 py-1 text-xs border border-blue-400 rounded font-bold"
                    />
                    <button
                      onClick={() => handleExecuteQuickAction(inv.id)}
                      className="px-2.5 py-1 bg-blue-600 text-white rounded text-xs font-bold"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => setQuickActionId(null)}
                      className="px-1.5 py-1 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <InvestmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingInvestment={editingInv}
      />
    </div>
  );
};
