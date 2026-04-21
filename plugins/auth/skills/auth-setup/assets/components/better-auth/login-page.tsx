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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingAction, setLoadingAction] = useState<"idle" | "email" | "google" | "github" | "apple">("idle");
  const [error, setError] = useState<string | null>(null);
  const isLoading = loadingAction !== "idle";

  async function handleEmailLogin(event: React.FormEvent) {
    event.preventDefault();
    setLoadingAction("email");
    setError(null);

    try {
      const { error } = await authClient.signIn.email({ email, password });
      if (error) {
        // Detect email verification error before falling back to generic message
        if (error.code === "EMAIL_NOT_VERIFIED" || (error.message?.toLowerCase().includes("email") && error.message?.toLowerCase().includes("verif"))) {
          setError("Please verify your email before signing in. Check your inbox for the verification link.");
        } else {
          // SECURITY: Generic error message prevents account enumeration.
          setError("Unable to sign in. Please check your credentials.");
        }
        return;
      }
      router.push("/dashboard");
    } catch (catchError) {
      console.error("Login error:", catchError);
      setError("Unable to sign in. Please check your credentials.");
    } finally {
      setLoadingAction("idle");
    }
  }

  async function handleOAuthLogin(provider: "google" | "github" | "apple") {
    setLoadingAction(provider);
    setError(null);
    // Safety timeout: if OAuth redirect doesn't happen within 10s, reset UI.
    // This catches misconfigured credentials where signIn.social resolves without redirecting.
    const timeout = setTimeout(() => {
      setLoadingAction("idle");
      setError(`OAuth sign-in didn't redirect. Check that your ${provider} credentials are configured in .env.local.`);
    }, 10_000);
    try {
      await authClient.signIn.social({ provider, callbackURL: "/dashboard" });
      clearTimeout(timeout);
      // Better Auth handles redirect — if we reach here without redirect, timeout will reset UI
    } catch {
      clearTimeout(timeout);
      setError(`Failed to sign in with ${provider}. Please try again.`);
      setLoadingAction("idle");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
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
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{error}</div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-sm text-muted-foreground hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full transition-all duration-200 active:scale-[0.98]"
              disabled={isLoading}
            >
              {loadingAction === "email" && (
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
              {loadingAction === "email" ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
