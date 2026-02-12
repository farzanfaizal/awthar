"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ListPlus, MessageSquare, BarChart3, Eye, MessageCircle, Award, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DashboardLayout } from "@/components/dashboard-layout";
import { getQueryFn } from "@/lib/query-client";

interface DashboardStats {
  profileViews: number;
  contactRequests: number;
  activeListings: number;
  totalListings: number;
  averageRating: number;
  reviewCount: number;
}

interface ConversationPreview {
  id: string;
  lastMessage?: string;
  lastMessageAt?: string;
  otherUser?: { firstName: string; lastName: string; profileImageUrl?: string };
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/analytics/dashboard"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: conversations } = useQuery<ConversationPreview[]>({
    queryKey: ["/api/conversations?role=provider"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const recentMessages = (conversations || []).slice(0, 4);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground mt-1">Overview of your provider account</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Profile Views", value: stats?.profileViews, icon: Eye, sub: "Total service views" },
            { label: "Contact Requests", value: stats?.contactRequests, icon: MessageCircle, sub: "Total conversations" },
            { label: "Active Listings", value: stats?.activeListings, icon: ListPlus, sub: `Out of ${stats?.totalListings || 0} total` },
            { label: "Average Rating", value: stats?.averageRating ? stats.averageRating.toFixed(1) : "N/A", icon: Award, sub: `Based on ${stats?.reviewCount || 0} reviews` },
          ].map((stat) => (
            <Card key={stat.label} className="rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-8 w-24 bg-muted animate-pulse rounded-md" />
                ) : (
                  <div className="text-2xl font-bold">{typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value || 0}</div>
                )}
                <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your provider account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link href="/dashboard/listings/new">
                <Button className="w-full h-auto py-4 md:py-6 rounded-xl flex flex-col gap-2">
                  <ListPlus className="h-6 w-6" /><span>Create New Listing</span>
                </Button>
              </Link>
              <Link href="/messages">
                <Button variant="outline" className="w-full h-auto py-4 md:py-6 rounded-xl flex flex-col gap-2">
                  <MessageSquare className="h-6 w-6" /><span>View Messages</span>
                </Button>
              </Link>
              <Link href="/dashboard/analytics">
                <Button variant="outline" className="w-full h-auto py-4 md:py-6 rounded-xl flex flex-col gap-2">
                  <BarChart3 className="h-6 w-6" /><span>View Analytics</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Messages */}
        {recentMessages.length > 0 && (
          <Card className="rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Messages</CardTitle>
                <CardDescription>Latest conversations</CardDescription>
              </div>
              <Link href="/messages">
                <Button variant="ghost" size="sm">View All<ArrowRight className="h-4 w-4 ml-1" /></Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentMessages.map((conv) => (
                  <Link key={conv.id} href={`/messages?conversation=${conv.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conv.otherUser?.profileImageUrl} />
                        <AvatarFallback>{conv.otherUser?.firstName?.[0] || "?"}{conv.otherUser?.lastName?.[0] || ""}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {conv.otherUser ? `${conv.otherUser.firstName} ${conv.otherUser.lastName}` : "Unknown User"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{conv.lastMessage || "No messages yet"}</p>
                      </div>
                      {conv.lastMessageAt && !isNaN(new Date(conv.lastMessageAt).getTime()) && (
                        <span className="text-xs text-muted-foreground shrink-0">
                          {new Date(conv.lastMessageAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle>Performance Tips</CardTitle>
            <CardDescription>Improve your provider profile</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: "Upload service photos", desc: "Listings with photos get 3x more views" },
                { title: "Respond within 1 hour", desc: "Fast response times improve your ranking" },
                { title: "Complete your profile", desc: "Add certifications and work examples" },
              ].map((tip) => (
                <div key={tip.title} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <h4 className="font-medium text-sm mb-1">{tip.title}</h4>
                    <p className="text-sm text-muted-foreground">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
