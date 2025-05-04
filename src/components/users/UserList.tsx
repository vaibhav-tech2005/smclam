
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { dashboardPermissions } from "./PermissionsOverview";

interface AppUser {
  id: string;
  email: string;
  role: "admin" | "user";
  lastActive?: string;
  permissions: string[];
}

interface UserListProps {
  users: AppUser[];
  isLoading: boolean;
  onEditUser: (user: AppUser) => void;
  onDeleteUser: (userId: string) => void;
}

const UserList = ({ users, isLoading, onEditUser, onDeleteUser }: UserListProps) => {
  // Use a placeholder if no users found
  const displayUsers = users.length > 0 ? users : [];

  return (
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
                          onClick={() => onEditUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive"
                          onClick={() => onDeleteUser(user.id)}
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
  );
};

export default UserList;
