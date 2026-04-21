import { Resend } from "resend";

// ============================================================
// Email Helper — Resend Integration
// File: src/lib/email.ts
//
// CRITICAL: Resend client MUST be lazy-initialized (inside the function),
// NOT at module top level. During build/SSR, modules are evaluated before
// env vars are injected — `new Resend(undefined)` throws "Missing API key"
// even when RESEND_API_KEY exists in .env.local. See pitfall #50.
// ============================================================

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error(
        "RESEND_API_KEY is not set. Add it to .env.local or switch to console-only email in src/lib/auth.ts."
      );
    }
    _resend = new Resend(apiKey);
  }
  return _resend;
}

/**
 * Send an auth-related email (verification, password reset).
 *
 * If RESEND_API_KEY is not set in development, logs to console instead.
 * In production, throws if RESEND_API_KEY is missing.
 */
export async function sendAuthEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  // Development fallback: log to console if no API key
  if (!process.env.RESEND_API_KEY) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY is required in production.");
    }
    // Extract action URL for dev convenience — avoid dumping full HTML to terminal
    // SECURITY: The URL contains auth tokens. Never log in production or staging.
    const urlMatch = html.match(/href="([^"]+)"/);
    const devUrl = urlMatch?.[1] ?? "(no URL found in email)";
    console.log(`[AUTH-DEV] Email to ${to}: ${subject}`);
    console.log(`[AUTH-DEV] Action URL (dev only): ${devUrl}`);
    return;
  }

  const { error } = await getResend().emails.send({
    from: process.env.EMAIL_FROM || "onboarding@resend.dev",
    to,
    subject,
    html,
  });

  if (error) {
    console.error("Failed to send email:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}
