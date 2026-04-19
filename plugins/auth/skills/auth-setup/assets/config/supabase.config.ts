// ============================================================
// Supabase Auth — Configuration
// Docs: https://supabase.com/docs/guides/auth
// ============================================================

// ── Browser Client ────────────────────
// File: src/lib/supabase/client.ts

// import { createBrowserClient } from "@supabase/ssr";
//
// export function createClient() {
//   return createBrowserClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
//   );
// }

// ── Server Client ─────────────────────
// File: src/lib/supabase/server.ts

// import { createServerClient } from "@supabase/ssr";
// import { cookies } from "next/headers";
//
// export async function createClient() {
//   const cookieStore = await cookies();
//
//   return createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         getAll() {
//           return cookieStore.getAll();
//         },
//         setAll(cookiesToSet) {
//           try {
//             cookiesToSet.forEach(({ name, value, options }) =>
//               cookieStore.set(name, value, options)
//             );
//           } catch {
//             // Ignore in Server Components (read-only)
//           }
//         },
//       },
//     }
//   );
// }

// ── Middleware (session refresh) ───────
// File: src/middleware.ts
// CRITICAL: Supabase requires middleware to refresh sessions

// import { createServerClient } from "@supabase/ssr";
// import { NextResponse, type NextRequest } from "next/server";
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
//           cookiesToSet.forEach(({ name, value }) =>
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
//   // IMPORTANT: Do NOT use getSession() here — use getUser() for security
//   const { data: { user } } = await supabase.auth.getUser();
//
//   // Redirect unauthenticated users
//   const protectedPaths = ["/dashboard", "/settings", "/profile"];
//   const isProtected = protectedPaths.some((path) =>
//     request.nextUrl.pathname.startsWith(path)
//   );
//
//   if (isProtected && !user) {
//     const url = request.nextUrl.clone();
//     url.pathname = "/login";
//     return NextResponse.redirect(url);
//   }
//
//   return supabaseResponse;
// }
//
// export const config = {
//   matcher: [
//     "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
//   ],
// };

// ── OAuth Callback Route ──────────────
// File: src/app/auth/callback/route.ts
// Handles OAuth redirect from Google/GitHub/Apple

// import { createClient } from "@/lib/supabase/server";
// import { NextResponse } from "next/server";
//
// export async function GET(request: Request) {
//   const { searchParams, origin } = new URL(request.url);
//   const code = searchParams.get("code");
//   const next = searchParams.get("next") ?? "/dashboard";
//
//   // SECURITY: Validate redirect path to prevent open redirect attacks
//   // Uses URL parsing to catch encoded bypasses (%2f, %5c, etc.)
//   function getSafeRedirectPath(path: string): string {
//     try {
//       const url = new URL(path, "http://localhost");
//       if (url.origin !== "http://localhost") return "/dashboard";
//       if (!path.startsWith("/") || path.startsWith("//")) return "/dashboard";
//       return path;
//     } catch { return "/dashboard"; }
//   }
//   const safeNext = getSafeRedirectPath(next);
//
//   if (code) {
//     const supabase = await createClient();
//     const { error } = await supabase.auth.exchangeCodeForSession(code);
//     if (!error) {
//       return NextResponse.redirect(`${origin}${safeNext}`);
//     }
//   }
//
//   // Auth error — redirect to error page
//   return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
// }

// ── Server Component Auth ─────────────
// File: src/app/dashboard/page.tsx

// import { createClient } from "@/lib/supabase/server";
// import { redirect } from "next/navigation";
//
// export default async function DashboardPage() {
//   const supabase = await createClient();
//   const { data: { user } } = await supabase.auth.getUser();
//
//   if (!user) redirect("/login");
//
//   return <div>Welcome, {user.email}</div>;
// }

// ── Admin Client (service role) ───────
// File: src/lib/supabase/admin.ts
// ONLY use server-side. Never expose service role key to client.

// import { createClient } from "@supabase/supabase-js";
//
// export const supabaseAdmin = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!
// );

export {};
