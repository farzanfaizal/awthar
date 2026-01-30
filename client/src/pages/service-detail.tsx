import { useState } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ImageGallery } from "@/components/image-gallery";
import { BookingForm } from "@/components/booking-form";
import { ReviewsList } from "@/components/reviews-list";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
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
import { Separator } from "@/components/ui/separator";
import {
  Star,
  Eye,
  MessageCircle,
  MapPin,
  Share2,
  Flag,
  Heart,
  Loader2,
  Calendar,
  Map as MapIcon,
  ShieldCheck,
  ChevronRight,
  Clock,
  CheckCircle,
  Phone,
  BadgeCheck,
  Home,
  Briefcase,
  ArrowRight,
} from "lucide-react";
import { Service, ProviderProfile, User, Category } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { getImageUrl } from "@/lib/image-utils";
import { MapView } from "@/components/map-view";
import { ServiceCard } from "@/components/service-card";

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
  const [activeSection, setActiveSection] = useState<"about" | "reviews" | "location">("about");

  const { data: service, isLoading } = useQuery<ServiceWithRelations>({
    queryKey: [`/api/services/${id}`],
    enabled: !!id,
  });

  // Fetch similar services
  const { data: similarServices } = useQuery<ServiceWithRelations[]>({
    queryKey: [`/api/services`, { category: service?.category?.slug, limit: 4 }],
    enabled: !!service?.category?.slug,
    queryFn: async () => {
      const res = await fetch(`/api/services?category=${service?.category?.slug}&limit=4`);
      if (!res.ok) throw new Error("Failed to fetch similar services");
      const data = await res.json();
      // Filter out current service and return
      const services = data.services ?? data;
      return services.filter((s: ServiceWithRelations) => s.id !== id);
    },
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
        description: isFavorited
          ? "Service removed from your list."
          : "Service saved to your favorites list.",
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
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
          <Skeleton className="h-5 w-64 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-[400px] w-full rounded-xl" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-[200px] w-full" />
            </div>
            <div className="lg:col-span-1">
              <Skeleton className="h-[400px] w-full rounded-xl" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-2xl font-bold mb-4">Service Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The service you are looking for does not exist or has been removed.
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

  const provider = service.provider;
  const providerUser = provider.user;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Breadcrumbs */}
      <div className="border-b bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              <Home className="h-4 w-4" />
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Link href="/browse" className="text-muted-foreground hover:text-foreground transition-colors">
              Services
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Link
              href={`/category/${service.category?.slug}`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {service.category?.nameEn}
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground font-medium truncate max-w-[200px]">
              {service.titleEn}
            </span>
          </nav>
        </div>
      </div>

      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <div className="rounded-2xl overflow-hidden border-2 bg-card">
                <ImageGallery images={(service.images || []).map(getImageUrl)} />
              </div>

              {/* Title & Quick Info */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="rounded-full">
                    {service.category?.nameEn}
                  </Badge>
                  {service.isFeatured && (
                    <Badge className="rounded-full bg-amber-500/10 text-amber-600 border-amber-200">
                      Featured
                    </Badge>
                  )}
                  {provider.verificationStatus === "verified" && (
                    <Badge className="rounded-full bg-green-500/10 text-green-600 border-green-200">
                      <BadgeCheck className="h-3 w-3 mr-1" />
                      Verified Provider
                    </Badge>
                  )}
                </div>

                <h1 className="text-2xl md:text-3xl font-bold">{service.titleEn}</h1>

                {/* Quick Stats Row */}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {service.location?.area || service.location?.city || "UAE"}
                      {service.location?.emirate && `, ${service.location.emirate}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span>{service.viewCount} views</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold">{provider.rating || "New"}</span>
                    <span className="text-muted-foreground">({provider.totalReviews} reviews)</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "rounded-full",
                      isFavorited && "text-red-500 border-red-200 bg-red-50"
                    )}
                    onClick={handleFavoriteClick}
                  >
                    <Heart className={cn("h-4 w-4 mr-2", isFavorited && "fill-current")} />
                    {isFavorited ? "Saved" : "Save"}
                  </Button>
                  <Dialog open={reportOpen} onOpenChange={setReportOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground">
                        <Flag className="h-4 w-4 mr-2" />
                        Report
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
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
                          <Label>Details</Label>
                          <Textarea
                            placeholder="Tell us more..."
                            className="min-h-[100px]"
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setReportOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => reportMutation.mutate()}
                          disabled={!reportType || !reportReason || reportMutation.isPending}
                        >
                          {reportMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Submit Report
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Section Navigation */}
              <div className="flex items-center gap-1 border-b">
                {[
                  { id: "about", label: "About", icon: Briefcase },
                  { id: "reviews", label: `Reviews (${provider.totalReviews})`, icon: MessageCircle },
                  { id: "location", label: "Location", icon: MapIcon },
                ].map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id as any)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                      activeSection === section.id
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <section.icon className="h-4 w-4" />
                    {section.label}
                  </button>
                ))}
              </div>

              {/* Section Content */}
              <div className="min-h-[300px]">
                {activeSection === "about" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Description</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                        {service.descriptionEn}
                      </p>
                    </div>

                    {service.tags && service.tags.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-lg mb-3">Expertise</h3>
                        <div className="flex flex-wrap gap-2">
                          {service.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="rounded-full px-3 py-1">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <Separator />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Card className="border-2">
                        <CardContent className="p-4 text-center">
                          <ShieldCheck className="h-8 w-8 text-green-500 mx-auto mb-2" />
                          <p className="font-medium">Verified</p>
                          <p className="text-xs text-muted-foreground">Identity Confirmed</p>
                        </CardContent>
                      </Card>
                      <Card className="border-2">
                        <CardContent className="p-4 text-center">
                          <CheckCircle className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                          <p className="font-medium">{provider.completedJobs}+ Jobs</p>
                          <p className="text-xs text-muted-foreground">Completed</p>
                        </CardContent>
                      </Card>
                      <Card className="border-2">
                        <CardContent className="p-4 text-center">
                          <Clock className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                          <p className="font-medium">{provider.responseTime || "< 1"}h</p>
                          <p className="text-xs text-muted-foreground">Response Time</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {activeSection === "reviews" && (
                  <Card className="border-2">
                    <CardContent className="p-6">
                      <ReviewsList providerId={service.providerId} />
                    </CardContent>
                  </Card>
                )}

                {activeSection === "location" && (
                  <Card className="border-2">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">
                            {service.location?.area || "Area"}, {service.location?.city || "City"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {service.location?.emirate || "Emirate"}, UAE
                          </p>
                        </div>
                      </div>

                      <div className="h-[350px] rounded-xl overflow-hidden border">
                        {service.latitude && service.longitude ? (
                          <MapView
                            services={[service]}
                            center={[
                              parseFloat(service.latitude.toString()),
                              parseFloat(service.longitude.toString()),
                            ]}
                            zoom={14}
                            className="w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <div className="text-center text-muted-foreground">
                              <MapPin className="w-12 h-12 mx-auto mb-2 opacity-30" />
                              <p>Map location not provided</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Similar Services */}
              {similarServices && similarServices.length > 0 && (
                <div className="pt-8 border-t">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Similar Services</h2>
                    <Button variant="ghost" asChild className="text-primary">
                      <Link href={`/category/${service.category?.slug}`}>
                        View All
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {similarServices.slice(0, 2).map((s) => (
                      <ServiceCard key={s.id} service={s} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 space-y-4">
                {/* Price Card */}
                <Card className="border-2 overflow-hidden">
                  <div className="bg-primary/5 p-4 border-b">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-primary">
                        {service.pricingType === "fixed"
                          ? `AED ${service.priceMin}`
                          : service.pricingType === "hourly"
                          ? `AED ${service.priceMin}`
                          : "Custom"}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {service.pricingType === "hourly" && "/hr"}
                        {service.pricingType === "fixed" && "fixed"}
                        {service.pricingType === "custom" && "quote"}
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-4 space-y-4">
                    <BookingForm
                      serviceId={service.id}
                      providerId={service.providerId}
                      service={service}
                    />
                  </CardContent>
                </Card>

                {/* Provider Card */}
                <Card className="border-2">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-4">
                      <Avatar className="h-14 w-14 border-2">
                        <AvatarImage src={providerUser.profileImageUrl || undefined} />
                        <AvatarFallback className="text-lg font-bold">
                          {providerUser.firstName?.[0]}
                          {providerUser.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/provider/${provider.id}`}
                            className="font-semibold hover:text-primary truncate"
                          >
                            {provider.companyName ||
                              `${providerUser.firstName} ${providerUser.lastName}`}
                          </Link>
                          {provider.verificationStatus === "verified" && (
                            <BadgeCheck className="h-5 w-5 text-green-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {provider.providerType === "licensed_professional"
                            ? "Licensed Professional"
                            : "Freelancer"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-medium">{provider.rating || "New"}</span>
                          <span className="text-xs text-muted-foreground">
                            ({provider.totalReviews} reviews)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4 text-center">
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-lg font-bold">{provider.completedJobs}</p>
                        <p className="text-xs text-muted-foreground">Jobs Done</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-lg font-bold">{provider.responseTime || "< 1"}h</p>
                        <p className="text-xs text-muted-foreground">Response</p>
                      </div>
                    </div>

                    <div className="space-y-2">
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
                        Contact Provider
                      </Button>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/provider/${provider.id}`}>View Profile</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t lg:hidden z-40">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Starting from</p>
            <p className="text-xl font-bold text-primary">
              AED {service.priceMin}
              {service.pricingType === "hourly" && <span className="text-sm font-normal">/hr</span>}
            </p>
          </div>
          <Button
            size="lg"
            className="px-8"
            onClick={handleMessageProvider}
            disabled={createConversationMutation.isPending}
          >
            {createConversationMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Contact"
            )}
          </Button>
        </div>
      </div>

      <div className="lg:block hidden">
        <Footer />
      </div>
      {/* Add padding for mobile sticky CTA */}
      <div className="h-24 lg:hidden" />
    </div>
  );
}
