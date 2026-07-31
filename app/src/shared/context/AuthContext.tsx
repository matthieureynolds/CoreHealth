import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Hub } from "aws-amplify/utils";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { User } from "../types";
import { DataService } from "../services/data/dataService";
import { clearHealthCache } from "../utils/secureStorage";

const CONSENT_PENDING_KEY = "@corehealth_pending_consent";
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
} from "./authHelpers";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isInitializing: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<{ needsVerification: boolean; email: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerificationEmail: (email?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  updateEmail: (newEmail: string, currentPassword: string) => Promise<void>;
  updatePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;
  updateUserDisplayName: (displayName: string) => Promise<void>;
  updateUserName: (
    firstName: string,
    surname: string,
    preferredName: string,
  ) => Promise<void>;
  updateUsername: (username: string) => Promise<void>;
  updateUserPhoto: (photoURL: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── TEMP DEMO BYPASS ──────────────────────────────────────────────────────
// Set to true to skip Cognito and launch straight into the app with a mock
// user (for offline demos when AWS is unavailable). REVERT to false before
// shipping or testing real auth.
const DEMO_MODE = true;
const DEMO_USER: User = {
  id: "demo-user",
  email: "demo@corehealth.app",
  firstName: "Matthieu",
  surname: "Reynolds",
  preferredName: "Matthieu",
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(DEMO_MODE ? DEMO_USER : null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(!DEMO_MODE);

  // ─── Initialise: restore session on app launch ────────────────────────────
  useEffect(() => {
    if (DEMO_MODE) return; // demo bypass — no Cognito call
    performGetCurrentUser()
      .then((u) => setUser(u))
      .finally(() => setIsInitializing(false));
  }, []);

  // ─── Register Expo push token whenever user is set ─────────────────────────
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== "granted") return;
        const tokenData = await Notifications.getExpoPushTokenAsync();
        await DataService.updatePushToken(user.id, tokenData.data);
        if (Platform.OS === "android") {
          Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
          });
        }
      } catch {
        // Push token registration is best-effort — don't crash the app
      }
    })();
  }, [user?.id]);

  // ─── Flush pending consent to backend (C6/C7 — works for both email and social login) ─
  const flushPendingConsent = async (userId: string) => {
    const pending = await AsyncStorage.getItem(CONSENT_PENDING_KEY);
    if (!pending) return;
    const { version, purposes } = JSON.parse(pending);
    // Retry up to 3 times — consent recording is legally required, not best-effort (C7)
    let lastError: unknown;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await DataService.recordConsent(userId, version, purposes);
        await AsyncStorage.removeItem(CONSENT_PENDING_KEY);
        return;
      } catch (e) {
        lastError = e;
        if (attempt < 3)
          await new Promise((r) => setTimeout(r, attempt * 1000));
      }
    }
    // All retries exhausted — log but keep pending in AsyncStorage for next launch
    console.error(
      "[GDPR] Failed to record consent after 3 attempts:",
      lastError,
    );
  };

  // ─── Listen for Cognito auth events (token refresh, sign out, social login) ─
  useEffect(() => {
    if (DEMO_MODE) return; // demo bypass — ignore Cognito auth events that would clear the mock user
    const unsubscribe = Hub.listen("auth", ({ payload }) => {
      switch (payload.event) {
        case "signedIn":
          // Fires after social login redirect (C6) and token refresh sign-ins
          performGetCurrentUser().then(async (u) => {
            if (u) {
              setUser(u);
              await DataService.ensureUser(
                u.id,
                u.email,
                u.firstName,
                u.surname,
                u.preferredName,
              ).catch(() => {});
              // Flush consent that may have been captured before redirect (covers social login — C6)
              await flushPendingConsent(u.id).catch((e) =>
                console.error("[GDPR] Consent flush error:", e),
              );
            }
          });
          break;
        case "signedOut":
          setUser(null);
          break;
        case "tokenRefresh":
          // Session refreshed silently — no UI update needed
          break;
        case "tokenRefresh_failure":
          // Refresh failed — force sign out
          setUser(null);
          break;
      }
    });
    return unsubscribe;
  }, []);

  // ─── Auth actions ─────────────────────────────────────────────────────────

  const signUp = async (
    email: string,
    password: string,
    displayName: string,
  ) => {
    setIsLoading(true);
    try {
      return await performSignUp(email, password, displayName);
    } catch (error: any) {
      throw new Error(error.message ?? "Sign up failed");
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const u = await performSignIn(email, password);
      setUser(u);
      // Ensure user row exists in DB (idempotent), then flush pending consent (C7 — not silent)
      DataService.ensureUser(
        u.id,
        u.email,
        u.firstName,
        u.surname,
        u.preferredName,
      )
        .then(() => flushPendingConsent(u.id))
        .catch((e) => console.error("[GDPR] Post-signin setup error:", e));
    } catch (error: any) {
      if (error.name === "NotAuthorizedException") {
        throw new Error("Invalid email or password.");
      } else if (error.name === "UserNotConfirmedException") {
        throw new Error("Please verify your email before signing in.");
      } else if (error.message?.includes("Network")) {
        throw new Error("Network error. Check your connection and try again.");
      }
      throw new Error(error.message ?? "Sign in failed");
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await performSignOut();
      setUser(null);
      // C14: clear all sensitive health data from local cache on sign-out
      clearHealthCache().catch((e) =>
        console.error("[Security] Failed to clear health cache:", e),
      );
    } catch (error: any) {
      throw new Error(error.message ?? "Sign out failed");
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await performResetPassword(email);
    } catch (error: any) {
      throw new Error(error.message ?? "Password reset failed");
    }
  };

  const resendVerificationEmail = async (email?: string) => {
    const target = email ?? user?.email;
    if (!target) throw new Error("No email address found");
    try {
      await performResendSignUpCode(target);
    } catch (error: any) {
      throw new Error(error.message ?? "Failed to resend code");
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      await performSignInWithGoogle();
      // Hub listener above handles setUser after redirect completes
    } catch (error: any) {
      throw new Error(error.message ?? "Google sign-in failed");
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithApple = async () => {
    setIsLoading(true);
    try {
      await performSignInWithApple();
    } catch (error: any) {
      throw new Error(error.message ?? "Apple sign-in failed");
    } finally {
      setIsLoading(false);
    }
  };

  const updateEmail = async (newEmail: string, _currentPassword: string) => {
    if (!user) throw new Error("No authenticated user");
    setIsLoading(true);
    try {
      await performUpdateEmail(newEmail);
      setUser({ ...user, email: newEmail });
    } catch (error: any) {
      throw new Error(error.message ?? "Failed to update email");
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (
    currentPassword: string,
    newPassword: string,
  ) => {
    setIsLoading(true);
    try {
      await performUpdatePassword(currentPassword, newPassword);
    } catch (error: any) {
      if (error.name === "NotAuthorizedException")
        throw new Error("Current password is incorrect.");
      throw new Error(error.message ?? "Failed to update password");
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
      throw new Error(error.message ?? "Failed to update display name");
    }
  };

  const updateUserName = async (
    firstName: string,
    surname: string,
    preferredName: string,
  ) => {
    if (!user) return;
    try {
      const updated = await performUpdateUserName(
        user,
        firstName,
        surname,
        preferredName,
      );
      setUser(updated);
    } catch (error: any) {
      throw new Error(error.message ?? "Failed to update name");
    }
  };

  const updateUsername = async (username: string) => {
    if (!user) return;
    try {
      const updated = await performUpdateUsername(user, username);
      setUser(updated);
    } catch (error: any) {
      throw new Error(error.message ?? "Failed to update username");
    }
  };

  const updateUserPhoto = async (photoURL: string) => {
    if (!user) return;
    try {
      const updated = await performUpdateUserPhoto(user, photoURL);
      setUser(updated);
    } catch (error: any) {
      throw new Error(error.message ?? "Failed to update photo");
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
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
