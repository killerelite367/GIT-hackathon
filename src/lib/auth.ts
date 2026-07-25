import { supabase } from "./supabase";

export async function signInWithEmail(email: string, password: string) {
  if (!supabase) return { error: "Supabase not configured" };

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error?.code === "invalid_grant") {
    return await signUpWithEmail(email, password);
  }

  return { data, error };
}

export async function signUpWithEmail(email: string, password: string) {
  if (!supabase) return { error: "Supabase not configured" };

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  return { data, error };
}

export async function getCurrentUser() {
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}
