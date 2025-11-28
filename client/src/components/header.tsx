import { Link, useLocation } from "wouter";
import { Search, MapPin, Menu, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

export function Header() {
  const { isAuthenticated, user, isProvider } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex h-16 md:h-20 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-lg px-3 py-2 -ml-3" data-testid="link-home">
            <img src="/awthar.png" alt="Awthar Logo" className="w-8 h-8 object-contain" />
            <span className="font-bold text-xl hidden sm:inline">Awthar</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for services..."
                className="pl-12 pr-4 h-12 rounded-xl border-2 focus-visible:ring-2 focus-visible:ring-primary/20"
                data-testid="input-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <Button 
              variant="default" 
              size="lg" 
              className="h-12 px-6 rounded-xl" 
              data-testid="button-search"
              onClick={handleSearch}
            >
              <Search className="h-5 w-5 mr-2" />
              Search
            </Button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {isProvider && (
                  <Link href="/dashboard" asChild>
                    <Button variant="ghost" className="rounded-lg hidden md:flex" data-testid="link-dashboard">
                      Dashboard
                    </Button>
                  </Link>
                )}
                <Link href="/bookings" asChild>
                  <Button variant="ghost" size="icon" className="rounded-lg" title="My Bookings">
                    <Calendar className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/messages" asChild>
                  <Button variant="ghost" size="icon" className="rounded-lg" data-testid="link-messages" title="Messages">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </Button>
                </Link>
                <Link href="/profile" asChild>
                  <Button variant="ghost" size="icon" className="rounded-lg" data-testid="link-profile">
                    {user?.profileImageUrl ? (
                      <img
                        src={user.profileImageUrl}
                        alt={user.firstName || "Profile"}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                        {user?.firstName?.[0] || user?.email?.[0] || "U"}
                      </div>
                    )}
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" asChild>
                  <Button variant="ghost" className="rounded-lg" data-testid="button-login">
                    Log In
                  </Button>
                </Link>
                <Link href="/signup" asChild>
                  <Button variant="default" className="rounded-lg" data-testid="button-signup">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for services..."
              className="pl-12 pr-4 h-12 rounded-xl border-2"
              data-testid="input-search-mobile"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
