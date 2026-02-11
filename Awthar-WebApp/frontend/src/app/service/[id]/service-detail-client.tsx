"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ImageGallery } from "@/components/image-gallery";
import { ReviewsList } from "@/components/reviews-list";
import { ProviderCard } from "@/components/provider-card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiPost } from "@/lib/api";
import type { ServiceWithProvider, ReviewWithCustomer } from "@/types";
import {
  Star, MapPin, Eye, Clock, Share2, Heart, Flag, BadgeCheck,
  Briefcase, CheckCircle, Phone, MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceDetailClientProps {
  service: ServiceWithProvider;
  reviews: ReviewWithCustomer[];
}

export function ServiceDetailClient({ service, reviews }: ServiceDetailClientProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isMessageLoading, setIsMessageLoading] = useState(false);

  const provider = service.provider;
  const providerUser = provider.user;
  const rating = parseFloat(provider.rating || "0");

  const handleMessage = async () => {
    if (!isAuthenticated) { router.push("/login"); return; }
    setIsMessageLoading(true);
    try {
      const conversation = await apiPost<{ id: string }>("/api/conversations", {
        providerId: provider.id,
        serviceId: service.id,
      });
      router.push(`/messages?conversation=${conversation.id}`);
    } catch {
      toast({ title: "Failed to start conversation", variant: "destructive" });
    } finally {
      setIsMessageLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({ title: service.titleEn, url: window.location.href });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied to clipboard!" });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/browse" className="hover:text-foreground">Services</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground line-clamp-1">{service.titleEn}</span>
      </nav>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <ImageGallery images={service.images} />

          {/* Title & Meta */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">{service.titleEn}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                  {service.location?.emirate && (
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{service.location.emirate}{service.location.city && `, ${service.location.city}`}</span>
                  )}
                  <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{service.viewCount} views</span>
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{new Date(service.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button variant="ghost" size="icon" onClick={handleShare}><Share2 className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon"><Heart className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon"><Flag className="h-4 w-4" /></Button>
              </div>
            </div>

            {/* Price */}
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">AED {service.priceMin || "—"}</span>
              {service.pricingType === "hourly" && <span className="text-muted-foreground">/hour</span>}
              {service.pricingType === "custom" && <span className="text-muted-foreground">starting</span>}
              {service.priceMax && service.priceMax !== service.priceMin && (
                <span className="text-muted-foreground">- AED {service.priceMax}</span>
              )}
            </div>
          </div>

          <Separator />

          {/* Tabs */}
          <Tabs defaultValue="about">
            <TabsList>
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="about" className="space-y-6 mt-4">
              <div className="prose dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{service.descriptionEn}</p>
              </div>

              {/* Tags */}
              {service.tags && service.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {service.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Methods */}
              {service.paymentMethods && service.paymentMethods.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Payment Methods</h3>
                  <div className="flex flex-wrap gap-2">
                    {service.paymentMethods.map((method) => (
                      <Badge key={method} variant="outline">{method}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
            <TabsContent value="reviews" className="mt-4">
              <ReviewsList providerId={provider.id} reviews={reviews} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Provider Card */}
          <ProviderCard provider={provider} onMessage={handleMessage} isMessageLoading={isMessageLoading} />

          {/* Provider Credentials */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", provider.verificationStatus === "verified" ? "bg-green-100 dark:bg-green-900/30" : "bg-muted")}>
                  <BadgeCheck className={cn("h-5 w-5", provider.verificationStatus === "verified" ? "text-green-600" : "text-muted-foreground")} />
                </div>
                <div>
                  <p className="text-sm font-medium">{provider.verificationStatus === "verified" ? "Verified Provider" : "Unverified"}</p>
                  <p className="text-xs text-muted-foreground">Identity confirmed</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">{provider.completedJobs} Jobs Done</p>
                  <p className="text-xs text-muted-foreground">Completed successfully</p>
                </div>
              </div>
              {provider.responseTime && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{provider.responseTime}h Response</p>
                      <p className="text-xs text-muted-foreground">Average response time</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-0 inset-x-0 p-4 bg-background border-t lg:hidden z-40">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <span className="text-xl font-bold text-primary">AED {service.priceMin || "—"}</span>
            {service.pricingType === "hourly" && <span className="text-sm text-muted-foreground">/hr</span>}
          </div>
          <Button onClick={handleMessage} disabled={isMessageLoading}>
            <MessageCircle className="mr-2 h-4 w-4" />
            {isMessageLoading ? "Starting..." : "Contact Provider"}
          </Button>
        </div>
      </div>
    </div>
  );
}
