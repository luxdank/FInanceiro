import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, TabType } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';

// Views
import { CoupleRoutineView } from './components/couple/CoupleRoutineView';
import { DashboardView } from './components/dashboard/DashboardView';
import { TransactionsView } from './components/transactions/TransactionsView';
import { BudgetsView } from './components/budgets/BudgetsView';
import { EmergencyFundView } from './components/emergency/EmergencyFundView';
import { InvestmentsView } from './components/investments/InvestmentsView';
import { GoalsView } from './components/goals/GoalsView';
import { NetWorthView } from './components/networth/NetWorthView';
import { AccountsView } from './components/accounts/AccountsView';
import { HistoryView } from './components/history/HistoryView';
import { SettingsView } from './components/settings/SettingsView';

// Modals & Drawers
import { TransactionModal } from './components/transactions/TransactionModal';
import { EmergencyDepositModal } from './components/emergency/EmergencyDepositModal';
import { AlertsDrawer } from './components/alerts/AlertsDrawer';
import { AuthModal } from './components/auth/AuthModal';
import { Transaction, TransactionType } from './types/finance';

function MainAppContent() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Modals state
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionModalType, setTransactionModalType] = useState<TransactionType>('expense');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [emergencyModalType, setEmergencyModalType] = useState<'deposit' | 'withdraw'>('deposit');

  const [isAlertsDrawerOpen, setIsAlertsDrawerOpen] = useState(false);

  const { alerts, coupleConfig, updateCoupleConfig } = useFinance();
  const isSimple = coupleConfig.appMode === 'couple_simple';

  const handleOpenNewTransaction = (type: TransactionType = 'expense') => {
    setEditingTransaction(null);
    setTransactionModalType(type);
    setIsTransactionModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setTransactionModalType(tx.type);
    setIsTransactionModalOpen(true);
  };

  const handleOpenEmergencyDeposit = () => {
    setEmergencyModalType('deposit');
    setIsEmergencyModalOpen(true);
  };

  const handleOpenEmergencyWithdraw = () => {
    setEmergencyModalType('withdraw');
    setIsEmergencyModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Top Navigation */}
      <Navbar
        onOpenNewTransaction={() => handleOpenNewTransaction('expense')}
        onOpenAlerts={() => setIsAlertsDrawerOpen(true)}
        unreadAlertsCount={alerts.length}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Viewport content */}
        <main className="flex-1 w-full p-3 sm:p-6 lg:p-8 pb-36 sm:pb-36 md:pb-8 max-w-full overflow-x-hidden min-h-[calc(100vh-61px)]">
          {(activeTab === 'couple' || (activeTab === 'dashboard' && isSimple)) && (
            <CoupleRoutineView
              onOpenAdvancedMode={() => updateCoupleConfig({ appMode: 'advanced' })}
              onEditTransaction={handleEditTransaction}
            />
          )}

          {activeTab === 'dashboard' && !isSimple && (
            <DashboardView
              onNavigate={setActiveTab}
              onOpenNewTransaction={() => handleOpenNewTransaction('expense')}
            />
          )}

          {activeTab === 'lancamentos' && (
            <TransactionsView
              onOpenNewTransaction={handleOpenNewTransaction}
              onEditTransaction={handleEditTransaction}
            />
          )}

          {activeTab === 'orcamento' && <BudgetsView />}

          {activeTab === 'reserva' && (
            <EmergencyFundView
              onOpenDepositModal={handleOpenEmergencyDeposit}
              onOpenWithdrawModal={handleOpenEmergencyWithdraw}
            />
          )}

          {activeTab === 'investimentos' && <InvestmentsView />}

          {activeTab === 'metas' && <GoalsView />}

          {activeTab === 'patrimonio' && <NetWorthView />}

          {activeTab === 'contas' && <AccountsView />}

          {activeTab === 'historico' && (
            <HistoryView onEditTransaction={handleEditTransaction} />
          )}

          {activeTab === 'configuracoes' && <SettingsView />}
        </main>
      </div>

      {/* Mobile Bottom Navigation & Floating Action Button */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewTransaction={() => handleOpenNewTransaction('expense')}
      />

      {/* Global Modals & Drawers */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => {
          setIsTransactionModalOpen(false);
          setEditingTransaction(null);
        }}
        initialType={transactionModalType}
        editingTransaction={editingTransaction}
      />

      <EmergencyDepositModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        type={emergencyModalType}
      />

      <AlertsDrawer
        isOpen={isAlertsDrawerOpen}
        onClose={() => setIsAlertsDrawerOpen(false)}
        onNavigate={setActiveTab}
      />

      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <FinanceProvider>
        <MainAppContent />
      </FinanceProvider>
    </AuthProvider>
  );
}
