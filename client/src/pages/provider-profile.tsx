import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin,
  Mail,
  Phone,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Star,
  Calendar,
  Languages,
  Building,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

interface ProviderProfile {
  id: string;
  userId: string;
  providerType: string;
  companyName: string | null;
  bio: string | null;
  phone: string | null;
  verificationStatus: string;
  languages: string[] | null;
  serviceAreas: {
    emirates?: string[];
  } | null;
  createdAt: string;
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

interface Service {
  id: string;
  titleEn: string;
  descriptionEn: string;
  pricingType: string;
  priceMin: string | null;
  priceMax: string | null;
  images: string[] | null;
  viewCount: number;
  status: string;
  category: {
    nameEn: string;
  };
}

export default function ProviderProfile() {
  const [, params] = useRoute("/provider/:id");
  const providerId = params?.id;

  const { data: provider, isLoading: isLoadingProvider, error: providerError } = useQuery<ProviderProfile>({
    queryKey: [`/api/providers/${providerId}`],
    queryFn: async () => {
      const response = await fetch(`/api/providers/${providerId}`);
      if (!response.ok) throw new Error("Failed to fetch provider");
      return response.json();
    },
    enabled: !!providerId,
  });

  const { data: services, isLoading: isLoadingServices } = useQuery<Service[]>({
    queryKey: [`/api/providers/${providerId}/services`],
    queryFn: async () => {
      const response = await fetch(`/api/providers/${providerId}/services`);
      if (!response.ok) throw new Error("Failed to fetch services");
      return response.json();
    },
    enabled: !!providerId,
  });

  if (isLoadingProvider) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading provider...</p>
        </div>
      </div>
    );
  }

  if (providerError || !provider) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Provider not found or failed to load
            </AlertDescription>
          </Alert>
          <Link href="/browse">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Browse
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const providerName =
    provider.user.firstName && provider.user.lastName
      ? `${provider.user.firstName} ${provider.user.lastName}`
      : provider.companyName || "Provider";

  const activeServices = services?.filter(s => s.status === "active") || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/browse">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex-1" />
          <Link href="/">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
                A
              </div>
              <span className="font-bold text-lg hidden sm:inline">Awthar</span>
            </div>
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar - Provider Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="rounded-xl">
              <CardContent className="p-6">
                {/* Provider Avatar */}
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-3xl mb-4">
                    {providerName[0].toUpperCase()}
                  </div>
                  <h1 className="text-2xl font-bold mb-1">{providerName}</h1>
                  {provider.companyName && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {provider.companyName}
                    </p>
                  )}
                  {provider.verificationStatus === "verified" && (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-0">
                      <Star className="h-3 w-3 mr-1" />
                      Verified Provider
                    </Badge>
                  )}
                </div>

                {provider.bio && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <h3 className="font-semibold mb-2">About</h3>
                      <p className="text-sm text-muted-foreground">{provider.bio}</p>
                    </div>
                  </>
                )}

                <Separator className="my-4" />

                {/* Contact Info */}
                <div className="space-y-3">
                  <h3 className="font-semibold mb-3">Contact Information</h3>

                  {provider.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{provider.phone}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="line-clamp-1">{provider.user.email}</span>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Additional Info */}
                <div className="space-y-3">
                  <h3 className="font-semibold mb-3">Details</h3>

                  <div className="flex items-start gap-2 text-sm">
                    <Building className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-muted-foreground">Provider Type</p>
                      <p className="font-medium">
                        {provider.providerType === "licensed_professional"
                          ? "Licensed Professional"
                          : "Casual Tasker"}
                      </p>
                    </div>
                  </div>

                  {provider.languages && provider.languages.length > 0 && (
                    <div className="flex items-start gap-2 text-sm">
                      <Languages className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-muted-foreground">Languages</p>
                        <p className="font-medium">{provider.languages.join(", ")}</p>
                      </div>
                    </div>
                  )}

                  {provider.serviceAreas?.emirates && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-muted-foreground">Service Areas</p>
                        <p className="font-medium">{provider.serviceAreas.emirates.join(", ")}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-muted-foreground">Member Since</p>
                      <p className="font-medium">
                        {new Date(provider.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <Button className="w-full rounded-lg">
                  Contact Provider
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Services */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Services Offered</h2>
              <p className="text-muted-foreground">
                {activeServices.length} active {activeServices.length === 1 ? "service" : "services"}
              </p>
            </div>

            {isLoadingServices ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                  <Card key={i} className="rounded-xl">
                    <CardContent className="p-6">
                      <div className="space-y-4 animate-pulse">
                        <div className="h-40 bg-muted rounded-lg" />
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-4 bg-muted rounded w-1/2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : activeServices.length === 0 ? (
              <Card className="rounded-xl">
                <CardContent className="p-12 text-center">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Services Available</h3>
                  <p className="text-muted-foreground">
                    This provider doesn't have any active services at the moment.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeServices.map((service) => (
                  <Link key={service.id} href={`/service/${service.id}`}>
                    <Card className="rounded-xl hover-elevate transition-all cursor-pointer">
                      <CardContent className="p-0">
                        {/* Image */}
                        <div className="aspect-video bg-muted rounded-t-xl relative overflow-hidden">
                          {service.images && service.images.length > 0 ? (
                            <img
                              src={service.images[0]}
                              alt={service.titleEn}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                              <span className="text-muted-foreground text-sm">No image</span>
                            </div>
                          )}
                        </div>

                        <div className="p-6">
                          <div className="mb-3">
                            <Badge variant="outline" className="mb-2">
                              {service.category.nameEn}
                            </Badge>
                            <h3 className="font-semibold text-lg line-clamp-1">
                              {service.titleEn}
                            </h3>
                          </div>

                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {service.descriptionEn}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Eye className="h-4 w-4" />
                              <span>{service.viewCount} views</span>
                            </div>
                            <div className="font-bold text-primary">
                              {service.pricingType === "fixed" && service.priceMin
                                ? `AED ${parseFloat(service.priceMin).toFixed(0)}`
                                : service.pricingType === "hourly" && service.priceMin
                                ? `AED ${parseFloat(service.priceMin).toFixed(0)}/hr`
                                : "Custom"}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
