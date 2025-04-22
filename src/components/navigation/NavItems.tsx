
import React from "react";
import { 
  LayoutGrid, 
  PackageOpen, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  Settings
} from "lucide-react";

export interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

export const getNavItems = (): NavItem[] => [
  {
    name: "Dashboard",
    path: "/dashboard",
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
  },
  {
    name: "Settings",
    path: "/settings",
    icon: <Settings className="mr-2 h-4 w-4" />,
  },
];

export default getNavItems;
