import { supabase } from "./supabase";

export async function signInWithEmail(email: string, password: string) {
  if (!supabase) {
    const err = new Error("Supabase not configured");
    return { error: err, data: null };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error?.code === "invalid_grant") {
      return await signUpWithEmail(email, password);
    }

    if (error) {
      console.error("Sign in error:", error);
      return { error, data: null };
    }

    return { data, error: null };
  } catch (err) {
    console.error("Sign in exception:", err);
    return { error: err as Error, data: null };
  }
}

export async function signUpWithEmail(email: string, password: string) {
  if (!supabase) {
    const err = new Error("Supabase not configured");
    return { error: err, data: null };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error("Sign up error:", error);
      return { error, data: null };
    }

    return { data, error: null };
  } catch (err) {
    console.error("Sign up exception:", err);
    return { error: err as Error, data: null };
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

export async function signInWithGoogle() {
  if (!supabase) return { error: "Supabase not configured" };

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin + "#/app",
    },
  });

  return { error };
}
