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
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Service, ProviderProfile, User, Category } from "@shared/schema";

type ServiceWithRelations = Service & {
  provider: ProviderProfile & { user: User };
  category: Category;
};

export default function Browse() {
  const [location] = useLocation();
  
  const [searchQuery, setSearchQuery] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("search") || "";
  });

  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // We use a separate state for "applied" filters to prevent refetching on every checkbox click
  // This mimics the "Apply Filter" button behavior
  const [appliedFilters, setAppliedFilters] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      search: params.get("search") || "",
      categories: [] as string[],
      minPrice: 0,
      maxPrice: 2000,
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

  const handleApplyFilters = () => {
    setAppliedFilters({
      search: searchQuery,
      categories: selectedCategories,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
    });
    setShowFilters(false); // Close mobile sheet if open
  };

  const queryParams = new URLSearchParams();
  if (appliedFilters.search) queryParams.append("search", appliedFilters.search);
  if (appliedFilters.categories.length > 0) {
    // Sending the first one for now as backend search might expect single 'category'
    // Or if backend supports multiple, we can loop. 
    // Let's try sending the first one to ensure basic filtering works.
    queryParams.append("category", appliedFilters.categories[0]);
  }
  queryParams.append("minPrice", appliedFilters.minPrice.toString());
  queryParams.append("maxPrice", appliedFilters.maxPrice.toString());

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
      <div>
        <h3 className="font-semibold mb-4">Category</h3>
        <div className="space-y-3">
          {categories?.map((cat) => (
            <div key={cat.id} className="flex items-center space-x-2">
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
              />
              <Label htmlFor={`cat-${cat.slug}`} className="cursor-pointer">{cat.nameEn}</Label>
            </div>
          ))}
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
            onValueChange={setPriceRange}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">AED {priceRange[0]}</span>
            <span className="text-muted-foreground">AED {priceRange[1]}</span>
          </div>
        </div>
      </div>

      <Button className="w-full mt-6" onClick={handleApplyFilters}>
        Apply Filters
      </Button>
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
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
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
             <Button onClick={handleApplyFilters} className="h-12 px-6 rounded-xl">
              Search
            </Button>
            <div className="flex gap-2">
              <Select defaultValue="relevance">
                <SelectTrigger className="w-[180px] h-12 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Most Relevant</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="reviews">Most Reviews</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>

              {/* Mobile Filter Button */}
              <Sheet open={showFilters} onOpenChange={setShowFilters}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl">
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
            <aside className="hidden md:block w-80 flex-shrink-0">
              <Card className="sticky top-24 rounded-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-semibold text-lg">Filters</h2>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-muted-foreground"
                      onClick={() => {
                        setPriceRange([0, 2000]);
                        setSelectedCategories([]);
                        setSearchQuery("");
                        setAppliedFilters({
                          search: "",
                          categories: [],
                          minPrice: 0,
                          maxPrice: 2000,
                        });
                      }}
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
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-semibold">{services?.length || 0}</span> results
                </p>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : !services || services.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-xl">
                  <h3 className="text-lg font-semibold mb-2">No services found</h3>
                  <p className="text-muted-foreground">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {services.map((service) => (
                    <Link key={service.id} href={`/service/${service.id}`}>
                      <Card className="hover-elevate active-elevate-2 cursor-pointer transition-all border-2 rounded-xl h-full group">
                        <CardContent className="p-0">
                          {/* Image */}
                          <div className="aspect-video bg-muted rounded-t-xl relative overflow-hidden">
                            {service.images?.[0] ? (
                              <img 
                                src={service.images[0]} 
                                alt={service.titleEn} 
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20" />
                            )}
                            {service.isFeatured && (
                              <Badge className="absolute top-4 right-4 bg-secondary text-secondary-foreground">
                                Featured
                              </Badge>
                            )}
                          </div>

                          <div className="p-6">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary flex-shrink-0 overflow-hidden">
                                {service.provider.user.profileImageUrl ? (
                                  <img src={service.provider.user.profileImageUrl} className="w-full h-full object-cover" />
                                ) : (
                                  service.provider.user.firstName?.[0]
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-lg mb-1 line-clamp-1">
                                  {service.titleEn}
                                </h3>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  {service.provider.companyName || `${service.provider.user.firstName} ${service.provider.user.lastName}`}
                                  {service.provider.verificationStatus === 'verified' && <Shield className="w-4 h-4 text-success" />}
                                </p>
                              </div>
                            </div>

                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                              {service.descriptionEn}
                            </p>

                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-warning text-warning" />
                                <span className="font-semibold text-sm">{service.provider.rating || "New"}</span>
                                <span className="text-xs text-muted-foreground">({service.provider.totalReviews} reviews)</span>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <MapPin className="w-4 h-4" />
                                {service.location?.emirate || "UAE"}
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t">
                              <div>
                                <div className="text-2xl font-bold text-primary">
                                  {service.pricingType === 'fixed' ? 
                                    `${service.priceMin} ${service.currency}` : 
                                    service.pricingType === 'hourly' ? 
                                    `${service.priceMin}/hr` : 'Custom'}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {service.pricingType === 'hourly' ? 'Hourly rate' : 'Starting price'}
                                </div>
                              </div>
                              <Button className="rounded-lg">
                                View Details
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
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