
import React from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface MobileHeaderProps {
  onMenuToggle: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuToggle }) => {
  const { user } = useAuth();

  return (
    <header className="bg-black border-b border-gray-700 py-3 px-4 flex items-center justify-between md:hidden shadow-sm">
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuToggle}
          className="text-green-500 hover:text-green-400"
        >
          <Menu className="h-6 w-6" />
        </Button>
        <h1 className="font-semibold text-lg text-green-500">Laminate Inventory</h1>
      </div>
      <div className="flex items-center">
        <span className="text-sm font-medium mr-2 text-green-500">{user?.username}</span>
      </div>
    </header>
  );
};

export default MobileHeader;
