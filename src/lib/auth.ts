import { supabase } from "./supabase";

export async function signInWithGoogle() {
  if (!supabase) return null;

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin,
    },
  });

  if (error) {
    console.error("Google sign-in error:", error);
    alert(`Sign-in failed: ${error.message}`);
  }
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
