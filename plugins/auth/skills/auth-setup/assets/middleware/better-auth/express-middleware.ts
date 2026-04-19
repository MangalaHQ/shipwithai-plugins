import type { Request, Response, NextFunction } from "express";
import { auth } from "./lib/auth"; // Better Auth instance

// ============================================================
// Express Middleware — Better Auth Protection
// Usage: app.use("/api/protected", requireAuth, routeHandler);
// ============================================================

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  (req as Record<string, unknown>).user = session.user;
  (req as Record<string, unknown>).session = session.session;
  next();
}

// ──────────────────────────────────────
// Optional: Role-based middleware
// ──────────────────────────────────────
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as Record<string, unknown>).user as { role?: string } | undefined;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized — requireAuth must run before requireRole" });
    }
    if (typeof user.role !== "string" || !roles.includes(user.role)) {
      return res.status(403).json({ error: "Forbidden — insufficient role" });
    }
    next();
  };
}

// ──────────────────────────────────────
// Usage Example
// ──────────────────────────────────────
// import express from "express";
// import { requireAuth, requireRole } from "./middleware/auth";
//
// const app = express();
//
// app.get("/api/profile", requireAuth, (req, res) => {
//   res.json({ user: (req as any).user });
// });
//
// app.delete("/api/admin/users/:id", requireAuth, requireRole("admin"), (req, res) => {
//   // admin-only route
// });
