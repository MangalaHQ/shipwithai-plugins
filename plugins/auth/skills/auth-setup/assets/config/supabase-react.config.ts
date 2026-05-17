// Supabase client setup for Vite (browser-only)
// Package: @supabase/supabase-js
// Copy to: src/lib/supabase.ts
// ---------------------------------------------------

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,   // Required for OAuth callback
  },
});

// Optional: typed helper for exchanging OAuth code on callback page
// (used in src/components/AuthCallback.tsx)
/*
import { supabase } from "../lib/supabase";

export async function exchangeOAuthCode() {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
}
*/

// Environment variables needed:
// VITE_SUPABASE_URL=https://your-project.supabase.co
// VITE_SUPABASE_ANON_KEY=eyJ...
