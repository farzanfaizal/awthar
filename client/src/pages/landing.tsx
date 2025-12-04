import { Link } from "wouter";
import { Search, Star, Shield, MessageSquare, MapPin, Clock, Wrench, Home as HomeIcon, Briefcase, Car, Users, TrendingUp, Laptop, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

// Map icon names to Lucide components
const iconMap: Record<string, any> = {
  "Wrench": Wrench,
  "Home": HomeIcon,
  "Briefcase": Briefcase,
  "Car": Car,
  "Users": Users,
  "TrendingUp": TrendingUp,
  "Laptop": Laptop,
  "GraduationCap": GraduationCap,
};

const IconComponent = ({ name, className }: { name: string; className?: string }) => {
  const Icon = iconMap[name] || Wrench;
  return <Icon className={className} />;
};

export default function Landing() {
  const { data: categories, isLoading: isLoadingCategories, isError: isCategoriesError } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  const { data: services, isLoading: isLoadingServices, isError: isServicesError } = useQuery({
    queryKey: ["featured-services"],
    queryFn: async () => {
      // Fetching services to display as "Featured" - filtering for featured could be a query param later
      const res = await fetch("/api/services?limit=3"); 
      if (!res.ok) throw new Error("Failed to fetch services");
      return res.json();
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Find Trusted Service Providers Across the GCC
            </h1>
            <p className="text-lg md:text-xl mb-8 text-primary-foreground/90">
              Connect with verified professionals for home services, repairs, consultations, and more. Quality service providers at your fingertips.
            </p>
            
            {/* Hero Search */}
            <div className="bg-background/95 backdrop-blur-sm rounded-2xl p-4 shadow-2xl">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                  <Input
                    type="search"
                    placeholder="What service do you need?"
                    className="pl-12 h-14 text-base rounded-xl border-2 text-foreground"
                    data-testid="input-hero-search"
                    aria-label="Search for services"
                  />
                </div>
                <div className="relative flex-1 min-w-0">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                  <Input
                    type="text"
                    placeholder="Location (Emirate, City, Area)"
                    className="pl-12 h-14 text-base rounded-xl border-2 text-foreground"
                    data-testid="input-hero-location"
                    aria-label="Location"
                  />
                </div>
                <Button size="lg" className="h-14 px-8 rounded-xl bg-secondary hover:bg-secondary/90 text-white font-semibold whitespace-nowrap flex-shrink-0" data-testid="button-hero-search" asChild>
                  <Link href="/browse">
                    Search Services
                  </Link>
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-12 grid grid-cols-3 gap-4 md:gap-8">
              <div className="text-center">
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1 truncate">7,000+</div>
                <div className="text-xs md:text-sm text-primary-foreground/80">Service Providers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1 truncate">50,000+</div>
                <div className="text-xs md:text-sm text-primary-foreground/80">Jobs Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1 truncate">4.8★</div>
                <div className="text-xs md:text-sm text-primary-foreground/80">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Popular Categories</h2>
            <p className="text-lg text-muted-foreground">Explore services by category</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {isCategoriesError ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                Failed to load categories. Please try again later.
              </div>
            ) : isLoadingCategories ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="h-40 border-2 rounded-xl p-6 flex flex-col items-center justify-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <Skeleton className="h-4 w-24" />
                </Card>
              ))
            ) : (
              categories?.map((category: any) => (
                <Link key={category.slug} href={`/category/${category.slug}`}>
                  <Card className="hover-elevate active-elevate-2 cursor-pointer transition-all border-2 rounded-xl h-full" data-testid={`card-category-${category.slug}`}>
                    <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                        <IconComponent name={category.iconName} className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{category.nameEn}</h3>
                        <p className="text-xs text-muted-foreground">{category.descriptionEn || "Explore services"}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>

          <div className="text-center mt-8">
            <Link href="/categories">
              <Button variant="outline" size="lg" className="rounded-xl" data-testid="button-view-all-categories">
                View All Categories
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Providers */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Featured Professionals</h2>
              <p className="text-lg text-muted-foreground">Top-rated professionals in your area</p>
            </div>
            <Link href="/browse">
              <Button variant="outline" className="rounded-lg" data-testid="button-browse-all">
                Browse All
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isServicesError ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                Failed to load featured services. Please refresh the page.
              </div>
            ) : isLoadingServices ? (
               Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="h-64 border-2 rounded-xl p-6">
                  <div className="flex gap-4 mb-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-6" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </Card>
              ))
            ) : (
              services?.map((service: any) => {
                const provider = service.provider;
                const user = provider?.user;
                
                if (!provider || !user) return null;

                return (
                  <Link key={service.id} href={`/service/${service.id}`}>
                    <Card className="hover-elevate active-elevate-2 cursor-pointer transition-all border-2 rounded-xl h-full flex flex-col" data-testid={`card-service-${service.id}`}>
                      <CardContent className="p-6 flex flex-col h-full">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xl text-primary flex-shrink-0 overflow-hidden">
                             {user.profileImageUrl ? (
                                <img src={user.profileImageUrl} alt={provider.companyName} className="w-full h-full object-cover" />
                             ) : (
                                <span>{provider.companyName ? provider.companyName.substring(0, 2).toUpperCase() : "PR"}</span>
                             )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2 mb-1">
                              <h3 className="font-semibold text-lg truncate">{provider.companyName || `${user.firstName} ${user.lastName}`}</h3>
                              {provider.verificationStatus === 'verified' && (
                                <Shield className="w-5 h-5 text-success flex-shrink-0" data-testid={`badge-verified-${provider.id}`} />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2 truncate">{service.titleEn}</p>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-warning text-warning" />
                                <span className="font-semibold text-sm">{provider.rating || "New"}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">({provider.totalReviews} reviews)</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm flex-1">
                          <div>
                            <div className="text-muted-foreground mb-1">Completed Jobs</div>
                            <div className="font-semibold">{provider.completedJobs}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground mb-1">Price</div>
                            <div className="font-semibold">
                              {service.pricingType === 'fixed' ?
                                `AED ${service.priceMin}` :
                                `AED ${service.priceMin}/hr`}
                            </div>
                          </div>
                        </div>

                        <Button className="w-full mt-auto pt-6 border-t rounded-lg" data-testid={`button-view-service-${service.id}`}>
                          <MessageSquare className="w-4 h-4 mr-2" />
                          View Service
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started with Awthar in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">1. Search & Browse</h3>
              <p className="text-muted-foreground">
                Browse thousands of services or search for exactly what you need. Filter by location, price, and ratings.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-10 h-10 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">2. Connect & Discuss</h3>
              <p className="text-muted-foreground">
                Message providers directly to discuss your needs, get quotes, and ask questions. All communication is secure and tracked.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-3">3. Book & Review</h3>
              <p className="text-muted-foreground">
                Schedule your service and pay the provider directly. After completion, leave a review to help the community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Find Your Service Provider?
          </h2>
          <p className="text-lg mb-8 text-primary-foreground/90">
            Join thousands of satisfied customers across the GCC
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="rounded-xl px-8 text-base font-semibold" data-testid="button-cta-browse" asChild>
              <Link href="/browse">
                Browse Services
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-xl px-8 text-base font-semibold bg-white/10 hover:bg-white/20 border-white/40 text-white backdrop-blur-sm" data-testid="button-cta-provider" asChild>
              <Link href="/become-provider">
                Become a Provider
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
