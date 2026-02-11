"use client";

import Link from "next/link";
import Image from "next/image";
import type { ServiceWithProvider } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BadgeCheck, Star, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  service: ServiceWithProvider;
  className?: string;
}

export function ServiceCard({ service, className }: ServiceCardProps) {
  const provider = service.provider;
  const user = provider.user;
  const firstImage = service.images?.[0];

  return (
    <Link href={`/service/${service.id}`}>
      <Card
        className={cn(
          "group h-full flex flex-col overflow-hidden border-2 transition-all duration-300 hover:shadow-xl hover:border-primary/30 active:shadow-md cursor-pointer rounded-xl bg-card",
          className
        )}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {firstImage ? (
            <Image
              src={firstImage}
              alt={service.titleEn}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-muted-foreground">
              No Image
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
          {service.isFeatured && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-primary/90 text-primary-foreground border-0 rounded-full px-3 py-1 shadow-md font-medium">
                Featured
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="flex flex-1 flex-col p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-border">
              {user.profileImageUrl ? (
                <Image
                  src={user.profileImageUrl}
                  alt={user.firstName || "Provider"}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm font-bold text-primary">{user.firstName?.[0]}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold truncate">
                  {provider.companyName || `${user.firstName} ${user.lastName}`}
                </p>
                {provider.verificationStatus === "verified" && (
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

          <h3 className="font-semibold text-base leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {service.titleEn}
          </h3>

          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
            <div className="w-5 h-5 rounded bg-muted flex items-center justify-center flex-shrink-0">
              <MapPin className="h-3 w-3" />
            </div>
            <span className="truncate">
              {service.location?.emirate || "UAE"}
              {service.location?.city && ` • ${service.location.city}`}
            </span>
          </div>

          <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
            <div>
              <span className="text-xl font-bold text-primary">
                AED {service.priceMin || "—"}
              </span>
              {service.pricingType === "hourly" && <span className="text-sm text-muted-foreground">/hr</span>}
              {service.pricingType === "custom" && service.priceMin && <span className="text-sm text-muted-foreground">+</span>}
            </div>
            <Button size="sm" className="h-9 px-5 rounded-lg font-medium">
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
