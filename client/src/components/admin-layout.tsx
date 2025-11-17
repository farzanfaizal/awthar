import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  Users,
  Shield,
  AlertCircle,
  FileText,
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
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/admin/dashboard" },
  { title: "Provider Verification", icon: Shield, url: "/admin/providers" },
  { title: "Service Moderation", icon: FileText, url: "/admin/services" },
  { title: "Complaints", icon: AlertCircle, url: "/admin/complaints" },
  { title: "User Management", icon: Users, url: "/admin/users" },
  { title: "Settings", icon: Settings, url: "/admin/settings" },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const [location] = useLocation();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      window.location.href = "/";
    }
  }, [isLoading, isAuthenticated, isAdmin]);

  if (isLoading || !isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">
            {!isAuthenticated ? "Redirecting..." : !isAdmin ? "Access denied..." : "Loading..."}
          </p>
        </div>
      </div>
    );
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
                    <span className="font-bold text-xl">Awthar Admin</span>
                  </div>
                </Link>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={location === item.url}
                      >
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
            <h1 className="text-xl font-semibold">Admin Panel</h1>
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" className="rounded-lg">
                  View Site
                </Button>
              </Link>
              <ThemeToggle />
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
