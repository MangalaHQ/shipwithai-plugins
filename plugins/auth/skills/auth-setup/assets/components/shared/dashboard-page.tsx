/**
 * Dashboard Page — Protected page with sign-out button
 *
 * Place at: app/(protected)/dashboard/page.tsx
 *
 * This page is wrapped by the protected layout which verifies
 * the session server-side. The sign-out button is in dashboard-client.tsx
 * (client component, separate file).
 */

import { redirect } from "next/navigation";
// import { getServerUser } from "@/lib/auth-server"; // Uncomment after setting up auth
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  // Uncomment after setting up auth-server:
  // const user = await getServerUser();
  // if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <DashboardClient />
      </header>
      <main className="flex-1 p-6">
        <p className="text-muted-foreground">Welcome! You are signed in.</p>
      </main>
    </div>
  );
}
