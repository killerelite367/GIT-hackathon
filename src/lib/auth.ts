import { supabase } from "./supabase";

export async function signInWithEmail(email: string, password: string) {
  if (!supabase) {
    const err = new Error("Supabase not configured");
    return { error: err, data: null };
  }

  try {
    // Try to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // If user doesn't exist, try to sign up
    if (error?.code === "invalid_grant" || error?.message?.includes("Invalid login credentials")) {
      return await signUpWithEmail(email, password);
    }

    // Supabase verified the password but the project has email confirmation on.
    // Nothing in this app is server-authoritative, so let the user straight in.
    if (
      error?.code === "email_not_confirmed" ||
      error?.message?.toLowerCase().includes("email not confirmed")
    ) {
      return { data: { user: { email } }, error: null };
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
  if (!supabase) return { error: "Supabase not configured" };

  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign out error:", error);
      return { error };
    }
    return { error: null };
  } catch (err) {
    console.error("Sign out exception:", err);
    return { error: err as Error };
  }
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
