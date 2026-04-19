# OAuth Social Login — Cross-Provider Guide

Setup Google, GitHub, and Apple OAuth for Better Auth and Firebase Auth.

## Google OAuth Setup

### 1. Create OAuth Client

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create project (or select existing)
3. OAuth consent screen → External → Fill required fields
4. Credentials → Create OAuth Client ID → Web Application
5. Authorized redirect URIs:

| Auth Provider | Redirect URI |
|---|---|
| Better Auth | `http://localhost:3000/api/auth/callback/google` |
| Clerk | Managed by Clerk (configure in Clerk Dashboard) |
| Auth.js | `http://localhost:3000/api/auth/callback/google` |
| Firebase | `https://YOUR-PROJECT.firebaseapp.com/__/auth/handler` |
| Supabase | `https://YOUR-PROJECT.supabase.co/auth/v1/callback` |

6. Copy Client ID and Client Secret → add to `.env`

### 2. Config per Provider

**Better Auth:**
```ts
socialProviders: { google: { clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! } }
```ts

**Clerk:** Enable in Dashboard → User & Auth → Social Connections → Google. No code needed.

**Auth.js:** `import Google from "next-auth/providers/google"` — reads `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` automatically.

**Firebase:** Enable in Console → Authentication → Sign-in method → Google. Use `signInWithPopup(auth, new GoogleAuthProvider())`.

**Supabase:** Enable in Dashboard → Authentication → Providers → Google. Use `supabase.auth.signInWithOAuth({ provider: "google" })`.

## GitHub OAuth Setup

### 1. Create OAuth App

1. GitHub → Settings → Developer settings → OAuth Apps → New
2. Homepage URL: `http://localhost:3000`
3. Authorization callback URL:

| Auth Provider | Callback URL |
|---|---|
| Better Auth | `http://localhost:3000/api/auth/callback/github` |
| Clerk | Managed by Clerk |
| Auth.js | `http://localhost:3000/api/auth/callback/github` |
| Firebase | `https://YOUR-PROJECT.firebaseapp.com/__/auth/handler` |
| Supabase | `https://YOUR-PROJECT.supabase.co/auth/v1/callback` |

4. Copy Client ID + generate Client Secret → `.env`

### 2. Config per Provider

Same pattern as Google. Replace "google" with "github" in all configs.

## Apple Sign-In Setup

Most complex setup. Required for iOS apps published on App Store.

### 1. Apple Developer Setup

1. [Apple Developer](https://developer.apple.com) → Certificates, Identifiers & Profiles
2. Identifiers → App IDs → Register new → Enable "Sign in with Apple"
3. Identifiers → Services IDs → Register new:
   - Description: "Your App Web Auth"
   - Identifier: `com.yourapp.web`
   - Enable "Sign in with Apple" → Configure:
     - Domains: `yourdomain.com` and `localhost`
     - Return URLs: Your callback URL
4. Keys → Create new key → Enable "Sign in with Apple" → Download `.p8` file

### 2. Config per Provider

**Better Auth:**
```ts
socialProviders: {
  apple: {
    clientId: "com.yourapp.web",  // Services ID, NOT App ID
    clientSecret: generateAppleSecret(), // JWT signed with .p8 key
  }
}
```ts

**Clerk / Firebase / Supabase:** Enable in respective dashboards. Upload the `.p8` key.

**Auth.js:**
```ts
import Apple from "next-auth/providers/apple";
// Set AUTH_APPLE_ID, AUTH_APPLE_SECRET (generated JWT), AUTH_APPLE_TEAM_ID, AUTH_APPLE_KEY_ID
```ts

### Apple-specific gotchas

- Apple only sends user's name on FIRST sign-in. Store it immediately.
- Apple private relay email: `user@privaterelay.appleid.com`. Your email workflows must handle this.
- Client Secret is a JWT you generate (not a static string). It expires — regenerate periodically.

## Account Linking

When user signs in with Google, then later with GitHub (same email):

| Provider | Behavior |
|---|---|
| Better Auth | Auto-links if same email (configurable) |
| Clerk | Auto-links by default |
| Auth.js | Depends on `allowDangerousEmailAccountLinking` setting |
| Firebase | Creates separate accounts by default. Enable account linking in Console |
| Supabase | Auto-confirms and links if email matches |

**Pitfall:** If auto-linking is disabled, user ends up with 2 accounts. Always clarify behavior early.

## OAuth Buttons Component

Use `assets/components/{provider}/auth-provider-buttons.tsx` (e.g., `assets/components/better-auth/auth-provider-buttons.tsx`) for pre-built Google/GitHub/Apple buttons with proper branding and loading states.

## Universal Gotchas

- **Redirect URI must match EXACTLY.** `http` vs `https`, trailing slash, port number — all matter.
- **localhost vs 127.0.0.1:** Some providers treat these differently. Test both.
- **HTTPS required in production** for all OAuth providers.
- **Pop-up blocked:** `signInWithPopup` can be blocked by browsers. Always provide `signInWithRedirect` fallback.
- **Token expiration:** OAuth tokens expire. Handle refresh or re-authentication gracefully.
