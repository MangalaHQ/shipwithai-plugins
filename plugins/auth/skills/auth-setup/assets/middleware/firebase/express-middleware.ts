import type { Request, Response, NextFunction } from "express";
import { getAuth } from "firebase-admin/auth";

// ============================================================
// Express Middleware — Firebase Auth Protection (Admin SDK)
// Usage: app.use("/api/protected", requireAuth, routeHandler);
// ============================================================

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const token = authHeader.split(" ")[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    (req as Record<string, unknown>).user = decodedToken;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
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
