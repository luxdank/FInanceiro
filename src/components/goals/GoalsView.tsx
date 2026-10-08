import React, { useState, useMemo } from 'react';
import {
  Target,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  CheckCircle2,
  Plane,
  Laptop,
  Home,
  ShieldCheck,
  Car,
  TrendingUp,
  Sparkles,
  Calculator,
  Clock,
  ArrowRight,
  AlertTriangle,
  Lightbulb,
  Check,
  X,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { FinancialGoal } from '../../types/finance';
import { formatCurrency, formatDate, getTodayString } from '../../utils/formatters';
import {
  calculateSmartGoal,
  getDateMonthsAhead,
  formatRemainingDuration,
} from '../../utils/goalUtils';

export const GoalsView: React.FC = () => {
  const { goals, addGoal, updateGoal, deleteGoal, contributeToGoal } = useFinance();

  // Modals & Simulator
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);

  // Filter & Search
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Form Fields
  const [title, setTitle] = useState('');
  const [targetAmountStr, setTargetAmountStr] = useState('');
  const [currentAmountStr, setCurrentAmountStr] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [startDate, setStartDate] = useState(getTodayString());
  const [categoryIcon, setCategoryIcon] = useState('Target');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick Deposit inside Card
  const [contributingGoalId, setContributingGoalId] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState<string>('');
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

  // Near target goals calculation (>= 80% and < 100%)
  const goalsNearTarget = useMemo(() => {
    return goals.filter((g) => {
      if (!g.targetAmount || g.targetAmount <= 0) return false;
      const progress = (g.currentAmount / g.targetAmount) * 100;
      return progress >= 80 && progress < 100;
    });
  }, [goals]);

  // Interactive Simulator State
  const [simMode, setSimMode] = useState<'by_deadline' | 'by_savings'>('by_deadline');
  const [simTargetStr, setSimTargetStr] = useState('15000');
  const [simMonths, setSimMonths] = useState(12);
  const [simSavingsStr, setSimSavingsStr] = useState('1000');

  // Form metrics calculated in real-time
  const modalParsedTarget = parseFloat(targetAmountStr.replace(',', '.')) || 0;
  const modalParsedCurrent = parseFloat(currentAmountStr.replace(',', '.')) || 0;
  const modalMetrics = useMemo(() => {
    return calculateSmartGoal(modalParsedTarget, modalParsedCurrent, targetDate);
  }, [modalParsedTarget, modalParsedCurrent, targetDate]);

  // Global KPIs for Smart Goals Overview
  const smartStats = useMemo(() => {
    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalAccumulated = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const totalRemaining = Math.max(0, totalTarget - totalAccumulated);
    const overallProgress = totalTarget > 0 ? (totalAccumulated / totalTarget) * 100 : 0;

    const activeGoals = goals.filter((g) => {
      const metrics = calculateSmartGoal(g.targetAmount, g.currentAmount, g.targetDate);
      return !metrics.isCompleted;
    });

    const completedGoals = goals.filter((g) => {
      const metrics = calculateSmartGoal(g.targetAmount, g.currentAmount, g.targetDate);
      return metrics.isCompleted;
    });

    // Total monthly savings required across ALL active goals
    const totalMonthlySavingsRequired = activeGoals.reduce((sum, g) => {
      const metrics = calculateSmartGoal(g.targetAmount, g.currentAmount, g.targetDate);
      return sum + metrics.monthlySavingsNeeded;
    }, 0);

    // Goal with nearest deadline
    const sortedByUrgency = [...activeGoals].sort((a, b) => {
      const diffA = new Date(a.targetDate).getTime();
      const diffB = new Date(b.targetDate).getTime();
      return diffA - diffB;
    });
    const nearestGoal = sortedByUrgency[0] || null;

    return {
      totalTarget,
      totalAccumulated,
      totalRemaining,
      overallProgress,
      activeGoalsCount: activeGoals.length,
      completedGoalsCount: completedGoals.length,
      totalMonthlySavingsRequired,
      nearestGoal,
    };
  }, [goals]);

  // Filtered goals list
  const filteredGoals = useMemo(() => {
    return goals
      .filter((g) => {
        const metrics = calculateSmartGoal(g.targetAmount, g.currentAmount, g.targetDate);
        if (activeFilter === 'active' && metrics.isCompleted) return false;
        if (activeFilter === 'completed' && !metrics.isCompleted) return false;
        if (searchTerm.trim()) {
          const s = searchTerm.toLowerCase();
          return (
            g.title.toLowerCase().includes(s) ||
            (g.notes && g.notes.toLowerCase().includes(s))
          );
        }
        return true;
      })
      .sort((a, b) => {
        // Active goals first, sorted by deadline
        const metricsA = calculateSmartGoal(a.targetAmount, a.currentAmount, a.targetDate);
        const metricsB = calculateSmartGoal(b.targetAmount, b.currentAmount, b.targetDate);
        if (metricsA.isCompleted !== metricsB.isCompleted) {
          return metricsA.isCompleted ? 1 : -1;
        }
        return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
      });
  }, [goals, activeFilter, searchTerm]);

  // Simulator dynamic results
  const simTarget = parseFloat(simTargetStr.replace(',', '.')) || 0;
  const simSavings = parseFloat(simSavingsStr.replace(',', '.')) || 0;
  const simRequiredMonthly = simMonths > 0 && simTarget > 0 ? simTarget / simMonths : 0;
  const simRequiredMonths = simSavings > 0 && simTarget > 0 ? Math.ceil(simTarget / simSavings) : 0;

  const handleOpenNew = (presetTarget?: number, presetDate?: string) => {
    setEditingGoal(null);
    setTitle('');
    setTargetAmountStr(presetTarget ? String(presetTarget) : '');
    setCurrentAmountStr('0');
    setTargetDate(presetDate || getDateMonthsAhead(12));
    setStartDate(getTodayString());
    setCategoryIcon('Target');
    setNotes('');
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (goal: FinancialGoal) => {
    setEditingGoal(goal);
    setTitle(goal.title);
    setTargetAmountStr(String(goal.targetAmount));
    setCurrentAmountStr(String(goal.currentAmount));
    setTargetDate(goal.targetDate);
    setStartDate(goal.startDate);
    setCategoryIcon(goal.categoryIcon);
    setNotes(goal.notes || '');
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const target = parseFloat(targetAmountStr.replace(',', '.'));
    const current = parseFloat(currentAmountStr.replace(',', '.')) || 0;

    if (isNaN(target) || target <= 0) {
      setErrorMessage('Informe um valor objetivo válido maior que zero.');
      return;
    }

    if (!targetDate) {
      setErrorMessage('Por favor, informe a data limite para o seu objetivo.');
      return;
    }

    if (editingGoal) {
      updateGoal(editingGoal.id, {
        title: title.trim(),
        targetAmount: target,
        currentAmount: current,
        targetDate,
        startDate,
        categoryIcon,
        notes: notes.trim(),
        completed: current >= target,
      });
    } else {
      addGoal({
        title: title.trim(),
        targetAmount: target,
        currentAmount: current,
        targetDate,
        startDate,
        categoryIcon,
        notes: notes.trim(),
        completed: current >= target,
      });
    }

    setIsModalOpen(false);
  };

  const handleContribute = (id: string) => {
    const val = parseFloat(contributionAmount.replace(',', '.'));
    if (!isNaN(val) && val > 0) {
      contributeToGoal(id, val);
    }
    setContributingGoalId(null);
    setContributionAmount('');
  };

  const handleApplySimulatorToNewGoal = () => {
    const months = simMode === 'by_deadline' ? simMonths : simRequiredMonths;
    const date = getDateMonthsAhead(months);
    handleOpenNew(simTarget, date);
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Plane':
        return <Plane className="w-5 h-5 text-sky-600" />;
      case 'Laptop':
        return <Laptop className="w-5 h-5 text-indigo-600" />;
      case 'Home':
        return <Home className="w-5 h-5 text-amber-600" />;
      case 'Car':
        return <Car className="w-5 h-5 text-emerald-600" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-teal-600" />;
      default:
        return <Target className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Metas & Sonhos Financeiros
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-extrabold shadow-2xs">
              <Sparkles className="w-3 h-3" />
              Metas Inteligentes
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Planeje objetivos com prazos reais. O sistema calcula automaticamente o ritmo de poupança mensal necessário para você realizar cada conquista.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsSimulatorOpen(!isSimulatorOpen)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Calculator className="w-3.5 h-3.5 text-blue-600" />
            <span>Simulador de Poupança</span>
            {isSimulatorOpen ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          <button
            onClick={() => handleOpenNew()}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Nova Meta</span>
          </button>
        </div>
      </div>

      {/* Internal In-Interface Notification Alert: Goals Near Target */}
      {goalsNearTarget.length > 0 && !isBannerDismissed && (
        <div className="rounded-2xl p-4 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 border-2 border-amber-400/80 shadow-md animate-in fade-in slide-in-from-top-2 duration-300 relative overflow-hidden">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 w-full">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/30">
                <Target className="w-5 h-5 animate-pulse" />
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500 text-white font-extrabold text-[10px] tracking-wide uppercase shadow-xs">
                    🔔 Alerta de Meta Próxima
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    Você está prestes a realizar seu objetivo de economia!
                  </span>
                </div>
                <div className="space-y-2 pt-1">
                  {goalsNearTarget.map((ng) => {
                    const prog = Math.min(100, Math.round((ng.currentAmount / ng.targetAmount) * 100));
                    const remaining = Math.max(0, ng.targetAmount - ng.currentAmount);
                    return (
                      <div
                        key={ng.id}
                        className="p-3 bg-white/95 backdrop-blur-xs rounded-xl border border-amber-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-slate-900">{ng.title}</span>
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-extrabold text-xs">
                              {prog}% Concluído
                            </span>
                          </div>
                          <p className="text-xs text-slate-600">
                            Faltam apenas{' '}
                            <strong className="font-bold text-amber-700">
                              {formatCurrency(remaining)}
                            </strong>{' '}
                            para completar a meta de economia de {formatCurrency(ng.targetAmount)}!
                          </p>
                          <div className="w-full sm:w-72 h-2 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                            <div
                              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                              style={{ width: `${prog}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setContributingGoalId(ng.id);
                              setContributionAmount(remaining.toString());
                            }}
                            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Completar Agora ({formatCurrency(remaining)})</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsBannerDismissed(true)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-black/5 transition-colors cursor-pointer shrink-0"
              title="Dispensar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Smart Goals KPI Overview Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* KPI 1: Poupança Mensal Total Necessária */}
        <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-4 text-white shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-blue-200 text-xs mb-1">
            <span className="font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Poupança Mensal Recomendada
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold tracking-tight">
            {formatCurrency(smartStats.totalMonthlySavingsRequired)}
            <span className="text-xs font-normal text-blue-200 ml-1">/ mês</span>
          </p>
          <p className="text-[11px] text-blue-200/80 mt-1">
            Para cumprir todas as suas {smartStats.activeGoalsCount} metas no prazo estipulado.
          </p>
        </div>

        {/* KPI 2: Progresso Acumulado */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold">Acumulado em Metas</span>
            <span className="text-blue-600 font-bold">
              {smartStats.overallProgress.toFixed(0)}%
            </span>
          </div>
          <p className="text-xl font-bold text-slate-900">
            {formatCurrency(smartStats.totalAccumulated)}
          </p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, smartStats.overallProgress)}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            De {formatCurrency(smartStats.totalTarget)} planejados
          </span>
        </div>

        {/* KPI 3: Status das Conquistas */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold mb-1">Status das Metas</div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-xl font-bold text-slate-900">
              {smartStats.activeGoalsCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">em andamento</span>
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs">
            <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {smartStats.completedGoalsCount} concluídas
            </span>
            <span className="text-slate-400 text-[11px]">
              Total: {goals.length}
            </span>
          </div>
        </div>

        {/* KPI 4: Próxima Meta no Horizonte */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold flex items-center gap-1 text-amber-700">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                Próximo Prazo
              </span>
            </div>
            {smartStats.nearestGoal ? (
              <>
                <p className="font-bold text-slate-900 text-sm truncate">
                  {smartStats.nearestGoal.title}
                </p>
                <p className="text-xs text-blue-600 font-bold mt-0.5">
                  Poupar {formatCurrency(
                    calculateSmartGoal(
                      smartStats.nearestGoal.targetAmount,
                      smartStats.nearestGoal.currentAmount,
                      smartStats.nearestGoal.targetDate
                    ).monthlySavingsNeeded
                  )}/mês
                </p>
              </>
            ) : (
              <p className="text-xs text-slate-400 mt-1">Nenhuma meta ativa no momento.</p>
            )}
          </div>
          {smartStats.nearestGoal && (
            <span className="text-[10px] text-slate-400 mt-2 block">
              Vence em {formatDate(smartStats.nearestGoal.targetDate)}
            </span>
          )}
        </div>
      </div>

      {/* Retractable Interactive Smart Simulator */}
      {isSimulatorOpen && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-white rounded-2xl border border-blue-200/80 p-5 shadow-xs space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-100 pb-3">
            <div className="flex items-center gap-2 text-blue-900">
              <Calculator className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-sm">Simulador Inteligente de Metas & Prazos</h3>
            </div>
            <div className="flex items-center gap-1 rounded-xl bg-white p-1 text-xs border border-blue-100">
              <button
                onClick={() => setSimMode('by_deadline')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  simMode === 'by_deadline'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Por Prazo (Meses)
              </button>
              <button
                onClick={() => setSimMode('by_savings')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  simMode === 'by_savings'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Por Capacidade Mensal
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Input Target */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Quanto você quer juntar? (R$)
              </label>
              <input
                type="number"
                min="100"
                step="100"
                value={simTargetStr}
                onChange={(e) => setSimTargetStr(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 15000"
              />
            </div>

            {/* Input Param */}
            {simMode === 'by_deadline' ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Em quanto tempo? ({simMonths} {simMonths === 1 ? 'mês' : 'meses'})
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="60"
                    value={simMonths}
                    onChange={(e) => setSimMonths(Number(e.target.value))}
                    className="flex-1 accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <span className="w-12 text-center text-xs font-bold text-blue-700 bg-white border border-blue-200 rounded-lg py-1">
                    {simMonths}m
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quanto pode guardar por mês? (R$)
                </label>
                <input
                  type="number"
                  min="50"
                  step="50"
                  value={simSavingsStr}
                  onChange={(e) => setSimSavingsStr(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 1000"
                />
              </div>
            )}

            {/* Simulated Result Card */}
            <div className="bg-white rounded-xl p-3.5 border border-blue-200 shadow-2xs flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  {simMode === 'by_deadline'
                    ? 'Poupança Recomendada'
                    : 'Tempo Estimado'}
                </span>
                <span className="text-base sm:text-lg font-extrabold text-blue-700">
                  {simMode === 'by_deadline'
                    ? `${formatCurrency(simRequiredMonthly)} / mês`
                    : `${simRequiredMonths} meses (~${(simRequiredMonths / 12).toFixed(1)} anos)`}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {simMode === 'by_deadline'
                    ? `~${formatCurrency(simRequiredMonthly / 4.333)} por semana`
                    : `Meta em ${formatDate(getDateMonthsAhead(simRequiredMonths))}`}
                </span>
              </div>

              <button
                onClick={handleApplySimulatorToNewGoal}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shrink-0 flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
              >
                <span>Criar Meta</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex overflow-x-auto no-scrollbar rounded-xl bg-slate-100 p-1 text-xs font-semibold gap-1 w-full sm:w-fit">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeFilter === 'all'
                ? 'bg-white text-blue-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todas as Metas ({goals.length})
          </button>
          <button
            onClick={() => setActiveFilter('active')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeFilter === 'active'
                ? 'bg-white text-blue-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Em Andamento ({smartStats.activeGoalsCount})
          </button>
          <button
            onClick={() => setActiveFilter('completed')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeFilter === 'completed'
                ? 'bg-white text-blue-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Concluídas ({smartStats.completedGoalsCount})
          </button>
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Buscar meta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Goals Grid */}
      {filteredGoals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Target className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-800 text-sm">
            {searchTerm
              ? 'Nenhuma meta encontrada para essa busca.'
              : activeFilter === 'completed'
              ? 'Nenhuma meta concluída ainda.'
              : 'Nenhuma meta cadastrada no momento.'}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Defina sonhos concretos para direcionar sua economia com propósito e prazos claros.
          </p>
          <button
            onClick={() => handleOpenNew()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            + Criar Minha Primeira Meta
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGoals.map((goal) => {
            const metrics = calculateSmartGoal(
              goal.targetAmount,
              goal.currentAmount,
              goal.targetDate
            );
            const isContributing = contributingGoalId === goal.id;

            return (
              <div
                key={goal.id}
                className={`bg-white rounded-2xl border p-5 shadow-2xs space-y-4 transition-all hover:shadow-md ${
                  metrics.isCompleted
                    ? 'border-emerald-300 ring-1 ring-emerald-200/50 bg-emerald-50/15'
                    : metrics.isOverdue
                    ? 'border-rose-300 bg-rose-50/10'
                    : 'border-slate-200/80 hover:border-blue-200'
                }`}
              >
                {/* Header with Icon, Title and Status Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 shrink-0">
                      {renderIcon(goal.categoryIcon)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-tight">
                        {goal.title}
                      </h4>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        Prazo: {formatDate(goal.targetDate)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${metrics.statusBadgeColor}`}
                    >
                      {metrics.statusLabel}
                    </span>
                    <button
                      onClick={() => handleOpenEdit(goal)}
                      className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Editar meta"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Excluir meta"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* SMART SAVINGS RECOMMENDATION HIGHLIGHT BOX */}
                {!metrics.isCompleted ? (
                  <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/60 rounded-xl p-3 border border-blue-100/80 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-blue-900 tracking-wider block">
                          Poupança Mensal Recomendada
                        </span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-sm font-extrabold text-blue-800">
                            {formatCurrency(metrics.monthlySavingsNeeded)}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">/ mês</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-semibold text-slate-500 block">
                        {formatRemainingDuration(metrics.daysRemaining, metrics.monthsRemaining)}
                      </span>
                      <span className="text-[9px] text-blue-600 font-bold block">
                        ~{formatCurrency(metrics.weeklySavingsNeeded)}/semana
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-50 rounded-xl p-2.5 border border-emerald-200 flex items-center gap-2 text-emerald-800 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Objetivo atingido! Parabéns pelo planejamento e disciplina!</span>
                  </div>
                )}

                {/* Progress Bar & Amounts */}
                <div className="space-y-1.5">
                  <div className="flex items-baseline justify-between text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">
                        Acumulado
                      </span>
                      <span className="font-extrabold text-slate-800 text-base">
                        {formatCurrency(goal.currentAmount)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">
                        Objetivo
                      </span>
                      <span className="font-bold text-slate-600">
                        {formatCurrency(goal.targetAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        metrics.isCompleted
                          ? 'bg-emerald-500'
                          : metrics.progressPercent > 70
                          ? 'bg-blue-600'
                          : 'bg-indigo-500'
                      }`}
                      style={{ width: `${metrics.progressPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="font-bold text-blue-600">
                      {metrics.progressPercent.toFixed(1)}% concluído
                    </span>
                    <span className="text-slate-500 font-medium">
                      {metrics.isCompleted
                        ? 'Meta Concluída'
                        : `Faltam ${formatCurrency(metrics.remainingAmount)}`}
                    </span>
                  </div>
                </div>

                {/* Quick Contribute Bar */}
                {isContributing ? (
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600">Aporte: R$</span>
                    <input
                      type="number"
                      step="50"
                      min="1"
                      autoFocus
                      placeholder="0,00"
                      value={contributionAmount}
                      onChange={(e) => setContributionAmount(e.target.value)}
                      className="w-24 px-2 py-1 text-xs border border-blue-400 rounded font-bold"
                    />
                    <button
                      onClick={() => handleContribute(goal.id)}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold cursor-pointer"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => setContributingGoalId(null)}
                      className="px-1.5 py-1 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-[11px] text-slate-400 truncate max-w-xs">
                      {goal.notes || 'Foco no longo prazo'}
                    </span>
                    <button
                      onClick={() => {
                        setContributingGoalId(goal.id);
                        setContributionAmount('');
                      }}
                      className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      + Aportar na Meta
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal to Create/Edit Smart Goal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto pb-[max(1.5rem,env(safe-area-inset-bottom))] animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 duration-200">
            {/* Mobile Grab Handle */}
            <div className="sm:hidden w-10 h-1 bg-slate-300 rounded-full mx-auto -mt-1 mb-2" />

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {editingGoal ? 'Editar Meta Financeira' : 'Nova Meta Inteligente'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Defina o valor e a data para o cálculo automático de poupança mensal.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome do Sonho / Meta</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Viagem de Férias, Carro Novo, Entrada Imóvel, Reserva de Casamento..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Valor Alvo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="0,00"
                    value={targetAmountStr}
                    onChange={(e) => setTargetAmountStr(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-bold text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Valor Já Guardado (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={currentAmountStr}
                    onChange={(e) => setCurrentAmountStr(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-bold text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Prazo / Data Alvo</label>
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />

                {/* Quick Date Shortcuts */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2">
                  <span className="text-[10px] text-slate-400 font-semibold mr-1">Atalhos:</span>
                  {[
                    { label: '+3 meses', m: 3 },
                    { label: '+6 meses', m: 6 },
                    { label: '+1 ano', m: 12 },
                    { label: '+2 anos', m: 24 },
                    { label: '+5 anos', m: 60 },
                  ].map((preset) => (
                    <button
                      type="button"
                      key={preset.label}
                      onClick={() => setTargetDate(getDateMonthsAhead(preset.m))}
                      className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-600 text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* LIVE SMART DIAGNOSTIC PREVIEW */}
              {modalParsedTarget > 0 && targetDate && (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50/70 to-slate-50 border border-blue-200/90 space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2 text-blue-900 font-bold">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>Cálculo Inteligente de Poupança</span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <span className="text-slate-600 font-medium">Você precisa guardar:</span>
                    <span className="text-base font-extrabold text-blue-700">
                      {formatCurrency(modalMetrics.monthlySavingsNeeded)}
                      <span className="text-xs font-normal text-slate-500"> / mês</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-blue-100 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Ritmo semanal sugerido</span>
                      <span className="font-bold text-slate-700">
                        ~{formatCurrency(modalMetrics.weeklySavingsNeeded)}/semana
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Tempo até o prazo</span>
                      <span className="font-bold text-slate-700">
                        {formatRemainingDuration(modalMetrics.daysRemaining, modalMetrics.monthsRemaining)}
                      </span>
                    </div>
                  </div>

                  {modalMetrics.isOverdue && (
                    <p className="text-[11px] text-rose-600 font-semibold pt-1">
                      ⚠️ Atenção: A data selecionada já passou. Considere estender o prazo para um cálculo realista.
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ícone</label>
                  <select
                    value={categoryIcon}
                    onChange={(e) => setCategoryIcon(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-white font-medium"
                  >
                    <option value="Target">Alvo (Geral)</option>
                    <option value="Plane">Viagem / Férias</option>
                    <option value="Laptop">Tecnologia / Estudos</option>
                    <option value="Home">Imóvel / Casa</option>
                    <option value="Car">Carro / Veículo</option>
                    <option value="ShieldCheck">Segurança & Reserva</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Data de Início</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Observações (Opcional)</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Guardar todo dia 5 logo após o salário..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl resize-none font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Salvar Meta Inteligente</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
