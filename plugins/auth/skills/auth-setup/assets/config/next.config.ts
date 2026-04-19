// ============================================================
// Next.js Config — Security Headers
// IMPORTANT: Next.js 14 does NOT support next.config.ts.
// Save this file as next.config.mjs (not .ts) in your project root.
// ============================================================

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // COOP: Required for Firebase signInWithPopup — allows popup to communicate back.
          // Without this, Cross-Origin-Opener-Policy blocks window.closed calls.
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          // CSP: unsafe-inline needed for Next.js hydration.
          // unsafe-eval is only included in development (Next.js Fast Refresh requires it).
          //
          // PRODUCTION HARDENING: Replace unsafe-inline with nonce-based CSP.
          // 1. Create middleware that generates a nonce per request:
          //    const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
          //    const csp = `script-src 'self' 'nonce-${nonce}' https://apis.google.com;`;
          //    requestHeaders.set("Content-Security-Policy", csp);
          //    requestHeaders.set("x-nonce", nonce);
          // 2. In app/layout.tsx, read the nonce: headers().get("x-nonce")
          // 3. Pass nonce to <Script nonce={nonce}> components
          // See: https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy
          {
            key: "Content-Security-Policy",
            value:
              process.env.NODE_ENV === "development"
                ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://accounts.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com https://accounts.google.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com; frame-src 'self' https://*.firebaseapp.com https://accounts.google.com;"
                : "default-src 'self'; script-src 'self' 'unsafe-inline' https://apis.google.com https://accounts.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com https://accounts.google.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com; frame-src 'self' https://*.firebaseapp.com https://accounts.google.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
