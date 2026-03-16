# Google OAuth Setup for CoreHealth

## Step 1: Get Your Client IDs from Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create one)
3. Go to **APIs & Services** → **Credentials**
4. Create OAuth 2.0 Client IDs for:
   - **Web application** (for Expo)
   - **iOS** (for iOS app)
   - **Android** (for Android app)

## Step 2: Configure Redirect URI

For the **Web client**, add this redirect URI:
```
https://auth.expo.io/@YOUR_EXPO_USERNAME/YOUR_APP_SLUG
```

Replace:
- `YOUR_EXPO_USERNAME` with your Expo account username
- `YOUR_APP_SLUG` with your app slug from `app.json` (probably `corehealth-app-dev`)

## Step 3: Update Client IDs in Code

In `src/screens/auth/LoginScreen.tsx`, replace these placeholders:

```typescript
const [request, response, promptAsync] = Google.useAuthRequest({
  expoClientId: "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",        // ← Replace this
  iosClientId: "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com",         // ← Replace this
  androidClientId: "YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com", // ← Replace this
  scopes: ["openid", "profile", "email"],
});
```

## Step 4: Add Test Users

1. In Google Cloud Console → **OAuth consent screen**
2. Add your Gmail and friends' Gmails as **Test users**
3. Keep **Publishing status** as "Testing"

## Step 5: Test the Integration

1. Run: `expo start`
2. Tap "Sign in with Google"
3. Select a Google account
4. You should see a success alert with the user's name

## Troubleshooting

- **redirect_uri_mismatch**: Check the redirect URI matches exactly
- **Error 403: org_internal**: Add the Gmail as a Test user
- **invalid_client**: Double-check the client IDs
- **Blank tab**: Make sure `WebBrowser.maybeCompleteAuthSession()` is at the top of the file

## Next Steps (Optional)

Once Google sign-in works, you can integrate with Supabase to:
- Create user accounts in your database
- Link Google accounts to CoreHealth profiles
- Handle authentication sessions
