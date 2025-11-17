import { useState, useEffect } from "react";
import { Search, Filter, MapPin, Star, Shield, SlidersHorizontal, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Category, Service } from "@shared/schema";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ExtendedService extends Service {
  provider: {
    id: string;
    rating: string | null;
    verificationStatus: string;
    providerType: string;
    user: {
      firstName: string | null;
      lastName: string | null;
    };
  };
  category: Category;
}

export default function Browse() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [professionalOnly, setProfessionalOnly] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 12;

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Build query parameters for services
  const buildQueryParams = () => {
    const params = new URLSearchParams();

    if (searchQuery) params.append("search", searchQuery);
    if (selectedCategories.length > 0) params.append("category", selectedCategories.join(","));
    if (priceRange[0] > 0) params.append("minPrice", priceRange[0].toString());
    if (priceRange[1] < 2000) params.append("maxPrice", priceRange[1].toString());
    if (minRating) params.append("minRating", minRating.toString());
    if (verifiedOnly) params.append("verifiedOnly", "true");
    if (professionalOnly) params.append("professionalOnly", "true");
    params.append("limit", limit.toString());
    params.append("offset", ((page - 1) * limit).toString());

    return params.toString();
  };

  // Fetch services with filters
  const {
    data: services,
    isLoading: servicesLoading,
    error,
  } = useQuery<ExtendedService[]>({
    queryKey: ["/api/services", buildQueryParams()],
    queryFn: async () => {
      const response = await fetch(`/api/services?${buildQueryParams()}`);
      if (!response.ok) throw new Error("Failed to fetch services");
      return response.json();
    },
  });

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
    setPage(1); // Reset to first page when filter changes
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setPriceRange([0, 2000]);
    setMinRating(null);
    setVerifiedOnly(false);
    setProfessionalOnly(false);
    setPage(1);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPage(1); // Reset to first page on new search
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    // Sort is handled client-side for now
  };

  // Client-side sorting (you can move this to backend later)
  const sortedServices = services ? [...services].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return (parseFloat(b.provider.rating || "0") - parseFloat(a.provider.rating || "0"));
      case "price-low":
        return (parseFloat(a.priceMin || "0") - parseFloat(b.priceMin || "0"));
      case "price-high":
        return (parseFloat(b.priceMin || "0") - parseFloat(a.priceMin || "0"));
      default:
        return 0; // relevance (keep default order)
    }
  }) : [];

  const filters = (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-4">Category</h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {categoriesLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading categories...</span>
            </div>
          ) : (
            categories?.map((cat) => (
              <div key={cat.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`cat-${cat.id}`}
                  checked={selectedCategories.includes(cat.id)}
                  onCheckedChange={() => toggleCategory(cat.id)}
                  data-testid={`checkbox-category-${cat.slug}`}
                />
                <Label htmlFor={`cat-${cat.id}`} className="cursor-pointer text-sm">
                  {cat.nameEn}
                </Label>
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-4">Price Range (AED)</h3>
        <div className="space-y-4">
          <Slider
            min={0}
            max={2000}
            step={50}
            value={priceRange}
            onValueChange={(value) => {
              setPriceRange(value);
              setPage(1);
            }}
            className="w-full"
            data-testid="slider-price-range"
          />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">AED {priceRange[0]}</span>
            <span className="text-muted-foreground">AED {priceRange[1]}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-4">Minimum Rating</h3>
        <div className="space-y-3">
          {[5, 4, 3, 2].map((rating) => (
            <div key={rating} className="flex items-center space-x-2">
              <Checkbox
                id={`rating-${rating}`}
                checked={minRating === rating}
                onCheckedChange={(checked) => {
                  setMinRating(checked ? rating : null);
                  setPage(1);
                }}
                data-testid={`checkbox-rating-${rating}`}
              />
              <Label htmlFor={`rating-${rating}`} className="cursor-pointer flex items-center gap-1">
                {rating} <Star className="w-4 h-4 fill-warning text-warning inline" /> & up
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-4">Verification</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="verified"
              checked={verifiedOnly}
              onCheckedChange={(checked) => {
                setVerifiedOnly(checked === true);
                setPage(1);
              }}
              data-testid="checkbox-verified"
            />
            <Label htmlFor="verified" className="cursor-pointer flex items-center gap-2">
              <Shield className="w-4 h-4 text-success" />
              Verified Only
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="professional"
              checked={professionalOnly}
              onCheckedChange={(checked) => {
                setProfessionalOnly(checked === true);
                setPage(1);
              }}
              data-testid="checkbox-professional"
            />
            <Label htmlFor="professional" className="cursor-pointer">Licensed Professionals</Label>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Browse Services</h1>
            <p className="text-lg text-muted-foreground">Find the perfect service provider for your needs</p>
          </div>

          {/* Search & Sort */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search services..."
                className="pl-12 h-12 rounded-xl border-2"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                data-testid="input-browse-search"
              />
            </div>
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[180px] h-12 rounded-xl" data-testid="select-sort">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Most Relevant</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>

              {/* Mobile Filter Button */}
              <Sheet open={showFilters} onOpenChange={setShowFilters}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl" data-testid="button-mobile-filters">
                    <SlidersHorizontal className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    {filters}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Desktop Filters Sidebar */}
            <aside className="hidden md:block w-80 flex-shrink-0">
              <Card className="sticky top-24 rounded-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-semibold text-lg">Filters</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground"
                      onClick={clearFilters}
                      data-testid="button-clear-filters"
                    >
                      Clear All
                    </Button>
                  </div>
                  {filters}
                </CardContent>
              </Card>
            </aside>

            {/* Results */}
            <div className="flex-1">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground" data-testid="text-results-count">
                  {servicesLoading ? (
                    <span>Loading...</span>
                  ) : error ? (
                    <span>Error loading services</span>
                  ) : (
                    <>
                      Showing <span className="font-semibold">{sortedServices.length}</span> result{sortedServices.length !== 1 ? 's' : ''}
                    </>
                  )}
                </p>
              </div>

              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>
                    Failed to load services. Please try again later.
                  </AlertDescription>
                </Alert>
              )}

              {servicesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : sortedServices.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg mb-2">No services found</p>
                  <p className="text-sm text-muted-foreground">Try adjusting your filters or search query</p>
                  <Button onClick={clearFilters} variant="outline" className="mt-4">
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {sortedServices.map((service) => (
                      <Link key={service.id} href={`/service/${service.id}`}>
                        <Card className="hover-elevate active-elevate-2 cursor-pointer transition-all border-2 rounded-xl h-full" data-testid={`card-service-${service.id}`}>
                          <CardContent className="p-0">
                            {/* Image */}
                            <div className="aspect-video bg-muted rounded-t-xl relative overflow-hidden">
                              {service.images && service.images.length > 0 ? (
                                <img
                                  src={service.images[0]}
                                  alt={service.titleEn}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
                              )}
                              {service.isFeatured && (
                                <Badge className="absolute top-4 right-4 bg-secondary text-secondary-foreground">
                                  Featured
                                </Badge>
                              )}
                            </div>

                            <div className="p-6">
                              <div className="flex items-start gap-3 mb-3">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary flex-shrink-0">
                                  {service.provider.user.firstName?.[0] || service.provider.user.lastName?.[0] || "P"}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-lg mb-1 line-clamp-1">
                                    {service.titleEn}
                                  </h3>
                                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    {service.provider.user.firstName} {service.provider.user.lastName}
                                    {service.provider.verificationStatus === "verified" && (
                                      <Shield className="w-4 h-4 text-success" />
                                    )}
                                  </p>
                                </div>
                              </div>

                              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                {service.descriptionEn}
                              </p>

                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 fill-warning text-warning" />
                                  <span className="font-semibold text-sm">
                                    {service.provider.rating ? parseFloat(service.provider.rating).toFixed(1) : "New"}
                                  </span>
                                  {service.provider.rating && (
                                    <span className="text-xs text-muted-foreground">
                                      ({service.provider.totalReviews || 0} reviews)
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <MapPin className="w-4 h-4" />
                                  {service.location?.emirate || "UAE"}
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-4 border-t">
                                <div>
                                  <div className="text-2xl font-bold text-primary">
                                    {service.pricingType === "fixed" && service.priceMin ? (
                                      <>AED {parseFloat(service.priceMin).toFixed(0)}</>
                                    ) : service.pricingType === "hourly" && service.priceMin ? (
                                      <>AED {parseFloat(service.priceMin).toFixed(0)}/hr</>
                                    ) : (
                                      <>Custom</>
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {service.pricingType === "fixed" ? "Fixed price" : service.pricingType === "hourly" ? "Per hour" : "Contact for quote"}
                                  </div>
                                </div>
                                <Button className="rounded-lg" data-testid={`button-view-service-${service.id}`}>
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>

                  {/* Pagination */}
                  {sortedServices.length >= limit && (
                    <div className="mt-12 flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        className="rounded-lg"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        data-testid="button-page-prev"
                      >
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-muted-foreground">Page {page}</span>
                      </div>
                      <Button
                        variant="outline"
                        className="rounded-lg"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={sortedServices.length < limit}
                        data-testid="button-page-next"
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
