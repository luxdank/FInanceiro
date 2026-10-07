import React from 'react';
import {
  Heart,
  LayoutDashboard,
  ArrowUpDown,
  PieChart,
  ShieldCheck,
  TrendingUp,
  Target,
  Landmark,
  CreditCard,
  History,
  Settings,
  SlidersHorizontal,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';

export type TabType =
  | 'couple'
  | 'dashboard'
  | 'lancamentos'
  | 'orcamento'
  | 'reserva'
  | 'investimentos'
  | 'metas'
  | 'patrimonio'
  | 'contas'
  | 'historico'
  | 'configuracoes';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { summary, coupleConfig, updateCoupleConfig } = useFinance();
  const isSimple = coupleConfig.appMode === 'couple_simple';

  // Navigation items when in Simple/Couple mode
  const simpleNavItems: NavItem[] = [
    { id: 'couple', label: `Rotina de ${coupleConfig.partner1Name} & ${coupleConfig.partner2Name}`, icon: Heart, badge: 'Simples' },
    { id: 'lancamentos', label: 'Extrato de Lançamentos', icon: ArrowUpDown },
    { id: 'configuracoes', label: 'Configurações & Nomes', icon: Settings },
  ];

  // Full navigation items when in Advanced mode
  const advancedNavItems: NavItem[] = [
    { id: 'couple', label: 'Rotina do Casal', icon: Heart },
    { id: 'dashboard', label: 'Painel Geral & Métricas', icon: LayoutDashboard },
    { id: 'lancamentos', label: 'Lançamentos', icon: ArrowUpDown },
    { id: 'orcamento', label: 'Orçamento', icon: PieChart },
    { id: 'reserva', label: 'Reserva de Emergência', icon: ShieldCheck },
    { id: 'investimentos', label: 'Investimentos', icon: TrendingUp },
    { id: 'metas', label: 'Metas', icon: Target },
    { id: 'patrimonio', label: 'Patrimônio', icon: Landmark },
    { id: 'contas', label: 'Contas & Cartões', icon: CreditCard },
    { id: 'historico', label: 'Histórico Geral', icon: History },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  const currentNavItems = isSimple ? simpleNavItems : advancedNavItems;

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col shrink-0 h-[calc(100vh-61px)] sticky top-[61px] hidden md:flex">
      {/* Mode Switcher Banner at top of sidebar */}
      <div className="p-3 border-b border-slate-100 bg-slate-50/70">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1.5">
          <span>Modo de Uso</span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] ${isSimple ? 'bg-pink-100 text-pink-700 font-extrabold' : 'bg-slate-200 text-slate-700'}`}>
            {isSimple ? '💑 Casal' : '📊 Avançado'}
          </span>
        </div>
        <button
          onClick={() => updateCoupleConfig({ appMode: isSimple ? 'advanced' : 'couple_simple' })}
          className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
            isSimple
              ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs'
              : 'bg-gradient-to-r from-rose-500 to-pink-600 text-white border-transparent shadow-sm'
          }`}
        >
          {isSimple ? (
            <>
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>Ver Modo Avançado</span>
            </>
          ) : (
            <>
              <Heart className="w-3.5 h-3.5 fill-white text-white" />
              <span>Voltar ao Modo Casal</span>
            </>
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="p-3.5 space-y-1 overflow-y-auto flex-1">
        {currentNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (item.id === 'couple' && activeTab === 'dashboard' && isSimple);
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as TabType)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? item.id === 'couple'
                    ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-sm shadow-pink-500/25 font-bold'
                    : 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && !isActive && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-pink-50 text-pink-600 border border-pink-100">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-3.5 border-t border-slate-100 bg-slate-50/50">
        {isSimple ? (
          <div className="p-3 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100 text-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-pink-700 mb-1">
              <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
              <span>Rotina Descomplicada</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Mantenha o foco em anotar os gastos do dia a dia de forma rápida e alinhada com seu cônjuge.
            </p>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-sm">
            <div className="flex items-center justify-between text-[11px] text-slate-300 font-medium mb-1">
              <span>Patrimônio Líquido</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                Ativo
              </span>
            </div>
            <div className="text-base font-extrabold tracking-tight text-white mb-2">
              {formatCurrency(summary.netWorth)}
            </div>
            <div className="text-[10px] text-slate-300 flex justify-between border-t border-slate-700/60 pt-1.5">
              <span>Reserva:</span>
              <span className="font-semibold text-blue-300">{formatCurrency(summary.emergencyFundBalance)}</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
