
import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "sonner";

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

// Generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Initialize with empty arrays instead of sample data
const initialLaminates: Laminate[] = [];
const initialTransactions: Transaction[] = [];

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [laminates, setLaminates] = useState<Laminate[]>(() => {
    const stored = localStorage.getItem("laminates");
    return stored ? JSON.parse(stored) : initialLaminates;
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const stored = localStorage.getItem("transactions");
    return stored ? JSON.parse(stored) : initialTransactions;
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem("laminates", JSON.stringify(laminates));
  }, [laminates]);

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  const updateStockLevels = () => {
    // Create a copy of laminates to work with
    const updatedLaminates = [...laminates];
    
    // Initialize all stocks to 0
    updatedLaminates.forEach(laminate => {
      laminate.currentStock = 0;
    });
    
    // Create a map for faster lookups
    const laminateMap = new Map<string, Laminate>();
    updatedLaminates.forEach(laminate => {
      laminateMap.set(laminate.id, laminate);
    });
    
    // Process transactions to calculate current stock
    transactions.forEach(transaction => {
      const laminate = laminateMap.get(transaction.laminateId);
      if (laminate) {
        if (transaction.type === "purchase") {
          laminate.currentStock += transaction.quantity;
        } else {
          laminate.currentStock -= transaction.quantity;
        }
      }
    });
    
    // Update the laminates state with calculated stock levels
    setLaminates(updatedLaminates);
  };

  // Recalculate stock whenever transactions or laminates change
  useEffect(() => {
    updateStockLevels();
  }, [transactions]);

  const addLaminate = (laminate: Omit<Laminate, "id" | "currentStock">) => {
    const newLaminate = { 
      ...laminate, 
      id: generateId(), 
      currentStock: 0 
    };
    setLaminates([...laminates, newLaminate]);
    toast.success(`${laminate.brandName} ${laminate.laminateNumber} added`);
  };

  const updateLaminate = (id: string, updates: Partial<Omit<Laminate, "id" | "currentStock">>) => {
    setLaminates(laminates.map(laminate => 
      laminate.id === id ? { ...laminate, ...updates } : laminate
    ));
    toast.success("Laminate updated");
  };

  const deleteLaminate = (id: string) => {
    // Check if there are any transactions for this laminate
    const hasTransactions = transactions.some(t => t.laminateId === id);
    
    if (hasTransactions) {
      toast.error("Cannot delete laminate with existing transactions");
      return;
    }
    
    setLaminates(laminates.filter(laminate => laminate.id !== id));
    toast.success("Laminate deleted");
  };

  // Modified function to clear ALL laminates regardless of transactions
  const clearAllLaminates = () => {
    // Get laminates with transactions
    const laminatesWithTransactions = new Set(
      transactions.map(t => t.laminateId)
    );
    
    // Delete all laminates
    setLaminates([]);
    
    // Also delete all transactions since they would reference non-existent laminates
    setTransactions([]);
    
    toast.success("All laminates and associated transactions have been deleted");
  };

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction = { ...transaction, id: generateId() };
    setTransactions([...transactions, newTransaction]);
    toast.success(`${transaction.type === "purchase" ? "Purchase" : "Sale"} recorded`);
  };

  const updateTransaction = (id: string, updates: Partial<Omit<Transaction, "id" | "type">>) => {
    setTransactions(transactions.map(transaction => 
      transaction.id === id ? { ...transaction, ...updates } : transaction
    ));
    toast.success("Transaction updated");
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(transaction => transaction.id !== id));
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
