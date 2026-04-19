import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
// import Apple from "next-auth/providers/apple";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
// import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
// import { prisma } from "@/lib/prisma";

// ============================================================
// Auth.js (NextAuth v5) — Configuration
// File: src/lib/auth.ts
// Docs: https://authjs.dev
// ============================================================

export const { handlers, auth, signIn, signOut } = NextAuth({
  // ── Adapter (database sessions) ─────
  adapter: DrizzleAdapter(db),
  // adapter: PrismaAdapter(prisma),

  // ── Providers ───────────────────────
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    // Apple({
    //   clientId: process.env.APPLE_CLIENT_ID!,
    //   clientSecret: process.env.APPLE_CLIENT_SECRET!,
    // }),

    // Email/password (requires custom verification)
    // Credentials({
    //   credentials: {
    //     email: { label: "Email", type: "email" },
    //     password: { label: "Password", type: "password" },
    //   },
    //   authorize: async (credentials) => {
    //     // Verify against your database
    //     const user = await getUserByEmail(credentials.email as string);
    //     if (!user) return null;
    //     const isValid = await verifyPassword(
    //       credentials.password as string,
    //       user.password
    //     );
    //     if (!isValid) return null;
    //     return { id: user.id, name: user.name, email: user.email };
    //   },
    // }),
  ],

  // ── Session Strategy ────────────────
  session: {
    strategy: "database", // "jwt" for Edge runtime compatibility
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // ── Pages ───────────────────────────
  pages: {
    signIn: "/login",
    // signUp: "/register",   // Auth.js doesn't have built-in signup
    error: "/login",
  },

  // ── Callbacks ───────────────────────
  callbacks: {
    // Add user ID and role to session
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        // session.user.role = user.role; // Requires type extension
      }
      return session;
    },

    // Control access
    async signIn({ user, account }) {
      // Block users without verified email (optional)
      // if (!user.emailVerified) return false;
      return true;
    },

    // Redirect after auth
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  // ── Events ──────────────────────────
  // events: {
  //   async createUser({ user }) {
  //     // Send welcome email
  //   },
  // },

  // ── Debug (dev only) ────────────────
  debug: process.env.NODE_ENV === "development",
});

// ── API Route ─────────────────────────
// File: src/app/api/auth/[...nextauth]/route.ts
//
// import { handlers } from "@/lib/auth";
// export const { GET, POST } = handlers;

// ── TypeScript Extension ──────────────
// File: src/types/next-auth.d.ts
//
// import "next-auth";
// declare module "next-auth" {
//   interface Session {
//     user: {
//       id: string;
//       role?: string;
//     } & DefaultSession["user"];
//   }
//   interface User {
//     role?: string;
//   }
// }
