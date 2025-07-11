
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Plus, ArrowUp, ArrowDown, Pencil, Trash2, Package } from "lucide-react";
import { useData, Laminate, Transaction } from "@/context/DataContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, parseISO } from "date-fns";
import { ComboboxSelect } from "@/components/ComboboxSelect";
import { BulkTransactionForm } from "@/components/BulkTransactionForm";

const TransactionForm = ({
  formData,
  handleFormChange,
  handleSelectChange,
  laminates,
  transactionType,
  onSubmit,
  onCancel,
  isSubmitting
}: {
  formData: any;
  handleFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  laminates: Laminate[];
  transactionType: "purchase" | "sale";
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) => {
  const laminateOptions = laminates.map((laminate) => ({
    label: `${laminate.brandName} - ${laminate.laminateNumber} (${laminate.laminateFinish})`,
    value: laminate.id
  }));
  
  return (
    <form onSubmit={onSubmit}>
      <div className="space-y-4 py-2">
        <div className="space-y-2">
          <Label htmlFor="laminateId">Laminate</Label>
          <ComboboxSelect
            options={laminateOptions}
            value={formData.laminateId}
            onValueChange={(value) => {
              handleSelectChange("laminateId", value);
            }}
            placeholder="Type to search for a laminate"
            emptyText="No matching laminates found"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleFormChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            min="1"
            value={formData.quantity}
            onChange={handleFormChange}
            required
          />
        </div>

        {transactionType === "sale" && (
          <div className="space-y-2">
            <Label htmlFor="customerName">Customer Name</Label>
            <Input
              id="customerName"
              name="customerName"
              value={formData.customerName || ""}
              onChange={handleFormChange}
              placeholder="Enter customer name"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="remarks">Remarks (Optional)</Label>
          <Input
            id="remarks"
            name="remarks"
            value={formData.remarks || ""}
            onChange={handleFormChange}
            placeholder="Add any notes or remarks"
          />
        </div>
      </div>

      <DialogFooter className="mt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Processing..." : transactionType === "purchase" ? "Record Purchase" : "Record Sale"}
        </Button>
      </DialogFooter>
    </form>
  );
};

const Transactions = () => {
  const { laminates, transactions, addTransaction, addBulkTransactions, updateTransaction, deleteTransaction, getLaminateById } = useData();
  const { isAdmin } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [transactionTab, setTransactionTab] = useState("all");
  const [isAddPurchaseDialogOpen, setIsAddPurchaseDialogOpen] = useState(false);
  const [isAddSaleDialogOpen, setIsAddSaleDialogOpen] = useState(false);
  const [isBulkPurchaseDialogOpen, setIsBulkPurchaseDialogOpen] = useState(false);
  const [isBulkSaleDialogOpen, setIsBulkSaleDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [displayedTransactions, setDisplayedTransactions] = useState<Transaction[]>([]);
  
  const initialFormState = {
    laminateId: "",
    date: new Date().toISOString().split("T")[0],
    quantity: 1,
    customerName: "",
    remarks: ""
  };
  
  const [formData, setFormData] = useState(initialFormState);

  // Filter and sort transactions when the dependencies change
  useEffect(() => {
    const filtered = transactions.filter((transaction) => {
      if (transactionTab !== "all" && transaction.type !== transactionTab) {
        return false;
      }

      const laminate = getLaminateById(transaction.laminateId);
      if (!laminate) return false;

      const searchTerms = [
        laminate.brandName,
        laminate.laminateNumber,
        transaction.customerName || "",
        transaction.remarks || ""
      ];

      return searchTerms.some(term => 
        term.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

    const sorted = [...filtered].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    setDisplayedTransactions(sorted);
  }, [transactions, transactionTab, searchQuery, getLaminateById]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "quantity" ? parseInt(value) : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const openAddPurchaseDialog = () => {
    setFormData(initialFormState);
    setIsAddPurchaseDialogOpen(true);
  };

  const openAddSaleDialog = () => {
    setFormData(initialFormState);
    setIsAddSaleDialogOpen(true);
  };

  const openEditDialog = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setFormData({
      laminateId: transaction.laminateId,
      date: transaction.date,
      quantity: transaction.quantity,
      customerName: transaction.customerName || "",
      remarks: transaction.remarks || ""
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDeleteDialogOpen(true);
  };

  const handleAddPurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.laminateId) {
      alert("Please select a laminate first");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      await addTransaction({
        type: "purchase",
        laminateId: formData.laminateId,
        date: formData.date,
        quantity: formData.quantity,
        remarks: formData.remarks || undefined
      });
      
      setIsAddPurchaseDialogOpen(false);
      setFormData(initialFormState);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.laminateId) {
      alert("Please select a laminate first");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      await addTransaction({
        type: "sale",
        laminateId: formData.laminateId,
        date: formData.date,
        quantity: formData.quantity,
        customerName: formData.customerName || undefined,
        remarks: formData.remarks || undefined
      });
      
      setIsAddSaleDialogOpen(false);
      setFormData(initialFormState);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTransaction) return;
    
    setIsProcessing(true);
    
    try {
      await updateTransaction(selectedTransaction.id, {
        laminateId: formData.laminateId,
        date: formData.date,
        quantity: formData.quantity,
        customerName: formData.customerName || undefined,
        remarks: formData.remarks || undefined
      });
      
      setIsEditDialogOpen(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedTransaction) return;
    
    setIsProcessing(true);
    
    try {
      await deleteTransaction(selectedTransaction.id);
      setIsDeleteDialogOpen(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkPurchaseSubmit = async (items: { id: string; laminateId: string; quantity: number }[], commonData: { date: string; customerName?: string; remarks?: string }) => {
    setIsProcessing(true);
    
    try {
      await addBulkTransactions(items, { ...commonData, type: "purchase" });
      setIsBulkPurchaseDialogOpen(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkSaleSubmit = async (items: { id: string; laminateId: string; quantity: number }[], commonData: { date: string; customerName?: string; remarks?: string }) => {
    setIsProcessing(true);
    
    try {
      await addBulkTransactions(items, { ...commonData, type: "sale" });
      setIsBulkSaleDialogOpen(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMM dd, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            Manage your purchases and sales
          </p>
        </div>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button disabled={isProcessing}>
                <ArrowDown className="mr-1 h-4 w-4" /> Add Purchase
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={openAddPurchaseDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Single Purchase
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsBulkPurchaseDialogOpen(true)}>
                <Package className="mr-2 h-4 w-4" />
                Bulk Purchase
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button disabled={isProcessing}>
                <ArrowUp className="mr-1 h-4 w-4" /> Add Sale
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={openAddSaleDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Single Sale
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsBulkSaleDialogOpen(true)}>
                <Package className="mr-2 h-4 w-4" />
                Bulk Sale
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs defaultValue="all" value={transactionTab} onValueChange={setTransactionTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Transactions</TabsTrigger>
          <TabsTrigger value="purchase">Purchases</TabsTrigger>
          <TabsTrigger value="sale">Sales</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <Search className="mr-2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="max-w-sm"
            />
          </div>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Laminate</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Remarks</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-24 text-center"
                    >
                      {searchQuery || transactionTab !== "all"
                        ? "No transactions found matching your criteria."
                        : "No transactions recorded. Add some to get started."}
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedTransactions.map((transaction) => {
                    const laminate = getLaminateById(transaction.laminateId);
                    if (!laminate) return null;

                    return (
                      <TableRow key={transaction.id}>
                        <TableCell>{formatDate(transaction.date)}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {transaction.type === "purchase" ? (
                              <span className="flex items-center text-blue-600">
                                <ArrowDown className="mr-1 h-3 w-3" />
                                Purchase
                              </span>
                            ) : (
                              <span className="flex items-center text-green-600">
                                <ArrowUp className="mr-1 h-3 w-3" />
                                Sale
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{laminate.brandName}</div>
                            <div className="text-xs text-muted-foreground">
                              {laminate.laminateNumber} ({laminate.laminateFinish})
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{transaction.quantity}</TableCell>
                        <TableCell>
                          {transaction.customerName || 
                            (transaction.type === "sale" ? 
                              <span className="text-muted-foreground">-</span> : "")}
                        </TableCell>
                        <TableCell>
                          {transaction.remarks || <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                disabled={isProcessing}
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
                                onClick={() => openEditDialog(transaction)}
                                className="cursor-pointer"
                                disabled={isProcessing}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openDeleteDialog(transaction)}
                                className="cursor-pointer text-destructive focus:text-destructive"
                                disabled={isProcessing}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAddPurchaseDialogOpen} onOpenChange={setIsAddPurchaseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Purchase</DialogTitle>
            <DialogDescription>
              Enter the details of the new purchase transaction.
            </DialogDescription>
          </DialogHeader>
          <TransactionForm
            formData={formData}
            handleFormChange={handleFormChange}
            handleSelectChange={handleSelectChange}
            laminates={laminates}
            transactionType="purchase"
            onSubmit={handleAddPurchaseSubmit}
            onCancel={() => setIsAddPurchaseDialogOpen(false)}
            isSubmitting={isProcessing}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isAddSaleDialogOpen} onOpenChange={setIsAddSaleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Sale</DialogTitle>
            <DialogDescription>
              Enter the details of the new sale transaction.
            </DialogDescription>
          </DialogHeader>
          <TransactionForm
            formData={formData}
            handleFormChange={handleFormChange}
            handleSelectChange={handleSelectChange}
            laminates={laminates}
            transactionType="sale"
            onSubmit={handleAddSaleSubmit}
            onCancel={() => setIsAddSaleDialogOpen(false)}
            isSubmitting={isProcessing}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>
              Update the details of this transaction.
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <TransactionForm
              formData={formData}
              handleFormChange={handleFormChange}
              handleSelectChange={handleSelectChange}
              laminates={laminates}
              transactionType={selectedTransaction.type}
              onSubmit={handleEditSubmit}
              onCancel={() => setIsEditDialogOpen(false)}
              isSubmitting={isProcessing}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isBulkPurchaseDialogOpen} onOpenChange={setIsBulkPurchaseDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record Bulk Purchase</DialogTitle>
            <DialogDescription>
              Add multiple laminates with different quantities in a single purchase transaction.
            </DialogDescription>
          </DialogHeader>
          <BulkTransactionForm
            laminates={laminates}
            transactionType="purchase"
            onSubmit={handleBulkPurchaseSubmit}
            onCancel={() => setIsBulkPurchaseDialogOpen(false)}
            isSubmitting={isProcessing}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isBulkSaleDialogOpen} onOpenChange={setIsBulkSaleDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record Bulk Sale</DialogTitle>
            <DialogDescription>
              Add multiple laminates with different quantities in a single sale transaction.
            </DialogDescription>
          </DialogHeader>
          <BulkTransactionForm
            laminates={laminates}
            transactionType="sale"
            onSubmit={handleBulkSaleSubmit}
            onCancel={() => setIsBulkSaleDialogOpen(false)}
            isSubmitting={isProcessing}
          />
        </DialogContent>
      </Dialog>

      <Dialog 
        open={isDeleteDialogOpen} 
        onOpenChange={(open) => {
          // Only allow closing if we're not processing
          if (!isProcessing) {
            setIsDeleteDialogOpen(open);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Transaction</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="py-4">
              <div className="rounded-md bg-muted p-4">
                <p>
                  <strong>Type:</strong>{" "}
                  {selectedTransaction.type === "purchase" ? "Purchase" : "Sale"}
                </p>
                <p>
                  <strong>Date:</strong> {formatDate(selectedTransaction.date)}
                </p>
                <p>
                  <strong>Quantity:</strong> {selectedTransaction.quantity}
                </p>
                {selectedTransaction.customerName && (
                  <p>
                    <strong>Customer:</strong> {selectedTransaction.customerName}
                  </p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteSubmit}
              disabled={isProcessing}
            >
              {isProcessing ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Transactions;
