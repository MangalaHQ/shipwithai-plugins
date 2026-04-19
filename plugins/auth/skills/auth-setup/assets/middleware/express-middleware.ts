import type { Request, Response, NextFunction } from "express";

// ============================================================
// Express Middleware — Auth Protection
// Usage: app.use("/api/protected", requireAuth, routeHandler);
// ============================================================

// ──────────────────────────────────────
// Option A: Better Auth
// ──────────────────────────────────────
// import { auth } from "./lib/auth"; // Better Auth instance
//
// export async function requireAuth(req: Request, res: Response, next: NextFunction) {
//   const session = await auth.api.getSession({ headers: req.headers });
//   if (!session) {
//     return res.status(401).json({ error: "Unauthorized" });
//   }
//   req.user = session.user;
//   req.session = session.session;
//   next();
// }

// ──────────────────────────────────────
// Option B: Clerk
// ──────────────────────────────────────
// import { clerkClient, requireAuth as clerkRequireAuth } from "@clerk/express";
//
// // Use Clerk's built-in middleware
// export const requireAuth = clerkRequireAuth();
//
// // Or custom:
// export async function requireAuth(req: Request, res: Response, next: NextFunction) {
//   const authHeader = req.headers.authorization;
//   if (!authHeader?.startsWith("Bearer ")) {
//     return res.status(401).json({ error: "Unauthorized" });
//   }
//   try {
//     const token = authHeader.split(" ")[1];
//     const decoded = await clerkClient.verifyToken(token);
//     req.auth = decoded;
//     next();
//   } catch {
//     return res.status(401).json({ error: "Invalid token" });
//   }
// }

// ──────────────────────────────────────
// Option C: Firebase Auth (Admin SDK)
// ──────────────────────────────────────
// import { getAuth } from "firebase-admin/auth";
//
// export async function requireAuth(req: Request, res: Response, next: NextFunction) {
//   const authHeader = req.headers.authorization;
//   if (!authHeader?.startsWith("Bearer ")) {
//     return res.status(401).json({ error: "Unauthorized" });
//   }
//   try {
//     const token = authHeader.split(" ")[1];
//     const decodedToken = await getAuth().verifyIdToken(token);
//     req.user = decodedToken;
//     next();
//   } catch {
//     return res.status(401).json({ error: "Invalid token" });
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
// export async function requireAuth(req: Request, res: Response, next: NextFunction) {
//   const authHeader = req.headers.authorization;
//   if (!authHeader?.startsWith("Bearer ")) {
//     return res.status(401).json({ error: "Unauthorized" });
//   }
//   try {
//     const token = authHeader.split(" ")[1];
//     const { data: { user }, error } = await supabase.auth.getUser(token);
//     if (error || !user) {
//       return res.status(401).json({ error: "Invalid token" });
//     }
//     req.user = user;
//     next();
//   } catch {
//     return res.status(401).json({ error: "Invalid token" });
//   }
// }

// ──────────────────────────────────────
// Optional: Role-based middleware
// ──────────────────────────────────────
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // SECURITY: Guard against missing user (requireAuth must run first)
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
//   res.json({ user: req.user });
// });
//
// app.delete("/api/admin/users/:id", requireAuth, requireRole("admin"), (req, res) => {
//   // admin-only route
// });
