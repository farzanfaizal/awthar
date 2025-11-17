import { Link } from "wouter";
import { Plus, Edit, Trash2, Eye, MoreVertical, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Service } from "@shared/schema";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DashboardLayout } from "@/components/dashboard-layout";

interface ExtendedService extends Service {
  category: {
    nameEn: string;
  };
}

export default function MyListings() {
  const queryClient = useQueryClient();

  const { data: services, isLoading, error } = useQuery<ExtendedService[]>({
    queryKey: ["/api/services"],
    queryFn: async () => {
      const response = await fetch("/api/services?myServices=true");
      if (!response.ok) throw new Error("Failed to fetch services");
      return response.json();
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/services/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete service");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      active: { variant: "default", label: "Active" },
      draft: { variant: "secondary", label: "Draft" },
      paused: { variant: "outline", label: "Paused" },
      pending_review: { variant: "secondary", label: "Pending Review" },
      rejected: { variant: "destructive", label: "Rejected" },
    };
    const config = variants[status] || variants.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Listings</h1>
          <p className="text-muted-foreground">Manage your service listings</p>
        </div>
        <Link href="/dashboard/listings/new">
          <Button className="rounded-lg">
            <Plus className="h-4 w-4 mr-2" />
            Create New Listing
          </Button>
        </Link>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load your listings. Please try again later.
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="rounded-xl">
              <CardContent className="p-6">
                <div className="space-y-4 animate-pulse">
                  <div className="h-40 bg-muted rounded-lg" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : services && services.length === 0 ? (
        <Card className="rounded-xl">
          <CardContent className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No listings yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first service listing to start attracting customers
              </p>
              <Link href="/dashboard/listings/new">
                <Button className="rounded-lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Listing
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services?.map((service) => (
            <Card key={service.id} className="rounded-xl hover-elevate transition-all">
              <CardContent className="p-0">
                {/* Image */}
                <div className="aspect-video bg-muted rounded-t-xl relative overflow-hidden">
                  {service.images && service.images.length > 0 ? (
                    <img
                      src={service.images[0]}
                      alt={service.titleEn}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">No image</span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    {getStatusBadge(service.status)}
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-1">
                      {service.titleEn}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {service.category.nameEn}
                    </p>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {service.descriptionEn}
                  </p>

                  <div className="flex items-center justify-between mb-4 text-sm">
                    <div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Eye className="h-4 w-4" />
                        <span>{service.viewCount} views</span>
                      </div>
                    </div>
                    <div className="font-bold text-primary">
                      {service.pricingType === "fixed" && service.priceMin
                        ? `AED ${parseFloat(service.priceMin).toFixed(0)}`
                        : service.pricingType === "hourly" && service.priceMin
                        ? `AED ${parseFloat(service.priceMin).toFixed(0)}/hr`
                        : "Custom"}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/service/${service.id}`} className="flex-1">
                      <Button variant="outline" className="w-full rounded-lg">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="rounded-lg">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/listings/${service.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this listing?")) {
                              deleteServiceMutation.mutate(service.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}
