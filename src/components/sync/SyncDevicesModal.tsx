import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Laptop,
  Copy,
  Check,
  Share2,
  RefreshCw,
  QrCode,
  ShieldCheck,
  Heart,
  Cloud,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';

interface SyncDevicesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SyncDevicesModal: React.FC<SyncDevicesModalProps> = ({ isOpen, onClose }) => {
  const {
    syncCode,
    setSyncCode,
    syncAllToFirebase,
    isSyncing,
    lastSyncTime,
    coupleConfig,
    accounts,
    transactions,
  } = useFinance();
  const { firebaseUser, loginWithGoogle } = useAuth();

  const [inputCode, setInputCode] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
  const syncUrl = `${currentUrl}?sync=${syncCode}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(syncUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
      setStatusMessage('Link copiado! Cole no WhatsApp ou navegador do celular.');
    } catch {
      setStatusMessage(`Copie este link manualmente: ${syncUrl}`);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(syncCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
      setStatusMessage('Código copiado!');
    } catch {
      setStatusMessage(`Código: ${syncCode}`);
    }
  };

  const handleConnectCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    const clean = inputCode.trim().toUpperCase();
    await setSyncCode(clean);
    setInputCode('');
    setStatusMessage(`Conectado ao código ${clean}! Sincronizando contas e lançamentos...`);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Oi amor! Aqui está o link das nossas contas sincronizadas no Finanza (${coupleConfig.partner1Name} & ${coupleConfig.partner2Name}):\n${syncUrl}\n\nÉ só abrir no celular que todas as contas e gastos já aparecem juntos!`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleForceUpload = async () => {
    setStatusMessage('Enviando todas as contas e transações para a nuvem...');
    await syncAllToFirebase();
    setStatusMessage('Todas as contas e lançamentos foram atualizados na nuvem com sucesso!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh] pb-[max(1rem,env(safe-area-inset-bottom))] animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 duration-200">
        {/* Mobile Grab Handle */}
        <div className="sm:hidden w-10 h-1 bg-slate-300 rounded-full mx-auto mt-2.5 mb-1" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-tr from-blue-700 via-indigo-700 to-pink-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-white animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-base leading-tight">Sincronizar Celular & PC</h3>
                <span className="px-2 py-0.5 rounded-full bg-pink-500/80 text-[10px] font-bold">
                  Casal
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                Mantenha as contas do PC e do celular 100% atualizadas em tempo real
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[75vh] text-xs">
          {/* Active Status Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold text-emerald-950 text-sm">
                    Sincronização em Tempo Real Ativa
                  </span>
                </div>
                <p className="text-emerald-800 text-[11px]">
                  Finanças de <strong className="font-bold">{coupleConfig.partner1Name} & {coupleConfig.partner2Name}</strong> conectadas.
                </p>
                <div className="text-[10px] text-emerald-700 font-medium">
                  {accounts.length} conta(s) cadastrada(s) • {transactions.length} lançamento(s) • Atualizado: {lastSyncTime || 'Agora'}
                </div>
              </div>

              <div className="bg-white px-3 py-2 rounded-xl border border-emerald-300 text-center shadow-xs">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Chave do Casal
                </div>
                <div className="font-mono font-extrabold text-blue-700 text-sm tracking-wide">
                  {syncCode}
                </div>
              </div>
            </div>
          </div>

          {/* Toast Notification message */}
          {statusMessage && (
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Option 1: Quick Share to Mobile / Spouse */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-4 space-y-3">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
              <div className="w-6 h-6 rounded-lg bg-pink-100 text-pink-700 flex items-center justify-center font-bold">
                1
              </div>
              <span>Enviar para o Celular ou Esposa (Mais Fácil)</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Basta abrir o link no celular. Todas as contas registradas no PC carregarão automaticamente na tela sem precisar cadastrar nada de novo!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="w-full py-2.5 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Enviar pelo WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full py-2.5 px-3.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Link Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-500" />
                    <span>Copiar Link do Celular</span>
                  </>
                )}
              </button>
            </div>

            {/* QR Code Toggle */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowQr(!showQr)}
                className="text-[11px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>{showQr ? 'Ocultar QR Code' : 'Escanear QR Code com a câmera do celular'}</span>
              </button>

              {showQr && (
                <div className="mt-3 p-4 bg-white rounded-xl border border-slate-200 text-center space-y-2 animate-in zoom-in-95 duration-150">
                  <p className="text-[11px] text-slate-500">
                    Aponte a câmera do seu celular para a tela para abrir sincronizado:
                  </p>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                      syncUrl
                    )}`}
                    alt="QR Code Finanza"
                    className="w-36 h-36 mx-auto rounded-xl shadow-xs border border-slate-100"
                  />
                  <div className="font-mono text-[10px] text-slate-400 break-all select-all">
                    {syncUrl}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Option 2: Connect another device using Code */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-4 space-y-3">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
              <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                2
              </div>
              <span>Digitar o Código do PC neste Celular</span>
            </div>
            <p className="text-slate-600 text-[11px]">
              Se você já tem um código gerado no outro aparelho, digite-o abaixo para conectar a este mesmo cofre:
            </p>

            <form onSubmit={handleConnectCode} className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: CASAL-1234"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="flex-1 px-3.5 py-2.5 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold uppercase text-xs"
              />
              <button
                type="submit"
                disabled={!inputCode.trim()}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Conectar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Option 3: Manual Full Force-Sync */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleForceUpload}
              disabled={isSyncing}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Enviando Dados...' : 'Reenviar Todas as Contas do PC para a Nuvem'}</span>
            </button>

            {!firebaseUser || firebaseUser.isAnonymous ? (
              <button
                type="button"
                onClick={loginWithGoogle}
                className="w-full sm:w-auto px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Cloud className="w-3.5 h-3.5 text-blue-600" />
                <span>Vincular Conta Google</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
