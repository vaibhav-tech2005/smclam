
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Check, X } from "lucide-react";

// Define available permissions
export const dashboardPermissions = [
  { id: "dashboard", label: "Dashboard" },
  { id: "inventory", label: "Inventory" },
  { id: "transactions", label: "Transactions" },
  { id: "reports", label: "Reports" },
  { id: "users", label: "User Management" },
  { id: "settings", label: "Settings" }
];

const PermissionsOverview = () => {
  return (
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
  );
};

export default PermissionsOverview;
