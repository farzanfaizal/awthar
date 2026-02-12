"use client";

import { useState, useCallback, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  Search,
  SlidersHorizontal,
  X,
  Loader2,
  LayoutGrid,
  Map,
  Columns2,
  MapPin,
  Star,
} from "lucide-react";
import { ServiceCard } from "@/components/service-card";
import { ServiceCardSkeleton } from "@/components/skeletons";
import {
  LocationFilter,
  CategoryFilter,
  PriceFilter,
  MoreFiltersButton,
} from "@/components/browse-filters";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useIsMobile } from "@/hooks/use-mobile";
import { getQueryFn } from "@/lib/query-client";
import { cn } from "@/lib/utils";
import type { ServiceWithProvider, Category } from "@/types";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";

const MapView = dynamic(
  () => import("@/components/map-view").then((m) => m.MapView),
  { ssr: false }
);

type ViewMode = "grid" | "map" | "split";

export default function BrowsePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <BrowsePageContent />
    </Suspense>
  );
}

function BrowsePageContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");
  const initialSearch = searchParams.get("q") || "";
  const isMobile = useIsMobile();

  // Filters
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minRating, setMinRating] = useState<number | undefined>(undefined);
  const [radius, setRadius] = useState(25);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>(isMobile ? "grid" : "split");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [highlightedService, setHighlightedService] = useState<ServiceWithProvider | null>(null);

  const {
    latitude,
    longitude,
    locationName,
    loading: locLoading,
    error: locError,
    requestLocation,
    clearLocation,
    hasLocation,
  } = useUserLocation();

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Build query params
  const limit = viewMode === "split" ? 20 : 12;
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    selectedCategories.forEach((c) => params.append("category", c));
    if (priceRange[0] > 0) params.set("minPrice", String(priceRange[0]));
    if (priceRange[1] < 2000) params.set("maxPrice", String(priceRange[1]));
    if (sortBy) params.set("sortBy", sortBy);
    if (verifiedOnly) params.set("verifiedOnly", "true");
    if (minRating) params.set("minRating", String(minRating));
    if (hasLocation && latitude && longitude) {
      params.set("latitude", String(latitude));
      params.set("longitude", String(longitude));
      params.set("radius", String(radius));
    }
    params.set("limit", String(limit));
    params.set("offset", String((page - 1) * limit));
    return params.toString();
  }, [
    searchQuery,
    selectedCategories,
    priceRange,
    sortBy,
    verifiedOnly,
    minRating,
    hasLocation,
    latitude,
    longitude,
    radius,
    page,
    limit,
  ]);

  const { data: servicesData, isLoading } = useQuery<{
    services: ServiceWithProvider[];
    total: number;
    pagination: { offset: number; limit: number; hasMore: boolean; total: number };
  }>({
    queryKey: [`/api/services?${queryParams}`],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const services = servicesData?.services || [];
  const total = servicesData?.pagination?.total ?? servicesData?.total ?? 0;
  const hasMore = servicesData?.pagination?.hasMore ?? services.length === limit;

  const toggleCategory = useCallback((slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
    setPage(1);
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCategories([]);
    setPriceRange([0, 2000]);
    setVerifiedOnly(false);
    setMinRating(undefined);
    clearLocation();
    setPage(1);
  }, [clearLocation]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategories.length > 0) count++;
    if (priceRange[0] > 0 || priceRange[1] < 2000) count++;
    if (verifiedOnly) count++;
    if (minRating) count++;
    if (hasLocation) count++;
    return count;
  }, [selectedCategories, priceRange, verifiedOnly, minRating, hasLocation]);

  const moreFiltersCount = (verifiedOnly ? 1 : 0) + (minRating ? 1 : 0);

  const mapCenter: [number, number] =
    hasLocation && latitude && longitude
      ? [latitude, longitude]
      : [25.2048, 55.2708];

  const mapZoom = hasLocation ? 12 : 10;

  // ───── Render ─────

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Sticky Filter Bar ── */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b">
        <div className="max-w-[1600px] mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>

            {/* Desktop Filters (popover mode) */}
            <div className="hidden md:flex items-center gap-2">
              <LocationFilter
                locationName={locationName}
                radius={radius}
                loading={locLoading}
                error={locError}
                hasLocation={hasLocation}
                onRequestLocation={requestLocation}
                onClearLocation={clearLocation}
                onRadiusChange={setRadius}
              />
              <CategoryFilter
                categories={categories}
                selectedCategories={selectedCategories}
                onToggleCategory={toggleCategory}
              />
              <PriceFilter
                priceRange={priceRange}
                onPriceChange={(r) => {
                  setPriceRange(r);
                  setPage(1);
                }}
              />
              <MoreFiltersButton
                verifiedOnly={verifiedOnly}
                minRating={minRating}
                onVerifiedChange={(v) => {
                  setVerifiedOnly(v);
                  setPage(1);
                }}
                onMinRatingChange={(r) => {
                  setMinRating(r);
                  setPage(1);
                }}
                activeCount={moreFiltersCount}
              />
            </div>

            {/* Mobile Filter Button → Drawer */}
            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
              <DrawerTrigger asChild>
                <Button variant="outline" className="md:hidden relative">
                  <SlidersHorizontal className="h-4 w-4" />
                  {activeFilterCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </DrawerTrigger>
              <DrawerContent className="max-h-[85vh]">
                <DrawerHeader>
                  <DrawerTitle>Filters & Sort</DrawerTitle>
                </DrawerHeader>
                <ScrollArea className="flex-1 px-4 overflow-y-auto">
                  <div className="space-y-5 pb-4">
                    {/* Sort */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Sort By</h4>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">Newest First</SelectItem>
                          <SelectItem value="rating">Top Rated</SelectItem>
                          <SelectItem value="price_asc">Price: Low to High</SelectItem>
                          <SelectItem value="price_desc">Price: High to Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Separator />
                    {/* Location */}
                    <LocationFilter
                      locationName={locationName}
                      radius={radius}
                      loading={locLoading}
                      error={locError}
                      hasLocation={hasLocation}
                      onRequestLocation={requestLocation}
                      onClearLocation={clearLocation}
                      onRadiusChange={setRadius}
                      variant="inline"
                    />
                    <Separator />
                    {/* Categories */}
                    <CategoryFilter
                      categories={categories}
                      selectedCategories={selectedCategories}
                      onToggleCategory={toggleCategory}
                      variant="inline"
                    />
                    <Separator />
                    {/* Price */}
                    <PriceFilter
                      priceRange={priceRange}
                      onPriceChange={(r) => {
                        setPriceRange(r);
                        setPage(1);
                      }}
                      variant="inline"
                    />
                    <Separator />
                    {/* More Filters */}
                    <MoreFiltersButton
                      verifiedOnly={verifiedOnly}
                      minRating={minRating}
                      onVerifiedChange={(v) => {
                        setVerifiedOnly(v);
                        setPage(1);
                      }}
                      onMinRatingChange={(r) => {
                        setMinRating(r);
                        setPage(1);
                      }}
                      activeCount={moreFiltersCount}
                      variant="inline"
                    />
                  </div>
                </ScrollArea>
                <DrawerFooter className="flex-row gap-3 border-t pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      clearAllFilters();
                      setDrawerOpen(false);
                    }}
                  >
                    Clear All
                  </Button>
                  <DrawerClose asChild>
                    <Button className="flex-1">
                      Show {isLoading ? "..." : total} Results
                    </Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>

            {/* Desktop View Toggle — 3-way */}
            <div className="hidden md:flex items-center border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 transition-colors",
                  viewMode === "grid"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
                title="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("split")}
                className={cn(
                  "p-2 transition-colors",
                  viewMode === "split"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
                title="Split view"
              >
                <Columns2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={cn(
                  "p-2 transition-colors",
                  viewMode === "map"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
                title="Map view"
              >
                <Map className="h-4 w-4" />
              </button>
            </div>

            {/* Desktop Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px] hidden md:flex">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="rating">Top Rated</SelectItem>
                <SelectItem value="price_asc">Price: Low</SelectItem>
                <SelectItem value="price_desc">Price: High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ── Active Filter Pills ── */}
          {activeFilterCount > 0 && (
            <div
              className={cn(
                "flex items-center gap-2 mt-3",
                isMobile ? "overflow-x-auto flex-nowrap pb-1" : "flex-wrap"
              )}
            >
              {selectedCategories.map((slug) => {
                const cat = categories.find((c) => c.slug === slug);
                return (
                  <Badge key={slug} variant="secondary" className="gap-1 pr-1 shrink-0">
                    {cat?.nameEn || slug}
                    <button
                      onClick={() => toggleCategory(slug)}
                      className="hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
              {(priceRange[0] > 0 || priceRange[1] < 2000) && (
                <Badge variant="secondary" className="gap-1 pr-1 shrink-0">
                  {priceRange[0]}-{priceRange[1]} AED
                  <button
                    onClick={() => setPriceRange([0, 2000])}
                    className="hover:bg-muted rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {verifiedOnly && (
                <Badge variant="secondary" className="gap-1 pr-1 shrink-0">
                  Verified
                  <button
                    onClick={() => setVerifiedOnly(false)}
                    className="hover:bg-muted rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {minRating && (
                <Badge variant="secondary" className="gap-1 pr-1 shrink-0">
                  {minRating}+ Stars
                  <button
                    onClick={() => setMinRating(undefined)}
                    className="hover:bg-muted rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {hasLocation && (
                <Badge variant="secondary" className="gap-1 pr-1 shrink-0">
                  <MapPin className="h-3 w-3" />
                  {locationName} ({radius} km)
                  <button
                    onClick={clearLocation}
                    className="hover:bg-muted rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <button
                onClick={clearAllFilters}
                className="text-xs text-muted-foreground hover:text-foreground shrink-0"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Results Count ── */}
      <div className="max-w-[1600px] mx-auto w-full px-4 pt-4 pb-2">
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Searching..." : `${total} service${total !== 1 ? "s" : ""} found`}
        </p>
      </div>

      {/* ── Main Content ── */}
      {isMobile ? (
        <MobileContent
          services={services}
          isLoading={isLoading}
          viewMode={viewMode}
          setViewMode={setViewMode}
          mapCenter={mapCenter}
          mapZoom={mapZoom}
          highlightedService={highlightedService}
          setHighlightedService={setHighlightedService}
          clearAllFilters={clearAllFilters}
          page={page}
          setPage={setPage}
          hasMore={hasMore}
        />
      ) : (
        <DesktopContent
          services={services}
          isLoading={isLoading}
          viewMode={viewMode}
          mapCenter={mapCenter}
          mapZoom={mapZoom}
          clearAllFilters={clearAllFilters}
          page={page}
          setPage={setPage}
          hasMore={hasMore}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   DESKTOP CONTENT
   ═══════════════════════════════════════════════════ */

function DesktopContent({
  services,
  isLoading,
  viewMode,
  mapCenter,
  mapZoom,
  clearAllFilters,
  page,
  setPage,
  hasMore,
}: {
  services: ServiceWithProvider[];
  isLoading: boolean;
  viewMode: ViewMode;
  mapCenter: [number, number];
  mapZoom: number;
  clearAllFilters: () => void;
  page: number;
  setPage: (fn: (p: number) => number) => void;
  hasMore: boolean;
}) {
  if (viewMode === "map") {
    return (
      <div className="flex-1 px-4 pb-4">
        <div className="h-[calc(100vh-160px)] rounded-xl overflow-hidden border">
          {services.length > 0 ? (
            <MapView services={services} center={mapCenter} zoom={mapZoom} />
          ) : (
            <EmptyMap />
          )}
        </div>
      </div>
    );
  }

  if (viewMode === "split") {
    return (
      <div className="flex-1 max-w-[1600px] mx-auto w-full px-4 pb-4">
        <div className="grid grid-cols-2 gap-4 h-[calc(100vh-160px)]">
          {/* Left: scrollable card list */}
          <ScrollArea className="h-full pr-3">
            {isLoading ? (
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ServiceCardSkeleton key={i} />
                ))}
              </div>
            ) : services.length === 0 ? (
              <EmptyState clearAllFilters={clearAllFilters} />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  {services.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>
                <Pagination page={page} setPage={setPage} hasMore={hasMore} isLoading={isLoading} />
              </>
            )}
          </ScrollArea>

          {/* Right: sticky map */}
          <div className="h-full rounded-xl overflow-hidden border">
            {services.length > 0 ? (
              <MapView services={services} center={mapCenter} zoom={mapZoom} />
            ) : (
              <EmptyMap />
            )}
          </div>
        </div>
      </div>
    );
  }

  // Grid mode
  return (
    <div className="flex-1 max-w-[1600px] mx-auto w-full px-4 pb-8">
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ServiceCardSkeleton key={i} />
          ))}
        </div>
      ) : services.length === 0 ? (
        <EmptyState clearAllFilters={clearAllFilters} />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
          <Pagination page={page} setPage={setPage} hasMore={hasMore} isLoading={isLoading} />
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MOBILE CONTENT
   ═══════════════════════════════════════════════════ */

function MobileContent({
  services,
  isLoading,
  viewMode,
  setViewMode,
  mapCenter,
  mapZoom,
  highlightedService,
  setHighlightedService,
  clearAllFilters,
  page,
  setPage,
  hasMore,
}: {
  services: ServiceWithProvider[];
  isLoading: boolean;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  mapCenter: [number, number];
  mapZoom: number;
  highlightedService: ServiceWithProvider | null;
  setHighlightedService: (s: ServiceWithProvider | null) => void;
  clearAllFilters: () => void;
  page: number;
  setPage: (fn: (p: number) => number) => void;
  hasMore: boolean;
}) {
  return (
    <>
      {/* Mobile map overlay */}
      {viewMode === "map" && (
        <div className="fixed inset-0 z-30 bg-background">
          {/* Close button */}
          <button
            onClick={() => {
              setViewMode("grid");
              setHighlightedService(null);
            }}
            className="absolute top-4 right-4 z-40 bg-background/90 backdrop-blur rounded-full p-2 shadow-lg border"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="h-full w-full">
            {services.length > 0 ? (
              <MapView
                services={services}
                center={mapCenter}
                zoom={mapZoom}
                className="h-full w-full"
                onMarkerClick={(service) => setHighlightedService(service)}
                highlightedServiceId={highlightedService?.id}
              />
            ) : (
              <EmptyMap />
            )}
          </div>

          {/* Highlighted service card at bottom */}
          {highlightedService && (
            <div className="absolute bottom-20 left-4 right-4 z-40">
              <MobileServiceCard
                service={highlightedService}
                onClose={() => setHighlightedService(null)}
              />
            </div>
          )}
        </div>
      )}

      {/* Mobile grid */}
      <div className={cn("flex-1 px-4 pb-24", viewMode === "map" && "hidden")}>
        {isLoading ? (
          <div className="grid gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ServiceCardSkeleton key={i} />
            ))}
          </div>
        ) : services.length === 0 ? (
          <EmptyState clearAllFilters={clearAllFilters} />
        ) : (
          <>
            <div className="grid gap-4">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
            <Pagination page={page} setPage={setPage} hasMore={hasMore} isLoading={isLoading} />
          </>
        )}
      </div>

      {/* Floating FAB — Map / List toggle */}
      <button
        onClick={() => {
          setViewMode(viewMode === "map" ? "grid" : "map");
          if (viewMode === "map") setHighlightedService(null);
        }}
        className={cn(
          "fixed bottom-6 left-1/2 -translate-x-1/2 z-40",
          "flex items-center gap-2 px-5 py-3 rounded-full",
          "bg-primary text-primary-foreground shadow-2xl",
          "transition-all active:scale-95",
          "md:hidden"
        )}
      >
        {viewMode === "map" ? (
          <>
            <LayoutGrid className="h-4 w-4" />
            <span className="text-sm font-medium">List</span>
          </>
        ) : (
          <>
            <Map className="h-4 w-4" />
            <span className="text-sm font-medium">Map</span>
          </>
        )}
      </button>
    </>
  );
}

/* ═══════════════════════════════════════════════════
   MOBILE SERVICE CARD (map overlay)
   ═══════════════════════════════════════════════════ */

function MobileServiceCard({
  service,
  onClose,
}: {
  service: ServiceWithProvider;
  onClose: () => void;
}) {
  const provider = service.provider;
  const user = provider?.user;

  return (
    <div className="bg-background rounded-xl border shadow-2xl overflow-hidden">
      <div className="flex gap-3 p-3">
        {/* Image */}
        <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted shrink-0">
          {service.images?.[0] ? (
            <Image
              src={service.images[0]}
              alt={service.titleEn}
              fill
              className="object-cover"
              sizes="96px"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-xs text-muted-foreground">
              No Image
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <h3 className="font-semibold text-sm line-clamp-2 leading-tight">
              {service.titleEn}
            </h3>
            <button onClick={onClose} className="shrink-0 p-0.5 hover:bg-muted rounded-full">
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
          {user && (
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {provider?.companyName || `${user.firstName} ${user.lastName}`}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex items-center text-xs">
              <Star className="h-3 w-3 fill-warning text-warning mr-0.5" />
              <span className="font-medium">{provider?.rating || "New"}</span>
            </div>
            {service.location?.emirate && (
              <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                <MapPin className="h-3 w-3" />
                {service.location.emirate}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-primary font-bold text-sm">
              AED {service.priceMin || "—"}
              {service.pricingType === "hourly" && (
                <span className="text-xs font-normal text-muted-foreground">/hr</span>
              )}
            </span>
            <Link
              href={`/service/${service.id}`}
              className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              View
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════════════ */

function Pagination({
  page,
  setPage,
  hasMore,
  isLoading,
}: {
  page: number;
  setPage: (fn: (p: number) => number) => void;
  hasMore: boolean;
  isLoading: boolean;
}) {
  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      <Button
        variant="outline"
        disabled={page <= 1}
        onClick={() => setPage((p) => p - 1)}
      >
        Previous
      </Button>
      <span className="text-sm text-muted-foreground">Page {page}</span>
      <Button
        variant="outline"
        disabled={!hasMore}
        onClick={() => setPage((p) => p + 1)}
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Next"}
      </Button>
    </div>
  );
}

function EmptyState({ clearAllFilters }: { clearAllFilters: () => void }) {
  return (
    <div className="text-center py-16">
      <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-xl font-semibold mb-2">No services found</h3>
      <p className="text-muted-foreground mb-4">
        Try adjusting your filters or search terms
      </p>
      <Button variant="outline" onClick={clearAllFilters}>
        Clear All Filters
      </Button>
    </div>
  );
}

function EmptyMap() {
  return (
    <div className="h-full flex items-center justify-center text-muted-foreground bg-muted/30">
      <div className="text-center">
        <Map className="h-10 w-10 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No services with locations to display</p>
      </div>
    </div>
  );
}
