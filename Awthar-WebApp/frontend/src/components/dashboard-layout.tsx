"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAppMode } from "@/context/app-mode-context";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, isProvider } = useAuth();
  const { setMode } = useAppMode();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!isProvider) {
      router.push("/become-provider");
      return;
    }

    setMode("provider");
  }, [isLoading, isAuthenticated, isProvider, router, setMode]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isProvider) return null;

  return (
    <main className="flex-1 container max-w-7xl mx-auto py-8 px-4 md:px-6 lg:px-8">
      {children}
    </main>
  );
}
