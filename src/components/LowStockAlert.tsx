
import React from "react";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { Laminate } from "@/context/DataContext";

interface LowStockAlertProps {
  laminates: Laminate[];
}

const LowStockAlert: React.FC<LowStockAlertProps> = ({ laminates }) => {
  if (laminates.length === 0) return null;

  return (
    <Alert className="mb-6 border-amber-300 bg-amber-50">
      <AlertTriangle className="h-5 w-5 text-amber-600" />
      <AlertTitle className="text-amber-800">Low Stock Alert</AlertTitle>
      <AlertDescription className="text-amber-700">
        The following laminates are low in stock:
        <ul className="mt-2 ml-6 list-disc">
          {laminates.map((laminate) => (
            <li key={laminate.id}>
              <span className="font-medium">
                {laminate.brandName} {laminate.laminateNumber}
              </span>{" "}
              ({laminate.currentStock} {laminate.currentStock === 1 ? "unit" : "units"} left)
            </li>
          ))}
        </ul>
        <div className="mt-2">
          <Link
            to="/inventory"
            className="text-sm font-medium text-amber-800 underline hover:text-amber-900"
          >
            View inventory
          </Link>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default LowStockAlert;
