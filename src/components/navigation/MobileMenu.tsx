import React from "react";
import { Link } from "react-router-dom";
import { X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { getNavItems } from "./NavItems";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const { user, logout, isAdmin } = useAuth();
  const navItems = getNavItems();

  if (!isOpen) return null;

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 bg-black flex flex-col md:hidden">
      <div className="p-4 border-b border-gray-700 flex justify-between">
        <h1 className="text-xl font-bold text-green-500">Laminate Inventory</h1>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-green-500 hover:text-green-400">
          <X className="h-6 w-6" />
        </Button>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClose}
            className="flex items-center px-3 py-3 text-base rounded-md transition-colors text-green-500 hover:bg-gray-900"
          >
            {item.icon}
            {item.name}
          </Link>
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-500">{user?.username}</p>
            <p className="text-xs text-green-400">{user?.role}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-green-500 hover:text-green-400"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
