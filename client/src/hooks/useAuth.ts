import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { useSupabaseAuth } from "@/context/auth-context";

/**
 * Extended user type with Supabase-specific fields
 */
export interface AuthUser extends User {
  supabaseId: string;
  emailVerified: boolean;
  authProvider: "email" | "google" | "apple" | "github";
}

/**
 * Hook for accessing current authenticated user
 * Fetches application user data from our API using Supabase session
 */
export function useAuth() {
  const { session, isLoading: isAuthLoading } = useSupabaseAuth();

  const {
    data: user,
    isLoading: isUserLoading,
    error,
  } = useQuery<AuthUser | null>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      if (!session?.access_token) return null;

      const res = await fetch("/api/auth/user", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (res.status === 401) return null;
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch user");
      }

      return res.json();
    },
    enabled: !!session, // Only fetch if we have a session
    retry: false,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });

  return {
    user: user || null,
    isLoading: isAuthLoading || isUserLoading,
    error,
    isAuthenticated: !!user,
    isProvider: user?.role === "provider" || user?.role === "both",
    isCustomer: user?.role === "customer" || user?.role === "both",
    emailVerified: user?.emailVerified ?? false,
    authProvider: user?.authProvider ?? null,
  };
}
