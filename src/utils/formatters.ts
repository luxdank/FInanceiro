export const formatCurrency = (val: number): string => {
  if (isNaN(val) || val === null || val === undefined) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
};

export const formatPercentage = (val: number, includeSign: boolean = false): string => {
  if (isNaN(val) || val === null || val === undefined) return '0,0%';
  const prefix = includeSign && val > 0 ? '+' : '';
  return `${prefix}${val.toFixed(1).replace('.', ',')}%`;
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      // YYYY-MM-DD
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const d = new Date(dateString);
    return d.toLocaleDateString('pt-BR');
  } catch {
    return dateString;
  }
};

export const formatMonthYear = (monthStr: string): string => {
  // input YYYY-MM
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  try {
    const [year, month] = monthStr.split('-');
    const mIdx = parseInt(month, 10) - 1;
    if (mIdx >= 0 && mIdx < 12) {
      return `${months[mIdx]} ${year}`;
    }
  } catch {
    // fallback
  }
  return monthStr;
};

export const formatMonthShort = (monthStr: string): string => {
  // input YYYY-MM
  const shortMonths = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  try {
    const [, month] = monthStr.split('-');
    const mIdx = parseInt(month, 10) - 1;
    if (mIdx >= 0 && mIdx < 12) {
      return shortMonths[mIdx];
    }
  } catch {
    // fallback
  }
  return monthStr;
};

export const getCurrentMonthString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const getTodayString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
