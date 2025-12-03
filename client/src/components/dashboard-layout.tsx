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
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  SidebarTrigger, // Imported SidebarTrigger
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

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, isProvider } = useAuth();
  const [location] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = "/api/login";
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

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
                    <img src="/awthar.png" alt="Awthar Logo" className="w-8 h-8 object-contain" />
                    <span className="font-bold text-xl">Awthar</span>
                  </div>
                </Link>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={location === item.url}>
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
          <header className="flex items-center justify-between h-16 px-4 md:px-6 border-b bg-background">
            <div className="flex items-center gap-4">
              <SidebarTrigger /> {/* Added SidebarTrigger */}
              <h1 className="text-xl font-semibold hidden md:block">Provider Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" className="rounded-lg">
                  View Marketplace
                </Button>
              </Link>
              <ThemeToggle />
            </div>
          </header>

          <main className="flex-1 overflow-auto p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
