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
  MoonStar,
  Sun,
  Palette,
  Briefcase,
  Users,
  Building2,
  ChevronDown,
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
import { AppModeProvider, useAppMode } from "@/context/app-mode-context";
import { MobileNavTitle } from "@/components/layout/mobile-nav-title";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function Header() {
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth();
  const { mode, setMode, isCustomerMode, isProviderMode, userCanBeProvider, isAppModeLoading } = useAppMode();
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/logout", {});
      return res.json();
    },
    onSuccess: () => {
      // Clear all cached queries
      queryClient.clear();
      // Show success message
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      // Redirect to home page
      setLocation("/");
      // Force page reload to clear all state
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

  const currentModeLabel = mode === 'customer' ? 'Buying' : 'Hosting';

  if (isAuthLoading || isAppModeLoading) {
    return null; // Don't render header until auth and app mode are loaded
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b backdrop-blur-md",
        "bg-background/60 supports-[backdrop-filter]:bg-background/60" // Glassmorphism
      )}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* LEFT: Logo and Mobile Nav Title */}
        <div className="flex items-center gap-4">
          <div className="md:hidden">
            <MobileNavTitle />
          </div>

          {/* Logo - Desktop */}
          <Link href="/" className="hidden md:flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0" data-testid="link-home">
            <img src="/awthar.png" alt="Awthar Logo" className="w-8 h-8 object-contain" />
            <span className="font-bold text-xl">Awthar</span>
          </Link>
        </div>

        {/* CENTER: Desktop Navigation / Search Bar */}
        <div className="hidden md:flex flex-1 items-center justify-center px-8">
          {isCustomerMode && (
            <div className="relative w-full max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder="Search for services..."
                className="pl-10 pr-10 h-10 rounded-full border-2 focus-visible:ring-2 focus-visible:ring-primary/20 bg-background/80 w-full transition-all"
                data-testid="input-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button
                size="sm"
                variant="ghost"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-primary/10 rounded-full"
                onClick={handleSearch}
              >
                <Search className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
              </Button>
            </div>
          )}
          {isProviderMode && (
            <nav className="flex items-center gap-1">
              <Button variant="ghost" asChild className="hover:bg-primary/10 hover:text-primary">
                <Link href="/dashboard">
                  <LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard
                </Link>
              </Button>
              <Button variant="ghost" asChild className="hover:bg-primary/10 hover:text-primary">
                <Link href="/dashboard/listings">
                  <Briefcase className="h-4 w-4 mr-2" /> My Listings
                </Link>
              </Button>
              <Button variant="ghost" asChild className="hover:bg-primary/10 hover:text-primary">
                <Link href="/dashboard/bookings">
                  <Calendar className="h-4 w-4 mr-2" /> Client Jobs
                </Link>
              </Button>
              <Button variant="ghost" asChild className="hover:bg-primary/10 hover:text-primary">
                <Link href="/messages">
                  <MessageCircle className="h-4 w-4 mr-2" /> Messages
                </Link>
              </Button>
            </nav>
          )}
        </div>

        {/* RIGHT: Actions (Search + Profile) */}
        <div className="flex items-center gap-2">
          {/* Mobile Search Icon */}
          <div className="md:hidden">
              <Button size="icon" variant="ghost" asChild className="rounded-full">
                  <Link href="/browse">
                      <Search className="h-5 w-5" />
                  </Link>
              </Button>
          </div>

          {/* Profile Dropdown */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImageUrl || undefined} />
                    <AvatarFallback>
                      {user?.firstName?.[0] || user?.email?.[0] || "U"}
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

                {/* Mode Switcher / Become a Provider */}
                {userCanBeProvider ? (
                  <>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <Briefcase className="mr-2 h-4 w-4" />
                        <span>Mode: {currentModeLabel}</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => setMode('customer')} className={cn(isCustomerMode && "bg-accent")}>
                          <Users className="mr-2 h-4 w-4" />
                          <span>Buying (Customer)</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setMode('provider')} className={cn(isProviderMode && "bg-accent")}>
                          <Building2 className="mr-2 h-4 w-4" />
                          <span>Hosting (Provider)</span>
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuSeparator />
                  </>
                ) : (
                  // If not a provider, offer to become one
                  <DropdownMenuItem onClick={() => setLocation('/become-provider')}>
                    <Briefcase className="mr-2 h-4 w-4" />
                    <span>Become a Provider</span>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link href={isCustomerMode ? "/profile" : "/dashboard/settings"}>
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
                <DropdownMenuItem onClick={handleLogout} disabled={logoutMutation.isPending}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{logoutMutation.isPending ? "Logging out..." : "Log out"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild className="hidden md:flex">
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild className="hidden md:flex">
                <Link href="/signup">Sign Up</Link>
              </Button>
              {/* Mobile login/signup - perhaps just profile button directly to login */}
              <Button variant="ghost" size="icon" asChild className="md:hidden">
                <Link href="/login">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}