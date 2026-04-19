"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";

interface UserProfileProps {
  user: { name: string; email: string; image?: string };
}

export default function UserProfilePage({ user }: UserProfileProps) {
  const [name, setName] = useState(user.name);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const initials = user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  async function handleUpdateProfile(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");
    try {
      await authClient.updateUser({ name });
      setMessage("Profile updated successfully.");
    } catch (updateError) {
      setMessage("Failed to update profile. Please try again.");
      console.error("Profile update error:", updateError);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSignOut() {
    setIsLoading(true);
    try {
      await authClient.signOut();
      window.location.href = "/login";
    } catch (signOutError) {
      console.error("Sign out error:", signOutError);
      window.location.href = "/login";
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profile Settings</CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <form onSubmit={handleUpdateProfile}>
          <CardContent className="space-y-4">
            {message && <div className="rounded-md bg-muted p-3 text-sm">{message}</div>}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(event) => setName(event.target.value)} disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user.email} disabled />
              <p className="text-xs text-muted-foreground">Email cannot be changed for OAuth accounts.</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="transition-all duration-200 active:scale-[0.98]">
              {isLoading ? (<><span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />Saving...</>) : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Sign out</p>
              <p className="text-sm text-muted-foreground">Sign out of your account on this device.</p>
            </div>
            <Button variant="outline" onClick={handleSignOut} disabled={isLoading} className="transition-all duration-200 active:scale-[0.98]">
              {isLoading ? (<><span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />Signing out...</>) : "Sign Out"}
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete account</p>
              <p className="text-sm text-muted-foreground">Permanently delete your account and all data.</p>
            </div>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!window.confirm("This action is permanent and cannot be undone. Are you sure you want to delete your account?")) return;
                await authClient.deleteUser();
                window.location.href = "/login";
              }}
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
