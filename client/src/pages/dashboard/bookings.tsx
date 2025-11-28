import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Booking, Service, User, ProviderProfile } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle, Clock, MessageSquare, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/components/dashboard-layout";

type BookingWithRelations = Booking & {
  service: Service;
  customer: User;
  provider: ProviderProfile & { user: User };
};

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useQuery<BookingWithRelations[]>({
    queryKey: ["/api/bookings", { role: "provider" }],
    queryFn: () => apiRequest("GET", "/api/bookings?role=provider").then(res => res.json())
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/bookings/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({ title: "Status Updated", description: "Booking status has been updated successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    }
  });

  const filteredBookings = bookings?.filter(booking => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return booking.status === "pending";
    if (activeTab === "upcoming") return ["accepted", "in_progress"].includes(booking.status);
    if (activeTab === "completed") return booking.status === "completed";
    if (activeTab === "cancelled") return booking.status === "cancelled";
    return true;
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Bookings</h2>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 lg:w-[600px]">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">History</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <div className="mt-6 space-y-4">
            {filteredBookings?.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <CalendarIcon className="w-12 h-12 mb-4 opacity-20" />
                  <p>No bookings found in this category.</p>
                </CardContent>
              </Card>
            ) : (
              filteredBookings?.map((booking) => (
                <Card key={booking.id} className="overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Date Badge */}
                      <div className="flex-shrink-0 flex flex-col items-center justify-center w-20 h-20 bg-muted rounded-lg border">
                        <span className="text-xs uppercase font-semibold text-muted-foreground">
                          {booking.scheduledDate && format(new Date(booking.scheduledDate), "MMM")}
                        </span>
                        <span className="text-2xl font-bold">
                          {booking.scheduledDate && format(new Date(booking.scheduledDate), "dd")}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {booking.scheduledDate && format(new Date(booking.scheduledDate), "HH:mm")}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg truncate">{booking.service.titleEn}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <Avatar className="w-5 h-5">
                                <AvatarImage src={booking.customer.profileImageUrl || undefined} />
                                <AvatarFallback className="text-[10px]">{booking.customer.firstName?.[0]}</AvatarFallback>
                              </Avatar>
                              <span>{booking.customer.firstName} {booking.customer.lastName}</span>
                            </div>
                          </div>
                          <Badge
                            variant={
                              booking.status === "completed" ? "default" :
                              booking.status === "cancelled" ? "destructive" :
                              booking.status === "accepted" ? "secondary" :
                              booking.status === "in_progress" ? "secondary" : "outline"
                            }
                            className="capitalize"
                          >
                            {booking.status.replace("_", " ")}
                          </Badge>
                        </div>

                        {booking.notes && (
                          <div className="bg-muted/50 p-3 rounded-md text-sm text-muted-foreground mt-3 mb-3">
                            <span className="font-semibold text-xs uppercase block mb-1">Customer Notes:</span>
                            {booking.notes}
                          </div>
                        )}

                        <div className="flex items-center gap-4 mt-4">
                          <div className="text-sm font-medium">
                            AED {booking.agreedPrice}
                          </div>
                          
                          <div className="flex-1" />

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Message
                            </Button>

                            {booking.status === "pending" && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="default"
                                  onClick={() => updateStatusMutation.mutate({ id: booking.id, status: "accepted" })}
                                  disabled={updateStatusMutation.isPending}
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Accept
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => updateStatusMutation.mutate({ id: booking.id, status: "cancelled" })}
                                  disabled={updateStatusMutation.isPending}
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Reject
                                </Button>
                              </>
                            )}

                            {booking.status === "accepted" && (
                              <Button 
                                size="sm" 
                                onClick={() => updateStatusMutation.mutate({ id: booking.id, status: "in_progress" })}
                                disabled={updateStatusMutation.isPending}
                              >
                                <Clock className="w-4 h-4 mr-2" />
                                Start Job
                              </Button>
                            )}

                            {booking.status === "in_progress" && (
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => updateStatusMutation.mutate({ id: booking.id, status: "completed" })}
                                disabled={updateStatusMutation.isPending}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Complete
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}