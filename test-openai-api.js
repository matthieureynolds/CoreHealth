#!/usr/bin/env node

/**
 * Test script to check OpenAI API connectivity
 * Run with: node test-openai-api.js
 */

// Load environment variables from .env file
require('dotenv').config();

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || 'your-openai-api-key-here';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

async function testOpenAIAPI() {
  console.log('🔍 Testing OpenAI API Configuration...\n');

  // Check if API key is configured
  if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your-openai-api-key-here') {
    console.log('❌ OpenAI API Key not configured');
    console.log('📝 Please add your API key to .env file:');
    console.log('   EXPO_PUBLIC_OPENAI_API_KEY=sk-your-actual-key-here\n');
    return;
  }

  console.log('✅ API Key found:', OPENAI_API_KEY.substring(0, 10) + '...');

  try {
    console.log('🔄 Testing API connection...');
    
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: 'Hello! Please respond with "OpenAI API is working correctly" to confirm the connection.'
          }
        ],
        max_tokens: 50,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log('❌ API Error:', response.status, response.statusText);
      console.log('📄 Error details:', JSON.stringify(errorData, null, 2));
      return;
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || 'No response';
    
    console.log('✅ API Response:', aiResponse);
    console.log('🎉 OpenAI API is working correctly!');
    console.log('\n📊 Usage info:');
    console.log('   - Model:', data.model);
    console.log('   - Tokens used:', data.usage?.total_tokens || 'Unknown');
    console.log('   - Response time: ~' + (Date.now() - Date.now()) + 'ms');

  } catch (error) {
    console.log('❌ Network Error:', error.message);
    console.log('🔧 Check your internet connection and API key validity');
  }
}

// Run the test
testOpenAIAPI().catch(console.error);
