import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import { AuthProvider } from "@/context/auth-context";
import { AppModeProvider, useAppMode } from "@/context/app-mode-context";
import { useEffect, lazy, Suspense } from "react";
import ErrorBoundary from "@/components/error-boundary";

// Lazy load all page components for code splitting
const NotFound = lazy(() => import("@/pages/not-found"));
const Landing = lazy(() => import("@/pages/landing"));
const Browse = lazy(() => import("@/pages/browse"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const ListingsPage = lazy(() => import("@/pages/dashboard/listings"));
const BookingsPage = lazy(() => import("@/pages/dashboard/bookings"));
const CreateListingPage = lazy(() => import("@/pages/dashboard/create-listing"));
const EditListingPage = lazy(() => import("@/pages/dashboard/edit-listing"));
const ServiceDetail = lazy(() => import("@/pages/service-detail"));
const ProviderProfile = lazy(() => import("@/pages/provider-profile"));
const MyBookingsPage = lazy(() => import("@/pages/my-bookings"));
const MessagesPage = lazy(() => import("@/pages/messages"));
const AnalyticsPage = lazy(() => import("@/pages/dashboard/analytics"));
const SettingsPage = lazy(() => import("@/pages/dashboard/settings"));
const ProfilePage = lazy(() => import("@/pages/profile"));
const LoginPage = lazy(() => import("@/pages/login"));
const SignupPage = lazy(() => import("@/pages/signup"));
const BecomeProviderPage = lazy(() => import("@/pages/become-provider"));
const CategoriesPage = lazy(() => import("@/pages/categories"));
const CategoryPage = lazy(() => import("@/pages/category"));
const HowItWorksPage = lazy(() => import("@/pages/how-it-works"));
const PricingPage = lazy(() => import("@/pages/pricing"));
const AboutPage = lazy(() => import("@/pages/about"));
const ContactPage = lazy(() => import("@/pages/contact"));
const TermsPage = lazy(() => import("@/pages/terms"));
const PrivacyPage = lazy(() => import("@/pages/privacy"));

// Auth pages
const AuthCallback = lazy(() => import("@/pages/auth/callback"));
const ForgotPassword = lazy(() => import("@/pages/forgot-password"));
const ResetPassword = lazy(() => import("@/pages/auth/reset-password"));

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}

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
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/login" component={LoginPage} />
          <Route path="/signup" component={SignupPage} />
          <Route path="/forgot-password" component={ForgotPassword} />
          <Route path="/auth/callback" component={AuthCallback} />
          <Route path="/auth/reset-password" component={ResetPassword} />
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
      </Suspense>
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
            <AuthProvider>
              <AppModeProvider>
                <AppRouter />
              </AppModeProvider>
            </AuthProvider>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
