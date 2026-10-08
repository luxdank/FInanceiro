import React, { useState } from 'react';
import {
  Bell,
  Plus,
  Calendar,
  ChevronDown,
  User,
  LogOut,
  SlidersHorizontal,
  Cloud,
  Heart,
  Smartphone,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { PeriodFilter } from '../../types/finance';

interface NavbarProps {
  onOpenNewTransaction: () => void;
  onOpenAlerts: () => void;
  unreadAlertsCount: number;
  onOpenSyncDevices?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewTransaction,
  onOpenAlerts,
  unreadAlertsCount,
  onOpenSyncDevices,
}) => {
  const {
    period,
    setPeriod,
    customDateRange,
    setCustomDateRange,
    lastSyncTime,
    coupleConfig,
    updateCoupleConfig,
    syncCode,
  } = useFinance();
  const { user, logout, openAuthModal, firebaseUser } = useAuth();
  const isSimple = coupleConfig.appMode === 'couple_simple';

  const [isPeriodMenuOpen, setIsPeriodMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [tempStart, setTempStart] = useState(customDateRange.start);
  const [tempEnd, setTempEnd] = useState(customDateRange.end);

  const periodLabels: Record<PeriodFilter, string> = {
    current_month: 'Este mês',
    last_3_months: 'Últimos 3 meses',
    last_6_months: 'Últimos 6 meses',
    this_year: 'Este ano',
    custom: 'Personalizado',
  };

  const handleSelectPeriod = (p: PeriodFilter) => {
    if (p === 'custom') {
      setShowCustomModal(true);
    } else {
      setPeriod(p);
    }
    setIsPeriodMenuOpen(false);
  };

  const handleApplyCustomDate = () => {
    setCustomDateRange({ start: tempStart, end: tempEnd });
    setPeriod('custom');
    setShowCustomModal(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3.5 sm:px-6 lg:px-8 py-2.5 sm:py-3 transition-all">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Brand Logo & Title on Mobile / Left branding */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md transition-all ${
                isSimple
                  ? 'bg-gradient-to-tr from-rose-600 to-pink-500 shadow-pink-500/25'
                  : 'bg-gradient-to-tr from-blue-700 to-blue-500 shadow-blue-500/25'
              }`}
            >
              {isSimple ? (
                <Heart className="w-5 h-5 fill-white" />
              ) : (
                <span className="font-extrabold text-lg tracking-tighter">F</span>
              )}
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-slate-900 text-lg tracking-tight">
                {isSimple ? 'Finanza Casal' : 'Finanza'}
              </span>
              <span
                className={`text-[10px] font-semibold block -mt-1 uppercase tracking-wider ${
                  isSimple ? 'text-pink-600' : 'text-blue-600'
                }`}
              >
                {isSimple
                  ? `${coupleConfig.partner1Name} & ${coupleConfig.partner2Name}`
                  : 'Gestão Pessoal'}
              </span>
            </div>
          </div>
        </div>

        {/* Center Section: Mode Switcher & Period Selector */}
        <div className="flex items-center gap-2">
          {/* Quick Mode Toggle Pill */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/60">
            <button
              type="button"
              onClick={() => updateCoupleConfig({ appMode: 'couple_simple' })}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                isSimple
                  ? 'bg-white text-pink-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Heart className={`w-3 h-3 ${isSimple ? 'fill-pink-600 text-pink-600' : ''}`} />
              <span className="hidden xs:inline">Modo</span> Casal
            </button>
            <button
              type="button"
              onClick={() => updateCoupleConfig({ appMode: 'advanced' })}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                !isSimple
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span className="hidden xs:inline">Modo</span> Avançado
            </button>
          </div>

          {/* Period Selector (shown in advanced mode or when expanded) */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setIsPeriodMenuOpen(!isPeriodMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>{periodLabels[period]}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isPeriodMenuOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-0 mt-1.5 w-48 bg-white border border-slate-100 rounded-xl shadow-xl py-1 z-40 text-xs animate-in fade-in zoom-in-95 duration-150">
                {(['current_month', 'last_3_months', 'last_6_months', 'this_year', 'custom'] as PeriodFilter[]).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => handleSelectPeriod(p)}
                      className={`w-full text-left px-3.5 py-2 font-medium hover:bg-blue-50 transition-colors flex items-center justify-between ${
                        period === p ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-slate-700'
                      }`}
                    >
                      {periodLabels[p]}
                      {period === p && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Firebase Status + Quick Add + Notification Bell + User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Real-time PC & Mobile Sync Button (Visible on mobile & desktop) */}
          <button
            onClick={onOpenSyncDevices}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border border-emerald-200/90 text-emerald-800 text-[11px] font-bold shadow-2xs transition-all cursor-pointer"
            title={`Sincronização Ativa (Chave: ${syncCode}). Clique para abrir QR Code ou link para celular.`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <Smartphone className="w-3.5 h-3.5 text-emerald-700 hidden xs:inline" />
            <span>Sincronizar Celular</span>
            <span className="font-mono text-[10px] bg-emerald-200/70 px-1 rounded text-emerald-900 hidden md:inline">
              {syncCode}
            </span>
          </button>

          {/* Quick New Transaction Button (Desktop / Tablet - mobile uses FAB) */}
          <button
            onClick={onOpenNewTransaction}
            className="hidden sm:flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Lançamento</span>
          </button>

          {/* Alerts Bell */}
          <button
            onClick={onOpenAlerts}
            className="relative p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Alertas Financeiros"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* User Profile */}
          <div className="relative">
            {user ? (
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-blue-200 transition-all cursor-pointer"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                    {user.name.charAt(0)}
                  </div>
                )}
              </button>
            ) : (
              <button
                onClick={openAuthModal}
                className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Entrar</span>
              </button>
            )}

            {/* User Dropdown */}
            {isUserMenuOpen && user && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-100 rounded-xl shadow-xl py-2 z-40 text-xs animate-in fade-in duration-150">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="font-bold text-slate-800 truncate">{user.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    openAuthModal();
                  }}
                  className="w-full text-left px-4 py-2 text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                  <span>Trocar Perfil / Entrar</span>
                </button>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Encerrar Sessão</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Date Range Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 shadow-2xl border border-slate-100 max-w-sm w-full space-y-4">
            <h4 className="font-bold text-slate-900 text-sm">Filtrar Período Personalizado</h4>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Data Inicial</label>
                <input
                  type="date"
                  value={tempStart}
                  onChange={(e) => setTempStart(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Data Final</label>
                <input
                  type="date"
                  value={tempEnd}
                  onChange={(e) => setTempEnd(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCustomModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleApplyCustomDate}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
