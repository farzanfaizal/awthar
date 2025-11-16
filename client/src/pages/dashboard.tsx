import { useEffect } from "react";
import { Link, useLocation, Redirect } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  ListPlus,
  MessageSquare,
  Calendar,
  BarChart3,
  Settings,
  Eye,
  MessageCircle,
  TrendingUp,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

const menuItems = [
  { title: "Overview", icon: LayoutDashboard, url: "/dashboard" },
  { title: "My Listings", icon: ListPlus, url: "/dashboard/listings" },
  { title: "Messages", icon: MessageSquare, url: "/dashboard/messages" },
  { title: "Bookings", icon: Calendar, url: "/dashboard/bookings" },
  { title: "Analytics", icon: BarChart3, url: "/dashboard/analytics" },
  { title: "Settings", icon: Settings, url: "/dashboard/settings" },
];

export default function Dashboard() {
  const { isAuthenticated, isLoading, isProvider } = useAuth();
  const [location] = useLocation();

  useEffect(() => {
    // Redirect unauthenticated users to login
    if (!isLoading && !isAuthenticated) {
      window.location.href = "/login";
    }
  }, [isLoading, isAuthenticated]);

  // Show loading during auth check or while redirecting
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="dashboard-loading">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">
            {!isAuthenticated ? "Redirecting to login..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  // Redirect non-providers to home
  if (!isProvider) {
    return <Redirect to="/" />;
  }

  const sidebarStyle = {
    "--sidebar-width": "16rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="px-4 py-6">
                <Link href="/">
                  <div className="flex items-center gap-2 cursor-pointer hover-elevate active-elevate-2 rounded-lg p-2 -mx-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                      A
                    </div>
                    <span className="font-bold text-xl">Awthar</span>
                  </div>
                </Link>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={location === item.url} data-testid={`nav-${item.title.toLowerCase().replace(' ', '-')}`}>
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between h-16 px-6 border-b bg-background">
            <h1 className="text-xl font-semibold">Provider Dashboard</h1>
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" className="rounded-lg" data-testid="button-view-marketplace">
                  View Marketplace
                </Button>
              </Link>
              <ThemeToggle />
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="rounded-xl">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">2,547</div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3 text-success" />
                      <span className="text-success">+12%</span> from last month
                    </p>
                  </CardContent>
                </Card>

                <Card className="rounded-xl">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">Contact Requests</CardTitle>
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">184</div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3 text-success" />
                      <span className="text-success">+8%</span> from last month
                    </p>
                  </CardContent>
                </Card>

                <Card className="rounded-xl">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
                    <ListPlus className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Out of 15 total listings
                    </p>
                  </CardContent>
                </Card>

                <Card className="rounded-xl">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                    <Award className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">4.8</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Based on 127 reviews
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/dashboard/listings/new">
                      <Button className="w-full h-auto py-6 rounded-xl hover-elevate active-elevate-2 flex flex-col gap-2" data-testid="button-create-listing">
                        <ListPlus className="h-6 w-6" />
                        <span>Create New Listing</span>
                      </Button>
                    </Link>
                    <Link href="/dashboard/messages">
                      <Button variant="outline" className="w-full h-auto py-6 rounded-xl hover-elevate active-elevate-2 flex flex-col gap-2" data-testid="button-view-messages">
                        <MessageSquare className="h-6 w-6" />
                        <span>View Messages</span>
                      </Button>
                    </Link>
                    <Link href="/dashboard/analytics">
                      <Button variant="outline" className="w-full h-auto py-6 rounded-xl hover-elevate active-elevate-2 flex flex-col gap-2" data-testid="button-view-analytics">
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
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 rounded-lg hover-elevate cursor-pointer" data-testid={`message-item-${i + 1}`}>
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
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
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
