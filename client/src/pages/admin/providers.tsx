import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, CheckCircle, XCircle, Eye, Clock, AlertCircle, Loader2 } from "lucide-react";
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

interface ProviderProfile {
  id: string;
  userId: string;
  providerType: string;
  companyName: string | null;
  bio: string | null;
  phone: string | null;
  verificationStatus: string;
  verificationDocuments: string[] | null;
  languages: string[] | null;
  serviceAreas: any;
  createdAt: string;
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

export default function AdminProviders() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProvider, setSelectedProvider] = useState<ProviderProfile | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const queryClient = useQueryClient();

  const { data: providers, isLoading, error } = useQuery<ProviderProfile[]>({
    queryKey: ["/api/admin/providers", statusFilter],
    queryFn: async () => {
      const url = statusFilter === "all"
        ? "/api/admin/providers"
        : `/api/admin/providers?status=${statusFilter}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch providers");
      return response.json();
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (providerId: string) => {
      const response = await fetch(`/api/admin/providers/${providerId}/verify`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to verify provider");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/providers"] });
      setSelectedProvider(null);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ providerId, reason }: { providerId: string; reason: string }) => {
      const response = await fetch(`/api/admin/providers/${providerId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!response.ok) throw new Error("Failed to reject provider");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/providers"] });
      setShowRejectDialog(false);
      setSelectedProvider(null);
      setRejectReason("");
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: any; label: string }> = {
      verified: { color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle, label: "Verified" },
      pending: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Clock, label: "Pending" },
      rejected: { color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", icon: XCircle, label: "Rejected" },
      unverified: { color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400", icon: AlertCircle, label: "Unverified" },
    };
    const config = variants[status] || variants.unverified;
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const filteredProviders = providers || [];
  const pendingCount = providers?.filter(p => p.verificationStatus === "pending").length || 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Provider Verification</h1>
          <p className="text-muted-foreground">
            Review and verify provider applications
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
            <SelectItem value="all">All Providers</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="unverified">Unverified</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load providers. Please try again later.
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="rounded-xl">
              <CardContent className="p-6">
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-20 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProviders.length === 0 ? (
        <Card className="rounded-xl">
          <CardContent className="p-12 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No providers found</h3>
            <p className="text-muted-foreground">
              {statusFilter === "pending"
                ? "No pending verifications at the moment"
                : `No ${statusFilter} providers`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map((provider) => (
            <Card key={provider.id} className="rounded-xl hover-elevate transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {provider.user.firstName?.[0] || provider.user.email[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold line-clamp-1">
                        {provider.user.firstName} {provider.user.lastName}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {provider.user.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    {getStatusBadge(provider.verificationStatus)}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Type</span>
                    <Badge variant="outline">
                      {provider.providerType === "licensed_professional"
                        ? "Licensed Professional"
                        : "Casual Tasker"}
                    </Badge>
                  </div>

                  {provider.companyName && (
                    <div>
                      <span className="text-sm text-muted-foreground">Company</span>
                      <p className="text-sm font-medium line-clamp-1">{provider.companyName}</p>
                    </div>
                  )}

                  {provider.phone && (
                    <div>
                      <span className="text-sm text-muted-foreground">Phone</span>
                      <p className="text-sm font-medium">{provider.phone}</p>
                    </div>
                  )}

                  {provider.serviceAreas?.emirates && (
                    <div>
                      <span className="text-sm text-muted-foreground">Service Areas</span>
                      <p className="text-sm font-medium line-clamp-1">
                        {provider.serviceAreas.emirates.join(", ")}
                      </p>
                    </div>
                  )}
                </div>

                {provider.bio && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {provider.bio}
                  </p>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setSelectedProvider(provider)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>

                  {provider.verificationStatus === "pending" && (
                    <>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => verifyMutation.mutate(provider.id)}
                        disabled={verifyMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedProvider(provider);
                          setShowRejectDialog(true);
                        }}
                        disabled={rejectMutation.isPending}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Provider Details Dialog */}
      <Dialog open={!!selectedProvider && !showRejectDialog} onOpenChange={(open) => !open && setSelectedProvider(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Provider Details</DialogTitle>
            <DialogDescription>
              Review provider information and verification status
            </DialogDescription>
          </DialogHeader>

          {selectedProvider && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xl">
                  {selectedProvider.user.firstName?.[0] || selectedProvider.user.email[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedProvider.user.firstName} {selectedProvider.user.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">{selectedProvider.user.email}</p>
                  {getStatusBadge(selectedProvider.verificationStatus)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Provider Type</Label>
                  <p className="text-sm mt-1">
                    {selectedProvider.providerType === "licensed_professional"
                      ? "Licensed Professional"
                      : "Casual Tasker"}
                  </p>
                </div>

                {selectedProvider.companyName && (
                  <div>
                    <Label>Company Name</Label>
                    <p className="text-sm mt-1">{selectedProvider.companyName}</p>
                  </div>
                )}

                <div>
                  <Label>Phone</Label>
                  <p className="text-sm mt-1">{selectedProvider.phone || "Not provided"}</p>
                </div>

                <div>
                  <Label>Languages</Label>
                  <p className="text-sm mt-1">
                    {selectedProvider.languages?.join(", ") || "Not specified"}
                  </p>
                </div>
              </div>

              {selectedProvider.bio && (
                <div>
                  <Label>Bio</Label>
                  <p className="text-sm mt-1 text-muted-foreground">{selectedProvider.bio}</p>
                </div>
              )}

              {selectedProvider.serviceAreas && (
                <div>
                  <Label>Service Areas</Label>
                  <p className="text-sm mt-1">
                    {selectedProvider.serviceAreas.emirates?.join(", ") || "Not specified"}
                  </p>
                </div>
              )}

              {selectedProvider.verificationDocuments && selectedProvider.verificationDocuments.length > 0 && (
                <div>
                  <Label>Verification Documents</Label>
                  <div className="mt-2 space-y-2">
                    {selectedProvider.verificationDocuments.map((doc, idx) => (
                      <a
                        key={idx}
                        href={doc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline block"
                      >
                        Document {idx + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                Applied: {new Date(selectedProvider.createdAt).toLocaleDateString()}
              </div>
            </div>
          )}

          {selectedProvider?.verificationStatus === "pending" && (
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedProvider(null)}
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
                onClick={() => selectedProvider && verifyMutation.mutate(selectedProvider.id)}
                disabled={verifyMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {verifyMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Verify Provider
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Provider</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this provider application
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
                selectedProvider &&
                rejectMutation.mutate({
                  providerId: selectedProvider.id,
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
                  Reject Provider
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
