import { useState } from "react";
import Logo from "../components/Logo";
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from "../lib/auth";

export default function LoginPage({ onLogin }: { onLogin: (user: any) => void }) {
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email and password required");
      return;
    }

    setIsLoading(true);
    setError("");
    const { data, error: err } = await signInWithEmail(email, password);
    setIsLoading(false);

    if (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg || "Sign in failed");
      console.error("Sign in failed:", err);
    } else {
      const user = data?.user ?? { email, id: `local_${Date.now()}` };
      localStorage.setItem("local_user", JSON.stringify(user));
      onLogin(user);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email and password required");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    setError("");
    const { error: err } = await signUpWithEmail(email, password);
    setIsLoading(false);

    if (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg || "Sign up failed");
      console.error("Sign up failed:", err);
    } else {
      // Auto-login after successful signup
      const user = { email, id: `local_${Date.now()}` };
      localStorage.setItem("local_user", JSON.stringify(user));
      setError("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      // Call onLogin directly instead of showing alert
      setTimeout(() => onLogin(user), 100);
    }
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(50px, -60px) rotate(15deg); }
          50% { transform: translate(100px, -30px) rotate(-10deg); }
          75% { transform: translate(30px, 40px) rotate(8deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(-80px, -80px) rotate(-20deg); }
          66% { transform: translate(60px, 60px) rotate(15deg); }
        }
        .notebook-float {
          animation: float 8s ease-in-out infinite;
        }
        .notebook-float-2 {
          animation: float2 10s ease-in-out infinite;
        }
      `}</style>

      {/* Flying notebooks - neon green */}
      <div className="absolute top-20 left-10 text-8xl notebook-float opacity-20">📓</div>
      <div className="absolute bottom-32 right-20 text-7xl notebook-float-2 opacity-15">📗</div>
      <div className="absolute top-1/3 right-10 text-6xl notebook-float opacity-10">📕</div>

      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(0deg, transparent 24%, rgba(0, 255, 65, 0.1) 25%, rgba(0, 255, 65, 0.1) 26%, transparent 27%, transparent 74%, rgba(0, 255, 65, 0.1) 75%, rgba(0, 255, 65, 0.1) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 255, 65, 0.1) 25%, rgba(0, 255, 65, 0.1) 26%, transparent 27%, transparent 74%, rgba(0, 255, 65, 0.1) 75%, rgba(0, 255, 65, 0.1) 76%, transparent 77%, transparent)",
          backgroundSize: "50px 50px",
        }}
      />

      {/* Content */}
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 sm:px-6 py-8">
        {/* Logo */}
        <div className="mb-6">
          <Logo size="md" tileClass="bg-white text-black" />
        </div>

        {/* Main card */}
        <div className="w-full max-w-md">
          <div className="rounded-2xl border-2 border-white bg-black p-5 sm:p-6 shadow-2xl">
            {/* Tabs */}
            <div className="mb-5 flex gap-4 border-b-2 border-white/20">
              <button
                onClick={() => setTab("signin")}
                className={`flex-1 pb-2 text-sm font-bold transition ${
                  tab === "signin"
                    ? "text-white border-b-2 border-white"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setTab("signup")}
                className={`flex-1 pb-2 text-sm font-bold transition ${
                  tab === "signup"
                    ? "text-white border-b-2 border-white"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Header */}
            <div className="mb-4 text-center">
              <h1 className="text-2xl font-black text-white">
                {tab === "signin" ? "Sign In" : "Create Account"}
              </h1>
            </div>

            {/* Form */}
            <form onSubmit={tab === "signin" ? handleSignIn : handleSignUp} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-white mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border-2 border-white bg-black px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                  style={{ color: "#00ff41" }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border-2 border-white bg-black px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                  style={{ color: "#00ff41" }}
                />
              </div>

              {tab === "signup" && (
                <div>
                  <label className="block text-xs font-bold text-white mb-1">Confirm</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border-2 border-white bg-black px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                    style={{ color: "#00ff41" }}
                  />
                </div>
              )}

              {error && (
                <div className="rounded-lg border-2 border-red-600 bg-black px-3 py-2 text-xs text-red-500">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-white px-3 py-2 text-sm font-bold text-black transition hover:bg-gray-100 disabled:opacity-50"
              >
                {isLoading ? "..." : tab === "signin" ? "Sign In" : "Create"}
              </button>
            </form>

            {/* Divider */}
            <div className="my-3 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/30" />
              <span className="text-xs text-white/50">OR</span>
              <div className="h-px flex-1 bg-white/30" />
            </div>

            {/* Google button */}
            <button
              onClick={() => signInWithGoogle()}
              type="button"
              className="w-full rounded-lg border-2 border-white bg-black px-3 py-2 text-sm font-semibold text-white transition hover:bg-gray-950 flex items-center justify-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>

            {/*
              Guest entry. Nothing in this app is server-authoritative — every
              assignment, study set and spirit lives in localStorage — so the
              login gates a door with no lock behind it. Without this, anyone
              opening a deployed build where Supabase env vars aren't set hits
              a sign-in form that can never succeed ("Supabase not configured").
            */}
            <button
              onClick={() => onLogin({ email: "guest", guest: true })}
              type="button"
              className="mt-3 w-full rounded-lg border-2 border-white/40 bg-transparent px-3 py-2 text-sm font-semibold text-white/80 transition hover:border-white hover:text-white"
            >
              Continue as guest
            </button>

            {/* Helper text */}
            <p className="mt-3 text-center text-xs text-gray-500">
              New? Just enter any email & password
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-2 text-center text-xs text-gray-700">
          <p>StudyQuest © 2026</p>
        </div>
      </div>
    </div>
  );
}
