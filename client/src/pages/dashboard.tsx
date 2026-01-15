import { Link } from "wouter";
import {
  ListPlus,
  MessageSquare,
  BarChart3,
  Eye,
  MessageCircle,
  TrendingUp,
  Award,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/dashboard-layout";

interface DashboardStats {
  profileViews: number;
  contactRequests: number;
  activeListings: number;
  totalListings: number;
  averageRating: number;
  reviewCount: number;
}

export default function Dashboard() {
  // Fetch dashboard stats
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/analytics/dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/analytics/dashboard", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      return res.json();
    },
  });
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 w-24 bg-muted animate-pulse rounded-md" />
              ) : (
                <div className="text-2xl font-bold">{stats?.profileViews.toLocaleString() || 0}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Total service views
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Contact Requests</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 w-24 bg-muted animate-pulse rounded-md" />
              ) : (
                <div className="text-2xl font-bold">{stats?.contactRequests || 0}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Total conversations
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
              <ListPlus className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 w-24 bg-muted animate-pulse rounded-md" />
              ) : (
                <div className="text-2xl font-bold">{stats?.activeListings || 0}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Out of {stats?.totalListings || 0} total listings
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 w-24 bg-muted animate-pulse rounded-md" />
              ) : (
                <div className="text-2xl font-bold">
                  {stats?.averageRating ? stats.averageRating.toFixed(1) : "N/A"}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Based on {stats?.reviewCount || 0} reviews
              </p>
            </CardContent>
          </Card>
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
                <Button className="w-full h-auto py-4 md:py-6 rounded-xl hover:shadow-lg active:shadow-md transition-all duration-300 flex flex-col gap-2" data-testid="button-create-listing">
                  <ListPlus className="h-6 w-6" />
                  <span>Create New Listing</span>
                </Button>
              </Link>
              <Link href="/dashboard/messages">
                <Button variant="outline" className="w-full h-auto py-4 md:py-6 rounded-xl hover:shadow-lg active:shadow-md transition-all duration-300 flex flex-col gap-2" data-testid="button-view-messages">
                  <MessageSquare className="h-6 w-6" />
                  <span>View Messages</span>
                </Button>
              </Link>
              <Link href="/dashboard/analytics">
                <Button variant="outline" className="w-full h-auto py-4 md:py-6 rounded-xl hover:shadow-lg active:shadow-md transition-all duration-300 flex flex-col gap-2" data-testid="button-view-analytics">
                  <BarChart3 className="h-6 w-6" />
                  <span>View Analytics</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle>Recent Messages</CardTitle>
              <CardDescription>Latest conversations with customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer" data-testid={`message-item-${i + 1}`}>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary flex-shrink-0">
                      {String.fromCharCode(65 + i)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-sm">Customer {i + 1}</h4>
                        <span className="text-xs text-muted-foreground">2h ago</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        Interested in your plumbing service. Can you provide a quote for...
                      </p>
                    </div>
                  </div>
                ))}
                <Link href="/dashboard/messages">
                  <Button variant="ghost" className="w-full rounded-lg" data-testid="button-view-all-messages">
                    View All Messages
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle>Performance Tips</CardTitle>
              <CardDescription>Improve your provider profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <h4 className="font-medium text-sm mb-1">Upload service photos</h4>
                    <p className="text-sm text-muted-foreground">Listings with photos get 3x more views</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <h4 className="font-medium text-sm mb-1">Respond within 1 hour</h4>
                    <p className="text-sm text-muted-foreground">Fast response times improve your ranking</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <h4 className="font-medium text-sm mb-1">Complete your profile</h4>
                    <p className="text-sm text-muted-foreground">Add certifications and work examples</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}