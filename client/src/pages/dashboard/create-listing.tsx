import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Plus, Loader2, ArrowLeft, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useToast } from "@/hooks/use-toast";

const EMIRATES = [
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Umm Al Quwain",
  "Ras Al Khaimah",
  "Fujairah",
];

interface Category {
  id: string;
  nameEn: string;
  nameAr: string;
  slug: string;
}

export default function CreateListing() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Form state
  const [titleEn, setTitleEn] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [pricingType, setPricingType] = useState("fixed");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [emirate, setEmirate] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [tags, setTags] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState("");

  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
  });

  const createServiceMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create service");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Service listing created successfully!",
      });
      setLocation("/dashboard/listings");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddImage = () => {
    if (imageUrl && !images.includes(imageUrl)) {
      setImages([...images, imageUrl]);
      setImageUrl("");
    }
  };

  const handleRemoveImage = (url: string) => {
    setImages(images.filter(img => img !== url));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const location = {
      emirate: emirate || undefined,
      city: city || undefined,
      area: area || undefined,
    };

    const serviceData = {
      titleEn,
      titleAr: titleAr || undefined,
      descriptionEn,
      descriptionAr: descriptionAr || undefined,
      categoryId,
      pricingType,
      priceMin: priceMin ? parseFloat(priceMin) : undefined,
      priceMax: priceMax ? parseFloat(priceMax) : undefined,
      currency: "AED",
      location,
      tags: tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      images: images.length > 0 ? images : undefined,
      status: "active",
    };

    createServiceMutation.mutate(serviceData);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/dashboard/listings")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Listings
          </Button>
        </div>

        <div>
          <h1 className="text-2xl font-bold">Create New Listing</h1>
          <p className="text-muted-foreground">
            Add a new service to your portfolio
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Basic Information */}
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="titleEn">
                      Title (English) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="titleEn"
                      value={titleEn}
                      onChange={(e) => setTitleEn(e.target.value)}
                      placeholder="e.g., Professional House Cleaning"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="titleAr">Title (Arabic)</Label>
                    <Input
                      id="titleAr"
                      value={titleAr}
                      onChange={(e) => setTitleAr(e.target.value)}
                      placeholder="e.g., تنظيف منزلي احترافي"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="descriptionEn">
                      Description (English) <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="descriptionEn"
                      value={descriptionEn}
                      onChange={(e) => setDescriptionEn(e.target.value)}
                      placeholder="Describe your service in detail..."
                      rows={5}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descriptionAr">Description (Arabic)</Label>
                    <Textarea
                      id="descriptionAr"
                      value={descriptionAr}
                      onChange={(e) => setDescriptionAr(e.target.value)}
                      placeholder="وصف الخدمة بالتفصيل..."
                      rows={5}
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">
                    Category <span className="text-destructive">*</span>
                  </Label>
                  <Select value={categoryId} onValueChange={setCategoryId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.nameEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pricingType">Pricing Type</Label>
                  <Select value={pricingType} onValueChange={setPricingType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Price</SelectItem>
                      <SelectItem value="hourly">Hourly Rate</SelectItem>
                      <SelectItem value="negotiable">Negotiable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priceMin">
                      {pricingType === "fixed" ? "Price" : "Minimum Price"} (AED)
                    </Label>
                    <Input
                      id="priceMin"
                      type="number"
                      step="0.01"
                      min="0"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>

                  {pricingType !== "fixed" && (
                    <div className="space-y-2">
                      <Label htmlFor="priceMax">Maximum Price (AED)</Label>
                      <Input
                        id="priceMax"
                        type="number"
                        step="0.01"
                        min="0"
                        value={priceMax}
                        onChange={(e) => setPriceMax(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle>Service Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emirate">Emirate</Label>
                    <Select value={emirate} onValueChange={setEmirate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select emirate" />
                      </SelectTrigger>
                      <SelectContent>
                        {EMIRATES.map((em) => (
                          <SelectItem key={em} value={em}>
                            {em}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g., Al Ain"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="area">Area</Label>
                    <Input
                      id="area"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="e.g., Marina"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle>Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Enter image URL"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddImage}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={img}
                          alt={`Service image ${idx + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveImage(img)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g., cleaning, professional, eco-friendly"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate tags with commas to help customers find your service
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Error Display */}
            {createServiceMutation.isError && (
              <Alert variant="destructive">
                <AlertDescription>
                  {createServiceMutation.error?.message || "Failed to create service"}
                </AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/dashboard/listings")}
                disabled={createServiceMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  !titleEn ||
                  !descriptionEn ||
                  !categoryId ||
                  createServiceMutation.isPending
                }
              >
                {createServiceMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Listing
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
