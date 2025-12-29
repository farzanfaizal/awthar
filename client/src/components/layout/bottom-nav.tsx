import { Link, useLocation } from "wouter";
import { Home, Search, MessageSquare, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppMode } from "@/context/app-mode-context";
import { useAuth } from "@/hooks/useAuth";

export function BottomNav() {
  const [location] = useLocation();
  const { isProviderMode } = useAppMode();
  const { isAuthenticated } = useAuth();

  const navItems = isProviderMode 
    ? [
        { href: "/dashboard", icon: Home, label: "Home" },
        { href: "/dashboard/listings", icon: Search, label: "Listings" },
        { href: "/dashboard/bookings", icon: Calendar, label: "Jobs" },
        { href: "/messages", icon: MessageSquare, label: "Messages" },
        { href: "/profile", icon: User, label: "Profile" },
      ]
    : [
        { href: "/", icon: Home, label: "Home" },
        { href: "/browse", icon: Search, label: "Browse" },
        { href: "/bookings", icon: Calendar, label: "Bookings" },
        { href: "/messages", icon: MessageSquare, label: "Messages" },
        { href: "/profile", icon: User, label: "Profile" },
      ];

  if (!isAuthenticated && location === "/") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/80 backdrop-blur-lg border-t border-border pb-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                <item.icon className={cn("w-5 h-5", isActive && "fill-current/10")} />
                <span className="text-[10px] font-bold tracking-tight uppercase">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
