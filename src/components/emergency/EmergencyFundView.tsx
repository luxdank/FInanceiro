import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Sliders,
  Calendar,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { EmergencyEvolutionChart } from '../charts/EmergencyEvolutionChart';

interface EmergencyFundViewProps {
  onOpenDepositModal: () => void;
  onOpenWithdrawModal: () => void;
}

export const EmergencyFundView: React.FC<EmergencyFundViewProps> = ({
  onOpenDepositModal,
  onOpenWithdrawModal,
}) => {
  const {
    emergencyConfig,
    emergencyHistory,
    updateEmergencyConfig,
    monthlyChartData,
    summary,
  } = useFinance();

  const [isEditingConfig, setIsEditingConfig] = useState(false);
  const [targetMonths, setTargetMonths] = useState(emergencyConfig.targetMonths);
  const [monthlyExpenseRef, setMonthlyExpenseRef] = useState(emergencyConfig.monthlyExpenseReference);
  const [customTarget, setCustomTarget] = useState(emergencyConfig.customTargetAmount || 0);

  const calculatedTarget = targetMonths * monthlyExpenseRef;
  const activeTarget = customTarget > 0 ? customTarget : calculatedTarget;
  const currentBalance = emergencyConfig.currentBalance;
  const remaining = Math.max(0, activeTarget - currentBalance);
  const progressPercent = Math.min(100, activeTarget > 0 ? (currentBalance / activeTarget) * 100 : 0);
  const monthsCovered = monthlyExpenseRef > 0 ? currentBalance / monthlyExpenseRef : 0;

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmergencyConfig({
      targetMonths: Number(targetMonths),
      monthlyExpenseReference: Number(monthlyExpenseRef),
      customTargetAmount: customTarget > 0 ? Number(customTarget) : undefined,
    });
    setIsEditingConfig(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg shadow-teal-700/15 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
            <ShieldCheck className="w-7 h-7 text-teal-200" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-200">
              Segurança Financeira
            </span>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              Reserva de Emergência
            </h2>
            <p className="text-xs md:text-sm text-teal-100 max-w-xl mt-0.5">
              Sua proteção contra imprevistos sem precisar resgatar investimentos ou contrair dívidas.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setIsEditingConfig(!isEditingConfig)}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-white/20"
          >
            <Sliders className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Configurar Meta</span>
          </button>
          <button
            onClick={onOpenWithdrawModal}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-rose-500/80 hover:bg-rose-500 text-white text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
          >
            <ArrowDownLeft className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Registrar Retirada</span>
          </button>
          <button
            onClick={onOpenDepositModal}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white text-teal-800 hover:bg-teal-50 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5] shrink-0" />
            <span>+ Adicionar Aporte</span>
          </button>
        </div>
      </div>

      {/* Edit Config Modal / Collapse */}
      {isEditingConfig && (
        <form
          onSubmit={handleSaveConfig}
          className="bg-white rounded-2xl border border-teal-200 p-5 shadow-md space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="font-bold text-sm text-slate-800">
              Personalizar Parâmetros da Reserva
            </h4>
            <span className="text-xs text-slate-400">
              Fórmula: Meses desejados × Despesa média mensal
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Meses de Cobertura Desejados
              </label>
              <input
                type="number"
                min="1"
                max="24"
                value={targetMonths}
                onChange={(e) => setTargetMonths(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-semibold"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Geralmente recomendado: 6 meses para CLT ou 12 meses para autônomos.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Despesa Média Mensal (R$)
              </label>
              <input
                type="number"
                step="50"
                min="100"
                value={monthlyExpenseRef}
                onChange={(e) => setMonthlyExpenseRef(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-semibold"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Custo de vida essencial doméstico mensal.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Meta Fixa Manual (Opcional)
              </label>
              <input
                type="number"
                step="100"
                placeholder="Deixar 0 para calcular automático"
                value={customTarget || ''}
                onChange={(e) => setCustomTarget(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Se preenchido, substitui a multiplicação.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditingConfig(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs"
            >
              Salvar Parâmetros
            </button>
          </div>
        </form>
      )}

      {/* 4 Main Emergency Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Valor Atual */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Valor Guardado
          </span>
          <div className="text-lg sm:text-2xl font-extrabold text-teal-700 truncate">
            {formatCurrency(currentBalance)}
          </div>
          <span className="text-[10px] sm:text-xs text-slate-500 mt-1 block truncate">
            Liquidez imediata
          </span>
        </div>

        {/* Meta da Reserva */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Meta Total
          </span>
          <div className="text-lg sm:text-2xl font-extrabold text-slate-900 truncate">
            {formatCurrency(activeTarget)}
          </div>
          <span className="text-[10px] sm:text-xs text-slate-500 mt-1 block truncate">
            {emergencyConfig.targetMonths} meses planejados
          </span>
        </div>

        {/* Progresso Concluído */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Concluído
          </span>
          <div className="text-lg sm:text-2xl font-extrabold text-blue-600">
            {progressPercent.toFixed(1)}%
          </div>
          <span className="text-[10px] sm:text-xs text-slate-500 mt-1 block truncate">
            {remaining > 0 ? `Faltam ${formatCurrency(remaining)}` : 'Meta 100% atingida!'}
          </span>
        </div>

        {/* Meses Cobertos */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Cobertura Atual
          </span>
          <div className="text-lg sm:text-2xl font-extrabold text-indigo-700">
            {monthsCovered.toFixed(1)} meses
          </div>
          <span className="text-[10px] sm:text-xs text-slate-500 mt-1 block truncate">
            De custo essencial
          </span>
        </div>
      </div>

      {/* Visual Progress Bar with Milestones */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Progresso Visual da Meta de Emergência
            </h3>
            <p className="text-xs text-slate-500">
              {progressPercent >= 100
                ? 'Parabéns! Sua reserva está completa e sua base de tranquilidade está construída.'
                : `Você completou ${progressPercent.toFixed(1)}% do caminho. Faltam ${formatCurrency(remaining)}.`}
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 self-start sm:self-auto border border-teal-200">
            {progressPercent.toFixed(0)}% Concluído
          </span>
        </div>

        {/* Progress Track */}
        <div className="relative pt-2">
          <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-500 to-blue-600 transition-all duration-500 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Milestones Markers */}
          <div className="flex justify-between text-[10px] font-semibold text-slate-400 mt-2 px-1">
            <span>0%</span>
            <span>25% ({formatCurrency(activeTarget * 0.25)})</span>
            <span>50% ({formatCurrency(activeTarget * 0.5)})</span>
            <span>75% ({formatCurrency(activeTarget * 0.75)})</span>
            <span className="text-teal-700 font-bold">100% ({formatCurrency(activeTarget)})</span>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-900">
            Evolução Histórica da Reserva
          </h3>
          <p className="text-xs text-slate-500">
            Histórico mensal de crescimento comparado à linha de meta de segurança
          </p>
        </div>
        <EmergencyEvolutionChart
          data={monthlyChartData}
          targetAmount={activeTarget}
        />
      </div>

      {/* History of Deposits & Withdrawals */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Histórico de Movimentações da Reserva
            </h3>
            <p className="text-xs text-slate-500">
              Registro completo de aportes e retiradas emergenciais
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {emergencyHistory.length} lançamentos
          </span>
        </div>

        <div className="overflow-x-auto">
          {emergencyHistory.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Nenhuma movimentação registrada na reserva até o momento.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3">Data</th>
                  <th className="py-3 px-3">Tipo</th>
                  <th className="py-3 px-3">Descrição / Motivo</th>
                  <th className="py-3 px-3 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {emergencyHistory.map((item) => {
                  const isDeposit = item.type === 'deposit';
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                        {formatDate(item.date)}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-bold text-[10px] ${
                            isDeposit
                              ? 'bg-teal-50 text-teal-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {isDeposit ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownLeft className="w-3 h-3" />
                          )}
                          {isDeposit ? 'Aporte' : 'Retirada'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-medium">
                        {item.notes || (isDeposit ? 'Aporte na Reserva' : 'Retirada de Emergência')}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap font-bold">
                        <span className={isDeposit ? 'text-teal-700' : 'text-rose-600'}>
                          {isDeposit ? '+' : '-'}
                          {formatCurrency(item.amount)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
