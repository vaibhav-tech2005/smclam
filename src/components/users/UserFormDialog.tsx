
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { dashboardPermissions } from "./PermissionsOverview";

// Define form schemas
export const userFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  role: z.string(),
  permissions: z.array(z.string()).default([])
});

export type UserFormValues = z.infer<typeof userFormSchema>;

interface AppUser {
  id: string;
  email: string;
  role: "admin" | "user";
  lastActive?: string;
  permissions: string[];
}

interface UserFormDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  editingUser: AppUser | null;
  isLoading: boolean;
  onSubmit: (data: UserFormValues) => void;
}

const UserFormDialog = ({ 
  isOpen, 
  setIsOpen,
  editingUser, 
  isLoading,
  onSubmit
}: UserFormDialogProps) => {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: editingUser?.email || "",
      password: "",
      role: editingUser?.role || "user",
      permissions: editingUser?.permissions || []
    }
  });
  
  // Reset form when editingUser changes
  React.useEffect(() => {
    if (editingUser) {
      form.setValue("email", editingUser.email);
      form.setValue("role", editingUser.role);
      form.setValue("permissions", editingUser.permissions || []);
    } else {
      form.reset({
        email: "",
        password: "",
        role: "user",
        permissions: []
      });
    }
  }, [editingUser, form]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
                onClick={() => setIsOpen(false)}
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
  );
};

export default UserFormDialog;
