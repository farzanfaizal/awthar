import React from 'react';
import { useLocation, Link } from 'wouter';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, Home, Search, Calendar, MessageCircle, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppMode } from '@/context/app-mode-context';
import { useAuth } from '@/hooks/useAuth'; // To check if user is provider

interface MobileNavTitleProps {
  // Any specific props for styling or behavior
}

export function MobileNavTitle({}: MobileNavTitleProps) {
  const [location] = useLocation();
  const { mode, isCustomerMode, isProviderMode } = useAppMode();
  const { user } = useAuth(); // To check if user is a provider

  const getPageTitle = (path: string): string => {
    if (path === '/') return 'Awthar';
    if (path.startsWith('/browse')) return 'Browse Services';
    if (path.startsWith('/bookings')) return 'My Bookings';
    if (path.startsWith('/messages')) return 'Messages';
    if (path.startsWith('/dashboard')) return 'Dashboard';
    if (path.startsWith('/profile')) return 'Profile';
    // Add more page titles as needed
    return 'Awthar'; // Default for unknown paths
  };

  const currentTitle = getPageTitle(location);

  const navigationItems = React.useMemo(() => {
    const items = [];
    if (isCustomerMode) {
      items.push(
        { path: '/', label: 'Home', icon: Home },
        { path: '/browse', label: 'Browse Services', icon: Search },
        { path: '/bookings', label: 'My Bookings', icon: Calendar },
        { path: '/messages', label: 'Messages', icon: MessageCircle },
      );
    } else if (isProviderMode) {
      items.push(
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/dashboard/listings', label: 'My Listings', icon: Search }, // Reusing Search icon for listings
        { path: '/dashboard/bookings', label: 'Client Jobs', icon: Calendar },
        { path: '/messages', label: 'Client Messages', icon: MessageCircle },
      );
    }
    return items;
  }, [isCustomerMode, isProviderMode]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1 font-bold text-lg px-2 py-1 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
          <span className="sr-only">Open navigation menu</span>
          {/* Logo Icon and Text (Awthar) */}
          <Link href="/" className="flex items-center gap-2 mr-2">
            <img src="/awthar.png" alt="Awthar Logo" className="w-6 h-6 object-contain" />
          </Link>
          {currentTitle}
          <ChevronDown className="w-4 h-4 ml-1" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 mt-2">
        {navigationItems.map((item) => (
          <DropdownMenuItem key={item.path} asChild className={cn(
            'cursor-pointer',
            location === item.path && 'bg-accent text-accent-foreground'
          )}>
            <Link href={item.path}>
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
