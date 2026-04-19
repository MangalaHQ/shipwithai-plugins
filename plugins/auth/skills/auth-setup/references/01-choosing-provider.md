# Choosing Your Auth Provider

> **Currently supported:** Better Auth and Firebase Auth. Clerk, Auth.js, and Supabase Auth are planned for a future release.

## Decision Tree

```text
Start → New project?
  ├─ Need mobile (KMP/React Native)? → Firebase Auth
  ├─ Want self-hosted, full control? → Better Auth
  ├─ Google ecosystem (GCP/Firebase)? → Firebase Auth
  ├─ Building SaaS, zero auth cost? → Better Auth
  └─ Migrating existing auth? ─────→ See migration notes at bottom
```

## Cost at Scale

| MAU | Better Auth | Auth.js | Firebase | Supabase | Clerk |
|-----|-------------|---------|----------|----------|-------|
| 1K | $0 | $0 | $0 | $0 | $0 |
| 10K | $0 | $0 | $0 | $0 | $0 |
| 50K | $0 | $0 | $0 | $0 | $800/mo |
| 100K | $0 | $0 | ~$5/mo | $25/mo | $1,800/mo |
| 500K | $0 | $0 | ~$25/mo | $25/mo | $9,800/mo |

At scale, managed services (Clerk) get expensive fast.
Better Auth/Auth.js = free forever, you maintain infra.
Firebase/Supabase = sweet spot: generous free tier + reasonable scaling.

## Feature Comparison

| Feature | Better Auth | Clerk | Auth.js | Firebase | Supabase |
|---------|-------------|-------|---------|----------|----------|
| Email/Password | ✅ Built-in | ✅ | ✅ | ✅ | ✅ |
| OAuth Social | ✅ Built-in | ✅ 20+ | ✅ | ✅ | ✅ |
| Email Verify | ✅ | ✅ | ✅ | ✅ | ✅ |
| Password Reset | ✅ | ✅ | ✅ | ✅ | ✅ |
| Pre-built UI | ❌ Headless | ✅ Best | ❌ | ⚠️ Old | ❌ |
| 2FA/MFA | ✅ Plugin | ✅ $$$ | ⚠️ | ✅ Free | ✅ |
| Passkeys | ✅ Plugin | ✅ | ⚠️ | ⚠️ | ❌ |
| SSO/SAML | ✅ Plugin | ✅ $$$ | ❌ | ✅ $$ | ⚠️ OIDC |
| Magic Link | ✅ Plugin | ✅ | ✅ | ✅ | ✅ |
| Multi-tenant | ✅ Plugin | ✅ | ❌ | ❌ | ❌ (RLS) |
| RBAC | ✅ | ✅ | ⚠️ Manual | ✅ Claims | ✅ RLS |
| Mobile SDK | ❌ Web | ✅ RN | ❌ | ✅ Best | ✅ |
| KMP Support | ❌ | ❌ | ❌ | ✅ Best | ⚠️ REST |
| Self-hostable | ✅ | ❌ | ✅ | ❌ | ✅ |
| Vendor lock-in | None | High | None | Medium | Low |

## Framework Compatibility

| Provider | Next.js | Nuxt | SvelteKit | Hono | Express | KMP |
|----------|---------|------|-----------|------|---------|-----|
| Better Auth | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Clerk | ✅ Best | ✅ | ⚠️ | ⚠️ | ✅ | ❌ |
| Auth.js | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ❌ |
| Firebase | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Supabase | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ |

## Recommendations by Use Case

**Indie SaaS (web only):** Better Auth — zero cost, full control, great TypeScript DX.

**SaaS going mobile later:** Firebase Auth — best KMP support, free < 50K MAU, Google scale.

> **Coming soon:** Clerk (fastest setup, pre-built UI), Supabase Auth (native RLS), Auth.js (lightweight/educational).

## Migration Notes

**From NextAuth (v4) to Auth.js (v5):** Breaking changes in config format, session handling, and middleware. See auth.js migration guide.

**From NextAuth to Better Auth:** Better Auth has migration utility. Export users → import with password hashes preserved.

**From Firebase to Better Auth/Supabase:** Export users via Firebase Admin SDK. Password hashes use Firebase's scrypt variant — requires custom import handler.

**From Clerk to self-hosted:** Export via Clerk Backend API. Passwords NOT exportable (hashed server-side). Users must reset passwords after migration.
