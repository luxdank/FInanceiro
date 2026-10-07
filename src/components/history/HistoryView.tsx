import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  Trash2,
  Edit2,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, TransactionType } from '../../types/finance';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportTransactionsToCSV, downloadFile } from '../../utils/exportUtils';

interface HistoryViewProps {
  onEditTransaction: (tx: Transaction) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onEditTransaction }) => {
  const {
    transactions,
    categories,
    accounts,
    creditCards,
    deleteTransaction,
  } = useFinance();

  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
      if (categoryFilter !== 'all' && tx.categoryId !== categoryFilter) return false;
      if (accountFilter !== 'all') {
        const matchesAcc = tx.accountId === accountFilter || tx.creditCardId === accountFilter;
        if (!matchesAcc) return false;
      }
      if (startDate && tx.date < startDate) return false;
      if (endDate && tx.date > endDate) return false;

      if (search) {
        const s = search.toLowerCase();
        const inDesc = tx.description.toLowerCase().includes(s);
        const inNotes = tx.notes ? tx.notes.toLowerCase().includes(s) : false;
        if (!inDesc && !inNotes) return false;
      }

      return true;
    });
  }, [transactions, typeFilter, categoryFilter, accountFilter, search, startDate, endDate]);

  const handleExportCSV = () => {
    const csv = exportTransactionsToCSV(filtered, categories, accounts, creditCards);
    const dateStamp = new Date().toISOString().split('T')[0];
    downloadFile(csv, `historico_financeiro_${dateStamp}.csv`, 'text/csv;charset=utf-8;');
  };

  const getCategoryName = (id: string) => categories.find((c) => c.id === id)?.name || 'Outros';

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Histórico Financeiro Completo
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit trail de todos os seus lançamentos, receitas, despesas, aportes e resgates.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Exportar para CSV</span>
        </button>
      </div>

      {/* Filters Box */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar por descrição ou notas em todo o histórico..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          {/* Tipo */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Tipo</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            >
              <option value="all">Todos os tipos</option>
              <option value="income">Receitas</option>
              <option value="expense">Despesas</option>
              <option value="investment_deposit">Aporte em Investimento</option>
              <option value="emergency_deposit">Aporte na Reserva</option>
            </select>
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Categoria</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            >
              <option value="all">Todas as categorias</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Conta / Cartão */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Conta / Cartão</label>
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            >
              <option value="all">Todas as contas</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  Conta: {a.name}
                </option>
              ))}
              {creditCards.map((c) => (
                <option key={c.id} value={c.id}>
                  Cartão: {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Data inicial */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Data De</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            />
          </div>

          {/* Data final */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Data Até</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
          <span>{filtered.length} lançamentos encontrados</span>
          {(typeFilter !== 'all' || categoryFilter !== 'all' || search || startDate) && (
            <button
              onClick={() => {
                setTypeFilter('all');
                setCategoryFilter('all');
                setAccountFilter('all');
                setSearch('');
                setStartDate('');
                setEndDate('');
              }}
              className="text-blue-600 hover:underline font-semibold"
            >
              Limpar filtros
            </button>
          )}
        </div>

        <div>
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Nenhum registro encontrado para estes critérios.
            </div>
          ) : (
            <>
              {/* Mobile Card List */}
              <div className="sm:hidden space-y-2.5">
                {filtered.map((tx) => {
                  const isInc = tx.type === 'income';
                  const isExp = tx.type === 'expense';
                  return (
                    <div
                      key={tx.id}
                      className="p-3.5 bg-slate-50/60 border border-slate-100 rounded-2xl flex items-center justify-between gap-3 transition-all active:scale-[0.99]"
                    >
                      <div className="truncate">
                        <span className="font-bold text-slate-900 text-xs block truncate">
                          {tx.description}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                          <span>{formatDate(tx.date)}</span>
                          <span>•</span>
                          <span className="truncate">{getCategoryName(tx.categoryId)}</span>
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
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteTransaction(tx.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Full Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-3">Data</th>
                      <th className="py-3 px-3">Tipo</th>
                      <th className="py-3 px-3">Descrição</th>
                      <th className="py-3 px-3">Categoria</th>
                      <th className="py-3 px-3 text-right">Valor</th>
                      <th className="py-3 px-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((tx) => {
                      const isInc = tx.type === 'income';
                      const isExp = tx.type === 'expense';
                      const isInv = tx.type === 'investment_deposit';
                      const isEmg = tx.type === 'emergency_deposit';

                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                            {formatDate(tx.date)}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                                isInc
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : isExp
                                  ? 'bg-rose-50 text-rose-700'
                                  : isInv
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-indigo-50 text-indigo-700'
                              }`}
                            >
                              {isInc && <ArrowUpRight className="w-3 h-3" />}
                              {isExp && <ArrowDownLeft className="w-3 h-3" />}
                              {isInv && <TrendingUp className="w-3 h-3" />}
                              {isEmg && <ShieldCheck className="w-3 h-3" />}
                              {isInc
                                ? 'Receita'
                                : isExp
                                ? 'Despesa'
                                : isInv
                                ? 'Investimento'
                                : 'Reserva'}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-semibold text-slate-800 block">
                              {tx.description}
                            </span>
                            {tx.notes && (
                              <span className="text-[11px] text-slate-400 block truncate max-w-xs">
                                {tx.notes}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-slate-600">
                            {getCategoryName(tx.categoryId)}
                          </td>
                          <td className="py-3 px-3 text-right font-bold whitespace-nowrap">
                            <span
                              className={
                                isInc
                                  ? 'text-emerald-600'
                                  : isExp
                                  ? 'text-rose-600'
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
                                className="p-1 rounded text-slate-400 hover:text-blue-600"
                                title="Editar"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteTransaction(tx.id)}
                                className="p-1 rounded text-slate-400 hover:text-rose-600"
                                title="Excluir"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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
