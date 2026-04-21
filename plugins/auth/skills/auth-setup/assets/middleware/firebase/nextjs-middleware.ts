import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ============================================================
// Next.js Middleware — Firebase Auth (DENY-BY-DEFAULT)
// Place this file at: src/middleware.ts (or middleware.ts at root)
//
// SECURITY: This middleware uses a DENY-BY-DEFAULT pattern.
// All routes are protected UNLESS explicitly listed as public.
//
// WARNING: This middleware checks cookie EXISTENCE only (Edge runtime limitation).
// You MUST ALSO verify the cookie cryptographically in every Server Component/API Route:
//   const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
//   if (!decodedClaims) redirect("/login");
// Without server-side verification, users can bypass auth by setting a fake __session cookie.
//
// SEE ALSO: 05-firebase-auth-guide.md → "Server-Side Verification" section
// for the getServerUser() pattern that MUST be used in protected layouts and API routes.
// ============================================================

// PUBLIC routes — everything else requires authentication
const publicRoutes = ["/", "/login", "/register", "/forgot-password", "/reset-password"];

// Routes only for unauthenticated users (redirect to dashboard if logged in)
const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];

// ──────────────────────────────────────
// Firebase Auth (cookie-based)
// ──────────────────────────────────────

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("__session")?.value;

  const isPublic =
    publicRoutes.some((route) => request.nextUrl.pathname === route) ||
    request.nextUrl.pathname.startsWith("/api/auth");
  const isAuthRoute = authRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // DENY-BY-DEFAULT: redirect to login if not public and no session
  if (!isPublic && !sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (isAuthRoute && sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

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
