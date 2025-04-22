import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md bg-black border-gray-700">
        <CardContent className="pt-6 text-center">
          <h1 className="text-2xl font-bold mb-6 text-green-500">Laminate Inventory</h1>
          <p className="mb-6 text-green-400">Loading application...</p>
          
          {!isLoading && (
            <Button onClick={() => navigate("/login")} className="w-full bg-green-600 hover:bg-green-700">
              <LogIn className="mr-2 h-4 w-4" /> Go to Login
            </Button>
          )}

          {isLoading && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
