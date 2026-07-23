import { createClient } from "@supabase/supabase-js";

// Values come from .env (see .env.example). Until you connect Supabase,
// the app runs on mock data and this client stays idle.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured
  ? createClient(url!, anonKey!)
  : null;
