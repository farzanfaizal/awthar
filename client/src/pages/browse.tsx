import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  MapPin,
  Star,
  Loader2,
  LayoutGrid,
  Map as MapIcon,
  X,
  BadgeCheck,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { useLocation } from "wouter";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { Service, ProviderProfile, User, Category } from "@shared/schema";
import { useUserLocation } from "@/hooks/useUserLocation";
import { MapView } from "@/components/map-view";
import { reverseGeocode } from "@/lib/geocoding";
import { ServiceCard } from "@/components/service-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ServiceCardSkeleton } from "@/components/skeletons";
import { cn } from "@/lib/utils";

type ServiceWithRelations = Service & {
  provider: ProviderProfile & { user: User };
  category: Category;
};

type PaginatedResponse = {
  services: ServiceWithRelations[];
  pagination: {
    offset: number;
    limit: number;
    hasMore: boolean;
    total: number;
  };
};

const PAGE_SIZE = 12;

// Quick filter options
const quickFilters = [
  { id: "verified", label: "Verified Only", icon: BadgeCheck },
  { id: "topRated", label: "4+ Stars", icon: Star },
];

export default function Browse() {
  const [location] = useLocation();
  const {
    latitude,
    longitude,
    error: locationError,
    loading: locationLoading,
    requestLocation,
  } = useUserLocation();

  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [locationName, setLocationName] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("search") || "";
  });
  const [showFilters, setShowFilters] = useState(false);

  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [radius, setRadius] = useState(25);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [quickFilterState, setQuickFilterState] = useState<Record<string, boolean>>({
    verified: false,
    topRated: false,
  });

  const [appliedFilters, setAppliedFilters] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      search: params.get("search") || "",
      categories: params.getAll("category"),
      minPrice: 0,
      maxPrice: 2000,
      sortBy: params.get("sortBy") || "newest",
      latitude: params.get("latitude") ? parseFloat(params.get("latitude")!) : undefined,
      longitude: params.get("longitude") ? parseFloat(params.get("longitude")!) : undefined,
      radius: params.get("radius") ? parseFloat(params.get("radius")!) : undefined,
      verifiedOnly: false,
      minRating: undefined as number | undefined,
    };
  });

  // Sync with URL changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get("search");
    if (searchParam !== null && searchParam !== appliedFilters.search) {
      setSearchQuery(searchParam);
      setAppliedFilters((prev) => ({ ...prev, search: searchParam }));
    }
  }, [location]);

  // Update when location is retrieved
  useEffect(() => {
    if (latitude && longitude) {
      setAppliedFilters((prev) => ({
        ...prev,
        latitude,
        longitude,
        radius,
      }));

      reverseGeocode(latitude, longitude).then((addr) => {
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
    setAppliedFilters((prev) => ({
      ...prev,
      search: searchQuery,
      categories: selectedCategories,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      radius: radius,
      verifiedOnly: quickFilterState.verified,
      minRating: quickFilterState.topRated ? 4 : undefined,
    }));
    setShowFilters(false);
  };

  const handleSortChange = (value: string) => {
    setAppliedFilters((prev) => ({ ...prev, sortBy: value }));
  };

  const handleQuickFilter = (filterId: string) => {
    const newState = { ...quickFilterState, [filterId]: !quickFilterState[filterId] };
    setQuickFilterState(newState);
    setAppliedFilters((prev) => ({
      ...prev,
      verifiedOnly: newState.verified,
      minRating: newState.topRated ? 4 : undefined,
    }));
  };

  const handleClearLocation = () => {
    setLocationName(null);
    setAppliedFilters((prev) => ({
      ...prev,
      latitude: undefined,
      longitude: undefined,
      radius: undefined,
    }));
  };

  const handleRemoveCategory = (slug: string) => {
    const newCategories = selectedCategories.filter((c) => c !== slug);
    setSelectedCategories(newCategories);
    setAppliedFilters((prev) => ({ ...prev, categories: newCategories }));
  };

  const handleClearAllFilters = () => {
    setPriceRange([0, 2000]);
    setSelectedCategories([]);
    setSearchQuery("");
    setQuickFilterState({ verified: false, topRated: false });
    setAppliedFilters({
      search: "",
      categories: [],
      minPrice: 0,
      maxPrice: 2000,
      sortBy: "newest",
      latitude: undefined,
      longitude: undefined,
      radius: undefined,
      verifiedOnly: false,
      minRating: undefined,
    });
    setLocationName(null);
  };

  const queryParams = new URLSearchParams();
  if (appliedFilters.search) queryParams.append("search", appliedFilters.search);
  if (appliedFilters.categories.length > 0) {
    appliedFilters.categories.forEach((cat) => queryParams.append("category", cat));
  }
  queryParams.append("minPrice", appliedFilters.minPrice.toString());
  queryParams.append("maxPrice", appliedFilters.maxPrice.toString());
  queryParams.append("sortBy", appliedFilters.sortBy);

  if (appliedFilters.latitude && appliedFilters.longitude && appliedFilters.radius) {
    queryParams.append("latitude", appliedFilters.latitude.toString());
    queryParams.append("longitude", appliedFilters.longitude.toString());
    queryParams.append("radius", appliedFilters.radius.toString());
  }

  if (appliedFilters.minRating) {
    queryParams.append("minRating", appliedFilters.minRating.toString());
  }

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery<PaginatedResponse>({
      queryKey: [`/api/services`, queryParams.toString()],
      queryFn: async ({ pageParam }) => {
        const params = new URLSearchParams(queryParams.toString());
        params.set("limit", PAGE_SIZE.toString());
        params.set("offset", String(pageParam));
        const res = await fetch(`/api/services?${params.toString()}`, {
          credentials: "include",
        });
        if (!res.ok) {
          const text = (await res.text()) || res.statusText;
          throw new Error(`${res.status}: ${text}`);
        }
        return res.json();
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        if (!lastPage.pagination.hasMore) return undefined;
        return lastPage.pagination.offset + lastPage.pagination.limit;
      },
    });

  const services = data?.pages.flatMap((page) => page.services) ?? [];
  const totalCount = data?.pages[0]?.pagination?.total ?? 0;

  // Intersection observer for auto-loading
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleObserver, {
      rootMargin: "200px",
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver]);

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  // Count active filters
  const activeFilterCount =
    appliedFilters.categories.length +
    (appliedFilters.latitude ? 1 : 0) +
    (appliedFilters.minPrice > 0 || appliedFilters.maxPrice < 2000 ? 1 : 0) +
    (appliedFilters.verifiedOnly ? 1 : 0) +
    (appliedFilters.minRating ? 1 : 0);

  // Filter sidebar content
  const filterContent = (
    <div className="space-y-6">
      {/* Location Filter */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Location</h3>
        {appliedFilters.latitude && appliedFilters.longitude ? (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="truncate">{locationName || "Using location"}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleClearLocation}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Radius</span>
                <span className="font-medium">{radius} km</span>
              </div>
              <Slider
                min={1}
                max={100}
                step={1}
                value={[radius]}
                onValueChange={(vals) => setRadius(vals[0])}
              />
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full justify-start border-dashed"
            onClick={requestLocation}
            disabled={locationLoading}
          >
            {locationLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <MapPin className="w-4 h-4 mr-2" />
            )}
            Use my location
          </Button>
        )}
        {locationError && (
          <p className="text-xs text-destructive mt-2">{locationError}</p>
        )}
      </div>

      <Separator />

      {/* Categories */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Categories</h3>
        <ScrollArea className="h-[180px]">
          <div className="space-y-2">
            {categories?.map((cat) => (
              <div key={cat.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`cat-${cat.slug}`}
                  checked={selectedCategories.includes(cat.slug)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedCategories([...selectedCategories, cat.slug]);
                    } else {
                      setSelectedCategories(selectedCategories.filter((c) => c !== cat.slug));
                    }
                  }}
                />
                <Label htmlFor={`cat-${cat.slug}`} className="text-sm cursor-pointer">
                  {cat.nameEn}
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Price Range (AED)</h3>
        <div className="space-y-4">
          <Slider
            min={0}
            max={2000}
            step={50}
            value={priceRange}
            onValueChange={setPriceRange}
          />
          <div className="flex items-center justify-between text-sm">
            <span className="bg-muted px-2 py-1 rounded">{priceRange[0]}</span>
            <span className="text-muted-foreground">to</span>
            <span className="bg-muted px-2 py-1 rounded">{priceRange[1]}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 bg-muted/30">
        {/* Page Header */}
        <div className="bg-background border-b">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
            {/* Title with location */}
            <div className="mb-4">
              <h1 className="text-2xl md:text-3xl font-bold">
                {totalCount > 0 ? (
                  <>
                    {totalCount} Services
                    {locationName && (
                      <span className="text-muted-foreground font-normal">
                        {" "}
                        in {locationName}
                      </span>
                    )}
                    {appliedFilters.search && (
                      <span className="text-muted-foreground font-normal">
                        {" "}
                        for "{appliedFilters.search}"
                      </span>
                    )}
                  </>
                ) : isLoading ? (
                  "Finding Services..."
                ) : (
                  "Browse Services"
                )}
              </h1>
            </div>

            {/* Search Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search services..."
                  className="pl-10 h-11 rounded-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleApplyFilters();
                  }}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleApplyFilters} className="h-11 px-6">
                  Search
                </Button>

                <Select value={appliedFilters.sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[160px] h-11">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="rating">Top Rated</SelectItem>
                    <SelectItem value="price_asc">Price: Low to High</SelectItem>
                    <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Toggle */}
                <div className="hidden sm:flex bg-muted rounded-lg p-1 h-11 items-center">
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setViewMode("list")}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "map" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setViewMode("map")}
                  >
                    <MapIcon className="h-4 w-4" />
                  </Button>
                </div>

                {/* Mobile Filter Button */}
                <Sheet open={showFilters} onOpenChange={setShowFilters}>
                  <SheetTrigger asChild className="md:hidden">
                    <Button variant="outline" className="h-11 relative">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                      {activeFilterCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                          {activeFilterCount}
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
                    <SheetHeader className="text-left">
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="flex-1 py-4">{filterContent}</ScrollArea>
                    <SheetFooter className="flex-row gap-2 pt-4 border-t">
                      <Button variant="outline" className="flex-1" onClick={handleClearAllFilters}>
                        Clear All
                      </Button>
                      <Button className="flex-1" onClick={handleApplyFilters}>
                        Apply Filters
                      </Button>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {/* Quick Filters & Active Pills */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              {/* Quick Filters */}
              {quickFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => handleQuickFilter(filter.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border",
                    quickFilterState[filter.id]
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background hover:bg-muted border-border"
                  )}
                >
                  <filter.icon className="h-3.5 w-3.5" />
                  {filter.label}
                </button>
              ))}

              <Separator orientation="vertical" className="h-6 mx-1" />

              {/* Active Category Pills */}
              {appliedFilters.categories.map((slug) => {
                const cat = categories?.find((c) => c.slug === slug);
                return (
                  <Badge
                    key={slug}
                    variant="secondary"
                    className="rounded-full pl-3 pr-1 py-1 gap-1"
                  >
                    {cat?.nameEn || slug}
                    <button
                      onClick={() => handleRemoveCategory(slug)}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}

              {/* Location Pill */}
              {locationName && (
                <Badge variant="secondary" className="rounded-full pl-3 pr-1 py-1 gap-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  {locationName}
                  <button
                    onClick={handleClearLocation}
                    className="ml-1 hover:bg-muted rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {/* Clear All */}
              {activeFilterCount > 0 && (
                <button
                  onClick={handleClearAllFilters}
                  className="text-sm text-muted-foreground hover:text-foreground underline"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
          <div className="flex gap-6">
            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-64 flex-shrink-0">
              <div className="sticky top-20">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-semibold">Filters</h2>
                      {activeFilterCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7"
                          onClick={handleClearAllFilters}
                        >
                          Reset
                        </Button>
                      )}
                    </div>
                    {filterContent}
                    <Button className="w-full mt-4" onClick={handleApplyFilters}>
                      Apply Filters
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </aside>

            {/* Results */}
            <div className="flex-1 min-w-0">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <ServiceCardSkeleton key={i} />
                  ))}
                </div>
              ) : services.length === 0 ? (
                <EmptyState
                  icon={Search}
                  title="No services found"
                  description="Try adjusting your search or filters to find what you're looking for."
                  action={
                    <Button variant="outline" onClick={handleClearAllFilters}>
                      Clear All Filters
                    </Button>
                  }
                />
              ) : viewMode === "map" ? (
                <div className="h-[600px] rounded-xl overflow-hidden border">
                  <MapView
                    services={services}
                    center={
                      appliedFilters.latitude && appliedFilters.longitude
                        ? [appliedFilters.latitude, appliedFilters.longitude]
                        : [25.2048, 55.2708]
                    }
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {services.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>
              )}

              {/* Infinite scroll trigger */}
              <div ref={loadMoreRef} className="mt-8 flex justify-center">
                {isFetchingNextPage && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm">Loading more...</span>
                  </div>
                )}
              </div>

              {hasNextPage && !isFetchingNextPage && services.length > 0 && (
                <div className="mt-4 flex justify-center">
                  <Button variant="outline" onClick={() => fetchNextPage()}>
                    Load More
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
