import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ReviewDialogProps {
  bookingId: string;
  providerId: string;
  serviceId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReviewDialog({ bookingId, providerId, open, onOpenChange }: ReviewDialogProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const reviewMutation = useMutation({
    mutationFn: async (data: { bookingId: string; providerId: string; rating: number; comment: string }) => {
      const res = await apiRequest("POST", "/api/reviews", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to submit review");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/reviews/provider/${providerId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/auth/providers/${providerId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] }); // To potentially update booking UI state if we track "isReviewed"
      
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      });
      onOpenChange(false);
      setRating(0);
      setComment("");
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a star rating.",
        variant: "destructive",
      });
      return;
    }

    reviewMutation.mutate({
      bookingId,
      providerId,
      rating,
      comment,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate your Experience</DialogTitle>
          <DialogDescription>
            How was the service? Your feedback helps others find great providers.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-6 py-4">
          <div className="flex flex-col items-center gap-2">
            <Label>Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={cn(
                    "p-1 rounded-full hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary",
                    rating >= star ? "text-yellow-400" : "text-muted-foreground/30"
                  )}
                  onClick={() => setRating(star)}
                >
                  <Star className={cn("w-8 h-8", rating >= star && "fill-yellow-400")} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comment (Optional)</Label>
            <Textarea
              id="comment"
              placeholder="Share details about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="resize-none min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={reviewMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={reviewMutation.isPending}>
            {reviewMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Submit Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
