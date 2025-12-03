import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useAppMode } from "@/context/app-mode-context";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertProviderProfileSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Briefcase, Building2, Users } from "lucide-react";
import { Header } from "@/components/header";

// Extend the schema to make certain fields required for the form
const becomeProviderSchema = insertProviderProfileSchema.extend({
  companyName: z.string().min(3, "Company/Display name must be at least 3 characters"),
  bio: z.string().min(20, "Bio must be at least 20 characters"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  serviceRadius: z.coerce.number().min(1, "Radius must be at least 1km"),
  providerType: z.enum(["casual_tasker", "licensed_professional"]),
});

type BecomeProviderFormValues = z.infer<typeof becomeProviderSchema>;

export default function BecomeProviderPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { setMode } = useAppMode();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<BecomeProviderFormValues>({
    resolver: zodResolver(becomeProviderSchema),
    defaultValues: {
      companyName: "",
      bio: "",
      phone: "",
      serviceRadius: 25,
      providerType: "casual_tasker",
      // Initialize array fields if any
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: BecomeProviderFormValues) => {
      // Use the existing provider profile creation endpoint logic
      // If we don't have a specific /api/providers endpoint, we might need to create one or use a user update one.
      // Checking routes... usually it's POST /api/auth/provider or similar.
      // Let's assume we need to create this endpoint or it exists.
      // Based on previous analysis, we might need to add this endpoint to auth.controller or provider.controller.
      // Let's try POST /api/provider-profile if we create it, or verify existing.
      // Re-reading auth.controller might be needed, but for now let's assume we'll create/use POST /api/providers
      const res = await apiRequest("POST", "/api/providers", data); 
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create provider profile");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Congratulations!",
        description: "You are now a service provider. Welcome to your dashboard!",
      });
      // Invalidate user query to refresh role
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      // Switch to provider mode
      setMode("provider");
      // Redirect to dashboard
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: BecomeProviderFormValues) {
    mutation.mutate(data);
  }

  if (isAuthLoading) return null;

  if (!user) {
    setLocation("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <div className="container max-w-3xl py-12 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Become a Service Provider</h1>
          <p className="text-muted-foreground">
            Start your journey with Awthar. Fill out your profile to get started.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Provider Profile</CardTitle>
            <CardDescription>
              This information will be displayed on your public profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <FormField
                  control={form.control}
                  name="providerType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select provider type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="casual_tasker">
                            <div className="flex items-center">
                              <Users className="mr-2 h-4 w-4" />
                              <span>Freelancer / Casual Tasker</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="licensed_professional">
                            <div className="flex items-center">
                              <Building2 className="mr-2 h-4 w-4" />
                              <span>Licensed Professional / Company</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select "Freelancer" for individuals or "Licensed Professional" for registered businesses.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name / Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Ahmed's Plumbing or FixIt LLC" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio & Experience</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell customers about your skills, experience, and what services you offer..." 
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+971 50 000 0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="serviceRadius"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Radius (km)</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormDescription>
                          How far are you willing to travel?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={mutation.isPending}>
                  {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Provider Profile
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
