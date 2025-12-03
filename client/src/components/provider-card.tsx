import { Link } from "wouter";
import { User, ProviderProfile } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, MessageCircle, CheckCircle, Clock, Briefcase, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProviderCardProps {
  provider: ProviderProfile & { user: User };
  onMessage?: () => void;
  isMessageLoading?: boolean;
}

export function ProviderCard({ provider, onMessage, isMessageLoading }: ProviderCardProps) {
  const rating = parseFloat(provider.rating || "0");

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Provider</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={provider.user.profileImageUrl || undefined} />
            <AvatarFallback>
              {provider.user.firstName?.[0]}
              {provider.user.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-lg">
                {provider.companyName || `${provider.user.firstName} ${provider.user.lastName}`}
              </span>
              {provider.verificationStatus === "verified" && (
                <CheckCircle className="h-4 w-4 text-green-500" fill="none" />
              )}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="font-medium text-foreground">{rating.toFixed(1)}</span>
              <span>({provider.totalReviews})</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex flex-col items-center p-2 bg-muted rounded-lg">
            <span className="font-bold text-lg">{provider.completedJobs}</span>
            <span className="text-xs text-muted-foreground">Jobs</span>
          </div>
          <div className="flex flex-col items-center p-2 bg-muted rounded-lg">
            <span className="font-bold text-lg">
              {provider.responseTime ? `${provider.responseTime}h` : "-"}
            </span>
            <span className="text-xs text-muted-foreground">Response</span>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Briefcase className="h-4 w-4" />
            <span>
              {provider.providerType === "licensed_professional"
                ? "Professional"
                : "Freelancer"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Member since{" "}
              {new Date(provider.createdAt).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Link href={`/provider/${provider.id}`}>
            <Button variant="outline" className="w-full">
              View Profile
            </Button>
          </Link>
          {onMessage && (
            <Button className="w-full" onClick={onMessage} disabled={isMessageLoading}>
              <MessageCircle className="mr-2 h-4 w-4" />
              {isMessageLoading ? "Starting..." : "Message"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
