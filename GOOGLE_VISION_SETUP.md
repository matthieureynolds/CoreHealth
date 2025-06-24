# Google Vision OCR Setup Guide

## Current Status
✅ You have a Google Cloud project: `corehealth-app-dev`
✅ You have a service account: `corehealth2-ocr-service@corehealth-app-dev.iam.gserviceaccount.com`
✅ API Key created: `AIzaSyAPV0pl1cmA44s-3CJ441vVxPMMpB_HEIk`

## 🚨 TROUBLESHOOTING: 403 Forbidden Error

If you're getting a **403 Forbidden error**, here are the most common causes and fixes:

### Fix 1: Enable Cloud Vision API
1. **Go to**: [Google Cloud Console](https://console.cloud.google.com/)
2. **Select your project**: `corehealth-app-dev`
3. **Navigate to**: APIs & Services → Library
4. **Search for**: "Cloud Vision API"
5. **Click**: "Cloud Vision API"
6. **Click**: "ENABLE" button
7. **Wait 2-3 minutes** for the API to be fully enabled

### Fix 2: Verify API Key Restrictions
1. **Go to**: [Google Cloud Console](https://console.cloud.google.com/)
2. **Navigate to**: APIs & Services → Credentials
3. **Find your API key**: ending in `...HEIk`
4. **Click the edit icon** (pencil)
5. **Check API restrictions**:
   - Should be set to **"Restrict key"**
   - Should include **"Cloud Vision API"**
6. **Check Application restrictions**:
   - For development: Set to **"None"**
   - For production: Set to **"HTTP referrers"**

### Fix 3: Check Billing Account
1. **Go to**: [Google Cloud Console](https://console.cloud.google.com/)
2. **Navigate to**: Billing
3. **Verify**: Your project `corehealth-app-dev` has billing enabled
4. **Note**: Vision API requires billing even for free tier usage

## Quick Test Command

To test if your API key works, run this command:

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "requests": [
      {
        "image": {
          "content": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        },
        "features": [
          {
            "type": "TEXT_DETECTION",
            "maxResults": 1
          }
        ]
      }
    ]
  }' \
  "https://vision.googleapis.com/v1/images:annotate?key=AIzaSyAPV0pl1cmA44s-3CJ441vVxPMMpB_HEIk"
```

If this returns text instead of a 403 error, your API key is working!

## OpenAI API Fix

For the OpenAI 404 error, the issue is likely the model name. Update your API key to use `gpt-4o` instead of `gpt-4-turbo`:

The model name has changed from `gpt-4-turbo` to `gpt-4o`. This will be automatically fixed in the next app restart.

## Final Steps

1. **Enable Cloud Vision API** (most important!)
2. **Restart your Expo app**: `npx expo start`
3. **Test document scanning** again
4. **Check console logs** to see if errors are resolved

## Expected Success Logs

When working correctly, you should see:
```
LOG  OCR completed in XXXms
LOG  GPT structuring completed in XXXms  
LOG  Biomarkers extracted: X
```

Instead of:
```
ERROR  OCR Error: [Error: Vision API error: 403]
ERROR  GPT Error: [Error: OpenAI API error: 404]
```

## Next Step: Create API Key for Client-Side Usage

For React Native/Expo apps, we need an **API Key** rather than the service account JSON (for security).

### Step 1: Create API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `corehealth-app-dev`
3. Navigate to **APIs & Services** > **Credentials**
4. Click **+ CREATE CREDENTIALS** > **API Key**
5. Copy the generated API key

### Step 2: Restrict API Key (Security)
1. Click on your new API key to edit it
2. Under **API restrictions**, select **Restrict key**
3. Choose **Cloud Vision API**
4. Under **Application restrictions**, choose **HTTP referrers** or **None** for development

### Step 3: Add to CoreHealth App
Create a `.env` file in the `CoreHealth/` directory:

```bash
# CoreHealth API Configuration
EXPO_PUBLIC_GOOGLE_VISION_API_KEY=your-api-key-from-step-1

# Optional: OpenAI API key for enhanced biomarker parsing
EXPO_PUBLIC_OPENAI_API_KEY=your-openai-key-here
```

### Step 4: Test the Integration
```bash
cd CoreHealth
npx expo start
```

Then test by:
1. Opening Body Map screen
2. Scrolling to "Upload Your Lab Results"
3. Taking a photo of any document with text
4. Tapping "Scan My Results"

## Why API Key vs Service Account JSON?

**API Key (Recommended for React Native):**
- ✅ Secure for client-side apps
- ✅ Can be restricted to specific APIs
- ✅ No private keys exposed in app bundle
- ✅ Easier to manage and rotate

**Service Account JSON (Server-Side Only):**
- ❌ Contains private key - security risk in client apps
- ❌ Visible in React Native bundle
- ✅ Good for backend servers only

## Cost Estimate
- Google Vision API: ~$1.50 per 1000 documents
- Typical usage: ~$0.0015 per lab report scan
- Very cost-effective for personal health tracking

## Troubleshooting
- If you get authentication errors, check the API key is correct
- If you get quota errors, check your Google Cloud billing is enabled
- If OCR doesn't work, the app will fall back to mock data for development 