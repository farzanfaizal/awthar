import { useRoute, Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ProviderProfile, User, Service } from "@shared/schema";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import {
  Star,
  MessageCircle,
  Phone,
  Share2,
  MapPin,
  Calendar,
  Flag,
  Globe,
  Clock,
  CheckCircle,
  Briefcase,
  BadgeCheck,
  Crown,
  Loader2,
  ArrowRight,
  Home,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ReviewsList } from "@/components/reviews-list";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { getImageUrl } from "@/lib/image-utils";

type ProviderWithUser = ProviderProfile & { user: User };

export default function ProviderProfilePage() {
  const [, params] = useRoute("/provider/:id");
  const id = params?.id;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const { data: provider, isLoading: isLoadingProvider } = useQuery<ProviderWithUser>({
    queryKey: [`/api/auth/providers/${id}`],
    enabled: !!id,
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/auth/providers/${id}`);
      if (!res.ok) {
        throw new Error("Provider not found");
      }
      return res.json();
    },
  });

  const { data: services, isLoading: isLoadingServices } = useQuery<Service[]>({
    queryKey: [`/api/services`, { providerId: id }],
    enabled: !!id,
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/services?providerId=${id}`);
      const data = await res.json();
      return data.services ?? data;
    },
  });

  const createConversationMutation = useMutation({
    mutationFn: async (data: { providerId: string }) => {
      const res = await apiRequest("POST", "/api/conversations", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      return res.json();
    },
    onSuccess: (conversation) => {
      setLocation(`/messages?conversationId=${conversation.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to start conversation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleMessageProvider = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to message the provider.",
        variant: "destructive",
      });
      setLocation("/login");
      return;
    }

    if (!provider) return;

    createConversationMutation.mutate({
      providerId: provider.id,
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied",
      description: "Profile link copied to clipboard.",
    });
  };

  if (isLoadingProvider) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1">
          <Skeleton className="h-[200px] w-full" />
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
            <div className="flex gap-6 mb-8">
              <Skeleton className="h-32 w-32 rounded-full" />
              <div className="space-y-3 flex-1">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-[300px]" />
                <Skeleton className="h-[200px]" />
              </div>
              <Skeleton className="h-[400px]" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-2xl font-bold mb-4">Provider Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The provider you are looking for does not exist or has been removed.
            </p>
            <Button asChild>
              <Link href="/browse">Browse Services</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const user = provider.user;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Cover Banner */}
      <div
        className="h-[200px] md:h-[250px] bg-cover bg-center relative"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80")',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      {/* Profile Header */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 w-full">
        <div className="relative -mt-20 md:-mt-24 mb-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Avatar */}
            <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-background shadow-xl">
              <AvatarImage src={user.profileImageUrl || undefined} />
              <AvatarFallback className="text-3xl font-bold">
                {user.firstName?.[0]}
                {user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 pt-2 md:pt-8">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold">
                  {provider.companyName || `${user.firstName} ${user.lastName}`}
                </h1>
                {provider.verificationStatus === "verified" && (
                  <BadgeCheck className="h-6 w-6 text-green-500" />
                )}
                {provider.isPremium && (
                  <Badge className="bg-amber-500/10 text-amber-600 border-amber-200">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>

              <p className="text-muted-foreground mb-4">
                {provider.providerType === "licensed_professional"
                  ? "Licensed Professional"
                  : "Freelancer"}
              </p>

              {/* Quick Stats */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold">
                    {parseFloat(provider.rating || "0").toFixed(1)}
                  </span>
                  <span className="text-muted-foreground">
                    ({provider.totalReviews} reviews)
                  </span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-1 text-muted-foreground">
                  <CheckCircle className="h-4 w-4" />
                  <span>
                    <strong className="text-foreground">{provider.completedJobs}</strong> jobs done
                  </span>
                </div>
                {provider.responseTime && (
                  <>
                    <Separator orientation="vertical" className="h-4" />
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        <strong className="text-foreground">{provider.responseTime}h</strong>{" "}
                        response
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 md:pt-8">
              <Button
                onClick={handleMessageProvider}
                disabled={createConversationMutation.isPending}
              >
                {createConversationMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <MessageCircle className="h-4 w-4 mr-2" />
                )}
                Message
              </Button>
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm mb-6 pb-4 border-b">
          <Link href="/" className="text-muted-foreground hover:text-foreground">
            <Home className="h-4 w-4" />
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <Link href="/browse" className="text-muted-foreground hover:text-foreground">
            Providers
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="text-foreground font-medium truncate">
            {provider.companyName || `${user.firstName} ${user.lastName}`}
          </span>
        </nav>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-2">
            <CardContent className="p-4 text-center">
              <Star className="h-8 w-8 text-amber-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">
                {parseFloat(provider.rating || "0").toFixed(1)}
              </p>
              <p className="text-xs text-muted-foreground">Rating</p>
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{provider.completedJobs}</p>
              <p className="text-xs text-muted-foreground">Jobs Done</p>
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardContent className="p-4 text-center">
              <MessageCircle className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{provider.totalReviews}</p>
              <p className="text-xs text-muted-foreground">Reviews</p>
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{provider.responseTime || "< 1"}h</p>
              <p className="text-xs text-muted-foreground">Response Time</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <Card className="border-2">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">About</h2>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {provider.bio || "This provider hasn't added a bio yet."}
                </p>
              </CardContent>
            </Card>

            {/* Services Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Services ({services?.length || 0})</h2>
                {services && services.length > 4 && (
                  <Button variant="ghost" className="text-primary">
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>

              {isLoadingServices ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-48" />
                  <Skeleton className="h-48" />
                </div>
              ) : services && services.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.slice(0, 4).map((service) => (
                    <Link key={service.id} href={`/service/${service.id}`}>
                      <Card className="hover:shadow-md transition-all cursor-pointer h-full border-2 hover:border-primary/30 overflow-hidden">
                        <div className="aspect-video bg-muted relative overflow-hidden">
                          {service.images?.[0] ? (
                            <img
                              src={getImageUrl(service.images[0])}
                              alt={service.titleEn}
                              className="w-full h-full object-cover transition-transform hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                              <Briefcase className="h-12 w-12 text-muted-foreground/30" />
                            </div>
                          )}
                          <div className="absolute bottom-2 right-2 bg-background/95 px-2 py-1 rounded text-sm font-bold">
                            {service.pricingType === "fixed"
                              ? `AED ${service.priceMin}`
                              : service.pricingType === "hourly"
                              ? `AED ${service.priceMin}/hr`
                              : "Custom"}
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold line-clamp-1 mb-1">{service.titleEn}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {service.descriptionEn}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <Card className="border-2 border-dashed">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No services listed yet.</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Reviews Section */}
            <div>
              <h2 className="text-xl font-bold mb-4">Reviews</h2>
              <Card className="border-2">
                <CardContent className="p-6">
                  <ReviewsList providerId={id || ""} />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              {/* Contact Card */}
              <Card className="border-2">
                <CardContent className="p-4 space-y-4">
                  <h3 className="font-semibold">Contact Provider</h3>
                  <Button
                    className="w-full"
                    onClick={handleMessageProvider}
                    disabled={createConversationMutation.isPending}
                  >
                    {createConversationMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <MessageCircle className="h-4 w-4 mr-2" />
                    )}
                    Send Message
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Phone className="h-4 w-4 mr-2" />
                    Request Call
                  </Button>
                </CardContent>
              </Card>

              {/* Details Card */}
              <Card className="border-2">
                <CardContent className="p-4 space-y-4">
                  <h3 className="font-semibold">Details</h3>

                  {provider.languages && provider.languages.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Globe className="h-4 w-4" />
                        Languages
                      </div>
                      <div className="flex flex-wrap gap-1.5 ml-6">
                        {provider.languages.map((lang) => (
                          <Badge key={lang} variant="secondary" className="text-xs">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {provider.serviceAreas && (
                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <MapPin className="h-4 w-4" />
                        Service Areas
                      </div>
                      <div className="ml-6 space-y-1">
                        {provider.serviceAreas.emirates?.map((emirate) => (
                          <div key={emirate} className="text-sm flex items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                            {emirate}
                          </div>
                        ))}
                        {provider.serviceRadius && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Within {provider.serviceRadius}km radius
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Calendar className="h-4 w-4" />
                      Member Since
                    </div>
                    <p className="text-sm ml-6">
                      {new Date(provider.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Report Button */}
              <Button
                variant="ghost"
                className="w-full text-muted-foreground hover:text-destructive"
              >
                <Flag className="h-4 w-4 mr-2" />
                Report Provider
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
