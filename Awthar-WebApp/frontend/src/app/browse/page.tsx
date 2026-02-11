"use client";

import { useState, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react";
import { ServiceCard } from "@/components/service-card";
import { ServiceCardSkeleton } from "@/components/skeletons";
import { LocationFilter, CategoryFilter, PriceFilter, MoreFiltersButton } from "@/components/browse-filters";
import { useUserLocation } from "@/hooks/useUserLocation";
import { getQueryFn } from "@/lib/query-client";
import type { ServiceWithProvider, Category } from "@/types";

export default function BrowsePage() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");
  const initialSearch = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategory ? [initialCategory] : []);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minRating, setMinRating] = useState<number | undefined>(undefined);
  const [radius, setRadius] = useState(25);
  const [page, setPage] = useState(1);

  const { latitude, longitude, locationName, loading: locLoading, error: locError, requestLocation, clearLocation, hasLocation } = useUserLocation();

  // Fetch categories for filter
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Build query params
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (selectedCategories.length > 0) params.set("category", selectedCategories[0]);
    if (priceRange[0] > 0) params.set("priceMin", String(priceRange[0]));
    if (priceRange[1] < 2000) params.set("priceMax", String(priceRange[1]));
    if (sortBy) params.set("sortBy", sortBy);
    if (verifiedOnly) params.set("verifiedOnly", "true");
    if (minRating) params.set("minRating", String(minRating));
    if (hasLocation && latitude && longitude) {
      params.set("latitude", String(latitude));
      params.set("longitude", String(longitude));
      params.set("radius", String(radius));
    }
    params.set("page", String(page));
    params.set("limit", "12");
    return params.toString();
  }, [searchQuery, selectedCategories, priceRange, sortBy, verifiedOnly, minRating, hasLocation, latitude, longitude, radius, page]);

  const { data: servicesData, isLoading } = useQuery<{ services: ServiceWithProvider[]; total: number }>({
    queryKey: [`/api/services?${queryParams}`],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const services = servicesData?.services || [];
  const total = servicesData?.total || 0;
  const hasMore = services.length === 12;

  const toggleCategory = useCallback((slug: string) => {
    setSelectedCategories((prev) => prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]);
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

  return (
    <div className="min-h-screen">
      {/* Search & Filters Bar */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>

            {/* Desktop Filters */}
            <div className="hidden md:flex items-center gap-2">
              <LocationFilter locationName={locationName} radius={radius} loading={locLoading} error={locError} hasLocation={hasLocation} onRequestLocation={requestLocation} onClearLocation={clearLocation} onRadiusChange={setRadius} />
              <CategoryFilter categories={categories} selectedCategories={selectedCategories} onToggleCategory={toggleCategory} />
              <PriceFilter priceRange={priceRange} onPriceChange={(r) => { setPriceRange(r); setPage(1); }} />
              <MoreFiltersButton verifiedOnly={verifiedOnly} minRating={minRating} onVerifiedChange={(v) => { setVerifiedOnly(v); setPage(1); }} onMinRatingChange={(r) => { setMinRating(r); setPage(1); }} activeCount={moreFiltersCount} />
            </div>

            {/* Mobile Filter Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="md:hidden relative">
                  <SlidersHorizontal className="h-4 w-4" />
                  {activeFilterCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">{activeFilterCount}</Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh]">
                <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
                <div className="space-y-4 py-4">
                  <LocationFilter locationName={locationName} radius={radius} loading={locLoading} error={locError} hasLocation={hasLocation} onRequestLocation={requestLocation} onClearLocation={clearLocation} onRadiusChange={setRadius} />
                  <CategoryFilter categories={categories} selectedCategories={selectedCategories} onToggleCategory={toggleCategory} />
                  <PriceFilter priceRange={priceRange} onPriceChange={(r) => { setPriceRange(r); setPage(1); }} />
                  <MoreFiltersButton verifiedOnly={verifiedOnly} minRating={minRating} onVerifiedChange={(v) => { setVerifiedOnly(v); setPage(1); }} onMinRatingChange={(r) => { setMinRating(r); setPage(1); }} activeCount={moreFiltersCount} />
                </div>
              </SheetContent>
            </Sheet>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px] hidden sm:flex"><SelectValue placeholder="Sort by" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="rating">Top Rated</SelectItem>
                <SelectItem value="price_asc">Price: Low</SelectItem>
                <SelectItem value="price_desc">Price: High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filter Pills */}
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {selectedCategories.map((slug) => {
                const cat = categories.find((c) => c.slug === slug);
                return (
                  <Badge key={slug} variant="secondary" className="gap-1 pr-1">
                    {cat?.nameEn || slug}
                    <button onClick={() => toggleCategory(slug)} className="hover:bg-muted rounded-full p-0.5"><X className="h-3 w-3" /></button>
                  </Badge>
                );
              })}
              {(priceRange[0] > 0 || priceRange[1] < 2000) && (
                <Badge variant="secondary" className="gap-1 pr-1">
                  {priceRange[0]}-{priceRange[1]} AED
                  <button onClick={() => setPriceRange([0, 2000])} className="hover:bg-muted rounded-full p-0.5"><X className="h-3 w-3" /></button>
                </Badge>
              )}
              {verifiedOnly && <Badge variant="secondary" className="gap-1 pr-1">Verified<button onClick={() => setVerifiedOnly(false)} className="hover:bg-muted rounded-full p-0.5"><X className="h-3 w-3" /></button></Badge>}
              {hasLocation && <Badge variant="secondary" className="gap-1 pr-1">{locationName}<button onClick={clearLocation} className="hover:bg-muted rounded-full p-0.5"><X className="h-3 w-3" /></button></Badge>}
              <button onClick={clearAllFilters} className="text-xs text-muted-foreground hover:text-foreground">Clear all</button>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Searching..." : `${total} service${total !== 1 ? "s" : ""} found`}
          </p>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <ServiceCardSkeleton key={i} />)}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-16">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No services found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your filters or search terms</p>
            <Button variant="outline" onClick={clearAllFilters}>Clear All Filters</Button>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => <ServiceCard key={service.id} service={service} />)}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <span className="text-sm text-muted-foreground">Page {page}</span>
              <Button variant="outline" disabled={!hasMore} onClick={() => setPage((p) => p + 1)}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Next"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
