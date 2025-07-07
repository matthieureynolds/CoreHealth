# API Setup Guide for CoreHealth Document Processing

## Required API Keys

To enable real document processing with OCR and AI biomarker extraction, you need to set up these API keys:

### 1. Google Cloud Vision API

**Purpose:** Extract text from medical documents (PDFs, images)

**Setup Steps:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Vision API
4. Create credentials (API Key)
5. Add the API key to your environment

### 2. OpenAI API

**Purpose:** Structure extracted text into biomarker data using GPT-4

**Setup Steps:**

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Go to API Keys section
4. Create a new API key
5. Add the API key to your environment

## Environment Configuration

Create a `.env` file in the CoreHealth directory with:

```
EXPO_PUBLIC_GOOGLE_VISION_API_KEY=your-actual-google-vision-api-key
EXPO_PUBLIC_OPENAI_API_KEY=your-actual-openai-api-key
```

**Important:** Never commit the `.env` file to version control!

## Fallback Behavior

If API keys are not configured, the app will:

- Use mock OCR text for development
- Use regex-based biomarker parsing instead of GPT
- Still provide a functional experience for testing

## Cost Considerations

- **Google Vision API:** ~$1.50 per 1000 document requests
- **OpenAI GPT-4:** ~$0.03 per 1000 tokens (~$0.10 per document)
- Total cost: ~$0.15 per medical document processed

## Security Notes

- API keys should be kept secure and not shared
- Consider using environment-specific keys (dev/prod)
- Monitor API usage to prevent unexpected charges
- Implement rate limiting in production
