import type { Context, Next } from "hono";
import { getAuth } from "firebase-admin/auth";

// ============================================================
// Hono Middleware — Firebase Auth Protection (Admin SDK)
// Usage: app.use("/api/protected/*", requireAuth);
// ============================================================

export async function requireAuth(ctx: Context, next: Next) {
  const authHeader = ctx.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return ctx.json({ error: "Unauthorized" }, 401);
  }
  try {
    const token = authHeader.split(" ")[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    ctx.set("user", decodedToken);
    await next();
  } catch {
    return ctx.json({ error: "Invalid token" }, 401);
  }
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
