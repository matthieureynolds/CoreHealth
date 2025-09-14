# 🔧 Google OAuth Fix for CoreHealth

## Your App Details
- **App Slug**: `CoreHealth` (from app.json)
- **Expo Username**: You need to log in to Expo first

## Step 1: Get Your Expo Username

Run this command and log in if needed:
```bash
npx expo login
npx expo whoami
```

## Step 2: Build Your Redirect URI

Based on your app.json, your redirect URI will be:
```
https://auth.expo.io/@YOUR_EXPO_USERNAME/CoreHealth
```

Replace `YOUR_EXPO_USERNAME` with the username from step 1.

## Step 3: Google Cloud Console Setup

### A. Add Redirect URI
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your **Web client** (OAuth 2.0 Client ID)
4. Under **Authorized redirect URIs**, click **Add URI**
5. Paste: `https://auth.expo.io/@YOUR_EXPO_USERNAME/CoreHealth`
6. Click **Save**

### B. Add Test Users
1. Go to **APIs & Services** → **OAuth consent screen**
2. Under **Test users**, click **Add users**
3. Add your Gmail: `matthieu.reynolds@gmail.com`
4. Add any friends' Gmails who will test
5. Click **Save**

### C. Get Your Client IDs
1. In **Credentials**, copy these three Client IDs:
   - **Web client ID** (for Expo Go)
   - **iOS client ID** (for iPhone)
   - **Android client ID** (for Android)

## Step 4: Update Your Code

In `src/screens/auth/LoginScreen.tsx`, replace these lines:

```typescript
const [request, response, promptAsync] = Google.useAuthRequest({
  expoClientId: "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",        // ← Replace
  iosClientId: "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com",         // ← Replace  
  androidClientId: "YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com", // ← Replace
  scopes: ["openid", "profile", "email"],
  redirectUri,
});
```

## Step 5: Test

1. Run: `npx expo start`
2. Look for this log: `🔗 Expo redirect URI: https://auth.expo.io/@...`
3. Copy that exact URI and make sure it's in Google Cloud
4. Try Google Sign-In

## Expected Result

✅ **Success**: You'll see "Google Sign-In Success! Welcome [Your Name]!"
❌ **Error 400**: Redirect URI mismatch - check the URI in logs vs Google Cloud
❌ **Error 403**: Add your Gmail as a Test user

## Quick Debug Commands

```bash
# Get your Expo username
npx expo whoami

# Get your app slug  
npx expo config --json | grep slug

# Start the app and watch logs
npx expo start
```

The redirect URI from the logs must EXACTLY match what's in Google Cloud Console!
