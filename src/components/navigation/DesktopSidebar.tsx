
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import SidebarNavItem from "./SidebarNavItem";
import { getNavItems } from "./NavItems";

const DesktopSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navItems = getNavItems();

  return (
    <aside className="hidden md:flex md:w-64 border-r border-gray-200 bg-black flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold text-green-500">Laminate Inventory</h1>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <SidebarNavItem
            key={item.path}
            path={item.path}
            name={item.name}
            icon={item.icon}
          />
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
  );
};

export default DesktopSidebar;
