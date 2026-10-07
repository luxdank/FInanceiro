export interface SmartGoalMetrics {
  remainingAmount: number;
  monthsRemaining: number;
  daysRemaining: number;
  effectiveMonths: number;
  monthlySavingsNeeded: number;
  weeklySavingsNeeded: number;
  dailySavingsNeeded: number;
  progressPercent: number;
  isCompleted: boolean;
  isOverdue: boolean;
  statusLabel: string;
  statusBadgeColor: string;
}

/**
 * Calculates smart goal savings metrics:
 * - How much to save per month
 * - How much to save per week
 * - Remaining duration in months and days
 * - Health and pace status
 */
export const calculateSmartGoal = (
  targetAmount: number,
  currentAmount: number,
  targetDate: string
): SmartGoalMetrics => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const parts = targetDate ? targetDate.split('-').map(Number) : [];
  const deadline =
    parts.length === 3
      ? new Date(parts[0], parts[1] - 1, parts[2])
      : new Date(targetDate || now);
  deadline.setHours(0, 0, 0, 0);

  const remainingAmount = Math.max(0, targetAmount - currentAmount);
  const progressPercent =
    targetAmount > 0 ? Math.min(100, (currentAmount / targetAmount) * 100) : 0;
  const isCompleted = currentAmount >= targetAmount && targetAmount > 0;

  // Days remaining
  const msDiff = deadline.getTime() - now.getTime();
  const daysRemaining = Math.ceil(msDiff / (1000 * 60 * 60 * 24));
  const isOverdue = daysRemaining < 0 && !isCompleted;

  // Months difference
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const targetYear = deadline.getFullYear();
  const targetMonth = deadline.getMonth();

  let monthsRemaining = (targetYear - currentYear) * 12 + (targetMonth - currentMonth);
  const dayOffset = deadline.getDate() - now.getDate();
  if (dayOffset > 10) {
    monthsRemaining += 0.5;
  }

  // Minimum effective month is 1 if deadline is in current month or positive
  const effectiveMonths = Math.max(1, Math.round(monthsRemaining));

  let monthlySavingsNeeded = 0;
  let weeklySavingsNeeded = 0;
  let dailySavingsNeeded = 0;

  if (!isCompleted) {
    if (daysRemaining > 0) {
      monthlySavingsNeeded = remainingAmount / effectiveMonths;
      weeklySavingsNeeded = remainingAmount / Math.max(1, daysRemaining / 7);
      dailySavingsNeeded = remainingAmount / Math.max(1, daysRemaining);
    } else {
      // Due today or overdue
      monthlySavingsNeeded = remainingAmount;
      weeklySavingsNeeded = remainingAmount;
      dailySavingsNeeded = remainingAmount;
    }
  }

  let statusLabel = 'No Ritmo';
  let statusBadgeColor = 'bg-blue-50 text-blue-700 border-blue-200';

  if (isCompleted) {
    statusLabel = 'Meta Concluída';
    statusBadgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (isOverdue) {
    statusLabel = 'Prazo Vencido';
    statusBadgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (daysRemaining <= 30) {
    statusLabel = 'Reta Final';
    statusBadgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (progressPercent >= 75) {
    statusLabel = 'Quase Lá (75%+)';
    statusBadgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-200';
  }

  return {
    remainingAmount,
    monthsRemaining: Math.max(0, monthsRemaining),
    daysRemaining,
    effectiveMonths,
    monthlySavingsNeeded,
    weeklySavingsNeeded,
    dailySavingsNeeded,
    progressPercent,
    isCompleted,
    isOverdue,
    statusLabel,
    statusBadgeColor,
  };
};

/**
 * Returns a date string (YYYY-MM-DD) N months in the future from today
 */
export const getDateMonthsAhead = (months: number): string => {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Formats duration in months or days nicely in Portuguese
 */
export const formatRemainingDuration = (days: number, months: number): string => {
  if (days <= 0) return 'Prazo atingido';
  if (days < 30) return `${days} ${days === 1 ? 'dia restante' : 'dias restantes'}`;
  const roundedMonths = Math.round(months);
  if (roundedMonths <= 1) return '~1 mês restante';
  if (roundedMonths < 12) return `~${roundedMonths} meses restantes`;
  const years = (roundedMonths / 12).toFixed(1).replace('.0', '');
  return `~${years} ${years === '1' ? 'ano' : 'anos'} (${roundedMonths} meses)`;
};
