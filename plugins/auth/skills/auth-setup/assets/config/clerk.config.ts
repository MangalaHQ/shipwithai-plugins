// ============================================================
// Clerk — Configuration Guide
// Clerk is fully managed — no server config file needed.
// This file documents the setup pattern.
// Docs: https://clerk.com/docs
// ============================================================

// ── Step 1: Environment Variables ─────
// .env.local
// NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
// CLERK_SECRET_KEY=sk_test_...
// NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
// NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register
// NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
// NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

// ── Step 2: Layout Provider ───────────
// File: src/app/layout.tsx

// import { ClerkProvider } from "@clerk/nextjs";
//
// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <ClerkProvider>
//       <html lang="en">
//         <body>{children}</body>
//       </html>
//     </ClerkProvider>
//   );
// }

// ── Step 3: Middleware ─────────────────
// File: src/middleware.ts

// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
//
// const isProtectedRoute = createRouteMatcher([
//   "/dashboard(.*)",
//   "/settings(.*)",
// ]);
//
// export default clerkMiddleware(async (auth, request) => {
//   if (isProtectedRoute(request)) {
//     await auth.protect();
//   }
// });
//
// export const config = {
//   matcher: [
//     "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
//   ],
// };

// ── Step 4: Pre-built UI Components ───
// Clerk provides drop-in components. No custom UI needed:
//
// import { SignIn } from "@clerk/nextjs";
// <SignIn />                    // Full sign-in page
//
// import { SignUp } from "@clerk/nextjs";
// <SignUp />                    // Full sign-up page
//
// import { UserButton } from "@clerk/nextjs";
// <UserButton afterSignOutUrl="/" />  // User avatar + dropdown

// ── Step 5: Server-side Auth ──────────
// File: src/app/dashboard/page.tsx (Server Component)

// import { auth } from "@clerk/nextjs/server";
//
// export default async function DashboardPage() {
//   const { userId } = await auth();
//   if (!userId) redirect("/login");
//   // fetch user data...
// }

// ── Step 6: Webhook Sync (optional) ───
// File: src/app/api/webhooks/clerk/route.ts
// Sync Clerk users to your database

// import { Webhook } from "svix";
// import { headers } from "next/headers";
// import type { WebhookEvent } from "@clerk/nextjs/server";
//
// export async function POST(request: Request) {
//   const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET!;
//   const headerPayload = await headers();
//   const svixId = headerPayload.get("svix-id")!;
//   const svixTimestamp = headerPayload.get("svix-timestamp")!;
//   const svixSignature = headerPayload.get("svix-signature")!;
//
//   const body = await request.text();
//   const webhook = new Webhook(SIGNING_SECRET);
//   const event = webhook.verify(body, {
//     "svix-id": svixId,
//     "svix-timestamp": svixTimestamp,
//     "svix-signature": svixSignature,
//   }) as WebhookEvent;
//
//   switch (event.type) {
//     case "user.created":
//       // Insert user into your database
//       break;
//     case "user.updated":
//       // Update user in your database
//       break;
//     case "user.deleted":
//       // Delete user from your database
//       break;
//   }
//
//   return new Response("OK", { status: 200 });
// }

export {};
