import { useState, useMemo } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseAuth } from "@/context/auth-context";
import { Loader2, User, Briefcase, CheckCircle2, XCircle, AlertCircle, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

type PasswordStrength = "weak" | "medium" | "strong";

interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function SignupPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { signUp, signInWithGoogle, isLoading: authLoading } = useSupabaseAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    role: "customer" as "customer" | "provider",
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);

  // Real-time validation
  const validationErrors = useMemo((): ValidationErrors => {
    const errors: ValidationErrors = {};

    // First name validation
    if (touched.firstName) {
      if (!formData.firstName.trim()) {
        errors.firstName = "First name is required";
      } else if (formData.firstName.trim().length < 2) {
        errors.firstName = "First name must be at least 2 characters";
      }
    }

    // Last name validation
    if (touched.lastName) {
      if (!formData.lastName.trim()) {
        errors.lastName = "Last name is required";
      } else if (formData.lastName.trim().length < 2) {
        errors.lastName = "Last name must be at least 2 characters";
      }
    }

    // Email validation
    if (touched.email) {
      if (!formData.email) {
        errors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = "Please enter a valid email address";
      }
    }

    // Password validation
    if (touched.password && formData.password) {
      if (formData.password.length < 12) {
        errors.password = "Password must be at least 12 characters";
      } else {
        const hasUpperCase = /[A-Z]/.test(formData.password);
        const hasLowerCase = /[a-z]/.test(formData.password);
        const hasNumber = /[0-9]/.test(formData.password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);

        if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
          errors.password = "Must include uppercase, lowercase, number, and special character";
        }
      }
    }

    // Confirm password validation
    if (touched.confirmPassword) {
      if (!formData.confirmPassword) {
        errors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
    }

    return errors;
  }, [formData, touched]);

  // Password strength calculation
  const passwordStrength = useMemo((): PasswordStrength => {
    if (!formData.password) return "weak";

    let score = 0;
    if (formData.password.length >= 12) score++;
    if (formData.password.length >= 16) score++;
    if (/[A-Z]/.test(formData.password)) score++;
    if (/[a-z]/.test(formData.password)) score++;
    if (/[0-9]/.test(formData.password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) score++;

    if (score <= 3) return "weak";
    if (score <= 5) return "medium";
    return "strong";
  }, [formData.password]);

  const passwordRequirements = useMemo(() => {
    const password = formData.password;
    return {
      length: password.length >= 12,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  }, [formData.password]);

  const isFormValid = useMemo(() => {
    return (
      formData.firstName.trim().length >= 2 &&
      formData.lastName.trim().length >= 2 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
      formData.password.length >= 12 &&
      passwordRequirements.uppercase &&
      passwordRequirements.lowercase &&
      passwordRequirements.number &&
      passwordRequirements.special &&
      formData.password === formData.confirmPassword
    );
  }, [formData, passwordRequirements]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (!isFormValid) {
      toast({
        title: "Please fix the errors",
        description: "Check all fields and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await signUp(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
      });

      // Show verification email message
      setShowVerificationMessage(true);
      toast({
        title: "Check your email!",
        description: "We've sent you a verification link to complete your registration.",
      });
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      // OAuth will redirect, so no need to handle success here
    } catch (error: any) {
      toast({
        title: "Google Sign Up Failed",
        description: error.message || "Failed to sign up with Google",
        variant: "destructive",
      });
      setIsGoogleLoading(false);
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const isPending = isSubmitting || authLoading;

  // Show verification email sent message
  if (showVerificationMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
            <CardDescription>
              We've sent a verification link to <strong>{formData.email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                Click the link in the email to verify your account and complete registration.
                The link will expire in 24 hours.
              </AlertDescription>
            </Alert>
            <div className="text-center text-sm text-muted-foreground">
              Didn't receive the email?{" "}
              <button
                onClick={() => setShowVerificationMessage(false)}
                className="text-primary hover:underline font-medium"
              >
                Try again
              </button>
            </div>
            <div className="text-center">
              <Link href="/login" className="text-sm text-primary hover:underline">
                Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Join Awthar to find services or become a provider
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Google OAuth Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={isPending || isGoogleLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div className="space-y-2">
              <Label>I want to...</Label>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={cn(
                    "cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-2 transition-all hover:border-primary/50",
                    formData.role === "customer"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-muted bg-background hover:bg-muted/50"
                  )}
                  onClick={() => setFormData({ ...formData, role: "customer" })}
                >
                  <User
                    className={cn(
                      "w-6 h-6",
                      formData.role === "customer" ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  <span
                    className={cn(
                      "font-semibold text-sm",
                      formData.role === "customer" ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    Hire Professionals
                  </span>
                </div>

                <div
                  className={cn(
                    "cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-2 transition-all hover:border-primary/50",
                    formData.role === "provider"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-muted bg-background hover:bg-muted/50"
                  )}
                  onClick={() => setFormData({ ...formData, role: "provider" })}
                >
                  <Briefcase
                    className={cn(
                      "w-6 h-6",
                      formData.role === "provider" ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  <span
                    className={cn(
                      "font-semibold text-sm",
                      formData.role === "provider" ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    Offer Services
                  </span>
                </div>
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  onBlur={() => handleBlur("firstName")}
                  disabled={isPending}
                  className={cn(
                    validationErrors.firstName &&
                      "border-destructive focus-visible:ring-destructive"
                  )}
                />
                {validationErrors.firstName && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    {validationErrors.firstName}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  onBlur={() => handleBlur("lastName")}
                  disabled={isPending}
                  className={cn(
                    validationErrors.lastName &&
                      "border-destructive focus-visible:ring-destructive"
                  )}
                />
                {validationErrors.lastName && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    {validationErrors.lastName}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                onBlur={() => handleBlur("email")}
                disabled={isPending}
                className={cn(
                  validationErrors.email && "border-destructive focus-visible:ring-destructive"
                )}
              />
              {validationErrors.email && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {validationErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                onFocus={() => setShowPasswordStrength(true)}
                onBlur={() => handleBlur("password")}
                disabled={isPending}
                className={cn(
                  validationErrors.password && "border-destructive focus-visible:ring-destructive"
                )}
              />
              {validationErrors.password && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {validationErrors.password}
                </p>
              )}

              {/* Password Strength Indicator */}
              {showPasswordStrength && formData.password && (
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

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                onBlur={() => handleBlur("confirmPassword")}
                disabled={isPending}
                className={cn(
                  validationErrors.confirmPassword &&
                    "border-destructive focus-visible:ring-destructive"
                )}
              />
              {validationErrors.confirmPassword && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {validationErrors.confirmPassword}
                </p>
              )}
              {!validationErrors.confirmPassword &&
                formData.confirmPassword &&
                formData.password === formData.confirmPassword && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Passwords match
                  </p>
                )}
            </div>

            <Button type="submit" className="w-full" disabled={isPending || !isFormValid}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
