"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

// Suspense wrapper required for useSearchParams() in Next.js 14+ App Router.
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) router.replace("/forgot-password");
  }, [token, router]);

  if (!token) return null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password.length > 128) { setError("Password must be less than 128 characters."); return; }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError("Password must contain at least one uppercase letter and one number.");
      return;
    }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }

    setIsLoading(true);

    try {
      await authClient.resetPassword({ newPassword: password, token: token! });
      setIsSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (submitError) {
      console.error("Password reset error:", submitError);
      setError("This reset link is invalid or has expired. Please request a new one.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Password reset!</CardTitle>
            <CardDescription>Your password has been updated. Redirecting to login...</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/login" className="w-full">
              <Button variant="outline" className="w-full">Go to login</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Reset your password</CardTitle>
          <CardDescription>Enter your new password below.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input id="password" type="password" placeholder="Min 8 characters" value={password} onChange={(event) => setPassword(event.target.value)} required disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input id="confirmPassword" type="password" placeholder="Confirm your password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required disabled={isLoading} />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full transition-all duration-200 active:scale-[0.98]" disabled={isLoading}>
              {isLoading && <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
              {isLoading ? "Resetting..." : "Reset password"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              <Link href="/login" className="underline hover:text-primary">Back to login</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
