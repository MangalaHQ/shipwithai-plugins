"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Icons } from "@/components/icons";
import { authClient } from "@/lib/auth-client";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingAction, setLoadingAction] = useState<"idle" | "email" | "google" | "github">("idle");
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const isLoading = loadingAction !== "idle";

  async function handleRegister(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password.length > 128) {
      setError("Password must be less than 128 characters.");
      return;
    }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError("Password must contain at least one uppercase letter and one number.");
      return;
    }

    setLoadingAction("email");
    try {
      const { error } = await authClient.signUp.email({ email, password, name });
      if (error) throw new Error(error.message);
      // Show verification notice instead of redirecting to dashboard.
      // With requireEmailVerification: true, the session is not valid until verified.
      setIsRegistered(true);
    } catch (catchError) {
      console.error("Registration error:", catchError);
      setError("Unable to create account. Please try again.");
    } finally {
      setLoadingAction("idle");
    }
  }

  async function handleOAuthLogin(provider: "google" | "github") {
    setLoadingAction(provider);
    setError(null);
    // Safety timeout: if OAuth redirect doesn't happen within 10s, reset UI.
    const timeout = setTimeout(() => {
      setLoadingAction("idle");
      setError(`OAuth sign-up didn't redirect. Check that your ${provider} credentials are configured in .env.local.`);
    }, 10_000);
    try {
      await authClient.signIn.social({ provider, callbackURL: "/dashboard" });
      clearTimeout(timeout);
      // Better Auth handles redirect — if we reach here without redirect, timeout will reset UI
    } catch {
      clearTimeout(timeout);
      setError(`Failed to sign up with ${provider}.`);
      setLoadingAction("idle");
    }
  }

  if (isRegistered) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription>
              We sent a verification link to <strong>{email}</strong>.
              Click the link to activate your account, then sign in.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Link href="/login">
              <Button variant="outline">Go to login</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>Get started with your free account</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Button
              variant="outline"
              onClick={() => handleOAuthLogin("google")}
              disabled={isLoading}
              className="w-full transition-all duration-200 active:scale-[0.98]"
            >
              {loadingAction === "google" ? (
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Icons.google className="mr-2 h-4 w-4" />
              )}
              Continue with Google
            </Button>
            <Button
              variant="outline"
              onClick={() => handleOAuthLogin("github")}
              disabled={isLoading}
              className="w-full transition-all duration-200 active:scale-[0.98]"
            >
              {loadingAction === "github" ? (
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Icons.gitHub className="mr-2 h-4 w-4" />
              )}
              Continue with GitHub
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><Separator className="w-full" /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{error}</div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" value={name} onChange={(event) => setName(event.target.value)} required disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Min 8 characters" value={password} onChange={(event) => setPassword(event.target.value)} required disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm Password</Label>
              <Input id="confirm" type="password" placeholder="••••••••" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required disabled={isLoading} />
            </div>

            <Button type="submit" className="w-full transition-all duration-200 active:scale-[0.98]" disabled={isLoading}>
              {loadingAction === "email" && (
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
              {loadingAction === "email" ? "Creating account..." : "Create account"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
