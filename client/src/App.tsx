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
import ServiceDetail from "@/pages/service-detail";
import ProviderProfile from "@/pages/provider-profile";
import Dashboard from "@/pages/dashboard";
import DashboardListings from "@/pages/dashboard/listings";
import DashboardCreateListing from "@/pages/dashboard/create-listing";
import DashboardEditListing from "@/pages/dashboard/edit-listing";
import DashboardMessages from "@/pages/dashboard/messages";
import DashboardBookings from "@/pages/dashboard/bookings";
import DashboardAnalytics from "@/pages/dashboard/analytics";
import DashboardSettings from "@/pages/dashboard/settings";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import BecomeProvider from "@/pages/become-provider";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminProviders from "@/pages/admin/providers";
import AdminServices from "@/pages/admin/services";
import AdminComplaints from "@/pages/admin/complaints";
import AdminUsers from "@/pages/admin/users";
import AdminSettings from "@/pages/admin/settings";

function Router() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/browse" component={Browse} />
      <Route path="/service/:id" component={ServiceDetail} />
      <Route path="/provider/:id" component={ProviderProfile} />
      <Route path="/become-provider" component={BecomeProvider} />
      <Route path="/dashboard/listings/new" component={DashboardCreateListing} />
      <Route path="/dashboard/listings/:id/edit" component={DashboardEditListing} />
      <Route path="/dashboard/listings" component={DashboardListings} />
      <Route path="/dashboard/messages" component={DashboardMessages} />
      <Route path="/dashboard/bookings" component={DashboardBookings} />
      <Route path="/dashboard/analytics" component={DashboardAnalytics} />
      <Route path="/dashboard/settings" component={DashboardSettings} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/admin/providers" component={AdminProviders} />
      <Route path="/admin/services" component={AdminServices} />
      <Route path="/admin/complaints" component={AdminComplaints} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
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
