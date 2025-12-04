import { useEffect } from "react";
import { Redirect } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useAppMode } from "@/context/app-mode-context";
import { Header } from "@/components/header";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, isProvider } = useAuth();
  const { setMode } = useAppMode();

  // Enforce provider mode when entering dashboard
  useEffect(() => {
    if (isProvider) {
      setMode('provider');
    }
  }, [isProvider, setMode]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = "/login"; // Changed from /api/login to /login for client-side route
    }
  }, [isLoading, isAuthenticated]);

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

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  if (!isProvider) {
    return <Redirect to="/become-provider" />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />
      <main className="flex-1 container max-w-7xl mx-auto py-8 px-4 md:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
