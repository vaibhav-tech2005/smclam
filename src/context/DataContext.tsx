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
      .from('laminates')
      .select('*');
    
    if (error) {
      toast.error("Error fetching laminates");
      return;
    }
    
    setLaminates(data || []);
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
    
    setTransactions(data || []);
  };

  // Update stock levels
  const updateStockLevels = () => {
    const updatedLaminates = laminates.map(laminate => ({
      ...laminate,
      currentStock: 0
    }));

    const laminateMap = new Map(updatedLaminates.map(l => [l.id, l]));

    transactions.forEach(transaction => {
      const laminate = laminateMap.get(transaction.laminateId);
      if (laminate) {
        laminate.currentStock += transaction.type === 'purchase' 
          ? transaction.quantity 
          : -transaction.quantity;
      }
    });

    setLaminates(Array.from(laminateMap.values()));
  };

  // Initial data fetch on component mount
  useEffect(() => {
    fetchLaminates();
    fetchTransactions();
  }, []);

  // Recalculate stock when transactions change
  useEffect(() => {
    updateStockLevels();
  }, [transactions]);

  const addLaminate = async (laminate: Omit<Laminate, "id" | "currentStock">) => {
    const { data, error } = await supabase
      .from('laminates')
      .insert({
        brand_name: laminate.brandName,
        laminate_number: laminate.laminateNumber,
        laminate_finish: laminate.laminateFinish
      })
      .select();

    if (error) {
      toast.error("Error adding laminate");
      return;
    }

    if (data) {
      toast.success(`${laminate.brandName} ${laminate.laminateNumber} added`);
    }
  };

  const updateLaminate = async (id: string, updates: Partial<Omit<Laminate, "id" | "currentStock">>) => {
    const { error } = await supabase
      .from('laminates')
      .update({
        brand_name: updates.brandName,
        laminate_number: updates.laminateNumber,
        laminate_finish: updates.laminateFinish
      })
      .eq('id', id);
  
    if (error) {
      toast.error("Error updating laminate");
      return;
    }
  
    toast.success("Laminate updated");
  };

  const deleteLaminate = async (id: string) => {
    const { error } = await supabase
      .from('laminates')
      .delete()
      .eq('id', id);
  
    if (error) {
      toast.error("Error deleting laminate");
      return;
    }
  
    toast.success("Laminate deleted");
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
      .from('laminates')
      .delete()
      .neq('id', null); // Delete all laminates
  
    if (laminatesError) {
      toast.error("Error clearing laminates");
      return;
    }
  
    toast.success("All laminates and associated transactions have been deleted");
  };

  const addTransaction = async (transaction: Omit<Transaction, "id">) => {
    const { error } = await supabase
      .from('transactions')
      .insert({
        type: transaction.type,
        laminate_id: transaction.laminateId,
        date: transaction.date,
        quantity: transaction.quantity,
        customer_name: transaction.customerName,
        remarks: transaction.remarks
      });
  
    if (error) {
      toast.error("Error adding transaction");
      return;
    }
  
    toast.success(`${transaction.type === "purchase" ? "Purchase" : "Sale"} recorded`);
  };

  const updateTransaction = async (id: string, updates: Partial<Omit<Transaction, "id" | "type">>) => {
    const { error } = await supabase
      .from('transactions')
      .update({
        laminate_id: updates.laminateId,
        date: updates.date,
        quantity: updates.quantity,
        customer_name: updates.customerName,
        remarks: updates.remarks
      })
      .eq('id', id);
  
    if (error) {
      toast.error("Error updating transaction");
      return;
    }
  
    toast.success("Transaction updated");
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
