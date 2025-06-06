import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import ImpersonationBanner from "@/components/impersonation-banner";
import {
  LayoutDashboard,
  Users,
  Store,
  Globe,
  Tags,
  Package,
  ShoppingCart,
  TrendingUp,
  CreditCard,
  Shield,
  Database,
  Settings,
  LogOut
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "User Management",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Vendor Management",
    href: "/admin/vendors",
    icon: Store,
  },
  {
    title: "Domain Management",
    href: "/admin/domains",
    icon: Globe,
  },
  {
    title: "Category Management",
    href: "/admin/categories",
    icon: Tags,
  },
  {
    title: "All Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    title: "All Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Platform Analytics",
    href: "/admin/analytics",
    icon: TrendingUp,
  },
  {
    title: "Billing & Subscriptions",
    href: "/admin/billing",
    icon: CreditCard,
  },
  {
    title: "Security & Permissions",
    href: "/admin/security",
    icon: Shield,
  },
  {
    title: "System Settings",
    href: "/admin/system",
    icon: Database,
  },
  {
    title: "Platform Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <ImpersonationBanner />
      
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg min-h-screen fixed left-0 top-0 z-40">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">SaaSCommerce</span>
            </div>
          </div>

          <nav className="mt-8 px-4">
            <div className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href || 
                  (item.href !== '/admin' && location.startsWith(item.href));
                
                return (
                  <Link key={item.href} href={item.href}>
                    <a
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </a>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User Info & Logout */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-gray-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.firstName || user?.email || 'Admin'}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role?.replace('_', ' ') || 'Super Admin'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/api/logout'}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-64">
          <main className="min-h-screen">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}