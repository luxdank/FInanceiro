import React from 'react';
import { X, ShieldCheck, LogIn, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, loginWithGoogle, loginAsGuest, user, firebaseUser } = useAuth();

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={closeAuthModal} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-100 max-w-sm w-full overflow-hidden flex flex-col max-h-[90vh] pb-[max(1rem,env(safe-area-inset-bottom))] animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 duration-200">
        {/* Mobile Grab Handle */}
        <div className="sm:hidden w-10 h-1 bg-slate-300 rounded-full mx-auto mt-2.5 mb-1" />

        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-tr from-blue-700 to-blue-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold text-lg">
              F
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Autenticação Firebase</h3>
              <p className="text-xs text-blue-100">Sincronização em nuvem</p>
            </div>
          </div>

          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-lg text-blue-100 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {firebaseUser && !firebaseUser.isAnonymous ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <UserCheck className="w-8 h-8 text-emerald-600 mx-auto" />
              <div className="font-bold text-slate-800 text-sm">{user?.name}</div>
              <div className="text-slate-500 text-[11px]">{user?.email}</div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                Conectado ao Firebase
              </span>
            </div>
          ) : (
            <>
              <p className="text-slate-600 leading-relaxed text-center">
                Conecte sua conta do Google para manter seus lançamentos salvos e sincronizados com segurança no Firestore.
              </p>

              {/* Google Login Button */}
              <button
                onClick={loginWithGoogle}
                className="w-full py-3 px-4 rounded-xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-3 shadow-xs transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Entrar com o Google</span>
              </button>

              <div className="flex items-center gap-2 my-2 text-slate-300">
                <div className="h-px bg-slate-200 flex-1" />
                <span className="text-[10px] uppercase font-bold text-slate-400">ou</span>
                <div className="h-px bg-slate-200 flex-1" />
              </div>

              {/* Guest Access Button */}
              <button
                onClick={loginAsGuest}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Continuar no Modo Anônimo / Convidado
              </button>
            </>
          )}

          <div className="text-center pt-2">
            <span className="text-[11px] text-slate-400">
              Dados protegidos com Firebase Firestore Security Rules
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
