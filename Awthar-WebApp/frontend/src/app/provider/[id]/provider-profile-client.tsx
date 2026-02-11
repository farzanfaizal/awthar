"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ServiceCard } from "@/components/service-card";
import { ReviewsList } from "@/components/reviews-list";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiPost } from "@/lib/api";
import type { ProviderProfile, User, ServiceWithProvider, ReviewWithCustomer } from "@/types";
import {
  Star, MapPin, CheckCircle, Clock, Briefcase, Calendar,
  MessageCircle, Globe, Flag, BadgeCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProviderProfileClientProps {
  provider: ProviderProfile & { user: User };
  services: ServiceWithProvider[];
  reviews: ReviewWithCustomer[];
}

export function ProviderProfileClient({ provider, services, reviews }: ProviderProfileClientProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isMessageLoading, setIsMessageLoading] = useState(false);

  const user = provider.user;
  const name = provider.companyName || `${user.firstName} ${user.lastName}`;
  const rating = parseFloat(provider.rating || "0");

  const handleMessage = async () => {
    if (!isAuthenticated) { router.push("/login"); return; }
    setIsMessageLoading(true);
    try {
      const conversation = await apiPost<{ id: string }>("/api/conversations", { providerId: provider.id });
      router.push(`/messages?conversation=${conversation.id}`);
    } catch {
      toast({ title: "Failed to start conversation", variant: "destructive" });
    } finally {
      setIsMessageLoading(false);
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
        <span className="text-foreground">{name}</span>
      </nav>

      {/* Profile Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-8 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
            <AvatarImage src={user.profileImageUrl || undefined} />
            <AvatarFallback className="text-2xl">{user.firstName?.[0]}{user.lastName?.[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl md:text-3xl font-bold">{name}</h1>
              {provider.verificationStatus === "verified" && <BadgeCheck className="h-6 w-6 text-primary" />}
              {provider.isPremium && <Badge variant="default">Premium</Badge>}
            </div>
            <p className="text-muted-foreground mb-3">
              {provider.providerType === "licensed_professional" ? "Licensed Professional" : "Freelancer"}
            </p>
            <div className="flex items-center gap-4 text-sm flex-wrap">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{rating.toFixed(1)}</span>
                <span className="text-muted-foreground">({provider.totalReviews} reviews)</span>
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Member since {new Date(provider.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              </span>
            </div>
          </div>
          <Button onClick={handleMessage} disabled={isMessageLoading} size="lg">
            <MessageCircle className="mr-2 h-4 w-4" />
            {isMessageLoading ? "Starting..." : "Contact"}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Rating", value: rating.toFixed(1), icon: Star },
          { label: "Jobs Done", value: String(provider.completedJobs), icon: Briefcase },
          { label: "Reviews", value: String(provider.totalReviews), icon: CheckCircle },
          { label: "Response", value: provider.responseTime ? `${provider.responseTime}h` : "-", icon: Clock },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 text-center">
              <stat.icon className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* About */}
          {provider.bio && (
            <section>
              <h2 className="text-xl font-semibold mb-4">About</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">{provider.bio}</p>
            </section>
          )}

          {/* Services */}
          {services.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Services ({services.length})</h2>
                {services.length > 4 && (
                  <Link href={`/browse?providerId=${provider.id}`} className="text-sm text-primary hover:underline">View all</Link>
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {services.slice(0, 4).map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            </section>
          )}

          {/* Reviews */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Reviews ({reviews.length})</h2>
            <ReviewsList providerId={provider.id} reviews={reviews} />
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <Button className="w-full" onClick={handleMessage} disabled={isMessageLoading}>
                <MessageCircle className="mr-2 h-4 w-4" />
                Contact Provider
              </Button>

              <Separator />

              {provider.languages && provider.languages.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2"><Globe className="h-4 w-4" />Languages</h4>
                  <div className="flex flex-wrap gap-2">
                    {provider.languages.map((lang) => (
                      <Badge key={lang} variant="secondary">{lang}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {provider.serviceAreas?.emirates && provider.serviceAreas.emirates.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2"><MapPin className="h-4 w-4" />Service Areas</h4>
                  <div className="flex flex-wrap gap-2">
                    {provider.serviceAreas.emirates.map((area) => (
                      <Badge key={area} variant="outline">{area}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              <Button variant="ghost" size="sm" className="w-full text-muted-foreground">
                <Flag className="mr-2 h-4 w-4" />
                Report Provider
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
