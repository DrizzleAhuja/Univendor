import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import DashboardLayout from "@/components/layout/dashboard-layout";

export default function BuyerDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

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

  const { data: orders = [] } = useQuery({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });

  const { data: cartItems = [] } = useQuery({
    queryKey: ["/api/cart"],
    enabled: !!user,
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

  const totalSpent = orders.reduce((sum, order) => 
    sum + parseFloat(order.total), 0
  );

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">My Account</h2>
          <p className="text-gray-600">View your orders, cart, and account settings</p>
        </div>

        {/* Account Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded-lg">
                  <i className="fas fa-shopping-bag text-primary text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cart Items</p>
                  <p className="text-3xl font-bold text-gray-900">{cartItems.length}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-lg">
                  <i className="fas fa-shopping-cart text-orange-600 text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-3xl font-bold text-gray-900">${totalSpent.toFixed(2)}</p>
                </div>
                <div className="bg-secondary bg-opacity-10 p-3 rounded-lg">
                  <i className="fas fa-dollar-sign text-secondary text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order History */}
        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <i className="fas fa-shopping-cart text-gray-400 text-4xl mb-4"></i>
                <p className="text-gray-600 mb-4">No orders yet. Start shopping!</p>
                <Link href="/store">
                  <Button>Browse Stores</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start mb-3">
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
                          order.status === 'shipped' ? 'outline' :
                          'destructive'
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                    
                    {order.items && order.items.length > 0 && (
                      <div className="flex items-center space-x-4 mb-3">
                        <img 
                          src={order.items[0].product?.imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=60&h=60&fit=crop"} 
                          alt="Order item"
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {order.items[0].product?.name}
                            {order.items.length > 1 && ` + ${order.items.length - 1} more items`}
                          </p>
                          <p className="text-sm text-gray-600">{order.vendor?.name}</p>
                        </div>
                        <p className="font-semibold text-gray-900">₹{order.total}</p>
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      {order.status === 'shipped' && (
                        <Button variant="outline" size="sm">
                          Track Package
                        </Button>
                      )}
                      {order.status === 'delivered' && (
                        <Button variant="outline" size="sm">
                          Reorder
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
