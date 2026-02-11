"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DashboardLayout } from "@/components/dashboard-layout";
import { getQueryFn } from "@/lib/query-client";
import { apiPatch, apiDelete } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { ServiceWithProvider } from "@/types";
import { Plus, MoreHorizontal, Eye, Pencil, Trash2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ListingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ services: ServiceWithProvider[] }>({
    queryKey: ["/api/services?role=provider"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const services = data?.services || [];

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiPatch(`/api/services/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({ title: "Status Updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/api/services/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({ title: "Listing Deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">My Listings</h2>
            <p className="text-muted-foreground mt-1">Manage your service listings</p>
          </div>
          <Link href="/dashboard/listings/new">
            <Button><Plus className="h-4 w-4 mr-2" />New Listing</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold mb-2">No listings yet</h3>
            <p className="text-muted-foreground mb-4">Create your first service listing to start getting customers.</p>
            <Link href="/dashboard/listings/new"><Button><Plus className="h-4 w-4 mr-2" />Create Listing</Button></Link>
          </div>
        ) : (
          <div className="space-y-4">
            {services.map((service) => (
              <Card key={service.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {service.images?.[0] ? (
                        <Image src={service.images[0]} alt={service.titleEn} fill className="object-cover" sizes="80px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No img</div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{service.titleEn}</h3>
                        <Badge variant={service.status === "active" ? "default" : "secondary"} className="capitalize text-xs">
                          {service.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="font-medium text-primary">AED {service.priceMin || "—"}</span>
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{service.viewCount} views</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Switch
                        checked={service.status === "active"}
                        onCheckedChange={(checked) =>
                          toggleStatusMutation.mutate({ id: service.id, status: checked ? "active" : "paused" })
                        }
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/service/${service.id}`} className="flex items-center gap-2"><ExternalLink className="h-4 w-4" />View Public Page</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/listings/${service.id}/edit`} className="flex items-center gap-2"><Pencil className="h-4 w-4" />Edit</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => deleteMutation.mutate(service.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />Delete
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
