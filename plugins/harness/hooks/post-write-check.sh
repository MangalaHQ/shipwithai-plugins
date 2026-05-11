#!/bin/bash
# Post-write hook: checks generated auth files for dangerous patterns
# Triggered after Claude writes/edits files matching auth patterns

FILE_PATH="${TOOL_INPUT_file_path:-${TOOL_INPUT_filePath:-}}"

# Only check auth-related files
case "$FILE_PATH" in
  */lib/email.ts|*/lib/email.js)
    # R1: Check for module-scope Resend instantiation
    if grep -n "^const.*new Resend\|^let.*new Resend\|^var.*new Resend" "$FILE_PATH" 2>/dev/null; then
      echo "⚠️  PITFALL #50: \`new Resend()\` at module scope in $FILE_PATH"
      echo "   This will crash during build/SSR. Use lazy-init pattern from assets/config/email.ts"
      exit 1
    fi
    ;;
  */middleware.ts)
    # R4: Check Better Auth doesn't use auth() wrapper
    if grep -q "export.*auth.*as.*middleware\|export default auth(" "$FILE_PATH" 2>/dev/null; then
      echo "⚠️  PITFALL #43: middleware uses auth() wrapper — that's Auth.js, not Better Auth"
      echo "   Better Auth: check cookies.get('better-auth.session_token') directly"
      exit 1
    fi
    # R5: Check Firebase middleware doesn't import Admin SDK
    if grep -q "firebase-admin\|verifyIdToken\|verifySessionCookie" "$FILE_PATH" 2>/dev/null; then
      echo "⚠️  PITFALL #28: Firebase Admin SDK in middleware — Edge Runtime cannot run it"
      echo "   Only check cookie existence in middleware. Verify in (protected)/layout.tsx"
      exit 1
    fi
    ;;
  */reset-password/page.tsx)
    # R7: Check Suspense wrapper for useSearchParams
    if grep -q "useSearchParams" "$FILE_PATH" 2>/dev/null; then
      if ! grep -q "Suspense" "$FILE_PATH" 2>/dev/null; then
        echo "⚠️  PITFALL #47: useSearchParams() without <Suspense> wrapper"
        echo "   Next.js 14+ build will fail. Wrap the component in <Suspense>"
        exit 1
      fi
    fi
    ;;
esac

# All checks passed
exit 0
