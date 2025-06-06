import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductForm } from "@/components/product-form";
import DashboardLayout from "@/components/layout/dashboard-layout";

export default function SellerDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: vendor } = useQuery({
    queryKey: ["/api/vendors/my"],
    enabled: !!user && user.role === 'seller',
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products", vendor?.id],
    queryFn: async () => {
      if (!vendor) return [];
      const response = await fetch(`/api/products?vendorId=${vendor.id}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
    enabled: !!vendor,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["/api/orders"],
    enabled: !!user && user.role === 'seller',
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      await apiRequest("DELETE", `/api/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user.role !== 'seller') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <i className="fas fa-ban text-red-500 text-4xl mb-4"></i>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const todaysOrders = orders.filter(order => {
    const today = new Date().toDateString();
    return new Date(order.createdAt).toDateString() === today;
  });

  const pendingOrders = orders.filter(order => order.status === 'pending');

  const totalRevenue = orders.reduce((sum, order) => 
    sum + parseFloat(order.total), 0
  );

  const renderContent = () => {
    switch (location) {
      case '/seller/products':
        return renderProductsSection();
      case '/seller/orders':
        return renderOrdersSection();
      case '/seller/analytics':
        return renderAnalyticsSection();
      case '/seller/settings':
        return renderSettingsSection();
      default:
        return renderDashboardSection();
    }
  };

  const renderDashboardSection = () => (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Seller Dashboard</h2>
        <p className="text-gray-600">Manage your products, orders, and store performance</p>
      </div>

      {!vendor ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <i className="fas fa-store text-gray-400 text-4xl mb-4"></i>
            <h3 className="text-lg font-semibold mb-2">No Store Found</h3>
            <p className="text-gray-600">Contact admin to set up your store.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Store Info */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{vendor.name}</h3>
                  <p className="text-gray-600">{vendor.domain}</p>
                  <p className="text-sm text-gray-500 mt-1">{vendor.description}</p>
                </div>
                <Badge variant={vendor.status === 'active' ? 'default' : 'secondary'}>
                  {vendor.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Seller Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Products</p>
                    <p className="text-3xl font-bold text-gray-900">{products.length}</p>
                  </div>
                  <div className="bg-primary bg-opacity-10 p-3 rounded-lg">
                    <i className="fas fa-box text-primary text-xl"></i>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Orders Today</p>
                    <p className="text-3xl font-bold text-gray-900">{todaysOrders.length}</p>
                  </div>
                  <div className="bg-secondary bg-opacity-10 p-3 rounded-lg">
                    <i className="fas fa-shopping-bag text-secondary text-xl"></i>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
                  </div>
                  <div className="bg-accent bg-opacity-10 p-3 rounded-lg">
                    <i className="fas fa-chart-line text-accent text-xl"></i>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                    <p className="text-3xl font-bold text-gray-900">{pendingOrders.length}</p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-lg">
                    <i className="fas fa-clock text-red-600 text-xl"></i>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <i className="fas fa-shopping-cart text-gray-400 text-4xl mb-4"></i>
                  <p className="text-gray-600">No orders yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">Order #{order.id}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge 
                          variant={
                            order.status === 'delivered' ? 'default' :
                            order.status === 'pending' ? 'secondary' :
                            'outline'
                          }
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600">
                          {order.customer?.email}
                        </p>
                        <p className="font-semibold text-gray-900">${order.total}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </>
  );

  const renderProductsSection = () => (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Products</h2>
        <p className="text-gray-600">Manage your product catalog</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Product Management</CardTitle>
            <Button onClick={() => {
              setEditingProduct(null);
              setShowProductForm(true);
            }}>
              <i className="fas fa-plus mr-2"></i>Add Product
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {productsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8">
              <i className="fas fa-box text-gray-400 text-4xl mb-4"></i>
              <p className="text-gray-600">No products found. Add your first product to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <img 
                    src={product.imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop"} 
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{product.name}</h4>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-primary">${product.price}</span>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setEditingProduct(product);
                            setShowProductForm(true);
                          }}
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteProductMutation.mutate(product.id)}
                          disabled={deleteProductMutation.isPending}
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );

  const renderOrdersSection = () => (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Orders</h2>
        <p className="text-gray-600">Manage your customer orders</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <i className="fas fa-shopping-cart text-gray-400 text-4xl mb-4"></i>
              <p className="text-gray-600">No orders yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">Order #{order.id}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge 
                      variant={
                        order.status === 'delivered' ? 'default' :
                        order.status === 'pending' ? 'secondary' :
                        'outline'
                      }
                    >
                      {order.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      {order.customer?.email}
                    </p>
                    <p className="font-semibold text-gray-900">${order.total}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );

  const renderAnalyticsSection = () => (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h2>
        <p className="text-gray-600">Track your store performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-3xl font-bold text-gray-900">{products.length}</p>
              </div>
              <div className="bg-primary bg-opacity-10 p-3 rounded-lg">
                <i className="fas fa-box text-primary text-xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
              </div>
              <div className="bg-secondary bg-opacity-10 p-3 rounded-lg">
                <i className="fas fa-shopping-bag text-secondary text-xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
              </div>
              <div className="bg-accent bg-opacity-10 p-3 rounded-lg">
                <i className="fas fa-chart-line text-accent text-xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-3xl font-bold text-gray-900">{pendingOrders.length}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <i className="fas fa-clock text-red-600 text-xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <i className="fas fa-chart-bar text-gray-400 text-4xl mb-4"></i>
            <p className="text-gray-600">Analytics dashboard coming soon.</p>
          </div>
        </CardContent>
      </Card>
    </>
  );

  const renderSettingsSection = () => (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Store Settings</h2>
        <p className="text-gray-600">Configure your store preferences</p>
      </div>

      {vendor && (
        <Card>
          <CardHeader>
            <CardTitle>Store Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Store Name</label>
                <p className="text-gray-900">{vendor.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Domain</label>
                <p className="text-gray-900">{vendor.domain}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <p className="text-gray-900">{vendor.description || 'No description set'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Badge variant={vendor.status === 'active' ? 'default' : 'secondary'}>
                  {vendor.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );

  return (
    <DashboardLayout>
      <div className="p-8">
        {!vendor ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <i className="fas fa-store text-gray-400 text-4xl mb-4"></i>
              <h3 className="text-lg font-semibold mb-2">No Store Found</h3>
              <p className="text-gray-600">Contact admin to set up your store.</p>
            </CardContent>
          </Card>
        ) : (
          renderContent()
        )}
      </div>

      {showProductForm && (
        <ProductForm 
          isOpen={showProductForm}
          onClose={() => {
            setShowProductForm(false);
            setEditingProduct(null);
          }}
          product={editingProduct}
          vendorId={vendor?.id}
        />
      )}
    </DashboardLayout>
  );
}