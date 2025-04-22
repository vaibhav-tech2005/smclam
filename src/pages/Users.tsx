import React from "react";
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
import { UserCog, Lock, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const UserManagement = () => {
  const { isAdmin } = useAuth();

  // Mock users for demonstration
  const mockUsers = [
    { id: "1", username: "admin", role: "admin", lastActive: "2025-04-12" },
    { id: "2", username: "user", role: "user", lastActive: "2025-04-12" },
    { id: "3", username: "sarah", role: "user", lastActive: "2025-04-11" },
    { id: "4", username: "michael", role: "user", lastActive: "2025-04-10" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        <Button>
          <UserCog className="mr-1 h-4 w-4" /> Add New User
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
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
                        {new Date(user.lastActive).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add/Edit User</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" placeholder="Enter username" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Enter password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select defaultValue="user">
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 flex space-x-2 justify-end">
                <Button variant="outline">Cancel</Button>
                <Button>Save User</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

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
                  <TableHead>User</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">View Dashboard</TableCell>
                  <TableCell className="text-green-600">✓</TableCell>
                  <TableCell className="text-green-600">✓</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">View Inventory</TableCell>
                  <TableCell className="text-green-600">✓</TableCell>
                  <TableCell className="text-green-600">✓</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Add/Edit Inventory</TableCell>
                  <TableCell className="text-green-600">✓</TableCell>
                  <TableCell className="text-red-600">✗</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">View Transactions</TableCell>
                  <TableCell className="text-green-600">✓</TableCell>
                  <TableCell className="text-green-600">✓</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Add/Edit Transactions</TableCell>
                  <TableCell className="text-green-600">✓</TableCell>
                  <TableCell className="text-red-600">✗</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Generate Reports</TableCell>
                  <TableCell className="text-green-600">✓</TableCell>
                  <TableCell className="text-green-600">✓</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">User Management</TableCell>
                  <TableCell className="text-green-600">✓</TableCell>
                  <TableCell className="text-red-600">✗</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Settings</TableCell>
                  <TableCell className="text-green-600">✓</TableCell>
                  <TableCell className="text-red-600">✗</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Note: This is a simplified view of permissions. For this demo version, permissions are fixed based on user role.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
