
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PermissionProtectedRoute from "./components/PermissionProtectedRoute";
import AppLayout from "./components/AppLayout";
import { useEffect } from "react";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Transactions from "./pages/Transactions";
import Reports from "./pages/Reports";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

// Ensure redirects to dashboard if already logged in
const LoginWithRedirect = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Login />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <DataProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginWithRedirect />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              <Route path="/dashboard" element={
                <PermissionProtectedRoute requiredPermission="dashboard">
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </PermissionProtectedRoute>
              } />
              
              <Route path="/inventory" element={
                <PermissionProtectedRoute requiredPermission="inventory">
                  <AppLayout>
                    <Inventory />
                  </AppLayout>
                </PermissionProtectedRoute>
              } />
              
              <Route path="/transactions" element={
                <PermissionProtectedRoute requiredPermission="transactions">
                  <AppLayout>
                    <Transactions />
                  </AppLayout>
                </PermissionProtectedRoute>
              } />
              
              <Route path="/reports" element={
                <PermissionProtectedRoute requiredPermission="reports">
                  <AppLayout>
                    <Reports />
                  </AppLayout>
                </PermissionProtectedRoute>
              } />
              
              <Route path="/users" element={
                <PermissionProtectedRoute requiredPermission="users">
                  <AppLayout>
                    <Users />
                  </AppLayout>
                </PermissionProtectedRoute>
              } />
              
              <Route path="/settings" element={
                <PermissionProtectedRoute requiredPermission="settings">
                  <AppLayout>
                    <Settings />
                  </AppLayout>
                </PermissionProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
