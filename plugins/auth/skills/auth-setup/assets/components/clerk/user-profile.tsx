// Clerk UserButton (avatar menu) + UserProfile modal/page
// Package: @clerk/react-router-js
// Place at: src/components/clerk/UserMenu.tsx (import into your Navbar)
// ---------------------------------------------------
// IMPORTANT: Use @clerk/react-router-js, NOT @clerk/nextjs

import { UserButton, UserProfile } from "@clerk/react-router-js";
import { Link } from "react-router-dom";

export function UserMenu() {
  return (
    <div className="flex items-center gap-4">
      {/* Navbar link to profile page */}
      <Link to="/user-profile" className="text-sm hover:underline">
        Profile
      </Link>
      {/* Avatar + dropdown with sign-out */}
      <UserButton
        afterSignOutUrl="/sign-in"
        userProfileUrl="/user-profile"
      />
    </div>
  );
}

// Full-page UserProfile route (optional — or use modal)
// Add to your router: { path: "user-profile", element: <UserProfilePage /> }
export function UserProfilePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <UserProfile />
    </div>
  );
}
