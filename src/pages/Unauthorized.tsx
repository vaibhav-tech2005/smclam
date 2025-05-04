
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Unauthorized = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

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
          <Button onClick={() => navigate("/dashboard")} variant="default">
            Try Dashboard
          </Button>
          <Button onClick={() => navigate("/login")} variant="outline">
            Return to Login
          </Button>
          <Button onClick={handleLogout} variant="ghost" className="mt-2">
            <LogOut className="h-4 w-4 mr-2" /> Logout and Try Again
          </Button>
        </div>
        <p className="text-sm text-gray-500 mt-6">
          If you're seeing this page after logging in, your user account may not have the required permissions configured yet.
        </p>
      </div>
    </div>
  );
};

export default Unauthorized;
