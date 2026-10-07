import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  CreditCard as CreditCardIcon,
  Calendar,
  Wallet,
} from 'lucide-react';
import {
  Transaction,
  TransactionType,
  ExpenseType,
  PaymentMethod,
  RecurrenceType,
} from '../../types/finance';
import { useFinance } from '../../context/FinanceContext';
import { getTodayString } from '../../utils/formatters';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: TransactionType;
  editingTransaction?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  initialType = 'expense',
  editingTransaction = null,
}) => {
  const {
    categories,
    accounts,
    creditCards,
    investments,
    coupleConfig,
    addTransaction,
    updateTransaction,
    depositEmergencyFund,
    depositInvestment,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<TransactionType>(initialType);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Fields
  const [description, setDescription] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [paidBy, setPaidBy] = useState<string>(coupleConfig.partner1Name);
  const [date, setDate] = useState(getTodayString());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [accountId, setAccountId] = useState('');
  const [creditCardId, setCreditCardId] = useState('');
  const [expenseType, setExpenseType] = useState<ExpenseType>('variable');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrence, setRecurrence] = useState<RecurrenceType>('monthly');
  const [notes, setNotes] = useState('');
  const [targetInvestmentId, setTargetInvestmentId] = useState('');

  // Sync state when opening or switching transaction
  useEffect(() => {
    if (editingTransaction) {
      setActiveTab(editingTransaction.type);
      setDescription(editingTransaction.description);
      setAmountStr(String(editingTransaction.amount));
      setCategoryId(editingTransaction.categoryId);
      setDate(editingTransaction.date);
      setPaymentMethod(editingTransaction.paymentMethod);
      setAccountId(editingTransaction.accountId || '');
      setCreditCardId(editingTransaction.creditCardId || '');
      setExpenseType(editingTransaction.expenseType || 'variable');
      setIsRecurring(editingTransaction.isRecurring || false);
      setRecurrence(editingTransaction.recurrence || 'monthly');
      setPaidBy(editingTransaction.paidBy || coupleConfig.partner1Name);
      setNotes(editingTransaction.notes || '');
    } else {
      setActiveTab(initialType);
      setDescription('');
      setAmountStr('');
      setDate(getTodayString());
      setPaidBy(coupleConfig.partner1Name);
      setNotes('');
      setIsRecurring(false);
      setRecurrence('monthly');
      setExpenseType('variable');

      // Defaults
      if (initialType === 'income') {
        const firstIncomeCat = categories.find((c) => c.type === 'income');
        if (firstIncomeCat) setCategoryId(firstIncomeCat.id);
        setPaymentMethod('pix');
      } else if (initialType === 'expense') {
        const firstExpCat = categories.find((c) => c.type === 'expense');
        if (firstExpCat) setCategoryId(firstExpCat.id);
        setPaymentMethod('credit_card');
      } else if (initialType === 'emergency_deposit') {
        setDescription('Aporte Reserva de Emergência');
        setPaymentMethod('transfer');
      } else if (initialType === 'investment_deposit') {
        setDescription('Aporte em Investimento');
        setPaymentMethod('transfer');
        if (investments.length > 0) {
          setTargetInvestmentId(investments[0].id);
        }
      }

      if (accounts.length > 0) setAccountId(accounts[0].id);
      if (creditCards.length > 0) setCreditCardId(creditCards[0].id);
    }
  }, [isOpen, editingTransaction, initialType, categories, accounts, creditCards, investments]);

  // When changing tabs in modal
  const handleTabChange = (type: TransactionType) => {
    setActiveTab(type);
    if (!editingTransaction) {
      if (type === 'income') {
        const cat = categories.find((c) => c.type === 'income');
        if (cat) setCategoryId(cat.id);
        setDescription('');
      } else if (type === 'expense') {
        const cat = categories.find((c) => c.type === 'expense');
        if (cat) setCategoryId(cat.id);
        setDescription('');
      } else if (type === 'emergency_deposit') {
        setDescription('Aporte Reserva de Emergência');
      } else if (type === 'investment_deposit') {
        setDescription('Aporte Investimento');
        if (investments.length > 0 && !targetInvestmentId) {
          setTargetInvestmentId(investments[0].id);
        }
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const parsedAmount = parseFloat(amountStr.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('Por favor, informe um valor válido maior que zero.');
      return;
    }

    if (activeTab === 'emergency_deposit') {
      depositEmergencyFund(parsedAmount, date, notes, accountId || undefined);
      onClose();
      return;
    }

    if (activeTab === 'investment_deposit' && targetInvestmentId) {
      depositInvestment(targetInvestmentId, parsedAmount, accountId || undefined);
      onClose();
      return;
    }

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, {
        description: description || 'Sem descrição',
        amount: parsedAmount,
        type: activeTab,
        categoryId: categoryId || (activeTab === 'income' ? 'cat-inc-5' : 'cat-exp-11'),
        date,
        paidBy: paidBy || coupleConfig.partner1Name,
        paymentMethod,
        accountId: paymentMethod !== 'credit_card' ? accountId : undefined,
        creditCardId: paymentMethod === 'credit_card' ? creditCardId : undefined,
        expenseType: activeTab === 'expense' ? expenseType : undefined,
        isRecurring,
        recurrence: isRecurring ? recurrence : 'none',
        notes,
      });
    } else {
      addTransaction({
        description: description || (activeTab === 'income' ? 'Receita' : 'Despesa'),
        amount: parsedAmount,
        type: activeTab,
        categoryId: categoryId || (activeTab === 'income' ? 'cat-inc-5' : 'cat-exp-11'),
        date,
        paidBy: paidBy || coupleConfig.partner1Name,
        paymentMethod,
        accountId: paymentMethod !== 'credit_card' ? accountId : undefined,
        creditCardId: paymentMethod === 'credit_card' ? creditCardId : undefined,
        expenseType: activeTab === 'expense' ? expenseType : undefined,
        isRecurring,
        recurrence: isRecurring ? recurrence : 'none',
        notes,
      });
    }

    onClose();
  };

  const filteredCategories = categories.filter((c) =>
    activeTab === 'income' ? c.type === 'income' : c.type === 'expense'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] pb-[max(0.5rem,env(safe-area-inset-bottom))] animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 duration-200">
        {/* Mobile Grab Handle */}
        <div className="sm:hidden w-10 h-1 bg-slate-300 rounded-full mx-auto mt-2.5 mb-1" />
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-800 text-base sm:text-lg">
              {editingTransaction ? 'Editar Lançamento' : 'Novo Lançamento'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error message if any */}
        {errorMessage && (
          <div className="mx-4 sm:mx-6 mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Type Selector Tabs (Only when creating new) */}
        {!editingTransaction && (
          <div className="grid grid-cols-4 gap-1 p-1 sm:p-1.5 bg-slate-100/90 mx-3 sm:mx-6 mt-3 rounded-xl text-[11px] sm:text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleTabChange('expense')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 py-1.5 sm:py-2 px-1 rounded-lg transition-all ${
                activeTab === 'expense'
                  ? 'bg-white text-rose-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="truncate">Despesa</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('income')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 py-1.5 sm:py-2 px-1 rounded-lg transition-all ${
                activeTab === 'income'
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="truncate">Receita</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('investment_deposit')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 py-1.5 sm:py-2 px-1 rounded-lg transition-all ${
                activeTab === 'investment_deposit'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="truncate">Investir</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('emergency_deposit')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 py-1.5 sm:py-2 px-1 rounded-lg transition-all ${
                activeTab === 'emergency_deposit'
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span className="truncate">Reserva</span>
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-3.5 sm:space-y-4 text-xs sm:text-sm flex-1">
          {/* Valor */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Valor (R$) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                R$
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0,00"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-lg text-slate-900"
              />
            </div>
          </div>

          {/* Special mode: Investimento deposit */}
          {activeTab === 'investment_deposit' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ativo / Investimento <span className="text-rose-500">*</span>
              </label>
              <select
                value={targetInvestmentId}
                onChange={(e) => setTargetInvestmentId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                required
              >
                {investments.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.name} ({inv.assetClass} - {inv.institution})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Descrição */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Descrição <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder={
                activeTab === 'income'
                  ? 'Ex: Salário, Consultoria, Rendimento...'
                  : activeTab === 'expense'
                  ? 'Ex: Supermercado, Aluguel, Farmácia...'
                  : activeTab === 'emergency_deposit'
                  ? 'Aporte na Reserva de Emergência'
                  : 'Aporte de investimento'
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
            />
          </div>

          {/* Quem pagou / recebeu? (Rotina do Casal) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {activeTab === 'income' ? 'Quem recebeu?' : 'Quem pagou?'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaidBy(coupleConfig.partner1Name)}
                className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  paidBy === coupleConfig.partner1Name
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>👦 {coupleConfig.partner1Name}</span>
              </button>
              <button
                type="button"
                onClick={() => setPaidBy(coupleConfig.partner2Name)}
                className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  paidBy === coupleConfig.partner2Name
                    ? 'bg-pink-600 text-white border-pink-600 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>👧 {coupleConfig.partner2Name}</span>
              </button>
              <button
                type="button"
                onClick={() => setPaidBy('Casal')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  paidBy === 'Casal' || paidBy === 'Nós' || paidBy === 'Nós Dois'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>💑 Casal</span>
              </button>
            </div>
          </div>

          {/* Categoria (Para Receita ou Despesa) */}
          {(activeTab === 'income' || activeTab === 'expense') && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Categoria <span className="text-rose-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                required
              >
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Data & Forma de Pagamento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Data
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <CreditCardIcon className="w-3.5 h-3.5 text-slate-400" />
                Forma de Pagamento
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
              >
                <option value="pix">PIX</option>
                {activeTab === 'expense' && <option value="credit_card">Cartão de Crédito</option>}
                <option value="debit_card">Cartão de Débito</option>
                <option value="bank_slip">Boleto Bancário</option>
                <option value="transfer">Transferência / TED</option>
                <option value="cash">Dinheiro em Espécie</option>
                <option value="other">Outro</option>
              </select>
            </div>
          </div>

          {/* Conta ou Cartão de Crédito */}
          {paymentMethod === 'credit_card' && activeTab === 'expense' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <CreditCardIcon className="w-3.5 h-3.5 text-slate-400" />
                Cartão de Crédito
              </label>
              <select
                value={creditCardId}
                onChange={(e) => setCreditCardId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
              >
                {creditCards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.name} (Vencimento dia {card.dueDay})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5 text-slate-400" />
                Conta Bancária
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} (Saldo: R$ {acc.balance.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Tipo de Despesa (Fixa ou Variável) */}
          {activeTab === 'expense' && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tipo de Despesa
                </label>
                <div className="flex rounded-xl bg-slate-100 p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setExpenseType('fixed')}
                    className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
                      expenseType === 'fixed'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600'
                    }`}
                  >
                    Fixa
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpenseType('variable')}
                    className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
                      expenseType === 'variable'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600'
                    }`}
                  >
                    Variável
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Recorrência
                </label>
                <div className="flex items-center h-9">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={isRecurring}
                      onChange={(e) => setIsRecurring(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span>Despesa Recorrente</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Recurrence frequency if recurring */}
          {isRecurring && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Frequência de Recorrência
              </label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-slate-800"
              >
                <option value="monthly">Mensal (Todo mês)</option>
                <option value="weekly">Semanal</option>
                <option value="yearly">Anual</option>
              </select>
            </div>
          )}

          {/* Observações */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Observações (Opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Informações adicionais..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 text-xs resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {editingTransaction ? 'Salvar Alterações' : 'Confirmar Lançamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
