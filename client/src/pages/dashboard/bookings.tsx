import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Booking, Service, User, ProviderProfile } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle, Clock, MessageSquare, Calendar as CalendarIcon, Search, MoreHorizontal } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { EmptyState } from "@/components/ui/empty-state";
import { BookingCardSkeleton } from "@/components/skeletons";
import { Link } from "wouter";

type BookingWithRelations = Booking & {
  service: Service;
  customer: User;
  provider: ProviderProfile & { user: User };
};

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
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
    // Search Filter
    const matchesSearch = 
      booking.customer.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customer.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.service.titleEn.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Tab Filter
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
        <div className="space-y-4">
          <div className="h-10 w-48 bg-muted animate-pulse rounded-md mb-8" />
          <div className="flex gap-2 mb-8">
             <div className="h-10 w-24 bg-muted animate-pulse rounded-lg" />
             <div className="h-10 w-24 bg-muted animate-pulse rounded-lg" />
             <div className="h-10 w-24 bg-muted animate-pulse rounded-lg" />
          </div>
          <BookingCardSkeleton />
          <BookingCardSkeleton />
          <BookingCardSkeleton />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Manage Bookings</h2>
          <p className="text-muted-foreground mt-1">Review and manage your incoming service requests and active jobs.</p>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
            <TabsList className="bg-muted/50 p-1 rounded-xl border w-full md:w-auto">
              <TabsTrigger value="all" className="rounded-lg px-4">All</TabsTrigger>
              <TabsTrigger value="pending" className="rounded-lg px-4">Pending</TabsTrigger>
              <TabsTrigger value="upcoming" className="rounded-lg px-4">Active</TabsTrigger>
              <TabsTrigger value="completed" className="rounded-lg px-4">Completed</TabsTrigger>
              <TabsTrigger value="cancelled" className="rounded-lg px-4">Cancelled</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search customers or services..." 
              className="pl-9 h-10 rounded-xl bg-background border-muted-foreground/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4">
          {filteredBookings?.length === 0 ? (
            <EmptyState
              icon={CalendarIcon}
              title="No bookings found"
              description={searchQuery ? `No results for "${searchQuery}" in this category.` : "You don't have any bookings in this category yet."}
              action={searchQuery ? <Button variant="outline" onClick={() => setSearchQuery("")}>Clear Search</Button> : null}
            />
          ) : (
            filteredBookings?.map((booking) => (
              <Card key={booking.id} className="overflow-hidden border-none shadow-sm ring-1 ring-border/50 hover:shadow-md transition-all">
                <div className="p-5 md:p-6">
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

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="space-y-1">
                          <h3 className="font-bold text-lg leading-none hover:text-primary transition-colors cursor-pointer truncate">
                            {booking.service.titleEn}
                          </h3>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 py-1 px-2 rounded-full bg-muted/50 border border-border/50">
                                <Avatar className="w-4 h-4">
                                    <AvatarImage src={booking.customer.profileImageUrl || undefined} />
                                    <AvatarFallback className="text-[8px] font-bold">{booking.customer.firstName?.[0]}</AvatarFallback>
                                </Avatar>
                                <span className="text-xs font-semibold text-foreground">
                                    {booking.customer.firstName} {booking.customer.lastName}
                                </span>
                            </div>
                            <span className="text-xs text-muted-foreground font-medium">Order #{booking.id.substring(0, 8).toUpperCase()}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                            <Badge
                                variant="outline"
                                className={cn(
                                    "capitalize font-bold border-none px-3 py-1 rounded-full",
                                    booking.status === "completed" && "bg-green-100 text-green-700",
                                    booking.status === "cancelled" && "bg-red-100 text-red-700",
                                    booking.status === "pending" && "bg-orange-100 text-orange-700",
                                    booking.status === "accepted" && "bg-blue-100 text-blue-700",
                                    booking.status === "in_progress" && "bg-indigo-100 text-indigo-700",
                                )}
                            >
                                {booking.status.replace("_", " ")}
                            </Badge>
                            <span className="text-lg font-extrabold text-primary">AED {booking.agreedPrice}</span>
                        </div>
                      </div>

                      {booking.notes && (
                        <div className="bg-muted/30 p-4 rounded-xl border border-border/50 text-sm text-muted-foreground mt-4 italic">
                          "{booking.notes}"
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-4 mt-6 pt-4 border-t border-border/50">
                        <div className="flex items-center gap-4">
                             <Link href={`/messages?conversationId=auto&customerId=${booking.customerId}&serviceId=${booking.serviceId}`}>
                                <Button variant="ghost" size="sm" className="h-9 px-4 rounded-lg font-semibold text-muted-foreground hover:text-primary">
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Chat
                                </Button>
                             </Link>
                        </div>

                        <div className="flex items-center gap-2">
                            {booking.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-9 px-4 rounded-lg font-bold text-destructive border-destructive/20 hover:bg-destructive/5"
                                  onClick={() => updateStatusMutation.mutate({ id: booking.id, status: "cancelled" })}
                                  disabled={updateStatusMutation.isPending}
                                >
                                  Reject
                                </Button>
                                <Button
                                  size="sm"
                                  className="h-9 px-6 rounded-lg font-bold shadow-md shadow-primary/20"
                                  onClick={() => updateStatusMutation.mutate({ id: booking.id, status: "accepted" })}
                                  disabled={updateStatusMutation.isPending}
                                >
                                  Accept Order
                                </Button>
                              </>
                            )}

                            {booking.status === "accepted" && (
                              <Button
                                size="sm"
                                className="h-9 px-6 rounded-lg font-bold shadow-md shadow-primary/20"
                                onClick={() => updateStatusMutation.mutate({ id: booking.id, status: "in_progress" })}
                                disabled={updateStatusMutation.isPending}
                              >
                                <Clock className="w-4 h-4 mr-2" />
                                Mark as Started
                              </Button>
                            )}

                            {booking.status === "in_progress" && (
                              <Button
                                size="sm"
                                className="h-9 px-6 rounded-lg font-bold bg-green-600 hover:bg-green-700 shadow-md shadow-green-600/20"
                                onClick={() => updateStatusMutation.mutate({ id: booking.id, status: "completed" })}
                                disabled={updateStatusMutation.isPending}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Complete Job
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
      </div>
    </DashboardLayout>
  );
}