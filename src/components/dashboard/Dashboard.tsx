import React, { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  AlertTriangle, 
  ArrowUpRight, 
  Receipt, 
  Package, 
  Clock, 
  Calendar,
  Eye,
  PlusCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { usePOS } from '../../context/POSContext';
import { Transaction } from '../../types';
import { InvoiceModal } from '../sales/InvoiceModal';

export const Dashboard: React.FC = () => {
  const { 
    transactions, 
    products, 
    expenses, 
    cashRegister, 
    settings, 
    setActiveTab, 
    currentLocation 
  } = usePOS();

  const [selectedInvoice, setSelectedInvoice] = useState<Transaction | null>(null);

  // Financial Computations
  const salesTransactions = transactions.filter(t => t.type === 'sell');
  const purchaseTransactions = transactions.filter(t => t.type === 'purchase');

  const totalSalesAmount = salesTransactions.reduce((sum, t) => sum + t.finalTotal, 0);
  const totalPurchasesAmount = purchaseTransactions.reduce((sum, t) => sum + t.finalTotal, 0);
  const totalExpensesAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Calculate approximate COGS (Cost of Goods Sold)
  const totalCOGS = salesTransactions.reduce((sum, t) => {
    return sum + t.items.reduce((itemSum, item) => itemSum + (item.purchasePrice * item.quantity), 0);
  }, 0);

  const grossProfit = totalSalesAmount - totalCOGS;
  const netProfit = grossProfit - totalExpensesAmount;

  const lowStockProducts = products.filter(p => p.currentStock <= p.alertQuantity);

  // Mock 7-day trend data derived from realistic patterns
  const chartData = [
    { day: 'Mon', sales: 1240, purchases: 800, profit: 440 },
    { day: 'Tue', sales: 1890, purchases: 650, profit: 820 },
    { day: 'Wed', sales: 2390, purchases: 1200, profit: 950 },
    { day: 'Thu', sales: 1780, purchases: 450, profit: 780 },
    { day: 'Fri', sales: 2890, purchases: 1500, profit: 1120 },
    { day: 'Sat', sales: 3490, purchases: 900, profit: 1680 },
    { day: 'Sun', sales: 2980, purchases: 400, profit: 1450 },
  ];

  const categoryPieData = [
    { name: 'Electronics', value: 4200, color: '#2563eb' },
    { name: 'Beverages', value: 1850, color: '#10b981' },
    { name: 'Bakery', value: 1420, color: '#f59e0b' },
    { name: 'Apparel', value: 2100, color: '#8b5cf6' },
    { name: 'Personal Care', value: 980, color: '#ec4899' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Executive Business Overview</h1>
          <p className="text-xs text-slate-500">
            Real-time sales, inventory valuation, and cash flow metrics for <span className="font-semibold text-slate-700">{currentLocation.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('pos')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Launch POS Register</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Sales</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {settings.currencySymbol}{totalSalesAmount.toFixed(2)}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+18.4% from last period</span>
            </div>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Net Profit</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-emerald-600 tracking-tight">
              {settings.currencySymbol}{netProfit.toFixed(2)}
            </h3>
            <p className="text-xs text-slate-400 mt-1">Gross Margin: ~{((grossProfit / (totalSalesAmount || 1)) * 100).toFixed(1)}%</p>
          </div>
        </div>

        {/* Invoices Count */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Invoices</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {salesTransactions.length}
            </h3>
            <p className="text-xs text-slate-400 mt-1">Avg Ticket: {settings.currencySymbol}{(totalSalesAmount / (salesTransactions.length || 1)).toFixed(2)}</p>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div 
          onClick={() => setActiveTab('products')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stock Alerts</span>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${lowStockProducts.length > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className={`text-2xl font-black tracking-tight ${lowStockProducts.length > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
              {lowStockProducts.length} Items Low
            </h3>
            <p className="text-xs text-slate-400 mt-1 group-hover:text-blue-600 transition-colors">Click to manage inventory →</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales & Purchase Trends */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Weekly Sales & Profit Trend</h3>
              <p className="text-xs text-slate-400">Comparing gross revenue against product purchase cost</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-blue-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Sales
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Profit
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={val => `$${val}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', color: '#fff', border: 'none' }}
                  formatter={(val: number) => [`$${val.toFixed(2)}`, '']}
                />
                <Area type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#salesGrad)" name="Gross Sales" />
                <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#profitGrad)" name="Net Margin" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Revenue by Category</h3>
            <p className="text-xs text-slate-400">Share of sales across departments</p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: number) => `$${val.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs pt-2 border-t border-slate-100">
            {categoryPieData.map(cat => (
              <div key={cat.name} className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
                  <span>{cat.name}</span>
                </span>
                <span className="font-bold text-slate-900">${cat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables Grid: Recent Sales & Low Stock Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Recent POS Sales & Invoices</h3>
              <p className="text-xs text-slate-400">Latest completed customer checkout transactions</p>
            </div>
            <button
              onClick={() => setActiveTab('sales')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              View All Sales →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {salesTransactions.slice(0, 5).map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">{tx.invoiceNo}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{tx.contactName}</td>
                    <td className="py-3 px-4 text-slate-500">{tx.transactionDate}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wide ${
                          tx.paymentStatus === 'paid'
                            ? 'bg-emerald-100 text-emerald-700'
                            : tx.paymentStatus === 'partial'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {tx.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                      {settings.currencySymbol}{tx.finalTotal.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedInvoice(tx)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Invoice Receipt"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts Box */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-slate-900 text-sm">Low Stock Items</h3>
            </div>
            <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
              {lowStockProducts.length} Alert
            </span>
          </div>

          <div className="p-4 divide-y divide-slate-100 flex-1 overflow-y-auto max-h-72">
            {lowStockProducts.length === 0 ? (
              <div className="text-center py-6 text-slate-400">
                <Package className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                <p className="text-xs font-semibold">Inventory levels healthy</p>
                <p className="text-[11px] text-slate-400">No items below alert threshold.</p>
              </div>
            ) : (
              lowStockProducts.map(p => (
                <div key={p.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div>
                    <h5 className="font-semibold text-xs text-slate-800">{p.name}</h5>
                    <p className="text-[10px] text-slate-400 font-mono">
                      SKU: {p.sku} • Alert at {p.alertQuantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                      {p.currentStock} {p.unit} left
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-100">
            <button
              onClick={() => setActiveTab('products')}
              className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              Manage & Restock Inventory
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Modal if triggered */}
      {selectedInvoice && (
        <InvoiceModal
          isOpen={Boolean(selectedInvoice)}
          onClose={() => setSelectedInvoice(null)}
          transaction={selectedInvoice}
        />
      )}
    </div>
  );
};
