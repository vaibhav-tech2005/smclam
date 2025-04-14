import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Plus, Pencil, Trash2, AlertCircle } from "lucide-react";
import { useData, Laminate } from "@/context/DataContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const Inventory = () => {
  const { laminates, addLaminate, updateLaminate, deleteLaminate, clearAllLaminates } = useData();
  const { isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isClearDatabaseDialogOpen, setIsClearDatabaseDialogOpen] = useState(false);
  const [selectedLaminate, setSelectedLaminate] = useState<Laminate | null>(null);
  
  const [formData, setFormData] = useState({
    brandName: "",
    laminateNumber: "",
    laminateFinish: ""
  });

  const filteredLaminates = laminates.filter(
    (laminate) =>
      laminate.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      laminate.laminateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      laminate.laminateFinish.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const openAddDialog = () => {
    setFormData({
      brandName: "",
      laminateNumber: "",
      laminateFinish: ""
    });
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (laminate: Laminate) => {
    setSelectedLaminate(laminate);
    setFormData({
      brandName: laminate.brandName,
      laminateNumber: laminate.laminateNumber,
      laminateFinish: laminate.laminateFinish
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (laminate: Laminate) => {
    setSelectedLaminate(laminate);
    setIsDeleteDialogOpen(true);
  };

  const openClearDatabaseDialog = () => {
    setIsClearDatabaseDialogOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addLaminate({
      brandName: formData.brandName,
      laminateNumber: formData.laminateNumber,
      laminateFinish: formData.laminateFinish
    });
    
    setIsAddDialogOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedLaminate) return;
    
    updateLaminate(selectedLaminate.id, {
      brandName: formData.brandName,
      laminateNumber: formData.laminateNumber,
      laminateFinish: formData.laminateFinish
    });
    
    setIsEditDialogOpen(false);
  };

  const handleDeleteSubmit = () => {
    if (!selectedLaminate) return;
    
    deleteLaminate(selectedLaminate.id);
    setIsDeleteDialogOpen(false);
  };

  const handleClearAllLaminates = () => {
    clearAllLaminates();
    setIsClearDatabaseDialogOpen(false);
  };

  const getStockStatusClass = (stock: number) => {
    if (stock === 0) return "text-red-600 font-medium";
    if (stock <= 2) return "text-amber-600 font-medium";
    return "text-green-600 font-medium";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">
            Manage your laminate inventory
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={openAddDialog}>
            <Plus className="mr-1 h-4 w-4" /> Add Laminate
          </Button>
          <Button onClick={openClearDatabaseDialog} variant="destructive">
            <Trash2 className="mr-1 h-4 w-4" /> Delete All Laminates
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <Search className="mr-2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by brand, number, or finish..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="max-w-sm"
            />
          </div>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Brand Name</TableHead>
                  <TableHead>Laminate Number</TableHead>
                  <TableHead>Finish</TableHead>
                  <TableHead>Current Stock</TableHead>
                  {isAdmin && <TableHead className="w-[100px]">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLaminates.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={isAdmin ? 5 : 4}
                      className="h-24 text-center"
                    >
                      {searchQuery
                        ? "No laminates found matching your search."
                        : "No laminates in inventory. Add some to get started."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLaminates.map((laminate) => (
                    <TableRow key={laminate.id}>
                      <TableCell className="font-medium">
                        {laminate.brandName}
                      </TableCell>
                      <TableCell>{laminate.laminateNumber}</TableCell>
                      <TableCell>{laminate.laminateFinish}</TableCell>
                      <TableCell className={getStockStatusClass(laminate.currentStock)}>
                        {laminate.currentStock}
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0"
                              >
                                <span className="sr-only">Open menu</span>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="lucide lucide-more-vertical"
                                >
                                  <circle cx="12" cy="12" r="1" />
                                  <circle cx="12" cy="5" r="1" />
                                  <circle cx="12" cy="19" r="1" />
                                </svg>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white">
                              <DropdownMenuItem
                                onClick={() => openEditDialog(laminate)}
                                className="cursor-pointer"
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openDeleteDialog(laminate)}
                                className="cursor-pointer text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Laminate</DialogTitle>
            <DialogDescription>
              Enter the details of the new laminate to add to your inventory.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="brandName">Brand Name</Label>
                <Input
                  id="brandName"
                  name="brandName"
                  value={formData.brandName}
                  onChange={handleFormChange}
                  placeholder="Enter brand name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="laminateNumber">Laminate Number</Label>
                <Input
                  id="laminateNumber"
                  name="laminateNumber"
                  value={formData.laminateNumber}
                  onChange={handleFormChange}
                  placeholder="Enter laminate number"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="laminateFinish">Laminate Finish</Label>
                <Input
                  id="laminateFinish"
                  name="laminateFinish"
                  value={formData.laminateFinish}
                  onChange={handleFormChange}
                  placeholder="Enter laminate finish"
                  required
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Laminate</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Laminate</DialogTitle>
            <DialogDescription>
              Update the details of this laminate.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="editBrandName">Brand Name</Label>
                <Input
                  id="editBrandName"
                  name="brandName"
                  value={formData.brandName}
                  onChange={handleFormChange}
                  placeholder="Enter brand name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editLaminateNumber">Laminate Number</Label>
                <Input
                  id="editLaminateNumber"
                  name="laminateNumber"
                  value={formData.laminateNumber}
                  onChange={handleFormChange}
                  placeholder="Enter laminate number"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editLaminateFinish">Laminate Finish</Label>
                <Input
                  id="editLaminateFinish"
                  name="laminateFinish"
                  value={formData.laminateFinish}
                  onChange={handleFormChange}
                  placeholder="Enter laminate finish"
                  required
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Update Laminate</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Laminate</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this laminate? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedLaminate && (
              <div className="rounded-md bg-muted p-4">
                <p><strong>Brand:</strong> {selectedLaminate.brandName}</p>
                <p><strong>Number:</strong> {selectedLaminate.laminateNumber}</p>
                <p><strong>Finish:</strong> {selectedLaminate.laminateFinish}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteSubmit}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isClearDatabaseDialogOpen} onOpenChange={setIsClearDatabaseDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" /> Delete Entire Laminate Database
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete ALL laminates in your inventory and ALL associated transactions.
              This action cannot be undone. Are you absolutely sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <div className="rounded-md bg-destructive/10 p-4 text-destructive font-medium">
              Warning: You are about to delete your entire laminate database and transaction history. This is a permanent action.
            </div>
          </div>
          <AlertDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsClearDatabaseDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleClearAllLaminates}
            >
              Delete All Data
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Inventory;
