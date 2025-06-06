import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminLayout } from "@/components/admin-layout";
import { 
  Shield, 
  Users, 
  Key, 
  Lock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  Eye,
  EyeOff,
  Settings,
  Activity,
  Globe
} from "lucide-react";

export default function AdminSecurity() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("users");

  // Fetch users for role management
  const { data: users = [] } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: !!user,
  });

  // Mock security settings data
  const securitySettings = {
    twoFactorEnabled: true,
    passwordRequirements: {
      minLength: 8,
      requireUppercase: true,
      requireNumbers: true,
      requireSpecialChars: true
    },
    sessionTimeout: 24, // hours
    maxLoginAttempts: 5,
    ipWhitelisting: false,
    apiRateLimit: 1000, // requests per hour
    dataEncryption: true,
    auditLogging: true
  };

  // Mock activity logs
  const activityLogs = [
    {
      id: 1,
      user: "admin@saascommerce.com",
      action: "User role updated",
      target: "seller@example.com",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      ip: "192.168.1.100",
      status: "success"
    },
    {
      id: 2,
      user: "admin@saascommerce.com",
      action: "Security settings updated",
      target: "2FA settings",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      ip: "192.168.1.100",
      status: "success"
    },
    {
      id: 3,
      user: "unknown",
      action: "Failed login attempt",
      target: "admin panel",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      ip: "203.0.113.45",
      status: "failed"
    }
  ];

  // Filter users based on search and filters
  const filteredUsers = users.filter((user: any) => {
    const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && user.isActive) ||
                         (statusFilter === "inactive" && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role: string) => {
    const variants = {
      super_admin: { variant: "default" as const, color: "bg-red-100 text-red-800" },
      admin: { variant: "secondary" as const, color: "bg-blue-100 text-blue-800" },
      seller: { variant: "secondary" as const, color: "bg-green-100 text-green-800" },
      buyer: { variant: "secondary" as const, color: "bg-gray-100 text-gray-800" }
    };
    
    const config = variants[role as keyof typeof variants] || variants.buyer;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {role.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? "default" : "secondary"}>
        {isActive ? "Active" : "Inactive"}
      </Badge>
    );
  };

  const getActivityStatusBadge = (status: string) => {
    const Icon = status === "success" ? CheckCircle : status === "failed" ? XCircle : Clock;
    const color = status === "success" ? "text-green-600" : status === "failed" ? "text-red-600" : "text-yellow-600";
    
    return (
      <div className={`flex items-center gap-1 ${color}`}>
        <Icon className="w-4 h-4" />
        <span className="capitalize">{status}</span>
      </div>
    );
  };

  const updateUserRole = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: number; newRole: string }) => {
      await apiRequest("PUT", `/api/admin/users/${userId}/role`, { role: newRole });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    },
  });

  const toggleUserStatus = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: number; isActive: boolean }) => {
      await apiRequest("PUT", `/api/admin/users/${userId}/status`, { isActive });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    },
  });

  // Calculate security metrics
  const getSecurityStats = () => {
    const totalUsers = users.length;
    const activeUsers = users.filter((u: any) => u.isActive).length;
    const adminUsers = users.filter((u: any) => u.role?.includes('admin')).length;
    const failedLogins = activityLogs.filter(log => log.status === "failed").length;
    
    return {
      totalUsers,
      activeUsers,
      adminUsers,
      failedLogins,
      securityScore: 85 // Mock security score
    };
  };

  const stats = getSecurityStats();

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Security & Permissions</h1>
            <p className="text-gray-600 mt-1">Manage user access, roles, and security settings</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Security Report
            </Button>
            <Button className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security Audit
            </Button>
          </div>
        </div>

        {/* Security Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.activeUsers}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Admin Users</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.adminUsers}</p>
                </div>
                <Key className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Failed Logins</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.failedLogins}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Security Score</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.securityScore}%</p>
                </div>
                <Shield className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="settings">Security Settings</TabsTrigger>
            <TabsTrigger value="logs">Activity Logs</TabsTrigger>
          </TabsList>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Role Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="seller">Seller</SelectItem>
                      <SelectItem value="buyer">Buyer</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <div className="flex flex-col items-center">
                              <Users className="w-12 h-12 text-gray-400 mb-4" />
                              <p className="text-gray-600">No users found</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user: any) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'Unknown User'}
                                </p>
                                <p className="text-sm text-gray-600">{user.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getRoleBadge(user.role || 'buyer')}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(user.isActive !== false)}
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-600">
                                {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-600">
                                {new Date(user.createdAt).toLocaleDateString()}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setSelectedUser(user)}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>Edit User Permissions</DialogTitle>
                                    </DialogHeader>
                                    {selectedUser && (
                                      <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <h4 className="font-semibold">User Information</h4>
                                            <p><strong>Name:</strong> {selectedUser.firstName || 'Unknown'} {selectedUser.lastName || 'User'}</p>
                                            <p><strong>Email:</strong> {selectedUser.email}</p>
                                            <p><strong>Current Role:</strong> {getRoleBadge(selectedUser.role || 'buyer')}</p>
                                            <p><strong>Status:</strong> {getStatusBadge(selectedUser.isActive !== false)}</p>
                                          </div>
                                          <div>
                                            <h4 className="font-semibold">Role Management</h4>
                                            <div className="space-y-2 mt-2">
                                              <Select
                                                value={selectedUser.role || 'buyer'}
                                                onValueChange={(newRole) => updateUserRole.mutate({
                                                  userId: selectedUser.id,
                                                  newRole
                                                })}
                                              >
                                                <SelectTrigger>
                                                  <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="buyer">Buyer</SelectItem>
                                                  <SelectItem value="seller">Seller</SelectItem>
                                                  <SelectItem value="admin">Admin</SelectItem>
                                                  <SelectItem value="super_admin">Super Admin</SelectItem>
                                                </SelectContent>
                                              </Select>
                                              <div className="flex items-center space-x-2">
                                                <Switch
                                                  checked={selectedUser.isActive !== false}
                                                  onCheckedChange={(isActive) => toggleUserStatus.mutate({
                                                    userId: selectedUser.id,
                                                    isActive
                                                  })}
                                                />
                                                <span className="text-sm">Active Account</span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lock className="w-5 h-5 mr-2" />
                    Authentication Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-600">Require 2FA for admin accounts</p>
                    </div>
                    <Switch checked={securitySettings.twoFactorEnabled} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Session Timeout</p>
                      <p className="text-sm text-gray-600">{securitySettings.sessionTimeout} hours</p>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Max Login Attempts</p>
                      <p className="text-sm text-gray-600">{securitySettings.maxLoginAttempts} attempts</p>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="w-5 h-5 mr-2" />
                    Access Control
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">IP Whitelisting</p>
                      <p className="text-sm text-gray-600">Restrict access by IP address</p>
                    </div>
                    <Switch checked={securitySettings.ipWhitelisting} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">API Rate Limiting</p>
                      <p className="text-sm text-gray-600">{securitySettings.apiRateLimit} requests/hour</p>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Data Encryption</p>
                      <p className="text-sm text-gray-600">Encrypt sensitive data</p>
                    </div>
                    <Switch checked={securitySettings.dataEncryption} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Key className="w-5 h-5 mr-2" />
                    Password Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Minimum length: {securitySettings.passwordRequirements.minLength} characters</span>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Require uppercase letters</span>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Require numbers</span>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Require special characters</span>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Monitoring & Logging
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Audit Logging</p>
                      <p className="text-sm text-gray-600">Log all admin actions</p>
                    </div>
                    <Switch checked={securitySettings.auditLogging} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Real-time Alerts</p>
                      <p className="text-sm text-gray-600">Alert on suspicious activity</p>
                    </div>
                    <Switch checked={true} />
                  </div>
                  <Button className="w-full">
                    <Settings className="w-4 h-4 mr-2" />
                    Configure Alerts
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Logs Tab */}
          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Activity Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activityLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium">{log.user}</TableCell>
                          <TableCell>{log.action}</TableCell>
                          <TableCell>{log.target}</TableCell>
                          <TableCell className="font-mono text-sm">{log.ip}</TableCell>
                          <TableCell>{log.timestamp.toLocaleString()}</TableCell>
                          <TableCell>{getActivityStatusBadge(log.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}