import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { supabase } from '../config/supabase';
import { Session } from '@supabase/supabase-js';
import { User } from '../types';
import {
  transformSupabaseUser,
  loadMockUserData,
  saveMockUserData,
  performSignUp,
  performSignIn,
  performSignOut,
  performResetPassword,
  performResendVerification,
  performHandleEmailVerification,
  performSignInWithGoogle,
  performUpdateEmail,
  performUpdatePassword,
  performUpdateDisplayName,
  performUpdateUserName,
  performUpdateUsername,
  performUpdateUserPhoto,
} from './authHelpers';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isInitializing: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  handleEmailVerification: () => Promise<boolean>;
  signInWithGoogle: () => Promise<void>;
  unlinkAccount: (provider: 'google') => Promise<void>;
  updateEmail: (newEmail: string, currentPassword: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateUserDisplayName: (displayName: string) => Promise<void>;
  updateUserName: (firstName: string, surname: string, preferredName: string) => Promise<void>;
  updateUsername: (username: string) => Promise<void>;
  updateUserPhoto: (photoURL: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Supabase timeout')), 3000),
        );
        const sessionPromise = supabase.auth.getSession();
        const { data: { session: s } } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        setSession(s);
        if (s?.user) {
          setUser(transformSupabaseUser(s.user));
        } else {
          const mockUser = await loadMockUserData();
          if (mockUser) setUser(mockUser);
        }
      } catch {
        const mockUser = await loadMockUserData();
        if (mockUser) setUser(mockUser);
      } finally {
        setIsLoading(false);
        setIsInitializing(false);
      }
    };
    initAuth();

    let subscription: any;
    try {
      const authSubscription = supabase.auth.onAuthStateChange(async (_event, s) => {
        setSession(s);
        if (s?.user) {
          try { setUser(transformSupabaseUser(s.user)); }
          catch { setUser(transformSupabaseUser(s.user)); }
        } else {
          setUser(null);
        }
        setIsLoading(false);
      });
      subscription = authSubscription.data.subscription;
    } catch {
      subscription = { unsubscribe: () => {} };
    }

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    setIsLoading(true);
    try {
      const newUser = await performSignUp(email, password, displayName);
      setUser(newUser);
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const mockUser = await loadMockUserData();
      const result = await performSignIn(email, password, mockUser, saveMockUserData);
      setUser(result);
    } catch (error: any) {
      console.error('❌ Sign in error details:', { message: error.message, code: error.code, status: error.status, name: error.name });
      if (error.message?.includes('Network request failed')) {
        throw new Error('Network connection failed. Please check your internet connection and try again.');
      } else if (error.message?.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      } else {
        throw new Error(error.message || 'An unexpected error occurred during sign in.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await performSignOut();
      setUser(null);
      setSession(null);
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error(error.message);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await performResetPassword(email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw new Error(error.message);
    }
  };

  const resendVerificationEmail = async () => {
    try {
      if (!user?.email) throw new Error('No user email found');
      await performResendVerification(user.email);
    } catch (error: any) {
      console.error('Resend verification error:', error);
      throw new Error(error.message);
    }
  };

  const handleEmailVerification = async (): Promise<boolean> => {
    try {
      return await performHandleEmailVerification();
    } catch (error: any) {
      console.error('Email verification error:', error);
      return false;
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      await performSignInWithGoogle();
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      throw new Error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const unlinkAccount = async (_provider: 'google') => Promise.resolve();

  const updateEmail = async (newEmail: string, currentPassword: string) => {
    if (!user?.email) throw new Error('No authenticated user');
    setIsLoading(true);
    try {
      const updated = await performUpdateEmail(user, session, newEmail, currentPassword, saveMockUserData);
      setUser(updated);
    } catch (error: any) {
      console.error('Update email error:', error);
      throw new Error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    if (!user?.email) throw new Error('No authenticated user');
    setIsLoading(true);
    try {
      await performUpdatePassword(user, session, currentPassword, newPassword);
    } catch (error: any) {
      console.error('Update password error:', error);
      throw new Error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserDisplayName = async (displayName: string) => {
    if (!user) return;
    try {
      const updated = await performUpdateDisplayName(user, session, displayName, saveMockUserData);
      setUser(updated);
    } catch (error: any) {
      console.error('Update display name error:', error);
      throw new Error(error.message);
    }
  };

  const updateUserName = async (firstName: string, surname: string, preferredName: string) => {
    if (!user) return;
    try {
      const updated = await performUpdateUserName(user, session, firstName, surname, preferredName, saveMockUserData);
      setUser(updated);
    } catch (error: any) {
      console.error('Update full name error:', error);
      throw new Error(error.message);
    }
  };

  const updateUsername = async (username: string) => {
    if (!user) return;
    try {
      const updated = await performUpdateUsername(user, session, username, saveMockUserData);
      setUser(updated);
    } catch (error: any) {
      console.error('Update username error:', error);
      throw new Error(error.message || 'Failed to update username');
    }
  };

  const updateUserPhoto = async (photoURL: string) => {
    if (!user) return;
    try {
      const updated = await performUpdateUserPhoto(user, session, photoURL, saveMockUserData);
      setUser(updated);
    } catch (error: any) {
      console.error('Update photo error:', error);
      throw new Error(error.message);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isInitializing,
    signIn,
    signUp,
    signOut,
    resetPassword,
    resendVerificationEmail,
    handleEmailVerification,
    signInWithGoogle,
    unlinkAccount,
    updateEmail,
    updatePassword,
    updateUserDisplayName,
    updateUserName,
    updateUsername,
    updateUserPhoto,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
