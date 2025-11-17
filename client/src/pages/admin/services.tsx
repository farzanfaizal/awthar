import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, CheckCircle, XCircle, Eye, Clock, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { AdminLayout } from "@/components/admin-layout";

interface ServiceData {
  id: string;
  titleEn: string;
  descriptionEn: string;
  status: string;
  pricingType: string;
  priceMin: string | null;
  images: string[] | null;
  createdAt: string;
  provider: {
    id: string;
    user: {
      firstName: string | null;
      lastName: string | null;
      email: string;
    };
  };
  category: {
    nameEn: string;
  };
}

export default function AdminServices() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedService, setSelectedService] = useState<ServiceData | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const queryClient = useQueryClient();

  const { data: services, isLoading, error } = useQuery<ServiceData[]>({
    queryKey: ["/api/admin/services", statusFilter],
    queryFn: async () => {
      const url = statusFilter === "all"
        ? "/api/admin/services"
        : `/api/admin/services?status=${statusFilter}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch services");
      return response.json();
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      const response = await fetch(`/api/admin/services/${serviceId}/approve`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to approve service");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      setSelectedService(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ serviceId, reason }: { serviceId: string; reason: string }) => {
      const response = await fetch(`/api/admin/services/${serviceId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!response.ok) throw new Error("Failed to reject service");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      setShowRejectDialog(false);
      setSelectedService(null);
      setRejectReason("");
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: any; label: string }> = {
      active: { color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle, label: "Active" },
      pending_review: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Clock, label: "Pending Review" },
      rejected: { color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", icon: XCircle, label: "Rejected" },
      draft: { color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400", icon: AlertCircle, label: "Draft" },
      paused: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", icon: AlertCircle, label: "Paused" },
    };
    const config = variants[status] || variants.draft;
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const filteredServices = services || [];
  const pendingCount = services?.filter(s => s.status === "pending_review").length || 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Service Moderation</h1>
            <p className="text-muted-foreground">
              Review and moderate service listings
              {pendingCount > 0 && (
                <span className="ml-2 text-warning font-semibold">
                  • {pendingCount} pending
                </span>
              )}
            </p>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              <SelectItem value="pending_review">Pending Review</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load services. Please try again later.
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="rounded-xl">
                <CardContent className="p-6">
                  <div className="space-y-4 animate-pulse">
                    <div className="h-40 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <Card className="rounded-xl">
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No services found</h3>
              <p className="text-muted-foreground">
                {statusFilter === "pending_review"
                  ? "No services pending review at the moment"
                  : `No ${statusFilter} services`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
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
                    <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                      {service.titleEn}
                    </h3>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Provider</span>
                        <span className="font-medium">
                          {service.provider.user.firstName} {service.provider.user.lastName}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Category</span>
                        <span className="font-medium">{service.category.nameEn}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Price</span>
                        <span className="font-medium">
                          {service.pricingType === "fixed" && service.priceMin
                            ? `AED ${parseFloat(service.priceMin).toFixed(0)}`
                            : service.pricingType === "hourly" && service.priceMin
                            ? `AED ${parseFloat(service.priceMin).toFixed(0)}/hr`
                            : "Custom"}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {service.descriptionEn}
                    </p>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setSelectedService(service)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>

                      {service.status === "pending_review" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => approveMutation.mutate(service.id)}
                            disabled={approveMutation.isPending}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedService(service);
                              setShowRejectDialog(true);
                            }}
                            disabled={rejectMutation.isPending}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Service Details Dialog */}
        <Dialog open={!!selectedService && !showRejectDialog} onOpenChange={(open) => !open && setSelectedService(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Service Details</DialogTitle>
              <DialogDescription>
                Review service information and moderation status
              </DialogDescription>
            </DialogHeader>

            {selectedService && (
              <div className="space-y-6">
                {selectedService.images && selectedService.images.length > 0 && (
                  <div className="aspect-video bg-muted rounded-xl overflow-hidden">
                    <img
                      src={selectedService.images[0]}
                      alt={selectedService.titleEn}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">{selectedService.titleEn}</h3>
                      <p className="text-sm text-muted-foreground">{selectedService.category.nameEn}</p>
                    </div>
                    {getStatusBadge(selectedService.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label>Provider</Label>
                      <p className="text-sm mt-1">
                        {selectedService.provider.user.firstName} {selectedService.provider.user.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{selectedService.provider.user.email}</p>
                    </div>

                    <div>
                      <Label>Pricing</Label>
                      <p className="text-sm mt-1">
                        {selectedService.pricingType === "fixed" && selectedService.priceMin
                          ? `AED ${parseFloat(selectedService.priceMin).toFixed(0)} (Fixed)`
                          : selectedService.pricingType === "hourly" && selectedService.priceMin
                          ? `AED ${parseFloat(selectedService.priceMin).toFixed(0)}/hr (Hourly)`
                          : "Custom pricing"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label>Description</Label>
                    <p className="text-sm mt-1 text-muted-foreground">{selectedService.descriptionEn}</p>
                  </div>

                  <div className="text-xs text-muted-foreground mt-4">
                    Created: {new Date(selectedService.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}

            {selectedService?.status === "pending_review" && (
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setSelectedService(null)}
                >
                  Close
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowRejectDialog(true)}
                  disabled={rejectMutation.isPending}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => selectedService && approveMutation.mutate(selectedService.id)}
                  disabled={approveMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {approveMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Approve Service
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Service</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this service listing
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="reason">Rejection Reason</Label>
                <Textarea
                  id="reason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  rows={4}
                  className="mt-1"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectReason("");
                }}
                disabled={rejectMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  selectedService &&
                  rejectMutation.mutate({
                    serviceId: selectedService.id,
                    reason: rejectReason,
                  })
                }
                disabled={!rejectReason.trim() || rejectMutation.isPending}
              >
                {rejectMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Service
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
