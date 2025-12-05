import { useState } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ImageGallery } from "@/components/image-gallery";
import { ProviderCard } from "@/components/provider-card";
import { BookingForm } from "@/components/booking-form";
import { ReviewsList } from "@/components/reviews-list";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Star, Eye, MessageCircle, MapPin, Share2, Flag, Heart, Loader2 } from "lucide-react";
import { Service, ProviderProfile, User, Category } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { getImageUrl } from "@/lib/image-utils";

import { MapView } from "@/components/map-view";

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
  const queryClient = useQueryClient();
  
  const [reportOpen, setReportOpen] = useState(false);
  const [reportType, setReportType] = useState("");
  const [reportReason, setReportReason] = useState("");

  const { data: service, isLoading } = useQuery<ServiceWithRelations>({
    queryKey: [`/api/services/${id}`],
    enabled: !!id,
  });

  // Check favorite status
  const { data: favoriteData } = useQuery({
    queryKey: ["/api/favorites/check", id],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/favorites/check/${id}`);
      return res.json();
    },
    enabled: !!id && isAuthenticated,
  });

  const isFavorited = favoriteData?.isFavorited || false;

  // Toggle Favorite
  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorited) {
        await apiRequest("DELETE", `/api/favorites/${id}`);
      } else {
        await apiRequest("POST", "/api/favorites", { serviceId: id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites/check", id] });
      toast({
        title: isFavorited ? "Removed from Favorites" : "Saved to Favorites",
        description: isFavorited ? "Service removed from your list." : "Service saved to your favorites list.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Report Service
  const reportMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/reports", {
        serviceId: id,
        type: reportType,
        reason: reportReason,
      });
    },
    onSuccess: () => {
      setReportOpen(false);
      setReportType("");
      setReportReason("");
      toast({
        title: "Report Submitted",
        description: "Thank you for your report. We will review it shortly.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
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
      providerId: service.provider.id,
      serviceId: service.id,
    });
  };

  const handleFavoriteClick = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to save favorites.",
        variant: "destructive",
      });
      return;
    }
    toggleFavoriteMutation.mutate();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied",
      description: "Service link copied to clipboard.",
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
          <ImageGallery images={(service.images || []).map(getImageUrl)} />

          {/* Title & Category */}
          <div className="mt-6">
            <Breadcrumb className="mb-4 overflow-hidden">
              <BreadcrumbList className="flex-wrap">
                <BreadcrumbItem className="truncate mx-1 hidden sm:inline">
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden sm:inline" />
                <BreadcrumbItem className="truncate mx-1 hidden sm:inline">
                  <BreadcrumbLink href="/browse">Browse</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden sm:inline" />
                <BreadcrumbItem className="truncate mx-1">
                  <BreadcrumbLink href={`/browse?category=${service.category.slug}`}>
                    {service.category.nameEn}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem className="truncate mx-1">
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
              {/* Map */}
              <div className="w-full h-[300px] rounded-lg overflow-hidden mt-4">
                {service.latitude && service.longitude ? (
                  <MapView 
                    services={[service]} 
                    center={[parseFloat(service.latitude.toString()), parseFloat(service.longitude.toString())]}
                    zoom={13}
                    className="w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Location not available on map</p>
                    </div>
                  </div>
                )}
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
          <div className="sticky top-28 lg:top-32 space-y-4">
            <ProviderCard 
              provider={service.provider} 
              onMessage={handleMessageProvider}
              isMessageLoading={createConversationMutation.isPending}
            />

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
              <Button 
                variant={isFavorited ? "default" : "outline"} 
                className="w-full justify-start"
                onClick={handleFavoriteClick}
                disabled={toggleFavoriteMutation.isPending}
              >
                <Heart className={`w-4 h-4 mr-2 ${isFavorited ? "fill-current" : ""}`} />
                {isFavorited ? "Saved to Favorites" : "Save to Favorites"}
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share Service
              </Button>
              
              <Dialog open={reportOpen} onOpenChange={setReportOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
                    <Flag className="w-4 h-4 mr-2" />
                    Report
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Report Service</DialogTitle>
                    <DialogDescription>
                      Please describe why you are reporting this service. We take all reports seriously.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Reason Type</Label>
                      <Select onValueChange={setReportType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a reason" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="spam">Spam or Misleading</SelectItem>
                          <SelectItem value="inappropriate">Inappropriate Content</SelectItem>
                          <SelectItem value="fraud">Fraud or Scam</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea 
                        placeholder="Please provide more details..." 
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setReportOpen(false)}>Cancel</Button>
                    <Button 
                      variant="destructive" 
                      onClick={() => reportMutation.mutate()}
                      disabled={!reportType || !reportReason || reportMutation.isPending}
                    >
                      {reportMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Submit Report
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
