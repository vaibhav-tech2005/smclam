
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserCog } from "lucide-react";
import { useUserManagement } from "@/hooks/useUserManagement";
import UserList from "@/components/users/UserList";
import UserFormDialog from "@/components/users/UserFormDialog";
import PermissionsOverview from "@/components/users/PermissionsOverview";

const UserManagement = () => {
  const {
    users,
    isLoading,
    editingUser,
    isDialogOpen,
    setIsDialogOpen,
    fetchUsers,
    handleDeleteUser,
    openEditDialog,
    openAddDialog,
    onSubmit
  } = useUserManagement();

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

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

      <UserList 
        users={users}
        isLoading={isLoading}
        onEditUser={openEditDialog}
        onDeleteUser={handleDeleteUser}
      />

      <PermissionsOverview />

      <UserFormDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        editingUser={editingUser}
        isLoading={isLoading}
        onSubmit={onSubmit}
      />
    </div>
  );
};

export default UserManagement;
