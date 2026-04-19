import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
// import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/lib/db"; // Your Drizzle instance (must include schema)
import * as schema from "@/db/schema"; // Better Auth table definitions
// import { prisma } from "@/lib/prisma"; // Or Prisma instance

// ============================================================
// Better Auth — Server Configuration
// File: src/lib/auth.ts
// Docs: https://www.better-auth.com/docs
// ============================================================

export const auth = betterAuth({
  // ── Database ────────────────────────
  // IMPORTANT: You MUST pass `schema` to drizzleAdapter or you'll get:
  // "The model 'user' was not found in the schema object"
  database: drizzleAdapter(db, { provider: "pg", schema }),
  // database: prismaAdapter(prisma, { provider: "postgresql" }),

  // ── Base URL ────────────────────────
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",

  // ── Secret ──────────────────────────
  secret: process.env.BETTER_AUTH_SECRET,

  // ── Email & Password ────────────────
  emailAndPassword: {
    enabled: true,
    // SECURITY: Email verification is enabled by default.
    // You MUST configure sendVerificationEmail below or disable for local dev only.
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    // NOTE: Better Auth does not support a custom password.validate() callback.
    // Server-side validation is limited to minPasswordLength/maxPasswordLength.
    // Client-side validation in register-page.tsx enforces uppercase + number.
    // For stronger server-side validation, use a beforeSignUp hook or custom API route.
    sendVerificationEmail: async ({ user, url }: { user: { email: string }; url: string }) => {
      if (process.env.NODE_ENV === "development") {
        // SECURITY: Only log URLs in development. NEVER in production — tokens enable account takeover.
        console.log(`[AUTH-DEV] Verification email for ${user.email}: ${url}`);
        return;
      }
      // TODO: Integrate your email provider (Resend, SendGrid, etc.)
      // await sendEmail({ to: user.email, subject: "Verify your email", url });
      throw new Error("Email provider not configured. Set up Resend/SendGrid before deploying.");
    },
    sendResetPassword: async ({ user, url }: { user: { email: string }; url: string }) => {
      if (process.env.NODE_ENV === "development") {
        // SECURITY: Only log URLs in development. NEVER in production — tokens enable account takeover.
        console.log(`[AUTH-DEV] Password reset for ${user.email}: ${url}`);
        return;
      }
      // TODO: Integrate your email provider (Resend, SendGrid, etc.)
      // await sendEmail({ to: user.email, subject: "Reset your password", url });
      throw new Error("Email provider not configured. Set up Resend/SendGrid before deploying.");
    },
  },

  // ── OAuth Providers ─────────────────
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    // apple: {
    //   clientId: process.env.APPLE_CLIENT_ID!,
    //   clientSecret: process.env.APPLE_CLIENT_SECRET!,
    // },
  },

  // ── Session ─────────────────────────
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // Cache for 5 minutes (reduces DB queries)
    },
  },

  // ── Rate Limiting (SECURITY: enabled by default) ──
  rateLimit: {
    window: 60, // 60 seconds
    max: 10,    // 10 requests per window per IP
  },

  // ── Plugins (uncomment as needed) ───
  // plugins: [
  //   twoFactor(),       // 2FA support
  //   organization(),    // Multi-tenant
  //   admin(),           // Admin dashboard
  // ],
});

// ── Client Setup ──────────────────────
// File: src/lib/auth-client.ts
//
// import { createAuthClient } from "better-auth/react";
//
// export const authClient = createAuthClient({
//   baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
// });

// ── API Route ─────────────────────────
// File: src/app/api/auth/[...all]/route.ts
//
// import { auth } from "@/lib/auth";
// import { toNextJsHandler } from "better-auth/next-js";
//
// export const { GET, POST } = toNextJsHandler(auth);
