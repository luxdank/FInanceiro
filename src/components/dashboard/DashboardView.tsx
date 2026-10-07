import React from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  ShieldCheck,
  Landmark,
  ArrowRight,
  AlertTriangle,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { StatCard } from './StatCard';
import { IncomeExpenseChart } from '../charts/IncomeExpenseChart';
import { BalanceExpenseEvolutionChart } from '../charts/BalanceExpenseEvolutionChart';
import { CategoryDonutChart } from '../charts/CategoryDonutChart';
import { EmergencyEvolutionChart } from '../charts/EmergencyEvolutionChart';
import { NetWorthLineChart } from '../charts/NetWorthLineChart';
import { InvestmentAssetChart } from '../charts/InvestmentAssetChart';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { TabType } from '../layout/Sidebar';

interface DashboardViewProps {
  onNavigate: (tab: TabType) => void;
  onOpenNewTransaction: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onOpenNewTransaction }) => {
  const {
    summary,
    monthlyChartData,
    categoryExpenses,
    investmentsByClass,
    transactions,
    budgets,
    alerts,
  } = useFinance();

  // Calculate overall monthly budget usage
  const totalBudgeted = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
  const totalSpentOnBudgetCategories = categoryExpenses.reduce((sum, cat) => {
    const isBudgeted = budgets.some((b) => b.categoryId === cat.categoryId);
    return isBudgeted ? sum + cat.total : sum;
  }, 0);
  const budgetUsagePercent = totalBudgeted > 0 ? (totalSpentOnBudgetCategories / totalBudgeted) * 100 : 0;

  // Recent 5 transactions
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner / Overview Status */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-2xl p-5 sm:p-6 text-white shadow-lg shadow-blue-500/15 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
              Painel Financeiro
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-400/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Banco de Dados Firebase Ativo
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Visão Geral das suas Finanças
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
            Acompanhe despesas domésticas, reserva de emergência e investimentos sincronizados em tempo real na nuvem.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <button
            onClick={() => onNavigate('reserva')}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-xs text-xs font-semibold text-white border border-white/20 transition-all cursor-pointer text-center"
          >
            Reserva
          </button>
          <button
            onClick={onOpenNewTransaction}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold shadow-md shadow-blue-900/20 transition-all cursor-pointer text-center"
          >
            + Novo Lançamento
          </button>
        </div>
      </div>

      {/* Intuitive Zero-State Onboarding Banner when no transactions */}
      {transactions.length === 0 && (
        <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              Comece agora seu controle financeiro
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Passos rápidos</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Seus dados estão prontos e zerados no Firebase. Adicione sua primeira movimentação em poucos segundos:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <button
              onClick={() => onOpenNewTransaction()}
              className="p-3 rounded-xl border border-rose-100 bg-rose-50/50 hover:bg-rose-50 text-left transition-all cursor-pointer"
            >
              <ArrowDownLeft className="w-4 h-4 text-rose-600 mb-1" />
              <span className="font-bold text-slate-900 text-xs block">1. Registrar Despesa</span>
              <span className="text-[10px] text-slate-500">Aluguel, mercado, contas</span>
            </button>
            <button
              onClick={() => onOpenNewTransaction()}
              className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 text-left transition-all cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4 text-emerald-600 mb-1" />
              <span className="font-bold text-slate-900 text-xs block">2. Registrar Receita</span>
              <span className="text-[10px] text-slate-500">Salário, freelances</span>
            </button>
            <button
              onClick={() => onNavigate('reserva')}
              className="p-3 rounded-xl border border-teal-100 bg-teal-50/50 hover:bg-teal-50 text-left transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-teal-600 mb-1" />
              <span className="font-bold text-slate-900 text-xs block">3. Definir Reserva</span>
              <span className="text-[10px] text-slate-500">Meta para 6 meses</span>
            </button>
            <button
              onClick={() => onNavigate('contas')}
              className="p-3 rounded-xl border border-blue-100 bg-blue-50/50 hover:bg-blue-50 text-left transition-all cursor-pointer"
            >
              <Wallet className="w-4 h-4 text-blue-600 mb-1" />
              <span className="font-bold text-slate-900 text-xs block">4. Contas & Cartões</span>
              <span className="text-[10px] text-slate-500">Saldos e faturas</span>
            </button>
          </div>
        </div>
      )}

      {/* Financial Health & Alerts Highlights (if any critical alert) */}
      {alerts.length > 0 && (
        <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-4 flex items-start gap-3 shadow-2xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <span className="font-bold text-amber-900 block">{alerts[0].title}</span>
            <span className="text-amber-800 leading-relaxed">{alerts[0].message}</span>
          </div>
          {alerts[0].linkTab && (
            <button
              onClick={() => onNavigate(alerts[0].linkTab as TabType)}
              className="text-xs font-bold text-amber-900 underline hover:text-amber-950 shrink-0 cursor-pointer"
            >
              Ver detalhes
            </button>
          )}
        </div>
      )}

      {/* 1. TOP CARDS (6 Indicators) */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
        {/* 1. Saldo Disponível */}
        <StatCard
          title="Saldo Disponível"
          value={summary.availableBalance}
          subtitle="Soma em contas correntes e carteiras"
          icon={<Wallet className="w-5 h-5" />}
          iconBgColor="bg-blue-50 text-blue-600"
          onClick={() => onNavigate('contas')}
        />

        {/* 2. Receitas do Mês */}
        <StatCard
          title="Receitas do Período"
          value={summary.monthIncome}
          prevValue={summary.prevMonthIncome}
          changePercent={summary.incomeChangePercent}
          icon={<ArrowUpRight className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 text-emerald-600"
          type="positive_good"
          onClick={() => onNavigate('lancamentos')}
        />

        {/* 3. Despesas do Mês */}
        <StatCard
          title="Despesas do Período"
          value={summary.monthExpense}
          prevValue={summary.prevMonthExpense}
          changePercent={summary.expenseChangePercent}
          icon={<ArrowDownLeft className="w-5 h-5" />}
          iconBgColor="bg-rose-50 text-rose-600"
          type="negative_good"
          onClick={() => onNavigate('lancamentos')}
        />

        {/* 4. Valor Investido */}
        <StatCard
          title="Valor Investido"
          value={summary.investmentsCurrentValue}
          prevValue={summary.investedTotal}
          changePercent={summary.investmentsGainPercent}
          subtitle={`Rentabilidade: +${formatCurrency(summary.investmentsGainAmount)}`}
          icon={<TrendingUp className="w-5 h-5" />}
          iconBgColor="bg-purple-50 text-purple-600"
          type="positive_good"
          onClick={() => onNavigate('investimentos')}
        />

        {/* 5. Reserva de Emergência */}
        <StatCard
          title="Reserva de Emergência"
          value={summary.emergencyFundBalance}
          subtitle={`${summary.emergencyProgressPercent.toFixed(1)}% da meta (${summary.emergencyMonthsCovered.toFixed(1)} meses)`}
          icon={<ShieldCheck className="w-5 h-5" />}
          iconBgColor="bg-teal-50 text-teal-600"
          onClick={() => onNavigate('reserva')}
        />

        {/* 6. Patrimônio Total */}
        <StatCard
          title="Patrimônio Total"
          value={summary.netWorth}
          prevValue={summary.prevMonthNetWorth}
          changePercent={summary.netWorthChangePercent}
          subtitle="Disponível + Reserva + Investimentos - Dívidas"
          icon={<Landmark className="w-5 h-5" />}
          iconBgColor="bg-indigo-50 text-indigo-600"
          type="positive_good"
          onClick={() => onNavigate('patrimonio')}
        />
      </div>

      {/* Monthly Budget Quick Tracker Bar */}
      {totalBudgeted > 0 && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
            <div>
              <span className="text-xs font-bold text-slate-900">
                Orçamento Mensal de Consumo
              </span>
              <p className="text-xs text-slate-500">
                Você já utilizou{' '}
                <strong className={budgetUsagePercent > 100 ? 'text-rose-600' : 'text-slate-800'}>
                  {budgetUsagePercent.toFixed(1)}%
                </strong>{' '}
                do teto total estipulado ({formatCurrency(totalSpentOnBudgetCategories)} de{' '}
                {formatCurrency(totalBudgeted)}).
              </p>
            </div>
            <button
              onClick={() => onNavigate('orcamento')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <span>Gerenciar Orçamento</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                budgetUsagePercent > 100
                  ? 'bg-rose-500'
                  : budgetUsagePercent > 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, budgetUsagePercent)}%` }}
            />
          </div>
        </div>
      )}

      {/* 2. EVOLUÇÃO SALDO ACUMULADO X DESPESAS (RECHARTS) */}
      <BalanceExpenseEvolutionChart data={monthlyChartData} />

      {/* 3. CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receitas x Despesas por Mês */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Receitas x Despesas</h3>
              <p className="text-xs text-slate-500">Comparativo histórico de fluxo de caixa</p>
            </div>
            <button
              onClick={() => onNavigate('lancamentos')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              Ver Extrato
            </button>
          </div>
          <IncomeExpenseChart data={monthlyChartData} />
        </div>

        {/* Despesas por Categoria */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Despesas por Categoria</h3>
              <p className="text-xs text-slate-500">Distribuição percentual dos gastos no período</p>
            </div>
            <button
              onClick={() => onNavigate('orcamento')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              Ajustar Tetos
            </button>
          </div>
          <CategoryDonutChart data={categoryExpenses} />
        </div>
      </div>

      {/* 3. EVOLUTION CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução da Reserva de Emergência */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Evolução da Reserva</h3>
              <p className="text-xs text-slate-500">
                Progresso em direção à meta de segurança ({formatCurrency(summary.emergencyTarget)})
              </p>
            </div>
            <button
              onClick={() => onNavigate('reserva')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              Ver Reserva
            </button>
          </div>
          <EmergencyEvolutionChart
            data={monthlyChartData}
            targetAmount={summary.emergencyTarget}
          />
        </div>

        {/* Evolução do Patrimônio */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Evolução do Patrimônio</h3>
              <p className="text-xs text-slate-500">
                Crescimento líquido (Contas + Reserva + Investimentos - Dívidas)
              </p>
            </div>
            <button
              onClick={() => onNavigate('patrimonio')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              Detalhar Ativos
            </button>
          </div>
          <NetWorthLineChart data={monthlyChartData} />
        </div>
      </div>

      {/* 4. INVESTMENTS ASSET DISTRIBUTION & RECENT TRANSACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição dos Investimentos */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Carteira de Investimentos</h3>
              <p className="text-xs text-slate-500">Distribuição por classe de ativo</p>
            </div>
            <button
              onClick={() => onNavigate('investimentos')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              Ver Carteira
            </button>
          </div>
          <InvestmentAssetChart data={investmentsByClass} />
        </div>

        {/* Últimos Lançamentos */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Últimos Lançamentos</h3>
                <p className="text-xs text-slate-500">Movimentações recentes registradas</p>
              </div>
              <button
                onClick={() => onNavigate('lancamentos')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Ver Todos</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {recentTransactions.map((tx) => {
                const isInc = tx.type === 'income';
                const isExp = tx.type === 'expense';
                const isInv = tx.type === 'investment_deposit';
                const isEmg = tx.type === 'emergency_deposit';

                return (
                  <div key={tx.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 truncate">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isInc
                            ? 'bg-emerald-50 text-emerald-600'
                            : isExp
                            ? 'bg-rose-50 text-rose-600'
                            : isInv
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-indigo-50 text-indigo-600'
                        }`}
                      >
                        {isInc ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : isExp ? (
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                        ) : isInv ? (
                          <TrendingUp className="w-3.5 h-3.5" />
                        ) : (
                          <ShieldCheck className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="truncate">
                        <span className="font-semibold text-slate-800 block truncate">
                          {tx.description}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {formatDate(tx.date)}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`font-bold ${
                          isInc
                            ? 'text-emerald-600'
                            : isExp
                            ? 'text-rose-600'
                            : 'text-slate-800'
                        }`}
                      >
                        {isInc ? '+' : isExp ? '-' : ''}
                        {formatCurrency(tx.amount)}
                      </span>
                      {tx.expenseType && (
                        <span className="block text-[10px] text-slate-400">
                          {tx.expenseType === 'fixed' ? 'Fixa' : 'Variável'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={onOpenNewTransaction}
            className="w-full mt-4 py-2 border border-dashed border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-colors cursor-pointer"
          >
            + Adicionar Nova Transação
          </button>
        </div>
      </div>
    </div>
  );
};
