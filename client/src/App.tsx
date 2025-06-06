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
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  // Debug logging for auth state
  useEffect(() => {
    console.log('[Router] Auth state:', { 
      isAuthenticated: !!user, 
      userRole: user?.role,
      currentPath: location,
      isLoading 
    });
  }, [user, location, isLoading]);

  if (isLoading) {
    console.log('[Router] Loading auth state...');
    return <div>Loading...</div>;
  }

  // Public routes (no auth required)
  if (!user) {
    console.log('[Router] User not authenticated, showing public routes');
    return (
      <Switch>
        <Route path="/" component={() => {
          logRoute('/', 'Login');
          return <Login />;
        }} />
        <Route path="/register" component={() => {
          logRoute('/register', 'Register');
          return <Login />;
        }} />
        <Route component={() => {
          logRoute('*', 'NotFound');
          return <NotFound />;
        }} />
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
          <Route path="/admin/users" component={() => {
            logRoute('/admin/users', 'AdminUsers');
            return <AdminUsers />;
          }} />
          <Route path="/admin/settings" component={() => {
            logRoute('/admin/settings', 'AdminSettings');
            return <AdminSettings />;
          }} />
        </>
      )}

      {/* Seller routes */}
      {user.role === 'seller' && (
        <>
          <Route path="/seller/products" component={() => {
            logRoute('/seller/products', 'SellerProducts');
            return <SellerDashboard />;
          }} />
          <Route path="/seller/orders" component={() => {
            logRoute('/seller/orders', 'SellerOrders');
            return <SellerDashboard />;
          }} />
        </>
      )}

      {/* Buyer routes */}
      {user.role === 'buyer' && (
        <>
          <Route path="/buyer/orders" component={() => {
            logRoute('/buyer/orders', 'BuyerOrders');
            return <BuyerDashboard />;
          }} />
          <Route path="/buyer/profile" component={() => {
            logRoute('/buyer/profile', 'BuyerProfile');
            return <BuyerDashboard />;
          }} />
        </>
      )}

      {/* Redirect root to dashboard if authenticated */}
      <Route path="/" component={() => {
        logRoute('/', 'RedirectToDashboard');
        window.location.href = '/dashboard';
        return null;
      }} />

      {/* Catch-all route */}
      <Route component={() => {
        logRoute('*', 'NotFound');
        return <NotFound />;
      }} />
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
