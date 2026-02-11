"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DashboardLayout } from "@/components/dashboard-layout";
import { getQueryFn } from "@/lib/query-client";
import { apiPatch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { ProviderProfile, User } from "@/types";
import { Loader2, Save } from "lucide-react";

const settingsSchema = z.object({
  companyName: z.string().min(3, "Name must be at least 3 characters"),
  bio: z.string().min(20, "Bio must be at least 20 characters"),
  phone: z.string().min(10, "Please enter a valid phone number"),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

type ProviderWithUser = ProviderProfile & { user: User };

export default function SettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery<ProviderWithUser>({
    queryKey: ["/api/auth/providers/me/profile"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema) as any,
    defaultValues: { companyName: "", bio: "", phone: "" },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        companyName: profile.companyName || "",
        bio: profile.bio || "",
        phone: profile.phone || "",
      });
    }
  }, [profile, form]);

  const mutation = useMutation({
    mutationFn: (data: SettingsFormValues) => apiPatch("/api/auth/providers/me/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/providers/me/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Settings Saved", description: "Your provider profile has been updated." });
    },
    onError: (error: Error) => {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <div className="h-8 w-48 bg-muted animate-pulse rounded-md mb-6" />
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground mt-1">Manage your provider profile settings</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Provider Profile</CardTitle>
            <CardDescription>Update your business information visible to customers</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
                <FormField control={form.control} name="companyName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company / Display Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="bio" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl><Textarea className="min-h-[120px]" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Settings
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
