// Clerk auth layout — wraps auth pages (sign-in / sign-up) with nav
// Place at: src/routes/auth.tsx or src/components/clerk/auth-layout.tsx
// ---------------------------------------------------

import { Outlet, Link } from "react-router-dom";
import { useUser } from "@clerk/react-router-js";

export function AuthLayout() {
  const { isLoaded, userId } = useUser();

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg">My App</Link>
        {userId ? (
          <Link to="/dashboard" className="text-sm text-primary hover:underline">Go to dashboard</Link>
        ) : (
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link to="/sign-in" className="hover:text-foreground">Sign in</Link>
            <Link to="/sign-up" className="hover:text-foreground">Sign up</Link>
          </div>
        )}
      </header>
      <main className="flex-1 flex items-center justify-center">
        <Outlet />
      </main>
    </div>
  );
}
