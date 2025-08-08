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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Temporarily disabled email verification requirement for testing
      console.log('✅ User signed in successfully:', data.user?.email);
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
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
