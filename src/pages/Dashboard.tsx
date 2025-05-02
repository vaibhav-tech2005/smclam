import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Package,
  ShoppingCart, 
  TrendingUp, 
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { 
    laminates, 
    transactions, 
    getTopSellingLaminates,
    getLaminatesByCompany,
    getTransactionsByCompany
  } = useData();
  
  // Calculate statistics
  const totalLaminates = laminates.length;
  
  // Calculate total stock quantity
  const totalStockQuantity = laminates.reduce(
    (total, laminate) => total + laminate.currentStock,
    0
  );
  
  const purchases = transactions.filter(t => t.type === "purchase");
  const sales = transactions.filter(t => t.type === "sale");
  
  const today = new Date().toISOString().split("T")[0];
  const thisMonth = today.substring(0, 7);
  
  const purchasesThisMonth = purchases.filter(p => p.date.startsWith(thisMonth));
  const salesThisMonth = sales.filter(s => s.date.startsWith(thisMonth));
  
  const topSelling = getTopSellingLaminates(5);
  const laminatesByCompany = getLaminatesByCompany();
  const purchasesByCompany = getTransactionsByCompany("purchase");
  const salesByCompany = getTransactionsByCompany("sale");
  
  // Calculate total units purchased and sold this month
  const unitsPurchasedThisMonth = purchasesThisMonth.reduce(
    (total, p) => total + p.quantity,
    0
  );
  
  const unitsSoldThisMonth = salesThisMonth.reduce(
    (total, s) => total + s.quantity,
    0
  );
  
  const stockData = [
    { name: "In Stock", value: totalStockQuantity },
    { name: "Sold", value: unitsSoldThisMonth },
  ];
  
  const COLORS = ["#0088FE", "#FFBB28", "#00C49F", "#FF8042", "#8884D8", "#82CA9D"];
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your inventory and sales
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Stock Quantity
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStockQuantity}</div>
            <div className="mt-2 text-xs text-muted-foreground">
              <div className="font-medium mb-1">By company:</div>
              <div className="max-h-16 overflow-y-auto">
                {laminatesByCompany.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{item.company}:</span>
                    <span>{item.stockQuantity}</span>
                  </div>
                ))}
              </div>
              <p className="mt-2">
                <Link to="/inventory" className="hover:underline">View inventory</Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Units Purchased (Month)
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unitsPurchasedThisMonth}</div>
            <div className="mt-2 text-xs text-muted-foreground">
              <div className="font-medium mb-1">By company:</div>
              <div className="max-h-16 overflow-y-auto">
                {purchasesByCompany.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{item.company}:</span>
                    <span>{item.units}</span>
                  </div>
                ))}
              </div>
              <p className="flex items-center mt-2">
                <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                From {purchasesThisMonth.length} orders
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Units Sold (Month)
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unitsSoldThisMonth}</div>
            <div className="mt-2 text-xs text-muted-foreground">
              <div className="font-medium mb-1">By company:</div>
              <div className="max-h-16 overflow-y-auto">
                {salesByCompany.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{item.company}:</span>
                    <span>{item.units}</span>
                  </div>
                ))}
              </div>
              <p className="flex items-center mt-2">
                <ArrowDown className="h-3 w-3 text-blue-500 mr-1" />
                From {salesThisMonth.length} orders
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Top Selling Laminates</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topSelling.map(item => ({
                    name: `${item.laminate.brandName} ${item.laminate.laminateNumber}`,
                    units: item.totalSold
                  }))}
                  margin={{ top: 5, right: 30, left: 20, bottom: 70 }}
                >
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end"
                    height={70}
                    tick={{fontSize: 12}}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="units" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Inventory by Company</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={laminatesByCompany}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="company"
                    label={({company, percent}) => `${company}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {laminatesByCompany.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip formatter={(value, name, props) => [`${value} items`, props.payload.company]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
