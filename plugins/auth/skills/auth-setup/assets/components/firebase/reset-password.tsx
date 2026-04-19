"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Reset your password</CardTitle>
          <CardDescription>
            Password reset is handled by Firebase. Check your email for a reset link
            from Firebase — it will take you to a secure page to set your new password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center">
            If you haven&apos;t received a reset email, try requesting one again.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Link href="/forgot-password" className="w-full">
            <Button variant="outline" className="w-full">Request password reset</Button>
          </Link>
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/login" className="underline hover:text-primary">Back to login</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
