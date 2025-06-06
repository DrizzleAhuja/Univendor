import { Switch, Route, useLocation } from "wouter";
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
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  // Handle redirection based on user role after authentication
  // This useEffect will run when isAuthenticated or user changes
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // User is authenticated, redirect to appropriate dashboard if they are on a public route like '/'
        if (location === '/' || location === '/login') {
          if (user?.role === 'super_admin') {
            setLocation('/admin');
          } else if (user?.role === 'seller') {
            setLocation('/seller');
          } else if (user?.role === 'buyer') {
            setLocation('/buyer');
          }
        }
      } else {
        // User is not authenticated, redirect to login if they are on a protected route
        // This part might be less critical now as protected routes are conditionally rendered
        // but keeping it for robustness.
        if (location !== '/' && location !== '/login' && !location.startsWith('/store')) {
             // Example: if they somehow land on /buyer when not logged in, send them to login
             // Be careful with this - ensure all public routes are explicitly handled above.
             // For now, let's rely on the conditional rendering below to handle this.
        }
      }
    }
  }, [isAuthenticated, isLoading, user, setLocation, location]);

  // Show loading state while determining auth status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Once loading is false, render routes based on authentication status
  return (
    <Switch>
      {/* Public Routes - accessible to everyone */}
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/store/:domain?" component={Storefront} />

      {/* Authenticated Routes - only accessible if isAuthenticated is true */}
      {isAuthenticated ? (
        <>
          {/* Admin routes */}
          {user?.role === 'super_admin' && (
            <>
              <Route path="/admin" component={SuperAdminDashboard} />
              <Route path="/admin/users" component={AdminUsers} />
              <Route path="/admin/vendors" component={AdminVendors} />
              <Route path="/admin/domains" component={AdminDomains} />
              <Route path="/admin/categories" component={AdminCategories} />
              <Route path="/admin/products" component={AdminProducts} />
              <Route path="/admin/orders" component={AdminOrders} />
              <Route path="/admin/analytics" component={AdminAnalytics} />
              <Route path="/admin/billing" component={AdminBilling} />
              <Route path="/admin/security" component={AdminSecurity} />
              <Route path="/admin/system" component={AdminSystem} />
              <Route path="/admin/settings" component={AdminSettings} />
            </>
          )}
          
          {/* Seller routes */}
          {user?.role === 'seller' && (
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
          {user?.role === 'buyer' && (
             <>
               <Route path="/buyer" component={BuyerDashboard} />
               <Route path="/buyer/cart" component={Cart} />
               {/* Add other buyer specific routes here */} 
             </>
          )}

          {/* Fallback for authenticated users on roots or unassigned roles - redirects to / */} {/* This should ideally not be hit if the useEffect works */} {/* <Route path="/" component={Landing} /> */}
          
        </>
      ) : (
        {/* Optional: Redirect any attempt to access protected routes when unauthenticated to login */}
        {/* This is handled by the isAuthenticated check on the routes themselves, but adding a catch-all redirect for belt-and-suspenders */}
         <Route path="/admin/:rest*" component={() => { setLocation('/login'); return null; }} />
         <Route path="/seller/:rest*" component={() => { setLocation('/login'); return null; }} />
         <Route path="/buyer/:rest*" component={() => { setLocation('/login'); return null; }} />
      )}

      {/* Catch all other routes (handles non-existent paths for both auth states) */}
      <Route path="*" component={NotFound} />
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
