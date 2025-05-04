
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserFormValues } from "@/components/users/UserFormDialog";

interface UserPermission {
  id: string;
  user_id: string;
  email: string;
  role: "admin" | "user";
  permissions: string[];
  created_at?: string;
}

export interface AppUser {
  id: string;
  email: string;
  role: "admin" | "user";
  lastActive?: string;
  permissions: string[];
}

export const useUserManagement = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch users
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_permissions')
        .select('*') as { data: UserPermission[] | null, error: any };
      
      if (error) throw error;
      
      const formattedUsers: AppUser[] = (data || []).map((user: UserPermission) => ({
        id: user.user_id,
        email: user.email,
        role: user.role as "admin" | "user",
        lastActive: user.created_at,
        permissions: user.permissions || []
      }));
      
      setUsers(formattedUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding a new user
  const handleAddUser = async (data: UserFormValues) => {
    setIsLoading(true);
    try {
      // Create the user in Supabase Auth
      const authResponse = await supabase.functions.invoke('insert-user-permission', {
        body: {
          email: data.email,
          password: data.password,
          role: data.role,
          permissions: data.permissions
        }
      });

      if (authResponse.error) {
        throw new Error(authResponse.error.message || "Failed to create user");
      }

      toast.success("User created successfully");
      fetchUsers();
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.message || "Failed to create user");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle updating a user
  const handleUpdateUser = async (data: UserFormValues) => {
    if (!editingUser) return;
    
    setIsLoading(true);
    try {
      // Update user permissions using edge function
      const response = await supabase.functions.invoke('update-user-permission', {
        body: { 
          userId: editingUser.id,
          role: data.role,
          permissions: data.permissions
        }
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to update user");
      }

      toast.success("User updated successfully");
      fetchUsers();
      setIsDialogOpen(false);
      setEditingUser(null);
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(error.message || "Failed to update user");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle deleting a user
  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    
    setIsLoading(true);
    try {
      // Delete the user using admin deleteUser function
      const response = await supabase.functions.invoke('delete-user', {
        body: { userId }
      });
      
      if (response.error) {
        throw new Error(response.error.message || "Failed to delete user");
      }
      
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.message || "Failed to delete user");
    } finally {
      setIsLoading(false);
    }
  };

  // Open dialog for editing
  const openEditDialog = (user: AppUser) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  // Open dialog for adding
  const openAddDialog = () => {
    setEditingUser(null);
    setIsDialogOpen(true);
  };

  // Handle form submission
  const onSubmit = (data: UserFormValues) => {
    if (editingUser) {
      handleUpdateUser(data);
    } else {
      handleAddUser(data);
    }
  };

  return {
    users,
    isLoading,
    editingUser,
    isDialogOpen,
    setIsDialogOpen,
    fetchUsers,
    handleAddUser,
    handleUpdateUser,
    handleDeleteUser,
    openEditDialog,
    openAddDialog,
    onSubmit
  };
};
