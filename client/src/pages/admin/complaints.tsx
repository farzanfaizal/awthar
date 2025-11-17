import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Eye, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
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

interface Complaint {
  id: string;
  type: string;
  description: string;
  status: string;
  adminNotes: string | null;
  createdAt: string;
  reporter: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  reportedUser: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null;
  reportedService: {
    titleEn: string;
    provider: {
      user: {
        firstName: string | null;
        lastName: string | null;
      };
    };
  } | null;
}

export default function AdminComplaints() {
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const queryClient = useQueryClient();

  const { data: complaints, isLoading, error } = useQuery<Complaint[]>({
    queryKey: ["/api/admin/complaints", statusFilter],
    queryFn: async () => {
      const url = statusFilter === "all"
        ? "/api/admin/complaints"
        : `/api/admin/complaints?status=${statusFilter}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch complaints");
      return response.json();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ complaintId, status, notes }: { complaintId: string; status: string; notes: string }) => {
      const response = await fetch(`/api/admin/complaints/${complaintId}/update-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotes: notes }),
      });
      if (!response.ok) throw new Error("Failed to update complaint");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/complaints"] });
      setShowUpdateDialog(false);
      setSelectedComplaint(null);
      setNewStatus("");
      setAdminNotes("");
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: any; label: string }> = {
      pending: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Clock, label: "Pending" },
      investigating: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", icon: Eye, label: "Investigating" },
      resolved: { color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle, label: "Resolved" },
      rejected: { color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", icon: XCircle, label: "Rejected" },
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const labels: Record<string, string> = {
      service_quality: "Service Quality",
      fraud: "Fraud",
      inappropriate_content: "Inappropriate Content",
      other: "Other",
    };
    return <Badge variant="outline">{labels[type] || type}</Badge>;
  };

  const filteredComplaints = complaints || [];
  const pendingCount = complaints?.filter(c => c.status === "pending").length || 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Complaints Management</h1>
            <p className="text-muted-foreground">
              Review and manage user complaints
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
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="investigating">Investigating</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="all">All Complaints</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load complaints. Please try again later.
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="rounded-xl">
                <CardContent className="p-6">
                  <div className="space-y-3 animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-20 bg-muted rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredComplaints.length === 0 ? (
          <Card className="rounded-xl">
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No complaints found</h3>
              <p className="text-muted-foreground">
                {statusFilter === "pending"
                  ? "No pending complaints at the moment"
                  : `No ${statusFilter} complaints`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredComplaints.map((complaint) => (
              <Card key={complaint.id} className="rounded-xl hover-elevate transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                        {complaint.reporter.firstName?.[0] || complaint.reporter.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold">
                          {complaint.reporter.firstName} {complaint.reporter.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">{complaint.reporter.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {getTypeBadge(complaint.type)}
                      {getStatusBadge(complaint.status)}
                    </div>
                  </div>

                  <div className="mb-4">
                    <Label className="text-sm font-semibold">Complaint Description</Label>
                    <p className="text-sm text-muted-foreground mt-1">{complaint.description}</p>
                  </div>

                  {complaint.reportedUser && (
                    <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                      <Label className="text-sm font-semibold">Reported User</Label>
                      <p className="text-sm mt-1">
                        {complaint.reportedUser.firstName} {complaint.reportedUser.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{complaint.reportedUser.email}</p>
                    </div>
                  )}

                  {complaint.reportedService && (
                    <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                      <Label className="text-sm font-semibold">Reported Service</Label>
                      <p className="text-sm mt-1">{complaint.reportedService.titleEn}</p>
                      <p className="text-xs text-muted-foreground">
                        by {complaint.reportedService.provider.user.firstName} {complaint.reportedService.provider.user.lastName}
                      </p>
                    </div>
                  )}

                  {complaint.adminNotes && (
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                      <Label className="text-sm font-semibold">Admin Notes</Label>
                      <p className="text-sm mt-1">{complaint.adminNotes}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <span>Reported: {new Date(complaint.createdAt).toLocaleString()}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedComplaint(complaint);
                        setAdminNotes(complaint.adminNotes || "");
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>

                    {complaint.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-500 text-blue-600 hover:bg-blue-50"
                          onClick={() => {
                            setSelectedComplaint(complaint);
                            setNewStatus("investigating");
                            setAdminNotes(complaint.adminNotes || "");
                            setShowUpdateDialog(true);
                          }}
                        >
                          Investigate
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            setSelectedComplaint(complaint);
                            setNewStatus("resolved");
                            setAdminNotes(complaint.adminNotes || "");
                            setShowUpdateDialog(true);
                          }}
                        >
                          Resolve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedComplaint(complaint);
                            setNewStatus("rejected");
                            setAdminNotes(complaint.adminNotes || "");
                            setShowUpdateDialog(true);
                          }}
                        >
                          Reject
                        </Button>
                      </>
                    )}

                    {complaint.status === "investigating" && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            setSelectedComplaint(complaint);
                            setNewStatus("resolved");
                            setAdminNotes(complaint.adminNotes || "");
                            setShowUpdateDialog(true);
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Resolve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedComplaint(complaint);
                            setNewStatus("rejected");
                            setAdminNotes(complaint.adminNotes || "");
                            setShowUpdateDialog(true);
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Update Status Dialog */}
        <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Complaint Status</DialogTitle>
              <DialogDescription>
                {newStatus === "resolved" && "Mark this complaint as resolved"}
                {newStatus === "rejected" && "Reject this complaint"}
                {newStatus === "investigating" && "Mark as investigating"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="notes">Admin Notes {newStatus !== "investigating" && "(Required)"}</Label>
                <Textarea
                  id="notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about your decision..."
                  rows={4}
                  className="mt-1"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowUpdateDialog(false);
                  setNewStatus("");
                  setAdminNotes("");
                }}
                disabled={updateStatusMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant={newStatus === "rejected" ? "destructive" : newStatus === "resolved" ? "default" : "outline"}
                onClick={() =>
                  selectedComplaint &&
                  updateStatusMutation.mutate({
                    complaintId: selectedComplaint.id,
                    status: newStatus,
                    notes: adminNotes,
                  })
                }
                disabled={(newStatus !== "investigating" && !adminNotes.trim()) || updateStatusMutation.isPending}
                className={newStatus === "resolved" ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {updateStatusMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    {newStatus === "resolved" && <CheckCircle className="h-4 w-4 mr-2" />}
                    {newStatus === "rejected" && <XCircle className="h-4 w-4 mr-2" />}
                    {newStatus === "investigating" && <Eye className="h-4 w-4 mr-2" />}
                    Update Status
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Details Dialog */}
        <Dialog open={!!selectedComplaint && !showUpdateDialog} onOpenChange={(open) => !open && setSelectedComplaint(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Complaint Details</DialogTitle>
              <DialogDescription>Full complaint information</DialogDescription>
            </DialogHeader>

            {selectedComplaint && (
              <div className="space-y-6">
                <div>
                  <Label>Reported By</Label>
                  <p className="text-sm mt-1">
                    {selectedComplaint.reporter.firstName} {selectedComplaint.reporter.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{selectedComplaint.reporter.email}</p>
                </div>

                <div>
                  <Label>Type</Label>
                  <div className="mt-1">{getTypeBadge(selectedComplaint.type)}</div>
                </div>

                <div>
                  <Label>Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedComplaint.status)}</div>
                </div>

                <div>
                  <Label>Description</Label>
                  <p className="text-sm mt-1 text-muted-foreground">{selectedComplaint.description}</p>
                </div>

                {selectedComplaint.reportedUser && (
                  <div>
                    <Label>Reported User</Label>
                    <p className="text-sm mt-1">
                      {selectedComplaint.reportedUser.firstName} {selectedComplaint.reportedUser.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{selectedComplaint.reportedUser.email}</p>
                  </div>
                )}

                {selectedComplaint.reportedService && (
                  <div>
                    <Label>Reported Service</Label>
                    <p className="text-sm mt-1">{selectedComplaint.reportedService.titleEn}</p>
                    <p className="text-xs text-muted-foreground">
                      by {selectedComplaint.reportedService.provider.user.firstName} {selectedComplaint.reportedService.provider.user.lastName}
                    </p>
                  </div>
                )}

                {selectedComplaint.adminNotes && (
                  <div>
                    <Label>Admin Notes</Label>
                    <p className="text-sm mt-1">{selectedComplaint.adminNotes}</p>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  Reported: {new Date(selectedComplaint.createdAt).toLocaleString()}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedComplaint(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
