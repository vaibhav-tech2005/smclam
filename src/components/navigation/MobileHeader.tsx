
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
    <header className="bg-background border-b border-border/50 py-3 px-4 flex items-center justify-between md:hidden shadow-sm">
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuToggle}
          className="text-primary hover:text-primary/90 hover:bg-primary/10"
        >
          <Menu className="h-6 w-6" />
        </Button>
        <h1 className="font-semibold text-lg text-primary">Laminate Inventory</h1>
      </div>
      <div className="flex items-center">
        <span className="text-sm font-medium text-muted-foreground">{user?.username}</span>
      </div>
    </header>
  );
};

export default MobileHeader;
