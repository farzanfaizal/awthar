import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, User, Briefcase, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
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
  const queryClient = useQueryClient();
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

  const signupMutation = useMutation({
    mutationFn: async (data: Omit<typeof formData, "confirmPassword">) => {
      const res = await apiRequest("POST", "/api/signup", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Signup failed");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Welcome to Awthar!",
        description: "Your account has been created successfully.",
      });
      // Redirect providers to dashboard, customers to home
      setLocation(data.role === "provider" ? "/dashboard" : "/");
    },
    onError: (error: Error) => {
      toast({
        title: "Signup Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    // Don't submit if form is invalid
    if (!isFormValid) {
      toast({
        title: "Please fix the errors",
        description: "Check all fields and try again.",
        variant: "destructive",
      });
      return;
    }

    const { confirmPassword, ...signupData } = formData;
    signupMutation.mutate(signupData);
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Join Awthar to find services or become a provider
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            
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
                  <User className={cn(
                    "w-6 h-6",
                    formData.role === "customer" ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span className={cn(
                    "font-semibold text-sm",
                    formData.role === "customer" ? "text-primary" : "text-muted-foreground"
                  )}>Hire Professionals</span>
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
                  <Briefcase className={cn(
                    "w-6 h-6",
                    formData.role === "provider" ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span className={cn(
                    "font-semibold text-sm",
                    formData.role === "provider" ? "text-primary" : "text-muted-foreground"
                  )}>Offer Services</span>
                </div>
              </div>
            </div>

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
                  disabled={signupMutation.isPending}
                  className={cn(validationErrors.firstName && "border-destructive focus-visible:ring-destructive")}
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
                  disabled={signupMutation.isPending}
                  className={cn(validationErrors.lastName && "border-destructive focus-visible:ring-destructive")}
                />
                {validationErrors.lastName && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    {validationErrors.lastName}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                onBlur={() => handleBlur("email")}
                disabled={signupMutation.isPending}
                className={cn(validationErrors.email && "border-destructive focus-visible:ring-destructive")}
              />
              {validationErrors.email && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {validationErrors.email}
                </p>
              )}
            </div>
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
                disabled={signupMutation.isPending}
                className={cn(validationErrors.password && "border-destructive focus-visible:ring-destructive")}
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
                    <div className={cn("flex items-center gap-1", passwordRequirements.length ? "text-green-600" : "text-muted-foreground")}>
                      {passwordRequirements.length ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      At least 12 characters
                    </div>
                    <div className={cn("flex items-center gap-1", passwordRequirements.uppercase ? "text-green-600" : "text-muted-foreground")}>
                      {passwordRequirements.uppercase ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      One uppercase letter
                    </div>
                    <div className={cn("flex items-center gap-1", passwordRequirements.lowercase ? "text-green-600" : "text-muted-foreground")}>
                      {passwordRequirements.lowercase ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      One lowercase letter
                    </div>
                    <div className={cn("flex items-center gap-1", passwordRequirements.number ? "text-green-600" : "text-muted-foreground")}>
                      {passwordRequirements.number ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      One number
                    </div>
                    <div className={cn("flex items-center gap-1", passwordRequirements.special ? "text-green-600" : "text-muted-foreground")}>
                      {passwordRequirements.special ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      One special character
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                onBlur={() => handleBlur("confirmPassword")}
                disabled={signupMutation.isPending}
                className={cn(validationErrors.confirmPassword && "border-destructive focus-visible:ring-destructive")}
              />
              {validationErrors.confirmPassword && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {validationErrors.confirmPassword}
                </p>
              )}
              {!validationErrors.confirmPassword && formData.confirmPassword && formData.password === formData.confirmPassword && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Passwords match
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={signupMutation.isPending || !isFormValid}
            >
              {signupMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
            {!isFormValid && Object.keys(touched).length > 0 && (
              <p className="text-xs text-muted-foreground text-center">
                Please fill in all required fields correctly
              </p>
            )}
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <button
              onClick={() => setLocation("/login")}
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
