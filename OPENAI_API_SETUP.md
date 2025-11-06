# OpenAI API Setup for Health Assistant

## Current Status
The health assistant is configured to use OpenAI's GPT-4o model but requires a valid API key to function.

## Setup Instructions

### 1. Get OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the API key (starts with `sk-`)

### 2. Configure Environment Variables
Create a `.env` file in your project root with:

```bash
# OpenAI API Key (Required for Health Assistant)
EXPO_PUBLIC_OPENAI_API_KEY=sk-proj-YOUR_API_KEY_HERE
```

### 3. Restart Development Server
After adding the API key, restart your Expo development server:
```bash
npm start
# or
expo start
```

## Features Available with OpenAI API

### Health Assistant Capabilities:
- **Intelligent Health Chat** - GPT-4o powered conversations
- **Biomarker Analysis** - AI analysis of your health data
- **Image Analysis** - Upload photos for health insights
- **Voice Input** - Speech-to-text with health context
- **Document Processing** - AI-powered lab result analysis
- **Personalized Recommendations** - Based on your health profile

### Models Used:
- **GPT-4o** - Main health assistant conversations
- **GPT-4o-transcribe** - Audio transcription
- **GPT-4o** - Image analysis and document processing

## Testing the Health Assistant

1. Open the app and go to the Health Assistant tab
2. Try these sample queries:
   - "Analyze my recent biomarkers"
   - "What does my sleep pattern tell you?"
   - "Review my health trends"
   - "Upload a photo of my lab results"

## Troubleshooting

### If Health Assistant Shows "API Key Needed":
1. Check that `.env` file exists in project root
2. Verify `EXPO_PUBLIC_OPENAI_API_KEY` is set correctly
3. Restart the development server
4. Check console for API key errors

### If Getting API Errors:
1. Verify API key is valid and active
2. Check OpenAI account has sufficient credits
3. Ensure API key has proper permissions
4. Check internet connection

### Common Error Messages:
- `"I need an OpenAI API key..."` - API key not configured
- `"OpenAI API error: 401"` - Invalid API key
- `"OpenAI API error: 429"` - Rate limit exceeded
- `"OpenAI API error: 500"` - OpenAI server error

## Security Notes

- Never commit API keys to version control
- Use environment variables for all API keys
- Rotate API keys regularly
- Monitor API usage in OpenAI dashboard

## Cost Considerations

- GPT-4o pricing: ~$0.03 per 1K input tokens, ~$0.06 per 1K output tokens
- Typical health chat: ~$0.01-0.05 per conversation
- Image analysis: ~$0.01-0.10 per image
- Monitor usage in OpenAI dashboard

## Support

If you encounter issues:
1. Check this guide first
2. Review OpenAI API documentation
3. Check console logs for specific errors
4. Verify all environment variables are set correctly
