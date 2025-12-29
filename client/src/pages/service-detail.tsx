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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Star, Eye, MessageCircle, MapPin, Share2, Flag, Heart, Loader2, Calendar, Info, Map as MapIcon, ShieldCheck } from "lucide-react";
import { Service, ProviderProfile, User, Category } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
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
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
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
              <BreadcrumbPage className="max-w-[200px] truncate">{service.titleEn}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Media & Info (8/12) */}
          <div className="lg:col-span-8 space-y-8">
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 font-semibold">
                      {service.category.nameEn}
                    </Badge>
                    {service.isFeatured && (
                      <Badge className="bg-secondary text-secondary-foreground shadow-sm">
                        Featured Service
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                    {service.titleEn}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                      <Star className="w-4 h-4 fill-warning text-warning" />
                      <span>{service.provider.rating || "New"}</span>
                      <span className="text-muted-foreground font-normal">({service.provider.totalReviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      <span>{service.location?.area || "Area"}, {service.location?.city || "City"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4" />
                      <span>{service.viewCount} views</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="rounded-full h-10 w-10 shadow-sm" onClick={handleShare}>
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className={cn("rounded-full h-10 w-10 shadow-sm transition-colors", isFavorited && "text-red-500 border-red-100 bg-red-50")} 
                    onClick={handleFavoriteClick}
                  >
                    <Heart className={cn("w-4 h-4", isFavorited && "fill-current")} />
                  </Button>
                </div>
              </div>

              {/* Image Gallery */}
              <div className="rounded-2xl overflow-hidden shadow-md">
                <ImageGallery images={(service.images || []).map(getImageUrl)} />
              </div>
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="w-full justify-start h-12 bg-muted/50 p-1 mb-8 rounded-xl border border-border/50">
                <TabsTrigger value="about" className="rounded-lg px-6 data-[state=active]:shadow-sm">
                   <Info className="w-4 h-4 mr-2" />
                   About
                </TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-lg px-6 data-[state=active]:shadow-sm">
                   <MessageCircle className="w-4 h-4 mr-2" />
                   Reviews ({service.provider.totalReviews})
                </TabsTrigger>
                <TabsTrigger value="location" className="rounded-lg px-6 data-[state=active]:shadow-sm">
                   <MapIcon className="w-4 h-4 mr-2" />
                   Location
                </TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="space-y-8 focus-visible:outline-none">
                <div className="prose prose-slate max-w-none">
                  <p className="whitespace-pre-wrap leading-relaxed text-lg text-muted-foreground">
                    {service.descriptionEn}
                  </p>
                </div>

                {service.tags && service.tags.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-bold text-lg">Key Expertise</h3>
                    <div className="flex flex-wrap gap-2">
                      {service.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="px-4 py-1.5 rounded-full bg-muted/30 border-border/50 font-medium transition-colors hover:bg-muted">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <h3 className="font-bold text-lg">Why choose this provider?</h3>
                      <ul className="space-y-3">
                        <li className="flex items-center gap-3 text-sm text-muted-foreground">
                           <ShieldCheck className="w-5 h-5 text-success" />
                           <span>Verified Identity & License</span>
                        </li>
                        <li className="flex items-center gap-3 text-sm text-muted-foreground">
                           <Star className="w-5 h-5 text-warning fill-warning" />
                           <span>Top Rated Performance</span>
                        </li>
                        <li className="flex items-center gap-3 text-sm text-muted-foreground">
                           <Calendar className="w-5 h-5 text-primary" />
                           <span>Available for Immediate Booking</span>
                        </li>
                      </ul>
                   </div>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="focus-visible:outline-none">
                 <div className="bg-card rounded-2xl border p-6 md:p-8 shadow-sm">
                    <ReviewsList providerId={service.providerId} />
                 </div>
              </TabsContent>

              <TabsContent value="location" className="focus-visible:outline-none space-y-6">
                <div className="bg-card rounded-2xl border p-6 md:p-8 shadow-sm">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                        <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">
                        {service.location?.area || "Area"}, {service.location?.city || "City"}
                      </p>
                      <p className="text-muted-foreground">
                        {service.location?.emirate || "Emirate"}, UAE
                      </p>
                    </div>
                  </div>
                  
                  <div className="w-full h-[400px] rounded-xl overflow-hidden border shadow-inner">
                    {service.latitude && service.longitude ? (
                      <MapView 
                        services={[service]} 
                        center={[parseFloat(service.latitude.toString()), parseFloat(service.longitude.toString())]}
                        zoom={14}
                        className="w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <MapPin className="w-12 h-12 mx-auto mb-2 opacity-30" />
                          <p className="font-medium">Map location not provided</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column: Booking & Actions (4/12) */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              {/* Pricing & Booking Card */}
              <Card className="rounded-2xl shadow-xl border-none ring-1 ring-border/50 overflow-hidden">
                <CardHeader className="bg-primary/5 pb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-primary">
                      {service.pricingType === "fixed" ? (
                        `AED ${service.priceMin}`
                      ) : service.pricingType === "hourly" ? (
                        `AED ${service.priceMin}/hr`
                      ) : (
                        "Quote"
                      )}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {service.pricingType === "fixed" ? "Fixed Price" : service.pricingType === "hourly" ? "Hourly Rate" : "Starting Price"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <BookingForm
                    serviceId={service.id}
                    providerId={service.providerId}
                    service={service}
                  />

                  <Separator />

                  <div className="flex flex-col gap-3">
                    <Button 
                        size="lg" 
                        variant="secondary" 
                        className="w-full font-bold h-12"
                        onClick={handleMessageProvider}
                        disabled={createConversationMutation.isPending}
                    >
                        {createConversationMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <MessageCircle className="w-4 h-4 mr-2" />
                        )}
                        Contact Provider
                    </Button>

                    <div className="flex items-center justify-center py-2">
                       <Dialog open={reportOpen} onOpenChange={setReportOpen}>
                        <DialogTrigger asChild>
                          <button className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 font-medium">
                            <Flag className="w-3 h-3" />
                            Report this listing
                          </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Report Listing</DialogTitle>
                            <DialogDescription>
                              Help us keep the marketplace safe. Why are you reporting this?
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>Reason</Label>
                              <Select onValueChange={setReportType}>
                                <SelectTrigger className="rounded-lg">
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
                              <Label>Details</Label>
                              <Textarea 
                                placeholder="Tell us more..." 
                                className="min-h-[100px] rounded-lg"
                                value={reportReason}
                                onChange={(e) => setReportReason(e.target.value)}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setReportOpen(false)} className="rounded-lg">Cancel</Button>
                            <Button 
                              variant="destructive" 
                              className="rounded-lg"
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
                </CardContent>
              </Card>

              {/* Provider Info Summary */}
              <ProviderCard 
                provider={service.provider} 
                onMessage={handleMessageProvider}
                isMessageLoading={createConversationMutation.isPending}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
