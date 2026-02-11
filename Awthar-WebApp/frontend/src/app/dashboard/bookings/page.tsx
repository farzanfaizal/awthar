"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { DashboardLayout } from "@/components/dashboard-layout";
import { BookingCardSkeleton } from "@/components/skeletons";
import { getQueryFn } from "@/lib/query-client";
import { apiPatch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { BookingWithDetails } from "@/types";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, Clock, MessageSquare, Calendar, Search } from "lucide-react";

export default function ProviderBookingsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useQuery<BookingWithDetails[]>({
    queryKey: ["/api/bookings?role=provider"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiPatch(`/api/bookings/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({ title: "Status Updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    },
  });

  const filteredBookings = bookings?.filter((b) => {
    const matchesSearch = b.customer?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customer?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.service?.titleEn?.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === "all") return true;
    if (activeTab === "pending") return b.status === "pending";
    if (activeTab === "upcoming") return ["accepted", "in_progress"].includes(b.status);
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
      <DashboardLayout>
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">Manage Bookings</h2>
          <BookingCardSkeleton /><BookingCardSkeleton /><BookingCardSkeleton />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-12">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manage Bookings</h2>
          <p className="text-muted-foreground mt-1">Review and manage your incoming service requests.</p>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-muted/50 p-1 rounded-xl border">
              <TabsTrigger value="all" className="rounded-lg px-4">All</TabsTrigger>
              <TabsTrigger value="pending" className="rounded-lg px-4">Pending</TabsTrigger>
              <TabsTrigger value="upcoming" className="rounded-lg px-4">Active</TabsTrigger>
              <TabsTrigger value="completed" className="rounded-lg px-4">Completed</TabsTrigger>
              <TabsTrigger value="cancelled" className="rounded-lg px-4">Cancelled</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search customers or services..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>

        <div className="grid gap-4">
          {(!filteredBookings || filteredBookings.length === 0) ? (
            <div className="text-center py-16">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No bookings found</h3>
              <p className="text-muted-foreground">{searchQuery ? `No results for "${searchQuery}"` : "No bookings in this category yet."}</p>
              {searchQuery && <Button variant="outline" className="mt-4" onClick={() => setSearchQuery("")}>Clear Search</Button>}
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden hover:shadow-md transition-all">
                <div className="p-5 md:p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0 flex flex-col items-center justify-center w-20 h-20 bg-primary/5 rounded-2xl border border-primary/10">
                      <span className="text-[10px] uppercase font-bold text-primary tracking-widest">{booking.scheduledDate && format(new Date(booking.scheduledDate), "MMM")}</span>
                      <span className="text-2xl font-black">{booking.scheduledDate && format(new Date(booking.scheduledDate), "dd")}</span>
                      <span className="text-[10px] font-bold text-muted-foreground">{booking.scheduledDate && format(new Date(booking.scheduledDate), "HH:mm")}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="space-y-1">
                          <h3 className="font-bold text-lg">{booking.service?.titleEn}</h3>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 py-1 px-2 rounded-full bg-muted/50 border border-border/50">
                              <Avatar className="w-4 h-4">
                                <AvatarImage src={booking.customer?.profileImageUrl || undefined} />
                                <AvatarFallback className="text-[8px] font-bold">{booking.customer?.firstName?.[0]}</AvatarFallback>
                              </Avatar>
                              <span className="text-xs font-semibold">{booking.customer?.firstName} {booking.customer?.lastName}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant="outline" className={cn("capitalize font-bold border-none px-3 py-1 rounded-full", statusColor[booking.status])}>
                            {booking.status.replace("_", " ")}
                          </Badge>
                          {booking.agreedPrice && <span className="text-lg font-extrabold text-primary">AED {booking.agreedPrice}</span>}
                        </div>
                      </div>

                      {booking.notes && (
                        <div className="bg-muted/30 p-4 rounded-xl border text-sm text-muted-foreground mt-4 italic">&quot;{booking.notes}&quot;</div>
                      )}

                      <div className="flex items-center justify-between gap-4 mt-6 pt-4 border-t border-border/50">
                        <Link href={`/messages?customerId=${booking.customerId}`}>
                          <Button variant="ghost" size="sm"><MessageSquare className="w-4 h-4 mr-2" />Chat</Button>
                        </Link>
                        <div className="flex items-center gap-2">
                          {booking.status === "pending" && (
                            <>
                              <Button size="sm" variant="outline" className="text-destructive" onClick={() => updateStatusMutation.mutate({ id: booking.id, status: "cancelled" })} disabled={updateStatusMutation.isPending}>Reject</Button>
                              <Button size="sm" onClick={() => updateStatusMutation.mutate({ id: booking.id, status: "accepted" })} disabled={updateStatusMutation.isPending}>Accept Order</Button>
                            </>
                          )}
                          {booking.status === "accepted" && (
                            <Button size="sm" onClick={() => updateStatusMutation.mutate({ id: booking.id, status: "in_progress" })} disabled={updateStatusMutation.isPending}>
                              <Clock className="w-4 h-4 mr-2" />Mark as Started
                            </Button>
                          )}
                          {booking.status === "in_progress" && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => updateStatusMutation.mutate({ id: booking.id, status: "completed" })} disabled={updateStatusMutation.isPending}>
                              <CheckCircle className="w-4 h-4 mr-2" />Complete Job
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
