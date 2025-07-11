import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus, Trash2 } from "lucide-react";
import { Laminate } from "@/context/DataContext";
import { ComboboxSelect } from "@/components/ComboboxSelect";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface BulkTransactionItem {
  id: string;
  laminateId: string;
  quantity: number;
}

interface BulkTransactionFormProps {
  laminates: Laminate[];
  transactionType: "purchase" | "sale";
  onSubmit: (items: BulkTransactionItem[], commonData: { date: string; customerName?: string; remarks?: string }) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const BulkTransactionForm: React.FC<BulkTransactionFormProps> = ({
  laminates,
  transactionType,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const [items, setItems] = useState<BulkTransactionItem[]>([
    { id: Math.random().toString(), laminateId: "", quantity: 1 }
  ]);
  const [commonData, setCommonData] = useState({
    date: new Date().toISOString().split("T")[0],
    customerName: "",
    remarks: ""
  });

  const laminateOptions = laminates.map((laminate) => ({
    label: `${laminate.brandName} - ${laminate.laminateNumber} (${laminate.laminateFinish})`,
    value: laminate.id
  }));

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(), laminateId: "", quantity: 1 }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof Omit<BulkTransactionItem, 'id'>, value: string | number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: field === 'quantity' ? Number(value) : value } : item
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validItems = items.filter(item => item.laminateId && item.quantity > 0);
    
    if (validItems.length === 0) {
      alert("Please add at least one valid item");
      return;
    }

    onSubmit(validItems, commonData);
  };

  const getLaminateInfo = (laminateId: string) => {
    const laminate = laminates.find(l => l.id === laminateId);
    return laminate ? `${laminate.brandName} - ${laminate.laminateNumber} (${laminate.laminateFinish})` : "";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Common Fields */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={commonData.date}
            onChange={(e) => setCommonData(prev => ({ ...prev, date: e.target.value }))}
            required
          />
        </div>

        {transactionType === "sale" && (
          <div className="space-y-2">
            <Label htmlFor="customerName">Customer Name</Label>
            <Input
              id="customerName"
              value={commonData.customerName}
              onChange={(e) => setCommonData(prev => ({ ...prev, customerName: e.target.value }))}
              placeholder="Enter customer name"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="remarks">Remarks (Optional)</Label>
          <Input
            id="remarks"
            value={commonData.remarks}
            onChange={(e) => setCommonData(prev => ({ ...prev, remarks: e.target.value }))}
            placeholder="Add any notes or remarks"
          />
        </div>
      </div>

      {/* Items Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Items</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addItem}
            disabled={isSubmitting}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Item
          </Button>
        </div>

        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Laminate</TableHead>
                <TableHead className="w-32">Quantity</TableHead>
                <TableHead className="w-16">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <ComboboxSelect
                      options={laminateOptions}
                      value={item.laminateId}
                      onValueChange={(value) => updateItem(item.id, "laminateId", value)}
                      placeholder="Select laminate"
                      emptyText="No matching laminates found"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
                      disabled={isSubmitting}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      disabled={items.length <= 1 || isSubmitting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Processing..." : `Record ${transactionType === "purchase" ? "Purchases" : "Sales"}`}
        </Button>
      </div>
    </form>
  );
};