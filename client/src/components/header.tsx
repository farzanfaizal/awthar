import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Search,
  Calendar,
  MessageCircle,
  LayoutDashboard,
  User,
  Settings,
  LogOut,
  Palette,
  Briefcase,
  Users,
  Building2,
  Home,
  Grid3X3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useAppMode } from "@/context/app-mode-context";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function Header() {
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth();
  const { mode, setMode, isCustomerMode, isProviderMode, userCanBeProvider, isAppModeLoading } = useAppMode();
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/logout", {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.clear();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      setLocation("/");
      window.location.href = "/";
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message || "Failed to log out. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setLocation(`/browse?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const currentModeLabel = mode === "customer" ? "Buying" : "Hosting";

  // Don't render until auth state is determined
  if (isAuthLoading || isAppModeLoading) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 h-16 flex items-center">
          <div className="h-8 w-24 bg-muted animate-pulse rounded" />
        </div>
      </header>
    );
  }

  // Mobile navigation items based on mode and auth state
  const getMobileNavItems = () => {
    if (isProviderMode && isAuthenticated) {
      return [
        { href: "/dashboard", icon: Home, label: "Home", active: location === "/dashboard" },
        { href: "/dashboard/listings", icon: Grid3X3, label: "Listings", active: location.startsWith("/dashboard/listings") },
        { href: "/dashboard/bookings", icon: Calendar, label: "Jobs", active: location === "/dashboard/bookings" },
        { href: "/messages", icon: MessageCircle, label: "Messages", active: location === "/messages" },
      ];
    }

    // Customer mode items
    const items = [
      { href: "/", icon: Home, label: "Home", active: location === "/" },
      { href: "/browse", icon: Search, label: "Browse", active: location === "/browse" },
    ];

    // Only show Bookings and Messages for authenticated users
    if (isAuthenticated) {
      items.push(
        { href: "/bookings", icon: Calendar, label: "Bookings", active: location === "/bookings" },
        { href: "/messages", icon: MessageCircle, label: "Messages", active: location === "/messages" }
      );
    }

    return items;
  };

  const mobileNavItems = getMobileNavItems();

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b",
        "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* LEFT: Logo */}
          <Link
            href={isProviderMode ? "/dashboard" : "/"}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0"
          >
            <img src="/awthar.png" alt="Awthar" className="w-8 h-8 object-contain" />
            <span className="font-bold text-xl hidden sm:inline">Awthar</span>
          </Link>

          {/* CENTER: Desktop Search Bar (Customer Mode) / Nav Links (Provider Mode) */}
          <div className="hidden md:flex flex-1 items-center justify-center px-4 lg:px-8 max-w-2xl mx-auto">
            {isCustomerMode && (
              <div className="flex w-full items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="search"
                    placeholder="Search for services..."
                    className="pl-10 h-10 rounded-full border-2 focus-visible:ring-2 focus-visible:ring-primary/20 bg-background w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <Button
                  size="icon"
                  className="h-10 w-10 rounded-full shrink-0"
                  onClick={handleSearch}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            )}
            {isProviderMode && isAuthenticated && (
              <nav className="flex items-center gap-1">
                <Button
                  variant={location === "/dashboard" ? "secondary" : "ghost"}
                  asChild
                  size="sm"
                  className="h-9"
                >
                  <Link href="/dashboard">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
                <Button
                  variant={location.startsWith("/dashboard/listings") ? "secondary" : "ghost"}
                  asChild
                  size="sm"
                  className="h-9"
                >
                  <Link href="/dashboard/listings">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Listings
                  </Link>
                </Button>
                <Button
                  variant={location === "/dashboard/bookings" ? "secondary" : "ghost"}
                  asChild
                  size="sm"
                  className="h-9"
                >
                  <Link href="/dashboard/bookings">
                    <Calendar className="h-4 w-4 mr-2" />
                    Jobs
                  </Link>
                </Button>
                <Button
                  variant={location === "/messages" ? "secondary" : "ghost"}
                  asChild
                  size="sm"
                  className="h-9"
                >
                  <Link href="/messages">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Messages
                  </Link>
                </Button>
              </nav>
            )}
          </div>

          {/* RIGHT: Mobile Nav Icons + Desktop Auth + Profile */}
          <div className="flex items-center gap-1">
            {/* Mobile Navigation Icons */}
            <nav className="flex md:hidden items-center">
              {mobileNavItems.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  size="icon"
                  asChild
                  className={cn(
                    "h-9 w-9 rounded-full transition-colors",
                    item.active && "bg-primary/10 text-primary"
                  )}
                >
                  <Link href={item.href}>
                    <item.icon className="h-5 w-5" />
                    <span className="sr-only">{item.label}</span>
                  </Link>
                </Button>
              ))}
            </nav>

            {/* Desktop Auth Buttons */}
            {!isAuthenticated && (
              <div className="hidden md:flex items-center gap-2 ml-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Log In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            )}

            {/* Profile Dropdown (all screens) */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full ml-1"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profileImageUrl || undefined} />
                      <AvatarFallback className="text-xs font-medium">
                        {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {/* Mode Switcher */}
                  {userCanBeProvider || user?.role === "provider" ? (
                    <>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Briefcase className="mr-2 h-4 w-4" />
                          <span>Mode: {currentModeLabel}</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem
                            onClick={() => setMode("customer")}
                            className={cn(isCustomerMode && "bg-accent")}
                          >
                            <Users className="mr-2 h-4 w-4" />
                            <span>Buying (Customer)</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setMode("provider")}
                            className={cn(isProviderMode && "bg-accent")}
                          >
                            <Building2 className="mr-2 h-4 w-4" />
                            <span>Hosting (Provider)</span>
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                      <DropdownMenuSeparator />
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem onClick={() => setLocation("/become-provider")}>
                        <Briefcase className="mr-2 h-4 w-4" />
                        <span>Become a Provider</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href={isProviderMode ? "/dashboard/settings" : "/profile"}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Palette className="mr-2 h-4 w-4" />
                      <span>Appearance</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <ThemeToggle />
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{logoutMutation.isPending ? "Logging out..." : "Log out"}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // Mobile: Login button for non-authenticated users
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="h-9 w-9 rounded-full md:hidden ml-1"
              >
                <Link href="/login">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Login</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
