import {
  Category,
  BankAccount,
  CreditCard,
  Transaction,
  EmergencyFundConfig,
  EmergencyFundRecord,
  Investment,
  BudgetLimit,
  FinancialGoal,
  UserProfile,
} from '../types/finance';

export const INITIAL_CATEGORIES: Category[] = [
  // Income categories
  { id: 'cat-inc-1', name: 'Salário', type: 'income', icon: 'Briefcase', color: '#10b981' },
  { id: 'cat-inc-2', name: 'Freelances', type: 'income', icon: 'Laptop', color: '#06b6d4' },
  { id: 'cat-inc-3', name: 'Renda extra', type: 'income', icon: 'TrendingUp', color: '#3b82f6' },
  { id: 'cat-inc-4', name: 'Rendimentos', type: 'income', icon: 'Percent', color: '#8b5cf6' },
  { id: 'cat-inc-5', name: 'Outros (Entradas)', type: 'income', icon: 'PlusCircle', color: '#64748b' },

  // Expense categories
  { id: 'cat-exp-1', name: 'Moradia', type: 'expense', icon: 'Home', color: '#3b82f6' },
  { id: 'cat-exp-2', name: 'Alimentação', type: 'expense', icon: 'Utensils', color: '#f59e0b' },
  { id: 'cat-exp-3', name: 'Transporte', type: 'expense', icon: 'Car', color: '#0284c7' },
  { id: 'cat-exp-4', name: 'Saúde', type: 'expense', icon: 'HeartPulse', color: '#ec4899' },
  { id: 'cat-exp-5', name: 'Educação', type: 'expense', icon: 'GraduationCap', color: '#8b5cf6' },
  { id: 'cat-exp-6', name: 'Lazer', type: 'expense', icon: 'PartyPopper', color: '#f97316' },
  { id: 'cat-exp-7', name: 'Assinaturas', type: 'expense', icon: 'Tv', color: '#6366f1' },
  { id: 'cat-exp-8', name: 'Contas', type: 'expense', icon: 'Zap', color: '#eab308' },
  { id: 'cat-exp-9', name: 'Compras', type: 'expense', icon: 'ShoppingBag', color: '#14b8a6' },
  { id: 'cat-exp-10', name: 'Impostos', type: 'expense', icon: 'Receipt', color: '#ef4444' },
  { id: 'cat-exp-11', name: 'Outros (Saídas)', type: 'expense', icon: 'HelpCircle', color: '#64748b' },
];

// Clean zeroed state per user request: "Zero tudo."
export const INITIAL_ACCOUNTS: BankAccount[] = [
  {
    id: 'acc-1',
    name: 'Conta Corrente Principal',
    type: 'checking',
    institution: 'Meu Banco',
    balance: 0.0,
    color: '#2563eb',
    isDefault: true,
  },
];

export const INITIAL_CREDIT_CARDS: CreditCard[] = [];

export const INITIAL_EMERGENCY_CONFIG: EmergencyFundConfig = {
  targetMonths: 6,
  monthlyExpenseReference: 3000.0,
  customTargetAmount: 18000.0,
  currentBalance: 0.0,
};

export const INITIAL_EMERGENCY_HISTORY: EmergencyFundRecord[] = [];
export const INITIAL_INVESTMENTS: Investment[] = [];
export const INITIAL_BUDGETS: BudgetLimit[] = [];
export const INITIAL_GOALS: FinancialGoal[] = [];
export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const DEMO_USER: UserProfile = {
  id: 'guest',
  name: 'Meu Perfil',
  email: 'usuario@finanza.app',
  createdAt: new Date().toISOString(),
};
