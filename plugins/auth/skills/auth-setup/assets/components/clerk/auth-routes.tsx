// React Router v6 route config with Clerk auth guards
// Package: @clerk/react-router-js
// Place at: src/routes.ts or src/App.tsx
// ---------------------------------------------------
// IMPORTANT: Use @clerk/react-router-js, NOT @clerk/nextjs

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useAuth } from "@clerk/react-router-js";
import { SignIn, SignUp, UserProfile, useUser } from "@clerk/react-router-js";
import { Outlet, Link, Navigate } from "react-router-dom";

// Root layout with nav
function RootLayout() {
  const { isLoaded, userId } = useUser();

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div>
      <nav className="border-b px-6 py-4 flex gap-4">
        <Link to="/">Home</Link>
        {userId ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/user-profile">Profile</Link>
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

// Redirect to dashboard if authenticated, otherwise to sign-in
function ProtectedLayout() {
  const { isLoaded, userId } = useUser();
  if (!isLoaded) return <div>Loading...</div>;
  if (!userId) return <Navigate to="/sign-in" replace />;
  return <Outlet />;
}

// Public layout — redirect to dashboard if already signed in
function PublicLayout() {
  const { isLoaded, userId } = useUser();
  if (!isLoaded) return <div>Loading...</div>;
  if (userId) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

function HomePage() {
  return <div className="p-8"><h1 className="text-2xl font-bold">Welcome</h1></div>;
}

function DashboardPage() {
  const { user } = useUser();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Signed in as {user?.primaryEmailAddress?.emailAddress}</p>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      // Public routes — redirect if already authenticated
      { element: <PublicLayout />, children: [
        { path: "sign-in", element: <SignIn /> },
        { path: "sign-up", element: <SignUp /> },
      ]},
      // Protected routes — redirect to sign-in if not authenticated
      { element: <ProtectedLayout />, children: [
        { path: "dashboard", element: <DashboardPage /> },
        { path: "user-profile", element: <UserProfile /> },
      ]},
      // Open routes
      { index: true, element: <HomePage /> },
    ],
  },
]);
