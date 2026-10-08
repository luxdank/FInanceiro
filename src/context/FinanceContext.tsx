import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Transaction,
  Category,
  BankAccount,
  CreditCard,
  EmergencyFundConfig,
  EmergencyFundRecord,
  Investment,
  BudgetLimit,
  FinancialGoal,
  FinancialAlert,
  PeriodFilter,
  CoupleConfig,
} from '../types/finance';
import {
  INITIAL_CATEGORIES,
  INITIAL_ACCOUNTS,
  INITIAL_CREDIT_CARDS,
  INITIAL_EMERGENCY_CONFIG,
  INITIAL_EMERGENCY_HISTORY,
  INITIAL_INVESTMENTS,
  INITIAL_BUDGETS,
  INITIAL_GOALS,
  INITIAL_TRANSACTIONS,
} from '../utils/mockData';
import { getCurrentMonthString } from '../utils/formatters';
import { useAuth } from './AuthContext';
import {
  db,
  doc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';

interface FinanceContextType {
  // State
  transactions: Transaction[];
  categories: Category[];
  accounts: BankAccount[];
  creditCards: CreditCard[];
  emergencyConfig: EmergencyFundConfig;
  emergencyHistory: EmergencyFundRecord[];
  investments: Investment[];
  budgets: BudgetLimit[];
  goals: FinancialGoal[];
  alerts: FinancialAlert[];
  coupleConfig: CoupleConfig;
  period: PeriodFilter;
  customDateRange: { start: string; end: string };
  selectedMonth: string;
  isSyncing: boolean;
  lastSyncTime: string | null;
  syncCode: string;
  isCloudConnected: boolean;

  // Actions - Sync
  setSyncCode: (code: string) => Promise<void>;
  generateNewSyncCode: () => string;
  syncAllToFirebase: () => Promise<void>;

  // Actions - Couple Config
  updateCoupleConfig: (config: Partial<CoupleConfig>) => Promise<void>;

  // Actions - Filters
  setPeriod: (period: PeriodFilter) => void;
  setCustomDateRange: (range: { start: string; end: string }) => void;
  setSelectedMonth: (month: string) => void;

  // Actions - Transactions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt' | 'userId'>) => Promise<void>;
  updateTransaction: (id: string, tx: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Actions - Categories
  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, cat: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Actions - Accounts & Cards
  addAccount: (acc: Omit<BankAccount, 'id'>) => Promise<void>;
  updateAccount: (id: string, acc: Partial<BankAccount>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  addCreditCard: (card: Omit<CreditCard, 'id'>) => Promise<void>;
  updateCreditCard: (id: string, card: Partial<CreditCard>) => Promise<void>;
  deleteCreditCard: (id: string) => Promise<void>;

  // Actions - Emergency Fund
  depositEmergencyFund: (amount: number, date: string, notes?: string, accountId?: string) => Promise<void>;
  withdrawEmergencyFund: (amount: number, date: string, notes?: string, accountId?: string) => Promise<void>;
  updateEmergencyConfig: (config: Partial<EmergencyFundConfig>) => Promise<void>;

  // Actions - Investments
  addInvestment: (inv: Omit<Investment, 'id' | 'lastUpdated' | 'userId'>) => Promise<void>;
  updateInvestmentValue: (id: string, newCurrentValue: number) => Promise<void>;
  updateInvestment: (id: string, inv: Partial<Investment>) => Promise<void>;
  deleteInvestment: (id: string) => Promise<void>;
  depositInvestment: (id: string, amount: number, accountId?: string) => Promise<void>;
  withdrawInvestment: (id: string, amount: number, accountId?: string) => Promise<void>;

  // Actions - Budgets & Goals
  setBudgetLimit: (categoryId: string, limit: number) => Promise<void>;
  addGoal: (goal: Omit<FinancialGoal, 'id' | 'userId'>) => Promise<void>;
  updateGoal: (id: string, goal: Partial<FinancialGoal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  contributeToGoal: (id: string, amount: number) => Promise<void>;

  // Utility Actions
  resetToZero: () => Promise<void>;
  exportDataJSON: () => string;
  importDataJSON: (jsonString: string) => boolean;

  // Computed Indicators
  summary: {
    availableBalance: number;
    monthIncome: number;
    monthExpense: number;
    prevMonthIncome: number;
    prevMonthExpense: number;
    incomeChangePercent: number;
    expenseChangePercent: number;
    investedTotal: number;
    investmentsCurrentValue: number;
    investmentsGainAmount: number;
    investmentsGainPercent: number;
    emergencyFundBalance: number;
    emergencyTarget: number;
    emergencyMonthsCovered: number;
    emergencyProgressPercent: number;
    creditCardsDebt: number;
    netWorth: number;
    prevMonthNetWorth: number;
    netWorthChangePercent: number;
    monthNetSavings: number;
  };

  // Aggregated data for charts & views
  monthlyChartData: Array<{
    month: string;
    monthLabel: string;
    income: number;
    expense: number;
    netSavings: number;
    accumulatedBalance: number;
    netWorth: number;
    emergency: number;
  }>;
  categoryExpenses: Array<{
    categoryId: string;
    name: string;
    color: string;
    total: number;
    percentage: number;
  }>;
  investmentsByClass: Array<{
    assetClass: string;
    total: number;
    percentage: number;
    color: string;
  }>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { firebaseUser } = useAuth();
  const userId = firebaseUser?.uid || 'guest';

  // 1. Core State starting clean/zeroed
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('finanza_transactions_v2');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('finanza_categories_v2');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [accounts, setAccounts] = useState<BankAccount[]>(() => {
    const saved = localStorage.getItem('finanza_accounts_v2');
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });

  const [creditCards, setCreditCards] = useState<CreditCard[]>(() => {
    const saved = localStorage.getItem('finanza_cards_v2');
    return saved ? JSON.parse(saved) : INITIAL_CREDIT_CARDS;
  });

  const [emergencyConfig, setEmergencyConfig] = useState<EmergencyFundConfig>(() => {
    const saved = localStorage.getItem('finanza_emg_config_v2');
    return saved ? JSON.parse(saved) : INITIAL_EMERGENCY_CONFIG;
  });

  const [emergencyHistory, setEmergencyHistory] = useState<EmergencyFundRecord[]>(() => {
    const saved = localStorage.getItem('finanza_emg_hist_v2');
    return saved ? JSON.parse(saved) : INITIAL_EMERGENCY_HISTORY;
  });

  const [investments, setInvestments] = useState<Investment[]>(() => {
    const saved = localStorage.getItem('finanza_inv_v2');
    return saved ? JSON.parse(saved) : INITIAL_INVESTMENTS;
  });

  const [budgets, setBudgets] = useState<BudgetLimit[]>(() => {
    const saved = localStorage.getItem('finanza_bgt_v2');
    return saved ? JSON.parse(saved) : INITIAL_BUDGETS;
  });

  const [goals, setGoals] = useState<FinancialGoal[]>(() => {
    const saved = localStorage.getItem('finanza_goals_v2');
    return saved ? JSON.parse(saved) : INITIAL_GOALS;
  });

  const [coupleConfig, setCoupleConfig] = useState<CoupleConfig>(() => {
    const saved = localStorage.getItem('finanza_couple_config_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return {
      partner1Name: 'Lucas',
      partner2Name: 'Esposa',
      appMode: 'couple_simple',
    };
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => {
    return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  });

  // Couple / Multi-Device Synchronization Code
  const DEFAULT_COUPLE_CODE = 'CASAL-FINANZA';

  const [syncCode, setSyncCodeState] = useState<string>(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const urlSync = params.get('sync');
        if (urlSync && urlSync.trim()) {
          const clean = urlSync.trim().toUpperCase();
          localStorage.setItem('finanza_sync_code_v1', clean);
          return clean;
        }
      }
    } catch {
      // ignore
    }

    const saved = localStorage.getItem('finanza_sync_code_v1');
    // If user has a custom code (not a random auto-generated 4-digit code), keep it
    if (saved && saved.trim() && saved !== 'CASAL-DEFAULT' && !/^CASAL-\d{4}$/.test(saved.trim())) {
      return saved.trim().toUpperCase();
    }

    // Default to shared couple space so PC and Phone sync immediately without any configuration
    localStorage.setItem('finanza_sync_code_v1', DEFAULT_COUPLE_CODE);
    return DEFAULT_COUPLE_CODE;
  });

  const setSyncCode = async (code: string) => {
    const clean = code.trim().toUpperCase() || DEFAULT_COUPLE_CODE;
    setSyncCodeState(clean);
    localStorage.setItem('finanza_sync_code_v1', clean);
  };

  const generateNewSyncCode = () => {
    const newCode = `CASAL-${Math.floor(1000 + Math.random() * 9000)}`;
    setSyncCodeState(newCode);
    localStorage.setItem('finanza_sync_code_v1', newCode);
    return newCode;
  };

  // Active path in Firestore for shared couple & multi-device sync
  const basePath = syncCode
    ? `couples/${syncCode}`
    : firebaseUser
    ? `users/${firebaseUser.uid}`
    : `couples/${DEFAULT_COUPLE_CODE}`;

  // Filters
  const [period, setPeriod] = useState<PeriodFilter>('current_month');
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthString());
  const [customDateRange, setCustomDateRange] = useState<{ start: string; end: string }>({
    start: `${getCurrentMonthString()}-01`,
    end: `${getCurrentMonthString()}-31`,
  });

  // Local storage cache backup
  useEffect(() => {
    localStorage.setItem('finanza_transactions_v2', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('finanza_categories_v2', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('finanza_accounts_v2', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('finanza_cards_v2', JSON.stringify(creditCards));
  }, [creditCards]);

  useEffect(() => {
    localStorage.setItem('finanza_emg_config_v2', JSON.stringify(emergencyConfig));
  }, [emergencyConfig]);

  useEffect(() => {
    localStorage.setItem('finanza_emg_hist_v2', JSON.stringify(emergencyHistory));
  }, [emergencyHistory]);

  useEffect(() => {
    localStorage.setItem('finanza_inv_v2', JSON.stringify(investments));
  }, [investments]);

  useEffect(() => {
    localStorage.setItem('finanza_bgt_v2', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('finanza_goals_v2', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('finanza_couple_config_v1', JSON.stringify(coupleConfig));
  }, [coupleConfig]);

  // Firestore real-time synchronization listeners across PC and Phone
  useEffect(() => {
    if (!basePath) return;
    setIsSyncing(true);

    const txPath = `${basePath}/transactions`;
    const accPath = `${basePath}/accounts`;
    const cardPath = `${basePath}/creditCards`;
    const invPath = `${basePath}/investments`;
    const goalPath = `${basePath}/goals`;
    const bgtPath = `${basePath}/budgets`;
    const catPath = `${basePath}/categories`;
    const emgPath = `${basePath}/emergencyHistory`;
    const emgConfigPath = `${basePath}/emergencyConfig`;
    const coupleDocPath = `${basePath}/settings/couple_config`;

    // 1. Transactions
    const unsubTx = onSnapshot(
      collection(db, txPath),
      (snap) => {
        if (!snap.empty) {
          const list: Transaction[] = [];
          snap.forEach((d) => list.push({ ...d.data(), id: d.id } as Transaction));
          setTransactions(list.sort((a, b) => b.date.localeCompare(a.date)));
        } else {
          // If remote Firestore collection is empty, check if PC already has transactions in local storage to upload
          try {
            const saved = localStorage.getItem('finanza_transactions_v2');
            const localList: Transaction[] = saved ? JSON.parse(saved) : [];
            if (localList.length > 0) {
              localList.forEach((tx) => {
                setDoc(doc(db, txPath, tx.id), tx).catch(console.warn);
              });
            }
          } catch (e) {
            console.warn(e);
          }
        }
      },
      (err) => console.warn('Sync transactions note:', err.message)
    );

    // 2. Accounts
    const unsubAcc = onSnapshot(
      collection(db, accPath),
      (snap) => {
        if (!snap.empty) {
          const list: BankAccount[] = [];
          snap.forEach((d) => list.push({ ...d.data(), id: d.id } as BankAccount));
          setAccounts(list);
        } else {
          // If remote collection is empty, auto-upload accounts registered on PC
          try {
            const saved = localStorage.getItem('finanza_accounts_v2');
            const localList: BankAccount[] = saved ? JSON.parse(saved) : [];
            const isDummy =
              localList.length === 1 &&
              localList[0].id === 'acc-1' &&
              localList[0].balance === 0 &&
              localList[0].name.includes('Conta Corrente Principal');

            if (localList.length > 0 && !isDummy) {
              localList.forEach((acc) => {
                setDoc(doc(db, accPath, acc.id), acc).catch(console.warn);
              });
            }
          } catch (e) {
            console.warn(e);
          }
        }
      },
      (err) => console.warn('Sync accounts note:', err.message)
    );

    // 3. Credit Cards
    const unsubCards = onSnapshot(
      collection(db, cardPath),
      (snap) => {
        if (!snap.empty) {
          const list: CreditCard[] = [];
          snap.forEach((d) => list.push({ ...d.data(), id: d.id } as CreditCard));
          setCreditCards(list);
        }
      },
      (err) => console.warn('Sync cards note:', err.message)
    );

    // 4. Investments
    const unsubInv = onSnapshot(
      collection(db, invPath),
      (snap) => {
        if (!snap.empty) {
          const list: Investment[] = [];
          snap.forEach((d) => list.push({ ...d.data(), id: d.id } as Investment));
          setInvestments(list);
        }
      },
      (err) => console.warn('Sync investments note:', err.message)
    );

    // 5. Goals
    const unsubGoals = onSnapshot(
      collection(db, goalPath),
      (snap) => {
        if (!snap.empty) {
          const list: FinancialGoal[] = [];
          snap.forEach((d) => list.push({ ...d.data(), id: d.id } as FinancialGoal));
          setGoals(list);
        } else {
          try {
            const saved = localStorage.getItem('finanza_goals_v2');
            const localList: FinancialGoal[] = saved ? JSON.parse(saved) : [];
            if (localList.length > 0) {
              localList.forEach((g) => {
                setDoc(doc(db, goalPath, g.id), g).catch(console.warn);
              });
            }
          } catch (e) {
            console.warn(e);
          }
        }
      },
      (err) => console.warn('Sync goals note:', err.message)
    );

    // 6. Budgets
    const unsubBgt = onSnapshot(
      collection(db, bgtPath),
      (snap) => {
        if (!snap.empty) {
          const list: BudgetLimit[] = [];
          snap.forEach((d) => list.push({ ...d.data(), id: d.id } as BudgetLimit));
          setBudgets(list);
        }
      },
      (err) => console.warn('Sync budgets note:', err.message)
    );

    // 7. Categories (Custom)
    const unsubCats = onSnapshot(
      collection(db, catPath),
      (snap) => {
        if (!snap.empty) {
          const customList: Category[] = [];
          snap.forEach((d) => customList.push({ ...d.data(), id: d.id } as Category));
          setCategories((prev) => {
            const baseDefaults = prev.filter((c) => !c.isCustom);
            return [...baseDefaults, ...customList];
          });
        }
      },
      (err) => console.warn('Sync categories note:', err.message)
    );

    // 8. Emergency Config
    const unsubEmgConfig = onSnapshot(
      doc(db, `${basePath}/emergencyConfig`, 'main'),
      (snap) => {
        if (snap.exists()) {
          setEmergencyConfig(snap.data() as EmergencyFundConfig);
        }
      },
      (err) => console.warn('Sync emergency note:', err.message)
    );

    // 9. Couple Config
    const unsubCoupleConfig = onSnapshot(
      doc(db, coupleDocPath),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as Partial<CoupleConfig>;
          setCoupleConfig((prev) => ({ ...prev, ...data }));
        }
      },
      (err) => console.warn('Sync couple settings note:', err.message)
    );

    setIsSyncing(false);
    setLastSyncTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));

    return () => {
      unsubTx();
      unsubAcc();
      unsubCards();
      unsubInv();
      unsubGoals();
      unsubBgt();
      unsubCats();
      unsubEmgConfig();
      unsubCoupleConfig();
    };
  }, [basePath]);

  // Auto-sync initial data from PC to Firestore on startup
  useEffect(() => {
    if (!basePath) return;
    try {
      const savedAccounts = localStorage.getItem('finanza_accounts_v2');
      const localAccs: BankAccount[] = savedAccounts ? JSON.parse(savedAccounts) : [];
      const hasRealAccounts =
        localAccs.length > 0 &&
        !(
          localAccs.length === 1 &&
          localAccs[0].id === 'acc-1' &&
          localAccs[0].balance === 0 &&
          localAccs[0].name.includes('Conta Corrente Principal')
        );

      const savedTxs = localStorage.getItem('finanza_transactions_v2');
      const localTxs = savedTxs ? JSON.parse(savedTxs) : [];

      if (hasRealAccounts || localTxs.length > 0) {
        syncAllToFirebase().catch(console.warn);
      }
    } catch {
      // ignore
    }
  }, [basePath]);

  const updateCoupleConfig = async (newConfig: Partial<CoupleConfig>) => {
    setCoupleConfig((prev) => {
      const updated = { ...prev, ...newConfig };
      localStorage.setItem('finanza_couple_config_v1', JSON.stringify(updated));
      return updated;
    });

    if (basePath) {
      const coupleDocPath = `${basePath}/settings/couple_config`;
      try {
        await setDoc(
          doc(db, coupleDocPath),
          newConfig,
          { merge: true }
        );
      } catch (err) {
        console.warn('Update couple note:', err);
      }
    }
  };

  // Actions
  const addTransaction = async (tx: Omit<Transaction, 'id' | 'createdAt' | 'userId'>) => {
    const id = `tx-${Date.now()}`;
    const newTx: Transaction = {
      ...tx,
      id,
      userId,
      createdAt: new Date().toISOString(),
    };

    // Update balances locally
    if (newTx.type === 'income') {
      if (newTx.accountId) {
        setAccounts((prev) =>
          prev.map((acc) =>
            acc.id === newTx.accountId ? { ...acc, balance: acc.balance + newTx.amount } : acc
          )
        );
      }
    } else if (newTx.type === 'expense') {
      if (newTx.paymentMethod === 'credit_card' && newTx.creditCardId) {
        setCreditCards((prev) =>
          prev.map((card) =>
            card.id === newTx.creditCardId
              ? { ...card, currentInvoice: card.currentInvoice + newTx.amount }
              : card
          )
        );
      } else if (newTx.accountId) {
        setAccounts((prev) =>
          prev.map((acc) =>
            acc.id === newTx.accountId ? { ...acc, balance: acc.balance - newTx.amount } : acc
          )
        );
      }
    } else if (newTx.type === 'emergency_deposit') {
      if (newTx.accountId) {
        setAccounts((prev) =>
          prev.map((acc) =>
            acc.id === newTx.accountId ? { ...acc, balance: acc.balance - newTx.amount } : acc
          )
        );
      }
      setEmergencyConfig((prev) => ({
        ...prev,
        currentBalance: prev.currentBalance + newTx.amount,
      }));
    } else if (newTx.type === 'emergency_withdraw') {
      if (newTx.accountId) {
        setAccounts((prev) =>
          prev.map((acc) =>
            acc.id === newTx.accountId ? { ...acc, balance: acc.balance + newTx.amount } : acc
          )
        );
      }
      setEmergencyConfig((prev) => ({
        ...prev,
        currentBalance: Math.max(0, prev.currentBalance - newTx.amount),
      }));
    }

    setTransactions((prev) => [newTx, ...prev]);

    // Firestore real-time sync across devices
    if (basePath) {
      try {
        await setDoc(doc(db, `${basePath}/transactions`, id), newTx);

        // Also sync updated account balance directly to Firestore
        if (newTx.accountId) {
          const targetAcc = accounts.find((a) => a.id === newTx.accountId);
          if (targetAcc) {
            let nextBal = targetAcc.balance;
            if (newTx.type === 'income' || newTx.type === 'emergency_withdraw') {
              nextBal += newTx.amount;
            } else if (newTx.type === 'expense' || newTx.type === 'emergency_deposit') {
              nextBal -= newTx.amount;
            }
            await setDoc(
              doc(db, `${basePath}/accounts`, targetAcc.id),
              { ...targetAcc, balance: nextBal },
              { merge: true }
            );
          }
        }

        // Also sync updated card invoice to Firestore
        if (newTx.creditCardId && newTx.type === 'expense') {
          const targetCard = creditCards.find((c) => c.id === newTx.creditCardId);
          if (targetCard) {
            await setDoc(
              doc(db, `${basePath}/creditCards`, targetCard.id),
              { ...targetCard, currentInvoice: targetCard.currentInvoice + newTx.amount },
              { merge: true }
            );
          }
        }
      } catch (err) {
        console.warn('Sync addTransaction error:', err);
      }
    }
  };

  const updateTransaction = async (id: string, updated: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );

    if (basePath) {
      try {
        await setDoc(doc(db, `${basePath}/transactions`, id), updated, { merge: true });
      } catch (err) {
        console.warn('Update transaction note:', err);
      }
    }
  };

  const deleteTransaction = async (id: string) => {
    setTransactions((prev) => prev.filter((item) => item.id !== id));

    if (basePath) {
      try {
        await deleteDoc(doc(db, `${basePath}/transactions`, id));
      } catch (err) {
        console.warn('Delete transaction note:', err);
      }
    }
  };

  const addCategory = async (cat: Omit<Category, 'id'>) => {
    const id = `cat-custom-${Date.now()}`;
    const newCat: Category = {
      ...cat,
      id,
      isCustom: true,
    };
    setCategories((prev) => [...prev, newCat]);

    if (basePath) {
      try {
        await setDoc(doc(db, `${basePath}/categories`, id), newCat);
      } catch (err) {
        console.warn('Add category note:', err);
      }
    }
  };

  const updateCategory = async (id: string, cat: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...cat } : c))
    );

    if (basePath) {
      try {
        await setDoc(doc(db, `${basePath}/categories`, id), cat, { merge: true });
      } catch (err) {
        console.warn('Update category note:', err);
      }
    }
  };

  const deleteCategory = async (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));

    if (basePath) {
      try {
        await deleteDoc(doc(db, `${basePath}/categories`, id));
      } catch (err) {
        console.warn('Delete category note:', err);
      }
    }
  };

  const addAccount = async (acc: Omit<BankAccount, 'id'>) => {
    const id = `acc-${Date.now()}`;
    const newAcc: BankAccount = { ...acc, id };
    setAccounts((prev) => [...prev, newAcc]);

    if (basePath) {
      try {
        await setDoc(doc(db, `${basePath}/accounts`, id), newAcc);
      } catch (err) {
        console.warn('Add account note:', err);
      }
    }
  };

  const updateAccount = async (id: string, acc: Partial<BankAccount>) => {
    setAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...acc } : a))
    );

    if (basePath) {
      try {
        await setDoc(doc(db, `${basePath}/accounts`, id), acc, { merge: true });
      } catch (err) {
        console.warn('Update account note:', err);
      }
    }
  };

  const deleteAccount = async (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));

    if (basePath) {
      try {
        await deleteDoc(doc(db, `${basePath}/accounts`, id));
      } catch (err) {
        console.warn('Delete account note:', err);
      }
    }
  };

  const addCreditCard = async (card: Omit<CreditCard, 'id'>) => {
    const id = `card-${Date.now()}`;
    const newCard: CreditCard = { ...card, id };
    setCreditCards((prev) => [...prev, newCard]);

    if (basePath) {
      try {
        await setDoc(doc(db, `${basePath}/creditCards`, id), newCard);
      } catch (err) {
        console.warn('Add card note:', err);
      }
    }
  };

  const updateCreditCard = async (id: string, card: Partial<CreditCard>) => {
    setCreditCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...card } : c))
    );

    if (basePath) {
      try {
        await setDoc(doc(db, `${basePath}/creditCards`, id), card, { merge: true });
      } catch (err) {
        console.warn('Update card note:', err);
      }
    }
  };

  const deleteCreditCard = async (id: string) => {
    setCreditCards((prev) => prev.filter((c) => c.id !== id));

    if (basePath) {
      try {
        await deleteDoc(doc(db, `${basePath}/creditCards`, id));
      } catch (err) {
        console.warn('Delete card note:', err);
      }
    }
  };

  const depositEmergencyFund = async (amount: number, date: string, notes?: string, accountId?: string) => {
    await addTransaction({
      description: 'Aporte na Reserva de Emergência',
      amount,
      type: 'emergency_deposit',
      categoryId: 'cat-inc-4',
      date,
      accountId,
      paymentMethod: 'transfer',
      isRecurring: false,
      notes: notes || 'Aporte para reserva de segurança',
    });
  };

  const withdrawEmergencyFund = async (amount: number, date: string, notes?: string, accountId?: string) => {
    await addTransaction({
      description: 'Retirada da Reserva de Emergência',
      amount,
      type: 'emergency_withdraw',
      categoryId: 'cat-inc-4',
      date,
      accountId,
      paymentMethod: 'transfer',
      isRecurring: false,
      notes: notes || 'Retirada de emergência',
    });
  };

  const updateEmergencyConfig = async (config: Partial<EmergencyFundConfig>) => {
    setEmergencyConfig((prev) => ({ ...prev, ...config }));

    if (basePath) {
      try {
        await setDoc(doc(db, `${basePath}/emergencyConfig`, 'main'), config, { merge: true });
      } catch (err) {
        console.warn('Update emergency config note:', err);
      }
    }
  };

  const addInvestment = async (inv: Omit<Investment, 'id' | 'lastUpdated' | 'userId'>) => {
    const id = `inv-${Date.now()}`;
    const newInv: Investment = {
      ...inv,
      id,
      userId,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setInvestments((prev) => [...prev, newInv]);

    if (basePath) {
      try {
        await setDoc(doc(db, `${basePath}/investments`, id), newInv);
      } catch (err) {
        console.warn('Add investment note:', err);
      }
    }

    await addTransaction({
      description: `Aporte Inicial - ${inv.name}`,
      amount: inv.investedAmount,
      type: 'investment_deposit',
      categoryId: 'cat-inc-4',
      date: inv.startDate,
      paymentMethod: 'transfer',
      isRecurring: false,
      notes: `Investimento em ${inv.assetClass}`,
    });
  };

  const updateInvestmentValue = async (id: string, newCurrentValue: number) => {
    const updated = {
      currentValue: newCurrentValue,
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    setInvestments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );

    if (basePath) {
      try {
        await setDoc(doc(db, `${basePath}/investments`, id), updated, { merge: true });
      } catch (err) {
        console.warn('Update investment value note:', err);
      }
    }
  };

  const updateInvestment = async (id: string, inv: Partial<Investment>) => {
    setInvestments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...inv } : item))
    );

    if (basePath) {
      try {
        await setDoc(doc(db, `${basePath}/investments`, id), inv, { merge: true });
      } catch (err) {
        console.warn('Update investment note:', err);
      }
    }
  };

  const deleteInvestment = async (id: string) => {
    setInvestments((prev) => prev.filter((item) => item.id !== id));

    if (basePath) {
      try {
        await deleteDoc(doc(db, `${basePath}/investments`, id));
      } catch (err) {
        console.warn('Delete investment note:', err);
      }
    }
  };

  const depositInvestment = async (id: string, amount: number, accountId?: string) => {
    const inv = investments.find((i) => i.id === id);
    if (!inv) return;

    await updateInvestment(id, {
      investedAmount: inv.investedAmount + amount,
      currentValue: inv.currentValue + amount,
      lastUpdated: new Date().toISOString().split('T')[0],
    });

    await addTransaction({
      description: `Aporte - ${inv.name}`,
      amount,
      type: 'investment_deposit',
      categoryId: 'cat-inc-4',
      date: new Date().toISOString().split('T')[0],
      accountId,
      paymentMethod: 'transfer',
      isRecurring: false,
      notes: `Aporte adicional em ${inv.assetClass}`,
    });
  };

  const withdrawInvestment = async (id: string, amount: number, accountId?: string) => {
    const inv = investments.find((i) => i.id === id);
    if (!inv) return;

    await updateInvestment(id, {
      investedAmount: Math.max(0, inv.investedAmount - amount),
      currentValue: Math.max(0, inv.currentValue - amount),
      lastUpdated: new Date().toISOString().split('T')[0],
    });

    await addTransaction({
      description: `Resgate - ${inv.name}`,
      amount,
      type: 'investment_withdraw',
      categoryId: 'cat-inc-4',
      date: new Date().toISOString().split('T')[0],
      accountId,
      paymentMethod: 'transfer',
      isRecurring: false,
      notes: `Resgate de investimento`,
    });
  };

  const setBudgetLimit = async (categoryId: string, limit: number) => {
    const id = `bgt-${categoryId}`;
    const newBgt: BudgetLimit = { id, userId, categoryId, monthlyLimit: limit };

    setBudgets((prev) => {
      const exists = prev.find((b) => b.categoryId === categoryId);
      if (exists) {
        return prev.map((b) => (b.categoryId === categoryId ? { ...b, monthlyLimit: limit } : b));
      }
      return [...prev, newBgt];
    });

    if (basePath) {
      try {
        await setDoc(doc(db, `${basePath}/budgets`, id), newBgt);
      } catch (err) {
        console.warn('Set budget limit note:', err);
      }
    }
  };

  const addGoal = async (goal: Omit<FinancialGoal, 'id' | 'userId'>) => {
    const id = `goal-${Date.now()}`;
    const newGoal: FinancialGoal = { ...goal, id, userId };
    setGoals((prev) => [...prev, newGoal]);

    if (basePath) {
      try {
        await setDoc(doc(db, `${basePath}/goals`, id), newGoal);
      } catch (err) {
        console.warn('Add goal note:', err);
      }
    }
  };

  const updateGoal = async (id: string, goal: Partial<FinancialGoal>) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...goal } : g))
    );

    if (basePath) {
      try {
        await setDoc(doc(db, `${basePath}/goals`, id), goal, { merge: true });
      } catch (err) {
        console.warn('Update goal note:', err);
      }
    }
  };

  const deleteGoal = async (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));

    if (basePath) {
      try {
        await deleteDoc(doc(db, `${basePath}/goals`, id));
      } catch (err) {
        console.warn('Delete goal note:', err);
      }
    }
  };

  const contributeToGoal = async (id: string, amount: number) => {
    const goal = goals.find((g) => g.id === id);
    if (!goal) return;
    const newCurrent = goal.currentAmount + amount;
    await updateGoal(id, {
      currentAmount: newCurrent,
      completed: newCurrent >= goal.targetAmount,
    });
  };

  const syncAllToFirebase = async () => {
    if (!basePath) return;
    setIsSyncing(true);
    try {
      for (const acc of accounts) {
        await setDoc(doc(db, `${basePath}/accounts`, acc.id), acc);
      }
      for (const card of creditCards) {
        await setDoc(doc(db, `${basePath}/creditCards`, card.id), card);
      }
      for (const tx of transactions) {
        await setDoc(doc(db, `${basePath}/transactions`, tx.id), tx);
      }
      for (const inv of investments) {
        await setDoc(doc(db, `${basePath}/investments`, inv.id), inv);
      }
      for (const goal of goals) {
        await setDoc(doc(db, `${basePath}/goals`, goal.id), goal);
      }
      for (const bgt of budgets) {
        await setDoc(doc(db, `${basePath}/budgets`, bgt.id), bgt);
      }
      for (const cat of categories.filter((c) => c.isCustom)) {
        await setDoc(doc(db, `${basePath}/categories`, cat.id), cat);
      }
      await setDoc(doc(db, `${basePath}/emergencyConfig`, 'main'), emergencyConfig);
      await setDoc(doc(db, `${basePath}/settings`, 'couple_config'), coupleConfig, { merge: true });
      setLastSyncTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Error syncing to Firebase:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Reset to zero per user request: "Zero tudo."
  const resetToZero = async () => {
    setTransactions([]);
    setInvestments([]);
    setCreditCards([]);
    setGoals([]);
    setBudgets([]);
    setEmergencyHistory([]);
    setEmergencyConfig({
      targetMonths: 6,
      monthlyExpenseReference: 3000,
      customTargetAmount: 18000,
      currentBalance: 0,
    });
    setAccounts([
      {
        id: 'acc-1',
        name: 'Conta Corrente Principal',
        type: 'checking',
        institution: 'Banco',
        balance: 0,
        color: '#2563eb',
        isDefault: true,
      },
    ]);
    localStorage.clear();

    if (firebaseUser) {
      try {
        await setDoc(doc(db, `users/${firebaseUser.uid}/emergencyConfig`, 'main'), {
          targetMonths: 6,
          monthlyExpenseReference: 3000,
          customTargetAmount: 18000,
          currentBalance: 0,
        });
        setLastSyncTime(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
      } catch (err) {
        console.error('Error resetting Firebase:', err);
      }
    }
  };

  const exportDataJSON = () => {
    const data = {
      transactions,
      categories,
      accounts,
      creditCards,
      emergencyConfig,
      emergencyHistory,
      investments,
      budgets,
      goals,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  };

  const importDataJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.transactions) setTransactions(data.transactions);
      if (data.categories) setCategories(data.categories);
      if (data.accounts) setAccounts(data.accounts);
      if (data.creditCards) setCreditCards(data.creditCards);
      if (data.emergencyConfig) setEmergencyConfig(data.emergencyConfig);
      if (data.emergencyHistory) setEmergencyHistory(data.emergencyHistory);
      if (data.investments) setInvestments(data.investments);
      if (data.budgets) setBudgets(data.budgets);
      if (data.goals) setGoals(data.goals);
      return true;
    } catch (e) {
      console.error('Failed to import JSON', e);
      return false;
    }
  };

  // Helper date logic
  const targetMonth = selectedMonth || getCurrentMonthString();
  const [currentYearNum, currentMonthNum] = targetMonth.split('-').map(Number);
  const prevMonthDate = new Date(currentYearNum, currentMonthNum - 2, 1);
  const prevMonthString = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

  const filterByPeriod = (txDate: string) => {
    if (period === 'current_month') {
      return txDate.startsWith(targetMonth);
    }
    if (period === 'last_3_months') {
      const d = new Date(txDate);
      const minDate = new Date(currentYearNum, currentMonthNum - 3, 1);
      return d >= minDate;
    }
    if (period === 'last_6_months') {
      const d = new Date(txDate);
      const minDate = new Date(currentYearNum, currentMonthNum - 6, 1);
      return d >= minDate;
    }
    if (period === 'this_year') {
      return txDate.startsWith(String(currentYearNum));
    }
    if (period === 'custom') {
      return txDate >= customDateRange.start && txDate <= customDateRange.end;
    }
    return true;
  };

  // 2. Computed Summaries
  const summary = useMemo(() => {
    const availableBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

    const currentTxs = transactions.filter((t) => filterByPeriod(t.date));
    const monthIncome = currentTxs
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthExpense = currentTxs
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const prevTxs = transactions.filter((t) => t.date.startsWith(prevMonthString));
    const prevMonthIncome = prevTxs
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const prevMonthExpense = prevTxs
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const incomeChangePercent =
      prevMonthIncome > 0 ? ((monthIncome - prevMonthIncome) / prevMonthIncome) * 100 : 0;
    const expenseChangePercent =
      prevMonthExpense > 0 ? ((monthExpense - prevMonthExpense) / prevMonthExpense) * 100 : 0;

    const investedTotal = investments.reduce((sum, inv) => sum + inv.investedAmount, 0);
    const investmentsCurrentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
    const investmentsGainAmount = investmentsCurrentValue - investedTotal;
    const investmentsGainPercent =
      investedTotal > 0 ? (investmentsGainAmount / investedTotal) * 100 : 0;

    const emergencyFundBalance = emergencyConfig.currentBalance;
    const emergencyTarget =
      emergencyConfig.customTargetAmount ||
      emergencyConfig.targetMonths * (emergencyConfig.monthlyExpenseReference || 3000);
    const avgMonthlyExpense = emergencyConfig.monthlyExpenseReference || 3000;
    const emergencyMonthsCovered =
      avgMonthlyExpense > 0 ? emergencyFundBalance / avgMonthlyExpense : 0;
    const emergencyProgressPercent =
      emergencyTarget > 0 ? Math.min(100, (emergencyFundBalance / emergencyTarget) * 100) : 0;

    const creditCardsDebt = creditCards.reduce((sum, card) => sum + card.currentInvoice, 0);

    const netWorth = availableBalance + emergencyFundBalance + investmentsCurrentValue - creditCardsDebt;
    const prevMonthNetWorth = netWorth - (monthIncome - monthExpense);
    const netWorthChangePercent =
      prevMonthNetWorth > 0 ? ((netWorth - prevMonthNetWorth) / prevMonthNetWorth) * 100 : 0;
    const monthNetSavings = monthIncome - monthExpense;

    return {
      availableBalance,
      monthIncome,
      monthExpense,
      prevMonthIncome,
      prevMonthExpense,
      incomeChangePercent,
      expenseChangePercent,
      investedTotal,
      investmentsCurrentValue,
      investmentsGainAmount,
      investmentsGainPercent,
      emergencyFundBalance,
      emergencyTarget,
      emergencyMonthsCovered,
      emergencyProgressPercent,
      creditCardsDebt,
      netWorth,
      prevMonthNetWorth,
      netWorthChangePercent,
      monthNetSavings,
    };
  }, [
    accounts,
    transactions,
    investments,
    emergencyConfig,
    creditCards,
    period,
    targetMonth,
    prevMonthString,
    customDateRange,
  ]);

  // Chart data
  const monthlyChartData = useMemo(() => {
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const rawList: Array<{
      month: string;
      monthLabel: string;
      income: number;
      expense: number;
      netSavings: number;
      netWorth: number;
      emergency: number;
    }> = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYearNum, currentMonthNum - 1 - i, 1);
      const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = `${monthNames[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`;

      const monthTxs = transactions.filter((t) => t.date.startsWith(mStr));
      const inc = monthTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const exp = monthTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

      rawList.push({
        month: mStr,
        monthLabel: label,
        income: inc,
        expense: exp,
        netSavings: inc - exp,
        netWorth: i === 0 ? summary.netWorth : 0,
        emergency: i === 0 ? summary.emergencyFundBalance : 0,
      });
    }

    // Calculate accumulated balance for each month working backwards from summary.availableBalance
    const balances = new Array(rawList.length).fill(0);
    let runningBalance = summary.availableBalance;
    balances[5] = runningBalance;
    for (let i = 4; i >= 0; i--) {
      runningBalance = runningBalance - rawList[i + 1].netSavings;
      balances[i] = runningBalance;
    }

    return rawList.map((item, idx) => ({
      ...item,
      accumulatedBalance: balances[idx],
    }));
  }, [transactions, currentYearNum, currentMonthNum, summary]);

  // Category expenses
  const categoryExpenses = useMemo(() => {
    const periodTxs = transactions.filter(
      (t) => filterByPeriod(t.date) && t.type === 'expense'
    );
    const totalExp = periodTxs.reduce((sum, t) => sum + t.amount, 0);

    const map: Record<string, number> = {};
    periodTxs.forEach((t) => {
      map[t.categoryId] = (map[t.categoryId] || 0) + t.amount;
    });

    return Object.entries(map)
      .map(([catId, amount]) => {
        const cat = categories.find((c) => c.id === catId);
        return {
          categoryId: catId,
          name: cat ? cat.name : 'Outros',
          color: cat ? cat.color : '#94a3b8',
          total: amount,
          percentage: totalExp > 0 ? (amount / totalExp) * 100 : 0,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [transactions, categories, period, targetMonth, customDateRange]);

  // Investments by asset class
  const investmentsByClass = useMemo(() => {
    const classColors: Record<string, string> = {
      'Tesouro Direto': '#2563eb',
      'CDB': '#0284c7',
      'LCI/LCA': '#0d9488',
      'Fundos': '#7c3aed',
      'Ações': '#e11d48',
      'ETFs': '#ea580c',
      'FIIs': '#16a34a',
      'Criptomoedas': '#d97706',
      'Outros': '#64748b',
    };

    const totalInvestedVal = investments.reduce((s, inv) => s + inv.currentValue, 0);
    const map: Record<string, number> = {};

    investments.forEach((inv) => {
      map[inv.assetClass] = (map[inv.assetClass] || 0) + inv.currentValue;
    });

    return Object.entries(map)
      .map(([assetClass, val]) => ({
        assetClass,
        total: val,
        percentage: totalInvestedVal > 0 ? (val / totalInvestedVal) * 100 : 0,
        color: classColors[assetClass] || '#64748b',
      }))
      .sort((a, b) => b.total - a.total);
  }, [investments]);

  // Dynamic alerts (Budgets + Savings Goals)
  const alerts = useMemo(() => {
    const list: FinancialAlert[] = [];

    // 1. Budget limits
    budgets.forEach((bgt) => {
      const spent = transactions
        .filter((t) => t.date.startsWith(targetMonth) && t.categoryId === bgt.categoryId && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const cat = categories.find((c) => c.id === bgt.categoryId);
      const catName = cat ? cat.name : 'Categoria';

      if (spent > bgt.monthlyLimit) {
        list.push({
          id: `alt-bgt-over-${bgt.id}`,
          title: `Orçamento estourado em ${catName}`,
          message: `Gastos ultrapassaram o teto estipulado de R$ ${bgt.monthlyLimit.toFixed(2)}.`,
          type: 'danger',
          date: new Date().toISOString(),
          linkTab: 'orcamento',
        });
      } else if (bgt.monthlyLimit > 0 && spent >= bgt.monthlyLimit * 0.85) {
        list.push({
          id: `alt-bgt-warn-${bgt.id}`,
          title: `Atenção: ${catName} em 85% do limite`,
          message: `Você já gastou R$ ${spent.toFixed(2)} de R$ ${bgt.monthlyLimit.toFixed(2)}.`,
          type: 'warning',
          date: new Date().toISOString(),
          linkTab: 'orcamento',
        });
      }
    });

    // 2. Savings Goals close to being reached (>= 80% and < 100%) or Reached (100%)
    goals.forEach((goal) => {
      if (!goal.targetAmount || goal.targetAmount <= 0) return;
      const progress = (goal.currentAmount / goal.targetAmount) * 100;
      const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

      if (progress >= 100) {
        list.push({
          id: `alt-goal-achieved-${goal.id}`,
          title: `🎉 Meta Conquistada: ${goal.title}!`,
          message: `Parabéns! Você atingiu 100% da meta "${goal.title}" economizando R$ ${goal.currentAmount.toFixed(2)}.`,
          type: 'success',
          date: new Date().toISOString(),
          linkTab: 'metas',
        });
      } else if (progress >= 80) {
        list.push({
          id: `alt-goal-near-${goal.id}`,
          title: `🎯 Meta Quase Atingida: ${goal.title}`,
          message: `Você já alcançou ${progress.toFixed(0)}% da sua meta de economia! Faltam apenas R$ ${remaining.toFixed(2)} para completar.`,
          type: 'info',
          date: new Date().toISOString(),
          linkTab: 'metas',
        });
      }
    });

    return list;
  }, [budgets, transactions, targetMonth, categories, goals]);

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        categories,
        accounts,
        creditCards,
        emergencyConfig,
        emergencyHistory,
        investments,
        budgets,
        goals,
        alerts,
        coupleConfig,
        period,
        customDateRange,
        selectedMonth,
        isSyncing,
        lastSyncTime,
        syncCode,
        isCloudConnected: true,
        setSyncCode,
        generateNewSyncCode,
        updateCoupleConfig,
        syncAllToFirebase,
        setPeriod,
        setCustomDateRange,
        setSelectedMonth,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addCategory,
        updateCategory,
        deleteCategory,
        addAccount,
        updateAccount,
        deleteAccount,
        addCreditCard,
        updateCreditCard,
        deleteCreditCard,
        depositEmergencyFund,
        withdrawEmergencyFund,
        updateEmergencyConfig,
        addInvestment,
        updateInvestmentValue,
        updateInvestment,
        deleteInvestment,
        depositInvestment,
        withdrawInvestment,
        setBudgetLimit,
        addGoal,
        updateGoal,
        deleteGoal,
        contributeToGoal,
        resetToZero,
        exportDataJSON,
        importDataJSON,
        summary,
        monthlyChartData,
        categoryExpenses,
        investmentsByClass,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
