"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { getQueryFn } from "@/lib/query-client";
import { apiDelete } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ServiceCard } from "@/components/service-card";
import { ServiceCardSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Heart, Search } from "lucide-react";
import Link from "next/link";
import type { ServiceWithProvider } from "@/types";

interface FavoriteItem {
  id: string;
  serviceId: string;
  createdAt: string;
  service: ServiceWithProvider;
}

export default function FavoritesPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthLoading && !user) router.push("/login");
  }, [isAuthLoading, user, router]);

  const { data: favorites, isLoading } = useQuery<FavoriteItem[]>({
    queryKey: ["/api/favorites"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user,
  });

  const removeMutation = useMutation({
    mutationFn: (serviceId: string) => apiDelete(`/api/favorites/${serviceId}`),
    onMutate: async (serviceId) => {
      await queryClient.cancelQueries({ queryKey: ["/api/favorites"] });
      const previous = queryClient.getQueryData<FavoriteItem[]>(["/api/favorites"]);
      queryClient.setQueryData<FavoriteItem[]>(
        ["/api/favorites"],
        (old) => old?.filter((f) => f.serviceId !== serviceId),
      );
      return { previous };
    },
    onSuccess: () => {
      toast({ title: "Removed from favorites" });
    },
    onError: (error: Error, _serviceId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["/api/favorites"], context.previous);
      }
      toast({ title: "Failed to remove", description: error.message, variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
    },
  });

  if (isAuthLoading || !user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Heart className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">My Favorites</h1>
          <p className="text-sm text-muted-foreground">
            {favorites?.length || 0} saved service{(favorites?.length || 0) !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ServiceCardSkeleton key={i} />
          ))}
        </div>
      ) : !favorites || favorites.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
          <p className="text-muted-foreground mb-6">
            Browse services and tap the heart icon to save your favorites.
          </p>
          <Button asChild>
            <Link href="/browse">
              <Search className="mr-2 h-4 w-4" />
              Browse Services
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((fav) => (
            <div key={fav.id} className="relative group">
              <ServiceCard service={fav.service} />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-4 left-4 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeMutation.mutate(fav.serviceId);
                }}
              >
                <Heart className="h-4 w-4 fill-current" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
