
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutGrid, 
  PackageOpen, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  Menu, 
  X, 
  LogOut,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import LowStockAlert from "./LowStockAlert";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const { getLowStockLaminates } = useData();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const lowStockLaminates = getLowStockLaminates();
  const hasLowStock = lowStockLaminates.length > 0;

  const navItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: <LayoutGrid className="mr-2 h-4 w-4" />,
    },
    {
      name: "Inventory",
      path: "/inventory",
      icon: <PackageOpen className="mr-2 h-4 w-4" />,
    },
    {
      name: "Transactions",
      path: "/transactions",
      icon: <ShoppingCart className="mr-2 h-4 w-4" />,
    },
    {
      name: "Reports",
      path: "/reports",
      icon: <TrendingUp className="mr-2 h-4 w-4" />,
    },
    {
      name: "User Management",
      path: "/users",
      icon: <Users className="mr-2 h-4 w-4" />,
      adminOnly: true,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: <Settings className="mr-2 h-4 w-4" />,
      adminOnly: true,
    },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Mobile header */}
      <header className="bg-white border-b border-gray-200 py-3 px-4 flex items-center justify-between md:hidden shadow-sm">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
          <h1 className="font-semibold text-lg">Laminate Stock</h1>
        </div>
        <div className="flex items-center">
          <span className="text-sm font-medium mr-2">{user?.username}</span>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar for desktop */}
        <aside className="hidden md:flex md:w-64 border-r border-gray-200 bg-white flex-col">
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-primary">Laminate Stock</h1>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems
              .filter((item) => !item.adminOnly || isAdmin)
              .map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                    location.pathname === item.path
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{user?.username}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-gray-500 hover:text-gray-800"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </aside>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-white flex flex-col md:hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between">
              <h1 className="text-xl font-bold text-primary">Laminate Stock</h1>
              <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            
            <nav className="flex-1 p-4 space-y-1">
              {navItems
                .filter((item) => !item.adminOnly || isAdmin)
                .map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={toggleMobileMenu}
                    className={cn(
                      "flex items-center px-3 py-3 text-base rounded-md transition-colors",
                      location.pathname === item.path
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                ))}
            </nav>
            
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{user?.username}</p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    logout();
                    toggleMobileMenu();
                  }}
                  className="text-gray-500 hover:text-gray-800"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {hasLowStock && <LowStockAlert laminates={lowStockLaminates} />}
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
