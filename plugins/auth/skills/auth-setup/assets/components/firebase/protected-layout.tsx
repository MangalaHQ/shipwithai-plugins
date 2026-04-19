import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth-server";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getServerUser();
  if (!user) redirect("/login");

  return <>{children}</>;
}
