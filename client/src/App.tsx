import { Route, Switch, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import SuperAdminDashboard from "@/pages/super-admin-dashboard";
import SellerDashboard from "@/pages/seller-dashboard";
import BuyerDashboard from "@/pages/buyer-dashboard";
import Storefront from "@/pages/storefront";
import NotFound from "@/pages/not-found";
import AdminUsers from "@/pages/admin/users";
import AdminVendors from "@/pages/admin/vendors";
import AdminDomains from "@/pages/admin/domains";
import AdminCategories from "@/pages/admin/categories";
import AdminOrders from "@/pages/admin/orders";
import AdminProducts from "@/pages/admin/products";
import AdminAnalytics from "@/pages/admin/analytics";
import AdminBilling from "@/pages/admin/billing";
import AdminSecurity from "@/pages/admin/security";
import AdminSystem from "@/pages/admin/system";
import AdminSettings from "@/pages/admin/settings";
import SellerCategories from "@/pages/seller/categories";
import Cart from "@/pages/buyer/cart";
import { useEffect } from "react";

// Debug logging for routing
const logRoute = (path: string, component: string) => {
  console.log(`[Router] Rendering ${component} for path: ${path}`);
};

export function Router() {
  const { user, isLoading, error } = useAuth();
  const [location] = useLocation();

  // Debug logging for auth state
  useEffect(() => {
    console.log('[Router] Auth state:', { 
      isAuthenticated: !!user, 
      userRole: user?.role,
      currentPath: location,
      isLoading,
      error 
    });
  }, [user, location, isLoading, error]);

  // Show loading state only briefly
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Handle auth error
  if (error) {
    console.log('[Router] Auth error:', error);
    return (
      <Switch>
        <Route path="/" component={Login} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Login} />
        <Route path="/store/:domain?" component={Storefront} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Public routes (no auth required)
  if (!user) {
    console.log('[Router] User not authenticated, showing public routes');
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Login} />
        <Route path="/store/:domain?" component={Storefront} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Protected routes (auth required)
  console.log('[Router] User authenticated, showing protected routes for role:', user.role);
  return (
    <Switch>
      {/* Dashboard routes based on user role */}
      <Route path="/dashboard" component={() => {
        logRoute('/dashboard', `${user.role}Dashboard`);
        switch (user.role) {
          case 'super_admin':
            return <SuperAdminDashboard />;
          case 'seller':
            return <SellerDashboard />;
          case 'buyer':
            return <BuyerDashboard />;
          default:
            console.error('[Router] Unknown user role:', user.role);
            return <NotFound />;
        }
      }} />

      {/* Admin routes */}
      {user.role === 'super_admin' && (
        <>
          <Route path="/admin/users" component={AdminUsers} />
          <Route path="/admin/vendors" component={AdminVendors} />
          <Route path="/admin/domains" component={AdminDomains} />
          <Route path="/admin/categories" component={AdminCategories} />
          <Route path="/admin/orders" component={AdminOrders} />
          <Route path="/admin/products" component={AdminProducts} />
          <Route path="/admin/analytics" component={AdminAnalytics} />
          <Route path="/admin/billing" component={AdminBilling} />
          <Route path="/admin/security" component={AdminSecurity} />
          <Route path="/admin/system" component={AdminSystem} />
          <Route path="/admin/settings" component={AdminSettings} />
        </>
      )}

      {/* Seller routes */}
      {user.role === 'seller' && (
        <>
          <Route path="/seller" component={SellerDashboard} />
          <Route path="/seller/categories" component={SellerCategories} />
          <Route path="/seller/products" component={SellerDashboard} />
          <Route path="/seller/orders" component={SellerDashboard} />
          <Route path="/seller/analytics" component={SellerDashboard} />
          <Route path="/seller/settings" component={SellerDashboard} />
        </>
      )}

      {/* Buyer routes */}
      {user.role === 'buyer' && (
        <>
          <Route path="/buyer" component={BuyerDashboard} />
          <Route path="/buyer/cart" component={Cart} />
          <Route path="/buyer/orders" component={BuyerDashboard} />
          <Route path="/buyer/profile" component={BuyerDashboard} />
        </>
      )}

      {/* Public routes that are still accessible when authenticated */}
      <Route path="/store/:domain?" component={Storefront} />

      {/* Redirect root to dashboard if authenticated */}
      <Route path="/" component={() => {
        logRoute('/', 'RedirectToDashboard');
        window.location.href = '/dashboard';
        return null;
      }} />

      {/* Catch-all route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
