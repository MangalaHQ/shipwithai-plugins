# Common Auth Pitfalls — From Production

61 real bugs encountered building production apps. Check these before deploying.

## Session & Cookie Issues

**1. Cookie domain mismatch**
Setting `domain=.example.com` in dev but running on `localhost`. Session never persists.
Fix: Don't set domain in dev. Only set in production config.

**2. SameSite=Lax blocks OAuth callbacks**
OAuth redirect comes from external domain → cookie not sent → session lost.
Fix: Use `SameSite=Lax` (not `Strict`). Lax allows top-level navigation redirects.

**3. Session cookie too large for serverless**
Supabase JWTs with custom claims can exceed 4KB cookie limit.
Fix: Supabase SSR handles chunking automatically. Don't implement custom cookie logic.

**4. Token refresh race condition**
Multiple tabs open → all try to refresh token simultaneously → one wins, others get invalid token.
Fix: Use `onIdTokenChanged` (Firebase) or built-in refresh logic. Don't implement manual refresh.

**5. Session lost after deploy**
New deployment changes `AUTH_SECRET` → all existing sessions invalidated.
Fix: Never regenerate `AUTH_SECRET` in production. Store in secure env manager.

## OAuth Gotchas

**6. "redirect_uri_mismatch" error**
Google OAuth requires EXACT match. `http://localhost:3000/` ≠ `http://localhost:3000` (trailing slash).
Fix: Copy the exact URL from your auth config and paste into Google Console.

**7. GitHub scope confusion**
`user:email` gives email. `read:user` gives profile. You usually want both.
Fix: Request both scopes: `scope: "read:user user:email"`.

**8. Apple private relay email**
Apple provides `xyz@privaterelay.appleid.com` instead of real email.
Fix: Accept it. Your email workflows must handle relay addresses. Don't require "real" email.

**9. Double-click OAuth**
User clicks "Sign in with Google" twice quickly → two auth flows → one fails with state mismatch.
Fix: Disable button after first click. Re-enable after timeout or navigation.

**10. OAuth works in dev, fails in production**
Forgot to add production domain to authorized redirect URIs.
Fix: Add both localhost AND production URLs to every OAuth provider dashboard.

## Database Issues

**11. Migration fails — tables already exist**
Running `better-auth generate` twice creates duplicate migration.
Fix: Check migration status before regenerating. Use `--force` flag carefully.

**12. Foreign key on user delete**
Deleting user fails because other tables reference `user_id`.
Fix: Use `ON DELETE CASCADE` on all foreign keys referencing user table.

**13. Connection pool exhaustion**
Auth middleware checks session on EVERY request → N requests = N DB connections.
Fix: Use connection pooler (PgBouncer, Neon pooler, Supabase pooler). Set pool size appropriately.

## Next.js Specific

**14. Middleware runs on static assets**
Without proper matcher, auth middleware runs on `/favicon.ico`, `/_next/static/*`, images.
Fix: Always use matcher config: `/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg)$).*)`.

**15. Server vs Client auth state mismatch**
Server Component shows "logged in", Client Component shows "logged out" (or vice versa).
Fix: Use consistent auth check. Server: `auth()` or `getUser()`. Client: `useSession()` with SessionProvider.

**16. Edge runtime incompatibility**
Some auth libraries (Better Auth with certain DB adapters) don't work in Edge runtime.
Fix: Use JWT strategy for Edge middleware. Or use Node.js runtime for auth routes.

**17. ISR/SSG pages can't access session**
Statically generated pages have no request context → no cookies → no session.
Fix: Use client-side auth check on static pages. Or use SSR (`force-dynamic`).

## Production Surprises

**18. Email verification links expire**
Default: 24 hours. Users who wait → broken link → "your app is broken" complaints.
Fix: Set reasonable expiry (48-72 hours). Show clear error message with "resend" button.

**19. Rate limiting too aggressive**
Default rate limits block legitimate users (fast typers, retry after error).
Fix: Test rate limits with real usage patterns. Set window: 60s, max: 10 attempts.

**20. Password reset token in email preview**
Email clients show URL preview → token visible in notification. Some email clients pre-fetch URLs.
Fix: Use POST endpoint for reset (not GET with token in URL). Or use short-lived tokens (15 min).

**21. OAuth token table grows fast**
Every OAuth sign-in creates/updates token record. High-traffic apps → millions of rows.
Fix: Clean up expired tokens periodically. Index `expiresAt` column.

## Redirect & Navigation Issues

**22. Redirect before session cookie is set (Firebase/cookie-based auth)**
After Firebase `signInWithEmailAndPassword` or `signInWithPopup` resolves, the client-side auth state is set BUT the server-side session cookie does NOT exist yet. Redirecting immediately causes middleware to bounce the user back to `/login`.
Fix: Create a `createSessionCookie()` helper that POSTs the idToken to `/api/auth/session`. Call it and `await` it BEFORE redirecting. Never rely on `onAuthStateChanged` for the initial redirect.

**23. Sign-out doesn't redirect (Firebase/cookie-based auth)**
Calling `signOut(auth)` only clears Firebase client-side state. The `__session` cookie still exists, so middleware still considers the user logged in. The user stays on the dashboard.
Fix: Call `DELETE /api/auth/session` FIRST to clear the cookie, THEN call Firebase `signOut()`, THEN redirect with `window.location.href = "/login"` (full reload, not `router.push`).

**24. buttonVariants in Server Component causes build error**
shadcn/ui `button.tsx` has `"use client"` directive. If `buttonVariants` (a pure `cva()` function) is exported from the same file, Server Components cannot import it.
Fix: Extract `buttonVariants` into a separate `button-variants.ts` file WITHOUT `"use client"`. Import it from there in Server Components.

## Firebase Specific

**25. FIREBASE_PRIVATE_KEY newline issue**
`.env` file stores `\n` as literal characters, not newlines. Admin SDK fails silently.
Fix: `process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")`.

**26. Auth emulator doesn't send emails**
Development with emulator → email verification "works" but no email sent → false confidence.
Fix: Know this limitation. Test email flow with real Firebase in staging.

**27. signInWithRedirect returns null**
On mobile, `signInWithRedirect` redirects away. On return, `getRedirectResult()` must be called.
Fix: Always call `getRedirectResult(auth)` on page load to catch redirect results.

## Security

**28. JWT in localStorage = XSS vulnerable**
Storing auth tokens in localStorage allows any XSS attack to steal them.
Fix: Use httpOnly cookies. Never store auth tokens in localStorage or sessionStorage.

**29. Missing CSRF protection**
Some auth libraries disable CSRF by default for API routes.
Fix: Verify your auth library's CSRF settings. Better Auth handles it internally. For Firebase, validate the `Origin` header in your session POST endpoint against `NEXT_PUBLIC_APP_URL`.

**30. OAuth state parameter skipped**
Skipping `state` parameter → open redirect vulnerability.
Fix: Never disable state verification. All modern auth libraries handle this — don't override.

## Better Auth — Specific Pitfalls

**31. Better Auth middleware uses `headers()` from `next/headers` — breaks in Edge Runtime**
The `headers()` function from `next/headers` may not be available in Edge Runtime middleware. Using it in `middleware.ts` can cause runtime errors on Vercel/Cloudflare.
Fix: Use Better Auth's `auth()` wrapper pattern in middleware instead. Reserve `auth.api.getSession({ headers: await headers() })` for Server Components only.

**32. Better Auth `cookieCache` causes stale session data**
With `cookieCache.enabled: true` and `maxAge: 300` (5 min), session changes (role updates, email verification) won't reflect for up to 5 minutes. Users see stale data after profile updates.
Fix: Understand the tradeoff. Cookie cache reduces DB queries but delays session updates. For critical flows (email verification callback, role changes), invalidate the cache by calling `auth.api.getSession()` with `disableCookieCache: true`.

**33. Better Auth `redirectTo` in `requestPasswordReset` allows open redirect**
If `redirectTo` is derived from user input (URL query param), an attacker can redirect users to a phishing page after password reset.
Fix: Always hardcode `redirectTo: "/reset-password"` in your forgot-password handler. Never derive it from `window.location`, URL params, or user input.

**34. Better Auth schema not generated after adding plugins**
Adding plugins like `twoFactor()`, `organization()`, or `admin()` requires regenerating the database schema. Forgetting this step causes runtime errors when the plugin tries to access tables that don't exist.
Fix: Run `npx @better-auth/cli generate && npx @better-auth/cli migrate` after every plugin change.

**35. Better Auth `BETTER_AUTH_URL` mismatch causes cookie/session loss**
Setting `BETTER_AUTH_URL` to `http://localhost:3000` but accessing via `127.0.0.1:3000` causes cookie domain mismatch. Sessions appear to not persist.
Fix: Ensure `BETTER_AUTH_URL` matches the EXACT URL you access in the browser. No trailing slash. Match protocol, host, and port exactly.

**36. `create-next-app .` fails with ".omc/ directory conflicts" in infinite loop**
When using Claude Code with OMC plugin, `.omc/` is recreated by hooks between deletion and `create-next-app` execution. The scaffolder requires a completely empty directory, so it fails every time — even after `rm -rf .omc`.
Fix: Never scaffold with `.` in the current directory. Use `npx create-next-app@14 /tmp/nextjs-scaffold-$RANDOM ...` then copy files back. Or scaffold into a named subdirectory and move files up.

**37. Next.js 16 deprecated `middleware.ts` — build fails with "please use proxy instead"**
`create-next-app@latest` now installs Next.js 16, which renamed the `middleware.ts` convention to `proxy.ts`. All auth middleware templates in this plugin use `middleware.ts` (Next.js 14/15 convention). Building with Next.js 16 produces: `⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.`
Fix: Pin to Next.js 14 when scaffolding: `npx create-next-app@14`. If you must use Next.js 16, rename `src/middleware.ts` to `src/proxy.ts` and update imports — but note that the proxy API has different conventions than middleware.

**38. Better Auth renamed `forgetPassword` to `requestPasswordReset` — build fails with type error**
Older Better Auth versions used `authClient.forgetPassword()`. The current SDK uses `authClient.requestPasswordReset()`. Calling the old method produces: `Property 'forgetPassword' does not exist on type. Did you mean 'resetPassword'?`
Fix: Replace `authClient.forgetPassword({ email, redirectTo })` with `authClient.requestPasswordReset({ email, redirectTo })`. The `resetPassword` method is for the second step (setting the new password with a token).

**39. `useSearchParams()` in reset-password page causes build failure without Suspense**
Next.js 14+ App Router requires components using `useSearchParams()` to be wrapped in a `<Suspense>` boundary. Without it, static generation fails with: `useSearchParams() should be wrapped in a suspense boundary at page "/reset-password"`.
Fix: Split the reset-password page into a wrapper (`page.tsx` with `<Suspense>`) and a form component (`reset-password-form.tsx` with the actual logic). The wrapper imports the form inside `<Suspense fallback={<Loading />}>`.

**40. shadcn/ui `init` overwrites globals.css with Tailwind v4 syntax on Next.js 14**
Running `npx shadcn@latest init` on a Next.js 14 project replaces `@tailwind base/components/utilities` directives with `@import "tailwindcss"` (Tailwind v4 syntax). Next.js 14 ships Tailwind v3 which doesn't understand `@import "tailwindcss"`, causing build failure: `Module not found: Can't resolve 'tailwindcss'`.
Fix: After running `shadcn init`, restore the Tailwind v3 directives in `globals.css`: `@tailwind base; @tailwind components; @tailwind utilities;` followed by the shadcn CSS variables in `@layer base`.

**41. Drizzle adapter fails with "model user not found in schema object"**
The Better Auth Drizzle adapter requires the schema to be passed explicitly. Without it: `[# Drizzle Adapter]: The model "user" was not found in the schema object. Please pass the schema directly to the adapter options.`
Fix: Import your schema and pass it: `drizzleAdapter(db, { provider: "sqlite", schema })`. Also ensure `db` is created with schema: `drizzle(client, { schema })`.

**42. `serverExternalPackages` not recognized in Next.js 14 — build fails**
Adding `serverExternalPackages: ["better-sqlite3"]` to `next.config.ts` works in Next.js 15+ but fails in Next.js 14 with: `Unrecognized key(s) in object: 'serverExternalPackages'`.
Fix: Check the Next.js version in `package.json` first. For Next.js 14, use `experimental: { serverComponentsExternalPackages: ["better-sqlite3"] }`. For Next.js 15+, use the top-level `serverExternalPackages`.

**43. Better Auth middleware uses `auth()` wrapper — `auth` has no call signatures**
The `auth()` wrapper pattern (`export default auth((request) => { ... })`) is an Auth.js/NextAuth convention. Better Auth's `auth` export is a server instance, not a callable middleware wrapper. Using it produces: `Type 'Auth<...>' has no call signatures`.
Fix: Use a standard Next.js middleware function that checks the `better-auth.session_token` cookie directly: `const sessionCookie = request.cookies.get("better-auth.session_token"); const isLoggedIn = !!sessionCookie?.value;`. Also check `__Secure-better-auth.session_token` for HTTPS deployments.

**44. `npx shadcn@2 init` fails with "tailwind: Required" on Next.js 14 + Tailwind v3**
`shadcn@2` (v2.5+) expects Tailwind v4's CSS-based config (`@config` directive). With Next.js 14's `tailwind.config.ts` + Tailwind v3, it fails: `Validation failed: - tailwind: Required`.
Fix: Pin shadcn to v2.1.0: `npx shadcn@2.1.0 init -d`. This version correctly detects `tailwind.config.ts` with Tailwind v3. Do NOT use `shadcn@2` or `shadcn@latest` with Next.js 14.

**45. ESLint `no-unused-vars` on catch blocks — build fails**
`catch (error)` where `error` is never used (e.g., you only call `setError("static message")`) triggers `@typescript-eslint/no-unused-vars` and fails the Next.js build.
Fix: Use bare `catch {` without a binding when the error variable isn't needed. If you need to log it, keep `catch (error)` and add `console.error(error)` — but remove the `console.error` in production builds.

**46. Login shows "Invalid email or password" when the real error is "Email not verified"**
The login page catch block uses a generic error message for ALL failures. When `requireEmailVerification: true` and the user hasn't verified their email, Better Auth returns `EMAIL_NOT_VERIFIED` — but the user sees "Invalid email or password" and thinks their credentials are wrong.
Fix: Check the error message in the catch block: `if (msg.includes("Email not verified")) { setError("Please verify your email..."); }`. Always surface the actual error to the user instead of a generic fallback.

**47. Resend `onboarding@resend.dev` silently drops emails to non-owner addresses**
With Resend's free tier test sender (`onboarding@resend.dev`), emails can ONLY be delivered to the email address that owns your Resend account. Emails to any other address are silently rejected with a 403 error: "You can only send testing emails to your own email address." The `sendAuthEmail` function doesn't log this error, so verification/reset emails appear to send but never arrive.
Fix: (1) For testing, register/sign-up using the same email as your Resend account. (2) For production, verify your own domain at resend.com/domains and set `EMAIL_FROM=auth@yourdomain.com`. (3) Add try/catch with `console.error` to the `sendAuthEmail` function so Resend 403 errors are logged to the terminal.

**48. `drizzle-kit push` fails: "Please specify 'dialect' param in config file"**
Newer versions of drizzle-kit require `dialect: "sqlite"` (or `"postgresql"`, `"mysql"`) in `drizzle.config.ts`. Using only `driver: "better-sqlite3"` without `dialect` causes a ZodError. The `driver` field is no longer sufficient on its own.
Fix: Add `dialect: "sqlite"` to your `drizzle.config.ts` and remove the `driver` field (it's inferred from dialect + dbCredentials). Correct config:
```ts
export default { schema: "./src/db/schema.ts", out: "./drizzle", dialect: "sqlite", dbCredentials: { url: "sqlite.db" } } satisfies Config;
```

**49. `shopt -s dotglob` fails in zsh — "command not found: shopt"**
macOS uses zsh by default. `shopt` is a bash-only command. When scaffolding Next.js into `/tmp` and copying back, `cp -a /tmp/dir/*` misses dotfiles (`.gitignore`, `.eslintrc.json`, etc.) without `shopt -s dotglob`.
Fix: Use `cp -a /tmp/dir/. .` instead (the trailing `/.` copies ALL files including dotfiles). This works in both bash and zsh.

**50. `new Resend()` at module top level crashes `next build` — "Missing API key"**
Creating `const resend = new Resend(process.env.RESEND_API_KEY)` at module scope causes `next build` to fail with `Missing API key` when `RESEND_API_KEY` is not set. During build, Next.js evaluates server modules to collect page data — the Resend constructor throws before the runtime check (`if (!process.env.RESEND_API_KEY)`) can prevent it.
Fix: Create the Resend instance INSIDE the `sendAuthEmail` function, after the API key guard: `if (!process.env.RESEND_API_KEY) { console.log(...); return; } const resend = new Resend(process.env.RESEND_API_KEY);`

**51. `token` from `searchParams.get()` is `string | null` — type error in `resetPassword`**
`searchParams.get("token")` returns `string | null`, but `authClient.resetPassword({ token })` expects `string`. Even though the component guards with `if (!token) return null`, TypeScript doesn't carry that narrowing into async closures.
Fix: Use non-null assertion: `authClient.resetPassword({ newPassword: password, token: token! })`. The `!` is safe because the component already returns null when token is missing.

**52. Firebase `signInWithPopup` blocked by CSP — "Loading the script violates Content Security Policy"**
Using `signInWithPopup()` or `signInWithRedirect()` with Firebase Auth requires loading scripts from `apis.google.com` and `accounts.google.com`. If your `next.config` has a Content-Security-Policy header that only allows `script-src 'self'`, the Google Identity scripts are blocked and sign-in silently fails with "Failed to sign in with Google."
Fix: Add Google domains to `script-src`, `connect-src`, and `frame-src` in your CSP: `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://accounts.google.com; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com https://accounts.google.com; frame-src 'self' https://*.firebaseapp.com https://accounts.google.com;`. The `assets/config/next.config.ts` template already includes these domains.

**53. Firebase Google OAuth — Error 400: redirect_uri_mismatch**
After clicking "Continue with Google", Google shows "Access blocked: This app's request is invalid" with `Error 400: redirect_uri_mismatch`. This means the OAuth redirect URI registered in Google Cloud Console does not match the URL Firebase is sending.
Fix: Go to Google Cloud Console → APIs & Services → Credentials → your OAuth 2.0 Client ID. Configure TWO separate sections (do not mix them up):
**Authorized redirect URIs** (full paths allowed): add `https://<PROJECT_ID>.firebaseapp.com/__/auth/handler`. Note: you do NOT need a localhost redirect URI — Firebase's `signInWithPopup` always routes through `<PROJECT_ID>.firebaseapp.com` even in local dev.
**Authorized JavaScript origins** (domain only, NO paths, NO trailing slashes): add `http://localhost:3000` and `https://<PROJECT_ID>.firebaseapp.com`.
IMPORTANT: JavaScript origins must NOT contain paths like `/__/auth/handler` — Google rejects URIs with paths in this section. Save and wait 1-2 minutes for propagation. Replace `<PROJECT_ID>` with your Firebase project ID from `.env.local` (`NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` without `.firebaseapp.com`).

**54. Firebase `signInWithPopup` → 400 Bad Request at `identitytoolkit.googleapis.com/v1/accounts:signInWithIdp`**
Google popup opens and user selects account, but then sign-in fails silently. Network tab shows POST to `identitytoolkit.googleapis.com` returning 400. Console may show `Cross-Origin-Opener-Policy would block the window.closed call`. The code is correct — the problem is Firebase/Google Cloud Console config. Three common causes:
1. **OAuth client ID mismatch:** Firebase Console → Auth → Sign-in method → Google → Web SDK configuration shows a Web client ID. The OAuth client with that ID in Google Cloud Console → Credentials must have `https://<PROJECT>.firebaseapp.com/__/auth/handler` in its redirect URIs.
2. **OAuth consent screen in Testing mode:** Google Cloud Console → OAuth consent screen → if status is "Testing", your email must be listed under "Test users". Unlisted emails get silently rejected.
3. **Wrong Firebase project:** `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` in `.env.local` points to a Firebase project where Google provider is not enabled, or a different project than the one with the OAuth client.
Fix: Follow the 5-step "Google OAuth Setup Checklist" in `references/05-firebase-auth-guide.md`. The most common miss is #2 (consent screen test users) — it causes a 400 with zero helpful error messages.

**55. Firebase Google sign-in → `auth/invalid-credential` + "The provided client secret is invalid"**
After user selects Google account, popup closes and Firebase returns `auth/invalid-credential`. The full error (hidden in catch block) says: `Error getting access token from google.com... error=invalid_client&error_description=The provided client secret is invalid`. This means the OAuth client secret stored in Firebase Console does not match the current secret in Google Cloud Console. This happens when the OAuth client secret was regenerated in Google Cloud Console but Firebase still has the old one cached.
Fix: Google Cloud Console → Credentials → click the OAuth client → copy the **Client secret**. Then Firebase Console → Authentication → Sign-in method → Google → expand **Web SDK configuration** → paste the new secret into **Web client secret** → Save. The catch block in the login code should log `err.code` and `err.message` during debugging — the default generic error message hides the real cause.

**56. `next.config.ts` not supported by Next.js 14 — "Configuring Next.js via 'next.config.ts' is not supported"**
Next.js 14 does not support TypeScript config files. The build crashes immediately with `Error: Configuring Next.js via 'next.config.ts' is not supported. Please replace the file with 'next.config.js' or 'next.config.mjs'.`
Fix: Save the config as `next.config.mjs` (not `.ts`). Remove `import type { NextConfig }` and replace `const nextConfig: NextConfig` with `/** @type {import('next').NextConfig} */ const nextConfig`. Use `export default nextConfig` (ESM syntax, no `module.exports`).

**57. `tailwindcss-animate` missing after `shadcn init` — build fails with "Cannot find module 'tailwindcss-animate'"**
`npx shadcn@2.1.0 init -d` adds `require("tailwindcss-animate")` to `tailwind.config.ts` but does NOT install the package. Build crashes with `Cannot find module 'tailwindcss-animate'`.
Fix: Run `npm install tailwindcss-animate` after `shadcn init`. This is a known shadcn issue — it modifies config but doesn't add the dependency to `package.json`.

**58. Better Auth `password.validate()` does not exist — build crash**
Adding a `password: { validate() }` option to `emailAndPassword` in Better Auth config causes a TypeScript error and build failure. This API does not exist in Better Auth — the library only supports `minPasswordLength` and `maxPasswordLength` for server-side validation.
Fix: Remove the `password.validate()` block. Use client-side validation in `register-page.tsx` for uppercase + number requirements. For stricter server-side validation, use a `beforeSignUp` hook or custom API route.

**59. Better Auth `requestPasswordReset({ redirectTo: "/reset-password" })` → INVALID_CALLBACK_URL**
Using a relative path like `/reset-password` in `redirectTo` causes Better Auth to return `{"message":"Invalid callbackURL","code":"INVALID_CALLBACK_URL"}`. The URL gets double-encoded (`%252F` instead of `%2F`) because Better Auth expects an absolute URL.
Fix: Use `redirectTo: \`\${window.location.origin}/reset-password\`` instead of `redirectTo: "/reset-password"`. This produces a valid absolute URL like `http://localhost:3000/reset-password`.

**60. Forgot-password email link → 404 because reset-password page was never created**
User clicks the password reset link from email but gets a 404. The `requestPasswordReset({ redirectTo })` sends users to `/reset-password?token=xxx`, but no page exists at that route.
Fix: Copy `reset-password.tsx` from `assets/components/{provider}/` (e.g., `assets/components/better-auth/`) to `app/(auth)/reset-password/page.tsx`. This page reads the `token` query param and calls `authClient.resetPassword({ newPassword, token })`. Also copy `forgot-password.tsx` to `app/(auth)/forgot-password/page.tsx` — both pages are required for the full flow.

**61. `for...of` over Map/Set fails build — "can only be iterated through when using the '--downlevelIteration' flag or with a '--target' of 'es2015' or higher"**
Generated rate-limit code in `app/api/auth/session/route.ts` uses `for (const [k, v] of attempts) { ... }` to iterate a `Map`. `create-next-app@14`'s default `tsconfig.json` ships with `"target": "es5"` and no `downlevelIteration` flag, so the type-check phase of `next build` fails:
`Type 'Map<string, ...>' can only be iterated through when using the '--downlevelIteration' flag or with a '--target' of 'es2015' or higher.`
Affects: any generated route that iterates a `Map` or `Set` with `for...of` or destructured entries (rate limiters, session caches, attempt trackers).
Fix (preferred): Use `.forEach((v, k) => ...)` instead of `for...of` — works on all targets, no tsconfig change needed:
```ts
attempts.forEach((v, k) => { if (now > v.resetAt) attempts.delete(k); });
```
Alternative fix: Use `Array.from(map.entries())` then iterate the array, or `Array.from(map.keys())` if you only need keys.
Last resort (do NOT prefer): Bump `tsconfig.json` `"target"` from `"es5"` to `"es2015"` (or higher), or add `"downlevelIteration": true`. This changes the emitted JS for the whole project — risky on a fresh scaffold. Plugin assets MUST default to `forEach` to stay compatible with the stock Next.js 14 tsconfig.
