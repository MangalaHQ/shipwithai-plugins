// ClerkProvider root wrapper for Vite + React Router v6
// Package: @clerk/react-router-js
// Place at: src/main.tsx or import into App.tsx
// ---------------------------------------------------
// IMPORTANT: Use @clerk/react-router-js, NOT @clerk/nextjs

import { ClerkProvider } from "@clerk/react-router-js";

interface ClerkProviderWrapperProps {
  children: React.ReactNode;
}

export function ClerkProviderWrapper({ children }: ClerkProviderWrapperProps) {
  return (
    <ClerkProvider
      routerType="path"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
      afterMultiSessionSingleSessionUrl="/dashboard"
      afterMultiSessionNewSessionUrl="/dashboard"
    >
      {children}
    </ClerkProvider>
  );
}
