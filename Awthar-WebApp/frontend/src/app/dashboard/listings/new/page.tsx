"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ImageUpload } from "@/components/image-upload";
import { getQueryFn } from "@/lib/query-client";
import { apiPost } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Category } from "@/types";
import { Loader2, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const createServiceSchema = z.object({
  titleEn: z.string().min(5, "Title must be at least 5 characters"),
  descriptionEn: z.string().min(20, "Description must be at least 20 characters"),
  categoryId: z.string().min(1, "Please select a category"),
  pricingType: z.enum(["fixed", "hourly", "custom"]),
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
  tags: z.string().optional(),
  paymentMethods: z.string().optional(),
  images: z.array(z.string()).optional(),
  location: z.object({
    emirate: z.string().optional(),
    city: z.string().optional(),
    area: z.string().optional(),
  }).optional(),
});

type CreateServiceFormValues = z.infer<typeof createServiceSchema>;

const EMIRATES = ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah"];

export default function CreateListingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [images, setImages] = useState<string[]>([]);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const form = useForm<CreateServiceFormValues>({
    resolver: zodResolver(createServiceSchema) as any,
    defaultValues: {
      titleEn: "", descriptionEn: "", categoryId: "", pricingType: "fixed",
      tags: "", paymentMethods: "", images: [], location: { emirate: "", city: "", area: "" },
    },
  });

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiPost("/api/services", data),
    onSuccess: () => {
      toast({ title: "Listing Created!", description: "Your service is now live." });
      router.push("/dashboard/listings");
    },
    onError: (error: Error) => {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: CreateServiceFormValues) => {
    const tags = data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
    const paymentMethods = data.paymentMethods ? data.paymentMethods.split(",").map((t) => t.trim()).filter(Boolean) : [];
    mutation.mutate({ ...data, tags, paymentMethods, images });
  };

  const canProceed = (s: number) => {
    if (s === 1) return form.watch("titleEn").length >= 5 && form.watch("categoryId") && form.watch("descriptionEn").length >= 20;
    if (s === 2) return true;
    return true;
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
          <h2 className="text-2xl font-bold">Create New Listing</h2>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all",
                step === s ? "bg-primary text-primary-foreground border-primary" :
                step > s ? "bg-green-500 text-white border-green-500" : "bg-muted border-border text-muted-foreground"
              )}>
                {step > s ? <Check className="h-4 w-4" /> : s}
              </div>
              <span className={cn("text-sm hidden sm:block", step === s ? "font-semibold" : "text-muted-foreground")}>
                {s === 1 ? "Basic Info" : s === 2 ? "Details" : "Media"}
              </span>
              {s < 3 && <div className={cn("flex-1 h-0.5", step > s ? "bg-green-500" : "bg-border")} />}
            </div>
          ))}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <Card>
                <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="titleEn" render={({ field }) => (
                    <FormItem><FormLabel>Service Title</FormLabel><FormControl><Input placeholder="e.g. Professional Home Cleaning" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />

                  <FormField control={form.control} name="categoryId" render={({ field }) => (
                    <FormItem><FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                        <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.nameEn}</SelectItem>)}</SelectContent>
                      </Select>
                    <FormMessage /></FormItem>
                  )} />

                  <FormField control={form.control} name="descriptionEn" render={({ field }) => (
                    <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe your service in detail..." className="min-h-[120px]" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />

                  <FormField control={form.control} name="tags" render={({ field }) => (
                    <FormItem><FormLabel>Tags (comma separated)</FormLabel><FormControl><Input placeholder="plumbing, repair, emergency" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </CardContent>
              </Card>
            )}

            {/* Step 2: Details */}
            {step === 2 && (
              <Card>
                <CardHeader><CardTitle>Pricing & Location</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="pricingType" render={({ field }) => (
                    <FormItem><FormLabel>Pricing Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="fixed">Fixed Price</SelectItem>
                          <SelectItem value="hourly">Hourly Rate</SelectItem>
                          <SelectItem value="custom">Custom / Quote</SelectItem>
                        </SelectContent>
                      </Select>
                    <FormMessage /></FormItem>
                  )} />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="priceMin" render={({ field }) => (
                      <FormItem><FormLabel>Min Price (AED)</FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="priceMax" render={({ field }) => (
                      <FormItem><FormLabel>Max Price (AED)</FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="paymentMethods" render={({ field }) => (
                    <FormItem><FormLabel>Payment Methods (comma separated)</FormLabel><FormControl><Input placeholder="Cash, Card, Bank Transfer" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />

                  <FormField control={form.control} name="location.emirate" render={({ field }) => (
                    <FormItem><FormLabel>Emirate</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select emirate" /></SelectTrigger></FormControl>
                        <SelectContent>{EMIRATES.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                      </Select>
                    <FormMessage /></FormItem>
                  )} />

                  <FormField control={form.control} name="location.city" render={({ field }) => (
                    <FormItem><FormLabel>City / Area</FormLabel><FormControl><Input placeholder="e.g. Downtown, JBR" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </CardContent>
              </Card>
            )}

            {/* Step 3: Media */}
            {step === 3 && (
              <Card>
                <CardHeader><CardTitle>Photos & Review</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-3">Service Photos (up to 5)</h3>
                    <ImageUpload value={images} onChange={setImages} maxFiles={5} />
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <h3 className="font-semibold">Review Your Listing</h3>
                    <p className="text-sm"><strong>Title:</strong> {form.watch("titleEn")}</p>
                    <p className="text-sm"><strong>Category:</strong> {categories.find((c) => c.id === form.watch("categoryId"))?.nameEn}</p>
                    <p className="text-sm"><strong>Pricing:</strong> {form.watch("pricingType")} — AED {form.watch("priceMin") || "—"}</p>
                    <p className="text-sm"><strong>Location:</strong> {form.watch("location.emirate") || "Not set"}</p>
                    <p className="text-sm"><strong>Images:</strong> {images.length} uploaded</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)} disabled={step === 1}>
                <ArrowLeft className="h-4 w-4 mr-2" />Back
              </Button>
              {step < 3 ? (
                <Button type="button" onClick={() => setStep((s) => s + 1)} disabled={!canProceed(step)}>
                  Next<ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                  Publish Listing
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
}
