import { useState } from "react";
import { Search, Filter, MapPin, Star, Shield, SlidersHorizontal } from "lucide-react";
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

export default function Browse() {
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);

  const filters = (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-4">Category</h3>
        <div className="space-y-3">
          {["Home Repair", "Cleaning", "Professional Services", "Moving"].map((cat) => (
            <div key={cat} className="flex items-center space-x-2">
              <Checkbox id={`cat-${cat}`} data-testid={`checkbox-category-${cat.toLowerCase().replace(' ', '-')}`} />
              <Label htmlFor={`cat-${cat}`} className="cursor-pointer">{cat}</Label>
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
            data-testid="slider-price-range"
          />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">AED {priceRange[0]}</span>
            <span className="text-muted-foreground">AED {priceRange[1]}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-4">Rating</h3>
        <div className="space-y-3">
          {[5, 4, 3, 2].map((rating) => (
            <div key={rating} className="flex items-center space-x-2">
              <Checkbox id={`rating-${rating}`} data-testid={`checkbox-rating-${rating}`} />
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
            <Checkbox id="verified" data-testid="checkbox-verified" />
            <Label htmlFor="verified" className="cursor-pointer flex items-center gap-2">
              <Shield className="w-4 h-4 text-success" />
              Verified Only
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="professional" data-testid="checkbox-professional" />
            <Label htmlFor="professional" className="cursor-pointer">Licensed Professionals</Label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-4">Location Radius</h3>
        <Select defaultValue="25">
          <SelectTrigger data-testid="select-radius">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">Within 10 km</SelectItem>
            <SelectItem value="25">Within 25 km</SelectItem>
            <SelectItem value="50">Within 50 km</SelectItem>
            <SelectItem value="100">Within 100 km</SelectItem>
          </SelectContent>
        </Select>
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
                data-testid="input-browse-search"
              />
            </div>
            <div className="flex gap-2">
              <Select defaultValue="relevance">
                <SelectTrigger className="w-[180px] h-12 rounded-xl" data-testid="select-sort">
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
                    <Button variant="ghost" size="sm" className="text-muted-foreground" data-testid="button-clear-filters">
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
                  Showing <span className="font-semibold">1,234</span> results
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Link key={i} href={`/service/${i + 1}`}>
                    <Card className="hover-elevate active-elevate-2 cursor-pointer transition-all border-2 rounded-xl h-full" data-testid={`card-service-${i + 1}`}>
                      <CardContent className="p-0">
                        {/* Image */}
                        <div className="aspect-video bg-muted rounded-t-xl relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
                          {i % 3 === 0 && (
                            <Badge className="absolute top-4 right-4 bg-secondary text-secondary-foreground" data-testid={`badge-featured-${i + 1}`}>
                              Featured
                            </Badge>
                          )}
                        </div>

                        <div className="p-6">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary flex-shrink-0">
                              {String.fromCharCode(65 + i)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg mb-1 line-clamp-1">
                                Professional Service {i + 1}
                              </h3>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                Provider Name
                                {i % 2 === 0 && <Shield className="w-4 h-4 text-success" />}
                              </p>
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            High-quality service with professional standards. Experienced team ready to help with all your needs.
                          </p>

                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-warning text-warning" />
                              <span className="font-semibold text-sm">4.{9 - (i % 3)}</span>
                              <span className="text-xs text-muted-foreground">({50 + i * 10} reviews)</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              Dubai, UAE
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t">
                            <div>
                              <div className="text-2xl font-bold text-primary">
                                AED {100 + i * 50}
                              </div>
                              <div className="text-xs text-muted-foreground">Starting price</div>
                            </div>
                            <Button className="rounded-lg" data-testid={`button-view-service-${i + 1}`}>
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
              <div className="mt-12 flex items-center justify-center gap-2">
                <Button variant="outline" className="rounded-lg" data-testid="button-page-prev">
                  Previous
                </Button>
                {[1, 2, 3, 4, 5].map((page) => (
                  <Button
                    key={page}
                    variant={page === 1 ? "default" : "outline"}
                    className="rounded-lg w-10 h-10 p-0"
                    data-testid={`button-page-${page}`}
                  >
                    {page}
                  </Button>
                ))}
                <Button variant="outline" className="rounded-lg" data-testid="button-page-next">
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
