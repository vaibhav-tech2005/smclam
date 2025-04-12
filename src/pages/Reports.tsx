
import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar, Download, Printer } from "lucide-react";
import { useData, Transaction } from "@/context/DataContext";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, parseISO, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from "date-fns";

const Reports = () => {
  const { transactions, laminates, getLaminateById, getTopSellingLaminates } = useData();
  
  const [reportType, setReportType] = useState<"sales" | "purchases">("sales");
  const [timeFrame, setTimeFrame] = useState<"month" | "year" | "custom">("month");
  const [customerFilter, setCustomerFilter] = useState<string>("all");
  
  const currentDate = new Date();
  const [startDate, setStartDate] = useState<string>(
    startOfMonth(currentDate).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState<string>(
    endOfMonth(currentDate).toISOString().split("T")[0]
  );
  
  const tableRef = useRef<HTMLTableElement>(null);
  
  // Get unique customer names for filtering
  const uniqueCustomers = [...new Set(
    transactions
      .filter(t => t.type === "sale" && t.customerName)
      .map(t => t.customerName)
  )].sort();
  
  // Filter transactions based on criteria
  const filteredTransactions = transactions.filter(transaction => {
    // Filter by type
    if (transaction.type !== reportType) return false;
    
    // Filter by date range
    const transactionDate = new Date(transaction.date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the entire end date
    
    if (transactionDate < start || transactionDate > end) return false;
    
    // Filter by customer (sales only)
    if (reportType === "sales" && customerFilter !== "all" && transaction.customerName !== customerFilter) {
      return false;
    }
    
    return true;
  });
  
  // Prepare data for charts
  const prepareChartData = () => {
    // Group by laminate
    const groupedByLaminate = filteredTransactions.reduce((acc: Record<string, number>, transaction) => {
      const laminate = getLaminateById(transaction.laminateId);
      if (!laminate) return acc;
      
      const key = `${laminate.brandName} ${laminate.laminateNumber}`;
      if (!acc[key]) acc[key] = 0;
      acc[key] += transaction.quantity;
      
      return acc;
    }, {});
    
    // Convert to array format for charts
    return Object.entries(groupedByLaminate).map(([name, quantity]) => ({
      name,
      quantity
    })).sort((a, b) => b.quantity - a.quantity);
  };
  
  const chartData = prepareChartData();
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658"];
  
  // Handle time frame changes
  const handleTimeFrameChange = (value: string) => {
    setTimeFrame(value as "month" | "year" | "custom");
    
    if (value === "month") {
      setStartDate(startOfMonth(currentDate).toISOString().split("T")[0]);
      setEndDate(endOfMonth(currentDate).toISOString().split("T")[0]);
    } else if (value === "year") {
      setStartDate(startOfYear(currentDate).toISOString().split("T")[0]);
      setEndDate(endOfYear(currentDate).toISOString().split("T")[0]);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMM dd, yyyy");
    } catch (error) {
      return dateString;
    }
  };
  
  // Calculate total quantity and generate summary
  const totalQuantity = filteredTransactions.reduce((sum, transaction) => sum + transaction.quantity, 0);
  
  // Get top selling laminates
  const topSellingLaminates = getTopSellingLaminates(5);

  // Export data as CSV
  const exportCSV = () => {
    // Build CSV content
    const headers = ["Date", "Type", "Laminate", "Quantity", "Customer", "Remarks"];
    const rows = filteredTransactions.map(transaction => {
      const laminate = getLaminateById(transaction.laminateId);
      return [
        transaction.date,
        transaction.type,
        laminate ? `${laminate.brandName} ${laminate.laminateNumber}` : "Unknown",
        transaction.quantity,
        transaction.customerName || "",
        transaction.remarks || ""
      ];
    });
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${reportType}_report_${startDate}_to_${endDate}.csv`;
    link.click();
  };
  
  // Print the report
  const printReport = () => {
    if (tableRef.current) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${reportType === "sales" ? "Sales" : "Purchase"} Report</title>
              <style>
                body { font-family: Arial, sans-serif; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                h1, h2 { text-align: center; }
              </style>
            </head>
            <body>
              <h1>${reportType === "sales" ? "Sales" : "Purchase"} Report</h1>
              <h2>${formatDate(startDate)} to ${formatDate(endDate)}</h2>
              ${tableRef.current.outerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Generate and view detailed reports
        </p>
      </div>

      <Tabs defaultValue="reports" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="reports">Transaction Reports</TabsTrigger>
          <TabsTrigger value="top-selling">Top Selling Laminates</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Report Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Report Type
                  </label>
                  <Select
                    value={reportType}
                    onValueChange={(value) => setReportType(value as "sales" | "purchases")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="purchases">Purchases</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Time Frame
                  </label>
                  <Select value={timeFrame} onValueChange={handleTimeFrameChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Current Month</SelectItem>
                      <SelectItem value="year">Current Year</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {reportType === "sales" && (
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Customer
                    </label>
                    <Select value={customerFilter} onValueChange={setCustomerFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Customers</SelectItem>
                        {uniqueCustomers.map((customer) => (
                          <SelectItem key={customer} value={customer as string}>
                            {customer}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button variant="outline" onClick={exportCSV}>
                    <Download className="mr-1 h-4 w-4" />
                    Export CSV
                  </Button>
                  <Button variant="outline" onClick={printReport}>
                    <Printer className="mr-1 h-4 w-4" />
                    Print
                  </Button>
                </div>
              </div>

              {timeFrame === "custom" && (
                <div className="grid gap-4 sm:grid-cols-2 mt-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Start Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      End Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>
                    <span className="font-medium">Date Range:</span>{" "}
                    {formatDate(startDate)} to {formatDate(endDate)}
                  </p>
                  <p>
                    <span className="font-medium">Report Type:</span>{" "}
                    {reportType === "sales" ? "Sales" : "Purchases"}
                  </p>
                  {reportType === "sales" && customerFilter !== "all" && (
                    <p>
                      <span className="font-medium">Customer:</span> {customerFilter}
                    </p>
                  )}
                  <p>
                    <span className="font-medium">Total Transactions:</span>{" "}
                    {filteredTransactions.length}
                  </p>
                  <p>
                    <span className="font-medium">Total {reportType === "sales" ? "Units Sold" : "Units Purchased"}:</span>{" "}
                    {totalQuantity}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Distribution by Laminate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="quantity"
                        nameKey="name"
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detailed Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table ref={tableRef}>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Laminate</TableHead>
                      <TableHead>Quantity</TableHead>
                      {reportType === "sales" && <TableHead>Customer</TableHead>}
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={reportType === "sales" ? 5 : 4}
                          className="h-24 text-center"
                        >
                          No transactions found for the selected criteria.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTransactions.map((transaction) => {
                        const laminate = getLaminateById(transaction.laminateId);
                        return (
                          <TableRow key={transaction.id}>
                            <TableCell>{formatDate(transaction.date)}</TableCell>
                            <TableCell>
                              {laminate
                                ? `${laminate.brandName} ${laminate.laminateNumber}`
                                : "Unknown"}
                            </TableCell>
                            <TableCell>{transaction.quantity}</TableCell>
                            {reportType === "sales" && (
                              <TableCell>
                                {transaction.customerName || "-"}
                              </TableCell>
                            )}
                            <TableCell>
                              {transaction.remarks || "-"}
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
        </TabsContent>

        <TabsContent value="top-selling" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Selling Laminates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topSellingLaminates.map(item => ({
                      name: `${item.laminate.brandName} ${item.laminate.laminateNumber}`,
                      units: item.totalSold
                    }))}
                    margin={{ top: 5, right: 30, left: 20, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end"
                      height={70}
                      tick={{fontSize: 12}}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar name="Units Sold" dataKey="units" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Sellers Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Number</TableHead>
                      <TableHead>Finish</TableHead>
                      <TableHead>Total Units Sold</TableHead>
                      <TableHead>Current Stock</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topSellingLaminates.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="h-24 text-center"
                        >
                          No sales data available.
                        </TableCell>
                      </TableRow>
                    ) : (
                      topSellingLaminates.map((item, index) => (
                        <TableRow key={item.laminate.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">
                            {item.laminate.brandName}
                          </TableCell>
                          <TableCell>{item.laminate.laminateNumber}</TableCell>
                          <TableCell>{item.laminate.laminateFinish}</TableCell>
                          <TableCell>{item.totalSold}</TableCell>
                          <TableCell>
                            <span className={
                              item.laminate.currentStock === 0
                                ? "text-red-600 font-medium"
                                : item.laminate.currentStock <= 2
                                ? "text-amber-600 font-medium"
                                : ""
                            }>
                              {item.laminate.currentStock}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Input component
const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <input
      className={`flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
};

export default Reports;
