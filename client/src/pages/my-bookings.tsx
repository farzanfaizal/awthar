import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Booking, Service, User, ProviderProfile } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MessageSquare, Calendar as CalendarIcon, MapPin, XCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

type BookingWithRelations = Booking & {
  service: Service;
  customer: User;
  provider: ProviderProfile & { user: User };
};

export default function MyBookingsPage() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: bookings, isLoading } = useQuery<BookingWithRelations[]>({
    queryKey: ["/api/bookings", { role: "customer" }],
    queryFn: () => apiRequest("GET", "/api/bookings?role=customer").then(res => res.json())
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("PATCH", `/api/bookings/${id}/status`, { status: "cancelled" });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({ title: "Booking Cancelled", description: "Your booking has been cancelled." });
    },
    onError: (error: Error) => {
      toast({ title: "Cancellation Failed", description: error.message, variant: "destructive" });
    }
  });

  const messageMutation = useMutation({
    mutationFn: async (data: { providerId: string; serviceId: string }) => {
      const res = await apiRequest("POST", "/api/conversations", data);
      return res.json();
    },
    onSuccess: (conversation) => {
      // Redirect to messages page with conversation ID
      // Note: MessagesPage needs to be updated to handle URL params to auto-select this
      setLocation(`/messages?conversationId=${conversation.id}`);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to start chat", description: error.message, variant: "destructive" });
    }
  });

  const filteredBookings = bookings?.filter(booking => {
    if (activeTab === "all") return true;
    if (activeTab === "upcoming") return ["pending", "accepted", "in_progress"].includes(booking.status);
    if (activeTab === "completed") return booking.status === "completed";
    if (activeTab === "cancelled") return booking.status === "cancelled";
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-md grid-cols-4 mb-8">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="completed">History</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>

            <div className="flex flex-col gap-6">
              {filteredBookings?.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed rounded-xl">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
                  <p className="text-muted-foreground mb-6">You haven't made any bookings yet.</p>
                  <Link href="/browse">
                    <Button>Browse Services</Button>
                  </Link>
                </div>
              ) : (
                filteredBookings?.map((booking) => (
                  <Card key={booking.id} className="overflow-hidden hover:shadow-md transition-shadow border-muted-foreground/20">
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Image */}
                        <div className="w-full md:w-48 h-32 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                          {booking.service.images?.[0] ? (
                             <img src={booking.service.images[0]} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-xl mb-1">
                                <Link href={`/service/${booking.serviceId}`} className="hover:underline">
                                  {booking.service.titleEn}
                                </Link>
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Avatar className="w-5 h-5">
                                  <AvatarImage src={booking.provider.user.profileImageUrl || undefined} />
                                  <AvatarFallback className="text-[10px]">{booking.provider.user.firstName?.[0]}</AvatarFallback>
                                </Avatar>
                                <Link href={`/provider/${booking.providerId}`} className="hover:underline">
                                  {booking.provider.companyName || `${booking.provider.user.firstName} ${booking.provider.user.lastName}`}
                                </Link>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge
                                variant={
                                  booking.status === "completed" ? "default" :
                                  booking.status === "cancelled" ? "destructive" :
                                  booking.status === "accepted" ? "secondary" :
                                  booking.status === "in_progress" ? "secondary" : "outline"
                                }
                                className="capitalize mb-1"
                              >
                                {booking.status.replace("_", " ")}
                              </Badge>
                              <div className="text-lg font-bold text-primary">
                                AED {booking.agreedPrice}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">
                                {booking.scheduledDate ? format(new Date(booking.scheduledDate), "PPP 'at' p") : "Date not set"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <span>
                                {booking.service.location?.emirate || "Location not specified"}
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => messageMutation.mutate({ 
                                providerId: booking.providerId, 
                                serviceId: booking.serviceId 
                              })}
                              disabled={messageMutation.isPending}
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Message Provider
                            </Button>
                            
                            {["pending", "accepted"].includes(booking.status) && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                  if (confirm("Are you sure you want to cancel this booking?")) {
                                    cancelMutation.mutate(booking.id);
                                  }
                                }}
                                disabled={cancelMutation.isPending}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Cancel Booking
                              </Button>
                            )}

                            {booking.status === "completed" && (
                              <Button size="sm">
                                Leave Review
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </Tabs>
        )}
      </main>
      <Footer />
    </div>
  );
}
