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
  addTransaction: (transaction: Omit<Transaction, "id">) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, "id" | "type">>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getLowStockLaminates: () => Laminate[];
  getTopSellingLaminates: (limit?: number) => { laminate: Laminate; totalSold: number }[];
  getLaminateById: (id: string) => Laminate | undefined;
  getLaminatesByCompany: () => { company: string; count: number; stockQuantity: number }[];
  getTransactionsByCompany: (type: "purchase" | "sale") => { company: string; units: number }[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [laminates, setLaminates] = useState<Laminate[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch laminates from Supabase
  const fetchLaminates = async () => {
    try {
      setIsLoading(true);
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
    } catch (err) {
      console.error("Error in fetchLaminates:", err);
      toast.error("Failed to load inventory data");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch transactions from Supabase
  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });
      
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
    } catch (err) {
      console.error("Error in fetchTransactions:", err);
      toast.error("Failed to load transaction data");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch on component mount
  useEffect(() => {
    fetchLaminates();
    fetchTransactions();
  }, []);

  // Update a single laminate's stock level based on all its transactions
  const updateLaminateStock = async (laminateId: string) => {
    try {
      // Get all transactions for this laminate
      const { data: lamTransactions, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('inventory_item_id', laminateId);
      
      if (txError) {
        toast.error(`Error retrieving transactions for inventory update`);
        return false;
      }
      
      // Calculate current stock based on transactions
      let stock = 0;
      lamTransactions.forEach(transaction => {
        stock += transaction.type === 'purchase' ? transaction.quantity : -transaction.quantity;
      });
      
      // Update the laminate in the database
      const { error: updateError } = await supabase
        .from('inventory_items')
        .update({ quantity: stock })
        .eq('id', laminateId);

      if (updateError) {
        const laminate = laminates.find(l => l.id === laminateId);
        toast.error(`Error updating stock for ${laminate?.brandName} ${laminate?.laminateNumber}`);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error in updateLaminateStock:", error);
      toast.error("Failed to update inventory");
      return false;
    }
  };

  const addLaminate = async (laminate: Omit<Laminate, "id" | "currentStock">) => {
    try {
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
        await fetchLaminates(); // Use await to ensure data is refreshed
      }
    } catch (error) {
      console.error("Error in addLaminate:", error);
      toast.error("Failed to add laminate");
    }
  };

  const updateLaminate = async (id: string, updates: Partial<Omit<Laminate, "id" | "currentStock">>) => {
    try {
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
      await fetchLaminates(); // Use await to ensure data is refreshed
    } catch (error) {
      console.error("Error in updateLaminate:", error);
      toast.error("Failed to update laminate");
    }
  };

  const deleteLaminate = async (id: string) => {
    try {
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
      await fetchLaminates(); // Use await to ensure data is refreshed
      await fetchTransactions(); // Use await to ensure data is refreshed
    } catch (error) {
      console.error("Error in deleteLaminate:", error);
      toast.error("Failed to delete laminate");
    }
  };

  const clearAllLaminates = async () => {
    try {
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
      await fetchLaminates(); // Use await to ensure data is refreshed
      await fetchTransactions(); // Use await to ensure data is refreshed
    } catch (error) {
      console.error("Error in clearAllLaminates:", error);
      toast.error("Failed to clear laminates and transactions");
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, "id">) => {
    try {
      setIsLoading(true);
      // First add the transaction
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          type: transaction.type,
          inventory_item_id: transaction.laminateId,
          date: transaction.date,
          quantity: transaction.quantity,
          customer_name: transaction.customerName,
          notes: transaction.remarks
        })
        .select();
    
      if (error) {
        toast.error("Error adding transaction");
        return;
      }

      // Optimistically update the UI
      setTransactions(prev => [
        {
          id: data[0].id,
          type: transaction.type,
          laminateId: transaction.laminateId,
          date: transaction.date,
          quantity: transaction.quantity,
          customerName: transaction.customerName,
          remarks: transaction.remarks
        },
        ...prev
      ]);

      // Then immediately update the inventory stock for this laminate
      const successful = await updateLaminateStock(transaction.laminateId);
    
      if (successful) {
        toast.success(`${transaction.type === "purchase" ? "Purchase" : "Sale"} recorded and inventory updated`);
        
        // Refresh laminates to show updated stock levels
        await fetchLaminates();
      } else {
        // We already showed an error in updateLaminateStock if it failed
        await fetchTransactions(); // Refresh transactions to ensure consistency
      }
    } catch (error) {
      console.error("Error in addTransaction:", error);
      toast.error("Failed to add transaction");
    } finally {
      setIsLoading(false);
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Omit<Transaction, "id" | "type">>) => {
    try {
      setIsLoading(true);
      // First, get the current transaction to know which laminate to update
      const transaction = transactions.find(t => t.id === id);
      if (!transaction) {
        toast.error("Transaction not found");
        return;
      }
      
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
    
      // Optimistically update the UI
      setTransactions(prev => prev.map(t => 
        t.id === id 
          ? { ...t, ...updates } 
          : t
      ));

      // List of laminates that need stock updates
      const laminatesToUpdate = new Set<string>();
      
      // Always update the current laminate
      laminatesToUpdate.add(transaction.laminateId);
      
      // If laminate was changed, also update the new laminate
      if (updates.laminateId && updates.laminateId !== transaction.laminateId) {
        laminatesToUpdate.add(updates.laminateId);
      }
      
      // Update stock levels for all affected laminates
      let allSuccessful = true;
      for (const laminateId of laminatesToUpdate) {
        const success = await updateLaminateStock(laminateId);
        if (!success) allSuccessful = false;
      }
      
      if (allSuccessful) {
        toast.success("Transaction updated and inventory adjusted");
      } else {
        toast.warning("Transaction updated but there was an issue updating inventory");
      }
      
      // Refresh laminates to show updated stock levels
      await fetchLaminates();
    } catch (error) {
      console.error("Error in updateTransaction:", error);
      toast.error("Failed to update transaction");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      setIsLoading(true);
      // First, get the transaction to know which laminate to update after deletion
      const transaction = transactions.find(t => t.id === id);
      if (!transaction) {
        toast.error("Transaction not found");
        return;
      }
      
      const laminateId = transaction.laminateId;
      
      // Optimistically update the UI first for better responsiveness
      setTransactions(prev => prev.filter(t => t.id !== id));
      
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
    
      if (error) {
        // If there's an error, revert the optimistic update
        toast.error("Error deleting transaction");
        await fetchTransactions();
        return;
      }
      
      // Update the stock for the affected laminate
      const successful = await updateLaminateStock(laminateId);
      
      if (successful) {
        toast.success("Transaction deleted and inventory updated");
      } else {
        toast.warning("Transaction deleted but there was an issue updating inventory");
      }
      
      // Refresh laminates to show updated stock levels
      await fetchLaminates();
    } catch (error) {
      console.error("Error in deleteTransaction:", error);
      toast.error("Failed to delete transaction");
      // Revert the optimistic update in case of error
      await fetchTransactions();
    } finally {
      setIsLoading(false);
    }
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
  
  // New helper function to get laminates grouped by company name
  const getLaminatesByCompany = () => {
    const companies = new Map<string, { count: number, stockQuantity: number }>();
    
    laminates.forEach(laminate => {
      const company = laminate.brandName;
      const current = companies.get(company) || { count: 0, stockQuantity: 0 };
      
      companies.set(company, {
        count: current.count + 1,
        stockQuantity: current.stockQuantity + laminate.currentStock
      });
    });
    
    return Array.from(companies.entries())
      .map(([company, data]) => ({ 
        company, 
        count: data.count,
        stockQuantity: data.stockQuantity 
      }))
      .sort((a, b) => b.count - a.count);
  };
  
  // New helper function to get transaction quantities grouped by company name
  const getTransactionsByCompany = (type: "purchase" | "sale") => {
    const companies = new Map<string, number>();
    
    transactions
      .filter(t => t.type === type)
      .forEach(transaction => {
        const laminate = getLaminateById(transaction.laminateId);
        if (laminate) {
          const company = laminate.brandName;
          const currentUnits = companies.get(company) || 0;
          companies.set(company, currentUnits + transaction.quantity);
        }
      });
    
    return Array.from(companies.entries())
      .map(([company, units]) => ({ company, units }))
      .sort((a, b) => b.units - a.units);
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
    getLaminateById,
    getLaminatesByCompany,
    getTransactionsByCompany
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
