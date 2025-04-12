
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
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, "id" | "type">>) => void;
  deleteTransaction: (id: string) => void;
  getLowStockLaminates: () => Laminate[];
  getTopSellingLaminates: (limit?: number) => { laminate: Laminate; totalSold: number }[];
  getLaminateById: (id: string) => Laminate | undefined;
}

// Generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Sample data for development
const initialLaminates: Laminate[] = [
  {
    id: "lam1",
    brandName: "ForestOne",
    laminateNumber: "F6363",
    laminateFinish: "Matte",
    currentStock: 15,
  },
  {
    id: "lam2",
    brandName: "Polytec",
    laminateNumber: "P2365",
    laminateFinish: "Gloss",
    currentStock: 8,
  },
  {
    id: "lam3",
    brandName: "Laminex",
    laminateNumber: "L8975",
    laminateFinish: "Textured",
    currentStock: 2,
  },
  {
    id: "lam4",
    brandName: "Wilsonart",
    laminateNumber: "W4521",
    laminateFinish: "Matte",
    currentStock: 0,
  },
];

const initialTransactions: Transaction[] = [
  {
    id: "trans1",
    type: "purchase",
    laminateId: "lam1",
    date: "2025-04-01",
    quantity: 20,
    remarks: "Initial stock",
  },
  {
    id: "trans2",
    type: "sale",
    laminateId: "lam1",
    date: "2025-04-05",
    quantity: 5,
    customerName: "ABC Cabinets",
    remarks: "First order",
  },
  {
    id: "trans3",
    type: "purchase",
    laminateId: "lam2",
    date: "2025-04-02",
    quantity: 10,
    remarks: "Restock",
  },
  {
    id: "trans4",
    type: "sale",
    laminateId: "lam2",
    date: "2025-04-08",
    quantity: 2,
    customerName: "XYZ Furniture",
  },
  {
    id: "trans5",
    type: "purchase",
    laminateId: "lam3",
    date: "2025-04-03",
    quantity: 5,
  },
  {
    id: "trans6",
    type: "sale",
    laminateId: "lam3",
    date: "2025-04-10",
    quantity: 3,
    customerName: "Modern Interiors",
    remarks: "Rush order",
  },
  {
    id: "trans7",
    type: "purchase",
    laminateId: "lam4",
    date: "2025-04-01",
    quantity: 8,
  },
  {
    id: "trans8",
    type: "sale",
    laminateId: "lam4",
    date: "2025-04-12",
    quantity: 8,
    customerName: "Premium Designs",
  },
];

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
    const stockMap = new Map();
    
    // Initialize stock at 0 for all laminates
    laminates.forEach(laminate => {
      stockMap.set(laminate.id, 0);
    });
    
    // Calculate stock based on transactions
    transactions.forEach(transaction => {
      const currentStock = stockMap.get(transaction.laminateId) || 0;
      if (transaction.type === "purchase") {
        stockMap.set(transaction.laminateId, currentStock + transaction.quantity);
      } else {
        stockMap.set(transaction.laminateId, currentStock - transaction.quantity);
      }
    });
    
    // Update laminates with calculated stock
    setLaminates(prevLaminates => 
      prevLaminates.map(laminate => ({
        ...laminate,
        currentStock: stockMap.get(laminate.id) || 0
      }))
    );
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
