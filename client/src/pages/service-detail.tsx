import { useRoute, Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ImageGallery } from "@/components/image-gallery";
import { ProviderCard } from "@/components/provider-card";
import { BookingForm } from "@/components/booking-form";
import { ReviewsList } from "@/components/reviews-list";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Star, Eye, MessageCircle, MapPin, Share2, Flag, Heart } from "lucide-react";
import { Service, ProviderProfile, User, Category } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

type ServiceWithRelations = Service & {
  provider: ProviderProfile & { user: User };
  category: Category;
};

export default function ServiceDetailPage() {
  const [, params] = useRoute("/service/:id");
  const id = params?.id;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  const { data: service, isLoading } = useQuery<ServiceWithRelations>({
    queryKey: [`/api/services/${id}`],
    enabled: !!id,
  });

  const createConversationMutation = useMutation({
    mutationFn: async (data: { providerId: string; serviceId: string }) => {
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

    if (!service) return;

    createConversationMutation.mutate({
      providerId: service.provider.userId,
      serviceId: service.id,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Skeleton className="h-[400px] w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-[200px] w-full" />
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-[300px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Service Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The service you are looking for does not exist or has been removed.
        </p>
        <Link href="/browse">
          <Button>Browse Services</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Service Info */}
        <div className="lg:col-span-2">
          {/* Image Gallery */}
          <ImageGallery images={service.images} />

          {/* Title & Category */}
          <div className="mt-6">
            <Breadcrumb className="mb-4">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/browse">Browse</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/browse?category=${service.category.slug}`}>
                    {service.category.nameEn}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{service.titleEn}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <h1 className="text-4xl font-bold mt-4">{service.titleEn}</h1>

            <div className="flex flex-wrap items-center gap-4 mt-3">
              {service.isFeatured && (
                <Badge variant="secondary" className="bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-500/25 border-yellow-500/20">
                  <Star className="w-3 h-3 mr-1 fill-yellow-500 text-yellow-500" />
                  Featured
                </Badge>
              )}
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  {service.viewCount} views
                </span>
                <span className="flex items-center">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  {service.contactCount} contacts
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>About This Service</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
                {service.descriptionEn}
              </p>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              {service.pricingType === "fixed" && (
                <div className="text-3xl font-bold text-primary">
                  {service.priceMin} {service.currency}
                </div>
              )}
              {service.pricingType === "hourly" && (
                <div className="text-3xl font-bold text-primary">
                  {service.priceMin}-{service.priceMax} {service.currency}/hr
                </div>
              )}
              {service.pricingType === "custom" && (
                <div className="text-xl font-medium text-primary">
                  Custom pricing - Contact for quote
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Service Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">
                    {service.location?.area || "Area not specified"}, {service.location?.city || "City not specified"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {service.location?.emirate || "Emirate not specified"}, UAE
                  </p>
                </div>
              </div>
              {/* Map Placeholder */}
              <div className="w-full h-[300px] rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Map integration coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {service.tags && service.tags.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {service.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="px-3 py-1">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Section */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Provider Reviews</h2>
            <ReviewsList providerId={service.providerId} />
          </div>
        </div>

        {/* Right Column - Provider Card & Booking */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <ProviderCard provider={service.provider} />

            {/* Message Provider Button */}
            <Button
              onClick={handleMessageProvider}
              disabled={createConversationMutation.isPending}
              className="w-full"
              variant="outline"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {createConversationMutation.isPending ? "Starting conversation..." : "Message Provider"}
            </Button>

            {/* Booking Form */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Book This Service</CardTitle>
              </CardHeader>
              <CardContent>
                <BookingForm
                  serviceId={service.id}
                  providerId={service.providerId}
                  service={service}
                />
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Heart className="w-4 h-4 mr-2" />
                Save to Favorites
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Share2 className="w-4 h-4 mr-2" />
                Share Service
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Flag className="w-4 h-4 mr-2" />
                Report
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
