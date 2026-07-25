import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import Logo from "../components/Logo";
import { signInWithEmail } from "../lib/auth";

export default function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    const { error: err } = await signInWithEmail(email, password);
    setIsLoading(false);

    if (err) {
      setError(err.message);
    } else {
      onLogin();
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Animated gradient background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -right-1/2 -top-1/2 h-full w-full rounded-full bg-gradient-to-br from-neon-purple via-transparent to-transparent blur-3xl" />
        <div className="absolute -left-1/4 bottom-0 h-96 w-96 rounded-full bg-gradient-to-br from-neon-cyan via-transparent to-transparent blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(0deg, transparent 24%, rgba(124, 58, 255, 0.05) 25%, rgba(124, 58, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(124, 58, 255, 0.05) 75%, rgba(124, 58, 255, 0.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(124, 58, 255, 0.05) 25%, rgba(124, 58, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(124, 58, 255, 0.05) 75%, rgba(124, 58, 255, 0.05) 76%, transparent 77%, transparent)",
          backgroundSize: "50px 50px",
        }}
      />

      {/* Content */}
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 sm:px-6">
        {/* Logo */}
        <div className="mb-12">
          <Logo size="lg" tileClass="bg-gradient-to-br from-neon-cyan to-neon-purple text-black" />
        </div>

        {/* Main card */}
        <div className="w-full max-w-md">
          {/* Glowing border effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-neon-purple via-neon-cyan to-neon-purple opacity-20 blur-xl" />

          <div className="relative rounded-3xl border border-neon-cyan/30 bg-black/40 p-8 backdrop-blur-xl sm:p-10">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="mb-3 flex items-center justify-center gap-2">
                <Sparkles className="text-neon-cyan" size={20} />
                <h1 className="text-2xl font-bold text-white sm:text-3xl">Welcome back</h1>
              </div>
              <p className="text-sm text-gray-400">Sign in to manage your modules and track your GPA</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neon-cyan mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-neon-cyan/30 bg-black/50 px-4 py-3 text-white placeholder-gray-500 transition focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neon-purple mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-neon-purple/30 bg-black/50 px-4 py-3 text-white placeholder-gray-500 transition focus:border-neon-purple focus:outline-none focus:ring-1 focus:ring-neon-purple/50"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-gradient-to-r from-neon-cyan to-neon-purple px-4 py-3 font-bold text-black transition hover:shadow-lg hover:shadow-neon-cyan/50 disabled:opacity-50 sm:py-3.5"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-neon-cyan/20 to-transparent" />
              <span className="text-xs text-gray-500">OR</span>
              <div className="h-px flex-1 bg-gradient-to-l from-neon-purple/20 to-transparent" />
            </div>

            {/* Google button */}
            <button
              onClick={() => {
                // Google sign-in will redirect
                window.location.href = "#/auth/google";
              }}
              className="w-full rounded-lg border border-neon-purple/30 bg-black/50 px-4 py-3 font-semibold text-white transition hover:border-neon-purple/50 hover:bg-black/70"
            >
              <div className="flex items-center justify-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </div>
            </button>

            {/* Helper text */}
            <p className="mt-6 text-center text-xs text-gray-500">
              First time? Just enter any email and password to create your account instantly.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 text-center text-xs text-gray-600">
          <p>StudyQuest © 2026 · Built for Republic Polytechnic</p>
        </div>
      </div>
    </div>
  );
}
