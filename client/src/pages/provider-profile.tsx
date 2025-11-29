import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ProviderProfile, User, Service, Review } from "@shared/schema";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, CheckCircle, Crown, MessageCircle, Phone, Share2, MapPin, Calendar, Award, Flag, Globe, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReviewsList } from "@/components/reviews-list";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type ProviderWithUser = ProviderProfile & { user: User };

export default function ProviderProfilePage() {
  const [, params] = useRoute("/provider/:id");
  const id = params?.id;
  const { toast } = useToast();

  const { data: provider, isLoading: isLoadingProvider } = useQuery<ProviderWithUser>({
    queryKey: [`/api/auth/providers/${id}`],
    enabled: !!id,
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/auth/providers/${id}`);
      if (!res.ok) {
        throw new Error("Provider not found");
      }
      return res.json();
    }
  });

  const { data: services, isLoading: isLoadingServices } = useQuery<Service[]>({
    queryKey: [`/api/services`, { providerId: id }],
    enabled: !!id,
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/services?providerId=${id}`);
      return res.json();
    }
  });

  if (isLoadingProvider || !provider) {
     return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Skeleton className="h-[300px] w-full rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="h-[400px] col-span-2" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Profile Photo */}
            <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
              <AvatarImage src={provider.user.profileImageUrl || undefined} />
              <AvatarFallback className="text-2xl">
                {provider.user.firstName?.[0]}{provider.user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-bold">
                  {provider.companyName || `${provider.user.firstName} ${provider.user.lastName}`}
                </h1>

                {provider.verificationStatus === 'verified' && (
                  <Badge className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}

                {provider.isPremium && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>

              <p className="text-lg text-muted-foreground mt-2">
                {provider.providerType === 'licensed_professional' ? 'Licensed Professional' : 'Freelancer'}
              </p>

              {/* Rating & Stats */}
              <div className="flex flex-wrap items-center gap-6 mt-6">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "w-5 h-5",
                          star <= parseFloat(provider.rating || "0")
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground/30"
                        )}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-lg">{parseFloat(provider.rating || "0").toFixed(1)}</span>
                  <span className="text-muted-foreground">({provider.totalReviews} reviews)</span>
                </div>

                <div className="h-8 w-px bg-border hidden md:block" />

                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <span className="font-bold">{provider.completedJobs}</span>
                    <span className="text-muted-foreground ml-1">Jobs Completed</span>
                  </div>
                </div>

                {provider.responseTime && (
                  <>
                    <div className="h-8 w-px bg-border hidden md:block" />
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <span className="font-bold">{provider.responseTime}h</span>
                        <span className="text-muted-foreground ml-1">Response Time</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mt-8">
                <Button size="lg" className="shadow-md">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message Provider
                </Button>
                <Button size="lg" variant="outline">
                  <Phone className="w-4 h-4 mr-2" />
                  Request Call
                </Button>
                <Button size="lg" variant="ghost">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* About Section */}
            <section>
              <h2 className="text-2xl font-bold mb-4">About</h2>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {provider.bio || "This provider hasn't added a bio yet."}
              </p>
            </section>

            {/* Services Section */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Services Offered</h2>
              {isLoadingServices ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-48" />
                  <Skeleton className="h-48" />
                </div>
              ) : services && services.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {services.map((service) => (
                    <Link key={service.id} href={`/service/${service.id}`}>
                      <Card className="hover:shadow-md transition-all cursor-pointer h-full">
                        <div className="aspect-video bg-muted relative overflow-hidden rounded-t-xl">
                          {service.images?.[0] ? (
                            <img src={service.images[0]} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10" />
                          )}
                          <div className="absolute bottom-2 right-2 bg-background/90 px-2 py-1 rounded text-sm font-bold">
                            {service.pricingType === 'fixed' ? `${service.priceMin} ${service.currency}` : 'Custom'}
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold line-clamp-1 mb-1">{service.titleEn}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {service.descriptionEn}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{service.viewCount} views</span>
                            <span className="flex items-center">
                              <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                              {provider.rating || "New"}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed rounded-xl text-muted-foreground">
                  <p>No services listed yet.</p>
                </div>
              )}
            </section>

            {/* Reviews Section */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Reviews</h2>
              <ReviewsList providerId={id || ""} />
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {provider.languages && provider.languages.length > 0 && (
                    <div>
                      <h4 className="font-medium flex items-center mb-3 text-muted-foreground">
                        <Globe className="w-4 h-4 mr-2" />
                        Languages
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {provider.languages.map((lang) => (
                          <Badge key={lang} variant="secondary">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {provider.serviceAreas && (
                    <div>
                      <h4 className="font-medium flex items-center mb-3 text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-2" />
                        Service Areas
                      </h4>
                      <div className="space-y-1">
                        {provider.serviceAreas.emirates?.map((emirate) => (
                          <div key={emirate} className="text-sm flex items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                            {emirate}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 ml-3.5">
                        Within {provider.serviceRadius}km radius
                      </p>
                    </div>
                  )}

                  <Separator />

                  <div>
                    <h4 className="font-medium flex items-center mb-2 text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2" />
                      Member Since
                    </h4>
                    <p className="text-sm ml-6">
                      {new Date(provider.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium flex items-center mb-2 text-muted-foreground">
                      <Award className="w-4 h-4 mr-2" />
                      Membership
                    </h4>
                    <div className="ml-6">
                       <Badge variant="outline" className="capitalize">
                        {provider.subscriptionTier} Tier
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button variant="ghost" className="w-full text-muted-foreground hover:text-destructive">
                <Flag className="w-4 h-4 mr-2" />
                Report Provider
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}