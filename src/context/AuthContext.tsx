import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { supabase } from '../config/supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { DataService } from '../services/dataService';
import { User } from '../types';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  handleEmailVerification: () => Promise<boolean>;
  signInWithGoogle: () => Promise<void>; // Add Google sign-in
  unlinkAccount: (provider: 'google') => Promise<void>;
  updateEmail: (newEmail: string, currentPassword: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateUserDisplayName: (displayName: string) => Promise<void>; // Add update display name
  updateUserName: (firstName: string, surname: string, preferredName: string) => Promise<void>; // Add update full name
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🔐 AuthContext: Initializing authentication system');
    console.log('📡 AuthContext: Connecting to Supabase auth...');
    
    // Test Supabase connection
    const testConnection = async () => {
      try {
        console.log('🌐 Testing Supabase connection...');
        const { data, error } = await supabase.from('profiles').select('count').limit(1);
        if (error) {
          console.error('❌ Supabase connection test failed:', error);
        } else {
          console.log('✅ Supabase connection test successful');
        }
      } catch (error) {
        console.error('❌ Supabase connection test error:', error);
      }
    };
    
    testConnection();
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log(
        '🔍 AuthContext: Checking for existing session...',
        session ? '✅ Found' : '❌ None',
      );
      setSession(session);
      if (session?.user) {
        console.log(
          '👤 AuthContext: User found in session:',
          session.user.email,
        );
        setUser(transformSupabaseUser(session.user));
      }
      setIsLoading(false);
      console.log('⚡ AuthContext: Initial auth check complete');
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session?.user) {
        try {
          // TEMPORARY FIX: Skip database profile creation for now
          // await DataService.initializeUserData(
          //   session.user.id,
          //   session.user.email!,
          //   session.user.user_metadata?.display_name || session.user.user_metadata?.full_name
          // );
          console.log(
            '⚡ Skipping database profile creation - using mock data',
          );
          setUser(transformSupabaseUser(session.user));
        } catch (error) {
          console.error('Error initializing user data:', error);
          // Still set the user even if profile creation fails
          setUser(transformSupabaseUser(session.user));
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const transformSupabaseUser = (supabaseUser: SupabaseUser): User => {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email!,
      displayName:
        supabaseUser.user_metadata?.display_name ||
        supabaseUser.user_metadata?.full_name,
      firstName: supabaseUser.user_metadata?.first_name || '',
      surname: supabaseUser.user_metadata?.surname || '',
      preferredName: supabaseUser.user_metadata?.preferred_name || '',
      photoURL: supabaseUser.user_metadata?.avatar_url,
      emailVerified: supabaseUser.email_confirmed_at ? true : false,
      createdAt: new Date(supabaseUser.created_at),
      updatedAt: new Date(supabaseUser.updated_at || supabaseUser.created_at),
    };
  };

  const signUp = async (
    email: string,
    password: string,
    displayName: string,
  ) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
            full_name: displayName,
          },
          emailRedirectTo: undefined,
        },
      });

      if (error) throw error;

      // For testing: signup successful, user can login immediately
      console.log('✅ User signup successful, can login immediately:', email);
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
      console.log('🔐 Attempting to sign in with email:', email);
      
      // TEMPORARY: Mock authentication for testing
      // TODO: Remove this when Supabase is fixed
      console.log('⚠️ Using mock authentication (Supabase connection failed)');
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login for testing
      const mockUser: User = {
        id: 'mock-user-id',
        email: email,
        displayName: 'Test User',
        firstName: 'Test',
        surname: 'User',
        preferredName: 'Test',
        photoURL: null,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setUser(mockUser);
      console.log('✅ Mock sign in successful:', email);
      
    } catch (error: any) {
      console.error('❌ Sign in error details:', {
        message: error.message,
        code: error.code,
        status: error.status,
        name: error.name
      });
      
      // Provide more specific error messages
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
      // TEMPORARY: Mock sign out for testing
      console.log('⚠️ Using mock sign out (Supabase connection failed)');
      setUser(null);
      setSession(null);
      console.log('✅ Mock sign out successful');
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error(error.message);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw new Error(error.message);
    }
  };

  const resendVerificationEmail = async () => {
    try {
      if (!user?.email) {
        throw new Error('No user email found');
      }
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });
      if (error) throw error;
    } catch (error: any) {
      console.error('Resend verification error:', error);
      throw new Error(error.message);
    }
  };

  const handleEmailVerification = async (): Promise<boolean> => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.email_confirmed_at) {
        console.log('✅ Email verification successful');
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Email verification error:', error);
      return false;
    }
  };

  // Google sign-in implementation
  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const redirectTo = AuthSession.makeRedirectUri();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      });
      if (error) throw error;
      // The user will be redirected back to the app after authentication
      // Supabase will handle the session automatically
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      throw new Error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Apple sign-in implementation
  // Best-effort unlink (placeholder). Supabase v2 supports identity unlinking for OAuth providers
  // when multiple identities are linked to one user. For now we simulate success to keep UI flowing.
  const unlinkAccount = async (provider: 'google') => {
    console.log(`Requested unlink for provider: ${provider}. No-op placeholder.`);
    return Promise.resolve();
  };

  // Update email with re-authentication using current password
  const updateEmail = async (newEmail: string, currentPassword: string) => {
    if (!user?.email) throw new Error('No authenticated user');
    setIsLoading(true);
    try {
      // Re-authenticate to confirm the user
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (reauthError) throw reauthError;

      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      // Local state update
      setUser(prev => (prev ? { ...prev, email: newEmail } : prev));
    } catch (error: any) {
      console.error('Update email error:', error);
      throw new Error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Update password with re-authentication
  const updatePassword = async (currentPassword: string, newPassword: string) => {
    if (!user?.email) throw new Error('No authenticated user');
    setIsLoading(true);
    try {
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (reauthError) throw reauthError;

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
    } catch (error: any) {
      console.error('Update password error:', error);
      throw new Error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserDisplayName = async (displayName: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          display_name: displayName,
        },
      });
      if (error) throw error;
      setUser(prevUser => prevUser ? { ...prevUser, displayName } : null);
      console.log('✅ User display name updated successfully');
    } catch (error: any) {
      console.error('Update display name error:', error);
      throw new Error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserName = async (firstName: string, surname: string, preferredName: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: firstName,
          surname: surname,
          preferred_name: preferredName,
        },
      });
      if (error) throw error;
      setUser(prevUser => prevUser ? { ...prevUser, firstName, surname, preferredName } : null);
      console.log('✅ User full name updated successfully');
    } catch (error: any) {
      console.error('Update full name error:', error);
      throw new Error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    resendVerificationEmail,
    handleEmailVerification,
    signInWithGoogle, // Add to context
    unlinkAccount,
    updateEmail,
    updatePassword,
    updateUserDisplayName, // Add to context
    updateUserName, // Add to context
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
