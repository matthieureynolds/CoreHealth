import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { Hub } from 'aws-amplify/utils';
import { User } from '../types';
import { DataService } from '../services/data/dataService';
import {
  performGetCurrentUser,
  performSignUp,
  performSignIn,
  performSignOut,
  performResetPassword,
  performResendSignUpCode,
  performSignInWithGoogle,
  performSignInWithApple,
  performUpdateEmail,
  performUpdatePassword,
  performUpdateDisplayName,
  performUpdateUserName,
  performUpdateUsername,
  performUpdateUserPhoto,
} from './authHelpers';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isInitializing: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ needsVerification: boolean; email: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerificationEmail: (email?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  updateEmail: (newEmail: string, currentPassword: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateUserDisplayName: (displayName: string) => Promise<void>;
  updateUserName: (firstName: string, surname: string, preferredName: string) => Promise<void>;
  updateUsername: (username: string) => Promise<void>;
  updateUserPhoto: (photoURL: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // ─── Initialise: restore session on app launch ────────────────────────────
  useEffect(() => {
    performGetCurrentUser()
      .then(u => setUser(u))
      .finally(() => setIsInitializing(false));
  }, []);

  // ─── Listen for Cognito auth events (token refresh, sign out, social login) ─
  useEffect(() => {
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signedIn':
          performGetCurrentUser().then(u => {
            if (u) {
              setUser(u);
              DataService.ensureUser(u.id, u.email, u.firstName, u.surname, u.preferredName).catch(() => {});
            }
          });
          break;
        case 'signedOut':
          setUser(null);
          break;
        case 'tokenRefresh':
          // Session refreshed silently — no UI update needed
          break;
        case 'tokenRefresh_failure':
          // Refresh failed — force sign out
          setUser(null);
          break;
      }
    });
    return unsubscribe;
  }, []);

  // ─── Auth actions ─────────────────────────────────────────────────────────

  const signUp = async (email: string, password: string, displayName: string) => {
    setIsLoading(true);
    try {
      return await performSignUp(email, password, displayName);
    } catch (error: any) {
      throw new Error(error.message ?? 'Sign up failed');
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const u = await performSignIn(email, password);
      setUser(u);
      // Ensure user row exists in DB (idempotent)
      DataService.ensureUser(u.id, u.email, u.firstName, u.surname, u.preferredName).catch(() => {});
    } catch (error: any) {
      if (error.name === 'NotAuthorizedException') {
        throw new Error('Invalid email or password.');
      } else if (error.name === 'UserNotConfirmedException') {
        throw new Error('Please verify your email before signing in.');
      } else if (error.message?.includes('Network')) {
        throw new Error('Network error. Check your connection and try again.');
      }
      throw new Error(error.message ?? 'Sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await performSignOut();
      setUser(null);
    } catch (error: any) {
      throw new Error(error.message ?? 'Sign out failed');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await performResetPassword(email);
    } catch (error: any) {
      throw new Error(error.message ?? 'Password reset failed');
    }
  };

  const resendVerificationEmail = async (email?: string) => {
    const target = email ?? user?.email;
    if (!target) throw new Error('No email address found');
    try {
      await performResendSignUpCode(target);
    } catch (error: any) {
      throw new Error(error.message ?? 'Failed to resend code');
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      await performSignInWithGoogle();
      // Hub listener above handles setUser after redirect completes
    } catch (error: any) {
      throw new Error(error.message ?? 'Google sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithApple = async () => {
    setIsLoading(true);
    try {
      await performSignInWithApple();
    } catch (error: any) {
      throw new Error(error.message ?? 'Apple sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const updateEmail = async (newEmail: string, _currentPassword: string) => {
    if (!user) throw new Error('No authenticated user');
    setIsLoading(true);
    try {
      await performUpdateEmail(newEmail);
      setUser({ ...user, email: newEmail });
    } catch (error: any) {
      throw new Error(error.message ?? 'Failed to update email');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    setIsLoading(true);
    try {
      await performUpdatePassword(currentPassword, newPassword);
    } catch (error: any) {
      if (error.name === 'NotAuthorizedException') throw new Error('Current password is incorrect.');
      throw new Error(error.message ?? 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserDisplayName = async (displayName: string) => {
    if (!user) return;
    try {
      const updated = await performUpdateDisplayName(user, displayName);
      setUser(updated);
    } catch (error: any) {
      throw new Error(error.message ?? 'Failed to update display name');
    }
  };

  const updateUserName = async (firstName: string, surname: string, preferredName: string) => {
    if (!user) return;
    try {
      const updated = await performUpdateUserName(user, firstName, surname, preferredName);
      setUser(updated);
    } catch (error: any) {
      throw new Error(error.message ?? 'Failed to update name');
    }
  };

  const updateUsername = async (username: string) => {
    if (!user) return;
    try {
      const updated = await performUpdateUsername(user, username);
      setUser(updated);
    } catch (error: any) {
      throw new Error(error.message ?? 'Failed to update username');
    }
  };

  const updateUserPhoto = async (photoURL: string) => {
    if (!user) return;
    try {
      const updated = await performUpdateUserPhoto(user, photoURL);
      setUser(updated);
    } catch (error: any) {
      throw new Error(error.message ?? 'Failed to update photo');
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isInitializing,
    signIn,
    signUp,
    signOut,
    resetPassword,
    resendVerificationEmail,
    signInWithGoogle,
    signInWithApple,
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
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
