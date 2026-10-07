import React, { useState } from 'react';
import {
  Heart,
  LayoutDashboard,
  ArrowUpDown,
  ShieldCheck,
  TrendingUp,
  Menu,
  Plus,
  PieChart,
  Target,
  Landmark,
  CreditCard,
  History,
  Settings,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { TabType } from './Sidebar';
import { useFinance } from '../../context/FinanceContext';

interface MobileNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenNewTransaction: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewTransaction,
}) => {
  const { coupleConfig, updateCoupleConfig } = useFinance();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const isSimple = coupleConfig.appMode === 'couple_simple';

  // Navigation when in simple/couple mode
  const simpleMainItems = [
    { id: 'couple', label: 'Casal', icon: Heart },
    { id: 'lancamentos', label: 'Extrato', icon: ArrowUpDown },
    { id: 'configuracoes', label: 'Ajustes', icon: Settings },
  ];

  // Navigation when in advanced mode
  const advancedMainItems = [
    { id: 'couple', label: 'Casal', icon: Heart },
    { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
    { id: 'lancamentos', label: 'Extrato', icon: ArrowUpDown },
    { id: 'investimentos', label: 'Investir', icon: TrendingUp },
  ];

  const mainItems = isSimple ? simpleMainItems : advancedMainItems;

  const moreItems = [
    { id: 'dashboard', label: 'Painel Geral & Métricas', icon: LayoutDashboard },
    { id: 'orcamento', label: 'Orçamento', icon: PieChart },
    { id: 'reserva', label: 'Reserva de Emergência', icon: ShieldCheck },
    { id: 'investimentos', label: 'Investimentos', icon: TrendingUp },
    { id: 'metas', label: 'Metas', icon: Target },
    { id: 'patrimonio', label: 'Patrimônio', icon: Landmark },
    { id: 'contas', label: 'Contas & Cartões', icon: CreditCard },
    { id: 'historico', label: 'Histórico Geral', icon: History },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  return (
    <>
      {/* Floating Action Button (FAB) on mobile */}
      <button
        onClick={onOpenNewTransaction}
        className={`md:hidden fixed bottom-[74px] right-4 z-40 w-14 h-14 rounded-2xl text-white shadow-xl flex items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer border border-white/25 focus:outline-none ${
          isSimple
            ? 'bg-gradient-to-tr from-rose-600 via-pink-600 to-indigo-600 shadow-pink-600/40'
            : 'bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 shadow-blue-600/40'
        }`}
        aria-label="Novo lançamento"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Bottom Navigation Bar with Safe Area */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-lg">
        {mainItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            activeTab === item.id ||
            (item.id === 'couple' && (activeTab === 'dashboard' || activeTab === 'couple') && isSimple);

          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as TabType);
                setIsMoreMenuOpen(false);
              }}
              className={`flex-1 min-h-[48px] flex flex-col items-center justify-center py-1 px-0.5 rounded-xl text-[10px] font-semibold transition-all duration-150 active:scale-95 cursor-pointer relative ${
                isActive
                  ? isSimple && item.id === 'couple'
                    ? 'text-pink-600 font-bold'
                    : 'text-blue-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-colors ${
                  isActive
                    ? isSimple && item.id === 'couple'
                      ? 'bg-pink-50 text-pink-600'
                      : 'bg-blue-50 text-blue-600'
                    : 'text-slate-500'
                }`}
              >
                <Icon className={`w-5 h-5 ${item.id === 'couple' && isActive ? 'fill-pink-500' : ''}`} />
              </div>
              <span className="truncate mt-0.5">{item.label}</span>
              {isActive && (
                <span
                  className={`w-1.5 h-1.5 rounded-full absolute bottom-0.5 ${
                    isSimple && item.id === 'couple' ? 'bg-pink-600' : 'bg-blue-600'
                  }`}
                />
              )}
            </button>
          );
        })}

        {/* Toggle Mode Button or More Menu Button */}
        {isSimple ? (
          <button
            onClick={() => updateCoupleConfig({ appMode: 'advanced' })}
            className="flex-1 min-h-[48px] flex flex-col items-center justify-center py-1 px-0.5 rounded-xl text-[10px] font-semibold text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
          >
            <div className="p-1 rounded-xl text-slate-500 hover:bg-slate-100">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <span className="truncate mt-0.5">Avançado</span>
          </button>
        ) : (
          <button
            onClick={() => setIsMoreMenuOpen(true)}
            className="flex-1 min-h-[48px] flex flex-col items-center justify-center py-1 px-0.5 rounded-xl text-[10px] font-semibold text-slate-500 hover:text-slate-800 transition-all cursor-pointer relative"
          >
            <div className="p-1 rounded-xl text-slate-500 hover:bg-slate-100">
              <Menu className="w-5 h-5" />
            </div>
            <span className="truncate mt-0.5">Mais</span>
          </button>
        )}
      </nav>

      {/* "Mais" Slide-up Drawer */}
      {isMoreMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex flex-col justify-end transition-opacity duration-200">
          <div
            className="fixed inset-0"
            onClick={() => setIsMoreMenuOpen(false)}
          />
          <div className="relative bg-white rounded-t-3xl p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200 border-t border-slate-100">
            {/* Grab Handle */}
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto -mt-1 mb-2" />

            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-800 text-sm">Mais Funcionalidades</span>
              <button
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Switch back to Simple Mode inside Drawer */}
            <div className="p-3 bg-pink-50 border border-pink-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-pink-900 block">Modo Rotina do Casal</span>
                <span className="text-[11px] text-pink-700">Interface rápida e simplificada</span>
              </div>
              <button
                onClick={() => {
                  updateCoupleConfig({ appMode: 'couple_simple' });
                  setActiveTab('couple');
                  setIsMoreMenuOpen(false);
                }}
                className="px-3 py-1.5 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Ativar
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as TabType);
                      setIsMoreMenuOpen(false);
                    }}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
                      isActive
                        ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold shadow-xs'
                        : 'border-slate-100 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
