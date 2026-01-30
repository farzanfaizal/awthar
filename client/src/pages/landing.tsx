import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Search,
  Star,
  Shield,
  MessageSquare,
  MapPin,
  Loader2,
  Wrench,
  Home as HomeIcon,
  Briefcase,
  Car,
  Users,
  TrendingUp,
  Laptop,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Map,
  Grid3X3,
  Award,
  ArrowRight,
  CheckCircle,
  Clock,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { searchLocation } from "@/lib/geocoding";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

// Map icon names to Lucide components
const iconMap: Record<string, any> = {
  Wrench: Wrench,
  Home: HomeIcon,
  Briefcase: Briefcase,
  Car: Car,
  Users: Users,
  TrendingUp: TrendingUp,
  Laptop: Laptop,
  GraduationCap: GraduationCap,
};

const IconComponent = ({
  name,
  className,
}: {
  name: string;
  className?: string;
}) => {
  const Icon = iconMap[name] || Wrench;
  return <Icon className={className} />;
};

// Popular areas in UAE
const popularAreas = [
  "Dubai",
  "Abu Dhabi",
  "Sharjah",
  "Ajman",
  "Al Ain",
  "Ras Al Khaimah",
  "Fujairah",
];

// Popular searches grouped by category
const popularSearches = [
  {
    category: "Home Services",
    searches: [
      "AC Repair Dubai",
      "Plumber Near Me",
      "Electrician Dubai",
      "House Cleaning",
      "Painting Services",
      "Carpentry Work",
    ],
  },
  {
    category: "Professional Services",
    searches: [
      "Tax Consultant",
      "Legal Advisor",
      "Business Setup",
      "PRO Services",
      "Accounting Services",
      "HR Consulting",
    ],
  },
  {
    category: "Personal Services",
    searches: [
      "Home Tutoring",
      "Personal Trainer",
      "Photography",
      "Event Planning",
      "Makeup Artist",
      "Pet Grooming",
    ],
  },
];

export default function Landing() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedRating, setSelectedRating] = useState<string>("");
  const [activeTab, setActiveTab] = useState("services");
  const [expandedSearchSection, setExpandedSearchSection] = useState<
    string | null
  >(null);

  const {
    data: categories,
    isLoading: isLoadingCategories,
    isError: isCategoriesError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  const {
    data: services,
    isLoading: isLoadingServices,
    isError: isServicesError,
  } = useQuery({
    queryKey: ["featured-services"],
    queryFn: async () => {
      const res = await fetch("/api/services?limit=6");
      if (!res.ok) throw new Error("Failed to fetch services");
      const data = await res.json();
      return data.services ?? data;
    },
  });

  const handleSearch = async () => {
    setIsSearching(true);
    const params = new URLSearchParams();

    if (searchQuery) {
      params.append("search", searchQuery);
    }

    if (selectedCategory) {
      params.append("category", selectedCategory);
    }

    if (selectedRating) {
      params.append("minRating", selectedRating);
    }

    if (locationQuery) {
      const coords = await searchLocation(locationQuery);
      if (coords) {
        params.append("latitude", coords.lat.toString());
        params.append("longitude", coords.lng.toString());
        params.append("radius", "25");
      } else {
        toast({
          title: "Location not found",
          description: "We couldn't find that location. Searching without it.",
          variant: "destructive",
        });
      }
    }

    setIsSearching(false);

    if (activeTab === "providers") {
      setLocation(`/browse?${params.toString()}&view=providers`);
    } else if (activeTab === "categories") {
      setLocation(`/categories`);
    } else {
      setLocation(`/browse?${params.toString()}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleAreaClick = (area: string) => {
    setLocationQuery(area);
  };

  const handleQuickSearch = (searchTerm: string) => {
    setLocation(`/browse?search=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section with Background */}
      <section className="relative min-h-[600px] md:min-h-[700px] flex items-center">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        </div>

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16 w-full">
          <div className="max-w-4xl mx-auto">
            {/* Hero Text */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 text-white leading-tight">
                Find Trusted Service Providers
              </h1>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
                Connect with verified professionals for all your service needs
                across the GCC region
              </p>
            </div>

            {/* Search Card */}
            <Card className="bg-background/95 backdrop-blur-md shadow-2xl border-0 overflow-hidden">
              <CardContent className="p-0">
                {/* Tabs */}
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="w-full h-auto p-0 bg-muted/50 rounded-none grid grid-cols-3">
                    <TabsTrigger
                      value="services"
                      className="py-4 rounded-none data-[state=active]:bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary font-semibold"
                    >
                      <Search className="h-4 w-4 mr-2 hidden sm:inline" />
                      Services
                    </TabsTrigger>
                    <TabsTrigger
                      value="providers"
                      className="py-4 rounded-none data-[state=active]:bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary font-semibold"
                    >
                      <Users className="h-4 w-4 mr-2 hidden sm:inline" />
                      Providers
                    </TabsTrigger>
                    <TabsTrigger
                      value="categories"
                      className="py-4 rounded-none data-[state=active]:bg-background data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary font-semibold"
                    >
                      <Grid3X3 className="h-4 w-4 mr-2 hidden sm:inline" />
                      Categories
                    </TabsTrigger>
                  </TabsList>

                  {/* Services Tab */}
                  <TabsContent value="services" className="p-4 md:p-6 mt-0">
                    <div className="space-y-4">
                      {/* Main Search Row */}
                      <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                          <Input
                            type="text"
                            placeholder="Location (City, Area)"
                            className="pl-10 h-12 text-base rounded-lg border-2"
                            value={locationQuery}
                            onChange={(e) => setLocationQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            aria-label="Location"
                          />
                        </div>
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                          <Input
                            type="search"
                            placeholder="What service do you need?"
                            className="pl-10 h-12 text-base rounded-lg border-2"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            aria-label="Search for services"
                          />
                        </div>
                        <Button
                          size="lg"
                          className="h-12 px-8 rounded-lg font-semibold"
                          onClick={handleSearch}
                          disabled={isSearching}
                        >
                          {isSearching ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <>
                              <Search className="h-5 w-5 mr-2 md:hidden" />
                              <span className="hidden md:inline">
                                Find Services
                              </span>
                              <span className="md:hidden">Search</span>
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Filter Row */}
                      <div className="flex flex-wrap gap-3">
                        <Select
                          value={selectedCategory}
                          onValueChange={setSelectedCategory}
                        >
                          <SelectTrigger className="w-full sm:w-[180px] h-10">
                            <SelectValue placeholder="All Categories" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories?.map((cat: any) => (
                              <SelectItem key={cat.slug} value={cat.slug}>
                                {cat.nameEn}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select
                          value={selectedRating}
                          onValueChange={setSelectedRating}
                        >
                          <SelectTrigger className="w-full sm:w-[150px] h-10">
                            <SelectValue placeholder="Any Rating" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any Rating</SelectItem>
                            <SelectItem value="4">4+ Stars</SelectItem>
                            <SelectItem value="4.5">4.5+ Stars</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Providers Tab */}
                  <TabsContent value="providers" className="p-4 md:p-6 mt-0">
                    <div className="flex flex-col md:flex-row gap-3">
                      <div className="relative flex-1">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                        <Input
                          type="text"
                          placeholder="Location (City, Area)"
                          className="pl-10 h-12 text-base rounded-lg border-2"
                          value={locationQuery}
                          onChange={(e) => setLocationQuery(e.target.value)}
                          onKeyDown={handleKeyDown}
                          aria-label="Location"
                        />
                      </div>
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                        <Input
                          type="search"
                          placeholder="Search provider name or service..."
                          className="pl-10 h-12 text-base rounded-lg border-2"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={handleKeyDown}
                          aria-label="Search providers"
                        />
                      </div>
                      <Button
                        size="lg"
                        className="h-12 px-8 rounded-lg font-semibold"
                        onClick={handleSearch}
                        disabled={isSearching}
                      >
                        {isSearching ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            <Search className="h-5 w-5 mr-2 md:hidden" />
                            <span className="hidden md:inline">
                              Find Providers
                            </span>
                            <span className="md:hidden">Search</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>

                  {/* Categories Tab */}
                  <TabsContent value="categories" className="p-4 md:p-6 mt-0">
                    <div className="text-center py-4">
                      <p className="text-muted-foreground mb-4">
                        Browse all service categories to find what you need
                      </p>
                      <Button size="lg" className="rounded-lg" asChild>
                        <Link href="/categories">
                          <Grid3X3 className="h-5 w-5 mr-2" />
                          Browse All Categories
                        </Link>
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Area Pills */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {popularAreas.map((area) => (
                <button
                  key={area}
                  onClick={() => handleAreaClick(area)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all",
                    "bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm",
                    locationQuery === area && "bg-primary text-primary-foreground"
                  )}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AwtharAI Promo Banner */}
      <section className="py-6 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-y">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg">AwtharAI</h3>
                  <Badge
                    variant="secondary"
                    className="text-xs font-semibold bg-primary/20 text-primary"
                  >
                    Coming Soon
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Smart service matching powered by AI
                </p>
              </div>
            </div>
            <Button variant="outline" disabled className="rounded-full">
              <Sparkles className="h-4 w-4 mr-2" />
              Get Notified
            </Button>
          </div>
        </div>
      </section>

      {/* Promo Cards */}
      <section className="py-12 md:py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* List Your Service Card */}
            <Card className="overflow-hidden border-2 hover:shadow-lg transition-shadow group">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  <div className="flex-1 p-6">
                    <Badge className="mb-3 bg-success/20 text-success border-0">
                      For Providers
                    </Badge>
                    <h3 className="text-xl font-bold mb-2">List Your Service</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Reach thousands of customers looking for services like
                      yours. Start getting bookings today.
                    </p>
                    <Button className="group-hover:translate-x-1 transition-transform" asChild>
                      <Link href="/become-provider">
                        Get Started
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                  <div className="w-full sm:w-40 h-32 sm:h-auto bg-gradient-to-br from-success/20 to-success/5 flex items-center justify-center">
                    <Briefcase className="h-16 w-16 text-success/50" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Find Verified Providers Card */}
            <Card className="overflow-hidden border-2 hover:shadow-lg transition-shadow group">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  <div className="flex-1 p-6">
                    <Badge className="mb-3 bg-primary/20 text-primary border-0">
                      For Customers
                    </Badge>
                    <h3 className="text-xl font-bold mb-2">
                      Find Verified Providers
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Browse verified professionals with real reviews. Book with
                      confidence and get quality service.
                    </p>
                    <Button variant="outline" className="group-hover:translate-x-1 transition-transform" asChild>
                      <Link href="/browse">
                        Browse Services
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                  <div className="w-full sm:w-40 h-32 sm:h-auto bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Shield className="h-16 w-16 text-primary/50" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Why Choose Awthar
            </h2>
            <p className="text-muted-foreground">
              The smarter way to find and book services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Map View Feature */}
            <Card className="text-center p-6 hover:shadow-md transition-shadow border-2">
              <CardContent className="p-0">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                  <Map className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="font-bold text-lg mb-2">Location-Based Search</h3>
                <p className="text-sm text-muted-foreground">
                  Find service providers near you with our smart location
                  filtering system
                </p>
              </CardContent>
            </Card>

            {/* Browse by Category */}
            <Card className="text-center p-6 hover:shadow-md transition-shadow border-2">
              <CardContent className="p-0">
                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                  <Grid3X3 className="h-8 w-8 text-purple-500" />
                </div>
                <h3 className="font-bold text-lg mb-2">Browse by Category</h3>
                <p className="text-sm text-muted-foreground">
                  Explore services organized by category to find exactly what
                  you need
                </p>
              </CardContent>
            </Card>

            {/* Top Rated */}
            <Card className="text-center p-6 hover:shadow-md transition-shadow border-2">
              <CardContent className="p-0">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-amber-500" />
                </div>
                <h3 className="font-bold text-lg mb-2">Verified & Top Rated</h3>
                <p className="text-sm text-muted-foreground">
                  All providers are verified with real customer reviews and
                  ratings
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 md:py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                Browse by Category
              </h2>
              <p className="text-muted-foreground">
                Explore services by category
              </p>
            </div>
            <Button variant="outline" className="hidden sm:flex" asChild>
              <Link href="/categories">
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {isCategoriesError ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                Failed to load categories. Please try again later.
              </div>
            ) : isLoadingCategories ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="h-32 p-4">
                  <Skeleton className="h-10 w-10 rounded-lg mx-auto mb-3" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </Card>
              ))
            ) : (
              categories?.slice(0, 6).map((category: any) => (
                <Link key={category.slug} href={`/category/${category.slug}`}>
                  <Card className="h-full hover:shadow-md hover:border-primary/50 cursor-pointer transition-all text-center p-4 group">
                    <CardContent className="p-0">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                        <IconComponent
                          name={category.iconName}
                          className="w-6 h-6 text-primary"
                        />
                      </div>
                      <h3 className="font-medium text-sm">{category.nameEn}</h3>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>

          <div className="text-center mt-6 sm:hidden">
            <Button variant="outline" asChild>
              <Link href="/categories">
                View All Categories
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Providers */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                Featured Professionals
              </h2>
              <p className="text-muted-foreground">
                Top-rated service providers
              </p>
            </div>
            <Button variant="outline" className="hidden sm:flex" asChild>
              <Link href="/browse">
                Browse All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isServicesError ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                Failed to load services. Please refresh the page.
              </div>
            ) : isLoadingServices ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-5">
                  <div className="flex gap-4 mb-4">
                    <Skeleton className="h-14 w-14 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-10 w-full rounded-lg mt-4" />
                </Card>
              ))
            ) : (
              services?.slice(0, 6).map((service: any) => {
                const provider = service.provider;
                const user = provider?.user;

                if (!provider || !user) return null;

                return (
                  <Link key={service.id} href={`/service/${service.id}`}>
                    <Card className="hover:shadow-lg cursor-pointer transition-all h-full border-2 hover:border-primary/30">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center font-bold text-lg text-primary flex-shrink-0 overflow-hidden">
                            {user.profileImageUrl ? (
                              <img
                                src={user.profileImageUrl}
                                alt={provider.companyName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>
                                {provider.companyName
                                  ? provider.companyName.substring(0, 2).toUpperCase()
                                  : "PR"}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold truncate">
                                {provider.companyName ||
                                  `${user.firstName} ${user.lastName}`}
                              </h3>
                              {provider.verificationStatus === "verified" && (
                                <BadgeCheck className="w-5 h-5 text-primary flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {service.titleEn}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                <span className="font-semibold text-sm">
                                  {provider.rating || "New"}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                ({provider.totalReviews} reviews)
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm border-t pt-4">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <CheckCircle className="h-4 w-4 text-success" />
                            <span>{provider.completedJobs} jobs</span>
                          </div>
                          <div className="font-semibold text-primary">
                            {service.pricingType === "fixed"
                              ? `AED ${service.priceMin}`
                              : `AED ${service.priceMin}/hr`}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })
            )}
          </div>

          <div className="text-center mt-6 sm:hidden">
            <Button variant="outline" asChild>
              <Link href="/browse">
                Browse All Services
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Popular Searches */}
      <section className="py-12 md:py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">
            Popular Service Searches
          </h2>

          <div className="space-y-4">
            {popularSearches.map((section) => (
              <Collapsible
                key={section.category}
                open={expandedSearchSection === section.category}
                onOpenChange={(open) =>
                  setExpandedSearchSection(open ? section.category : null)
                }
              >
                <Card className="border-2">
                  <CollapsibleTrigger className="w-full">
                    <CardContent className="p-4 flex items-center justify-between">
                      <h3 className="font-semibold">{section.category}</h3>
                      {expandedSearchSection === section.category ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </CardContent>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-4 pb-4">
                      <div className="flex flex-wrap gap-2">
                        {section.searches.map((search) => (
                          <button
                            key={search}
                            onClick={() => handleQuickSearch(search)}
                            className="px-3 py-1.5 rounded-full text-sm bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                          >
                            {search}
                          </button>
                        ))}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get started with Awthar in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">1. Search & Browse</h3>
              <p className="text-sm text-muted-foreground">
                Browse thousands of services or search for exactly what you need
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">2. Connect & Discuss</h3>
              <p className="text-sm text-muted-foreground">
                Message providers directly to discuss your needs and get quotes
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">3. Book & Review</h3>
              <p className="text-sm text-muted-foreground">
                Schedule your service and leave a review to help others
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">
            Ready to Find Your Service Provider?
          </h2>
          <p className="text-lg mb-8 text-primary-foreground/90">
            Join thousands of satisfied customers across the GCC
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="rounded-xl px-8 font-semibold"
              asChild
            >
              <Link href="/browse">Browse Services</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-xl px-8 font-semibold bg-white/10 hover:bg-white/20 border-white/40 text-white backdrop-blur-sm"
              asChild
            >
              <Link href="/become-provider">Become a Provider</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
