import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
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
import { Loader2, ImagePlus, X } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ImageUpload } from "@/components/image-upload";
import { LocationPicker } from "@/components/location-picker";
import { reverseGeocode } from "@/lib/geocoding";
import { useState } from "react";

const createListingSchema = z.object({
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

type CreateListingFormValues = z.infer<typeof createListingSchema>;

const UAE_EMIRATES = [
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Umm Al Quwain",
  "Ras Al Khaimah",
  "Fujairah",
];

export default function CreateListingPage() {
  const { user, isProvider } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);

  const form = useForm<CreateListingFormValues>({
    resolver: zodResolver(createListingSchema),
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

  // Handle map location selection
  const handleLocationChange = async (loc: { lat: number; lng: number }) => {
    setLocationCoords(loc);
    
    // Auto-fill address from coordinates
    const address = await reverseGeocode(loc.lat, loc.lng);
    if (address) {
      if (address.emirate && UAE_EMIRATES.includes(address.emirate)) {
        form.setValue("emirate", address.emirate);
      } else {
        // Fallback or try to map state to Emirate if possible
        // Nominatim state names usually match
      }
      if (address.city) form.setValue("city", address.city);
      if (address.area) form.setValue("area", address.area);
    }
  };

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
  });

  const createServiceMutation = useMutation({
    mutationFn: async (data: CreateListingFormValues) => {
      // Transform form data to API format
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
          latitude: locationCoords?.lat,
          longitude: locationCoords?.lng,
        },
        tags: data.tags
          ? data.tags.split(",").map((tag) => tag.trim()).filter((tag) => tag.length > 0)
          : [],
        status: "active",
      };

      const res = await apiRequest("POST", "/api/services", serviceData);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create service");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Service Created!",
        description: "Your service listing has been published successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      setLocation("/dashboard/listings");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Create Service",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: CreateListingFormValues) {
    if (uploadedImages.length === 0) {
      toast({
        title: "Images Required",
        description: "Please upload at least one image for your service.",
        variant: "destructive",
      });
      return;
    }
    createServiceMutation.mutate(data);
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Create New Service</h1>
          <p className="text-muted-foreground mt-2">
            List your service on the marketplace to reach more customers
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Service Details</CardTitle>
            <CardDescription>
              Provide detailed information about your service
            </CardDescription>
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
                          <Input
                            placeholder="e.g. Professional Plumbing Services"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          A clear, descriptive title for your service
                        </FormDescription>
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
                            placeholder="Describe your service in detail, including what's included, your experience, and what makes your service unique..."
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
                          defaultValue={field.value}
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                            {form.watch("pricingType") === "fixed"
                              ? "Price"
                              : "Starting Price"}
                          </FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                              />
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
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder="0.00"
                                  {...field}
                                />
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
                  <p className="text-sm text-muted-foreground">
                    Pin point the exact location of your service. This helps customers find you on the map.
                  </p>
                  
                  <LocationPicker 
                    value={locationCoords} 
                    onChange={handleLocationChange} 
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="emirate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Emirate</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                          <Input
                            placeholder="e.g. emergency, licensed, 24/7 (comma-separated)"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Add relevant keywords to help customers find your service
                        </FormDescription>
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
                    disabled={createServiceMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createServiceMutation.isPending}>
                    {createServiceMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Publish Service
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
