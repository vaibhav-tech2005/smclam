
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
  const { user, logout } = useAuth();
  const navItems = getNavItems();

  if (!isOpen) return null;

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 bg-background flex flex-col md:hidden">
      <div className="p-4 border-b border-border/50 flex justify-between">
        <h1 className="text-xl font-bold text-primary">Laminate Inventory</h1>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose} 
          className="text-primary hover:text-primary/90 hover:bg-primary/10"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClose}
            className="flex items-center px-3 py-3 text-base rounded-md transition-colors text-muted-foreground hover:text-primary hover:bg-primary/10"
          >
            {item.icon}
            {item.name}
          </Link>
        ))}
      </nav>
      
      <div className="p-4 border-t border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-primary">{user?.username}</p>
            <p className="text-xs text-muted-foreground">{user?.role}</p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
