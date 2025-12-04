import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRoute, useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ImagePlus, X, ArrowLeft } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ImageUpload } from "@/components/image-upload";
import { useState, useEffect } from "react";
import { getImageUrl } from "@/lib/image-utils";

const editListingSchema = z.object({
  titleEn: z.string().min(10, "Title must be at least 10 characters"),
  descriptionEn: z.string().min(50, "Description must be at least 50 characters"),
  categoryId: z.string().min(1, "Please select a category"),
  pricingType: z.enum(["fixed", "hourly", "custom"]),
  priceMin: z.coerce.number().min(0, "Price must be positive"),
  priceMax: z.coerce.number().optional(),
  currency: z.string().default("AED"),
  emirate: z.string().min(1, "Emirate is required"),
  city: z.string().optional(),
  area: z.string().optional(),
  tags: z.string().optional(),
});

type EditListingFormValues = z.infer<typeof editListingSchema>;

const UAE_EMIRATES = [
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Umm Al Quwain",
  "Ras Al Khaimah",
  "Fujairah",
];

export default function EditListingPage() {
  const [match, params] = useRoute("/dashboard/listings/:id/edit");
  const serviceId = params?.id;
  const { isProvider } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  // Fetch existing service
  const { data: service, isLoading: isLoadingService } = useQuery({
    queryKey: ["/api/services", serviceId],
    queryFn: async () => {
      const res = await fetch(`/api/services/${serviceId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Service not found");
      return res.json();
    },
    enabled: !!serviceId,
  });

  const form = useForm<EditListingFormValues>({
    resolver: zodResolver(editListingSchema),
    defaultValues: {
      titleEn: "",
      descriptionEn: "",
      categoryId: "",
      pricingType: "fixed",
      priceMin: 0,
      currency: "AED",
      emirate: "",
      city: "",
      area: "",
      tags: "",
    },
  });

  // Populate form with existing data
  useEffect(() => {
    if (service) {
      form.reset({
        titleEn: service.titleEn || "",
        descriptionEn: service.descriptionEn || "",
        categoryId: service.categoryId || "",
        pricingType: service.pricingType || "fixed",
        priceMin: parseFloat(service.priceMin) || 0,
        priceMax: service.priceMax ? parseFloat(service.priceMax) : undefined,
        currency: service.currency || "AED",
        emirate: service.location?.emirate || "",
        city: service.location?.city || "",
        area: service.location?.area || "",
        tags: service.tags?.join(", ") || "",
      });
      // Sanitize images to handle legacy relative paths
      setUploadedImages((service.images || []).map(getImageUrl));
    }
  }, [service, form]);

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
  });

  const updateServiceMutation = useMutation({
    mutationFn: async (data: EditListingFormValues) => {
      const serviceData = {
        titleEn: data.titleEn,
        descriptionEn: data.descriptionEn,
        categoryId: data.categoryId,
        pricingType: data.pricingType,
        priceMin: data.priceMin.toString(),
        priceMax: data.priceMax?.toString(),
        currency: data.currency,
        images: uploadedImages,
        location: {
          emirate: data.emirate,
          city: data.city || undefined,
          area: data.area || undefined,
        },
        tags: data.tags
          ? data.tags.split(",").map((tag) => tag.trim()).filter((tag) => tag.length > 0)
          : [],
      };

      const res = await apiRequest("PATCH", `/api/services/${serviceId}`, serviceData);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update service");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Service Updated!",
        description: "Your service listing has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services", serviceId] });
      setLocation("/dashboard/listings");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Update Service",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: EditListingFormValues) {
    if (uploadedImages.length === 0) {
      toast({
        title: "Images Required",
        description: "Please upload at least one image for your service.",
        variant: "destructive",
      });
      return;
    }
    updateServiceMutation.mutate(data);
  }

  const handleImageUpload = (urls: string[]) => {
    setUploadedImages([...uploadedImages, ...urls]);
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  if (!isProvider) {
    setLocation("/");
    return null;
  }

  if (isLoadingService) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!service) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Service Not Found</h2>
          <Button onClick={() => setLocation("/dashboard/listings")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Listings
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setLocation("/dashboard/listings")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Service</h1>
            <p className="text-muted-foreground mt-2">Update your service listing</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Service Details</CardTitle>
            <CardDescription>Update your service information</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>

                  <FormField
                    control={form.control}
                    name="titleEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Professional Plumbing Services" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="descriptionEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your service..."
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={categoriesLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.map((category: any) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.nameEn}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Pricing */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Pricing</h3>

                  <FormField
                    control={form.control}
                    name="pricingType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pricing Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="fixed">Fixed Price</SelectItem>
                            <SelectItem value="hourly">Hourly Rate</SelectItem>
                            <SelectItem value="custom">Custom Quote</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="priceMin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {form.watch("pricingType") === "fixed" ? "Price" : "Starting Price"}
                          </FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <Input type="number" min="0" step="0.01" {...field} />
                              <span className="text-sm text-muted-foreground">AED</span>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch("pricingType") === "custom" && (
                      <FormField
                        control={form.control}
                        name="priceMax"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Maximum Price (Optional)</FormLabel>
                            <FormControl>
                              <div className="flex items-center gap-2">
                                <Input type="number" min="0" step="0.01" {...field} />
                                <span className="text-sm text-muted-foreground">AED</span>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Service Location</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="emirate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Emirate</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select emirate" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {UAE_EMIRATES.map((emirate) => (
                                <SelectItem key={emirate} value={emirate}>
                                  {emirate}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Downtown Dubai" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="area"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Area (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Business Bay" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Images */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Service Images</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload high-quality images of your work. The first uploaded image will be used as the cover.
                  </p>

                  <ImageUpload 
                    value={uploadedImages} 
                    onChange={setUploadedImages} 
                    maxFiles={10} 
                  />
                </div>

                {/* Tags */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Tags (Optional)</h3>

                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Tags</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. emergency, licensed, 24/7" {...field} />
                        </FormControl>
                        <FormDescription>Comma-separated keywords</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation("/dashboard/listings")}
                    disabled={updateServiceMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateServiceMutation.isPending}>
                    {updateServiceMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Update Service
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
