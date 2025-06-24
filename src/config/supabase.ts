import { createClient } from '@supabase/supabase-js';

// Supabase configuration - CoreHealth2 project
const supabaseUrl = 'https://zjdqyyewbxfqkianbxzs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZHF5eWV3YnhmcWtpYW5ieHpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0NjMyNjAsImV4cCI6MjA2NTAzOTI2MH0.sKkXT7JiQBF4ByER9wYN6S-WPhj4yeXklU0hecV7r0E';

// Create Supabase client with proper auth configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true, // Enable detection for email verification links
    flowType: 'pkce', // Use PKCE flow for better security
  },
});

export default supabase; 