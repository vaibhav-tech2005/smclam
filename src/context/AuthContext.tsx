
import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

type Role = "admin" | "user";

interface AuthUser {
  id: string;
  username: string;
  role: Role;
  permissions?: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  // Helper function to fetch user permissions
  const fetchUserPermissions = async (userId: string) => {
    try {
      // Using generic fetch to avoid type issues
      const { data, error } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user permissions:', error);
        return { role: 'user' as Role, permissions: [] };
      }
      
      return { 
        role: (data?.role || 'user') as Role, 
        permissions: data?.permissions || [] 
      };
    } catch (error) {
      console.error('Error in fetchUserPermissions:', error);
      return { role: 'user' as Role, permissions: [] };
    }
  };

  const updateUserWithPermissions = async (supaUser: User) => {
    try {
      const { role, permissions } = await fetchUserPermissions(supaUser.id);
      
      setUser({
        id: supaUser.id,
        username: supaUser.email || "user",
        role,
        permissions
      });
    } catch (error) {
      console.error('Error updating user with permissions:', error);
      
      // Fallback to basic user info without permissions
      setUser({
        id: supaUser.id,
        username: supaUser.email || "user",
        role: supaUser.email?.includes("admin") ? "admin" : "user"
      });
    }
  };

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state change:", event, currentSession?.user?.email);
        setSession(currentSession);
        
        if (currentSession?.user) {
          const supaUser = currentSession.user;
          setSupabaseUser(supaUser);
          updateUserWithPermissions(supaUser);
        } else {
          setSupabaseUser(null);
          setUser(null);
        }
      }
    );

    // Then check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (initialSession?.user) {
          const supaUser = initialSession.user;
          setSupabaseUser(supaUser);
          updateUserWithPermissions(supaUser);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        toast.error("Failed to check authentication status");
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast.success("Login successful!");
      
      // No need to manually set localStorage as Supabase handles this
      // Just log success for debugging
      console.log("Login successful for:", data.user?.email);
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Login failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      setUser(null);
      toast.success("Logged out successfully");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error(error.message || "Logout failed");
    }
  };

  // Helper function to check if user has a specific permission
  const hasPermission = (permission: string) => {
    if (!user) return false;
    if (user.role === "admin") return true;
    return user.permissions?.includes(permission) || false;
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    hasPermission
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
