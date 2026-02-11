"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseAuth } from "@/context/auth-context";
import { Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { updatePassword } = useSupabaseAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const isValid = password.length >= 12 && password === confirmPassword &&
    /[A-Z]/.test(password) && /[a-z]/.test(password) &&
    /[0-9]/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setIsSubmitting(true);
    try {
      await updatePassword(password);
      setIsComplete(true);
      toast({ title: "Password updated!", description: "Your password has been successfully reset." });
      setTimeout(() => router.push("/login"), 2000);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update password.";
      toast({ title: "Update Failed", description: message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4"><CheckCircle2 className="w-6 h-6 text-green-600" /></div>
            <CardTitle className="text-2xl font-bold">Password Updated</CardTitle>
            <CardDescription>Your password has been successfully reset. Redirecting to login...</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/login" className="text-sm text-primary hover:underline">Go to login now</Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">Enter your new password below</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isSubmitting} />
              <p className="text-xs text-muted-foreground">Minimum 12 characters with uppercase, lowercase, number, and special character</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isSubmitting}
                className={cn(confirmPassword && password !== confirmPassword && "border-destructive")} />
              {confirmPassword && password === confirmPassword && <p className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Passwords match</p>}
              {confirmPassword && password !== confirmPassword && <p className="text-xs text-destructive">Passwords do not match</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting || !isValid}>
              {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</>) : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
