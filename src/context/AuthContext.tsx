import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import {
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  signInAnonymously,
  User as FirebaseUser,
} from 'firebase/auth';
import { UserProfile } from '../types/finance';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        setUser({
          id: fbUser.uid,
          name: fbUser.displayName || (fbUser.isAnonymous ? 'Usuário Convidado' : 'Usuário Finanza'),
          email: fbUser.email || (fbUser.isAnonymous ? 'convidado@finanza.app' : ''),
          avatarUrl: fbUser.photoURL || undefined,
          createdAt: new Date().toISOString(),
        });
      } else {
        setUser({
          id: 'guest',
          name: 'Usuário Finanza',
          email: 'casal@finanza.app',
          createdAt: new Date().toISOString(),
        });
        signInAnonymously(auth).catch(() => {
          // Anonymous auth restricted in cloud console; guest mode handles offline/shared sync
        });
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setIsAuthModalOpen(false);
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  const loginAsGuest = async () => {
    try {
      await signInAnonymously(auth);
      setIsAuthModalOpen(false);
    } catch (error) {
      console.error('Guest login error:', error);
    }
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
      await signInAnonymously(auth);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isAuthenticated: !!firebaseUser && !firebaseUser.isAnonymous,
        isLoading,
        loginWithGoogle,
        loginAsGuest,
        logout,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
