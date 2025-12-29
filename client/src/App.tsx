import { Switch, Route, useLocation } from "wouter";
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
import EditListingPage from "@/pages/dashboard/edit-listing";
import ServiceDetail from "@/pages/service-detail";
import ProviderProfile from "@/pages/provider-profile";
import MyBookingsPage from "@/pages/my-bookings";
import MessagesPage from "@/pages/messages";
import AnalyticsPage from "@/pages/dashboard/analytics";
import SettingsPage from "@/pages/dashboard/settings";
import ProfilePage from "@/pages/profile";
import LoginPage from "@/pages/login";
import SignupPage from "@/pages/signup";
import BecomeProviderPage from "@/pages/become-provider";
import CategoriesPage from "@/pages/categories";
import CategoryPage from "@/pages/category";
import HowItWorksPage from "@/pages/how-it-works";
import PricingPage from "@/pages/pricing";
import AboutPage from "@/pages/about";
import ContactPage from "@/pages/contact";
import TermsPage from "@/pages/terms";
import PrivacyPage from "@/pages/privacy";
import { AppModeProvider, useAppMode } from "@/context/app-mode-context";
import { useEffect } from "react";
import ErrorBoundary from "@/components/error-boundary";
import { BottomNav } from "@/components/layout/bottom-nav";

function AppRouter() {
  const { isLoading: isAuthLoading } = useAuth();
  const { mode, isAppModeLoading } = useAppMode();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthLoading || isAppModeLoading) {
      return; // Wait for authentication and app mode to load
    }

    if (mode === 'provider' && location === '/') {
      setLocation('/dashboard');
    } else if (mode === 'customer' && location.startsWith('/dashboard')) {
      setLocation('/');
    }
  }, [mode, location, setLocation, isAuthLoading, isAppModeLoading]);

  // Optionally, show a loader while modes are loading to prevent flicker
  if (isAuthLoading || isAppModeLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading application...
      </div>
    );
  }

  return (
    <>
      <Switch>
        <Route path="/" component={Landing} />
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/become-provider" component={BecomeProviderPage} />
      <Route path="/browse" component={Browse} />
      <Route path="/bookings" component={MyBookingsPage} />
      <Route path="/messages" component={MessagesPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/dashboard/messages" component={MessagesPage} />

      {/* Dashboard Routes */}
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/dashboard/listings" component={ListingsPage} />
      <Route path="/dashboard/listings/new" component={CreateListingPage} />
      <Route path="/dashboard/listings/:id/edit" component={EditListingPage} />
      <Route path="/dashboard/bookings" component={BookingsPage} />
      <Route path="/dashboard/analytics" component={AnalyticsPage} />
      <Route path="/dashboard/settings" component={SettingsPage} />

      {/* Static Pages */}
      <Route path="/categories" component={CategoriesPage} />
      <Route path="/category/:slug" component={CategoryPage} />
      <Route path="/how-it-works" component={HowItWorksPage} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/privacy" component={PrivacyPage} />

      <Route path="/service/:id" component={ServiceDetail} />
      <Route path="/provider/:id" component={ProviderProfile} />
      <Route component={NotFound} />
      </Switch>
      <BottomNav />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light">
          <TooltipProvider>
            <Toaster />
            <AppModeProvider>
              <AppRouter />
            </AppModeProvider>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
