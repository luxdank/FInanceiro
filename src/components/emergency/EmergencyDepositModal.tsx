import React, { useState } from 'react';
import { X, ShieldCheck, ArrowDownLeft, ArrowUpRight, Wallet } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { getTodayString } from '../../utils/formatters';

interface EmergencyDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: 'deposit' | 'withdraw';
}

export const EmergencyDepositModal: React.FC<EmergencyDepositModalProps> = ({
  isOpen,
  onClose,
  type = 'deposit',
}) => {
  const { accounts, depositEmergencyFund, withdrawEmergencyFund } = useFinance();

  const [mode, setMode] = useState<'deposit' | 'withdraw'>(type);
  const [amountStr, setAmountStr] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const val = parseFloat(amountStr.replace(',', '.'));
    if (isNaN(val) || val <= 0) {
      setErrorMsg('Informe um valor válido maior que zero.');
      return;
    }

    if (mode === 'deposit') {
      depositEmergencyFund(val, date, notes, accountId || undefined);
    } else {
      withdrawEmergencyFund(val, date, notes, accountId || undefined);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden flex flex-col max-h-[90vh] pb-[max(0.5rem,env(safe-area-inset-bottom))] animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 duration-200">
        {/* Mobile Grab Handle */}
        <div className="sm:hidden w-10 h-1 bg-slate-300 rounded-full mx-auto mt-2.5 mb-1" />

        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0" />
            <h3 className="font-bold text-slate-800 text-sm sm:text-base truncate">
              {mode === 'deposit' ? 'Aporte na Reserva de Emergência' : 'Retirada da Reserva'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error banner */}
        {errorMsg && (
          <div className="mx-4 sm:mx-6 mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Toggle Mode */}
        <div className="grid grid-cols-2 gap-1 p-1 sm:p-1.5 bg-slate-100/80 mx-3 sm:mx-6 mt-3 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode('deposit')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all ${
              mode === 'deposit'
                ? 'bg-white text-teal-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-teal-500 shrink-0" />
            <span className="truncate">Adicionar Aporte</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('withdraw')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all ${
              mode === 'withdraw'
                ? 'bg-white text-rose-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="truncate">Registrar Retirada</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-3.5 sm:space-y-4 text-xs flex-1">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
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
                autoFocus
                placeholder="0,00"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-bold text-lg text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Data</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {mode === 'deposit' ? 'Conta de Origem' : 'Conta de Destino'}
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {mode === 'deposit' ? 'Motivo / Observação' : 'Motivo da Urgência'}
            </label>
            <textarea
              rows={2}
              placeholder={
                mode === 'deposit'
                  ? 'Ex: Aporte mensal planejado, bônus recebido...'
                  : 'Ex: Manutenção emergencial do carro, tratamento de saúde...'
              }
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-xl text-white font-bold shadow-md ${
                mode === 'deposit'
                  ? 'bg-teal-600 hover:bg-teal-700 shadow-teal-500/20'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
              }`}
            >
              Confirmar {mode === 'deposit' ? 'Aporte' : 'Retirada'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
