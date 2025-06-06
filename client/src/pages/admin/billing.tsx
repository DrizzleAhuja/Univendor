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
import { AdminLayout } from "@/components/admin-layout";
import { 
  CreditCard, 
  DollarSign, 
  Calendar, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  Mail,
  FileText
} from "lucide-react";

export default function AdminBilling() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);

  // Fetch vendors for subscription data
  const { data: vendors = [] } = useQuery({
    queryKey: ["/api/vendors"],
    enabled: !!user,
  });

  // Mock subscription data based on vendors
  const subscriptions = vendors.map((vendor: any, index: number) => ({
    id: vendor.id,
    vendorId: vendor.id,
    vendorName: vendor.name,
    vendorEmail: vendor.owner?.email || 'unknown@email.com',
    plan: index % 3 === 0 ? 'Enterprise' : index % 3 === 1 ? 'Professional' : 'Basic',
    status: index % 4 === 0 ? 'active' : index % 4 === 1 ? 'trial' : index % 4 === 2 ? 'suspended' : 'cancelled',
    monthlyRevenue: (index + 1) * 299,
    nextBilling: new Date(Date.now() + (30 + index) * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - (90 + index * 10) * 24 * 60 * 60 * 1000),
    lastPayment: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000),
    totalRevenue: (index + 1) * 299 * 6
  }));

  // Filter subscriptions
  const filteredSubscriptions = subscriptions.filter((sub: any) => {
    const matchesSearch = sub.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.vendorEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
    const matchesPlan = planFilter === "all" || sub.plan === planFilter;
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  // Calculate billing statistics
  const getBillingStats = () => {
    const totalRevenue = subscriptions.reduce((sum: number, sub: any) => sum + sub.totalRevenue, 0);
    const monthlyRevenue = subscriptions.reduce((sum: number, sub: any) => sum + sub.monthlyRevenue, 0);
    const activeSubscriptions = subscriptions.filter((sub: any) => sub.status === 'active').length;
    const trialSubscriptions = subscriptions.filter((sub: any) => sub.status === 'trial').length;
    
    return {
      totalRevenue,
      monthlyRevenue,
      activeSubscriptions,
      trialSubscriptions,
      totalSubscriptions: subscriptions.length,
      churnRate: 5.2 // Mock churn rate
    };
  };

  const stats = getBillingStats();

  const getStatusBadge = (status: string) => {
    const variants = {
      active: { variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
      trial: { variant: "secondary" as const, icon: Clock, color: "text-blue-600" },
      suspended: { variant: "destructive" as const, icon: AlertTriangle, color: "text-yellow-600" },
      cancelled: { variant: "destructive" as const, icon: XCircle, color: "text-red-600" }
    };
    
    const config = variants[status as keyof typeof variants] || variants.cancelled;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPlanBadge = (plan: string) => {
    const colors = {
      Basic: "bg-gray-100 text-gray-800",
      Professional: "bg-blue-100 text-blue-800",
      Enterprise: "bg-purple-100 text-purple-800"
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[plan as keyof typeof colors] || colors.Basic}`}>
        {plan}
      </span>
    );
  };

  const handleStatusUpdate = useMutation({
    mutationFn: async ({ subscriptionId, newStatus }: { subscriptionId: number; newStatus: string }) => {
      // This would be an API call to update subscription status
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { subscriptionId, newStatus };
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Subscription status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update subscription status",
        variant: "destructive",
      });
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Billing & Subscriptions</h1>
            <p className="text-gray-600 mt-1">Manage vendor subscriptions and billing</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </Button>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Subscription
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">₹{stats.monthlyRevenue.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.activeSubscriptions}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Trial Subscriptions</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.trialSubscriptions}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Churn Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">{stats.churnRate}%</p>
              <p className="text-sm text-gray-600 mt-2">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Average Revenue Per User
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">
                ₹{stats.totalSubscriptions > 0 ? Math.round(stats.totalRevenue / stats.totalSubscriptions).toLocaleString() : '0'}
              </p>
              <p className="text-sm text-gray-600 mt-2">Per subscription</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Payment Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">98.5%</p>
              <p className="text-sm text-gray-600 mt-2">Last 30 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search vendors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="Basic">Basic</SelectItem>
                  <SelectItem value="Professional">Professional</SelectItem>
                  <SelectItem value="Enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Subscriptions Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Monthly Revenue</TableHead>
                    <TableHead>Total Revenue</TableHead>
                    <TableHead>Next Billing</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscriptions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center">
                          <CreditCard className="w-12 h-12 text-gray-400 mb-4" />
                          <p className="text-gray-600">No subscriptions found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSubscriptions.map((subscription: any) => (
                      <TableRow key={subscription.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">{subscription.vendorName}</p>
                            <p className="text-sm text-gray-600">{subscription.vendorEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getPlanBadge(subscription.plan)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(subscription.status)}
                        </TableCell>
                        <TableCell className="font-medium">
                          ₹{subscription.monthlyRevenue.toLocaleString()}
                        </TableCell>
                        <TableCell className="font-medium">
                          ₹{subscription.totalRevenue.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {subscription.nextBilling.toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedSubscription(subscription)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Subscription Details</DialogTitle>
                                </DialogHeader>
                                {selectedSubscription && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <h4 className="font-semibold">Vendor Information</h4>
                                        <p><strong>Name:</strong> {selectedSubscription.vendorName}</p>
                                        <p><strong>Email:</strong> {selectedSubscription.vendorEmail}</p>
                                        <p><strong>Plan:</strong> {selectedSubscription.plan}</p>
                                        <p><strong>Status:</strong> {getStatusBadge(selectedSubscription.status)}</p>
                                      </div>
                                      <div>
                                        <h4 className="font-semibold">Billing Information</h4>
                                        <p><strong>Monthly:</strong> ₹{selectedSubscription.monthlyRevenue.toLocaleString()}</p>
                                        <p><strong>Total:</strong> ₹{selectedSubscription.totalRevenue.toLocaleString()}</p>
                                        <p><strong>Next Billing:</strong> {selectedSubscription.nextBilling.toLocaleDateString()}</p>
                                        <p><strong>Last Payment:</strong> {selectedSubscription.lastPayment.toLocaleDateString()}</p>
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        variant="outline"
                                        onClick={() => handleStatusUpdate.mutate({
                                          subscriptionId: selectedSubscription.id,
                                          newStatus: selectedSubscription.status === 'active' ? 'suspended' : 'active'
                                        })}
                                        disabled={handleStatusUpdate.isPending}
                                      >
                                        {selectedSubscription.status === 'active' ? 'Suspend' : 'Activate'}
                                      </Button>
                                      <Button variant="outline">
                                        <Mail className="w-4 h-4 mr-2" />
                                        Send Invoice
                                      </Button>
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
      </div>
    </AdminLayout>
  );
}