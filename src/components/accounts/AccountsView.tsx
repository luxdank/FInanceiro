import React, { useState } from 'react';
import {
  CreditCard as CreditCardIcon,
  Wallet,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  DollarSign,
  AlertCircle,
  Building,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { BankAccount, CreditCard, AccountType } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';

export const AccountsView: React.FC = () => {
  const {
    accounts,
    creditCards,
    addAccount,
    updateAccount,
    deleteAccount,
    addCreditCard,
    updateCreditCard,
    deleteCreditCard,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'accounts' | 'cards'>('accounts');

  // Account modal
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [accName, setAccName] = useState('');
  const [accType, setAccType] = useState<AccountType>('checking');
  const [accInstitution, setAccInstitution] = useState('');
  const [accBalance, setAccBalance] = useState('');

  // Card modal
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [cardName, setCardName] = useState('');
  const [cardInstitution, setCardInstitution] = useState('');
  const [cardLimit, setCardLimit] = useState('');
  const [cardInvoice, setCardInvoice] = useState('');
  const [cardClosingDay, setCardClosingDay] = useState(25);
  const [cardDueDay, setCardDueDay] = useState(2);

  const handleOpenNewAccount = () => {
    setEditingAccount(null);
    setAccName('');
    setAccType('checking');
    setAccInstitution('');
    setAccBalance('0,00');
    setIsAccountModalOpen(true);
  };

  const handleOpenEditAccount = (acc: BankAccount) => {
    setEditingAccount(acc);
    setAccName(acc.name);
    setAccType(acc.type);
    setAccInstitution(acc.institution);
    setAccBalance(String(acc.balance));
    setIsAccountModalOpen(true);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const bal = parseFloat(accBalance.replace(',', '.'));
    if (isNaN(bal)) return;

    if (editingAccount) {
      updateAccount(editingAccount.id, {
        name: accName,
        type: accType,
        institution: accInstitution,
        balance: bal,
      });
    } else {
      addAccount({
        name: accName,
        type: accType,
        institution: accInstitution || 'Instituição',
        balance: bal,
        color: '#2563eb',
      });
    }
    setIsAccountModalOpen(false);
  };

  const handleOpenNewCard = () => {
    setEditingCard(null);
    setCardName('');
    setCardInstitution('');
    setCardLimit('');
    setCardInvoice('0,00');
    setCardClosingDay(25);
    setCardDueDay(2);
    setIsCardModalOpen(true);
  };

  const handleOpenEditCard = (card: CreditCard) => {
    setEditingCard(card);
    setCardName(card.name);
    setCardInstitution(card.institution);
    setCardLimit(String(card.limit));
    setCardInvoice(String(card.currentInvoice));
    setCardClosingDay(card.closingDay);
    setCardDueDay(card.dueDay);
    setIsCardModalOpen(true);
  };

  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    const lim = parseFloat(cardLimit.replace(',', '.'));
    const inv = parseFloat(cardInvoice.replace(',', '.')) || 0;
    if (isNaN(lim) || lim <= 0) return;

    if (editingCard) {
      updateCreditCard(editingCard.id, {
        name: cardName,
        institution: cardInstitution,
        limit: lim,
        currentInvoice: inv,
        closingDay: Number(cardClosingDay),
        dueDay: Number(cardDueDay),
      });
    } else {
      addCreditCard({
        name: cardName,
        institution: cardInstitution || 'Banco',
        limit: lim,
        currentInvoice: inv,
        closingDay: Number(cardClosingDay),
        dueDay: Number(cardDueDay),
        color: '#4f46e5',
      });
    }
    setIsCardModalOpen(false);
  };

  const totalAccountBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const totalCardsLimit = creditCards.reduce((s, c) => s + c.limit, 0);
  const totalCardsInvoice = creditCards.reduce((s, c) => s + c.currentInvoice, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Contas Bancárias & Cartões de Crédito
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerencie saldos disponíveis, faturas abertas e limites de crédito.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'accounts' ? (
            <button
              onClick={handleOpenNewAccount}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Nova Conta</span>
            </button>
          ) : (
            <button
              onClick={handleOpenNewCard}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Novo Cartão</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-slate-100 p-1 w-fit text-xs font-semibold">
        <button
          onClick={() => setActiveTab('accounts')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all ${
            activeTab === 'accounts'
              ? 'bg-white text-blue-700 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Contas Bancárias ({accounts.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('cards')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all ${
            activeTab === 'cards'
              ? 'bg-white text-purple-700 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CreditCardIcon className="w-4 h-4" />
          <span>Cartões de Crédito ({creditCards.length})</span>
        </button>
      </div>

      {/* View: Accounts */}
      {activeTab === 'accounts' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Saldo Total Disponível</span>
            <span className="text-xl font-extrabold text-blue-600">
              {formatCurrency(totalAccountBalance)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3 hover:border-blue-200 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-xs"
                      style={{ backgroundColor: acc.color || '#2563eb' }}
                    >
                      {acc.institution.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{acc.name}</h4>
                      <span className="text-[11px] text-slate-400 capitalize">
                        {acc.type === 'checking'
                          ? 'Conta Corrente'
                          : acc.type === 'savings'
                          ? 'Poupança'
                          : acc.type === 'digital'
                          ? 'Conta Digital'
                          : 'Carteira Física'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditAccount(acc)}
                      className="p-1 rounded text-slate-400 hover:text-blue-600"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteAccount(acc.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Saldo Atual
                  </span>
                  <span
                    className={`text-xl font-extrabold ${
                      acc.balance >= 0 ? 'text-slate-900' : 'text-rose-600'
                    }`}
                  >
                    {formatCurrency(acc.balance)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View: Credit Cards */}
      {activeTab === 'cards' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">
                Limite Total Concedido
              </span>
              <span className="text-lg font-bold text-slate-800">
                {formatCurrency(totalCardsLimit)}
              </span>
            </div>
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">
                Faturas Atuais Utilizadas
              </span>
              <span className="text-lg font-bold text-rose-600">
                {formatCurrency(totalCardsInvoice)}
              </span>
            </div>
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">
                Limite Disponível Livre
              </span>
              <span className="text-lg font-bold text-emerald-600">
                {formatCurrency(Math.max(0, totalCardsLimit - totalCardsInvoice))}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {creditCards.map((card) => {
              const availableLimit = Math.max(0, card.limit - card.currentInvoice);
              const usagePct = card.limit > 0 ? (card.currentInvoice / card.limit) * 100 : 0;

              return (
                <div
                  key={card.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4 hover:border-purple-200 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        <CreditCardIcon className="w-5 h-5 text-purple-300" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{card.name}</h4>
                        <span className="text-[11px] text-slate-400">{card.institution}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditCard(card)}
                        className="p-1 rounded text-slate-400 hover:text-blue-600"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteCreditCard(card.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Limits and Invoice Info */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 rounded-xl p-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        Fatura Atual
                      </span>
                      <span className="text-base font-extrabold text-rose-600">
                        {formatCurrency(card.currentInvoice)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        Limite Disponível
                      </span>
                      <span className="text-base font-extrabold text-emerald-600">
                        {formatCurrency(availableLimit)}
                      </span>
                    </div>
                  </div>

                  {/* Limit Usage Bar */}
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
                      <span>Limite: {formatCurrency(card.limit)}</span>
                      <span>{usagePct.toFixed(0)}% utilizado</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          usagePct > 85 ? 'bg-rose-500' : usagePct > 60 ? 'bg-amber-500' : 'bg-purple-600'
                        }`}
                        style={{ width: `${Math.min(100, usagePct)}%` }}
                      />
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                    <span>Fecha dia {card.closingDay}</span>
                    <span className="font-bold text-slate-800">
                      Vence dia {card.dueDay}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Account Modal */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setIsAccountModalOpen(false)} />
          <div className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-100 max-w-sm w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto pb-[max(1rem,env(safe-area-inset-bottom))] animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 duration-200">
            {/* Mobile Grab Handle */}
            <div className="sm:hidden w-10 h-1 bg-slate-300 rounded-full mx-auto -mt-1 mb-2" />

            <h3 className="font-bold text-slate-900 text-base">
              {editingAccount ? 'Editar Conta Bancária' : 'Nova Conta Bancária'}
            </h3>

            <form onSubmit={handleSaveAccount} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome da Conta</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Nubank Principal, Carteira..."
                  value={accName}
                  onChange={(e) => setAccName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tipo de Conta</label>
                <select
                  value={accType}
                  onChange={(e) => setAccType(e.target.value as AccountType)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                >
                  <option value="checking">Conta Corrente</option>
                  <option value="digital">Conta Digital</option>
                  <option value="savings">Conta Poupança</option>
                  <option value="wallet">Carteira Física</option>
                  <option value="other">Outra</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Instituição</label>
                <input
                  type="text"
                  placeholder="Ex: Nubank, Itaú, Inter..."
                  value={accInstitution}
                  onChange={(e) => setAccInstitution(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Saldo Atual (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={accBalance}
                  onChange={(e) => setAccBalance(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAccountModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                >
                  Salvar Conta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Card Modal */}
      {isCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setIsCardModalOpen(false)} />
          <div className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-100 max-w-sm w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto pb-[max(1rem,env(safe-area-inset-bottom))] animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 duration-200">
            {/* Mobile Grab Handle */}
            <div className="sm:hidden w-10 h-1 bg-slate-300 rounded-full mx-auto -mt-1 mb-2" />

            <h3 className="font-bold text-slate-900 text-base">
              {editingCard ? 'Editar Cartão de Crédito' : 'Novo Cartão de Crédito'}
            </h3>

            <form onSubmit={handleSaveCard} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome do Cartão</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Nubank Mastercard, XP Visa Infinite..."
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Instituição Emissora</label>
                <input
                  type="text"
                  placeholder="Ex: Nubank, XP, C6..."
                  value={cardInstitution}
                  onChange={(e) => setCardInstitution(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Limite Total (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={cardLimit}
                    onChange={(e) => setCardLimit(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fatura Atual (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={cardInvoice}
                    onChange={(e) => setCardInvoice(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dia Fechamento</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={cardClosingDay}
                    onChange={(e) => setCardClosingDay(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dia Vencimento</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={cardDueDay}
                    onChange={(e) => setCardDueDay(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCardModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold"
                >
                  Salvar Cartão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
