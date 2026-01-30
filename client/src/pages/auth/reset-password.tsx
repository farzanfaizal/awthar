import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseAuth } from "@/context/auth-context";
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type PasswordStrength = "weak" | "medium" | "strong";

export default function ResetPasswordPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { updatePassword } = useSupabaseAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);

  // Password strength calculation
  const passwordStrength = useMemo((): PasswordStrength => {
    if (!password) return "weak";

    let score = 0;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    if (score <= 3) return "weak";
    if (score <= 5) return "medium";
    return "strong";
  }, [password]);

  const passwordRequirements = useMemo(() => {
    return {
      length: password.length >= 12,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  }, [password]);

  const isFormValid = useMemo(() => {
    return (
      password.length >= 12 &&
      passwordRequirements.uppercase &&
      passwordRequirements.lowercase &&
      passwordRequirements.number &&
      passwordRequirements.special &&
      password === confirmPassword
    );
  }, [password, confirmPassword, passwordRequirements]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      toast({
        title: "Invalid password",
        description: "Please make sure your password meets all requirements.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePassword(password);
      toast({
        title: "Password updated!",
        description: "Your password has been successfully reset.",
      });
      setLocation("/login");
    } catch (error: any) {
      toast({
        title: "Failed to reset password",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setShowPasswordStrength(true)}
                disabled={isSubmitting}
              />

              {/* Password Strength Indicator */}
              {showPasswordStrength && password && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full transition-all",
                          passwordStrength === "weak" && "w-1/3 bg-red-500",
                          passwordStrength === "medium" && "w-2/3 bg-yellow-500",
                          passwordStrength === "strong" && "w-full bg-green-500"
                        )}
                      />
                    </div>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        passwordStrength === "weak" && "text-red-500",
                        passwordStrength === "medium" && "text-yellow-500",
                        passwordStrength === "strong" && "text-green-500"
                      )}
                    >
                      {passwordStrength === "weak" && "Weak"}
                      {passwordStrength === "medium" && "Medium"}
                      {passwordStrength === "strong" && "Strong"}
                    </span>
                  </div>

                  {/* Password Requirements Checklist */}
                  <div className="space-y-1 text-xs">
                    <div
                      className={cn(
                        "flex items-center gap-1",
                        passwordRequirements.length ? "text-green-600" : "text-muted-foreground"
                      )}
                    >
                      {passwordRequirements.length ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <AlertCircle className="w-3 h-3" />
                      )}
                      At least 12 characters
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-1",
                        passwordRequirements.uppercase ? "text-green-600" : "text-muted-foreground"
                      )}
                    >
                      {passwordRequirements.uppercase ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <AlertCircle className="w-3 h-3" />
                      )}
                      One uppercase letter
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-1",
                        passwordRequirements.lowercase ? "text-green-600" : "text-muted-foreground"
                      )}
                    >
                      {passwordRequirements.lowercase ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <AlertCircle className="w-3 h-3" />
                      )}
                      One lowercase letter
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-1",
                        passwordRequirements.number ? "text-green-600" : "text-muted-foreground"
                      )}
                    >
                      {passwordRequirements.number ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <AlertCircle className="w-3 h-3" />
                      )}
                      One number
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-1",
                        passwordRequirements.special ? "text-green-600" : "text-muted-foreground"
                      )}
                    >
                      {passwordRequirements.special ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <AlertCircle className="w-3 h-3" />
                      )}
                      One special character
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting}
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  Passwords do not match
                </p>
              )}
              {confirmPassword && password === confirmPassword && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Passwords match
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting || !isFormValid}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
