import { useState, useEffect } from "react";
import { Search, Filter, MapPin, Star, Shield, SlidersHorizontal, Loader2, LayoutList, Map as MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Service, ProviderProfile, User, Category } from "@shared/schema";
import { getImageUrl } from "@/lib/image-utils";
import { useUserLocation } from "@/hooks/useUserLocation";
import { MapView } from "@/components/map-view";
import { reverseGeocode } from "@/lib/geocoding";
import { ServiceCard } from "@/components/service-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ServiceCardSkeleton } from "@/components/skeletons";

type ServiceWithRelations = Service & {
  provider: ProviderProfile & { user: User };
  category: Category;
};

export default function Browse() {
  const [location] = useLocation();
  const { latitude, longitude, error: locationError, loading: locationLoading, requestLocation } = useUserLocation();
  
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [locationName, setLocationName] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("search") || "";
  });

  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [radius, setRadius] = useState(25); // Default 25km
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // We use a separate state for "applied" filters to prevent refetching on every checkbox click
  // This mimics the "Apply Filter" button behavior
  const [appliedFilters, setAppliedFilters] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      search: params.get("search") || "",
      categories: params.getAll("category"), // Get all categories
      minPrice: 0,
      maxPrice: 2000,
      sortBy: params.get("sortBy") || "newest",
      latitude: params.get("latitude") ? parseFloat(params.get("latitude")!) : undefined,
      longitude: params.get("longitude") ? parseFloat(params.get("longitude")!) : undefined,
      radius: params.get("radius") ? parseFloat(params.get("radius")!) : undefined,
    };
  });

  // Sync with URL changes (e.g. from Header search)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get("search");
    if (searchParam !== null && searchParam !== appliedFilters.search) {
      setSearchQuery(searchParam);
      setAppliedFilters(prev => ({ ...prev, search: searchParam }));
    }
  }, [location]);

  // Update applied filters when location is retrieved successfully
  useEffect(() => {
    if (latitude && longitude) {
      setAppliedFilters(prev => ({
        ...prev,
        latitude,
        longitude,
        radius // Apply current radius
      }));

      // Get friendly name
      reverseGeocode(latitude, longitude).then(addr => {
        if (addr) {
          const name = [addr.area, addr.city].filter(Boolean).join(", ");
          setLocationName(name || "Current Location");
        } else {
          setLocationName("Current Location");
        }
      });
    }
  }, [latitude, longitude]);

  const handleApplyFilters = () => {
    setAppliedFilters(prev => ({
      ...prev,
      search: searchQuery,
      categories: selectedCategories,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      radius: radius, // Update radius if changed
      // We keep existing lat/lng unless cleared, or user can re-click "Use my location"
    }));
    setShowFilters(false); // Close mobile sheet if open
  };

  const handleSortChange = (value: string) => {
    // Sort applies instantly
    setAppliedFilters(prev => ({ ...prev, sortBy: value }));
  };

  const handleUseLocation = () => {
    requestLocation();
  };

  const handleClearLocation = () => {
    setAppliedFilters(prev => ({
      ...prev,
      latitude: undefined,
      longitude: undefined,
      radius: undefined
    }));
  };

  const queryParams = new URLSearchParams();
  if (appliedFilters.search) queryParams.append("search", appliedFilters.search);
  if (appliedFilters.categories.length > 0) {
    appliedFilters.categories.forEach(cat => queryParams.append("category", cat));
  }
  queryParams.append("minPrice", appliedFilters.minPrice.toString());
  queryParams.append("maxPrice", appliedFilters.maxPrice.toString());
  queryParams.append("sortBy", appliedFilters.sortBy);
  
  if (appliedFilters.latitude && appliedFilters.longitude && appliedFilters.radius) {
    queryParams.append("latitude", appliedFilters.latitude.toString());
    queryParams.append("longitude", appliedFilters.longitude.toString());
    queryParams.append("radius", appliedFilters.radius.toString());
  }

  const { data: services, isLoading } = useQuery<ServiceWithRelations[]>({
    queryKey: [`/api/services?${queryParams.toString()}`],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });



  const filters = (
    <div className="space-y-6">
      {/* Location Filter */}
      <div>
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Location</h3>
        <div className="space-y-4">
          {appliedFilters.latitude && appliedFilters.longitude ? (
            <div className="bg-muted/50 p-4 rounded-xl border border-border/50 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="truncate leading-tight">{locationName || "Using your location"}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive -mr-2" onClick={handleClearLocation}>
                   <span className="sr-only">Clear</span>
                   <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4"><path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.1929 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.1929 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                </Button>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-xs text-muted-foreground font-medium">
                  <span>Radius: <span className="text-foreground">{radius} km</span></span>
                </div>
                <Slider
                  min={1}
                  max={100}
                  step={1}
                  value={[radius]}
                  onValueChange={(vals) => setRadius(vals[0])}
                  className="w-full"
                />
              </div>
            </div>
          ) : (
            <div>
              <Button 
                variant="outline" 
                className="w-full h-12 justify-start px-4 text-muted-foreground hover:text-foreground border-2 border-dashed shadow-none hover:border-solid hover:border-primary/50 bg-transparent" 
                onClick={handleUseLocation}
                disabled={locationLoading}
              >
                {locationLoading ? (
                  <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                ) : (
                  <MapPin className="w-4 h-4 mr-3" />
                )}
                Use my location
              </Button>
              {locationError && (
                <p className="text-xs text-destructive mt-2 font-medium">{locationError}</p>
              )}
            </div>
          )}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Categories</h3>
        <ScrollArea className="h-[200px] pr-4">
          <div className="space-y-3">
            {categories?.map((cat) => (
              <div key={cat.id} className="flex items-center space-x-3">
                <Checkbox 
                  id={`cat-${cat.slug}`} 
                  checked={selectedCategories.includes(cat.slug)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedCategories([...selectedCategories, cat.slug]);
                    } else {
                      setSelectedCategories(selectedCategories.filter(c => c !== cat.slug));
                    }
                  }}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label 
                  htmlFor={`cat-${cat.slug}`} 
                  className="cursor-pointer text-sm font-normal text-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 hover:text-primary transition-colors"
                >
                  {cat.nameEn}
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Price Range</h3>
        <div className="space-y-6 pt-2">
          <Slider
            min={0}
            max={2000}
            step={50}
            value={priceRange}
            onValueChange={setPriceRange}
            className="w-full"
          />
          <div className="flex items-center justify-between">
            <div className="bg-background border rounded-md px-3 py-1 text-sm font-medium shadow-sm w-24 text-center">
              AED {priceRange[0]}
            </div>
            <span className="text-muted-foreground">-</span>
            <div className="bg-background border rounded-md px-3 py-1 text-sm font-medium shadow-sm w-24 text-center">
              AED {priceRange[1]}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2">
         <Button className="w-full h-11 rounded-lg shadow-md hover:shadow-lg transition-all" onClick={handleApplyFilters}>
            Apply Filters
        </Button>
      </div>
    </div>
  );
  
  // ... rest of the component similar to before but using handleApplyFilters for search input on Enter or something?
  // Actually, search input usually updates live or on blur. 
  // Let's bind search input to local state and let "Apply" trigger it? 
  // Or keep search separate? Usually users expect search to work on Enter.
  // I'll make the search input update local state and have a search button or Enter key trigger apply, 
  // BUT currently `searchQuery` is bound to `onChange`.
  // To make "Apply" button meaningful for sidebar, it's fine.
  // I will also add a "Search" button next to input to trigger apply.

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
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder="Search services..."
                className="pl-12 h-12 rounded-xl border-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleApplyFilters();
                  }
                }}
              />
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button onClick={handleApplyFilters} className="h-12 px-6 rounded-xl whitespace-nowrap">
                Search
              </Button>
              <Select value={appliedFilters.sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[180px] h-12 rounded-xl">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex bg-muted rounded-xl p-1 h-12 items-center">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  className="h-10 w-10 rounded-lg"
                  onClick={() => setViewMode('list')}
                >
                  <LayoutList className="h-5 w-5" />
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'ghost'}
                  size="icon"
                  className="h-10 w-10 rounded-lg"
                  onClick={() => setViewMode('map')}
                >
                  <MapIcon className="h-5 w-5" />
                </Button>
              </div>

              {/* Mobile Filter Button */}
              <Sheet open={showFilters} onOpenChange={setShowFilters}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl flex-shrink-0">
                    <SlidersHorizontal className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 overflow-y-auto">
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
            <aside className="hidden md:block w-64 xl:w-80 flex-shrink-0">
              <div className="sticky top-24">
                <Card className="rounded-xl border-none shadow-lg bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-bold text-lg tracking-tight">Filters</h2>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-muted-foreground hover:text-primary h-8 px-2 text-xs uppercase tracking-wide font-semibold"
                        onClick={() => {
                          setPriceRange([0, 2000]);
                          setSelectedCategories([]);
                          setSearchQuery("");
                          setAppliedFilters({
                            search: "",
                            categories: [],
                            minPrice: 0,
                            maxPrice: 2000,
                            sortBy: "newest",
                            latitude: undefined,
                            longitude: undefined,
                            radius: undefined,
                          });
                        }}
                      >
                        Reset All
                      </Button>
                    </div>
                    {filters}
                  </CardContent>
                </Card>
              </div>
            </aside>

            {/* Results */}
            <div className="flex-1">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-semibold">{isLoading ? "..." : (services?.length || 0)}</span> results
                </p>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <ServiceCardSkeleton key={i} />
                  ))}
                </div>
              ) : !services || services.length === 0 ? (
                <EmptyState
                  icon={Search}
                  title="No services found"
                  description="Try adjusting your search or filters to find what you're looking for."
                  action={
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setPriceRange([0, 2000]);
                        setSelectedCategories([]);
                        setSearchQuery("");
                        setAppliedFilters({
                          search: "",
                          categories: [],
                          minPrice: 0,
                          maxPrice: 2000,
                          sortBy: "newest",
                          latitude: undefined,
                          longitude: undefined,
                          radius: undefined,
                        });
                      }}
                    >
                      Clear All Filters
                    </Button>
                  }
                />
              ) : viewMode === 'map' ? (
                <div className="h-[600px] w-full rounded-xl border-2 overflow-hidden">
                  <MapView 
                    services={services} 
                    center={
                      appliedFilters.latitude && appliedFilters.longitude 
                        ? [appliedFilters.latitude, appliedFilters.longitude]
                        : [25.2048, 55.2708] // Default to Dubai
                    }
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>
              )}

              {/* Pagination (Placeholder for now) */}
              {services && services.length > 0 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  <Button variant="outline" className="rounded-lg" disabled>
                    Previous
                  </Button>
                  <Button variant="default" className="rounded-lg w-10 h-10 p-0">
                    1
                  </Button>
                  <Button variant="outline" className="rounded-lg" disabled>
                    Next
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}