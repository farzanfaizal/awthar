"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Heart,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { useSupabaseAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import { useAppMode } from "@/context/app-mode-context";
import { Separator } from "@/components/ui/separator";

export function Header() {
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth();
  const { signOut } = useSupabaseAuth();
  const { mode, setMode, isCustomerMode, isProviderMode, userCanBeProvider, isAppModeLoading } =
    useAppMode();
  const pathname = usePathname();
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsDrawerOpen(false);
    setIsLoggingOut(true);
    try {
      await signOut();
      router.push("/");
    } catch {
      // toast handled elsewhere
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleNavigation = (href: string) => {
    setIsDrawerOpen(false);
    router.push(href);
  };

  const currentModeLabel = mode === "customer" ? "Buying" : "Hosting";

  if (isAuthLoading || isAppModeLoading) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 h-16 flex items-center">
          <div className="h-8 w-24 bg-muted animate-pulse rounded" />
        </div>
      </header>
    );
  }

  const isExistingProvider = userCanBeProvider || user?.role === "provider";

  const desktopNavItems = isProviderMode
    ? [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/dashboard/listings", label: "Listings", icon: Briefcase },
        { href: "/dashboard/bookings", label: "Jobs", icon: Calendar },
        { href: "/messages", label: "Messages", icon: MessageCircle },
      ]
    : [
        { href: "/browse", label: "Find Services", icon: Search },
        ...(isExistingProvider
          ? []
          : [{ href: "/become-provider", label: "List Your Service", icon: Briefcase }]),
        { href: "/categories", label: "Categories", icon: Grid3X3 },
        { href: "/how-it-works", label: "How It Works", icon: HelpCircle },
      ];

  const siteNavSections = isProviderMode
    ? [
        {
          title: "Dashboard",
          items: [
            { href: "/dashboard", label: "Overview", icon: Home },
            { href: "/dashboard/listings", label: "My Listings", icon: Briefcase },
            { href: "/dashboard/bookings", label: "Jobs", icon: Calendar },
            { href: "/dashboard/analytics", label: "Analytics", icon: Star },
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
        ...(isExistingProvider
          ? []
          : [
              {
                title: "For Providers",
                items: [
                  { href: "/become-provider", label: "List Your Service", icon: Briefcase },
                  { href: "/pricing", label: "Pricing", icon: Tag },
                ],
              },
            ]),
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
          {/* LEFT: Hamburger (Mobile) */}
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
                <div className="sticky top-0 bg-background z-10 p-4 border-b">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-xl">Awthar</span>
                    <p className="text-xs text-muted-foreground">Site Navigation</p>
                  </div>
                </div>

                {!isAuthenticated && (
                  <div className="p-4 border-b">
                    <div className="flex gap-2">
                      <Button className="flex-1" onClick={() => handleNavigation("/login")}>
                        Log In
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleNavigation("/signup")}
                      >
                        Sign Up
                      </Button>
                    </div>
                  </div>
                )}

                <div className="py-2">
                  {siteNavSections.map((section, sectionIdx) => (
                    <div key={section.title}>
                      <div className="px-4 py-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {section.title}
                        </p>
                      </div>
                      {section.items.map((item) => {
                        const isActive =
                          pathname === item.href || pathname.startsWith(item.href + "/");
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
                      {sectionIdx < siteNavSections.length - 1 && <Separator className="my-2" />}
                    </div>
                  ))}
                </div>

                <div className="mt-auto border-t p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Appearance</span>
                    <ThemeToggle />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* CENTER: Logo */}
          <Link
            href={isProviderMode ? "/dashboard" : "/"}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0"
          >
            <span className="font-bold text-xl">Awthar</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center px-8">
            {desktopNavItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
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

          {/* RIGHT: Desktop Hamburger + Auth */}
          <div className="flex items-center gap-2">
            {/* Desktop Hamburger Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden md:flex h-10 w-10 rounded-full"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-64 p-0 max-h-[80vh] overflow-y-auto">
                <div className="py-2">
                  {siteNavSections.map((section, sectionIdx) => (
                    <div key={section.title}>
                      <div className="px-3 py-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {section.title}
                        </p>
                      </div>
                      {section.items.map((item) => {
                        const isActive =
                          pathname === item.href || pathname.startsWith(item.href + "/");
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors",
                              "hover:bg-muted/50",
                              isActive && "bg-primary/10 text-primary font-medium"
                            )}
                          >
                            <item.icon className="h-4 w-4" />
                            <span className="flex-1 text-left">{item.label}</span>
                          </Link>
                        );
                      })}
                      {sectionIdx < siteNavSections.length - 1 && <Separator className="my-2" />}
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Appearance</span>
                    <ThemeToggle />
                  </div>
                </div>
              </PopoverContent>
            </Popover>

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

            {/* Profile Dropdown */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
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
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
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
                      <DropdownMenuItem onClick={() => router.push("/become-provider")}>
                        <Briefcase className="mr-2 h-4 w-4" />
                        <span>Become a Provider</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  {/* Activity */}
                  {isProviderMode ? (
                    <DropdownMenuItem asChild>
                      <Link href="/messages">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        <span>Messages</span>
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/bookings">
                          <Calendar className="mr-2 h-4 w-4" />
                          <span>My Bookings</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/messages">
                          <MessageCircle className="mr-2 h-4 w-4" />
                          <span>My Messages</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/favorites">
                          <Heart className="mr-2 h-4 w-4" />
                          <span>My Favorites</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile Settings</span>
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
                    disabled={isLoggingOut}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
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
