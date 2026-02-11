"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabaseAuth } from "@/context/auth-context";

export interface AuthUser {
  id: string;
  supabaseId: string;
  email: string;
  emailVerified: boolean;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  role: "customer" | "provider" | "both";
  authProvider: "email" | "google" | "apple" | "github";
  createdAt: string;
  updatedAt: string;
}

export function useAuth() {
  const { session, isLoading: isAuthLoading } = useSupabaseAuth();

  const {
    data: user,
    isLoading: isUserLoading,
    error,
  } = useQuery<AuthUser | null>({
    queryKey: ["/api/auth/user"],
    enabled: !!session,
    retry: false,
    staleTime: 5 * 60 * 1000,
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
