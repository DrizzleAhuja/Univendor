import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import ImpersonationBanner from "@/components/impersonation-banner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Home, 
  ShoppingBag, 
  ShoppingCart, 
  Store, 
  Package, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  Bell,
  Search,
  Globe,
  Shield,
  UserCheck,
  Activity,
  Database,
  CreditCard,
  FolderTree
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface SidebarItemProps {
  icon: any;
  label: string;
  href: string;
  active?: boolean;
  badge?: number;
}

interface AppSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

function SidebarItem({ icon: Icon, label, href, active, badge }: SidebarItemProps) {
  return (
    <Link href={href}>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-2",
          active && "bg-accent text-accent-foreground"
        )}
      >
        <Icon className="h-4 w-4" />
        <span className="flex-1 text-left">{label}</span>
        {badge !== undefined && badge > 0 && (
          <span className="bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {badge}
          </span>
        )}
      </Button>
    </Link>
  );
}

function AppSidebar({ isCollapsed, onToggleCollapse }: AppSidebarProps) {
  const { user } = useAuth();
  const [location] = useLocation();

  const { data: cartItems = [] } = useQuery({
    queryKey: ["/api/cart"],
    enabled: !!user && user.role === "buyer",
  });

  const cartItemCount = cartItems.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);

  const getMenuItems = () => {
    if (!user) return [];

    const commonItems = [
      { icon: Home, label: "Dashboard", href: "/" },
    ];

    switch ((user as any)?.role) {
      case 'super_admin':
        return [
          ...commonItems,
          { icon: Users, label: "User Management", href: "/admin/users" },
          { icon: Store, label: "Vendor Management", href: "/admin/vendors" },
          { icon: Globe, label: "Domain Management", href: "/admin/domains" },
          { icon: FolderTree, label: "Category Management", href: "/admin/categories" },
          { icon: Package, label: "All Products", href: "/admin/products" },
          { icon: ShoppingBag, label: "All Orders", href: "/admin/orders" },
          { icon: Activity, label: "Platform Analytics", href: "/admin/analytics" },
          { icon: CreditCard, label: "Billing & Subscriptions", href: "/admin/billing" },
          { icon: Shield, label: "Security & Permissions", href: "/admin/security" },
          { icon: Database, label: "System Settings", href: "/admin/system" },
          { icon: Settings, label: "Platform Settings", href: "/admin/settings" },
        ];
      
      case 'admin':
        return [
          ...commonItems,
          { icon: Users, label: "Users", href: "/admin/users" },
          { icon: Store, label: "Vendors", href: "/admin/vendors" },
          { icon: Package, label: "Products", href: "/admin/products" },
          { icon: ShoppingBag, label: "Orders", href: "/admin/orders" },
          { icon: Settings, label: "Settings", href: "/admin/settings" },
        ];
      
      case 'seller':
        return [
          ...commonItems,
          { icon: FolderTree, label: "Category Management", href: "/seller/categories" },
          { icon: Package, label: "Products", href: "/seller/products" },
          { icon: ShoppingBag, label: "Orders", href: "/seller/orders" },
          { icon: Activity, label: "Analytics", href: "/seller/analytics" },
          { icon: Settings, label: "Store Settings", href: "/seller/settings" },
        ];
      
      case 'buyer':
      default:
        return [
          ...commonItems,
          { icon: Store, label: "Browse Stores", href: "/store" },
          { icon: ShoppingCart, label: "My Cart", href: "/buyer/cart", badge: cartItemCount },
          { icon: ShoppingBag, label: "My Orders", href: "/buyer/orders" },
          { icon: Settings, label: "Account Settings", href: "/buyer/settings" },
        ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className={`bg-white border-r border-gray-200 flex flex-col h-full ${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 fixed left-0 top-0 z-50`}>
      <div className="border-b p-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Store className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && <span className="font-bold text-lg">SaaSCommerce</span>}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onToggleCollapse}
            className="ml-auto"
          >
            <Menu className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>
                <div className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                  location === item.href 
                    ? 'bg-primary text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}>
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span className="text-sm">{item.label}</span>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start">
              <Avatar className="w-6 h-6 mr-2">
                <AvatarImage src={(user as any)?.profileImageUrl || undefined} />
                <AvatarFallback className="text-xs">
                  {(user as any)?.firstName?.[0] || (user as any)?.email?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <span className="truncate text-sm">
                  {(user as any)?.firstName || (user as any)?.email || 'User'}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{(user as any)?.firstName || 'User'}</p>
              <p className="text-xs text-gray-500">{(user as any)?.email}</p>
              <p className="text-xs text-primary font-medium capitalize">{(user as any)?.role}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2" />
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => window.location.href = "/api/auth/logout"}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function TopBar() {
  const { user } = useAuth();

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="flex h-14 items-center px-4 lg:px-6">
        <div className="flex-1 flex items-center space-x-4">
          <div className="w-full max-w-sm">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <input
                placeholder="Search..."
                className="pl-8 h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={(user as any)?.profileImageUrl || undefined} />
                  <AvatarFallback>
                    {(user as any)?.firstName?.[0] || (user as any)?.email?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{(user as any)?.firstName || 'User'}</p>
                  <p className="w-[200px] truncate text-sm text-gray-500">
                    {(user as any)?.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => window.location.href = "/api/logout"}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <AppSidebar 
        isCollapsed={isCollapsed} 
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)} 
      />
      <div className={`transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        <TopBar />
        <main className="p-6">
          <ImpersonationBanner />
          {children}
        </main>
      </div>
    </div>
  );
}