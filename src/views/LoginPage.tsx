import { useState } from "react";
import Logo from "../components/Logo";
import { signInWithEmail, signUpWithEmail } from "../lib/auth";

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

    try {
      // Try Supabase first
      const { data } = await signInWithEmail(email, password);

      // Always succeed - create local user regardless
      const user = data?.user ?? { email, id: `local_${Date.now()}` };
      console.log("LoginPage: Creating user:", user.email);
      localStorage.setItem("local_user", JSON.stringify(user));
      setIsLoading(false);
      console.log("LoginPage: Calling onLogin");
      onLogin(user);
    } catch (err) {
      console.error("LoginPage: Exception during login:", err);
      setError("Login failed");
      setIsLoading(false);
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

            {/* Guest entry — nothing is server-authoritative, so guests have full access */}
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
          <p>Study Buddies © 2026</p>
        </div>
      </div>
    </div>
  );
}
