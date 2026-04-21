# [Project Name]

## Quick Start

```bash
npm install
cp .env.example .env.local   # Fill in your credentials
npx drizzle-kit push          # Better Auth only — create database tables
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Authentication

This project uses **[Provider Name]** for authentication.

### Auth Routes

| Route | Description |
|-------|-------------|
| `/login` | Sign in with email/password or Google OAuth |
| `/register` | Create a new account |
| `/forgot-password` | Request a password reset email |
| `/reset-password` | Set a new password (from email link) |
| `/dashboard` | Protected page (requires authentication) |

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
<!-- BETTER AUTH -->
| `BETTER_AUTH_SECRET` | Yes | Random secret for signing sessions (`npx nanoid` to generate) |
| `BETTER_AUTH_URL` | Yes | App URL (e.g., `http://localhost:3000`) |
| `DATABASE_URL` | Yes | Database connection string |
| `RESEND_API_KEY` | No | Resend API key for email delivery (console fallback in dev) |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
<!-- FIREBASE -->
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Yes | Firebase web API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Yes | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Yes | Firebase project ID |
| `FIREBASE_PROJECT_ID` | Yes | Firebase project ID (server) |
| `FIREBASE_CLIENT_EMAIL` | Yes | Service account email |
| `FIREBASE_PRIVATE_KEY` | Yes | Service account private key |
| `NEXT_PUBLIC_APP_URL` | Yes | App URL for CSRF protection |

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/auth.ts` | Auth configuration (Better Auth) |
| `src/lib/firebase.ts` | Firebase client SDK (Firebase) |
| `src/lib/firebase-admin.ts` | Firebase Admin SDK (Firebase) |
| `src/middleware.ts` | Route protection (deny-by-default) |
| `src/db/schema.ts` | Database schema (Better Auth + Drizzle) |
| `src/lib/email.ts` | Email provider (Better Auth + Resend) |

## Production Checklist

- [ ] Replace `BETTER_AUTH_SECRET` with a strong random value
- [ ] Switch from SQLite to PostgreSQL for production
- [ ] Set `RESEND_API_KEY` for real email delivery
- [ ] Add security headers via `next.config.ts` template
- [ ] Enable rate limiting for auth endpoints
- [ ] Remove `.env.local` from version control (should be in `.gitignore`)
