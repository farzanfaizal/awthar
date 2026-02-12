"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { getQueryFn } from "@/lib/query-client";
import { apiDelete } from "@/lib/api";
import { ReviewDialog } from "@/components/review-dialog";
import { BookingCardSkeleton } from "@/components/skeletons";
import { useAuth } from "@/hooks/useAuth";
import type { BookingWithDetails } from "@/types";
import { cn } from "@/lib/utils";
import { Calendar, Star, XCircle, MessageSquare } from "lucide-react";

export default function BookingsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [reviewBooking, setReviewBooking] = useState<BookingWithDetails | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthLoading && !user) router.push("/login");
  }, [isAuthLoading, user, router]);

  const { data: bookings, isLoading } = useQuery<BookingWithDetails[]>({
    queryKey: ["/api/bookings?role=customer"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/api/bookings/${id}`),
    onSuccess: (_data, cancelledId) => {
      // Optimistically update the cache so the UI reflects the cancellation instantly
      queryClient.setQueryData<BookingWithDetails[]>(
        ["/api/bookings?role=customer"],
        (old) => old?.map((b) => b.id === cancelledId ? { ...b, status: "cancelled" } : b),
      );
      toast({ title: "Booking Cancelled", description: "Your booking has been cancelled." });
    },
    onError: (error: Error) => {
      // Refetch to restore correct state on failure
      queryClient.invalidateQueries({ queryKey: ["/api/bookings?role=customer"] });
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    },
  });

  const filteredBookings = bookings?.filter((b) => {
    if (activeTab === "all") return true;
    if (activeTab === "upcoming") return ["pending", "accepted"].includes(b.status);
    if (activeTab === "active") return b.status === "in_progress";
    if (activeTab === "completed") return b.status === "completed";
    if (activeTab === "cancelled") return b.status === "cancelled";
    return true;
  });

  const statusColor: Record<string, string> = {
    pending: "bg-orange-100 text-orange-700",
    accepted: "bg-blue-100 text-blue-700",
    in_progress: "bg-indigo-100 text-indigo-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        <h1 className="text-3xl font-bold mb-8">My Bookings</h1>
        <BookingCardSkeleton />
        <BookingCardSkeleton />
        <BookingCardSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
      <p className="text-muted-foreground mb-8">Track and manage your service bookings</p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      {(!filteredBookings || filteredBookings.length === 0) ? (
        <div className="text-center py-16">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No bookings found</h3>
          <p className="text-muted-foreground mb-4">You don&apos;t have any bookings in this category yet.</p>
          <Button asChild><Link href="/browse">Browse Services</Link></Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="overflow-hidden hover:shadow-md transition-all">
              <CardContent className="p-5 md:p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Date Block */}
                  <div className="flex-shrink-0 flex flex-col items-center justify-center w-20 h-20 bg-primary/5 rounded-2xl border border-primary/10">
                    <span className="text-[10px] uppercase font-bold text-primary tracking-widest">
                      {booking.scheduledDate && format(new Date(booking.scheduledDate), "MMM")}
                    </span>
                    <span className="text-2xl font-black text-foreground">
                      {booking.scheduledDate && format(new Date(booking.scheduledDate), "dd")}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground">
                      {booking.scheduledDate && format(new Date(booking.scheduledDate), "HH:mm")}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg">{booking.service?.titleEn || "Service"}</h3>
                        {booking.provider && (
                          <div className="flex items-center gap-2 mt-1">
                            <Avatar className="w-5 h-5">
                              <AvatarImage src={booking.provider.user?.profileImageUrl || undefined} />
                              <AvatarFallback className="text-[8px]">{booking.provider.user?.firstName?.[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground">
                              {booking.provider.companyName || `${booking.provider.user?.firstName} ${booking.provider.user?.lastName}`}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="outline" className={cn("capitalize font-bold border-none px-3 py-1 rounded-full", statusColor[booking.status])}>
                          {booking.status.replace("_", " ")}
                        </Badge>
                        {booking.agreedPrice && <span className="text-lg font-extrabold text-primary">AED {booking.agreedPrice}</span>}
                      </div>
                    </div>

                    {booking.notes && (
                      <div className="bg-muted/30 p-3 rounded-xl border text-sm text-muted-foreground italic mb-4">
                        &quot;{booking.notes}&quot;
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-4 pt-4 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        {booking.provider && (
                          <Link href={`/messages?providerId=${booking.provider.id}`}>
                            <Button variant="ghost" size="sm"><MessageSquare className="w-4 h-4 mr-2" />Chat</Button>
                          </Link>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {booking.status === "completed" && (
                          <Button size="sm" variant="outline" onClick={() => setReviewBooking(booking)}>
                            <Star className="w-4 h-4 mr-2" />Leave Review
                          </Button>
                        )}
                        {["pending", "accepted"].includes(booking.status) && (
                          <Button size="sm" variant="outline" className="text-destructive" onClick={() => cancelMutation.mutate(booking.id)} disabled={cancelMutation.isPending}>
                            <XCircle className="w-4 h-4 mr-2" />Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {reviewBooking && (
        <ReviewDialog bookingId={reviewBooking.id} providerId={reviewBooking.providerId} open={!!reviewBooking} onOpenChange={(open) => !open && setReviewBooking(null)} />
      )}
    </div>
  );
}
