"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ImageUpload } from "@/components/image-upload";
import { getQueryFn } from "@/lib/query-client";
import { apiPatch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { ServiceWithProvider, Category } from "@/types";
import { Loader2, ArrowLeft, Save } from "lucide-react";

const editServiceSchema = z.object({
  titleEn: z.string().min(5, "Title must be at least 5 characters"),
  descriptionEn: z.string().min(20, "Description must be at least 20 characters"),
  categoryId: z.string().min(1, "Please select a category"),
  pricingType: z.enum(["fixed", "hourly", "custom"]),
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
  tags: z.string().optional(),
  paymentMethods: z.string().optional(),
  location: z.object({
    emirate: z.string().optional(),
    city: z.string().optional(),
    area: z.string().optional(),
  }).optional(),
});

type EditServiceFormValues = z.infer<typeof editServiceSchema>;

const EMIRATES = ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah"];

export default function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [images, setImages] = useState<string[]>([]);

  const { data: service, isLoading: serviceLoading } = useQuery<ServiceWithProvider>({
    queryKey: [`/api/services/${id}`],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const form = useForm<EditServiceFormValues>({
    resolver: zodResolver(editServiceSchema) as any,
    defaultValues: {
      titleEn: "", descriptionEn: "", categoryId: "", pricingType: "fixed",
      tags: "", paymentMethods: "", location: { emirate: "", city: "", area: "" },
    },
  });

  useEffect(() => {
    if (service) {
      form.reset({
        titleEn: service.titleEn,
        descriptionEn: service.descriptionEn,
        categoryId: service.categoryId,
        pricingType: service.pricingType,
        priceMin: service.priceMin ? parseFloat(service.priceMin) : undefined,
        priceMax: service.priceMax ? parseFloat(service.priceMax) : undefined,
        tags: service.tags?.join(", ") || "",
        paymentMethods: service.paymentMethods?.join(", ") || "",
        location: {
          emirate: service.location?.emirate || "",
          city: service.location?.city || "",
          area: service.location?.area || "",
        },
      });
      setImages(service.images || []);
    }
  }, [service, form]);

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiPatch(`/api/services/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      queryClient.invalidateQueries({ queryKey: [`/api/services/${id}`] });
      toast({ title: "Listing Updated!", description: "Your changes have been saved." });
      router.push("/dashboard/listings");
    },
    onError: (error: Error) => {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: EditServiceFormValues) => {
    const tags = data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
    const paymentMethods = data.paymentMethods ? data.paymentMethods.split(",").map((t) => t.trim()).filter(Boolean) : [];
    mutation.mutate({ ...data, tags, paymentMethods, images });
  };

  if (serviceLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto">
          <div className="h-8 w-48 bg-muted animate-pulse rounded-md mb-6" />
          <div className="h-96 bg-muted animate-pulse rounded-lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
          <h2 className="text-2xl font-bold">Edit Listing</h2>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="titleEn" render={({ field }) => (
                  <FormItem><FormLabel>Service Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="categoryId" render={({ field }) => (
                  <FormItem><FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.nameEn}</SelectItem>)}</SelectContent>
                    </Select>
                  <FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="descriptionEn" render={({ field }) => (
                  <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea className="min-h-[120px]" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="tags" render={({ field }) => (
                  <FormItem><FormLabel>Tags (comma separated)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Pricing</CardTitle></CardHeader>
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
                    <FormItem><FormLabel>Min Price (AED)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="priceMax" render={({ field }) => (
                    <FormItem><FormLabel>Max Price (AED)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="paymentMethods" render={({ field }) => (
                  <FormItem><FormLabel>Payment Methods (comma separated)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Location</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="location.emirate" render={({ field }) => (
                  <FormItem><FormLabel>Emirate</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select emirate" /></SelectTrigger></FormControl>
                      <SelectContent>{EMIRATES.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                    </Select>
                  <FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="location.city" render={({ field }) => (
                  <FormItem><FormLabel>City / Area</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Photos</CardTitle></CardHeader>
              <CardContent>
                <ImageUpload value={images} onChange={setImages} maxFiles={5} />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
}
