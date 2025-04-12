
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-red-100">
            <ShieldAlert className="h-16 w-16 text-red-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        <div className="flex flex-col space-y-2">
          <Button onClick={() => navigate("/")}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
