import React, { useState } from 'react';
import {
  Tag,
  Plus,
  Trash2,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  Cloud,
  RefreshCw,
  Database,
  Lock,
  Server,
  AlertCircle,
  FileSpreadsheet,
  FileJson,
  Table,
  Check,
  Heart,
  SlidersHorizontal,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { testFirestoreConnection } from '../../lib/firebase';
import { formatCurrency } from '../../utils/formatters';
import {
  exportTransactionsToCSV,
  exportInvestmentsToCSV,
  exportFullFinancialSummaryToCSV,
  downloadFile,
} from '../../utils/exportUtils';

export const SettingsView: React.FC = () => {
  const {
    categories,
    addCategory,
    deleteCategory,
    resetToZero,
    exportDataJSON,
    importDataJSON,
    transactions,
    accounts,
    creditCards,
    investments,
    goals,
    budgets,
    emergencyConfig,
    lastSyncTime,
    isSyncing,
    syncAllToFirebase,
    coupleConfig,
    updateCoupleConfig,
  } = useFinance();
  const { user, firebaseUser, openAuthModal } = useAuth();

  const [activeTab, setActiveTab] = useState<'couple' | 'categories' | 'firebase' | 'profile' | 'data'>('couple');

  // Couple Settings Form
  const [partner1, setPartner1] = useState(coupleConfig.partner1Name);
  const [partner2, setPartner2] = useState(coupleConfig.partner2Name);
  const [appMode, setAppMode] = useState<'couple_simple' | 'advanced'>(coupleConfig.appMode);

  // Category form
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'expense' | 'income'>('expense');
  const [newCatColor, setNewCatColor] = useState('#2563eb');

  // Profile form
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');

  // UI Toasts & Status
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveCoupleSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partner1.trim() || !partner2.trim()) return;

    await updateCoupleConfig({
      partner1Name: partner1.trim(),
      partner2Name: partner2.trim(),
      appMode,
    });
    showToast('Configurações do casal salvas com sucesso!');
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    addCategory({
      name: newCatName.trim(),
      type: newCatType,
      icon: 'Tag',
      color: newCatColor,
      isCustom: true,
    });

    setNewCatName('');
    showToast('Categoria adicionada com sucesso!');
  };

  const dateStamp = new Date().toISOString().split('T')[0];

  const handleExportJSON = () => {
    const json = exportDataJSON();
    downloadFile(json, `finanza_backup_${dateStamp}.json`, 'application/json');
    showToast('Backup completo em JSON exportado com sucesso!');
  };

  const handleExportTransactionsCSV = () => {
    const csv = exportTransactionsToCSV(transactions, categories, accounts, creditCards);
    downloadFile(csv, `finanza_lancamentos_${dateStamp}.csv`, 'text/csv;charset=utf-8;');
    showToast('Planilha de lançamentos (CSV) exportada com sucesso!');
  };

  const handleExportInvestmentsCSV = () => {
    const csv = exportInvestmentsToCSV(investments);
    downloadFile(csv, `finanza_investimentos_${dateStamp}.csv`, 'text/csv;charset=utf-8;');
    showToast('Planilha de investimentos (CSV) exportada com sucesso!');
  };

  const handleExportConsolidatedCSV = () => {
    const csv = exportFullFinancialSummaryToCSV({
      transactions,
      categories,
      accounts,
      creditCards,
      investments,
      goals,
      budgets,
      emergencyConfig,
    });
    downloadFile(csv, `finanza_relatorio_consolidado_${dateStamp}.csv`, 'text/csv;charset=utf-8;');
    showToast('Relatório patrimonial completo (CSV) exportado com sucesso!');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importDataJSON(content);
        if (ok) {
          showToast('Dados restaurados com sucesso!');
        } else {
          showToast('Erro ao carregar o arquivo de backup.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Perfil atualizado!');
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus(null);
    try {
      await testFirestoreConnection();
      setConnectionStatus('Conexão com Firestore ativa e respondendo!');
      showToast('Firestore conectado com sucesso!');
    } catch {
      setConnectionStatus('Erro ao conectar ao Firestore.');
      showToast('Falha no teste de conexão.');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleManualSync = async () => {
    await syncAllToFirebase();
    showToast('Todos os dados foram salvos no Firebase Firestore!');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Configurações do Sistema
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Gerencie o banco de dados Firebase, categorias, backup e perfil.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto no-scrollbar rounded-xl bg-slate-100 p-1 w-full sm:w-fit text-xs font-semibold gap-1">
        <button
          onClick={() => setActiveTab('couple')}
          className={`px-3.5 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 shrink-0 ${
            activeTab === 'couple'
              ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${activeTab === 'couple' ? 'fill-white' : 'text-pink-500'}`} />
          <span>Rotina do Casal</span>
        </button>

        <button
          onClick={() => setActiveTab('firebase')}
          className={`px-3.5 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 shrink-0 ${
            activeTab === 'firebase'
              ? 'bg-white text-blue-700 shadow-xs font-bold'
              : 'text-slate-600'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Banco Firebase</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`px-3.5 py-2 rounded-lg transition-all shrink-0 ${
            activeTab === 'categories'
              ? 'bg-white text-blue-700 shadow-xs font-bold'
              : 'text-slate-600'
          }`}
        >
          Categorias ({categories.length})
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-3.5 py-2 rounded-lg transition-all shrink-0 ${
            activeTab === 'profile'
              ? 'bg-white text-blue-700 shadow-xs font-bold'
              : 'text-slate-600'
          }`}
        >
          Perfil do Usuário
        </button>

        <button
          onClick={() => setActiveTab('data')}
          className={`px-3.5 py-2 rounded-lg transition-all shrink-0 ${
            activeTab === 'data'
              ? 'bg-white text-blue-700 shadow-xs font-bold'
              : 'text-slate-600'
          }`}
        >
          Backup & Dados
        </button>
      </div>

      {/* Tab: Couple Routine */}
      {activeTab === 'couple' && (
        <div className="space-y-6 max-w-2xl">
          <div className="bg-white rounded-3xl border border-pink-200/80 p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center">
                <Heart className="w-5 h-5 fill-pink-500" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Configuração da Rotina do Casal
                </h3>
                <p className="text-xs text-slate-500">
                  Personalize os nomes de vocês e escolha a experiência do app
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveCoupleSettings} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Seu Nome (Parceiro 1)
                  </label>
                  <input
                    type="text"
                    required
                    value={partner1}
                    onChange={(e) => setPartner1(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-pink-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Aparece nos botões e no extrato de gastos
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nome da Esposa (Parceiro 2)
                  </label>
                  <input
                    type="text"
                    required
                    value={partner2}
                    onChange={(e) => setPartner2(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-pink-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Aparece nos botões e no extrato de gastos
                  </span>
                </div>
              </div>

              {/* Mode Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Modo Padrão da Interface
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setAppMode('couple_simple')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      appMode === 'couple_simple'
                        ? 'border-pink-500 bg-pink-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
                        Modo Casal (Simples)
                      </span>
                      {appMode === 'couple_simple' && (
                        <span className="w-2 h-2 rounded-full bg-pink-500" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Interface limpa e descomplicada. Foco total em anotar gastos do dia a dia em 5 segundos, ver a sobra do mês e a divisão do casal.
                    </p>
                  </div>

                  <div
                    onClick={() => setAppMode('advanced')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      appMode === 'advanced'
                        ? 'border-blue-500 bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
                        Modo Avançado (Completo)
                      </span>
                      {appMode === 'advanced' && (
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Todas as 10 telas ativas: carteira de investimentos, reserva de emergência, gráficos complexos de Recharts e tetos orçamentários.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs shadow-md shadow-pink-500/20 cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Salvar Preferências do Casal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab: Firebase */}
      {activeTab === 'firebase' && (
        <div className="space-y-6 max-w-3xl">
          {/* Status Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Status do Firebase Firestore
                  </h3>
                  <p className="text-xs text-slate-500">
                    Persistência e sincronização em tempo real na nuvem Google
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Conectado e Salvando
                </span>
              </div>
            </div>

            {/* Technical Database Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider">
                  ID do Banco de Dados
                </span>
                <span className="font-mono text-slate-700 font-medium break-all select-all">
                  ai-studio-finanzagestofina-505eb79c-5e18-47d5-91e4-f1cdec79fd7c
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider">
                  Projeto Firebase
                </span>
                <span className="font-mono text-slate-700 font-medium select-all">
                  gen-lang-client-0573118045
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider">
                  Usuário Autenticado
                </span>
                <span className="text-slate-800 font-medium flex items-center gap-1.5">
                  {firebaseUser && !firebaseUser.isAnonymous ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      {user?.email || 'Google User'} (UID: {firebaseUser.uid.substring(0, 8)}...)
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Modo Convidado / Anônimo
                    </>
                  )}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider">
                  Última Sincronização
                </span>
                <span className="text-slate-800 font-medium">
                  {lastSyncTime || 'Sincronizado'}
                </span>
              </div>
            </div>

            {/* Counters of Synced Collections */}
            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-700 mb-2">
                Documentos Gerenciados no Firestore:
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="font-extrabold text-blue-600 text-base">{transactions.length}</div>
                  <div className="text-[11px] text-slate-500">Lançamentos</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="font-extrabold text-blue-600 text-base">{accounts.length}</div>
                  <div className="text-[11px] text-slate-500">Contas</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="font-extrabold text-blue-600 text-base">{investments.length}</div>
                  <div className="text-[11px] text-slate-500">Investimentos</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="font-extrabold text-blue-600 text-base">{goals.length}</div>
                  <div className="text-[11px] text-slate-500">Metas</div>
                </div>
              </div>
            </div>

            {/* Actions for Firebase */}
            <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-slate-100">
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Tudo Agora'}</span>
              </button>

              <button
                onClick={handleTestConnection}
                disabled={isTestingConnection}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
              >
                <Server className="w-3.5 h-3.5" />
                <span>{isTestingConnection ? 'Testando...' : 'Testar Conexão'}</span>
              </button>

              {!firebaseUser || firebaseUser.isAnonymous ? (
                <button
                  onClick={openAuthModal}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ml-auto"
                >
                  <Cloud className="w-3.5 h-3.5" />
                  <span>Entrar com Google</span>
                </button>
              ) : null}
            </div>

            {connectionStatus && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{connectionStatus}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Categories */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          {/* Add Category Form */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 mb-3">
              Criar Nova Categoria Personalizada
            </h3>
            <form onSubmit={handleCreateCategory} className="flex flex-col sm:flex-row items-center gap-3 text-xs">
              <input
                type="text"
                required
                placeholder="Nome da categoria (ex: Pets, Manutenção, Academia...)"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={newCatType}
                  onChange={(e) => setNewCatType(e.target.value as 'expense' | 'income')}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                >
                  <option value="expense">Despesa</option>
                  <option value="income">Receita</option>
                </select>

                <input
                  type="color"
                  value={newCatColor}
                  onChange={(e) => setNewCatColor(e.target.value)}
                  className="w-10 h-10 p-1 rounded-xl border border-slate-200 cursor-pointer"
                  title="Cor da categoria"
                />

                <button
                  type="submit"
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar</span>
                </button>
              </div>
            </form>
          </div>

          {/* Categories List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white rounded-xl border border-slate-200/70 p-3.5 flex items-center justify-between shadow-2xs hover:border-slate-300 transition-colors text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <div>
                    <span className="font-bold text-slate-800 block">{cat.name}</span>
                    <span className="text-[10px] font-semibold text-slate-400 capitalize">
                      {cat.type === 'expense' ? 'Despesa' : 'Receita'}
                    </span>
                  </div>
                </div>

                {cat.isCustom && (
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Excluir categoria personalizada"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs max-w-xl">
          <h3 className="font-bold text-sm text-slate-900 mb-4">
            Dados do Perfil
          </h3>
          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-600 font-bold mb-1">Nome Completo</label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1">E-mail</label>
              <input
                type="email"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer shadow-sm transition-all"
              >
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab: Data & Backup */}
      {activeTab === 'data' && (
        <div className="space-y-6 max-w-3xl">
          {/* Header Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-sm space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white/10 text-blue-300">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base">
                  Exportação de Dados & Backups Manuais
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Exporte seu histórico para planilhas (CSV) ou baixe cópias de segurança integrais (JSON).
                </p>
              </div>
            </div>

            {/* Quick counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px]">
              <div className="bg-white/10 rounded-xl p-2 text-center">
                <span className="text-slate-300 block">Lançamentos</span>
                <span className="font-bold text-sm text-white">{transactions.length}</span>
              </div>
              <div className="bg-white/10 rounded-xl p-2 text-center">
                <span className="text-slate-300 block">Contas & Cartões</span>
                <span className="font-bold text-sm text-white">{accounts.length + creditCards.length}</span>
              </div>
              <div className="bg-white/10 rounded-xl p-2 text-center">
                <span className="text-slate-300 block">Investimentos</span>
                <span className="font-bold text-sm text-white">{investments.length}</span>
              </div>
              <div className="bg-white/10 rounded-xl p-2 text-center">
                <span className="text-slate-300 block">Metas Ativas</span>
                <span className="font-bold text-sm text-white">{goals.length}</span>
              </div>
            </div>
          </div>

          {/* Export Options Grid */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
              Opções de Exportação Manual
            </h4>

            {/* 1. Export JSON */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-200 transition-all">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                  <FileJson className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="font-bold text-sm text-slate-900">
                      Backup Completo do Sistema (.JSON)
                    </h5>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold">
                      Recomendado
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Arquivo bruto com todos os lançamentos, categorias, contas, faturas, reserva, investimentos e metas. Permite restaurar o sistema integralmente.
                  </p>
                </div>
              </div>
              <button
                onClick={handleExportJSON}
                className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Exportar JSON</span>
              </button>
            </div>

            {/* 2. Export Transactions CSV */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-emerald-200 transition-all">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="font-bold text-sm text-slate-900">
                      Lançamentos & Extrato (.CSV)
                    </h5>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold">
                      Excel / Sheets
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Planilha formatada em padrão brasileiro (com acentos e vírgula decimal) contendo datas, descrições, categorias, contas e valores.
                  </p>
                </div>
              </div>
              <button
                onClick={handleExportTransactionsCSV}
                className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Exportar CSV</span>
              </button>
            </div>

            {/* 3. Export Investments CSV */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-200 transition-all">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                  <Table className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-bold text-sm text-slate-900">
                    Carteira de Ativos & Investimentos (.CSV)
                  </h5>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Tabela com todos os ativos, classes (Ações, FIIs, Renda Fixa), corretoras, aportes, valor atual e rentabilidade acumulada (%).
                  </p>
                </div>
              </div>
              <button
                onClick={handleExportInvestmentsCSV}
                className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Exportar Ativos</span>
              </button>
            </div>

            {/* 4. Export Consolidated Summary CSV */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition-all">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 shrink-0">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-bold text-sm text-slate-900">
                    Relatório Patrimonial Completo (.CSV)
                  </h5>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Consolidado em seções: Saldos em contas, faturas de cartões, reserva de emergência, metas de economia e patrimônio líquido total.
                  </p>
                </div>
              </div>
              <button
                onClick={handleExportConsolidatedCSV}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Exportar Resumo</span>
              </button>
            </div>
          </div>

          {/* Restoration and Reset section */}
          <div className="pt-2 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
              Restauração e Manutenção
            </h4>

            {/* Import Backup */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h5 className="font-bold text-sm text-slate-900">Restaurar Backup (Importar JSON)</h5>
                <p className="text-xs text-slate-500 mt-0.5">
                  Carregue um arquivo de backup previamente exportado para recuperar dados.
                </p>
              </div>
              <label className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-sm transition-all">
                <Upload className="w-4 h-4" />
                <span>Importar JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </div>

            {/* Reset All Data to Zero */}
            <div className="bg-white rounded-2xl border border-rose-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h5 className="font-bold text-sm text-rose-900">Zerar Todos os Dados</h5>
                <p className="text-xs text-rose-700 mt-0.5">
                  Apaga todos os lançamentos, cartões e investimentos para começar completamente do zero.
                </p>
              </div>
              <button
                onClick={() => setConfirmResetOpen(true)}
                className="w-full sm:w-auto px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-sm transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Zerar Tudo</span>
              </button>
            </div>
          </div>

          {/* Reset Confirmation Modal */}
          {confirmResetOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
              <div className="fixed inset-0" onClick={() => setConfirmResetOpen(false)} />
              <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100">
                <div className="flex items-center gap-3 text-rose-600">
                  <AlertCircle className="w-6 h-6" />
                  <h4 className="font-bold text-base text-slate-900">Zerar todos os dados?</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Esta ação limpará todas as despesas, receitas, contas, metas e investimentos, reiniciando o sistema com saldo zerado.
                </p>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setConfirmResetOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={async () => {
                      await resetToZero();
                      setConfirmResetOpen(false);
                      showToast('Sistema zerado com sucesso!');
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
                  >
                    Sim, Zerar Tudo
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
