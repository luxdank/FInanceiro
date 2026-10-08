import React, { useState, useMemo } from 'react';
import {
  Heart,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Users,
  Settings,
  Sparkles,
  ShoppingBag,
  Home,
  Utensils,
  Car,
  Pill,
  Coffee,
  CheckCircle2,
  Wallet,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  Share2,
  Check,
  Copy,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, TransactionType } from '../../types/finance';
import { formatCurrency, formatDate, getTodayString } from '../../utils/formatters';

interface CoupleRoutineViewProps {
  onOpenAdvancedMode?: () => void;
  onEditTransaction?: (tx: Transaction) => void;
}

export const CoupleRoutineView: React.FC<CoupleRoutineViewProps> = ({
  onOpenAdvancedMode,
  onEditTransaction,
}) => {
  const {
    transactions,
    categories,
    coupleConfig,
    updateCoupleConfig,
    addTransaction,
    deleteTransaction,
    selectedMonth,
    setSelectedMonth,
    syncCode,
  } = useFinance();

  const [copiedLink, setCopiedLink] = useState(false);

  // Quick Transaction Form State
  const [type, setType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<string>('');
  const [paidBy, setPaidBy] = useState<string>(coupleConfig.partner1Name);
  const [customDate, setCustomDate] = useState<string>(getTodayString());
  const [isSuccessToast, setIsSuccessToast] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [personFilter, setPersonFilter] = useState<'all' | 'p1' | 'p2' | 'couple'>('all');

  // Couple Profile Edit Modal
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [tempPartner1, setTempPartner1] = useState(coupleConfig.partner1Name);
  const [tempPartner2, setTempPartner2] = useState(coupleConfig.partner2Name);

  // Month navigation
  const currentMonthDate = useMemo(() => {
    const [y, m] = selectedMonth.split('-').map(Number);
    return new Date(y, m - 1, 1);
  }, [selectedMonth]);

  const monthLabel = useMemo(() => {
    const str = currentMonthDate.toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    });
    return str.charAt(0).toUpperCase() + str.slice(1);
  }, [currentMonthDate]);

  const handlePrevMonth = () => {
    const prev = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1);
    const mStr = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(mStr);
  };

  const handleNextMonth = () => {
    const next = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1);
    const mStr = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(mStr);
  };

  // Preset quick categories
  const quickCategories = useMemo(() => {
    const list = categories.filter((c) => c.type === type);
    if (list.length > 0) return list.slice(0, 8);
    return categories.slice(0, 8);
  }, [categories, type]);

  // Set default category when type changes
  React.useEffect(() => {
    const available = categories.filter((c) => c.type === type);
    if (available.length > 0) {
      setSelectedCatId(available[0].id);
    }
  }, [type, categories]);

  // Quick submit
  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = parseFloat(amountStr.replace(',', '.'));
    if (!cleanAmount || cleanAmount <= 0) return;

    const catId = selectedCatId || categories.find((c) => c.type === type)?.id || categories[0]?.id;

    await addTransaction({
      description: description.trim() || (type === 'income' ? 'Receita' : 'Gasto'),
      amount: cleanAmount,
      type,
      categoryId: catId,
      date: customDate || getTodayString(),
      paymentMethod: type === 'expense' ? 'credit_card' : 'pix',
      isRecurring: false,
      paidBy: paidBy || coupleConfig.partner1Name,
    });

    // Reset inputs
    setAmountStr('');
    setDescription('');
    setIsSuccessToast(true);
    setTimeout(() => setIsSuccessToast(false), 2500);
  };

  // Filter transactions for selected month
  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // Monthly summary calculations
  const totalIncome = useMemo(() => {
    return monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions]);

  const totalExpense = useMemo(() => {
    return monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions]);

  const netSavings = totalIncome - totalExpense;

  // Partner expense distribution
  const partner1Expenses = useMemo(() => {
    return monthTransactions
      .filter(
        (t) =>
          t.type === 'expense' &&
          (t.paidBy === coupleConfig.partner1Name ||
            t.paidBy === 'Ele' ||
            (!t.paidBy && coupleConfig.partner1Name === 'Lucas'))
      )
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions, coupleConfig.partner1Name]);

  const partner2Expenses = useMemo(() => {
    return monthTransactions
      .filter(
        (t) =>
          t.type === 'expense' &&
          (t.paidBy === coupleConfig.partner2Name || t.paidBy === 'Ela')
      )
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions, coupleConfig.partner2Name]);

  const sharedExpenses = useMemo(() => {
    return monthTransactions
      .filter(
        (t) =>
          t.type === 'expense' &&
          (t.paidBy === 'Casal' || t.paidBy === 'Nós' || t.paidBy === 'Nós Dois')
      )
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions]);

  // Filtered list for feed
  const filteredFeed = useMemo(() => {
    return monthTransactions.filter((t) => {
      // Search text
      if (searchTerm) {
        const text = searchTerm.toLowerCase();
        const matchDesc = t.description.toLowerCase().includes(text);
        const cat = categories.find((c) => c.id === t.categoryId);
        const matchCat = cat?.name.toLowerCase().includes(text);
        if (!matchDesc && !matchCat) return false;
      }

      // Person filter
      if (personFilter === 'p1') {
        return (
          t.paidBy === coupleConfig.partner1Name ||
          t.paidBy === 'Ele' ||
          (!t.paidBy && coupleConfig.partner1Name === 'Lucas')
        );
      }
      if (personFilter === 'p2') {
        return t.paidBy === coupleConfig.partner2Name || t.paidBy === 'Ela';
      }
      if (personFilter === 'couple') {
        return t.paidBy === 'Casal' || t.paidBy === 'Nós' || t.paidBy === 'Nós Dois';
      }
      return true;
    });
  }, [monthTransactions, searchTerm, personFilter, coupleConfig, categories]);

  // Expenses grouped by category (simple progress bars)
  const categorySummary = useMemo(() => {
    const map: Record<string, number> = {};
    monthTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        map[t.categoryId] = (map[t.categoryId] || 0) + t.amount;
      });

    return Object.entries(map)
      .map(([catId, total]) => {
        const cat = categories.find((c) => c.id === catId);
        return {
          id: catId,
          name: cat ? cat.name : 'Outros',
          color: cat ? cat.color : '#64748b',
          total,
          percent: totalExpense > 0 ? (total / totalExpense) * 100 : 0,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [monthTransactions, categories, totalExpense]);

  // Save couple profile names
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempPartner1.trim() || !tempPartner2.trim()) return;

    await updateCoupleConfig({
      partner1Name: tempPartner1.trim(),
      partner2Name: tempPartner2.trim(),
    });
    setPaidBy(tempPartner1.trim());
    setIsProfileModalOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* 1. HEADER DO CASAL */}
      <div className="bg-gradient-to-r from-rose-500 via-pink-600 to-indigo-600 rounded-3xl p-5 sm:p-7 text-white shadow-xl shadow-pink-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-[11px] font-semibold text-white">
              <Heart className="w-3.5 h-3.5 fill-rose-300 text-rose-300" />
              Rotina do Casal
            </span>
            <button
              onClick={() => {
                setTempPartner1(coupleConfig.partner1Name);
                setTempPartner2(coupleConfig.partner2Name);
                setIsProfileModalOpen(true);
              }}
              className="text-[11px] font-medium text-pink-100 hover:text-white underline cursor-pointer"
            >
              Editar nomes
            </button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Finanças de {coupleConfig.partner1Name} & {coupleConfig.partner2Name}
          </h1>
          <p className="text-xs sm:text-sm text-pink-100 mt-1 max-w-md">
            Simples, rápido e feito para acompanhar os gastos e conquistas da casa.
          </p>
        </div>

        {/* Month selector & Advanced Mode switch */}
        <div className="flex flex-col sm:items-end gap-2.5">
          <div className="inline-flex items-center bg-white/15 backdrop-blur-md rounded-2xl p-1 border border-white/20">
            <button
              onClick={handlePrevMonth}
              aria-label="Mês anterior"
              className="p-1.5 hover:bg-white/20 rounded-xl transition-all cursor-pointer text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold tracking-wide min-w-[120px] text-center">
              {monthLabel}
            </span>
            <button
              onClick={handleNextMonth}
              aria-label="Próximo mês"
              className="p-1.5 hover:bg-white/20 rounded-xl transition-all cursor-pointer text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {onOpenAdvancedMode && (
            <button
              onClick={onOpenAdvancedMode}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 text-white transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Ver Modo Completo</span>
            </button>
          )}
        </div>
      </div>

      {/* Sincronização Celular & PC em Tempo Real */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200/90 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-950">
                Sincronizado com Celular & PC
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-emerald-800">
              O que você registrar no celular ou no PC aparece na mesma hora para {coupleConfig.partner1Name} e {coupleConfig.partner2Name}.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <div className="px-2.5 py-1 bg-white border border-emerald-300 rounded-xl text-center font-mono font-bold text-xs text-blue-700 shadow-2xs">
            {syncCode}
          </div>
          <button
            type="button"
            onClick={() => {
              const url = `${window.location.origin}${window.location.pathname}?sync=${syncCode}`;
              navigator.clipboard?.writeText(url);
              setCopiedLink(true);
              setTimeout(() => setCopiedLink(false), 2500);
            }}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Link Copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Enviar para Celular</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. O QUE IMPORTA NO MÊS (3 NÚMEROS CLAROS) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Entrou */}
        <div className="bg-white rounded-2xl border border-emerald-100 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-500">Ganhamos no Mês</span>
            <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 tracking-tight">
            {formatCurrency(totalIncome)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Salários e rendas somadas
          </span>
        </div>

        {/* Gastamos */}
        <div className="bg-white rounded-2xl border border-rose-100 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-500">Gastamos no Mês</span>
            <div className="w-7 h-7 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-600 tracking-tight">
            {formatCurrency(totalExpense)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Mercado, contas e compras
          </span>
        </div>

        {/* Sobrou */}
        <div className="bg-white rounded-2xl border border-blue-100 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-500">Sobrou para Nós</span>
            <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-xl sm:text-2xl font-black tracking-tight ${
              netSavings >= 0 ? 'text-blue-600' : 'text-amber-600'
            }`}
          >
            {formatCurrency(netSavings)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {totalIncome > 0
              ? netSavings >= 0
                ? `Poupança de ${((netSavings / totalIncome) * 100).toFixed(0)}% da renda 🎉`
                : 'Gastos superaram a renda no mês'
              : 'Registre suas receitas do mês'}
          </span>
        </div>
      </div>

      {/* 3. CARD LANÇAMENTO EM 5 SEGUNDOS (O CORAÇÃO DA ROTINA) */}
      <div className="bg-white rounded-3xl border-2 border-pink-200/80 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center font-bold">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Anotar Gasto ou Ganho em 5 Segundos
              </h2>
              <p className="text-xs text-slate-500">
                Preencha rápido para manter o casal sempre alinhado
              </p>
            </div>
          </div>

          {/* Type Toggle: Gasto vs Ganho */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              - Gasto
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              + Ganho
            </button>
          </div>
        </div>

        <form onSubmit={handleQuickAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Valor Grande */}
            <div className="sm:col-span-5">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Valor (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                  R$
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-lg font-black text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-pink-500 transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* O que foi */}
            <div className="sm:col-span-7">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                O que foi? (Opcional)
              </label>
              <input
                type="text"
                placeholder={
                  type === 'expense'
                    ? 'Ex: Supermercado, Padaria, Almoço, Farmácia...'
                    : 'Ex: Salário, Freelance, Rendimento...'
                }
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-pink-500 transition-all"
              />
            </div>
          </div>

          {/* Quem pagou? (Botões grandes e personalizados) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {type === 'expense' ? 'Quem pagou?' : 'Quem recebeu?'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaidBy(coupleConfig.partner1Name)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  paidBy === coupleConfig.partner1Name
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>👦 {coupleConfig.partner1Name}</span>
              </button>

              <button
                type="button"
                onClick={() => setPaidBy(coupleConfig.partner2Name)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  paidBy === coupleConfig.partner2Name
                    ? 'bg-pink-600 text-white border-pink-600 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>👧 {coupleConfig.partner2Name}</span>
              </button>

              <button
                type="button"
                onClick={() => setPaidBy('Casal')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  paidBy === 'Casal' || paidBy === 'Nós' || paidBy === 'Nós Dois'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>💑 Nós Dois</span>
              </button>
            </div>
          </div>

          {/* Categorias Rápidas em 1 Toque */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Categoria
            </label>
            <div className="flex flex-wrap gap-1.5">
              {quickCategories.map((cat) => {
                const isSelected = selectedCatId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCatId(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Botão de Salvar em Destaque */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="text-xs bg-slate-100 text-slate-600 px-3 py-2 rounded-xl border border-slate-200 font-medium"
            />

            <button
              type="submit"
              className={`flex-1 py-3 px-5 rounded-xl font-bold text-sm text-white transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 ${
                type === 'expense'
                  ? 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 shadow-rose-500/20'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/20'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Salvar Lançamento em 1 Toque</span>
            </button>
          </div>
        </form>

        {isSuccessToast && (
          <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold text-center animate-fade-in flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Lançamento salvo com sucesso no Firebase!</span>
          </div>
        )}
      </div>

      {/* 4. QUEM GASTOU QUANTO? (DIVISÃO TRANSPARENTE DO CASAL) */}
      {totalExpense > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Divisão de Gastos do Mês
              </h3>
              <p className="text-xs text-slate-500">
                Quem arcou com as despesas neste mês
              </p>
            </div>
            <span className="text-xs font-extrabold text-slate-700">
              Total: {formatCurrency(totalExpense)}
            </span>
          </div>

          {/* Barra proporcional */}
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex shadow-inner mb-3">
            {partner1Expenses > 0 && (
              <div
                style={{ width: `${(partner1Expenses / totalExpense) * 100}%` }}
                className="bg-blue-500 h-full transition-all"
                title={`${coupleConfig.partner1Name}: ${formatCurrency(partner1Expenses)}`}
              />
            )}
            {partner2Expenses > 0 && (
              <div
                style={{ width: `${(partner2Expenses / totalExpense) * 100}%` }}
                className="bg-pink-500 h-full transition-all"
                title={`${coupleConfig.partner2Name}: ${formatCurrency(partner2Expenses)}`}
              />
            )}
            {sharedExpenses > 0 && (
              <div
                style={{ width: `${(sharedExpenses / totalExpense) * 100}%` }}
                className="bg-indigo-500 h-full transition-all"
                title={`Casal / Compartilhado: ${formatCurrency(sharedExpenses)}`}
              />
            )}
          </div>

          {/* Detalhe dos 3 blocos */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 bg-blue-50/60 rounded-xl border border-blue-100">
              <span className="text-blue-600 font-semibold block text-[11px]">
                👦 {coupleConfig.partner1Name}
              </span>
              <span className="font-extrabold text-slate-900 block mt-0.5">
                {formatCurrency(partner1Expenses)}
              </span>
              <span className="text-[10px] text-slate-400">
                {totalExpense > 0 ? ((partner1Expenses / totalExpense) * 100).toFixed(0) : 0}%
              </span>
            </div>

            <div className="p-2 bg-pink-50/60 rounded-xl border border-pink-100">
              <span className="text-pink-600 font-semibold block text-[11px]">
                👧 {coupleConfig.partner2Name}
              </span>
              <span className="font-extrabold text-slate-900 block mt-0.5">
                {formatCurrency(partner2Expenses)}
              </span>
              <span className="text-[10px] text-slate-400">
                {totalExpense > 0 ? ((partner2Expenses / totalExpense) * 100).toFixed(0) : 0}%
              </span>
            </div>

            <div className="p-2 bg-indigo-50/60 rounded-xl border border-indigo-100">
              <span className="text-indigo-600 font-semibold block text-[11px]">
                💑 Ambos / Compartilhado
              </span>
              <span className="font-extrabold text-slate-900 block mt-0.5">
                {formatCurrency(sharedExpenses)}
              </span>
              <span className="text-[10px] text-slate-400">
                {totalExpense > 0 ? ((sharedExpenses / totalExpense) * 100).toFixed(0) : 0}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 5. GASTOS POR CATEGORIA (BARRAS SIMPLES E LIMPAS) */}
      {categorySummary.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Onde Estamos Gastando Mais?
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Principais categorias do orçamento de {monthLabel}
          </p>

          <div className="space-y-3">
            {categorySummary.slice(0, 5).map((cat) => (
              <div key={cat.id}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: cat.color }}
                    />
                    {cat.name}
                  </span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(cat.total)}{' '}
                    <span className="text-[11px] font-normal text-slate-400">
                      ({cat.percent.toFixed(0)}%)
                    </span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${cat.percent}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. NOSSO FEED DO DIA A DIA (LANÇAMENTOS DO MÊS) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Gastos & Ganhos de {monthLabel}
            </h3>
            <p className="text-xs text-slate-500">
              {filteredFeed.length} lançamento(s) registrado(s)
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar gasto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-pink-500 w-36 sm:w-44"
              />
            </div>

            <div className="inline-flex bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setPersonFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  personFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setPersonFilter('p1')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  personFilter === 'p1'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-blue-700'
                }`}
              >
                {coupleConfig.partner1Name}
              </button>
              <button
                type="button"
                onClick={() => setPersonFilter('p2')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  personFilter === 'p2'
                    ? 'bg-pink-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-pink-700'
                }`}
              >
                {coupleConfig.partner2Name}
              </button>
            </div>
          </div>
        </div>

        {/* List of items */}
        {filteredFeed.length === 0 ? (
          <div className="text-center py-10 px-4 text-slate-400 text-xs">
            Nenhum lançamento encontrado para os filtros selecionados.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredFeed.map((tx) => {
              const cat = categories.find((c) => c.id === tx.categoryId);
              const isIncome = tx.type === 'income';

              const personLabel =
                tx.paidBy === coupleConfig.partner2Name || tx.paidBy === 'Ela'
                  ? coupleConfig.partner2Name
                  : tx.paidBy === 'Casal' || tx.paidBy === 'Nós' || tx.paidBy === 'Nós Dois'
                  ? 'Casal'
                  : coupleConfig.partner1Name;

              const personColor =
                personLabel === coupleConfig.partner2Name
                  ? 'text-pink-600 bg-pink-50'
                  : personLabel === 'Casal'
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-blue-600 bg-blue-50';

              return (
                <div
                  key={tx.id}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/60 px-2 rounded-xl transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                        isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      {isIncome ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : (
                        <ArrowDownLeft className="w-5 h-5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm truncate">
                          {tx.description}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${personColor}`}
                        >
                          {personLabel}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span>{formatDate(tx.date)}</span>
                        <span>·</span>
                        <span className="text-slate-600 font-medium">
                          {cat ? cat.name : 'Geral'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`font-black text-sm ${
                        isIncome ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                    </span>

                    <div className="flex items-center gap-1">
                      {onEditTransaction && (
                        <button
                          onClick={() => onEditTransaction(tx)}
                          aria-label="Editar"
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteTransaction(tx.id)}
                        aria-label="Excluir"
                        className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-300 hover:text-rose-600 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 7. MODAL DE EDIÇÃO DE NOMES DO CASAL */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-scale-up">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
                <Heart className="w-5 h-5 fill-pink-500" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Nomes do Casal</h3>
                <p className="text-xs text-slate-500">Personalize como vocês aparecem no app</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Seu Nome (Parceiro 1)
                </label>
                <input
                  type="text"
                  required
                  value={tempPartner1}
                  onChange={(e) => setTempPartner1(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome da Esposa / Parceira (Parceiro 2)
                </label>
                <input
                  type="text"
                  required
                  value={tempPartner2}
                  onChange={(e) => setTempPartner2(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Salvar Nomes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
