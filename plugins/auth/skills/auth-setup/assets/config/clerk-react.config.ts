// Clerk Provider setup for Vite + React Router
// Package: @clerk/react-router-js (NOT @clerk/nextjs)
// Copy to: src/main.tsx or src/App.tsx
// ---------------------------------------------------

// vite.config.ts — opt out of Clerk telemetry
// import { defineClerkTelemetry } from "@clerk/react-router-js";
// defineClerkTelemetry({ preventCookieBasedTelemetry: true });

// src/main.tsx — full root with ClerkProvider
/*
import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider } from "@clerk/react-router-js";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClerkProvider
      routerType="path"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
      afterMultiSessionSingleSessionUrl="/dashboard"
      afterMultiSessionNewSessionUrl="/dashboard"
    >
      <App />
    </ClerkProvider>
  </React.StrictMode>
);
*/

// src/App.tsx — minimal routing with Clerk components
/*
import { Outlet, Link } from "react-router-dom";
import { useUser, UserButton } from "@clerk/react-router-js";
import { SignIn, SignUp } from "@clerk/react-router-js";

export default function App() {
  const { isLoaded, userId } = useUser();

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div>
      <nav>
        {userId ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <UserButton afterSignOutUrl="/sign-in" />
          </>
        ) : (
          <>
            <Link to="/sign-in">Sign in</Link>
            <Link to="/sign-up">Sign up</Link>
          </>
        )}
      </nav>
      <Outlet />
    </div>
  );
}
*/

// Environment variables needed:
// VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
// CLERK_SECRET_KEY=sk_test_...          (server only — never expose to client)
// VITE_CLERK_SIGN_IN_URL=/sign-in
// VITE_CLERK_SIGN_UP_URL=/sign-up
// VITE_CLERK_AFTER_SIGN_IN_URL=/dashboard
// VITE_CLERK_AFTER_SIGN_UP_URL=/dashboard
