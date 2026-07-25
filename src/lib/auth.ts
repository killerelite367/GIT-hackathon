import { supabase } from "./supabase";

export async function getOrCreateAnonymousUser() {
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();

  if (user) return user;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    console.error("Auth error:", error);
    return null;
  }
  return data.user;
}
