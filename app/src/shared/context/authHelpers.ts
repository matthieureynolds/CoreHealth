import { supabase } from '../config/supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import * as AuthSession from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

// ─── User transformation ───────────────────────────────────────────────────

export const transformSupabaseUser = (supabaseUser: SupabaseUser): User => {
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

// ─── Mock user persistence ─────────────────────────────────────────────────

export const loadMockUserData = async (): Promise<User | null> => {
  try {
    const storedUserData = await AsyncStorage.getItem('mockUserData');
    if (storedUserData) {
      const parsedUser = JSON.parse(storedUserData);
      parsedUser.createdAt = new Date(parsedUser.createdAt);
      parsedUser.updatedAt = new Date(parsedUser.updatedAt);
      return parsedUser;
    }
  } catch (error) {
    console.error('❌ Error loading mock user data:', error);
  }
  return null;
};

export const saveMockUserData = async (userData: User): Promise<void> => {
  try {
    await AsyncStorage.setItem('mockUserData', JSON.stringify(userData));
  } catch (error) {
    console.error('❌ Error saving mock user data:', error);
  }
};

// ─── Auth actions ──────────────────────────────────────────────────────────

export const performSignUp = async (
  email: string,
  password: string,
  displayName: string,
): Promise<User> => {
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
  await AsyncStorage.setItem('mockUserData', JSON.stringify(mockUser));
  return mockUser;

  // Real Supabase path (unreachable while mock is active):
  // eslint-disable-next-line no-unreachable
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName, full_name: displayName },
      emailRedirectTo: undefined,
    },
  });
  if (error) throw error;
  await supabase.auth.resend({ type: 'signup', email });
  return data.user as any;
};

export const performSignIn = async (
  email: string,
  _password: string,
  existingMockUser: User | null,
  saveMock: (u: User) => Promise<void>,
): Promise<User> => {
  let mockUser = existingMockUser;
  if (!mockUser) {
    mockUser = {
      id: 'mock-user-id',
      email,
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
    await saveMock(mockUser);
  } else {
    mockUser = { ...mockUser, email };
    await saveMock(mockUser);
  }
  return mockUser;
};

export const performSignOut = async (): Promise<void> => {
  await AsyncStorage.removeItem('mockUserData');
};

export const performResetPassword = async (email: string): Promise<void> => {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
};

export const performResendVerification = async (email: string): Promise<void> => {
  const { error } = await supabase.auth.resend({ type: 'signup', email });
  if (error) throw error;
};

export const performHandleEmailVerification = async (): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!(session?.user?.email_confirmed_at);
};

export const performSignInWithGoogle = async (): Promise<void> => {
  const redirectTo = AuthSession.makeRedirectUri();
  const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
  if (error) throw error;
};

export const performUpdateEmail = async (
  user: User,
  session: Session | null,
  newEmail: string,
  currentPassword: string,
  saveMock: (u: User) => Promise<void>,
): Promise<User> => {
  if (!session) {
    const updated = { ...user, email: newEmail };
    await saveMock(updated);
    return updated;
  }

  const hasEmailIdentity = !!session.user?.identities?.some(
    (id: { provider: string }) => id.provider === 'email',
  );
  if (!hasEmailIdentity) {
    throw new Error('This account is linked with Google. Add a password first to change your email.');
  }

  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (reauthError) throw reauthError;

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
    { emailRedirectTo: redirectTo },
  );
  if (error) throw error;
  return { ...user, email: newEmail };
};

export const performUpdatePassword = async (
  user: User,
  session: Session | null,
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  if (!session) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return;
  }
  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (reauthError) throw reauthError;
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
};

export const performUpdateDisplayName = async (
  user: User,
  session: Session | null,
  displayName: string,
  saveMock: (u: User) => Promise<void>,
): Promise<User> => {
  if (!session) {
    const updated = { ...user, displayName };
    await saveMock(updated);
    return updated;
  }
  const { error } = await supabase.auth.updateUser({ data: { display_name: displayName } });
  if (error) throw error;
  return { ...user, displayName };
};

export const performUpdateUserName = async (
  user: User,
  session: Session | null,
  firstName: string,
  surname: string,
  preferredName: string,
  saveMock: (u: User) => Promise<void>,
): Promise<User> => {
  const displayName = preferredName || [firstName, surname].filter(Boolean).join(' ');
  if (!session) {
    const updated = { ...user, firstName, surname, preferredName, displayName };
    await saveMock(updated);
    return updated;
  }
  const { error } = await supabase.auth.updateUser({
    data: {
      first_name: firstName,
      surname,
      preferred_name: preferredName,
      display_name: displayName,
    },
  });
  if (error) throw error;
  return { ...user, firstName, surname, preferredName, displayName };
};

export const performUpdateUsername = async (
  user: User,
  session: Session | null,
  username: string,
  saveMock: (u: User) => Promise<void>,
): Promise<User> => {
  const sanitized = username
    .toLowerCase()
    .replace(/[^a-z0-9_\.]/g, '')
    .replace(/\.{2,}/g, '.')
    .replace(/^\.|\.$/g, '');

  if (!sanitized || sanitized.length < 3) {
    throw new Error('Username must be at least 3 characters and contain only letters, numbers, underscores, or dots.');
  }

  if (!session) {
    const updated = { ...user, username: sanitized };
    await saveMock(updated);
    return updated;
  }
  const { error } = await supabase.auth.updateUser({ data: { username: sanitized } });
  if (error) throw error;
  return { ...user, username: sanitized };
};

export const performUpdateUserPhoto = async (
  user: User,
  session: Session | null,
  photoURL: string,
  saveMock: (u: User) => Promise<void>,
): Promise<User> => {
  if (!session) {
    const updated = { ...user, photoURL };
    await saveMock(updated);
    return updated;
  }
  const { error } = await supabase.auth.updateUser({ data: { avatar_url: photoURL } });
  if (error) throw error;
  return { ...user, photoURL };
};
