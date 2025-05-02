
import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Types
export interface Laminate {
  id: string;
  brandName: string;
  laminateNumber: string;
  laminateFinish: string;
  currentStock: number;
}

export interface Transaction {
  id: string;
  type: "purchase" | "sale";
  laminateId: string;
  date: string;
  quantity: number;
  customerName?: string;
  remarks?: string;
}

interface DataContextType {
  laminates: Laminate[];
  transactions: Transaction[];
  addLaminate: (laminate: Omit<Laminate, "id" | "currentStock">) => void;
  updateLaminate: (id: string, updates: Partial<Omit<Laminate, "id" | "currentStock">>) => void;
  deleteLaminate: (id: string) => void;
  clearAllLaminates: () => void;
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, "id" | "type">>) => void;
  deleteTransaction: (id: string) => void;
  getLowStockLaminates: () => Laminate[];
  getTopSellingLaminates: (limit?: number) => { laminate: Laminate; totalSold: number }[];
  getLaminateById: (id: string) => Laminate | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [laminates, setLaminates] = useState<Laminate[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Fetch laminates from Supabase
  const fetchLaminates = async () => {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*');
    
    if (error) {
      toast.error("Error fetching laminates");
      return;
    }
    
    // Map database fields to app model fields
    const mappedLaminates: Laminate[] = data.map(item => ({
      id: item.id,
      brandName: item.company,
      laminateNumber: item.laminate_number,
      laminateFinish: item.laminate_finish,
      currentStock: item.quantity || 0
    }));
    
    setLaminates(mappedLaminates);
  };

  // Fetch transactions from Supabase
  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*');
    
    if (error) {
      toast.error("Error fetching transactions");
      return;
    }
    
    // Map database fields to app model fields
    const mappedTransactions: Transaction[] = data.map(item => ({
      id: item.id,
      type: item.type as "purchase" | "sale",
      laminateId: item.inventory_item_id,
      date: item.date,
      quantity: item.quantity,
      customerName: item.customer_name || undefined,
      remarks: item.notes || undefined
    }));
    
    setTransactions(mappedTransactions);
  };

  // Initial data fetch on component mount
  useEffect(() => {
    fetchLaminates();
    fetchTransactions();
  }, []);

  // Update stock levels
  useEffect(() => {
    const updateStockLevels = async () => {
      // For each laminate, update its quantity in the database based on transactions
      for (const laminate of laminates) {
        // Calculate stock based on transactions
        let stock = 0;
        transactions.forEach(transaction => {
          if (transaction.laminateId === laminate.id) {
            stock += transaction.type === 'purchase' ? transaction.quantity : -transaction.quantity;
          }
        });

        // Update the laminate in the database
        const { error } = await supabase
          .from('inventory_items')
          .update({ quantity: stock })
          .eq('id', laminate.id);

        if (error) {
          toast.error(`Error updating stock for ${laminate.brandName} ${laminate.laminateNumber}`);
        }
      }
    };

    if (laminates.length > 0 && transactions.length > 0) {
      updateStockLevels();
    }
  }, [transactions, laminates]);

  const addLaminate = async (laminate: Omit<Laminate, "id" | "currentStock">) => {
    const { data, error } = await supabase
      .from('inventory_items')
      .insert({
        company: laminate.brandName,
        laminate_number: laminate.laminateNumber,
        laminate_finish: laminate.laminateFinish,
        quantity: 0
      })
      .select();

    if (error) {
      toast.error("Error adding laminate");
      return;
    }

    if (data) {
      toast.success(`${laminate.brandName} ${laminate.laminateNumber} added`);
      fetchLaminates(); // Refresh laminates list
    }
  };

  const updateLaminate = async (id: string, updates: Partial<Omit<Laminate, "id" | "currentStock">>) => {
    const updateData: any = {};
    
    if (updates.brandName !== undefined) updateData.company = updates.brandName;
    if (updates.laminateNumber !== undefined) updateData.laminate_number = updates.laminateNumber;
    if (updates.laminateFinish !== undefined) updateData.laminate_finish = updates.laminateFinish;
    
    const { error } = await supabase
      .from('inventory_items')
      .update(updateData)
      .eq('id', id);
  
    if (error) {
      toast.error("Error updating laminate");
      return;
    }
  
    toast.success("Laminate updated");
    fetchLaminates(); // Refresh laminates list
  };

  const deleteLaminate = async (id: string) => {
    // First, delete related transactions
    const { error: transactionError } = await supabase
      .from('transactions')
      .delete()
      .eq('inventory_item_id', id);
    
    if (transactionError) {
      toast.error("Error deleting related transactions");
      return;
    }
  
    // Then delete the laminate
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id);
  
    if (error) {
      toast.error("Error deleting laminate");
      return;
    }
  
    toast.success("Laminate deleted");
    fetchLaminates(); // Refresh laminates list
    fetchTransactions(); // Refresh transactions list
  };

  const clearAllLaminates = async () => {
    // First, delete all transactions
    const { error: transactionsError } = await supabase
      .from('transactions')
      .delete()
      .neq('id', null); // Delete all transactions
  
    if (transactionsError) {
      toast.error("Error clearing transactions");
      return;
    }
  
    // Then, delete all laminates
    const { error: laminatesError } = await supabase
      .from('inventory_items')
      .delete()
      .neq('id', null); // Delete all laminates
  
    if (laminatesError) {
      toast.error("Error clearing laminates");
      return;
    }
  
    toast.success("All laminates and associated transactions have been deleted");
    fetchLaminates(); // Refresh laminates list
    fetchTransactions(); // Refresh transactions list
  };

  const addTransaction = async (transaction: Omit<Transaction, "id">) => {
    const { error } = await supabase
      .from('transactions')
      .insert({
        type: transaction.type,
        inventory_item_id: transaction.laminateId,
        date: transaction.date,
        quantity: transaction.quantity,
        customer_name: transaction.customerName,
        notes: transaction.remarks
      });
  
    if (error) {
      toast.error("Error adding transaction");
      return;
    }
  
    toast.success(`${transaction.type === "purchase" ? "Purchase" : "Sale"} recorded`);
    fetchTransactions(); // Refresh transactions list
  };

  const updateTransaction = async (id: string, updates: Partial<Omit<Transaction, "id" | "type">>) => {
    const updateData: any = {};
    
    if (updates.laminateId !== undefined) updateData.inventory_item_id = updates.laminateId;
    if (updates.date !== undefined) updateData.date = updates.date;
    if (updates.quantity !== undefined) updateData.quantity = updates.quantity;
    if (updates.customerName !== undefined) updateData.customer_name = updates.customerName;
    if (updates.remarks !== undefined) updateData.notes = updates.remarks;
    
    const { error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', id);
  
    if (error) {
      toast.error("Error updating transaction");
      return;
    }
  
    toast.success("Transaction updated");
    fetchTransactions(); // Refresh transactions list
  };

  const deleteTransaction = async (id: string) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);
  
    if (error) {
      toast.error("Error deleting transaction");
      return;
    }
  
    toast.success("Transaction deleted");
    fetchTransactions(); // Refresh transactions list
  };

  const getLowStockLaminates = () => {
    return laminates.filter(laminate => laminate.currentStock <= 2);
  };

  const getTopSellingLaminates = (limit = 5) => {
    const salesByLaminate = new Map();
    
    // Count sales for each laminate
    transactions
      .filter(t => t.type === "sale")
      .forEach(transaction => {
        const currentSales = salesByLaminate.get(transaction.laminateId) || 0;
        salesByLaminate.set(transaction.laminateId, currentSales + transaction.quantity);
      });
    
    // Create array of laminate + sales for sorting
    const laminateSales = Array.from(salesByLaminate.entries())
      .map(([laminateId, totalSold]) => ({
        laminate: laminates.find(l => l.id === laminateId)!,
        totalSold: totalSold as number
      }))
      .filter(item => item.laminate) // Ensure the laminate exists
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, limit);
    
    return laminateSales;
  };

  const getLaminateById = (id: string) => {
    return laminates.find(laminate => laminate.id === id);
  };

  const value = {
    laminates,
    transactions,
    addLaminate,
    updateLaminate,
    deleteLaminate,
    clearAllLaminates,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getLowStockLaminates,
    getTopSellingLaminates,
    getLaminateById
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

export default DataContext;
