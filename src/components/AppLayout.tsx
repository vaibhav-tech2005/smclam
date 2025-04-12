
import React, { useState } from "react";
import { useData } from "@/context/DataContext";
import LowStockAlert from "./LowStockAlert";
import DesktopSidebar from "./navigation/DesktopSidebar";
import MobileHeader from "./navigation/MobileHeader";
import MobileMenu from "./navigation/MobileMenu";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { getLowStockLaminates } = useData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const lowStockLaminates = getLowStockLaminates();
  const hasLowStock = lowStockLaminates.length > 0;

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Mobile header */}
      <MobileHeader onMenuToggle={toggleMobileMenu} />

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <DesktopSidebar />

        {/* Mobile menu */}
        <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

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
