import { Link } from "wouter";
import {
  Users,
  Shield,
  AlertCircle,
  FileText,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AdminLayout } from "@/components/admin-layout";

interface DashboardStats {
  totalUsers: number;
  totalProviders: number;
  totalServices: number;
  pendingProviders: number;
  pendingServices: number;
  pendingComplaints: number;
}

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading, error } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/dashboard"],
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Failed to load dashboard statistics. Please try refreshing the page.
                  </AlertDescription>
                </Alert>
              )}

              {/* Platform Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="rounded-xl">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {statsLoading ? (
                      <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                    ) : (
                      <>
                        <div className="text-2xl font-bold">{stats?.totalUsers.toLocaleString() || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Registered platform users
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card className="rounded-xl">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">Service Providers</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {statsLoading ? (
                      <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                    ) : (
                      <>
                        <div className="text-2xl font-bold">{stats?.totalProviders.toLocaleString() || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Active provider accounts
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card className="rounded-xl">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">Service Listings</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {statsLoading ? (
                      <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                    ) : (
                      <>
                        <div className="text-2xl font-bold">{stats?.totalServices.toLocaleString() || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Total services listed
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Pending Actions */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Pending Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Link href="/admin/providers?status=pending">
                    <Card className="rounded-xl cursor-pointer hover-elevate transition-all border-2">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                            <Clock className="h-6 w-6 text-warning" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">Provider Verification</h3>
                            {statsLoading ? (
                              <div className="h-6 w-16 bg-muted animate-pulse rounded" />
                            ) : (
                              <p className="text-3xl font-bold">{stats?.pendingProviders || 0}</p>
                            )}
                            <p className="text-sm text-muted-foreground mt-1">
                              Awaiting verification
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link href="/admin/services?status=pending_review">
                    <Card className="rounded-xl cursor-pointer hover-elevate transition-all border-2">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg bg-info/10 flex items-center justify-center">
                            <FileText className="h-6 w-6 text-info" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">Service Moderation</h3>
                            {statsLoading ? (
                              <div className="h-6 w-16 bg-muted animate-pulse rounded" />
                            ) : (
                              <p className="text-3xl font-bold">{stats?.pendingServices || 0}</p>
                            )}
                            <p className="text-sm text-muted-foreground mt-1">
                              Pending review
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link href="/admin/complaints?status=pending">
                    <Card className="rounded-xl cursor-pointer hover-elevate transition-all border-2">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                            <AlertCircle className="h-6 w-6 text-destructive" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">Complaints</h3>
                            {statsLoading ? (
                              <div className="h-6 w-16 bg-muted animate-pulse rounded" />
                            ) : (
                              <p className="text-3xl font-bold">{stats?.pendingComplaints || 0}</p>
                            )}
                            <p className="text-sm text-muted-foreground mt-1">
                              Need attention
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </div>

              {/* Quick Actions */}
              <Card className="rounded-xl">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/admin/providers">
                      <Button
                        variant="outline"
                        className="w-full h-auto py-6 rounded-xl hover-elevate active-elevate-2 flex flex-col gap-2"
                      >
                        <Shield className="h-6 w-6" />
                        <span>Review Providers</span>
                      </Button>
                    </Link>
                    <Link href="/admin/services">
                      <Button
                        variant="outline"
                        className="w-full h-auto py-6 rounded-xl hover-elevate active-elevate-2 flex flex-col gap-2"
                      >
                        <FileText className="h-6 w-6" />
                        <span>Moderate Services</span>
                      </Button>
                    </Link>
                    <Link href="/admin/users">
                      <Button
                        variant="outline"
                        className="w-full h-auto py-6 rounded-xl hover-elevate active-elevate-2 flex flex-col gap-2"
                      >
                        <Users className="h-6 w-6" />
                        <span>Manage Users</span>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* System Health */}
              <Card className="rounded-xl">
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                  <CardDescription>Platform health and performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-success" />
                        <span className="font-medium">Database</span>
                      </div>
                      <span className="text-sm text-muted-foreground">Operational</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-success" />
                        <span className="font-medium">Authentication</span>
                      </div>
                      <span className="text-sm text-muted-foreground">Operational</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-success" />
                        <span className="font-medium">File Storage</span>
                      </div>
                      <span className="text-sm text-muted-foreground">Operational</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
      </div>
    </AdminLayout>
  );
}
