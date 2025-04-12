import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

// This page is only used as a landing page that redirects to either the login or dashboard
const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        navigate("/");
      } else {
        navigate("/login");
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center">
          <h1 className="text-2xl font-bold mb-6">Laminate Stock Flow</h1>
          <p className="mb-6">Loading application...</p>
          
          {!isLoading && (
            <Button onClick={() => navigate("/login")} className="w-full">
              <LogIn className="mr-2 h-4 w-4" /> Go to Login
            </Button>
          )}

          {isLoading && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
