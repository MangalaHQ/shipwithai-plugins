"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { clearSessionAndSignOut } from "@/lib/firebase-session";

export function DashboardClient() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignOut() {
    setIsLoading(true);
    try {
      await clearSessionAndSignOut();
      window.location.href = "/login";
    } catch {
      setIsLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleSignOut}
      disabled={isLoading}
      className="transition-all duration-200 active:scale-[0.98]"
    >
      {isLoading ? (
        <>
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Signing out...
        </>
      ) : (
        "Sign out"
      )}
    </Button>
  );
}
