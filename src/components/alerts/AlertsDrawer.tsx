import React from 'react';
import {
  X,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  ArrowRight,
  Bell,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { TabType } from '../layout/Sidebar';

interface AlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: TabType) => void;
}

export const AlertsDrawer: React.FC<AlertsDrawerProps> = ({ isOpen, onClose, onNavigate }) => {
  const { alerts } = useFinance();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Alertas & Notificações</h3>
              <span className="text-[11px] text-slate-400">
                {alerts.length} avisos ativos
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alerts List */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1 text-xs">
          {alerts.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="font-semibold text-slate-700">Tudo sob controle!</p>
              <p className="text-[11px] text-slate-400">
                Nenhum alerta pendente no momento. Suas finanças estão dentro dos limites.
              </p>
            </div>
          ) : (
            alerts.map((alt) => {
              const isDanger = alt.type === 'danger';
              const isWarning = alt.type === 'warning';
              const isSuccess = alt.type === 'success';

              return (
                <div
                  key={alt.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isDanger
                      ? 'bg-rose-50/60 border-rose-200 text-rose-900'
                      : isWarning
                      ? 'bg-amber-50/60 border-amber-200 text-amber-900'
                      : isSuccess
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                      : 'bg-blue-50/60 border-blue-200 text-blue-900'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                      {isDanger ? (
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                      ) : isWarning ? (
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                      ) : isSuccess ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Info className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <span className="font-bold block">{alt.title}</span>
                      <p className="leading-relaxed opacity-90">{alt.message}</p>
                      {alt.linkTab && (
                        <button
                          onClick={() => {
                            onNavigate(alt.linkTab as TabType);
                            onClose();
                          }}
                          className="pt-1.5 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          <span>Acessar área</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
