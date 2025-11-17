import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users as UsersIcon, Shield, UserCircle, Mail, Calendar, Loader2 } from "lucide-react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AdminLayout } from "@/components/admin-layout";

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminUsers() {
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const { data: users, isLoading, error } = useQuery<User[]>({
    queryKey: ["/api/admin/users", roleFilter],
    queryFn: async () => {
      const url = roleFilter === "all"
        ? "/api/admin/users"
        : `/api/admin/users?role=${roleFilter}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const response = await fetch(`/api/admin/users/${userId}/update-role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!response.ok) throw new Error("Failed to update user role");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setShowEditDialog(false);
      setSelectedUser(null);
      setNewRole("");
    },
  });

  const getRoleBadge = (role: string) => {
    const variants: Record<string, { color: string; icon: any; label: string }> = {
      admin: { color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400", icon: Shield, label: "Admin" },
      provider: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", icon: UserCircle, label: "Provider" },
      customer: { color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: UserCircle, label: "Customer" },
    };
    const config = variants[role] || variants.customer;
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const handleEditRole = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowEditDialog(true);
  };

  const filteredUsers = users?.filter(user => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.email.toLowerCase().includes(query) ||
      user.firstName?.toLowerCase().includes(query) ||
      user.lastName?.toLowerCase().includes(query)
    );
  }) || [];

  const roleStats = {
    total: users?.length || 0,
    admin: users?.filter(u => u.role === "admin").length || 0,
    provider: users?.filter(u => u.role === "provider").length || 0,
    customer: users?.filter(u => u.role === "customer").length || 0,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-muted-foreground">
              Manage user accounts and roles
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{roleStats.total}</p>
                </div>
                <UsersIcon className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Admins</p>
                  <p className="text-2xl font-bold text-purple-600">{roleStats.admin}</p>
                </div>
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Providers</p>
                  <p className="text-2xl font-bold text-blue-600">{roleStats.provider}</p>
                </div>
                <UserCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Customers</p>
                  <p className="text-2xl font-bold text-green-600">{roleStats.customer}</p>
                </div>
                <UserCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="provider">Provider</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load users. Please try again later.
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="rounded-xl">
                <CardContent className="p-6">
                  <div className="space-y-4 animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-8 bg-muted rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <Card className="rounded-xl">
            <CardContent className="p-12 text-center">
              <UsersIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No users found</h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "No users match your search criteria"
                  : roleFilter === "all"
                  ? "No users in the system"
                  : `No ${roleFilter} users found`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="rounded-xl hover-elevate transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {user.profileImageUrl ? (
                        <img
                          src={user.profileImageUrl}
                          alt={user.firstName || user.email}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                          {user.firstName?.[0] || user.email[0].toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold line-clamp-1">
                          {user.firstName && user.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : user.firstName || user.lastName || "No Name"}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-1 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Role</span>
                      {getRoleBadge(user.role)}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Joined</span>
                      <span className="text-sm font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleEditRole(user)}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Change Role
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Role Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update User Role</DialogTitle>
              <DialogDescription>
                Change the role for this user
              </DialogDescription>
            </DialogHeader>

            {selectedUser && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  {selectedUser.profileImageUrl ? (
                    <img
                      src={selectedUser.profileImageUrl}
                      alt={selectedUser.firstName || selectedUser.email}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {selectedUser.firstName?.[0] || selectedUser.email[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold">
                      {selectedUser.firstName && selectedUser.lastName
                        ? `${selectedUser.firstName} ${selectedUser.lastName}`
                        : selectedUser.firstName || selectedUser.lastName || "No Name"}
                    </h3>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="role">New Role</Label>
                  <Select value={newRole} onValueChange={setNewRole}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="provider">Provider</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Changing a user's role will affect their permissions and access to features.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditDialog(false);
                  setSelectedUser(null);
                  setNewRole("");
                }}
                disabled={updateRoleMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={() =>
                  selectedUser &&
                  updateRoleMutation.mutate({
                    userId: selectedUser.id,
                    role: newRole,
                  })
                }
                disabled={
                  !newRole ||
                  newRole === selectedUser?.role ||
                  updateRoleMutation.isPending
                }
              >
                {updateRoleMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Update Role
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
