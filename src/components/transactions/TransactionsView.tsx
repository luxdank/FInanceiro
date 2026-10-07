import React, { useState, useMemo } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Plus,
  Trash2,
  Edit2,
  Repeat,
  Tag,
  CreditCard as CreditCardIcon,
  Wallet,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, TransactionType } from '../../types/finance';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface TransactionsViewProps {
  onOpenNewTransaction: (type?: TransactionType) => void;
  onEditTransaction: (tx: Transaction) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  onOpenNewTransaction,
  onEditTransaction,
}) => {
  const {
    transactions,
    categories,
    accounts,
    creditCards,
    deleteTransaction,
    addTransaction,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'all' | 'expense' | 'income' | 'recurring'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedExpenseType, setSelectedExpenseType] = useState<'all' | 'fixed' | 'variable'>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered list
  const filteredList = useMemo(() => {
    return transactions.filter((tx) => {
      // Tab filter
      if (activeTab === 'expense' && tx.type !== 'expense') return false;
      if (activeTab === 'income' && tx.type !== 'income') return false;
      if (activeTab === 'recurring' && !tx.isRecurring) return false;

      // Search term
      if (
        searchTerm &&
        !tx.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !tx.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Category
      if (selectedCategory !== 'all' && tx.categoryId !== selectedCategory) {
        return false;
      }

      // Fixed / Variable filter
      if (selectedExpenseType !== 'all') {
        if (tx.type === 'expense' && tx.expenseType !== selectedExpenseType) return false;
      }

      return true;
    });
  }, [transactions, activeTab, searchTerm, selectedCategory, selectedExpenseType]);

  // Aggregate stats for current view
  const totalIncomes = filteredList
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);

  const totalExpenses = filteredList
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);

  // Auto-project recurring expenses for next month
  const recurringExpenses = transactions.filter((t) => t.type === 'expense' && t.isRecurring);

  const handleDuplicateRecurringForNextMonth = () => {
    if (recurringExpenses.length === 0) return;
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextMonthYearStr = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`;

    let generatedCount = 0;
    recurringExpenses.forEach((item) => {
      const day = item.date.split('-')[2] || '05';
      const newDate = `${nextMonthYearStr}-${day}`;
      // check if not already created
      const exists = transactions.some((t) => t.date === newDate && t.description === item.description);
      if (!exists) {
        addTransaction({
          description: item.description,
          amount: item.amount,
          type: item.type,
          categoryId: item.categoryId,
          date: newDate,
          paymentMethod: item.paymentMethod,
          accountId: item.accountId,
          creditCardId: item.creditCardId,
          expenseType: item.expenseType,
          isRecurring: true,
          recurrence: item.recurrence,
          notes: `${item.notes || ''} (Recorrência gerada automaticamente)`,
        });
        generatedCount++;
      }
    });

    showToast(
      generatedCount > 0
        ? `Lançamentos recorrentes (${generatedCount}) projetados com sucesso para o próximo mês!`
        : 'Todos os lançamentos recorrentes já foram gerados para o próximo mês.'
    );
  };

  const getCategoryName = (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    return cat ? cat.name : 'Outros';
  };

  const getCategoryColor = (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    return cat ? cat.color : '#94a3b8';
  };

  const getAccountOrCardName = (tx: Transaction) => {
    if (tx.creditCardId) {
      const card = creditCards.find((c) => c.id === tx.creditCardId);
      return card ? card.name : 'Cartão de Crédito';
    }
    if (tx.accountId) {
      const acc = accounts.find((a) => a.id === tx.accountId);
      return acc ? acc.name : 'Conta Bancária';
    }
    return tx.paymentMethod.toUpperCase();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xl border border-slate-700 animate-in fade-in duration-150">
          {toastMessage}
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Controle de Lançamentos
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerencie todas as suas receitas, despesas domésticas, contas fixas e variáveis.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleDuplicateRecurringForNextMonth}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            title="Projetar recorrentes para o próximo mês"
          >
            <Repeat className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate">Projetar Recorrentes</span>
          </button>

          <button
            onClick={() => onOpenNewTransaction('expense')}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer"
          >
            <ArrowDownLeft className="w-3.5 h-3.5 shrink-0" />
            <span>+ Despesa</span>
          </button>

          <button
            onClick={() => onOpenNewTransaction('income')}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer"
          >
            <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
            <span>+ Receita</span>
          </button>
        </div>
      </div>

      {/* Summary Chips for Filtered List */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Receitas Filtradas
          </span>
          <span className="text-lg font-bold text-emerald-600">{formatCurrency(totalIncomes)}</span>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Despesas Filtradas
          </span>
          <span className="text-lg font-bold text-rose-600">{formatCurrency(totalExpenses)}</span>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Saldo Líquido no Filtro
          </span>
          <span
            className={`text-lg font-bold ${
              totalIncomes - totalExpenses >= 0 ? 'text-blue-600' : 'text-rose-600'
            }`}
          >
            {formatCurrency(totalIncomes - totalExpenses)}
          </span>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-4">
        {/* Main Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex overflow-x-auto no-scrollbar rounded-xl bg-slate-100 p-1 text-xs font-semibold w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg transition-all text-center shrink-0 ${
                activeTab === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setActiveTab('expense')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 shrink-0 ${
                activeTab === 'expense' ? 'bg-white text-rose-600 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Despesas</span>
            </button>
            <button
              onClick={() => setActiveTab('income')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 shrink-0 ${
                activeTab === 'income' ? 'bg-white text-emerald-600 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Receitas</span>
            </button>
            <button
              onClick={() => setActiveTab('recurring')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 shrink-0 ${
                activeTab === 'recurring' ? 'bg-white text-blue-600 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              <Repeat className="w-3.5 h-3.5" />
              <span>Recorrentes</span>
            </button>
          </div>

          {/* Quick Expense Type Filter (Fixed / Variable) */}
          {(activeTab === 'expense' || activeTab === 'all') && (
            <div className="flex items-center gap-1 text-xs self-start sm:self-auto">
              <span className="text-slate-400 font-medium mr-1 text-[11px] sm:text-xs">Tipo:</span>
              <button
                onClick={() => setSelectedExpenseType('all')}
                className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                  selectedExpenseType === 'all'
                    ? 'bg-slate-200 text-slate-800 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setSelectedExpenseType('fixed')}
                className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                  selectedExpenseType === 'fixed'
                    ? 'bg-blue-100 text-blue-700 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Fixas
              </button>
              <button
                onClick={() => setSelectedExpenseType('variable')}
                className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                  selectedExpenseType === 'variable'
                    ? 'bg-amber-100 text-amber-800 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Variáveis
              </button>
            </div>
          )}
        </div>

        {/* Search bar & Category filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por descrição ou observação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="w-full sm:w-56">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="all">Todas as Categorias</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type === 'income' ? 'Receita' : 'Despesa'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Transactions Table / List */}
        <div>
          {filteredList.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Nenhum lançamento encontrado para os filtros selecionados.
            </div>
          ) : (
            <>
              {/* Mobile View: Fluid Cards */}
              <div className="sm:hidden space-y-2.5">
                {filteredList.map((tx) => {
                  const isInc = tx.type === 'income';
                  const isExp = tx.type === 'expense';
                  const catColor = getCategoryColor(tx.categoryId);

                  return (
                    <div
                      key={tx.id}
                      className="p-3.5 bg-slate-50/60 border border-slate-100 rounded-2xl flex items-center justify-between gap-3 transition-all active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isInc
                              ? 'bg-emerald-100 text-emerald-700'
                              : isExp
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {isInc ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : isExp ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : (
                            <Repeat className="w-4 h-4" />
                          )}
                        </div>

                        <div className="truncate">
                          <span className="font-bold text-slate-900 text-xs block truncate">
                            {tx.description}
                          </span>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                            <span>{formatDate(tx.date)}</span>
                            <span>•</span>
                            <span className="truncate" style={{ color: catColor }}>
                              {getCategoryName(tx.categoryId)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`text-xs font-bold block ${
                            isInc
                              ? 'text-emerald-600'
                              : isExp
                              ? 'text-rose-600'
                              : 'text-slate-800'
                          }`}
                        >
                          {isInc ? '+' : isExp ? '-' : ''}
                          {formatCurrency(tx.amount)}
                        </span>
                        <div className="flex items-center justify-end gap-1.5 mt-1">
                          <button
                            onClick={() => onEditTransaction(tx)}
                            className="p-1 rounded text-slate-400 hover:text-blue-600"
                            title="Editar"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirmDeleteId === tx.id) {
                                deleteTransaction(tx.id);
                                setConfirmDeleteId(null);
                              } else {
                                setConfirmDeleteId(tx.id);
                                setTimeout(() => setConfirmDeleteId(null), 3000);
                              }
                            }}
                            className={`p-1 rounded text-slate-400 hover:text-rose-600 ${
                              confirmDeleteId === tx.id ? 'text-rose-600 font-bold text-[10px]' : ''
                            }`}
                            title="Excluir"
                          >
                            {confirmDeleteId === tx.id ? 'Confirma?' : <Trash2 className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop View: Full Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-3">Data</th>
                      <th className="py-3 px-3">Descrição</th>
                      <th className="py-3 px-3">Categoria</th>
                      <th className="py-3 px-3">Conta / Cartão</th>
                      <th className="py-3 px-3">Tipo</th>
                      <th className="py-3 px-3 text-right">Valor</th>
                      <th className="py-3 px-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredList.map((tx) => {
                      const isInc = tx.type === 'income';
                      const isExp = tx.type === 'expense';
                      const catColor = getCategoryColor(tx.categoryId);

                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-3 text-slate-500 font-medium whitespace-nowrap">
                            {formatDate(tx.date)}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-800">{tx.description}</div>
                            {tx.notes && (
                              <div className="text-[11px] text-slate-400 truncate max-w-xs">
                                {tx.notes}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium"
                              style={{
                                backgroundColor: `${catColor}15`,
                                color: catColor,
                              }}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: catColor }}
                              />
                              {getCategoryName(tx.categoryId)}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                            <span className="flex items-center gap-1.5">
                              {tx.creditCardId ? (
                                <CreditCardIcon className="w-3.5 h-3.5 text-purple-500" />
                              ) : (
                                <Wallet className="w-3.5 h-3.5 text-blue-500" />
                              )}
                              <span>{getAccountOrCardName(tx)}</span>
                            </span>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              {tx.expenseType && (
                                <span
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                                    tx.expenseType === 'fixed'
                                      ? 'bg-blue-50 text-blue-700'
                                      : 'bg-amber-50 text-amber-800'
                                  }`}
                                >
                                  {tx.expenseType === 'fixed' ? 'Fixa' : 'Variável'}
                                </span>
                              )}
                              {tx.isRecurring && (
                                <span
                                  className="px-1.5 py-0.5 rounded-md text-[10px] bg-slate-100 text-slate-600 font-medium flex items-center gap-1"
                                  title="Lançamento Recorrente Mensal"
                                >
                                  <Repeat className="w-2.5 h-2.5 text-blue-600" />
                                  <span>Recorrente</span>
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right whitespace-nowrap font-bold">
                            <span
                              className={
                                isInc
                                  ? 'text-emerald-600 font-extrabold'
                                  : isExp
                                  ? 'text-rose-600 font-extrabold'
                                  : 'text-slate-800'
                              }
                            >
                              {isInc ? '+' : isExp ? '-' : ''}
                              {formatCurrency(tx.amount)}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => onEditTransaction(tx)}
                                className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                title="Editar lançamento"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirmDeleteId === tx.id) {
                                    deleteTransaction(tx.id);
                                    setConfirmDeleteId(null);
                                  } else {
                                    setConfirmDeleteId(tx.id);
                                    setTimeout(() => setConfirmDeleteId(null), 3000);
                                  }
                                }}
                                className={`p-1 rounded transition-colors ${
                                  confirmDeleteId === tx.id
                                    ? 'bg-rose-600 text-white font-bold text-[10px] px-1.5'
                                    : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                }`}
                                title={confirmDeleteId === tx.id ? 'Clique para confirmar exclusão' : 'Excluir'}
                              >
                                {confirmDeleteId === tx.id ? 'Confirmar?' : <Trash2 className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
