import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Search,
  Menu,
  X,
  User,
  LogOut,
  Palette,
  Briefcase,
  Users,
  Building2,
  Home,
  Grid3X3,
  Calendar,
  MessageCircle,
  LayoutDashboard,
  Settings,
  ChevronRight,
  HelpCircle,
  FileText,
  Phone,
  Info,
  Tag,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
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
import { Separator } from "@/components/ui/separator";

export function Header() {
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth();
  const { mode, setMode, isCustomerMode, isProviderMode, userCanBeProvider, isAppModeLoading } = useAppMode();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
    setIsDrawerOpen(false);
    logoutMutation.mutate();
  };

  const handleNavigation = (href: string) => {
    setIsDrawerOpen(false);
    setLocation(href);
  };

  const currentModeLabel = mode === "customer" ? "Buying" : "Hosting";

  // Loading state
  if (isAuthLoading || isAppModeLoading) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 h-16 flex items-center">
          <div className="h-8 w-24 bg-muted animate-pulse rounded" />
        </div>
      </header>
    );
  }

  // Desktop nav items
  const desktopNavItems = isProviderMode
    ? [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/dashboard/listings", label: "Listings", icon: Briefcase },
        { href: "/dashboard/bookings", label: "Jobs", icon: Calendar },
        { href: "/messages", label: "Messages", icon: MessageCircle },
      ]
    : [
        { href: "/browse", label: "Find Services", icon: Search },
        { href: "/become-provider", label: "List Your Service", icon: Briefcase },
        { href: "/categories", label: "Categories", icon: Grid3X3 },
        { href: "/how-it-works", label: "How It Works", icon: HelpCircle },
      ];

  // Drawer menu sections
  const drawerSections = isProviderMode
    ? [
        {
          title: "Dashboard",
          items: [
            { href: "/dashboard", label: "Overview", icon: Home },
            { href: "/dashboard/listings", label: "My Listings", icon: Briefcase },
            { href: "/dashboard/bookings", label: "Jobs", icon: Calendar },
            { href: "/dashboard/analytics", label: "Analytics", icon: Star },
            { href: "/messages", label: "Messages", icon: MessageCircle },
            { href: "/dashboard/settings", label: "Settings", icon: Settings },
          ],
        },
      ]
    : [
        {
          title: "Browse",
          items: [
            { href: "/browse", label: "All Services", icon: Search },
            { href: "/categories", label: "Categories", icon: Grid3X3 },
          ],
        },
        {
          title: "For Customers",
          items: [
            { href: "/bookings", label: "My Bookings", icon: Calendar },
            { href: "/messages", label: "Messages", icon: MessageCircle },
          ],
        },
        {
          title: "For Providers",
          items: [
            { href: "/become-provider", label: "List Your Service", icon: Briefcase },
            { href: "/pricing", label: "Pricing", icon: Tag },
          ],
        },
        {
          title: "Support",
          items: [
            { href: "/how-it-works", label: "How It Works", icon: HelpCircle },
            { href: "/about", label: "About Us", icon: Info },
            { href: "/contact", label: "Contact", icon: Phone },
          ],
        },
        {
          title: "Legal",
          items: [
            { href: "/terms", label: "Terms of Service", icon: FileText },
            { href: "/privacy", label: "Privacy Policy", icon: FileText },
          ],
        },
      ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b",
        "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* LEFT: Hamburger Menu (Mobile) */}
          <div className="flex items-center gap-2">
            <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full md:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 overflow-y-auto">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                {/* Drawer Header */}
                <div className="sticky top-0 bg-background z-10 p-4 border-b">
                  <div className="flex items-center gap-3">
                    <img src="/awthar.png" alt="Awthar" className="w-10 h-10 object-contain" />
                    <div>
                      <span className="font-bold text-xl">Awthar</span>
                      {isAuthenticated && (
                        <p className="text-xs text-muted-foreground">
                          {isProviderMode ? "Provider Mode" : "Customer Mode"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* User Section */}
                {isAuthenticated ? (
                  <div className="p-4 border-b bg-muted/30">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user?.profileImageUrl || undefined} />
                        <AvatarFallback className="text-sm font-medium">
                          {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleNavigation("/profile")}
                      >
                        <User className="h-4 w-4 mr-1" />
                        Profile
                      </Button>
                      {(userCanBeProvider || user?.role === "provider") && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setMode(isCustomerMode ? "provider" : "customer")}
                        >
                          {isCustomerMode ? (
                            <>
                              <Building2 className="h-4 w-4 mr-1" />
                              Host
                            </>
                          ) : (
                            <>
                              <Users className="h-4 w-4 mr-1" />
                              Buy
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border-b">
                    <div className="flex gap-2">
                      <Button className="flex-1" onClick={() => handleNavigation("/login")}>
                        Log In
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={() => handleNavigation("/signup")}>
                        Sign Up
                      </Button>
                    </div>
                  </div>
                )}

                {/* Navigation Sections */}
                <div className="py-2">
                  {drawerSections.map((section, sectionIdx) => (
                    <div key={section.title}>
                      {(!isAuthenticated && (section.title === "For Customers" && section.items.some(i => i.href === "/bookings" || i.href === "/messages"))) ? null : (
                        <>
                          <div className="px-4 py-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              {section.title}
                            </p>
                          </div>
                          {section.items.map((item) => {
                            // Hide auth-required items for non-authenticated users
                            if (!isAuthenticated && (item.href === "/bookings" || item.href === "/messages")) {
                              return null;
                            }
                            const isActive = location === item.href || location.startsWith(item.href + "/");
                            return (
                              <SheetClose asChild key={item.href}>
                                <button
                                  onClick={() => handleNavigation(item.href)}
                                  className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors",
                                    "hover:bg-muted/50",
                                    isActive && "bg-primary/10 text-primary font-medium"
                                  )}
                                >
                                  <item.icon className="h-5 w-5" />
                                  <span className="flex-1 text-left">{item.label}</span>
                                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                </button>
                              </SheetClose>
                            );
                          })}
                          {sectionIdx < drawerSections.length - 1 && <Separator className="my-2" />}
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {/* Drawer Footer */}
                {isAuthenticated && (
                  <div className="mt-auto border-t p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-muted-foreground">Appearance</span>
                      <ThemeToggle />
                    </div>
                    <Button
                      variant="outline"
                      className="w-full text-destructive hover:text-destructive"
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {logoutMutation.isPending ? "Logging out..." : "Log Out"}
                    </Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>

          {/* CENTER: Logo (Mobile & Desktop) */}
          <Link
            href={isProviderMode ? "/dashboard" : "/"}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0"
          >
            <img src="/awthar.png" alt="Awthar" className="w-8 h-8 object-contain" />
            <span className="font-bold text-xl">Awthar</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center px-8">
            {desktopNavItems.map((item) => {
              const isActive = location === item.href || location.startsWith(item.href + "/");
              return (
                <Button
                  key={item.href}
                  variant={isActive ? "secondary" : "ghost"}
                  asChild
                  size="sm"
                  className="h-9"
                >
                  <Link href={item.href}>
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </nav>

          {/* RIGHT: Desktop Hamburger + Auth / Mobile Profile */}
          <div className="flex items-center gap-2">
            {/* Desktop Hamburger Menu (for full menu) */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden md:flex h-10 w-10 rounded-full"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0 overflow-y-auto">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                {/* Same drawer content for desktop */}
                <div className="sticky top-0 bg-background z-10 p-4 border-b">
                  <div className="flex items-center gap-3">
                    <img src="/awthar.png" alt="Awthar" className="w-10 h-10 object-contain" />
                    <div>
                      <span className="font-bold text-xl">Awthar</span>
                      {isAuthenticated && (
                        <p className="text-xs text-muted-foreground">
                          {isProviderMode ? "Provider Mode" : "Customer Mode"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {isAuthenticated ? (
                  <div className="p-4 border-b bg-muted/30">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user?.profileImageUrl || undefined} />
                        <AvatarFallback className="text-sm font-medium">
                          {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <SheetClose asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setLocation("/profile")}
                        >
                          <User className="h-4 w-4 mr-1" />
                          Profile
                        </Button>
                      </SheetClose>
                      {(userCanBeProvider || user?.role === "provider") && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setMode(isCustomerMode ? "provider" : "customer")}
                        >
                          {isCustomerMode ? (
                            <>
                              <Building2 className="h-4 w-4 mr-1" />
                              Host
                            </>
                          ) : (
                            <>
                              <Users className="h-4 w-4 mr-1" />
                              Buy
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border-b">
                    <div className="flex gap-2">
                      <SheetClose asChild>
                        <Button className="flex-1" onClick={() => setLocation("/login")}>
                          Log In
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button variant="outline" className="flex-1" onClick={() => setLocation("/signup")}>
                          Sign Up
                        </Button>
                      </SheetClose>
                    </div>
                  </div>
                )}

                <div className="py-2">
                  {drawerSections.map((section, sectionIdx) => (
                    <div key={section.title}>
                      {(!isAuthenticated && (section.title === "For Customers" && section.items.some(i => i.href === "/bookings" || i.href === "/messages"))) ? null : (
                        <>
                          <div className="px-4 py-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              {section.title}
                            </p>
                          </div>
                          {section.items.map((item) => {
                            if (!isAuthenticated && (item.href === "/bookings" || item.href === "/messages")) {
                              return null;
                            }
                            const isActive = location === item.href || location.startsWith(item.href + "/");
                            return (
                              <SheetClose asChild key={item.href}>
                                <Link
                                  href={item.href}
                                  className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors",
                                    "hover:bg-muted/50",
                                    isActive && "bg-primary/10 text-primary font-medium"
                                  )}
                                >
                                  <item.icon className="h-5 w-5" />
                                  <span className="flex-1 text-left">{item.label}</span>
                                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                </Link>
                              </SheetClose>
                            );
                          })}
                          {sectionIdx < drawerSections.length - 1 && <Separator className="my-2" />}
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {isAuthenticated && (
                  <div className="mt-auto border-t p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-muted-foreground">Appearance</span>
                      <ThemeToggle />
                    </div>
                    <SheetClose asChild>
                      <Button
                        variant="outline"
                        className="w-full text-destructive hover:text-destructive"
                        onClick={handleLogout}
                        disabled={logoutMutation.isPending}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        {logoutMutation.isPending ? "Logging out..." : "Log Out"}
                      </Button>
                    </SheetClose>
                  </div>
                )}
              </SheetContent>
            </Sheet>

            {/* Desktop Auth Buttons */}
            {!isAuthenticated && (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Log In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            )}

            {/* Profile Icon/Dropdown (All Screens) */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full"
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
                className="h-10 w-10 rounded-full md:hidden"
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
