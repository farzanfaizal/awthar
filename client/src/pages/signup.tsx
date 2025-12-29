import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, User, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

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

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    const { confirmPassword, ...signupData } = formData;
    signupMutation.mutate(signupData);
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
                  disabled={signupMutation.isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  disabled={signupMutation.isPending}
                />
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
                required
                disabled={signupMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={signupMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                disabled={signupMutation.isPending}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={signupMutation.isPending}
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
