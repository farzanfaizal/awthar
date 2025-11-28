import { useQuery } from "@tanstack/react-query";
import { Review, User } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewsListProps {
  providerId: string;
  reviews?: (Review & { customer: User })[]; // Optional if passed directly, otherwise fetch
}

export function ReviewsList({ providerId, reviews: initialReviews }: ReviewsListProps) {
  const { data: fetchedReviews, isLoading } = useQuery<(Review & { customer: User })[]>({
    queryKey: [`/api/reviews/provider/${providerId}`],
    enabled: !initialReviews, // Only fetch if not passed
  });

  const reviews = initialReviews || fetchedReviews;

  if (isLoading && !reviews) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <Card className="bg-muted/50 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Star className="h-8 w-8 mb-2 opacity-50" />
          <p>No reviews yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review: Review & { customer: User }) => (
        <Card key={review.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={review.customer.profileImageUrl || undefined} />
                  <AvatarFallback>
                    {review.customer.firstName?.[0]}
                    {review.customer.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">
                    {review.customer.firstName} {review.customer.lastName}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    {review.isVerified && (
                      <Badge variant="secondary" className="h-5 text-[10px] px-1 gap-0.5">
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-4 w-4",
                      star <= review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="mt-3 text-sm leading-relaxed">
              <p>{review.comment}</p>
            </div>

            {review.response && (
              <div className="mt-3 ml-8 p-3 bg-muted rounded-md text-sm">
                <p className="font-semibold text-xs mb-1">Provider Response:</p>
                <p className="text-muted-foreground">{review.response}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
