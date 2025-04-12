
import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "sonner";

type Role = "admin" | "user";

interface User {
  id: string;
  username: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

// Mock users for demo purposes
const mockUsers = [
  { id: "1", username: "admin", password: "admin123", role: "admin" as Role },
  { id: "2", username: "user", password: "user123", role: "user" as Role },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);

    try {
      // Simulating api call with timeout
      await new Promise((resolve) => setTimeout(resolve, 800));

      const foundUser = mockUsers.find(
        (user) => user.username === username && user.password === password
      );

      if (foundUser) {
        const { password, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        localStorage.setItem("user", JSON.stringify(userWithoutPassword));
        toast.success("Login successful!");
      } else {
        toast.error("Invalid username or password");
      }
    } catch (error) {
      toast.error("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
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
