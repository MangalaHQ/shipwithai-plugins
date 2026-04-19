import type { Context, Next } from "hono";

// ============================================================
// Hono Middleware — Auth Protection
// Usage: app.use("/api/protected/*", requireAuth);
// ============================================================

// ──────────────────────────────────────
// Option A: Better Auth
// ──────────────────────────────────────
// import { auth } from "./lib/auth";
//
// export async function requireAuth(ctx: Context, next: Next) {
//   const session = await auth.api.getSession({ headers: ctx.req.raw.headers });
//   if (!session) {
//     return ctx.json({ error: "Unauthorized" }, 401);
//   }
//   ctx.set("user", session.user);
//   ctx.set("session", session.session);
//   await next();
// }

// ──────────────────────────────────────
// Option B: Clerk
// ──────────────────────────────────────
// import { clerkMiddleware, getAuth } from "@clerk/hono";
//
// // Use Clerk's built-in Hono middleware
// export { clerkMiddleware as requireAuth };
//
// // Access user in routes:
// // app.get("/api/profile", (ctx) => {
// //   const auth = getAuth(ctx);
// //   return ctx.json({ userId: auth.userId });
// // });

// ──────────────────────────────────────
// Option C: Firebase Auth (Admin SDK)
// ──────────────────────────────────────
// import { getAuth } from "firebase-admin/auth";
//
// export async function requireAuth(ctx: Context, next: Next) {
//   const authHeader = ctx.req.header("Authorization");
//   if (!authHeader?.startsWith("Bearer ")) {
//     return ctx.json({ error: "Unauthorized" }, 401);
//   }
//   try {
//     const token = authHeader.split(" ")[1];
//     const decodedToken = await getAuth().verifyIdToken(token);
//     ctx.set("user", decodedToken);
//     await next();
//   } catch {
//     return ctx.json({ error: "Invalid token" }, 401);
//   }
// }

// ──────────────────────────────────────
// Option D: Supabase Auth
// ──────────────────────────────────────
// import { createClient } from "@supabase/supabase-js";
//
// const supabase = createClient(
//   process.env.SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!
// );
//
// export async function requireAuth(ctx: Context, next: Next) {
//   const authHeader = ctx.req.header("Authorization");
//   if (!authHeader?.startsWith("Bearer ")) {
//     return ctx.json({ error: "Unauthorized" }, 401);
//   }
//   try {
//     const token = authHeader.split(" ")[1];
//     const { data: { user }, error } = await supabase.auth.getUser(token);
//     if (error || !user) {
//       return ctx.json({ error: "Invalid token" }, 401);
//     }
//     ctx.set("user", user);
//     await next();
//   } catch {
//     return ctx.json({ error: "Invalid token" }, 401);
//   }
// }

// ──────────────────────────────────────
// Optional: Role-based middleware
// ──────────────────────────────────────
export function requireRole(...roles: string[]) {
  return async (ctx: Context, next: Next) => {
    // SECURITY: Guard against missing user (requireAuth must run first)
    const user = ctx.get("user") as { role?: string } | undefined;
    if (!user) {
      return ctx.json({ error: "Unauthorized — requireAuth must run before requireRole" }, 401);
    }
    if (typeof user.role !== "string" || !roles.includes(user.role)) {
      return ctx.json({ error: "Forbidden — insufficient role" }, 403);
    }
    await next();
  };
}

// ──────────────────────────────────────
// Usage Example
// ──────────────────────────────────────
// import { Hono } from "hono";
// import { requireAuth, requireRole } from "./middleware/auth";
//
// const app = new Hono();
//
// app.use("/api/protected/*", requireAuth);
//
// app.get("/api/protected/profile", (ctx) => {
//   const user = ctx.get("user");
//   return ctx.json({ user });
// });
//
// app.delete("/api/admin/*", requireAuth, requireRole("admin"));
