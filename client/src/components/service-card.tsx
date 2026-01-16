import { Link } from "wouter";
import { Service, ProviderProfile, User } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Star, MapPin } from "lucide-react";
import { getImageUrl } from "@/lib/image-utils";
import { cn } from "@/lib/utils";
import { getImageVariant, getImageSrcSet, getImageSizes } from "@/lib/image-variants";

interface ServiceCardProps {
  service: Service & {
    provider: ProviderProfile & { user: User };
  };
  className?: string;
}

export function ServiceCard({ service, className }: ServiceCardProps) {
  const provider = service.provider;
  const user = provider.user;

  // Determine pricing display
  const renderPrice = () => {
    switch (service.pricingType) {
      case "fixed":
        return (
          <div className="flex flex-col items-end">
            <span className="text-2xl font-bold text-primary">
              AED {service.priceMin}
            </span>
            <span className="text-xs text-muted-foreground">Fixed Price</span>
          </div>
        );
      case "hourly":
        return (
          <div className="flex flex-col items-end">
            <span className="text-2xl font-bold text-primary">
              AED {service.priceMin}
              <span className="text-sm font-normal text-muted-foreground">/hr</span>
            </span>
            <span className="text-xs text-muted-foreground">Hourly Rate</span>
          </div>
        );
      case "custom":
        return (
          <div className="flex flex-col items-end">
             <span className="text-2xl font-bold text-primary">
              {service.priceMin ? `AED ${service.priceMin}+` : "Custom"}
            </span>
            <span className="text-xs text-muted-foreground">Starting At</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Link href={`/service/${service.id}`}>
      <Card 
        className={cn(
          "group h-full flex flex-col overflow-hidden border-2 transition-all duration-300 hover:shadow-lg active:shadow-md cursor-pointer rounded-xl",
          className
        )}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {service.images && service.images.length > 0 ? (
            <img
              src={getImageVariant(getImageUrl(service.images[0]), "medium")}
              srcSet={getImageSrcSet(getImageUrl(service.images[0]))}
              sizes={getImageSizes("card")}
              alt={service.titleEn}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
             <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-muted-foreground">
              No Image
             </div>
          )}

          {/* Badges Overlay */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
            {service.isFeatured && (
              <Badge variant="secondary" className="shadow-sm">
                Featured
              </Badge>
            )}
             {/* New Badge logic could go here based on createdAt */}
          </div>
        </div>

        <CardContent className="flex flex-1 flex-col p-5">
          {/* Provider Info Row */}
          <div className="flex items-start justify-between gap-3 mb-3">
             <div className="flex items-center gap-2 min-w-0">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0 border border-border">
                    {user.profileImageUrl ? (
                        <img
                          src={getImageVariant(getImageUrl(user.profileImageUrl), "thumbnail")}
                          alt={user.firstName || "Provider"}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                    ) : (
                        <span className="text-xs font-bold text-primary">{user.firstName?.[0]}</span>
                    )}
                </div>
                <div className="min-w-0">
                    <p className="text-xs text-muted-foreground font-medium truncate flex items-center gap-1">
                        {provider.companyName || `${user.firstName} ${user.lastName}`}
                        {provider.verificationStatus === 'verified' && (
                            <Shield className="h-3 w-3 text-success fill-success/10" />
                        )}
                    </p>
                     <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-warning text-warning" />
                        <span className="text-xs font-bold text-foreground">{provider.rating || "New"}</span>
                        <span className="text-xs text-muted-foreground">({provider.totalReviews})</span>
                    </div>
                </div>
             </div>
          </div>

          {/* Service Title */}
          <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {service.titleEn}
          </h3>

           {/* Location */}
           <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                <MapPin className="h-3 w-3" />
                <span>{service.location?.emirate || "UAE"}</span>
                {service.location?.city && <span>• {service.location.city}</span>}
            </div>

          {/* Footer: Price & CTA */}
          <div className="mt-auto pt-4 border-t flex items-center justify-between">
            {renderPrice()}
            <Button size="sm" variant="outline" className="h-9 px-4 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors">
                View
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
