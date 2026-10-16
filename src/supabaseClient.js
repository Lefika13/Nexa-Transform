import { createClient } from '@supabase/supabase-js';

// These variables will read from the .env file in the root of your project
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// The callback URL Supabase will redirect to after any email link is clicked.
// It works in both local dev and on production automatically.
const siteUrl = typeof window !== 'undefined'
  ? window.location.origin           // https://nexa-transform.com in prod, http://localhost:5173 in dev
  : 'https://nexa-transform.com';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    redirectTo: `${siteUrl}/auth/callback`,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,         // must be true to pick up tokens from the email link URL
  },
});

// Convenience — use this in any "Forgot password" / "Reset password" call:
// await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${siteUrl}/auth/callback` });

