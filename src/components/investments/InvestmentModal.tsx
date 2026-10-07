import React, { useState, useEffect } from 'react';
import { X, TrendingUp } from 'lucide-react';
import { Investment, AssetClass } from '../../types/finance';
import { useFinance } from '../../context/FinanceContext';
import { getTodayString } from '../../utils/formatters';

interface InvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingInvestment?: Investment | null;
}

export const InvestmentModal: React.FC<InvestmentModalProps> = ({
  isOpen,
  onClose,
  editingInvestment = null,
}) => {
  const { addInvestment, updateInvestment } = useFinance();

  const [name, setName] = useState('');
  const [assetClass, setAssetClass] = useState<AssetClass>('CDB');
  const [institution, setInstitution] = useState('');
  const [investedAmountStr, setInvestedAmountStr] = useState('');
  const [currentValueStr, setCurrentValueStr] = useState('');
  const [startDate, setStartDate] = useState(getTodayString());
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (editingInvestment) {
      setName(editingInvestment.name);
      setAssetClass(editingInvestment.assetClass);
      setInstitution(editingInvestment.institution);
      setInvestedAmountStr(String(editingInvestment.investedAmount));
      setCurrentValueStr(String(editingInvestment.currentValue));
      setStartDate(editingInvestment.startDate);
      setNotes(editingInvestment.notes || '');
    } else {
      setName('');
      setAssetClass('CDB');
      setInstitution('');
      setInvestedAmountStr('');
      setCurrentValueStr('');
      setStartDate(getTodayString());
      setNotes('');
    }
    setErrorMessage(null);
  }, [isOpen, editingInvestment]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const invested = parseFloat(investedAmountStr.replace(',', '.'));
    const current = currentValueStr ? parseFloat(currentValueStr.replace(',', '.')) : invested;

    if (isNaN(invested) || invested <= 0) {
      setErrorMessage('Informe um valor investido válido maior que zero.');
      return;
    }

    if (editingInvestment) {
      updateInvestment(editingInvestment.id, {
        name,
        assetClass,
        institution,
        investedAmount: invested,
        currentValue: isNaN(current) ? invested : current,
        startDate,
        notes,
      });
    } else {
      addInvestment({
        name,
        assetClass,
        institution: institution || 'Corretora',
        investedAmount: invested,
        currentValue: isNaN(current) ? invested : current,
        startDate,
        notes,
      });
    }

    onClose();
  };

  const assetClasses: AssetClass[] = [
    'Tesouro Direto',
    'CDB',
    'LCI/LCA',
    'Fundos',
    'Ações',
    'ETFs',
    'FIIs',
    'Criptomoedas',
    'Outros',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] pb-[max(0.5rem,env(safe-area-inset-bottom))] animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 duration-200">
        {/* Mobile Grab Handle */}
        <div className="sm:hidden w-10 h-1 bg-slate-300 rounded-full mx-auto mt-2.5 mb-1" />

        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600 shrink-0" />
            <h3 className="font-bold text-slate-800 text-base sm:text-lg">
              {editingInvestment ? 'Editar Investimento' : 'Novo Investimento'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mx-4 sm:mx-6 mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-3.5 sm:space-y-4 text-xs sm:text-sm flex-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nome do Ativo <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Tesouro Selic 2029, CDB 110% Sofisa, HGLG11..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Classe de Ativo <span className="text-rose-500">*</span>
              </label>
              <select
                value={assetClass}
                onChange={(e) => setAssetClass(e.target.value as AssetClass)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
              >
                {assetClasses.map((ac) => (
                  <option key={ac} value={ac}>
                    {ac}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Instituição / Corretora <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex: XP, Nubank, Inter, BTG..."
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Valor Total Investido (R$) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0,00"
                value={investedAmountStr}
                onChange={(e) => setInvestedAmountStr(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Valor Atual de Mercado (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Se vazio, igual ao investido"
                value={currentValueStr}
                onChange={(e) => setCurrentValueStr(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Data do Aporte Inicial
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Observações / Tese (Opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Vencimento 2029, dividendos mensais, isento de IR..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 text-xs resize-none"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20"
            >
              {editingInvestment ? 'Salvar Alterações' : 'Cadastrar Investimento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
