
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserCog, Edit, Trash2, Check, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Define available permissions
const dashboardPermissions = [
  { id: "dashboard", label: "Dashboard" },
  { id: "inventory", label: "Inventory" },
  { id: "transactions", label: "Transactions" },
  { id: "reports", label: "Reports" },
  { id: "users", label: "User Management" },
  { id: "settings", label: "Settings" }
];

// Define form schemas
const userFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  role: z.string(),
  permissions: z.array(z.string()).default([])
});

type UserFormValues = z.infer<typeof userFormSchema>;

// User interface
interface AppUser {
  id: string;
  email: string;
  role: "admin" | "user";
  lastActive?: string;
  permissions: string[];
}

const UserManagement = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "user",
      permissions: []
    }
  });

  // Fetch users
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Fetch users directly with a more generic approach
      const { data: usersData, error } = await supabase
        .from('user_permissions')
        .select('*');
      
      if (error) throw error;
      
      const formattedUsers: AppUser[] = (usersData || []).map((user: any) => ({
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

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle adding a new user
  const handleAddUser = async (data: UserFormValues) => {
    setIsLoading(true);
    try {
      // 1. Create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Create user permissions record using a more generic approach
        const { error: permissionError } = await supabase.rpc('insert_user_permission', {
          p_user_id: authData.user.id,
          p_email: data.email,
          p_role: data.role,
          p_permissions: data.permissions
        });

        if (permissionError) {
          // Fallback if RPC doesn't exist yet
          const { error: directError } = await supabase.from('user_permissions').insert({
            user_id: authData.user.id,
            email: data.email,
            role: data.role,
            permissions: data.permissions
          });

          if (directError) throw directError;
        }

        toast.success("User created successfully");
        fetchUsers();
        setIsDialogOpen(false);
        form.reset();
      }
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
      // Update user permissions using a more generic approach
      const { error: permissionError } = await supabase.rpc('update_user_permission', {
        p_user_id: editingUser.id,
        p_role: data.role,
        p_permissions: data.permissions
      });

      if (permissionError) {
        // Fallback if RPC doesn't exist yet
        const { error: directError } = await supabase
          .from('user_permissions')
          .update({
            role: data.role,
            permissions: data.permissions
          })
          .eq('user_id', editingUser.id);

        if (directError) throw directError;
      }

      toast.success("User updated successfully");
      fetchUsers();
      setIsDialogOpen(false);
      setEditingUser(null);
      form.reset();
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
      const { error } = await supabase.functions.invoke('delete-user', {
        body: { userId }
      });
      
      if (error) throw error;
      
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.message || "Failed to delete user");
      
      // Fallback approach - try to delete the permissions record
      try {
        const { error } = await supabase
          .from('user_permissions')
          .delete()
          .eq('user_id', userId);
        
        if (!error) {
          toast.success("User permissions removed");
          fetchUsers();
        }
      } catch (fallbackError) {
        console.error('Error in fallback delete:', fallbackError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Open dialog for editing
  const openEditDialog = (user: AppUser) => {
    setEditingUser(user);
    form.setValue("email", user.email);
    form.setValue("role", user.role);
    form.setValue("permissions", user.permissions || []);
    setIsDialogOpen(true);
  };

  // Open dialog for adding
  const openAddDialog = () => {
    setEditingUser(null);
    form.reset();
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

  // Use a placeholder if no users found
  const displayUsers = users.length > 0 ? users : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        <Button onClick={openAddDialog}>
          <UserCog className="mr-1 h-4 w-4" /> Add New User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">User List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : displayUsers.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p>No users found. Add a new user to get started.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.permissions?.map((permission) => (
                            <span 
                              key={permission}
                              className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800"
                            >
                              {dashboardPermissions.find(p => p.id === permission)?.label || permission}
                            </span>
                          ))}
                          {(!user.permissions || user.permissions.length === 0) && (
                            <span className="text-xs text-gray-500">No permissions</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => openEditDialog(user)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Permissions Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Feature</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>User (with permission)</TableHead>
                  <TableHead>User (without permission)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardPermissions.map((permission) => (
                  <TableRow key={permission.id}>
                    <TableCell className="font-medium">{permission.label}</TableCell>
                    <TableCell className="text-green-600"><Check className="h-4 w-4" /></TableCell>
                    <TableCell className="text-green-600"><Check className="h-4 w-4" /></TableCell>
                    <TableCell className="text-red-600"><X className="h-4 w-4" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Note: Admin users have access to all features regardless of specific permissions.
          </p>
        </CardContent>
      </Card>

      {/* User Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="user@example.com" 
                        {...field} 
                        disabled={!!editingUser || isLoading} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!editingUser && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Enter password" 
                          {...field} 
                          disabled={isLoading} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select 
                      value={field.value} 
                      onValueChange={field.onChange}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="permissions"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Dashboard Permissions</FormLabel>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {dashboardPermissions.map((permission) => (
                        <FormField
                          key={permission.id}
                          control={form.control}
                          name="permissions"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={permission.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(permission.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, permission.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== permission.id
                                            )
                                          )
                                    }}
                                    disabled={isLoading}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {permission.label}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-current rounded-full" />
                      {editingUser ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>{editingUser ? "Update User" : "Create User"}</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
