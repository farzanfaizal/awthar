import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Browse from "@/pages/browse";
import Dashboard from "@/pages/dashboard";
import ListingsPage from "@/pages/dashboard/listings";
import BookingsPage from "@/pages/dashboard/bookings";
import CreateListingPage from "@/pages/dashboard/create-listing";
import ServiceDetail from "@/pages/service-detail";
import ProviderProfile from "@/pages/provider-profile";
import MyBookingsPage from "@/pages/my-bookings";
import MessagesPage from "@/pages/messages";
import AnalyticsPage from "@/pages/dashboard/analytics";
import SettingsPage from "@/pages/dashboard/settings";
import ProfilePage from "@/pages/profile";

function Router() {
  const { isLoading } = useAuth();
//...
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/browse" component={Browse} />
      <Route path="/bookings" component={MyBookingsPage} />
      <Route path="/messages" component={MessagesPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/dashboard/messages" component={MessagesPage} />
      
      {/* Dashboard Routes */}
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/dashboard/listings" component={ListingsPage} />
      <Route path="/dashboard/listings/new" component={CreateListingPage} />
      <Route path="/dashboard/bookings" component={BookingsPage} />
      <Route path="/dashboard/analytics" component={AnalyticsPage} />
      <Route path="/dashboard/settings" component={SettingsPage} />

      <Route path="/service/:id" component={ServiceDetail} />
      <Route path="/provider/:id" component={ProviderProfile} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
