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
  ChevronRight,
  CreditCard,
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "wouter";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { Service, ProviderProfile, User, Category, Location } from "@shared/schema";
import { useUserLocation } from "@/hooks/useUserLocation";
import { MapView } from "@/components/map-view";
import { reverseGeocode } from "@/lib/geocoding";
import { ServiceCard } from "@/components/service-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ServiceCardSkeleton } from "@/components/skeletons";
import { cn } from "@/lib/utils";
import {
  LocationFilter,
  CategoryFilter,
  PriceFilter,
  MoreFiltersButton,
} from "@/components/browse-filters";

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

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "online", label: "Online Payment" },
] as const;

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
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [radius, setRadius] = useState(25);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [manualLocationSearch, setManualLocationSearch] = useState("");
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>([]);
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
      paymentMethods: [] as string[],
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
    setAppliedFilters({
      search: searchQuery,
      categories: selectedCategories,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      sortBy: appliedFilters.sortBy,
      latitude: appliedFilters.latitude,
      longitude: appliedFilters.longitude,
      radius: radius,
      verifiedOnly: verifiedOnly,
      minRating: selectedRating ?? undefined,
      paymentMethods: selectedPaymentMethods,
    });
    setShowMobileFilters(false);
    setShowLocationSuggestions(false);
  };

  const handleSortChange = (value: string) => {
    setAppliedFilters((prev) => ({ ...prev, sortBy: value }));
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
    setSelectedPaymentMethods([]);
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
      paymentMethods: [],
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

  if (appliedFilters.paymentMethods.length > 0) {
    appliedFilters.paymentMethods.forEach((method) => queryParams.append("paymentMethod", method));
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
    queryKey: ["/api/categories"],
  });

  // Fetch UAE locations from database
  const { data: uaeLocations } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  // Count active filters for "More Filters" badge
  const moreFiltersCount =
    (appliedFilters.verifiedOnly ? 1 : 0) +
    (appliedFilters.minRating && !quickFilterState.topRated ? 1 : 0) +
    (appliedFilters.paymentMethods.length > 0 ? 1 : 0);

  const activeFilterCount =
    appliedFilters.categories.length +
    (appliedFilters.latitude ? 1 : 0) +
    (appliedFilters.minPrice > 0 || appliedFilters.maxPrice < 2000 ? 1 : 0) +
    moreFiltersCount;

  // Filter UAE areas based on search input
  const filteredAreas = manualLocationSearch.length > 0
    ? (uaeLocations || []).filter(
        (area) =>
          area.name.toLowerCase().includes(manualLocationSearch.toLowerCase()) ||
          area.emirate.toLowerCase().includes(manualLocationSearch.toLowerCase())
      )
    : (uaeLocations || []);

  // Handle selecting a location from suggestions
  const handleSelectArea = (area: Location) => {
    setLocationName(`${area.name}, ${area.emirate}`);
    setAppliedFilters((prev) => ({
      ...prev,
      latitude: parseFloat(area.lat),
      longitude: parseFloat(area.lng),
      radius: radius,
    }));
    setManualLocationSearch("");
    setShowLocationSuggestions(false);
  };

  // Mobile filter sheet content
  const mobileFilterContent = (
    <div className="space-y-5">
      {/* Location */}
      <div>
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          Location
        </h3>

        {/* Manual Location Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search area or city..."
            className="pl-9 h-10 text-sm"
            value={manualLocationSearch}
            onChange={(e) => {
              setManualLocationSearch(e.target.value);
              setShowLocationSuggestions(true);
            }}
            onFocus={() => setShowLocationSuggestions(true)}
          />
        </div>

        {/* Location Suggestions Dropdown */}
        {showLocationSuggestions && manualLocationSearch.length > 0 && (
          <div className="bg-background border rounded-lg shadow-lg max-h-[160px] overflow-y-auto mb-3">
            {filteredAreas.length > 0 ? (
              filteredAreas.slice(0, 6).map((area) => (
                <button
                  key={area.name}
                  className="w-full text-left px-3 py-2 hover:bg-muted text-sm flex items-center gap-2 transition-colors"
                  onClick={() => handleSelectArea(area)}
                >
                  <MapPin className="w-3 h-3 text-muted-foreground" />
                  <span>{area.name}</span>
                  <span className="text-muted-foreground text-xs ml-auto">{area.emirate}</span>
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-muted-foreground">No areas found</div>
            )}
          </div>
        )}

        {/* Current Location Display or GPS Button */}
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
            Use my current location
          </Button>
        )}
        {locationError && <p className="text-xs text-destructive mt-2">{locationError}</p>}
      </div>

      <Separator />

      {/* Categories */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Categories</h3>
        <ScrollArea className="h-[140px]">
          <div className="space-y-2">
            {categories?.map((cat) => (
              <div key={cat.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`mobile-cat-${cat.slug}`}
                  checked={selectedCategories.includes(cat.slug)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedCategories([...selectedCategories, cat.slug]);
                    } else {
                      setSelectedCategories(selectedCategories.filter((c) => c !== cat.slug));
                    }
                  }}
                />
                <Label htmlFor={`mobile-cat-${cat.slug}`} className="text-sm cursor-pointer">
                  {cat.nameEn}
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <Separator />

      {/* Price */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Price Range (AED)</h3>
        <div className="space-y-4">
          <Slider
            min={0}
            max={2000}
            step={50}
            value={priceRange}
            onValueChange={(vals) => setPriceRange(vals as [number, number])}
          />
          <div className="flex items-center justify-between text-sm">
            <span className="bg-muted px-2 py-1 rounded">{priceRange[0]}</span>
            <span className="text-muted-foreground">to</span>
            <span className="bg-muted px-2 py-1 rounded">{priceRange[1]}</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Rating */}
      <div>
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-500" />
          Minimum Rating
        </h3>
        <div className="flex gap-2">
          {[null, 3, 4, 4.5].map((rating) => (
            <button
              key={rating ?? "any"}
              onClick={() => setSelectedRating(rating)}
              className={cn(
                "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all border",
                selectedRating === rating
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-muted border-border"
              )}
            >
              {rating === null ? "Any" : `${rating}+`}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Payment Methods */}
      <div>
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-primary" />
          Payment Methods
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {PAYMENT_METHODS.map((method) => (
            <div key={method.value} className="flex items-center space-x-2">
              <Checkbox
                id={`mobile-payment-${method.value}`}
                checked={selectedPaymentMethods.includes(method.value)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedPaymentMethods([...selectedPaymentMethods, method.value]);
                  } else {
                    setSelectedPaymentMethods(selectedPaymentMethods.filter((m) => m !== method.value));
                  }
                }}
              />
              <Label htmlFor={`mobile-payment-${method.value}`} className="text-sm cursor-pointer">
                {method.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Verified Only */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BadgeCheck className="w-4 h-4 text-primary" />
          <Label htmlFor="verified-toggle" className="text-sm font-medium cursor-pointer">
            Verified Providers Only
          </Label>
        </div>
        <Switch
          id="verified-toggle"
          checked={verifiedOnly}
          onCheckedChange={setVerifiedOnly}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Breadcrumb + Title Section */}
      <div className="border-b bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-3 md:py-4">
          {/* Breadcrumb - Desktop Only */}
          <div className="hidden md:flex items-center gap-2 text-sm mb-2">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
            <span className="font-medium">Browse Services</span>
          </div>

          {/* Title - Bayut Style */}
          <h1 className="text-xl md:text-2xl font-bold">
            Browse Services{locationName && <span className="text-muted-foreground font-normal"> in {locationName}</span>}
          </h1>
        </div>
      </div>

      {/* Sticky Filter Bar - Bayut Style */}
      <div className="bg-background border-b sticky top-16 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-2.5 md:py-3">
          {/* Main Filter Row */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search Input - Full width on mobile */}
            <div className="relative w-full md:flex-1 md:min-w-[200px] md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search services..."
                className="pl-9 h-10 rounded-lg border text-sm w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleApplyFilters();
                }}
              />
            </div>

            {/* Desktop Filter Dropdowns */}
            <div className="hidden md:flex items-center gap-2 flex-1">
              <LocationFilter
                locationName={locationName}
                radius={radius}
                loading={locationLoading}
                error={locationError}
                hasLocation={!!(appliedFilters.latitude && appliedFilters.longitude)}
                onRequestLocation={requestLocation}
                onClearLocation={handleClearLocation}
                onRadiusChange={(val) => {
                  setRadius(val);
                  if (appliedFilters.latitude && appliedFilters.longitude) {
                    setAppliedFilters((prev) => ({ ...prev, radius: val }));
                  }
                }}
              />

              {categories && (
                <CategoryFilter
                  categories={categories}
                  selectedCategories={selectedCategories}
                  onToggleCategory={(slug) => {
                    const newCategories = selectedCategories.includes(slug)
                      ? selectedCategories.filter((c) => c !== slug)
                      : [...selectedCategories, slug];
                    setSelectedCategories(newCategories);
                    setAppliedFilters((prev) => ({ ...prev, categories: newCategories }));
                  }}
                />
              )}

              <PriceFilter
                priceRange={priceRange}
                onPriceChange={(range) => {
                  setPriceRange(range);
                  setAppliedFilters((prev) => ({
                    ...prev,
                    minPrice: range[0],
                    maxPrice: range[1],
                  }));
                }}
              />

              <MoreFiltersButton
                verifiedOnly={appliedFilters.verifiedOnly}
                minRating={appliedFilters.minRating}
                onVerifiedChange={(val) => {
                  const newState = { ...quickFilterState, verified: val };
                  setQuickFilterState(newState);
                  setAppliedFilters((prev) => ({ ...prev, verifiedOnly: val }));
                }}
                onMinRatingChange={(val) => {
                  setAppliedFilters((prev) => ({ ...prev, minRating: val }));
                }}
                activeCount={moreFiltersCount}
              />
            </div>

            {/* Mobile: Sort + Filters | Desktop: Sort + View Toggle */}
            <div className="flex items-center gap-2 w-full md:w-auto md:flex-1">
              {/* Sort - First on mobile (swapped position) */}
              <Select value={appliedFilters.sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="h-10 text-sm border w-full md:w-[120px] flex-1 md:flex-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="rating">Top Rated</SelectItem>
                  <SelectItem value="price_asc">Price ↑</SelectItem>
                  <SelectItem value="price_desc">Price ↓</SelectItem>
                </SelectContent>
              </Select>

              {/* Filters - Second on mobile (swapped position) */}
              <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="outline" size="sm" className="h-10 px-3 border relative flex-1">
                    Filters
                    {activeFilterCount > 0 && (
                      <Badge variant="default" className="ml-2 rounded-full h-5 w-5 p-0 flex items-center justify-center text-xs">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl flex flex-col">
                  <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mt-2 mb-2 flex-none" />
                  <SheetHeader className="text-left flex-none pb-2">
                    <SheetTitle className="text-base">Filters</SheetTitle>
                  </SheetHeader>
                  <ScrollArea className="flex-1 -mx-6 px-6">{mobileFilterContent}</ScrollArea>
                  <SheetFooter className="flex-row gap-2 pt-3 border-t bg-background flex-none mt-auto">
                    <Button variant="outline" size="sm" className="flex-1" onClick={handleClearAllFilters}>
                      Clear
                    </Button>
                    <Button size="sm" className="flex-1" onClick={handleApplyFilters}>
                      Apply
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>

              {/* View Toggle - Desktop Only */}
              <div className="hidden md:flex bg-muted rounded-lg p-1 h-10 items-center ml-auto">
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="icon"
                  className="h-8 w-8 rounded-md"
                  onClick={() => setViewMode("list")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "map" ? "default" : "ghost"}
                  size="icon"
                  className="h-8 w-8 rounded-md"
                  onClick={() => setViewMode("map")}
                >
                  <MapIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Active Category Pills + Clear All */}
          {appliedFilters.categories.length > 0 && (
            <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
              {appliedFilters.categories.map((slug) => {
                const cat = categories?.find((c) => c.slug === slug);
                return (
                  <Badge
                    key={slug}
                    variant="secondary"
                    className="rounded-full pl-2 pr-1.5 py-1 gap-1 text-xs whitespace-nowrap"
                  >
                    {cat?.nameEn || slug}
                    <button
                      onClick={() => handleRemoveCategory(slug)}
                      className="hover:bg-muted rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}

              <button
                onClick={handleClearAllFilters}
                className="text-xs text-muted-foreground hover:text-destructive whitespace-nowrap ml-2"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content - No Sidebar, Full Width */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 pb-28 md:pb-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ServiceCardSkeleton key={i} />
              ))}
            </div>
          ) : services.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No services found"
              description="Try adjusting your filters to see more results"
              className="py-12"
              action={
                <Button variant="outline" size="sm" onClick={handleClearAllFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              }
            />
          ) : viewMode === "map" ? (
            <div className="fixed top-[calc(4rem+3.5rem)] left-0 right-0 bottom-0 md:top-[calc(4rem+3.25rem)] z-30">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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

      {/* Mobile Floating Map/List Toggle Button */}
      {services.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 md:hidden">
          <Button
            onClick={() => setViewMode(viewMode === "list" ? "map" : "list")}
            className="rounded-full px-6 h-14 shadow-2xl bg-primary text-primary-foreground hover:bg-primary/90 border-2 border-primary-foreground/20 font-semibold"
            size="lg"
          >
            {viewMode === "list" ? (
              <>
                <MapIcon className="h-5 w-5 mr-2" />
                View Map
              </>
            ) : (
              <>
                <LayoutGrid className="h-5 w-5 mr-2" />
                View List
              </>
            )}
          </Button>
        </div>
      )}

      <Footer />
    </div>
  );
}
