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
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean; // operational loading (updates, sign-in actions)
  isInitializing: boolean; // initial auth bootstrap only
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<any>;
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
  updateUsername: (username: string) => Promise<void>;
  updateUserPhoto: (photoURL: string) => Promise<void>; // Add update profile photo
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

  // Load mock user data from AsyncStorage
  const loadMockUserData = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('mockUserData');
      if (storedUserData) {
        const parsedUser = JSON.parse(storedUserData);
        // Convert date strings back to Date objects
        parsedUser.createdAt = new Date(parsedUser.createdAt);
        parsedUser.updatedAt = new Date(parsedUser.updatedAt);
        return parsedUser;
      } else {
      }
    } catch (error) {
      console.error('❌ Error loading mock user data:', error);
    }
    return null;
  };

  // Save mock user data to AsyncStorage
  const saveMockUserData = async (userData: User) => {
    try {
      await AsyncStorage.setItem('mockUserData', JSON.stringify(userData));
    } catch (error) {
      console.error('❌ Error saving mock user data:', error);
    }
  };

  useEffect(() => {
    // Get initial session - with timeout to prevent hanging
    const initAuth = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Supabase timeout')), 3000)
        );
        
        const sessionPromise = supabase.auth.getSession();
        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        
        setSession(session);
        if (session?.user) {
          setUser(transformSupabaseUser(session.user));
        } else {
          // No session, try to load mock user data
          const mockUser = await loadMockUserData();
          if (mockUser) {
            setUser(mockUser);
          }
        }
      } catch (error) {
        // Load mock user data if Supabase fails
        const mockUser = await loadMockUserData();
        if (mockUser) {
          setUser(mockUser);
        }
      } finally {
        setIsLoading(false);
        setIsInitializing(false);
      }
    };
    
    initAuth();

    // Listen for auth changes - with timeout protection
    let subscription: any;
    try {
      const authSubscription = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session?.user) {
        try {
          setUser(transformSupabaseUser(session.user));
        } catch (error) {
          console.error('Error initializing user data:', error);
          setUser(transformSupabaseUser(session.user));
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
      subscription = authSubscription.data.subscription;
    } catch (error) {
      subscription = { unsubscribe: () => {} };
    }

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
      username: supabaseUser.user_metadata?.username || undefined,
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
      
      // Create mock user
      const mockUser: User = {
        id: 'mock-user-123',
        email: email,
        firstName: displayName.split(' ')[0] || '',
        surname: displayName.split(' ').slice(1).join(' ') || '',
        preferredName: displayName,
        username: displayName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '.')
          .replace(/(^\.|\.$)/g, ''),
        photoURL: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Store mock user data
      await AsyncStorage.setItem('mockUserData', JSON.stringify(mockUser));
      setUser(mockUser);
      
      return;
      
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

      // Send verification email with 6-digit code
      const { error: verifyError } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (verifyError) {
        console.error('Error sending verification email:', verifyError);
        // Don't throw error here, user can still proceed to verification screen
      }

      return { success: true, user: data.user };
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
      
      // Try to load existing mock user data first
      let mockUser = await loadMockUserData();
      
      if (!mockUser) {
        // Create new mock user only if none exists
        mockUser = {
          id: 'mock-user-id',
          email: email,
          displayName: 'Test User',
          firstName: 'Test',
          surname: 'User',
          preferredName: 'Test',
          username: 'test.user',
          photoURL: undefined,
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        // Save the new user data
        await saveMockUserData(mockUser);
      } else {
        // Update email if it changed
        mockUser.email = email;
        await saveMockUserData(mockUser);
      }
      
      setUser(mockUser);
      
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
      
      setUser(null);
      setSession(null);
      // Clear stored mock user data
      await AsyncStorage.removeItem('mockUserData');
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
    return Promise.resolve();
  };

  // Update email with re-authentication using current password
  const updateEmail = async (newEmail: string, currentPassword: string) => {
    if (!user?.email) throw new Error('No authenticated user');

    // Support mock authentication (no real Supabase session)
    if (!session) {
      setIsLoading(true);
      try {
        const updatedUser = { ...user, email: newEmail };
        setUser(updatedUser);
        await saveMockUserData(updatedUser);
        return;
      } finally {
        setIsLoading(false);
      }
    }

    setIsLoading(true);
    try {
      // If account is OAuth-only (e.g., Google), block email change here
      const hasEmailIdentity = !!session?.user?.identities?.some(
        // @ts-ignore - provider type from supabase-js
        (id: any) => id.provider === 'email'
      );
      if (session && !hasEmailIdentity) {
        throw new Error(
          'This account is linked with Google. Add a password first to change your email.'
        );
      }

      // Re-authenticate to confirm the user
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (reauthError) throw reauthError;

      // Preserve existing profile metadata (including photo) when updating email
      // Provide redirect for email confirmation
      const redirectTo = AuthSession.makeRedirectUri();
      const { error } = await supabase.auth.updateUser(
        {
          email: newEmail,
          data: {
            avatar_url: user.photoURL || undefined,
            display_name: user.displayName || undefined,
            first_name: user.firstName || undefined,
            surname: user.surname || undefined,
            preferred_name: user.preferredName || undefined,
          },
        },
        { emailRedirectTo: redirectTo }
      );
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

    // Support mock authentication (no real Supabase session)
    if (!session) {
      setIsLoading(true);
      try {
        // Simulate async success; no real password persisted in mock mode
        await new Promise(resolve => setTimeout(resolve, 300));
        return;
      } finally {
        setIsLoading(false);
      }
    }

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
    try {
      // Check if we're using mock authentication
      if (!session) {
        // Update local state only for mock auth
        const updatedUser = user ? { ...user, displayName } : null;
        setUser(updatedUser);
        if (updatedUser) {
          await saveMockUserData(updatedUser);
        }
        return;
      }

      // Real Supabase authentication
      const { error } = await supabase.auth.updateUser({
        data: {
          display_name: displayName,
        },
      });
      if (error) throw error;
      setUser(prevUser => prevUser ? { ...prevUser, displayName } : null);
    } catch (error: any) {
      console.error('Update display name error:', error);
      throw new Error(error.message);
    }
  };

  const updateUserName = async (firstName: string, surname: string, preferredName: string) => {
    try {
      // Check if we're using mock authentication
      if (!session) {
        // Update local state only for mock auth
        const displayName = preferredName || [firstName, surname].filter(Boolean).join(' ');
        const updatedUser = user ? { ...user, firstName, surname, preferredName, displayName } : null;
        setUser(updatedUser);
        if (updatedUser) {
          await saveMockUserData(updatedUser);
        }
        return;
      }

      // Real Supabase authentication
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: firstName,
          surname: surname,
          preferred_name: preferredName,
          display_name: preferredName || `${firstName} ${surname}`,
        },
      });
      if (error) throw error;
      setUser(prevUser => prevUser ? { ...prevUser, firstName, surname, preferredName, displayName: preferredName || `${firstName} ${surname}` } : null);
    } catch (error: any) {
      console.error('Update full name error:', error);
      throw new Error(error.message);
    }
  };

  const updateUsername = async (username: string) => {
    try {
      const sanitized = username
        .toLowerCase()
        .replace(/[^a-z0-9_\.]/g, '')
        .replace(/\.{2,}/g, '.')
        .replace(/^\.|\.$/g, '');

      if (!sanitized || sanitized.length < 3) {
        throw new Error('Username must be at least 3 characters and contain only letters, numbers, underscores, or dots.');
      }

      // Mock mode
      if (!session) {
        const updatedUser = user ? { ...user, username: sanitized } : null;
        setUser(updatedUser);
        if (updatedUser) {
          await saveMockUserData(updatedUser);
        }
        return;
      }

      // Supabase metadata update
      const { error } = await supabase.auth.updateUser({
        data: {
          username: sanitized,
        },
      });
      if (error) throw error;
      setUser(prev => (prev ? { ...prev, username: sanitized } : prev));
    } catch (error: any) {
      console.error('Update username error:', error);
      throw new Error(error.message || 'Failed to update username');
    }
  };

  const updateUserPhoto = async (photoURL: string) => {
    // Avoid global loading splash that can trigger navigation resets; use lightweight update
    try {
      // Check if we're using mock authentication
      if (!session) {
        // Update local state only for mock auth
        const updatedUser = user ? { ...user, photoURL } : null;
        setUser(updatedUser);
        if (updatedUser) {
          await saveMockUserData(updatedUser);
        }
        return;
      }

      // Real Supabase authentication
      const { error } = await supabase.auth.updateUser({
        data: {
          avatar_url: photoURL,
        },
      });
      if (error) throw error;
      setUser(prevUser => prevUser ? { ...prevUser, photoURL } : null);
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
    signInWithGoogle, // Add to context
    unlinkAccount,
    updateEmail,
    updatePassword,
    updateUserDisplayName, // Add to context
    updateUserName, // Add to context
    updateUsername,
    updateUserPhoto, // Add to context
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