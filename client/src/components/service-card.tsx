import { Link } from "wouter";
import { Service, ProviderProfile, User } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BadgeCheck, Star, MapPin } from "lucide-react";
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

  return (
    <Link href={`/service/${service.id}`}>
      <Card
        className={cn(
          "group h-full flex flex-col overflow-hidden border-2 transition-all duration-300 hover:shadow-xl hover:border-primary/30 active:shadow-md cursor-pointer rounded-xl bg-card",
          className
        )}
      >
        {/* Image Section */}
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

          {/* Gradient overlay for better contrast */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

          {/* Featured Badge */}
          {service.isFeatured && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-primary/90 text-primary-foreground border-0 rounded-full px-3 py-1 shadow-md font-medium">
                Featured
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="flex flex-1 flex-col p-5">
          {/* Provider Info Row */}
          <div className="flex items-center gap-3 mb-3">
            {/* Avatar */}
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-border">
              {user.profileImageUrl ? (
                <img
                  src={getImageVariant(getImageUrl(user.profileImageUrl), "thumbnail")}
                  alt={user.firstName || "Provider"}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <span className="text-sm font-bold text-primary">{user.firstName?.[0]}</span>
              )}
            </div>

            {/* Provider Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold truncate">
                  {provider.companyName || `${user.firstName} ${user.lastName}`}
                </p>
                {provider.verificationStatus === 'verified' && (
                  <BadgeCheck className="h-4 w-4 text-primary flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3 fill-warning text-warning" />
                <span className="font-medium text-foreground">{provider.rating || "New"}</span>
                <span>({provider.totalReviews} reviews)</span>
              </div>
            </div>
          </div>

          {/* Service Title */}
          <h3 className="font-semibold text-base leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {service.titleEn}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
            <div className="w-5 h-5 rounded bg-muted flex items-center justify-center flex-shrink-0">
              <MapPin className="h-3 w-3" />
            </div>
            <span className="truncate">
              {service.location?.emirate || "UAE"}
              {service.location?.city && ` • ${service.location.city}`}
            </span>
          </div>

          {/* Footer: Price & CTA */}
          <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
            {/* Price - Left aligned */}
            <div>
              <span className="text-xl font-bold text-primary">
                AED {service.priceMin || "—"}
              </span>
              {service.pricingType === "hourly" && (
                <span className="text-sm text-muted-foreground">/hr</span>
              )}
              {service.pricingType === "custom" && service.priceMin && (
                <span className="text-sm text-muted-foreground">+</span>
              )}
            </div>

            {/* CTA Button */}
            <Button
              size="sm"
              className="h-9 px-5 rounded-lg font-medium"
            >
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
