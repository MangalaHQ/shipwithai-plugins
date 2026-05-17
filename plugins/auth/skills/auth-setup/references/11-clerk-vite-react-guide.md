# Clerk — Setup Guide (Vite + React Router)

> For React 18+ SPAs using Vite and React Router v6. For Next.js, see the setup wizard.

Managed auth SaaS. Fastest setup (15 min). Pre-built UI components. Free < 10K MAU.

## Installation

```bash
npm install @clerk/react-router-js
```

Requires React Router v6 (or v7 in framework mode). The package uses the path-based routing strategy, so no hash routing.

## Environment Variables

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
VITE_CLERK_SIGN_IN_URL=/sign-in
VITE_CLERK_SIGN_UP_URL=/sign-up
VITE_CLERK_AFTER_SIGN_IN_URL=/dashboard
VITE_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

Get keys from [Clerk Dashboard](https://dashboard.clerk.com) → API Keys.

## Root Layout — ClerkProvider

Wrap your app root with `<ClerkProvider>` using the path routing strategy:

```tsx
// src/main.tsx or src/App.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/react-router-js";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClerkProvider
      routerType="path"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
      afterMultiSessionSingleSessionUrl="/dashboard"
      afterMultiSessionNewSessionUrl="/dashboard"
    >
      <App />
    </ClerkProvider>
  </React.StrictMode>
);
```

**`routerType="path"` is required** — this tells Clerk to use React Router's history API instead of hash routing. Without it, auth redirects will fail.

## React Router Route Config

Mount auth pages in your route tree using `<ClerkProvider>` nested under the root route. The path-based routing strategy means Clerk manages its own route matching internally:

```tsx
// src/App.tsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { SignIn, SignUp } from "@clerk/react-router-js";
import Dashboard from "./pages/dashboard";
import { ProtectedLayout } from "./components/clerk/protected-layout";
import { AuthLayout } from "./components/clerk/auth-layout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      { path: "sign-in/*", element: <SignIn /> },
      { path: "sign-up/*", element: <SignUp /> },
      {
        element: <ProtectedLayout />,
        children: [
          { path: "dashboard", element: <Dashboard /> },
        ],
      },
    ],
  },
]);
```

## ClerkProvider in App.tsx (alternative pattern)

If you prefer component-based routing instead of `createBrowserRouter`:

```tsx
// src/App.tsx
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useUser, UserButton, ClerkProvider } from "@clerk/react-router-js";

// Root wraps everything inside ClerkProvider
export default function App() {
  return (
    <ClerkProvider>
      <Outlet />
    </ClerkProvider>
  );
}

// A layout that shows nav or auth links based on auth state
export function RootLayout() {
  const { isLoaded, userId } = useUser();
  const navigate = useNavigate();

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div>
      <nav>
        {userId ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <UserButton afterSignOutUrl="/sign-in" />
          </>
        ) : (
          <>
            <Link to="/sign-in">Sign in</Link>
            <Link to="/sign-up">Sign up</Link>
          </>
        )}
      </nav>
      <Outlet />
    </div>
  );
}
```

## Auth State in Components

Use hooks to read auth state anywhere inside `<ClerkProvider>`:

```tsx
import { useUser, useAuth } from "@clerk/react-router-js";

function ProfileButton() {
  const { user } = useUser();
  const { userId, sessionId, isLoaded } = useAuth();

  if (!isLoaded) return null;
  if (!userId) return null;

  return (
    <div>
      <p>{user?.fullName}</p>
      <p>{user?.primaryEmailAddress?.emailAddress}</p>
    </div>
  );
}
```

## Pre-built UI (fastest)

Clerk ships pre-built `<SignIn>`, `<SignUp>`, and `<UserProfile>` components. Mount them as pages:

```tsx
// src/pages/SignInPage.tsx
import { SignIn } from "@clerk/react-router-js";
export default function SignInPage() {
  return <SignIn />;
}
```

```tsx
// src/pages/SignUpPage.tsx
import { SignUp } from "@clerk/react-router-js";
export default function SignUpPage() {
  return <SignUp />;
}
```

## Custom UI (full control)

Use `useSignIn` and `useSignUp` hooks for custom forms:

```tsx
import { useSignIn } from "@clerk/react-router-js";
import { useState } from "react";

export default function CustomSignIn() {
  const { signIn, isLoaded } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded) return;

    const { supportedFirstFactorIdentifiers, firstFactorVerification } =
      await signIn.create({ identifier: email, password });

    if (supportedFirstFactorIdentifiers.includes("email_link")) {
      // Email link sent — show message
    } else if (supportedFirstFactorIdentifiers.includes("password")) {
      const result = await signIn.attemptFirstFactor({ strategy: "password", password });
      if (result.status === "complete") {
        // Auth is handled by Clerk's router — no manual redirect needed
      }
    }
  }

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit">Sign in</button>
      {error && <p>{error}</p>}
    </form>
  );
}
```

## OAuth Social Login

1. In Clerk Dashboard → User & Authentication → Social Connections, enable Google (and GitHub, Apple).
2. No callback route needed — Clerk's path strategy handles redirects automatically.
3. In `useSignIn()` / `useSignUp()`, add OAuth:

```tsx
async function handleGoogleSignIn() {
  if (!isLoaded) return;
  await signIn.authenticateWithRedirect({
    strategy: "oauth_google",
    redirectUrl: "/sign-in/sso-callback",
    redirectUrlComplete: "/dashboard",
  });
}
```

For `<SignIn>` / `<SignUp>` components, configure OAuth in the Clerk Dashboard only — no code changes needed.

## User Button (avatar + dropdown)

```tsx
// In your navbar
import { UserButton } from "@clerk/react-router-js";

export function Navbar() {
  return (
    <nav>
      <UserButton
        afterSignOutUrl="/sign-in"
        userProfileUrl="/user-profile"
      />
    </nav>
  );
}
```

## Webhook — Sync Users to Your Database

Clerk sends webhook events on user create/update/delete. Point your Express server (or Vite proxy) to handle them:

```ts
// server/webhooks/clerk.ts
import express from "express";
import crypto from "crypto";

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET!;

export function clerkWebhookHandler(req: express.Request, res: express.Response) {
  const signature = req.headers["clerk-signature"] as string;
  const body = JSON.stringify(req.body);

  const expectedSig = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(body)
    .digest("hex");

  if (signature !== `v1=${expectedSig}`) {
    return res.status(400).json({ error: "Invalid signature" });
  }

  const { type, data } = req.body;

  if (type === "user.created") {
    // Sync to your database
    // await db.insert(users).values({ clerkId: data.id, email: data.email_addresses[0]?.email_address });
  }

  res.json({ received: true });
}
```

Add the route in your Express server:

```ts
// server/index.ts
import express from "express";
import { clerkWebhookHandler } from "./webhooks/clerk";

app.post("/webhooks/clerk", express.raw({ type: "application/json" }), clerkWebhookHandler);
```

**Important:** Use `express.raw()` for the Clerk webhook route — parsing the body as JSON breaks the signature verification.

## Vite Config — Telemetry Opt-Out

Clerk collects anonymous telemetry. Opt out in `vite.config.ts`:

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { defineClerkTelemetry } from "@clerk/react-router-js";

defineClerkTelemetry({ preventCookieBasedTelemetry: true });

export default defineConfig({ /* ... */ });
```

## Environment Variables — Summary

| Variable | Where | Description |
|---|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | Client + Server | Clerk publishable key (starts with `pk_`) |
| `CLERK_SECRET_KEY` | Server only | Clerk secret key (starts with `sk_`) — never expose to client |
| `VITE_CLERK_SIGN_IN_URL` | Client | Redirect here if unauthenticated |
| `VITE_CLERK_SIGN_UP_URL` | Client | Redirect here for new accounts |
| `VITE_CLERK_AFTER_SIGN_IN_URL` | Client | After successful sign in |
| `VITE_CLERK_AFTER_SIGN_UP_URL` | Client | After successful sign up |
| `CLERK_WEBHOOK_SECRET` | Server only | Webhook signing secret for DB sync |

## Component Checklist

Copy all of these from `assets/components/clerk/`:

| File | Place at | Purpose |
|---|---|---|
| `clerk-provider.tsx` | `src/main.tsx` / `src/App.tsx` | ClerkProvider root wrapper |
| `auth-routes.tsx` | `src/routes/auth.tsx` | Route config with public/protected separation |
| `login-page.tsx` | `src/pages/sign-in.tsx` | `<SignIn>` component |
| `register-page.tsx` | `src/pages/sign-up.tsx` | `<SignUp>` component |
| `user-profile.tsx` | `src/pages/user-profile.tsx` | `<UserProfile>` page + `<UserButton>` in nav |

## Gotchas

- **`routerType="path"` is mandatory** for React Router. Hash routing is not supported.
- **No server-side auth** — React SPAs are client-only. User data lives with Clerk. For server-side actions, call your own Express/Fastify API with a Clerk JWT and verify it server-side with `svix` or `Clerk.backend.verify()`.
- **Webhook endpoint** must be on a separate Express/Fastify server (Vite's dev server can't handle raw body webhooks).
- **Cookie-based sessions** — Clerk issues HttpOnly cookies in the browser. Use `useAuth()` for auth state in React components.
- **Free tier limits** — 10K MAU, 10 organizations, email + social login. MFA and SSO cost extra.
- **Vendor lock-in** — Passwords are not exportable. Migration requires users to reset passwords.
- **React Router v7** — Works with React Router v7 in framework mode, but `@clerk/react-router-js` is the right package.
