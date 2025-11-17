import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isProvider: user?.role === "provider" || user?.role === "both",
    isCustomer: user?.role === "customer" || user?.role === "both",
    isAdmin: user?.role === "admin",
  };
}
