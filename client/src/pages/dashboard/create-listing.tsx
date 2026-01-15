import { useState } from "react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2, MapPin, DollarSign, Image as ImageIcon, FileText, ChevronRight, ChevronLeft } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { ImageUpload } from "@/components/image-upload";
import { LocationPicker } from "@/components/location-picker";
import { reverseGeocode } from "@/lib/geocoding";
import { cn } from "@/lib/utils";
import { Category } from "@shared/schema";
import { errorHandler } from "@/lib/error-handler";

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

const STEPS = [
  { id: 1, title: "Basic Info", icon: FileText },
  { id: 2, title: "Details & Location", icon: MapPin },
  { id: 3, title: "Media & Review", icon: ImageIcon },
];

export default function CreateListingPage() {
  const { user, isProvider } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [step, setStep] = useState(1);
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
    mode: "onChange",
  });

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const handleLocationChange = async (loc: { lat: number; lng: number }) => {
    setLocationCoords(loc);
    try {
      const address = await reverseGeocode(loc.lat, loc.lng);
      if (address) {
        if (address.emirate && UAE_EMIRATES.includes(address.emirate)) {
          form.setValue("emirate", address.emirate);
        }
        if (address.city) form.setValue("city", address.city);
        if (address.area) form.setValue("area", address.area);
      }
    } catch (error) {
      errorHandler.error("Failed to auto-fill address", error);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof CreateListingFormValues)[] = [];
    
    if (step === 1) {
      fieldsToValidate = ["titleEn", "descriptionEn", "categoryId", "tags"];
    } else if (step === 2) {
      fieldsToValidate = ["pricingType", "priceMin", "priceMax", "emirate", "city", "area"];
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setStep((s) => s + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setStep((s) => s - 1);
    window.scrollTo(0, 0);
  };

  const createServiceMutation = useMutation({
    mutationFn: async (data: CreateListingFormValues) => {
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

  if (!isProvider) {
    setLocation("/");
    return null;
  }

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Service</h1>
          <p className="text-muted-foreground mt-2">
            Follow the steps to list your service on the marketplace.
          </p>
        </div>

        {/* Stepper */}
        <div className="relative">
          <Progress value={progress} className="h-2 mb-8" />
          <div className="flex justify-between absolute top-0 left-0 w-full -mt-2">
            {STEPS.map((s, i) => {
              const isActive = s.id === step;
              const isCompleted = s.id < step;
              return (
                <div key={s.id} className="flex flex-col items-center">
                  <div 
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center border-2 bg-background transition-colors z-10",
                      isActive ? "border-primary text-primary" : 
                      isCompleted ? "border-primary bg-primary text-primary-foreground" : "border-muted text-muted-foreground"
                    )}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <s.icon className="w-4 h-4" />}
                  </div>
                  <span className={cn(
                    "text-xs mt-2 font-medium transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}>
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Steps */}
        <Card className="mt-8 border-none shadow-lg">
          <CardHeader>
            <CardTitle>{STEPS[step - 1].title}</CardTitle>
            <CardDescription>
              {step === 1 && "Let's start with the basics of your service."}
              {step === 2 && "Set your pricing and service location."}
              {step === 3 && "Add visuals and review your listing."}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Step 1: Basic Info */}
                {step === 1 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <FormField
                      control={form.control}
                      name="titleEn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Professional Home Cleaning" {...field} className="h-11" />
                          </FormControl>
                          <FormDescription>At least 10 characters. Make it catchy!</FormDescription>
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories?.map((category: Category) => (
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

                    <FormField
                      control={form.control}
                      name="descriptionEn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your service in detail..." 
                              className="min-h-[150px] resize-y" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. urgent, licensed, eco-friendly" {...field} className="h-11" />
                          </FormControl>
                          <FormDescription>Comma-separated keywords.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Step 2: Details */}
                {step === 2 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <DollarSign className="w-4 h-4" /> Pricing
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="pricingType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-11">
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
                        <FormField
                          control={form.control}
                          name="priceMin"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {form.watch("pricingType") === "fixed" ? "Price (AED)" : "Starting Price (AED)"}
                              </FormLabel>
                              <FormControl>
                                <Input type="number" min="0" {...field} className="h-11" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Location
                      </h3>
                      <div className="h-[300px] rounded-xl overflow-hidden border">
                        <LocationPicker value={locationCoords} onChange={handleLocationChange} />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="emirate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Emirate</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-11">
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {UAE_EMIRATES.map((e) => (
                                    <SelectItem key={e} value={e}>{e}</SelectItem>
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
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input {...field} className="h-11" placeholder="Optional" />
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
                              <FormLabel>Area</FormLabel>
                              <FormControl>
                                <Input {...field} className="h-11" placeholder="Optional" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Media & Review */}
                {step === 3 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Upload Images</h3>
                      <p className="text-sm text-muted-foreground">Add high-quality images to showcase your work.</p>
                      <ImageUpload value={uploadedImages} onChange={setUploadedImages} maxFiles={5} />
                    </div>

                    <Separator />

                    <div className="bg-muted/30 p-6 rounded-xl space-y-4">
                      <h3 className="font-semibold">Review Details</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground block">Title</span>
                          <span className="font-medium">{form.getValues("titleEn")}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Category</span>
                          <span className="font-medium">
                            {categories?.find((c: Category) => c.id === form.getValues("categoryId"))?.nameEn || "Selected"}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Price</span>
                          <span className="font-medium">
                            AED {form.getValues("priceMin")} ({form.getValues("pricingType")})
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Location</span>
                          <span className="font-medium">
                            {form.getValues("emirate")}
                            {form.getValues("city") ? `, ${form.getValues("city")}` : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex justify-between border-t p-6 bg-muted/10">
            <Button
              type="button"
              variant="outline"
              onClick={step === 1 ? () => setLocation("/dashboard/listings") : prevStep}
              disabled={createServiceMutation.isPending}
              className="h-11"
            >
              {step === 1 ? "Cancel" : "Back"}
            </Button>

            {step < 3 ? (
              <Button type="button" onClick={nextStep} className="h-11 px-8">
                Next Step <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={form.handleSubmit(onSubmit)} 
                disabled={createServiceMutation.isPending}
                className="h-11 px-8"
              >
                {createServiceMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Publish Listing
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
}