import { createClient } from '@supabase/supabase-js';

// Supabase configuration - TOTO2 project
export const SUPABASE_URL = "https://zjdqyyewbxfqkianbxzs.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZHF5eWV3YnhmcWtpYW5ieHpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0NjMyNjAsImV4cCI6MjA2NTAzOTI2MH0.sKkXT7JiQBF4ByER9wYN6S-WPhj4yeXklU0hecV7r0E";

// Create Supabase client with proper auth configuration
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Disable for iOS simulator
    flowType: 'implicit', // Use implicit flow for iOS simulator compatibility
  },
});

export default supabase;
