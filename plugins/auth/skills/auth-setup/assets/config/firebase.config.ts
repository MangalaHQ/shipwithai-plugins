// ============================================================
// Firebase Auth — Configuration
// Docs: https://firebase.google.com/docs/auth
// ============================================================

// ── Client SDK Setup ──────────────────
// File: src/lib/firebase.ts

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "dummy-key-for-build",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

// Lazy singleton — prevents Firebase from throwing during `next build`
// when NEXT_PUBLIC_ env vars are empty (SSG prerendering has no runtime env).
// At runtime in browser, env vars are always available via Next.js injection.
let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;

function getApp(): FirebaseApp {
  if (!_app) {
    _app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  }
  return _app;
}

export function getFirebaseAuth(): Auth {
  if (!_auth) {
    _auth = getAuth(getApp());
  }
  return _auth;
}

// MIGRATION NOTE: If you previously used `import { firebaseAuth } from "@/lib/firebase"`,
// change to `import { getFirebaseAuth } from "@/lib/firebase"` and call `getFirebaseAuth()`
// instead of using `firebaseAuth` directly. This ensures lazy initialization.

// ── Admin SDK Setup ───────────────────
// File: src/lib/firebase-admin.ts
// Only use in server-side code (API routes, Server Components)

// import { initializeApp, cert, getApps } from "firebase-admin/app";
// import { getAuth } from "firebase-admin/auth";
//
// // IMPORTANT: Guard initialization so `next build` doesn't crash when env vars are empty.
// // During build, Next.js evaluates server modules — cert() throws if credentials are missing.
// function getAdminApp() {
//   if (getApps().length > 0) return getApps()[0];
//   const projectId = process.env.FIREBASE_PROJECT_ID;
//   const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
//   const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
//   if (!projectId || !clientEmail || !privateKey) {
//     throw new Error("Firebase Admin SDK: Missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY");
//   }
//   return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
// }
//
// // Lazy singleton — only initializes when first accessed (not at import time)
// let _adminAuth: ReturnType<typeof getAuth> | null = null;
// export function getAdminAuth() {
//   if (!_adminAuth) _adminAuth = getAuth(getAdminApp());
//   return _adminAuth;
// }

// ── Session Cookie API Route ──────────
// File: src/app/api/auth/session/route.ts
// Creates httpOnly cookie from Firebase ID token

// import { NextRequest, NextResponse } from "next/server";
// import { getAdminAuth } from "@/lib/firebase-admin";
//
// // ── Rate Limiting ──
// // RECOMMENDED: Use @upstash/ratelimit for serverless (Vercel, AWS Lambda).
// // In-memory Maps reset on each serverless invocation and provide NO protection.
// //
// // import { Ratelimit } from "@upstash/ratelimit";
// // import { Redis } from "@upstash/redis";
// // const ratelimit = new Ratelimit({
// //   redis: Redis.fromEnv(), // requires UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
// //   limiter: Ratelimit.slidingWindow(5, "60 s"),
// // });
// //
// // In POST handler:
// //   const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
// //   const { success } = await ratelimit.limit(ip);
// //   if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
//
// // FALLBACK: In-memory rate limiter (ONLY for self-hosted / long-running servers, NOT serverless)
// const attempts = new Map<string, { count: number; resetAt: number }>();
// const MAX_ENTRIES = 10_000;
// function checkRateLimit(key: string, max = 5, windowMs = 60_000): boolean {
//   const now = Date.now();
//   if (attempts.size > MAX_ENTRIES) {
//     attempts.forEach((v, k) => { if (now > v.resetAt) attempts.delete(k); });
//   }
//   const entry = attempts.get(key);
//   if (!entry || now > entry.resetAt) {
//     attempts.set(key, { count: 1, resetAt: now + windowMs });
//     return true;
//   }
//   if (entry.count >= max) return false;
//   entry.count++;
//   return true;
// }
//
// export async function POST(request: NextRequest) {
//   // Rate limiting — prevent brute-force (5 req/min per IP)
//   const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "127.0.0.1";
//   if (!checkRateLimit(`session:${ip}`, 5, 60_000)) {
//     return NextResponse.json({ error: "Too many requests" }, { status: 429 });
//   }
//
//   // CSRF protection: validate Origin header
//   const origin = request.headers.get("origin");
//   const allowedOrigin = process.env.NEXT_PUBLIC_APP_URL;
//   if (!allowedOrigin) {
//     console.error("NEXT_PUBLIC_APP_URL is not set — all session requests will be rejected");
//     return NextResponse.json({ error: "Server misconfigured: NEXT_PUBLIC_APP_URL not set" }, { status: 500 });
//   }
//   if (!origin || origin !== allowedOrigin) {
//     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//   }
//
//   try {
//     const { idToken } = await request.json();
//     if (typeof idToken !== "string" || idToken.length === 0 || idToken.length > 10_000) {
//       return NextResponse.json({ error: "Invalid request" }, { status: 400 });
//     }
//
//     // Verify the ID token
//     const decodedToken = await getAdminAuth().verifyIdToken(idToken);
//
//     // Check token is recent (within 5 minutes) to prevent replay attacks
//     const fiveMinutesInMs = 5 * 60 * 1000;
//     if (new Date().getTime() - new Date(decodedToken.auth_time * 1000).getTime() > fiveMinutesInMs) {
//       return NextResponse.json({ error: "Token too old" }, { status: 401 });
//     }
//
//     // Create session cookie (expires in 5 days)
//     const fiveDaysInMs = 60 * 60 * 24 * 5 * 1000;
//     const sessionCookie = await getAdminAuth().createSessionCookie(idToken, {
//       expiresIn: fiveDaysInMs,
//     });
//
//     const response = NextResponse.json({ status: "ok" });
//     response.cookies.set("__session", sessionCookie, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//       maxAge: 60 * 60 * 24 * 5, // 5 days
//       path: "/",
//     });
//
//     return response;
//   } catch {
//     return NextResponse.json({ error: "Invalid token" }, { status: 401 });
//   }
// }
//
// // Sign out — verify session, revoke refresh tokens, then clear cookie
// export async function DELETE(request: NextRequest) {
//   const sessionCookie = request.cookies.get("__session")?.value;
//   if (sessionCookie) {
//     try {
//       const decodedClaims = await getAdminAuth().verifySessionCookie(sessionCookie);
//       await getAdminAuth().revokeRefreshTokens(decodedClaims.sub);
//     } catch {
//       // Cookie invalid or expired — still clear it below
//     }
//   }
//   const response = NextResponse.json({ status: "ok" });
//   response.cookies.set("__session", "", { maxAge: 0, path: "/" });
//   return response;
// }

// ── Server Component Auth Check ───────
// File: src/lib/auth-server.ts

// import { cookies } from "next/headers";
// import { getAdminAuth } from "@/lib/firebase-admin";
//
// export async function getServerUser() {
//   const cookieStore = await cookies();
//   const sessionCookie = cookieStore.get("__session")?.value;
//   if (!sessionCookie) return null;
//
//   try {
//     const decodedClaims = await getAdminAuth().verifySessionCookie(sessionCookie, true);
//     return decodedClaims;
//   } catch {
//     return null;
//   }
// }

// ── Session Cookie Helper ─────────────
// CRITICAL: Call this AFTER Firebase sign-in and BEFORE redirect.
// This ensures the server-side session cookie exists when the
// user lands on a protected page.

// export async function createSessionCookie(user: import("firebase/auth").User) {
//   const idToken = await user.getIdToken();
//   const response = await fetch("/api/auth/session", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ idToken }),
//   });
//   if (!response.ok) {
//     throw new Error("Failed to create session");
//   }
// }

// ── Sign-Out Helper ──────────────────
// CRITICAL: Clear server session cookie FIRST, then sign out Firebase client.

// export async function clearSessionAndSignOut() {
//   await fetch("/api/auth/session", { method: "DELETE" });
//   const { signOut } = await import("firebase/auth");
//   await signOut(firebaseAuth);
// }

// ── Login / Register Usage ────────────
// import { signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
// import { firebaseAuth } from "@/lib/firebase";
// import { createSessionCookie } from "@/lib/firebase";
//
// // In login handler:
// const result = await signInWithEmailAndPassword(firebaseAuth, email, password);
// await createSessionCookie(result.user);  // <-- MUST await before redirect
// router.push("/dashboard");               // <-- NOW safe to redirect
//
// // In register handler:
// const result = await createUserWithEmailAndPassword(firebaseAuth, email, password);
// await updateProfile(result.user, { displayName: name });
// await createSessionCookie(result.user);       // <-- MUST await before redirect
// await sendEmailVerification(result.user);     // <-- Send verification email
// router.push("/dashboard");                    // <-- NOW safe to redirect
//
// // In sign-out handler:
// await clearSessionAndSignOut();           // <-- Clears cookie + Firebase
// window.location.href = "/login";          // <-- Full reload to clear state

// ── Client-side Auth Listener (OPTIONAL) ─────────
// Only needed if you want to keep session cookie in sync with
// Firebase token refresh (e.g., when token expires after 1 hour).
// DO NOT rely on this for initial login redirect — use createSessionCookie instead.

// import { onIdTokenChanged, User } from "firebase/auth";
// import { firebaseAuth } from "@/lib/firebase";
//
// useEffect(() => {
//   const unsubscribe = onIdTokenChanged(firebaseAuth, async (user: User | null) => {
//     if (user) {
//       const idToken = await user.getIdToken();
//       const response = await fetch("/api/auth/session", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ idToken }),
//       });
//       if (!response.ok) {
//         console.error("Session refresh failed:", response.status);
//         // If session is rejected, sign out to force re-authentication.
//         // signOut() triggers onIdTokenChanged with user=null, skipping the if(user) block.
//         if (response.status === 401 || response.status === 403) {
//           await firebaseAuth.signOut();
//           window.location.href = "/login";
//           return;
//         }
//       }
//     }
//     setUser(user);
//     setLoading(false);
//   });
//   return () => unsubscribe();
// }, []);

export {};
