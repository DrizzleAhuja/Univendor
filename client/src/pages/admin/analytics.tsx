import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminLayout } from "@/components/admin-layout";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  Package, 
  Store,
  DollarSign,
  Activity,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { useState } from "react";

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState("30d");

  // Fetch analytics data
  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["/api/orders"],
  });

  const { data: vendors = [] } = useQuery({
    queryKey: ["/api/vendors"],
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  // Calculate metrics
  const totalRevenue = orders.reduce((sum: number, order: any) => sum + parseFloat(order.total || 0), 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const totalVendors = vendors.length;
  const totalUsers = users.length;

  // Calculate growth metrics (mock data for demonstration)
  const revenueGrowth = 12.5; // %
  const orderGrowth = 8.3; // %
  const userGrowth = 15.2; // %
  const vendorGrowth = 6.8; // %

  // Recent orders
  const recentOrders = orders.slice(0, 5);

  // Top performing products
  const topProducts = products
    .sort((a: any, b: any) => (b.stock || 0) - (a.stock || 0))
    .slice(0, 5);

  // Top vendors by revenue (mock calculation)
  const topVendors = vendors
    .map((vendor: any) => ({
      ...vendor,
      revenue: orders
        .filter((order: any) => order.vendorId === vendor.id)
        .reduce((sum: number, order: any) => sum + parseFloat(order.total || 0), 0)
    }))
    .sort((a: any, b: any) => b.revenue - a.revenue)
    .slice(0, 5);

  const MetricCard = ({ 
    title, 
    value, 
    growth, 
    icon: Icon, 
    currency = false 
  }: { 
    title: string; 
    value: number; 
    growth: number; 
    icon: any; 
    currency?: boolean;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">
              {currency ? `₹${value.toFixed(2)}` : value.toLocaleString()}
            </p>
            <div className="flex items-center mt-2">
              {growth >= 0 ? (
                <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-600 mr-1" />
              )}
              <span className={`text-sm font-medium ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(growth)}%
              </span>
              <span className="text-sm text-gray-600 ml-1">vs last month</span>
            </div>
          </div>
          <Icon className={`w-8 h-8 ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Platform Analytics</h1>
              <p className="text-gray-600 mt-2">
                Comprehensive analytics and insights for your SaaS eCommerce platform
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Revenue"
            value={totalRevenue}
            growth={revenueGrowth}
            icon={DollarSign}
            currency={true}
          />
          <MetricCard
            title="Total Orders"
            value={totalOrders}
            growth={orderGrowth}
            icon={ShoppingCart}
          />
          <MetricCard
            title="Active Users"
            value={totalUsers}
            growth={userGrowth}
            icon={Users}
          />
          <MetricCard
            title="Active Vendors"
            value={totalVendors}
            growth={vendorGrowth}
            icon={Store}
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Total Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">{totalProducts.toLocaleString()}</p>
              <p className="text-sm text-gray-600 mt-2">Across all vendors</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Average Order Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">
                ₹{totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : "0.00"}
              </p>
              <p className="text-sm text-gray-600 mt-2">Per order</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Conversion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">3.2%</p>
              <p className="text-sm text-gray-600 mt-2">Visitors to customers</p>
            </CardContent>
          </Card>
        </div>

        {/* Data Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No orders yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between border-b border-gray-200 pb-2">
                      <div>
                        <p className="font-medium text-gray-900">Order #{order.id}</p>
                        <p className="text-sm text-gray-600">{order.customer?.email || 'Unknown Customer'}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">₹{parseFloat(order.total || 0).toFixed(2)}</p>
                        <Badge 
                          variant={
                            order.status === 'completed' ? 'default' :
                            order.status === 'shipped' ? 'secondary' :
                            order.status === 'processing' ? 'secondary' : 'destructive'
                          }
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Vendors */}
          <Card>
            <CardHeader>
              <CardTitle>Top Vendors by Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              {topVendors.length === 0 ? (
                <div className="text-center py-8">
                  <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No vendors yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topVendors.map((vendor: any, index: number) => (
                    <div key={vendor.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-semibold text-blue-600">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{vendor.name}</p>
                          <p className="text-sm text-gray-600">{vendor.domain}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">₹{vendor.revenue.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">Revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products by Stock</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No products yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-sm font-medium text-gray-600">Product</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-600">Vendor</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-600">Price</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-600">Stock</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((product: any) => (
                      <tr key={product.id} className="border-b border-gray-100">
                        <td className="py-3">
                          <div className="flex items-center">
                            <img 
                              src={product.imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=40&h=40&fit=crop"}
                              alt={product.name}
                              className="w-10 h-10 rounded-lg object-cover mr-3"
                            />
                            <div>
                              <p className="font-medium text-gray-900">{product.name}</p>
                              <p className="text-sm text-gray-600">{product.sku}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-sm text-gray-600">
                          {product.vendor?.name || 'Unknown Vendor'}
                        </td>
                        <td className="py-3 font-medium text-gray-900">
                          ₹{parseFloat(product.price || 0).toFixed(2)}
                        </td>
                        <td className="py-3 text-sm text-gray-600">
                          {product.stock || 0}
                        </td>
                        <td className="py-3">
                          <Badge variant={product.isActive ? "default" : "secondary"}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}