"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useAppMode } from "@/context/app-mode-context";
import { apiPost } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Briefcase, Building2, Users, CheckCircle2, ArrowRight } from "lucide-react";

const becomeProviderSchema = z.object({
  companyName: z.string().min(3, "Company/Display name must be at least 3 characters"),
  bio: z.string().min(20, "Bio must be at least 20 characters"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  serviceRadius: z.coerce.number().min(1, "Radius must be at least 1km"),
  providerType: z.enum(["casual_tasker", "licensed_professional"]),
});

type BecomeProviderFormValues = z.infer<typeof becomeProviderSchema>;

export default function BecomeProviderPage() {
  const { user, isLoading: isAuthLoading, isProvider } = useAuth();
  const { setMode } = useAppMode();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<BecomeProviderFormValues>({
    resolver: zodResolver(becomeProviderSchema) as any,
    defaultValues: { companyName: "", bio: "", phone: "", serviceRadius: 25, providerType: "casual_tasker" },
  });

  const mutation = useMutation({
    mutationFn: (data: BecomeProviderFormValues) => apiPost("/api/auth/providers", data),
    onSuccess: () => {
      toast({ title: "Congratulations!", description: "You are now a service provider. Welcome to your dashboard!" });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setMode("provider");
      router.push("/dashboard");
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) router.push("/login");
    else if (isProvider) router.push("/dashboard");
  }, [isAuthLoading, user, isProvider, router]);

  if (isAuthLoading) return null;
  if (!user || isProvider) return null;

  const benefits = [
    "Reach thousands of customers in the UAE",
    "Set your own prices and schedule",
    "Get paid securely through the platform",
    "Build your reputation with reviews",
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Briefcase className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Become a Service Provider</h1>
          <p className="text-sm text-muted-foreground">Start earning by offering your services</p>
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-6">
        <div className="md:col-span-2 order-2 md:order-1">
          <Card className="border bg-muted/30 sticky top-20">
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-3">Why join Awthar?</h3>
              <ul className="space-y-2.5">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3 order-1 md:order-2">
          <Card className="border">
            <CardContent className="p-4 md:p-5">
              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
                  <FormField control={form.control} name="providerType" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Provider Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Select provider type" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="casual_tasker"><div className="flex items-center gap-2"><Users className="h-4 w-4" /><span>Freelancer / Casual Tasker</span></div></SelectItem>
                          <SelectItem value="licensed_professional"><div className="flex items-center gap-2"><Building2 className="h-4 w-4" /><span>Licensed Professional / Company</span></div></SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="companyName" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Display Name / Company Name</FormLabel>
                      <FormControl><Input className="h-10" placeholder="e.g. Ahmed's Plumbing or FixIt LLC" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="bio" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Bio & Experience</FormLabel>
                      <FormControl><Textarea placeholder="Tell customers about your skills, experience, and services..." className="min-h-[100px] resize-none" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Business Phone</FormLabel>
                        <FormControl><Input className="h-10" placeholder="+971 50 000 0000" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="serviceRadius" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Service Radius (km)</FormLabel>
                        <FormControl><Input className="h-10" type="number" min="1" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <Button type="submit" className="w-full h-11 mt-2" disabled={mutation.isPending}>
                    {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                    Create Provider Profile
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
