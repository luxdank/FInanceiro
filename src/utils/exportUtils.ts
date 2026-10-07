import {
  Transaction,
  Category,
  BankAccount,
  CreditCard,
  Investment,
  FinancialGoal,
  BudgetLimit,
  EmergencyFundConfig,
  EmergencyFundRecord,
} from '../types/finance';

/**
 * Trigger browser download for text/csv or text/json
 */
export const downloadFile = (content: string, fileName: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Escapes values for CSV compatibility (Excel friendly with semicolon separator)
 */
const escapeCSV = (value: string | number | boolean | null | undefined): string => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(';') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const getTypeName = (type: string, expenseType?: string): string => {
  switch (type) {
    case 'income':
      return 'Receita';
    case 'expense':
      return expenseType === 'fixed'
        ? 'Despesa Fixa'
        : expenseType === 'variable'
        ? 'Despesa Variável'
        : 'Despesa';
    case 'investment_deposit':
      return 'Aporte em Investimento';
    case 'investment_withdraw':
      return 'Resgate de Investimento';
    case 'emergency_deposit':
      return 'Aporte na Reserva';
    case 'emergency_withdraw':
      return 'Resgate da Reserva';
    default:
      return type;
  }
};

const getPaymentMethodName = (method: string): string => {
  switch (method) {
    case 'pix':
      return 'Pix';
    case 'credit_card':
      return 'Cartão de Crédito';
    case 'debit_card':
      return 'Cartão de Débito';
    case 'bank_slip':
      return 'Boleto Bancário';
    case 'cash':
      return 'Dinheiro em Espécie';
    case 'transfer':
      return 'Transferência (TED/DOC)';
    default:
      return 'Outro';
  }
};

/**
 * Generates CSV for transactions with UTF-8 BOM for Excel compatibility
 */
export const exportTransactionsToCSV = (
  transactions: Transaction[],
  categories: Category[],
  accounts: BankAccount[],
  creditCards: CreditCard[]
): string => {
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const accountMap = new Map(accounts.map((a) => [a.id, a.name]));
  const cardMap = new Map(creditCards.map((c) => [c.id, c.name]));

  const headers = [
    'Data',
    'Tipo',
    'Descrição',
    'Categoria',
    'Conta ou Cartão',
    'Forma de Pagamento',
    'Valor (R$)',
    'Recorrente?',
    'Frequência',
    'Observações',
  ];

  const rows = transactions.map((tx) => {
    let source = '';
    if (tx.creditCardId && cardMap.has(tx.creditCardId)) {
      source = `Cartão: ${cardMap.get(tx.creditCardId)}`;
    } else if (tx.accountId && accountMap.has(tx.accountId)) {
      source = `Conta: ${accountMap.get(tx.accountId)}`;
    }

    return [
      escapeCSV(tx.date),
      escapeCSV(getTypeName(tx.type, tx.expenseType)),
      escapeCSV(tx.description),
      escapeCSV(categoryMap.get(tx.categoryId) || 'Sem Categoria'),
      escapeCSV(source),
      escapeCSV(getPaymentMethodName(tx.paymentMethod)),
      // Formatted with Portuguese decimal comma for Excel
      escapeCSV(tx.amount.toFixed(2).replace('.', ',')),
      escapeCSV(tx.isRecurring ? 'Sim' : 'Não'),
      escapeCSV(tx.recurrence ? tx.recurrence : '-'),
      escapeCSV(tx.notes || ''),
    ].join(';');
  });

  // \uFEFF is UTF-8 Byte Order Mark, ensuring Excel immediately renders accents (ç, ã, é) correctly
  return '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
};

/**
 * Generates CSV for investments with UTF-8 BOM
 */
export const exportInvestmentsToCSV = (investments: Investment[]): string => {
  const headers = [
    'Ativo',
    'Classe de Ativo',
    'Instituição / Corretora',
    'Total Investido (R$)',
    'Valor Atual (R$)',
    'Lucro ou Prejuízo (R$)',
    'Rentabilidade (%)',
    'Data de Início',
    'Última Atualização',
    'Observações',
  ];

  const rows = investments.map((inv) => {
    const profit = inv.currentValue - inv.investedAmount;
    const gainPct =
      inv.investedAmount > 0 ? (profit / inv.investedAmount) * 100 : 0;

    return [
      escapeCSV(inv.name),
      escapeCSV(inv.assetClass),
      escapeCSV(inv.institution),
      escapeCSV(inv.investedAmount.toFixed(2).replace('.', ',')),
      escapeCSV(inv.currentValue.toFixed(2).replace('.', ',')),
      escapeCSV(profit.toFixed(2).replace('.', ',')),
      escapeCSV(gainPct.toFixed(2).replace('.', ',') + '%'),
      escapeCSV(inv.startDate),
      escapeCSV(inv.lastUpdated),
      escapeCSV(inv.notes || ''),
    ].join(';');
  });

  return '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
};

/**
 * Generates comprehensive full financial report CSV
 */
export const exportFullFinancialSummaryToCSV = (data: {
  transactions: Transaction[];
  categories: Category[];
  accounts: BankAccount[];
  creditCards: CreditCard[];
  investments: Investment[];
  goals: FinancialGoal[];
  budgets: BudgetLimit[];
  emergencyConfig: EmergencyFundConfig;
}): string => {
  const lines: string[] = [];

  const addSection = (title: string) => {
    lines.push('');
    lines.push(`=== ${title} ===`);
  };

  // 1. Resumo Patrimonial Geral
  addSection('RESUMO PATRIMONIAL GERAL');
  const totalContas = data.accounts.reduce((sum, a) => sum + (a.balance || 0), 0);
  const totalInvestimentos = data.investments.reduce((sum, i) => sum + (i.currentValue || 0), 0);
  const totalReserva = data.emergencyConfig.currentBalance || 0;
  const totalDividasCartao = data.creditCards.reduce((sum, c) => sum + (c.currentInvoice || 0), 0);
  const patrimonioLiquido = totalContas + totalInvestimentos + totalReserva - totalDividasCartao;

  lines.push(`Item;Valor (R$)`);
  lines.push(`Saldo Total em Contas Bancárias;${totalContas.toFixed(2).replace('.', ',')}`);
  lines.push(`Saldo da Reserva de Emergência;${totalReserva.toFixed(2).replace('.', ',')}`);
  lines.push(`Total em Carteira de Investimentos;${totalInvestimentos.toFixed(2).replace('.', ',')}`);
  lines.push(`Total de Faturas Pendentes (Cartões);-${totalDividasCartao.toFixed(2).replace('.', ',')}`);
  lines.push(`PATRIMÔNIO LÍQUIDO TOTAL;${patrimonioLiquido.toFixed(2).replace('.', ',')}`);

  // 2. Contas Bancárias
  addSection('CONTAS BANCÁRIAS');
  lines.push('Conta;Instituição;Tipo;Saldo Atual (R$)');
  data.accounts.forEach((acc) => {
    lines.push(
      `${escapeCSV(acc.name)};${escapeCSV(acc.institution)};${escapeCSV(acc.type)};${acc.balance.toFixed(2).replace('.', ',')}`
    );
  });

  // 3. Cartões de Crédito
  addSection('CARTÕES DE CRÉDITO');
  lines.push('Cartão;Instituição;Limite Total (R$);Fatura Atual (R$);Dia Fechamento;Dia Vencimento');
  data.creditCards.forEach((c) => {
    lines.push(
      `${escapeCSV(c.name)};${escapeCSV(c.institution)};${c.limit.toFixed(2).replace('.', ',')};${c.currentInvoice.toFixed(2).replace('.', ',')};${c.closingDay};${c.dueDay}`
    );
  });

  // 4. Reserva de Emergência
  addSection('RESERVA DE EMERGÊNCIA');
  lines.push('Saldo Atual (R$);Meses Alvo;Gasto Mensal Ref. (R$);Meta Total (R$)');
  const targetTotal =
    data.emergencyConfig.customTargetAmount ||
    data.emergencyConfig.targetMonths * (data.emergencyConfig.monthlyExpenseReference || 3000);
  lines.push(
    `${data.emergencyConfig.currentBalance.toFixed(2).replace('.', ',')};${data.emergencyConfig.targetMonths};${data.emergencyConfig.monthlyExpenseReference.toFixed(2).replace('.', ',')};${targetTotal.toFixed(2).replace('.', ',')}`
  );

  // 5. Metas Financeiras
  addSection('METAS E OBJETIVOS FINANCEIROS');
  lines.push('Meta;Valor Acumulado (R$);Objetivo (R$);Progresso (%);Prazo;Status;Notas');
  data.goals.forEach((g) => {
    const prog = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
    const status = g.completed || prog >= 100 ? 'Concluída' : 'Em Andamento';
    lines.push(
      `${escapeCSV(g.title)};${g.currentAmount.toFixed(2).replace('.', ',')};${g.targetAmount.toFixed(2).replace('.', ',')};${prog.toFixed(1).replace('.', ',')}%;${escapeCSV(g.targetDate)};${status};${escapeCSV(g.notes || '')}`
    );
  });

  // 6. Investimentos
  addSection('CARTEIRA DE ATIVOS DE INVESTIMENTO');
  lines.push('Ativo;Classe;Corretora;Total Investido (R$);Valor Atual (R$);Rentabilidade (%)');
  data.investments.forEach((inv) => {
    const gainPct =
      inv.investedAmount > 0
        ? ((inv.currentValue - inv.investedAmount) / inv.investedAmount) * 100
        : 0;
    lines.push(
      `${escapeCSV(inv.name)};${escapeCSV(inv.assetClass)};${escapeCSV(inv.institution)};${inv.investedAmount.toFixed(2).replace('.', ',')};${inv.currentValue.toFixed(2).replace('.', ',')};${gainPct.toFixed(2).replace('.', ',')}%`
    );
  });

  return '\uFEFF' + lines.join('\r\n');
};

/**
 * Builds standard JSON backup
 */
export const buildFullBackupJSON = (data: {
  transactions: Transaction[];
  categories: Category[];
  accounts: BankAccount[];
  creditCards: CreditCard[];
  emergencyConfig: EmergencyFundConfig;
  emergencyHistory: EmergencyFundRecord[];
  investments: Investment[];
  budgets: BudgetLimit[];
  goals: FinancialGoal[];
}): string => {
  const exportPayload = {
    version: '2.0',
    appName: 'Finanza Gestão Financeira Pessoal',
    exportedAt: new Date().toISOString(),
    systemData: {
      transactionsCount: data.transactions.length,
      accountsCount: data.accounts.length,
      investmentsCount: data.investments.length,
      goalsCount: data.goals.length,
    },
    ...data,
  };
  return JSON.stringify(exportPayload, null, 2);
};
