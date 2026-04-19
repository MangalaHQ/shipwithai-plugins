# Firebase Auth — Setup Guide
Managed by Google. Best mobile/KMP support. Free < 50K MAU. Battle-tested at scale.

> Real production gotchas from building a money tracking app with Firebase Auth.
## Installation & Environment
```bash
npm install firebase firebase-admin
```

**Environment Variables:**
```env
# Client-side (NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Server-side (Admin SDK)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

## Client Setup
```ts
// lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const firebaseAuth = getAuth(app);
```
## Admin SDK (Server-side)
```ts
// lib/firebase-admin.ts
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const app = getApps().length === 0
  ? initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    })
  : getApps()[0];

export const adminAuth = getAuth(app);
```
## Auth Methods
```ts
// Email/Password
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
const { user } = await createUserWithEmailAndPassword(firebaseAuth, email, password);
const { user } = await signInWithEmailAndPassword(firebaseAuth, email, password);
await signOut(firebaseAuth);

// Google OAuth
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect } from "firebase/auth";
const provider = new GoogleAuthProvider();
provider.addScope("email").addScope("profile");
const result = await signInWithPopup(firebaseAuth, provider); // desktop
await signInWithRedirect(firebaseAuth, provider); // mobile
```

### CRITICAL: Google OAuth Setup Checklist

`signInWithPopup` will fail with **400 Bad Request** if ANY of these steps are missing.
Firebase uses its own hosted `/__/auth/handler` endpoint — NOT `/api/auth/callback/google`
(that's Auth.js/NextAuth). The full OAuth flow is:

```text
User clicks "Continue with Google"
  → Firebase SDK opens popup to accounts.google.com
  → User picks Google account
  → Google redirects to https://<PROJECT>.firebaseapp.com/__/auth/handler
  → Firebase handler calls identitytoolkit.googleapis.com/v1/accounts:signInWithIdp
  → If all config is correct → returns ID token → popup closes → your app gets the user
  → If config wrong → 400 Bad Request at signInWithIdp step
```

**Step 1: Enable Google provider in Firebase Console**
- Go to Firebase Console → Authentication → Sign-in method
- Click Google → toggle **Enable** → set support email → Save
- Expand **Web SDK configuration** → copy the **Web client ID** (you'll need it in Step 2)

**Step 2: Configure OAuth client in Google Cloud Console**
- Go to Google Cloud Console → APIs & Services → Credentials
- Find the OAuth 2.0 Client ID that matches the Web client ID from Step 1
- Add to **Authorized JavaScript origins** (domain only, NO paths):
  - `http://localhost` (for dev)
  - `http://localhost:3000` (for dev)
  - `https://<PROJECT>.firebaseapp.com`
  - `https://your-production-domain.com` (when deploying)
- Add to **Authorized redirect URIs** (full path required):
  - `https://<PROJECT>.firebaseapp.com/__/auth/handler`
- IMPORTANT: JavaScript origins must NOT contain paths — Google rejects them
- IMPORTANT: redirect URIs MUST contain the `/__/auth/handler` path

**Step 3: Configure OAuth consent screen**
- Go to Google Cloud Console → APIs & Services → OAuth consent screen
- If status is **Testing**: add your test email(s) to **Test users**
- Without this, Google will reject sign-in for unlisted emails
- For production: submit for verification (or set to **External** + **In production**)

**Step 4: Add authorized domains in Firebase Console**
- Firebase Console → Authentication → Settings → Authorized domains
- Verify `localhost` and your production domain are listed

**Step 5: Verify `.env.local` values match Firebase project**
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` must be `<PROJECT>.firebaseapp.com`
- `NEXT_PUBLIC_FIREBASE_API_KEY` must match the Web API key in Firebase Console → Project settings

Replace `<PROJECT>` with your Firebase project ID (e.g., `my-app-12345`).

## Session Management (ID Token in Cookies)

### CRITICAL: Create Session Cookie Helper
```ts
// lib/firebase-session.ts (or add to lib/firebase.ts)
// Call this AFTER Firebase sign-in and BEFORE redirect.
export async function createSessionCookie(user: import("firebase/auth").User) {
  const idToken = await user.getIdToken();
  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!response.ok) throw new Error("Failed to create session");
}

export async function clearSessionAndSignOut() {
  await fetch("/api/auth/session", { method: "DELETE" });
  const { signOut } = await import("firebase/auth");
  const { firebaseAuth } = await import("@/lib/firebase");
  await signOut(firebaseAuth);
}
```

### Login / Register Pattern (CORRECT)
```ts
import { signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";
import { createSessionCookie } from "@/lib/firebase-session";

// In login handler:
const result = await signInWithEmailAndPassword(firebaseAuth, email, password);
await createSessionCookie(result.user);  // MUST await BEFORE redirect
router.push("/dashboard");               // NOW safe to redirect

// In register handler:
const result = await createUserWithEmailAndPassword(firebaseAuth, email, password);
await updateProfile(result.user, { displayName: name });
await createSessionCookie(result.user);       // MUST await BEFORE redirect
await sendEmailVerification(result.user);     // Send verification email (non-blocking UX)
router.push("/dashboard");                    // NOW safe to redirect
```

### Sign-Out Pattern (CORRECT)
```ts
import { clearSessionAndSignOut } from "@/lib/firebase-session";

// In sign-out handler:
await clearSessionAndSignOut();           // Clears cookie + Firebase
window.location.href = "/login";          // Full reload to clear state
```

### Token Refresh Listener (OPTIONAL)
```ts
// Only for keeping session cookie in sync with token refresh.
// DO NOT rely on this for initial login redirect — use createSessionCookie.
import { firebaseAuth } from "@/lib/firebase";

// app/api/auth/session/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

// ── Rate Limiting (in-memory) ──
// For serverless (Vercel), replace with @upstash/ratelimit (see Rate Limiting section below)
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ENTRIES = 10_000; // Prevent memory leak from too many unique IPs
function checkRateLimit(key: string, max = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  // Evict expired entries if Map grows too large
  if (attempts.size > MAX_ENTRIES) {
    for (const [k, v] of attempts) { if (now > v.resetAt) attempts.delete(k); }
  }
  const entry = attempts.get(key);
  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  // Rate limiting — prevent brute-force (5 req/min per IP)
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "127.0.0.1";
  if (!checkRateLimit(`session:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  // CSRF protection: validate Origin header
  const origin = request.headers.get("origin");
  const allowedOrigin = process.env.NEXT_PUBLIC_APP_URL;
  if (!allowedOrigin) {
    console.error("NEXT_PUBLIC_APP_URL is not set — all session requests will be rejected");
    return NextResponse.json({ error: "Server misconfigured: NEXT_PUBLIC_APP_URL not set" }, { status: 500 });
  }
  if (!origin || origin !== allowedOrigin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { idToken } = await request.json();
    if (typeof idToken !== "string" || idToken.length === 0 || idToken.length > 10_000) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    // Check token is recent (within 5 minutes) to prevent replay attacks
    const fiveMinutesInMs = 5 * 60 * 1000;
    if (new Date().getTime() - new Date(decodedToken.auth_time * 1000).getTime() > fiveMinutesInMs) {
      return NextResponse.json({ error: "Token too old" }, { status: 401 });
    }

    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const response = NextResponse.json({ status: "success" });
    response.cookies.set("__session", sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

// Sign out — verify session, revoke refresh tokens, then clear cookie
export async function DELETE(request: NextRequest) {
  const sessionCookie = request.cookies.get("__session")?.value;
  if (sessionCookie) {
    try {
      const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);
      await adminAuth.revokeRefreshTokens(decodedClaims.sub);
    } catch {
      // Cookie invalid or expired — still clear it below
    }
  }
  const response = NextResponse.json({ status: "ok" });
  response.cookies.set("__session", "", { maxAge: 0, path: "/" });
  return response;
}
```
## Middleware & Server Auth
```ts
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const session = request.cookies.get("__session")?.value;
  if (!session && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

// Server component auth check
import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

async function getServerSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("__session")?.value;
  if (!sessionCookie) return null;
  try {
    return await adminAuth.verifySessionCookie(sessionCookie, true);
  } catch {
    return null;
  }
}
```
## Security Hardening

### CSRF Protection
The session POST endpoint must validate the `Origin` header to prevent cross-site request forgery. Set `NEXT_PUBLIC_APP_URL` in your environment variables:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Change to your production URL in production
```

### Server-Side Session Verification
The middleware can only check cookie **existence** (Edge Runtime limitation). You **must** verify the session cryptographically in every protected Server Component or API route:
```ts
// app/(protected)/layout.tsx — wraps all protected routes
import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth-server";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser();
  if (!user) redirect("/login");
  return <>{children}</>;
}
```

### Rate Limiting
Auth endpoints should be rate-limited to prevent brute-force attacks. Recommended: `@upstash/ratelimit` for serverless or a simple in-memory limiter for self-hosted.

**Option A: Upstash (Vercel/serverless)**
```bash
npm install @upstash/ratelimit @upstash/redis
```
```ts
// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "60 s"), // 5 requests per minute
});

// In your session route POST handler:
// const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
// const { success } = await ratelimit.limit(ip);
// if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
```

**Option B: In-memory (self-hosted / non-serverless)**
```ts
// lib/rate-limit.ts
const attempts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, maxAttempts = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxAttempts) return false;
  entry.count++;
  return true;
}
```

### Security Headers
Add security headers in `next.config.ts` to prevent clickjacking, MIME-sniffing, and downgrade attacks. See the `next.config.ts` template in `assets/config/`.

## Production Gotchas
- **REDIRECT RACE CONDITION:** NEVER redirect before the session cookie is set. Always `await createSessionCookie(user)` BEFORE `router.push("/dashboard")`. If you rely on `onAuthStateChanged` to set the cookie, the redirect will fire before the cookie POST completes and the user will be bounced back to login.
- **SIGN-OUT MUST CLEAR COOKIE:** Always call `DELETE /api/auth/session` BEFORE Firebase `signOut()`. Then use `window.location.href = "/login"` (not `router.push`) to force a full page reload and clear cached auth state.
- **PRIVATE_KEY:** Replace literal `\n` with actual newlines (`.replace(/\\n/g, "\n")`).
- **Token refresh:** Use `onIdTokenChanged` (not `onAuthStateChanged`) for real-time refresh. Tokens expire after 1 hour.
- **Session cookie:** Must use `__session` name in Firebase Hosting; others get stripped.
- **OAuth URIs:** Add `localhost:3000` and production URL to Firebase Console → Auth → Authorized domains.
- **signInWithRedirect mobile:** Returns `null` first call. Use `getRedirectResult()` on page load.
- **Serverless:** Check `getApps().length === 0` before initializing; reuse instances.
- **Emulator:** Set `FIREBASE_AUTH_EMULATOR_HOST=localhost:9099` but mock emails (emulator doesn't send real ones).
- **Costs:** Auth is free, but triggers writing to Firestore are paid operations.
- **buttonVariants server/client:** If using shadcn/ui Button, do NOT mark `buttonVariants` as `"use client"`. Extract it to a separate file (e.g., `button-variants.ts`) without the directive, so Server Components can use it.
