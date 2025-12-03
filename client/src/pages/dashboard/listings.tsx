import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Service } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MoreVertical, Plus, Edit, Trash2, Eye } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";

export default function ListingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: services, isLoading, isError } = useQuery<Service[]>({
    queryKey: ["/api/services", { role: "provider" }],
    queryFn: () => apiRequest("GET", "/api/services?role=provider").then(res => res.json())
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const status = isActive ? "active" : "paused";
      const res = await apiRequest("PATCH", `/api/services/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({ title: "Status Updated", description: "Service status has been updated." });
    },
    onError: (error: Error) => {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/services/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({ title: "Service Deleted", description: "Service has been removed." });
    },
    onError: (error: Error) => {
      toast({ title: "Delete Failed", description: error.message, variant: "destructive" });
    }
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <p className="text-destructive mb-4">Failed to load listings. Please try again.</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">My Listings</h2>
            <p className="text-muted-foreground">Manage your service offerings</p>
          </div>
          <Link href="/dashboard/listings/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create New Listing
            </Button>
          </Link>
        </div>

        <div className="grid gap-6">
          {services?.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <p>You haven't created any listings yet.</p>
                <Link href="/dashboard/listings/new" className="mt-4">
                  <Button variant="outline">Get Started</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            services?.map((service) => (
              <Card key={service.id} className="overflow-hidden">
                <div className="p-6 flex items-start gap-6">
                  {/* Image */}
                  <div className="w-32 h-24 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                    {service.images?.[0] ? (
                      <img src={service.images[0]} alt={service.titleEn} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-muted" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{service.titleEn}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Badge variant={service.status === 'active' ? 'default' : 'secondary'}>
                            {service.status}
                          </Badge>
                          <span>•</span>
                          <span>{service.viewCount} views</span>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Link href={`/service/${service.id}`}>
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              View Public Page
                            </DropdownMenuItem>
                          </Link>
                          <Link href={`/dashboard/listings/${service.id}/edit`}>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this listing?")) {
                                deleteMutation.mutate(service.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="mt-4 flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={service.status === 'active'}
                          onCheckedChange={(checked) => toggleStatusMutation.mutate({ id: service.id, isActive: checked })}
                          disabled={toggleStatusMutation.isPending}
                        />
                        <span className="text-sm text-muted-foreground">Active</span>
                      </div>
                      <div className="text-sm font-medium">
                        {service.priceMin} {service.currency}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}