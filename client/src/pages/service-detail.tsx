import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin,
  Clock,
  Star,
  Phone,
  Mail,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Tag,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

interface Service {
  id: string;
  titleEn: string;
  titleAr: string | null;
  descriptionEn: string;
  descriptionAr: string | null;
  pricingType: string;
  priceMin: string | null;
  priceMax: string | null;
  currency: string;
  images: string[] | null;
  location: {
    emirate?: string;
    city?: string;
    area?: string;
  } | null;
  tags: string[] | null;
  viewCount: number;
  createdAt: string;
  category: {
    id: string;
    nameEn: string;
    nameAr: string;
  };
  provider: {
    id: string;
    userId: string;
    companyName: string | null;
    bio: string | null;
    phone: string | null;
    user: {
      firstName: string | null;
      lastName: string | null;
      email: string;
    };
  };
}

export default function ServiceDetail() {
  const [, params] = useRoute("/service/:id");
  const serviceId = params?.id;

  const { data: service, isLoading, error } = useQuery<Service>({
    queryKey: [`/api/services/${serviceId}`],
    queryFn: async () => {
      const response = await fetch(`/api/services/${serviceId}`);
      if (!response.ok) throw new Error("Failed to fetch service");
      return response.json();
    },
    enabled: !!serviceId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading service...</p>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Service not found or failed to load
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
    service.provider.user.firstName && service.provider.user.lastName
      ? `${service.provider.user.firstName} ${service.provider.user.lastName}`
      : service.provider.companyName || "Provider";

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
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <div className="aspect-video rounded-xl overflow-hidden bg-muted">
              {service.images && service.images.length > 0 ? (
                <img
                  src={service.images[0]}
                  alt={service.titleEn}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <span className="text-muted-foreground">No image available</span>
                </div>
              )}
            </div>

            {/* Image Gallery */}
            {service.images && service.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {service.images.slice(1, 5).map((img, idx) => (
                  <div key={idx} className="aspect-video rounded-lg overflow-hidden bg-muted">
                    <img src={img} alt={`${service.titleEn} ${idx + 2}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            {/* Title & Category */}
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Badge variant="outline">{service.category.nameEn}</Badge>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Posted {new Date(service.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h1 className="text-3xl font-bold mb-2">{service.titleEn}</h1>
              {service.titleAr && (
                <h2 className="text-xl text-muted-foreground mb-4" dir="rtl">
                  {service.titleAr}
                </h2>
              )}
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-muted-foreground whitespace-pre-line">
                {service.descriptionEn}
              </p>
              {service.descriptionAr && (
                <>
                  <Separator className="my-4" />
                  <p className="text-muted-foreground whitespace-pre-line" dir="rtl">
                    {service.descriptionAr}
                  </p>
                </>
              )}
            </div>

            {/* Location */}
            {service.location && (
              <>
                <Separator />
                <div>
                  <h2 className="text-xl font-semibold mb-4">Service Location</h2>
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <MapPin className="h-5 w-5 mt-0.5" />
                    <div>
                      {service.location.emirate && <p>{service.location.emirate}</p>}
                      {service.location.city && <p>{service.location.city}</p>}
                      {service.location.area && <p>{service.location.area}</p>}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Tags */}
            {service.tags && service.tags.length > 0 && (
              <>
                <Separator />
                <div>
                  <h2 className="text-xl font-semibold mb-4">Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {service.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="gap-1">
                        <Tag className="h-3 w-3" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <Card className="rounded-xl">
              <CardContent className="p-6">
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-1">Price</p>
                  <div className="text-3xl font-bold text-primary">
                    {service.pricingType === "fixed" && service.priceMin ? (
                      <>AED {parseFloat(service.priceMin).toFixed(0)}</>
                    ) : service.pricingType === "hourly" && service.priceMin ? (
                      <>
                        AED {parseFloat(service.priceMin).toFixed(0)}
                        <span className="text-lg text-muted-foreground">/hr</span>
                      </>
                    ) : service.pricingType === "negotiable" ? (
                      <span className="text-xl">Negotiable</span>
                    ) : (
                      <span className="text-xl">Custom</span>
                    )}
                  </div>
                  {service.priceMax && service.pricingType !== "fixed" && (
                    <p className="text-sm text-muted-foreground">
                      Up to AED {parseFloat(service.priceMax).toFixed(0)}
                    </p>
                  )}
                </div>

                <Button className="w-full rounded-lg" size="lg">
                  Contact Provider
                </Button>
              </CardContent>
            </Card>

            {/* Provider Card */}
            <Card className="rounded-xl">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">About the Provider</h3>

                <Link href={`/provider/${service.provider.id}`}>
                  <div className="flex items-center gap-3 mb-4 hover-elevate p-2 -mx-2 rounded-lg transition-all cursor-pointer">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {providerName[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold line-clamp-1">{providerName}</p>
                      {service.provider.companyName && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {service.provider.companyName}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>

                {service.provider.bio && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {service.provider.bio}
                  </p>
                )}

                <Separator className="my-4" />

                <div className="space-y-2">
                  {service.provider.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{service.provider.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="line-clamp-1">{service.provider.user.email}</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <Link href={`/provider/${service.provider.id}`}>
                  <Button variant="outline" className="w-full rounded-lg">
                    <User className="h-4 w-4 mr-2" />
                    View Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="rounded-xl">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Service Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Views</span>
                    <span className="font-semibold">{service.viewCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Listed</span>
                    <span className="font-semibold">
                      {new Date(service.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
