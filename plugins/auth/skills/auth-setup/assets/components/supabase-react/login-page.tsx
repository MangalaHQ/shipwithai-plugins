// Supabase login page — email/password + Google OAuth
// Package: @supabase/supabase-js
// Place at: src/pages/LoginPage.tsx
// ---------------------------------------------------

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../components/supabase-react/auth-context";

export default function LoginPage() {
  const { signIn, signInWithOAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<"idle" | "email" | "google">("idle");
  const [error, setError] = useState<string | null>(null);

  // Redirect back to the page that sent them to login
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/dashboard";

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading("email");
    setError(null);
    const { error } = await signIn(email, password);
    if (error) {
      setError(error.message);
      setLoading("idle");
    } else {
      navigate(from, { replace: true });
    }
  }

  async function handleGoogle() {
    setLoading("google");
    setError(null);
    await signInWithOAuth("google");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground text-sm">Sign in to your account</p>
        </div>

        <div className="grid gap-2">
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading !== "idle"}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border rounded-md text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
          >
            {loading === "google" ? (
              <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continue with Google
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><hr className="w-full" /></div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or</span>
          </div>
        </div>

        <form onSubmit={handleEmail} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading !== "idle"}
              className="w-full px-3 py-2 border rounded-md text-sm"
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <Link to="/forgot-password" className="text-xs text-muted-foreground hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={loading !== "idle"}
              className="w-full px-3 py-2 border rounded-md text-sm"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading !== "idle"}
            className="w-full py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading === "email" ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          No account?{" "}
          <Link to="/sign-up" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
