export type TransactionType = 'income' | 'expense' | 'investment_deposit' | 'investment_withdraw' | 'emergency_deposit' | 'emergency_withdraw';

export type ExpenseType = 'fixed' | 'variable';

export type PaymentMethod = 'pix' | 'credit_card' | 'debit_card' | 'bank_slip' | 'cash' | 'transfer' | 'other';

export type RecurrenceType = 'none' | 'monthly' | 'weekly' | 'yearly';

export type AccountType = 'checking' | 'savings' | 'digital' | 'wallet' | 'other';

export type AssetClass = 
  | 'Tesouro Direto' 
  | 'CDB' 
  | 'LCI/LCA' 
  | 'Fundos' 
  | 'Ações' 
  | 'ETFs' 
  | 'FIIs' 
  | 'Criptomoedas' 
  | 'Outros';

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  isCustom?: boolean;
}

export interface BankAccount {
  id: string;
  name: string;
  type: AccountType;
  institution: string;
  balance: number;
  color: string;
  isDefault?: boolean;
}

export interface CreditCard {
  id: string;
  name: string;
  institution: string;
  limit: number;
  currentInvoice: number;
  closingDay: number;
  dueDay: number;
  color: string;
}

export interface Transaction {
  id: string;
  userId: string;
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  date: string; // YYYY-MM-DD
  accountId?: string;
  creditCardId?: string;
  paymentMethod: PaymentMethod;
  expenseType?: ExpenseType; // 'fixed' | 'variable'
  isRecurring: boolean;
  recurrence?: RecurrenceType;
  notes?: string;
  paidBy?: string; // e.g. "Lucas" | "Esposa" | "Casal"
  createdAt: string;
}

export interface CoupleConfig {
  partner1Name: string;
  partner2Name: string;
  appMode: 'couple_simple' | 'advanced';
  syncCode?: string;
}

export interface EmergencyFundRecord {
  id: string;
  userId: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  date: string;
  notes?: string;
  accountId?: string;
}

export interface EmergencyFundConfig {
  targetMonths: number;
  monthlyExpenseReference: number;
  customTargetAmount?: number;
  currentBalance: number;
}

export interface Investment {
  id: string;
  userId: string;
  name: string;
  assetClass: AssetClass;
  institution: string;
  investedAmount: number;
  currentValue: number;
  startDate: string;
  notes?: string;
  lastUpdated: string;
}

export interface InvestmentTransaction {
  id: string;
  investmentId: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  date: string;
  notes?: string;
}

export interface BudgetLimit {
  id: string;
  userId: string;
  categoryId: string;
  monthlyLimit: number;
}

export interface FinancialGoal {
  id: string;
  userId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  startDate: string;
  categoryIcon: string;
  notes?: string;
  completed?: boolean;
}

export interface FinancialAlert {
  id: string;
  title: string;
  message: string;
  type: 'danger' | 'warning' | 'info' | 'success';
  date: string;
  linkTab?: string;
  isRead?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

export type PeriodFilter = 'current_month' | 'last_3_months' | 'last_6_months' | 'this_year' | 'custom';
