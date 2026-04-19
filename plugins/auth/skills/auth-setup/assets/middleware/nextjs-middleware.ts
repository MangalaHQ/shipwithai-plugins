import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ============================================================
// Next.js Middleware — Auth Protection (DENY-BY-DEFAULT)
// Place this file at: src/middleware.ts (or middleware.ts at root)
//
// SECURITY: This middleware uses a DENY-BY-DEFAULT pattern.
// All routes are protected UNLESS explicitly listed as public.
// This prevents accidentally exposing new routes without auth.
//
// NOTE: This middleware runs on the Edge runtime.
// It can only check cookie EXISTENCE, not validity.
// You MUST ALSO verify sessions server-side in:
//   1. app/(protected)/layout.tsx — cryptographic verification
//   2. Every API route that accesses user data
// Without both layers, a user can bypass auth with a fake cookie.
// ============================================================

// PUBLIC routes — everything else requires authentication
const publicRoutes = ["/", "/login", "/register", "/forgot-password", "/reset-password"];

// Routes only for unauthenticated users (redirect to dashboard if logged in)
const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];

// ============================================================
// PROVIDER MIDDLEWARE — Uncomment the one matching your provider
// ============================================================

// ──────────────────────────────────────
// Option A: Better Auth (cookie-based)
// ──────────────────────────────────────
// NOTE: Better Auth does NOT use the auth() wrapper pattern (that's Auth.js).
// Check the session cookie directly. See pitfall #43.
//
// export function middleware(request: NextRequest) {
//   const sessionCookie =
//     request.cookies.get("better-auth.session_token") ||
//     request.cookies.get("__Secure-better-auth.session_token");
//   const isLoggedIn = !!sessionCookie?.value;
//
//   const isPublic = publicRoutes.some((route) =>
//     request.nextUrl.pathname === route
//   ) || request.nextUrl.pathname.startsWith("/api/auth");
//   const isAuthRoute = authRoutes.some((route) =>
//     request.nextUrl.pathname.startsWith(route)
//   );
//
//   // DENY-BY-DEFAULT: redirect to login if not public and not logged in
//   if (!isPublic && !isLoggedIn) {
//     return NextResponse.redirect(new URL("/login", request.url));
//   }
//   if (isAuthRoute && isLoggedIn) {
//     return NextResponse.redirect(new URL("/dashboard", request.url));
//   }
//   return NextResponse.next();
// }
//
// RECOMMENDED: Server-side session verification in middleware (Better Auth)
// This makes an HTTP call to verify the session, adding ~50ms latency
// but providing REAL authentication at the edge (not just cookie existence).
//
// import { betterFetch } from "@better-fetch/fetch";
// export async function middleware(request: NextRequest) {
//   const { data: session } = await betterFetch("/api/auth/get-session", {
//     baseURL: request.nextUrl.origin,
//     headers: { cookie: request.headers.get("cookie") || "" },
//   });
//   const isLoggedIn = !!session;
//   const isPublic = publicRoutes.some((r) => request.nextUrl.pathname === r)
//     || request.nextUrl.pathname.startsWith("/api/auth");
//   const isAuthRoute = authRoutes.some((r) => request.nextUrl.pathname.startsWith(r));
//   if (!isPublic && !isLoggedIn) return NextResponse.redirect(new URL("/login", request.url));
//   if (isAuthRoute && isLoggedIn) return NextResponse.redirect(new URL("/dashboard", request.url));
//   return NextResponse.next();
// }

// ──────────────────────────────────────
// Option B: Clerk
// ──────────────────────────────────────
// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
//
// const isProtectedRoute = createRouteMatcher([
//   "/dashboard(.*)",
//   "/settings(.*)",
//   "/profile(.*)",
// ]);
//
// export default clerkMiddleware(async (auth, request) => {
//   if (isProtectedRoute(request)) {
//     await auth.protect();
//   }
// });

// ──────────────────────────────────────
// Option C: Auth.js (NextAuth v5)
// ──────────────────────────────────────
// export { auth as middleware } from "@/lib/auth";
// Or for custom logic:
// import { auth } from "@/lib/auth";
//
// export default auth((request) => {
//   const isLoggedIn = !!request.auth;
//   const isPublic = publicRoutes.some((route) =>
//     request.nextUrl.pathname === route
//   ) || request.nextUrl.pathname.startsWith("/api/auth");
//   // DENY-BY-DEFAULT: redirect to login if not public and not logged in
//   if (!isPublic && !isLoggedIn) {
//     return NextResponse.redirect(new URL("/login", request.url));
//   }
// });

// ──────────────────────────────────────
// Option D: Firebase Auth (cookie-based)
// ──────────────────────────────────────
// WARNING: This middleware checks cookie EXISTENCE only (Edge runtime limitation).
// You MUST ALSO verify the cookie cryptographically in every Server Component/API Route:
//   const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
//   if (!decodedClaims) redirect("/login");
// Without server-side verification, users can bypass auth by setting a fake __session cookie.
//
// export function middleware(request: NextRequest) {
//   const sessionCookie = request.cookies.get("__session")?.value;
//   const isPublic = publicRoutes.some((route) =>
//     request.nextUrl.pathname === route
//   ) || request.nextUrl.pathname.startsWith("/api/auth");
//   const isAuthRoute = authRoutes.some((route) =>
//     request.nextUrl.pathname.startsWith(route)
//   );
//
//   // DENY-BY-DEFAULT: redirect to login if not public and no session
//   if (!isPublic && !sessionCookie) {
//     return NextResponse.redirect(new URL("/login", request.url));
//   }
//   if (isAuthRoute && sessionCookie) {
//     return NextResponse.redirect(new URL("/dashboard", request.url));
//   }
//   return NextResponse.next();
// }

// ──────────────────────────────────────
// Option E: Supabase Auth
// ──────────────────────────────────────
// import { createServerClient } from "@supabase/ssr";
//
// export async function middleware(request: NextRequest) {
//   let supabaseResponse = NextResponse.next({ request });
//
//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         getAll() {
//           return request.cookies.getAll();
//         },
//         setAll(cookiesToSet) {
//           cookiesToSet.forEach(({ name, value, options }) =>
//             request.cookies.set(name, value)
//           );
//           supabaseResponse = NextResponse.next({ request });
//           cookiesToSet.forEach(({ name, value, options }) =>
//             supabaseResponse.cookies.set(name, value, options)
//           );
//         },
//       },
//     }
//   );
//
//   const { data: { user } } = await supabase.auth.getUser();
//   const isPublic = publicRoutes.some((route) =>
//     request.nextUrl.pathname === route
//   ) || request.nextUrl.pathname.startsWith("/api/auth");
//   const isAuthRoute = authRoutes.some((route) =>
//     request.nextUrl.pathname.startsWith(route)
//   );
//
//   // DENY-BY-DEFAULT: redirect to login if not public and no user
//   if (!isPublic && !user) {
//     return NextResponse.redirect(new URL("/login", request.url));
//   }
//   if (isAuthRoute && user) {
//     return NextResponse.redirect(new URL("/dashboard", request.url));
//   }
//   return supabaseResponse;
// }

// ============================================================
// SECURITY HEADERS — Add to next.config.js (recommended)
// ============================================================
// async headers() {
//   return [{
//     source: "/(.*)",
//     headers: [
//       { key: "X-Frame-Options", value: "DENY" },
//       { key: "X-Content-Type-Options", value: "nosniff" },
//       { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
//       { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
//     ],
//   }],
// },

// ============================================================
// MATCHER — Exclude static assets from middleware
// ============================================================
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
