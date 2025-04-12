
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface SidebarNavItemProps {
  path: string;
  name: string;
  icon: React.ReactNode;
}

const SidebarNavItem: React.FC<SidebarNavItemProps> = ({ path, name, icon }) => {
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <Link
      to={path}
      className={cn(
        "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
        isActive
          ? "bg-primary text-primary-foreground font-medium"
          : "text-gray-700 hover:bg-gray-100"
      )}
    >
      {icon}
      {name}
    </Link>
  );
};

export default SidebarNavItem;
