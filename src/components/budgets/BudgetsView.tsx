import React, { useState } from 'react';
import {
  PieChart,
  Edit2,
  AlertTriangle,
  CheckCircle2,
  Plus,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

export const BudgetsView: React.FC = () => {
  const {
    categories,
    budgets,
    setBudgetLimit,
    categoryExpenses,
    summary,
  } = useFinance();

  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [newLimitValue, setNewLimitValue] = useState<string>('');
  const [newCatSelectId, setNewCatSelectId] = useState<string>('');

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  // Compute total budgeted and total spent in budgeted categories
  const totalBudgeted = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
  const totalSpentInBudgeted = budgets.reduce((sum, b) => {
    const catExp = categoryExpenses.find((c) => c.categoryId === b.categoryId);
    return sum + (catExp ? catExp.total : 0);
  }, 0);

  const overallUsagePct = totalBudgeted > 0 ? (totalSpentInBudgeted / totalBudgeted) * 100 : 0;

  const handleStartEdit = (catId: string, currentLimit: number) => {
    setEditingCatId(catId);
    setNewLimitValue(String(currentLimit));
  };

  const handleSaveEdit = (catId: string) => {
    const val = parseFloat(newLimitValue.replace(',', '.'));
    if (!isNaN(val) && val >= 0) {
      setBudgetLimit(catId, val);
    }
    setEditingCatId(null);
  };

  const handleAddNewBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatSelectId) return;
    const val = parseFloat(newLimitValue.replace(',', '.'));
    if (!isNaN(val) && val > 0) {
      setBudgetLimit(newCatSelectId, val);
      setNewCatSelectId('');
      setNewLimitValue('');
    }
  };

  // Categories not yet budgeted
  const unbudgetedCategories = expenseCategories.filter(
    (c) => !budgets.some((b) => b.categoryId === c.id)
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Orçamento Mensal por Categoria
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Defina limites de gastos para manter suas despesas sob controle e evitar surpresas no fim do mês.
        </p>
      </div>

      {/* Global Budget Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Consumo Geral do Orçamento
            </span>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
              Você já utilizou{' '}
              <span
                className={
                  overallUsagePct > 100
                    ? 'text-rose-600 font-black'
                    : overallUsagePct > 80
                    ? 'text-amber-600 font-black'
                    : 'text-emerald-600 font-black'
                }
              >
                {overallUsagePct.toFixed(1)}%
              </span>{' '}
              do seu teto mensal.
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Gasto total de {formatCurrency(totalSpentInBudgeted)} do limite estipulado de{' '}
              {formatCurrency(totalBudgeted)}.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block font-medium">Disponível no Teto</span>
              <span
                className={`text-lg font-bold ${
                  totalBudgeted - totalSpentInBudgeted >= 0 ? 'text-blue-600' : 'text-rose-600'
                }`}
              >
                {formatCurrency(Math.max(0, totalBudgeted - totalSpentInBudgeted))}
              </span>
            </div>
          </div>
        </div>

        {/* Big Overall Bar */}
        <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              overallUsagePct > 100
                ? 'bg-rose-500'
                : overallUsagePct > 80
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, overallUsagePct)}%` }}
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Dentro do orçamento (&lt; 75%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Próximo do limite (75% - 100%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Acima do limite (&gt; 100%)</span>
          </div>
        </div>
      </div>

      {/* Categories Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.map((bgt) => {
          const cat = categories.find((c) => c.id === bgt.categoryId);
          const catExp = categoryExpenses.find((c) => c.categoryId === bgt.categoryId);
          const spent = catExp ? catExp.total : 0;
          const limit = bgt.monthlyLimit;
          const usagePct = limit > 0 ? (spent / limit) * 100 : 0;
          const isOver = spent > limit;
          const isNear = spent >= limit * 0.75 && spent <= limit;
          const isEditing = editingCatId === bgt.categoryId;

          return (
            <div
              key={bgt.id}
              className={`bg-white rounded-xl border p-5 shadow-2xs space-y-3 transition-all ${
                isOver
                  ? 'border-rose-300 ring-1 ring-rose-200'
                  : isNear
                  ? 'border-amber-300'
                  : 'border-slate-200/80 hover:border-blue-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: cat ? cat.color : '#94a3b8' }}
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{cat ? cat.name : 'Categoria'}</h4>
                    <span className="text-[11px] text-slate-400">
                      Gasto: {formatCurrency(spent)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      isOver
                        ? 'bg-rose-50 text-rose-700'
                        : isNear
                        ? 'bg-amber-50 text-amber-800'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {isOver ? 'Acima do Limite' : isNear ? 'Próximo do Limite' : 'Dentro do Orçamento'}
                  </span>

                  <button
                    onClick={() => handleStartEdit(bgt.categoryId, limit)}
                    className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100"
                    title="Editar limite"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isOver ? 'bg-rose-500' : isNear ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, usagePct)}%` }}
                />
              </div>

              {/* Footer info & Edit input */}
              {isEditing ? (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs font-semibold text-slate-600">Novo Teto: R$</span>
                  <input
                    type="number"
                    step="50"
                    autoFocus
                    value={newLimitValue}
                    onChange={(e) => setNewLimitValue(e.target.value)}
                    className="w-28 px-2 py-1 text-xs border border-blue-400 rounded font-bold"
                  />
                  <button
                    onClick={() => handleSaveEdit(bgt.categoryId)}
                    className="px-2.5 py-1 bg-blue-600 text-white rounded text-xs font-bold"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => setEditingCatId(null)}
                    className="px-1.5 py-1 text-slate-400 text-xs"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="font-semibold text-slate-500">
                    Limite: <strong className="text-slate-800">{formatCurrency(limit)}</strong>
                  </span>
                  <span
                    className={`font-bold ${
                      isOver ? 'text-rose-600' : isNear ? 'text-amber-700' : 'text-slate-600'
                    }`}
                  >
                    {usagePct.toFixed(0)}% utilizado
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add New Category Budget */}
      {unbudgetedCategories.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3">
          <h4 className="font-bold text-sm text-slate-900">
            Adicionar Limite para Outra Categoria
          </h4>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <select
              value={newCatSelectId}
              onChange={(e) => setNewCatSelectId(e.target.value)}
              className="w-full sm:w-64 px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none"
            >
              <option value="">Selecione uma categoria...</option>
              {unbudgetedCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Limite mensal (R$)"
              value={newLimitValue}
              onChange={(e) => setNewLimitValue(e.target.value)}
              className="w-full sm:w-48 px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none"
            />

            <button
              onClick={handleAddNewBudget}
              disabled={!newCatSelectId}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              Adicionar Teto
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
