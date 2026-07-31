import {
  signUp,
  signIn,
  signOut,
  resetPassword,
  confirmSignUp,
  resendSignUpCode,
  fetchAuthSession,
  fetchUserAttributes,
  updateUserAttributes,
  updatePassword,
  signInWithRedirect,
  getCurrentUser,
} from "aws-amplify/auth";
import { User } from "../types";

// ─── Transform Cognito attributes → app User type ─────────────────────────────

export const transformCognitoUser = async (): Promise<User> => {
  const [{ userId, username }, attributes] = await Promise.all([
    getCurrentUser(),
    fetchUserAttributes(),
  ]);

  return {
    id: userId,
    email: attributes.email ?? username,
    firstName: attributes.given_name ?? "",
    surname: attributes.family_name ?? "",
    preferredName: attributes["custom:preferredName"] ?? "",
    username: attributes["custom:username"] ?? undefined,
    photoURL: attributes.picture ?? undefined,
    emailVerified: attributes.email_verified === "true",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

// ─── Auth actions ──────────────────────────────────────────────────────────────

export const performSignUp = async (
  email: string,
  password: string,
  displayName: string,
): Promise<{ needsVerification: boolean; email: string }> => {
  const firstName = displayName.split(" ")[0] ?? displayName;
  const surname = displayName.split(" ").slice(1).join(" ") ?? "";

  await signUp({
    username: email,
    password,
    options: {
      userAttributes: {
        email,
        given_name: firstName,
        family_name: surname,
        "custom:preferredName": displayName,
      },
      autoSignIn: false,
    },
  });

  return { needsVerification: true, email };
};

export const performConfirmSignUp = async (
  email: string,
  code: string,
): Promise<void> => {
  await confirmSignUp({ username: email, confirmationCode: code });
};

export const performResendSignUpCode = async (email: string): Promise<void> => {
  await resendSignUpCode({ username: email });
};

export const performSignIn = async (
  email: string,
  password: string,
): Promise<User> => {
  await signIn({ username: email, password });
  return transformCognitoUser();
};

export const performSignOut = async (): Promise<void> => {
  await signOut();
};

export const performResetPassword = async (email: string): Promise<void> => {
  await resetPassword({ username: email });
};

export const performSignInWithGoogle = async (): Promise<void> => {
  await signInWithRedirect({ provider: "Google" });
};

export const performSignInWithApple = async (): Promise<void> => {
  await signInWithRedirect({ provider: "Apple" });
};

export const performGetCurrentUser = async (): Promise<User | null> => {
  try {
    const session = await fetchAuthSession();
    if (!session.tokens) return null;
    return transformCognitoUser();
  } catch {
    return null;
  }
};

// ─── Profile update actions ───────────────────────────────────────────────────

export const performUpdateEmail = async (newEmail: string): Promise<void> => {
  await updateUserAttributes({ userAttributes: { email: newEmail } });
};

export const performUpdatePassword = async (
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  await updatePassword({ oldPassword: currentPassword, newPassword });
};

export const performUpdateDisplayName = async (
  user: User,
  displayName: string,
): Promise<User> => {
  await updateUserAttributes({
    userAttributes: { "custom:preferredName": displayName },
  });
  return { ...user, preferredName: displayName };
};

export const performUpdateUserName = async (
  user: User,
  firstName: string,
  surname: string,
  preferredName: string,
): Promise<User> => {
  await updateUserAttributes({
    userAttributes: {
      given_name: firstName,
      family_name: surname,
      "custom:preferredName": preferredName,
    },
  });
  const displayName =
    preferredName || [firstName, surname].filter(Boolean).join(" ");
  return { ...user, firstName, surname, preferredName, displayName };
};

export const performUpdateUsername = async (
  user: User,
  username: string,
): Promise<User> => {
  const sanitized = username
    .toLowerCase()
    .replace(/[^a-z0-9_.]/g, "")
    .replace(/\.{2,}/g, ".")
    .replace(/^\.|\.$/g, "");

  if (!sanitized || sanitized.length < 3) {
    throw new Error(
      "Username must be at least 3 characters and contain only letters, numbers, underscores, or dots.",
    );
  }

  await updateUserAttributes({
    userAttributes: { "custom:username": sanitized },
  });
  return { ...user, username: sanitized };
};

export const performUpdateUserPhoto = async (
  user: User,
  photoURL: string,
): Promise<User> => {
  await updateUserAttributes({ userAttributes: { picture: photoURL } });
  return { ...user, photoURL };
};
