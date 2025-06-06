import { Switch, Route } from "wouter";
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

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/login" component={Login} />
          <Route path="/store/:domain?" component={Storefront} />
        </>
      ) : (
        <>
          <Route path="/" component={Landing} />
          <Route path="/dashboard" component={() => {
            if (user?.role === 'super_admin') return <SuperAdminDashboard />;
            if (user?.role === 'seller') return <SellerDashboard />;
            return <BuyerDashboard />;
          }} />
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
          <Route path="/seller" component={SellerDashboard} />
          <Route path="/seller/categories" component={SellerCategories} />
          <Route path="/seller/products" component={SellerDashboard} />
          <Route path="/seller/orders" component={SellerDashboard} />
          <Route path="/seller/analytics" component={SellerDashboard} />
          <Route path="/seller/settings" component={SellerDashboard} />
          <Route path="/buyer" component={BuyerDashboard} />
          <Route path="/buyer/cart" component={Cart} />
        </>
      )}
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
