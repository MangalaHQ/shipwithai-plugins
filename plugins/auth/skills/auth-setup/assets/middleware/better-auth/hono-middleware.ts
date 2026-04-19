import type { Context, Next } from "hono";
import { auth } from "./lib/auth"; // Better Auth instance

// ============================================================
// Hono Middleware — Better Auth Protection
// Usage: app.use("/api/protected/*", requireAuth);
// ============================================================

export async function requireAuth(ctx: Context, next: Next) {
  const session = await auth.api.getSession({ headers: ctx.req.raw.headers });
  if (!session) {
    return ctx.json({ error: "Unauthorized" }, 401);
  }
  ctx.set("user", session.user);
  ctx.set("session", session.session);
  await next();
}

// ──────────────────────────────────────
// Optional: Role-based middleware
// ──────────────────────────────────────
export function requireRole(...roles: string[]) {
  return async (ctx: Context, next: Next) => {
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
