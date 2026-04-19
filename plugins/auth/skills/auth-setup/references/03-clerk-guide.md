# Clerk — Setup Guide

> **⚠️ COMING SOON** — Clerk is not yet supported by the setup wizard. This guide is included for future reference only. Currently supported providers: **Better Auth** and **Firebase Auth**. Run `/shipwithai-auth:setup` to get started with a supported provider.

Managed auth SaaS. Fastest setup (15 min). Pre-built UI components. Free < 10K MAU.

## Installation
```bash
npm install @clerk/nextjs
```bash

## Environment Variables
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```env

Get keys from [Clerk Dashboard](https://dashboard.clerk.com) → API Keys.

## Provider Setup
Wrap app in `ClerkProvider`:

```tsx
// app/layout.tsx
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html><body>{children}</body></html>
    </ClerkProvider>
  );
}
```tsx

## Middleware (Protected Routes)
```ts
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)", "/api/webhook(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) await auth.protect();
});

export const config = { matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"] };
```ts

## Pre-built UI (fastest approach)
```tsx
// app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from "@clerk/nextjs";
export default function SignInPage() {
  return <SignIn />;
}

// app/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from "@clerk/nextjs";
export default function SignUpPage() {
  return <SignUp />;
}
```tsx

Add `<UserButton />` for profile menu:
```tsx
import { UserButton } from "@clerk/nextjs";
// In your navbar:
<UserButton afterSignOutUrl="/" />
```tsx

## Custom UI (if you want full control)
```tsx
"use client";
import { useSignIn } from "@clerk/nextjs";
import { useState } from "react";

export default function CustomSignIn() {
  const { signIn, isLoaded } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isLoaded) return;
    await signIn.create({ identifier: email, password });
  };
  // ... render form
}
```tsx

## Server-side Auth
```ts
// In Server Components
import { auth, currentUser } from "@clerk/nextjs/server";

// Get auth state
const { userId } = await auth();

// Get full user object
const user = await currentUser();
```ts

## OAuth Social Login
Enable in Clerk Dashboard → User & Authentication → Social Connections.
Toggle Google, GitHub, Apple — Clerk handles OAuth entirely.

## Webhook (Sync Users to Your DB)
```ts
// app/api/webhook/clerk/route.ts
import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET!;
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id")!;
  const svixTimestamp = headerPayload.get("svix-timestamp")!;
  const svixSignature = headerPayload.get("svix-signature")!;

  const body = JSON.stringify(await request.json());
  const webhook = new Webhook(WEBHOOK_SECRET);
  const event = webhook.verify(body, {
    "svix-id": svixId, "svix-timestamp": svixTimestamp, "svix-signature": svixSignature,
  }) as WebhookEvent;

  if (event.type === "user.created") {
    // Sync to your database
    await db.insert(users).values({
      clerkId: event.data.id,
      email: event.data.email_addresses[0]?.email_address,
      name: `${event.data.first_name} ${event.data.last_name}`,
    });
  }
  return new Response("OK", { status: 200 });
}
```ts

## Gotchas

- **Webhook sync:** User created before webhook fires. Handle race conditions.
- **Middleware matcher:** Too broad blocks assets. Use pattern above.
- **Cost:** MFA ($100/mo) and Enterprise SSO are extra.
- **Vendor lock-in:** Passwords not exportable. Migration requires user reset.
- **Rate limits:** Check `X-RateLimit-Remaining` header on free tier.
- **OAuth:** Configure social connections in Clerk Dashboard.
