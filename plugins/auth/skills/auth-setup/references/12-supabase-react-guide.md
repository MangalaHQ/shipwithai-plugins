# Supabase Auth — Setup Guide (Vite + React Router)

> For React 18+ SPAs using Vite and React Router v6. For Next.js, see the setup wizard.

Postgres-native auth. Free < 50K MAU. Row Level Security (RLS) built-in. Self-hostable.

## Installation

```bash
npm install @supabase/supabase-js
```

## Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Get from [Supabase Dashboard](https://supabase.com/dashboard) → Settings → API.

## Supabase Client

Create a singleton browser client:

```ts
// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
```

> `detectSessionInUrl: true` is required for OAuth — it detects the callback from Supabase in the URL.

## Auth Context

Manage auth state with a React Context that listens to `onAuthStateChange`:

```tsx
// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { type User, type Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithOAuth: (provider: "google" | "github") => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }

  async function signUp(email: string, password: string) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    return { error };
  }

  async function signInWithOAuth(provider: "google" | "github") {
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signInWithOAuth, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within <AuthProvider>");
  return context;
}
```

## Protected Route Wrapper

Redirect unauthenticated users to sign-in using a protected route component:

```tsx
// src/components/ProtectedRoute.tsx
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
```

Mount protected routes in your router:

```tsx
// src/App.tsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthCallback } from "./components/AuthCallback";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthProvider><Outlet /></AuthProvider>,
    children: [
      { path: "sign-in", element: <LoginPage /> },
      { path: "sign-up", element: <RegisterPage /> },
      { path: "auth/callback", element: <AuthCallback /> },
      {
        path: "dashboard",
        element: <ProtectedRoute><DashboardPage /></ProtectedRoute>,
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
```

## Login Page

```tsx
// src/pages/LoginPage.tsx
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export default function LoginPage() {
  const { signIn, signInWithOAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<"idle" | "email" | "google">("idle");
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as { from?: Location })?.from?.pathname ?? "/dashboard";

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
        <h1 className="text-2xl font-bold text-center">Sign in</h1>

        <Button variant="outline" onClick={handleGoogle} disabled={loading !== "idle"}>
          {loading === "google" ? "..." : "Continue with Google"}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><hr /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">or</span></div>
        </div>

        <form onSubmit={handleEmail} className="space-y-4">
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading !== "idle"}>
            {loading === "email" ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="text-center text-sm">
          No account? <Link to="/sign-up" className="text-primary hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
```

## Register Page

```tsx
// src/pages/RegisterPage.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export default function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await signUp(email, password);
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setEmailSent(true);
    }
  }

  if (emailSent) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="text-muted-foreground">We sent a confirmation link to {email}. Click it to activate your account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center">Create account</h1>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
          <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>Create account</Button>
        <p className="text-center text-sm">
          Already have an account? <Link to="/sign-in" className="text-primary hover:underline">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
```

## OAuth Callback Handler

Supabase redirects here after OAuth. Exchange the code for a session:

```tsx
// src/components/AuthCallback.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (session) {
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/sign-in", { replace: true });
        }
      });
  }, [navigate]);

  return <div>Signing you in...</div>;
}
```

## Google OAuth Setup Checklist

1. In Supabase Dashboard → Authentication → Providers, enable **Google**.
2. Get your **Web Client ID** and **Client Secret** from [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials → OAuth 2.0 Client IDs → Web application.
3. In Google Cloud Console, add Authorized Redirect URI: `https://<PROJECT>.supabase.co/auth/v1/callback`
4. In Supabase → Authentication → Providers → Google, paste your Client ID and Client Secret.
5. Add your app's origin to Authorized JavaScript origins: `http://localhost:5173` (Vite dev) and your production domain.

## Row Level Security (RLS)

Protect data at the database level. In Supabase Dashboard → SQL Editor:

```sql
-- Enable RLS on your tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can only read their own profile
CREATE POLICY "Users read own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only update their own profile
CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);
```

## Dashboard Page

```tsx
// src/pages/DashboardPage.tsx
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";

export default function DashboardPage() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen p-8">
      <h1>Dashboard</h1>
      <p>Welcome, {user?.email}</p>
      <Button onClick={signOut}>Sign out</Button>
    </div>
  );
}
```

## Environment Variables — Summary

| Variable | Place at | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | `.env` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `.env` | Anonymous key (safe to expose to client) |

## Component Checklist

Copy all of these from `assets/components/supabase-react/`:

| File | Place at | Purpose |
|---|---|---|
| `auth-context.tsx` | `src/contexts/AuthContext.tsx` | Session context + auth methods |
| `protected-route.tsx` | `src/components/ProtectedRoute.tsx` | Route guard — redirects if not logged in |
| `auth-callback.tsx` | `src/components/AuthCallback.tsx` | OAuth exchange + redirect |
| `login-page.tsx` | `src/pages/LoginPage.tsx` | Email + Google sign in |
| `register-page.tsx` | `src/pages/RegisterPage.tsx` | Email signup + confirmation |

Also copy from `assets/config/supabase-react.config.ts`:
| File | Place at | Purpose |
|---|---|---|
| `supabase-react.config.ts` | `src/lib/supabase.ts` | Browser client singleton |

## Gotchas

- **`detectSessionInUrl: true`** — required for OAuth callbacks to work. Without it, users land on the callback URL with no session after Google sign-in.
- **Email confirmation** — `signUp()` sends a confirmation email. Show the "check your inbox" UI after calling `signUp()`. The link redirects to `/auth/callback` which exchanges the token.
- **Auto-refresh tokens** — `autoRefreshToken: true` keeps sessions alive across tab closes. Do not set this to `false`.
- **Use `getUser()` for server calls** — `getSession()` reads from local storage (spoofable). `getUser()` validates with Supabase servers. Always use `getUser()` in API routes or server actions.
- **RLS is not optional** — every table with user data must have RLS policies. Without them, any authenticated user can read any user's data.
- **Email rate limit** — free tier: 4 emails/hour. Use OAuth for high-volume sign-ups.
- **OAuth redirect URL** — must be added in Dashboard → Authentication → URL Configuration AND in Google Cloud Console.
- **User ID in URL** — Supabase stores `user.id` (a UUID), not email. Join tables on `user_id`, not `email`.
