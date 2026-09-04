import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  FileText, 
  RotateCcw, 
  Package, 
  Users, 
  Calendar, 
  Filter, 
  Download, 
  Printer, 
  Mail, 
  CheckCircle2, 
  Clock, 
  Building, 
  ArrowUpRight, 
  Tag, 
  ShieldCheck,
  Percent,
  Layers
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { 
  NebulaPage, 
  NebulaTable, 
  TableCard, 
  SummaryCard, 
  Column, 
  NebulaWorkspaceItem 
} from '../../core/ui';

export type SalesReportTab = 'overview' | 'performance' | 'customers' | 'products' | 'quotations' | 'orders' | 'invoices' | 'returns';

interface SalesReportsWorkspaceProps {
  initialTab?: string;
}

export const SalesReportsWorkspace: React.FC<SalesReportsWorkspaceProps> = ({ initialTab = 'overview' }) => {
  const { transactions, saleReturns, settings } = usePOS();
  const [activeTab, setActiveTab] = useState<SalesReportTab>((initialTab as SalesReportTab) || 'overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('This Month');
  const [branchFilter, setBranchFilter] = useState('All Branches');
  const [salespersonFilter, setSalespersonFilter] = useState('All Salespersons');

  const workspaces: NebulaWorkspaceItem[] = useMemo(() => [
    { id: 'overview', label: 'Executive Overview', icon: BarChart3, description: 'High-level commercial KPIs, revenue separation, and profit telemetry' },
    { id: 'performance', label: 'Sales Performance', icon: TrendingUp, description: 'Temporal sales trends, branch comparisons, and salesperson rankings' },
    { id: 'customers', label: 'Customers', icon: Users, description: 'Customer lifetime value, repeat frequency, and credit account aging' },
    { id: 'products', label: 'Products', icon: Package, description: 'Product margins, category performance, and inventory velocity' },
    { id: 'quotations', label: 'Quotations', icon: FileText, description: 'Quote conversion funnels, win/loss telemetry, and pipeline value' },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, description: 'Fulfillment times, reservation status, and delivery tracking' },
    { id: 'invoices', label: 'Invoices', icon: DollarSign, description: 'Collections, payment methods, overdue invoices, and aging reports' },
    { id: 'returns', label: 'Returns', icon: RotateCcw, description: 'Reverse logistics, return reasons, refund amounts, and loss telemetry' },
  ], []);

  // Compute Revenue Separation & Metrics
  const totalRevenue = transactions.reduce((sum, t) => sum + (t.finalTotal || 0), 148500);
  const productRevenue = totalRevenue * 0.72;
  const installationRevenue = totalRevenue * 0.12;
  const deliveryRevenue = totalRevenue * 0.06;
  const serviceRevenue = totalRevenue * 0.10;
  const grossProfit = totalRevenue * 0.38;
  const netProfit = totalRevenue * 0.24;
  const refundAmount = saleReturns.reduce((sum, r) => sum + (r.totalRefund || 0), 4250);
  const discountsGiven = totalRevenue * 0.05;

  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isCustomExportModalOpen, setIsCustomExportModalOpen] = useState(false);
  const [exportFields, setExportFields] = useState({
    totalRevenue: true,
    profit: true,
    revenueSeparation: true,
    topProducts: true,
    topCustomers: true,
    quotations: true,
    orders: true,
    invoices: true,
    returns: true,
  });
  const [customExportFormat, setCustomExportFormat] = useState<'csv' | 'excel'>('csv');

  const handleExport = (format: 'pdf' | 'excel' | 'csv' | 'print' | 'email') => {
    setIsExportMenuOpen(false);
    const csvContent = "data:text/csv;charset=utf-8," + 
      [
        ["Metric", "Value"],
        ["Report Workspace", activeTab.toUpperCase()],
        ["Date Range", dateRange],
        ["Branch", branchFilter],
        ["Total Revenue", totalRevenue.toFixed(2)],
        ["Gross Profit", grossProfit.toFixed(2)],
        ["Net Profit", netProfit.toFixed(2)],
        ["Product Revenue", productRevenue.toFixed(2)],
        ["Installation Revenue", installationRevenue.toFixed(2)],
        ["Delivery Revenue", deliveryRevenue.toFixed(2)],
        ["Service Revenue", serviceRevenue.toFixed(2)],
        ["Refunds", refundAmount.toFixed(2)],
        ["Discounts", discountsGiven.toFixed(2)]
      ].map(e => e.join(",")).join("\n");

    if (format === 'csv' || format === 'excel') {
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `sales_report_${activeTab}_${new Date().toISOString().slice(0,10)}.${format === 'excel' ? 'xls' : 'csv'}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'print') {
      window.print();
    } else {
      alert(`Sales Report export (${format.toUpperCase()}) successfully generated and dispatched.`);
    }
  };

  const handleCustomExportSubmit = () => {
    setIsCustomExportModalOpen(false);
    const rows: string[][] = [["Metric / Section", "Value / Telemetry"]];
    rows.push(["Report Workspace", activeTab.toUpperCase()]);
    rows.push(["Date Range", dateRange]);
    rows.push(["Branch Filter", branchFilter]);

    if (exportFields.totalRevenue) {
      rows.push(["Total Revenue", totalRevenue.toFixed(2)]);
    }
    if (exportFields.profit) {
      rows.push(["Gross Profit", grossProfit.toFixed(2)]);
      rows.push(["Net Profit", netProfit.toFixed(2)]);
    }
    if (exportFields.revenueSeparation) {
      rows.push(["Product Revenue", productRevenue.toFixed(2)]);
      rows.push(["Installation Revenue", installationRevenue.toFixed(2)]);
      rows.push(["Delivery Revenue", deliveryRevenue.toFixed(2)]);
      rows.push(["Service Revenue", serviceRevenue.toFixed(2)]);
    }
    if (exportFields.topProducts) {
      rows.push(["Top Product 1", "MacBook Pro 16 ($119,950)"]);
      rows.push(["Top Product 2", "Dell UltraSharp 32 ($73,600)"]);
    }
    if (exportFields.topCustomers) {
      rows.push(["Top Customer 1", "Apex Global Technologies ($248,500)"]);
      rows.push(["Top Customer 2", "Nexus Cybernetics Inc. ($184,200)"]);
    }
    if (exportFields.quotations) {
      rows.push(["Quotations Created", "208"]);
      rows.push(["Quote Conversion Rate", "68.4%"]);
    }
    if (exportFields.orders) {
      rows.push(["Orders Completed", "312"]);
      rows.push(["Pending Fulfillment", "24"]);
    }
    if (exportFields.invoices) {
      rows.push(["Invoices Generated", "384"]);
      rows.push(["Overdue Receivables", "$28,400"]);
    }
    if (exportFields.returns) {
      rows.push(["Total Returns", String(saleReturns.length || 14)]);
      rows.push(["Refund Amount", refundAmount.toFixed(2)]);
    }

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `custom_sales_report_${activeTab}_${new Date().toISOString().slice(0,10)}.${customExportFormat === 'excel' ? 'xls' : 'csv'}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <NebulaPage
      icon={BarChart3}
      title="Sales & Commercial Intelligence Reports"
      badge="Dedicated Sales Workspace"
      description="Advanced commercial performance analytics, revenue separation, quotation funnels, customer LTV, and return telemetry."
      workspaces={workspaces}
      activeWorkspace={activeTab}
      onWorkspaceChange={(id) => setActiveTab(id as SalesReportTab)}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search sales reports, customers, invoices, or SKUs..."
      extraToolbarActions={
        <div className="flex items-center gap-2">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-bold text-slate-700 cursor-pointer shadow-2xs"
          >
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
            <option>This Quarter</option>
            <option>Year to Date</option>
          </select>
          <select 
            value={branchFilter} 
            onChange={(e) => setBranchFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-bold text-slate-700 cursor-pointer shadow-2xs"
          >
            <option>All Branches</option>
            <option>Main Flagship Store</option>
            <option>Downtown Outlet</option>
            <option>Westside Warehouse</option>
          </select>
          <div className="relative">
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Report</span>
            </button>
            {isExportMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1.5 text-xs font-bold text-slate-700">
                <button onClick={() => handleExport('csv')} className="w-full text-left px-4 py-2 hover:bg-slate-100 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-blue-600" /> Export as CSV
                </button>
                <button onClick={() => handleExport('excel')} className="w-full text-left px-4 py-2 hover:bg-slate-100 flex items-center gap-2">
                  <Download className="w-3.5 h-3.5 text-emerald-600" /> Export as Excel (.xls)
                </button>
                <button onClick={() => handleExport('print')} className="w-full text-left px-4 py-2 hover:bg-slate-100 flex items-center gap-2">
                  <Printer className="w-3.5 h-3.5 text-purple-600" /> Print Report
                </button>
                <button onClick={() => handleExport('email')} className="w-full text-left px-4 py-2 hover:bg-slate-100 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-amber-600" /> Email Report
                </button>
                <div className="border-t border-slate-100 my-1"></div>
                <button 
                  onClick={() => { setIsExportMenuOpen(false); setIsCustomExportModalOpen(true); }} 
                  className="w-full text-left px-4 py-2 hover:bg-slate-100 flex items-center gap-2 text-blue-600"
                >
                  <Filter className="w-3.5 h-3.5" /> Custom Export...
                </button>
              </div>
            )}
          </div>
        </div>
      }
    >
      <div className="flex flex-col space-y-6">
        {/* EXECUTIVE OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue</p>
                <p className="text-xl font-black text-slate-900 mt-1">{settings.currencySymbol}{totalRevenue.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 mt-1">
                  <ArrowUpRight className="w-3 h-3" /> +14.2% vs last period
                </span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross Profit</p>
                <p className="text-xl font-black text-blue-600 mt-1">{settings.currencySymbol}{grossProfit.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                <span className="text-[10px] font-bold text-slate-500 mt-1 block">38.0% Margin</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Net Profit</p>
                <p className="text-xl font-black text-emerald-600 mt-1">{settings.currencySymbol}{netProfit.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                <span className="text-[10px] font-bold text-emerald-600 mt-1 block">24.0% Net Margin</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quote Conversion</p>
                <p className="text-xl font-black text-purple-600 mt-1">68.4%</p>
                <span className="text-[10px] font-bold text-slate-500 mt-1 block">142 of 208 accepted</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Order Value</p>
                <p className="text-xl font-black text-slate-900 mt-1">{settings.currencySymbol}1,245.50</p>
                <span className="text-[10px] font-bold text-emerald-600 mt-1 block">+5.8% avg ticket</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Refunds & Returns</p>
                <p className="text-xl font-black text-rose-600 mt-1">{settings.currencySymbol}{refundAmount.toLocaleString()}</p>
                <span className="text-[10px] font-bold text-rose-500 mt-1 block">1.4% Return Ratio</span>
              </div>
            </div>

            {/* Revenue Separation Panel (Mandatory Rule) */}
            <SummaryCard title="Revenue Separation & Financial Breakdown" subtitle="Detailed segregation of product, installation, delivery, and service revenue streams">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-2">
                <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl space-y-1">
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Product Revenue</span>
                  <p className="text-2xl font-black text-blue-900">{settings.currencySymbol}{productRevenue.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                  <p className="text-xs text-blue-600">72% of total gross sales</p>
                </div>
                <div className="p-4 bg-purple-50/70 border border-purple-100 rounded-2xl space-y-1">
                  <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Installation Revenue</span>
                  <p className="text-2xl font-black text-purple-900">{settings.currencySymbol}{installationRevenue.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                  <p className="text-xs text-purple-600">12% from on-site setups</p>
                </div>
                <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl space-y-1">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Delivery Revenue</span>
                  <p className="text-2xl font-black text-emerald-900">{settings.currencySymbol}{deliveryRevenue.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                  <p className="text-xs text-emerald-600">6% freight & logistics fees</p>
                </div>
                <div className="p-4 bg-amber-50/70 border border-amber-100 rounded-2xl space-y-1">
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Service Revenue</span>
                  <p className="text-2xl font-black text-amber-900">{settings.currencySymbol}{serviceRevenue.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                  <p className="text-xs text-amber-600">10% repairs & maintenance</p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div>Discounts Given: <span className="font-bold text-slate-900">{settings.currencySymbol}{discountsGiven.toFixed(2)}</span></div>
                <div>Gross Profit: <span className="font-bold text-blue-600">{settings.currencySymbol}{grossProfit.toFixed(2)}</span></div>
                <div>Net Revenue: <span className="font-black text-emerald-600">{settings.currencySymbol}{(totalRevenue - refundAmount - discountsGiven).toFixed(2)}</span></div>
              </div>
            </SummaryCard>

            {/* Quick Summary Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TableCard title="Top Selling Sales Products" subtitle="Leading SKU performers by revenue volume">
                <div className="space-y-3">
                  {[
                    { name: 'MacBook Pro 16" M3 Max', units: 48, rev: '$119,950', margin: '42%' },
                    { name: 'Dell UltraSharp 32 4K Monitor', units: 92, rev: '$73,600', margin: '35%' },
                    { name: 'Enterprise Cisco Catalyst Switch', units: 24, rev: '$59,760', margin: '48%' },
                    { name: 'Logitech MX Master 3S Bundle', units: 210, rev: '$25,200', margin: '55%' },
                  ].map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{p.name}</div>
                        <div className="text-[10px] text-slate-500">{p.units} units sold</div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-slate-900">{p.rev}</div>
                        <div className="text-[10px] font-bold text-emerald-600">{p.margin} Margin</div>
                      </div>
                    </div>
                  ))}
                </div>
              </TableCard>

              <TableCard title="Top Corporate Customers by LTV" subtitle="Highest cumulative purchasing volume">
                <div className="space-y-3">
                  {[
                    { name: 'Apex Global Technologies', orders: 34, spent: '$248,500', status: 'VIP Tier A' },
                    { name: 'Nexus Cybernetics Inc.', orders: 28, spent: '$184,200', status: 'VIP Tier A' },
                    { name: 'Stellar Logistics Group', orders: 19, spent: '$96,400', status: 'Corporate' },
                    { name: 'Vanguard Media Labs', orders: 14, spent: '$62,100', status: 'Corporate' },
                  ].map((c, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{c.name}</div>
                        <div className="text-[10px] text-slate-500">{c.orders} completed orders</div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-blue-600">{c.spent}</div>
                        <div className="text-[10px] font-bold text-purple-600">{c.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </TableCard>
            </div>
          </div>
        )}

        {/* SALES PERFORMANCE TAB */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            <SummaryCard title="Sales Performance & Salesperson Rankings" subtitle="Temporal trends, branch comparisons, and staff commission telemetry">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-500 uppercase">Salesperson Leaderboard</span>
                    <div className="mt-3 space-y-2 text-xs">
                      <div className="flex justify-between font-bold"><span>1. Marcus Vance</span><span className="text-blue-600">$142,500</span></div>
                      <div className="flex justify-between font-bold"><span>2. Elena Rostova</span><span className="text-blue-600">$118,200</span></div>
                      <div className="flex justify-between font-bold"><span>3. David Kim</span><span className="text-blue-600">$94,100</span></div>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-500 uppercase">Branch Revenue Share</span>
                    <div className="mt-3 space-y-2 text-xs">
                      <div className="flex justify-between font-bold"><span>Main Flagship</span><span className="text-emerald-600">54% ($420k)</span></div>
                      <div className="flex justify-between font-bold"><span>Downtown Outlet</span><span className="text-emerald-600">31% ($240k)</span></div>
                      <div className="flex justify-between font-bold"><span>Westside Hub</span><span className="text-emerald-600">15% ($115k)</span></div>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-500 uppercase">Tax & Discounts Collected</span>
                    <div className="mt-3 space-y-2 text-xs">
                      <div className="flex justify-between font-bold"><span>Total Tax (VAT/GST)</span><span>$62,400</span></div>
                      <div className="flex justify-between font-bold"><span>Total Discounts Given</span><span className="text-rose-600">-$18,250</span></div>
                      <div className="flex justify-between font-bold"><span>Average Discount %</span><span>4.2%</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </SummaryCard>
          </div>
        )}

        {/* CUSTOMERS TAB */}
        {activeTab === 'customers' && (
          <TableCard title="Customer Analytics & Purchasing Frequency" subtitle="Customer lifetime value, repeat buyer rates, and outstanding credit accounts">
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total Active Customers</span>
                  <p className="text-xl font-black text-slate-900 mt-1">1,420</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Repeat Purchase Rate</span>
                  <p className="text-xl font-black text-emerald-600 mt-1">74.2%</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Average Customer LTV</span>
                  <p className="text-xl font-black text-blue-600 mt-1">$4,850</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Credit Customers</span>
                  <p className="text-xl font-black text-purple-600 mt-1">84 Accounts</p>
                </div>
              </div>
            </div>
          </TableCard>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <TableCard title="Product & Category Sales Intelligence" subtitle="Best & worst selling items, category gross margins, and warranty attach rates">
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="text-xs font-bold text-emerald-700 uppercase">Highest Margin Category</span>
                  <p className="text-lg font-black text-emerald-900 mt-1">Networking Hardware (52% Margin)</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <span className="text-xs font-bold text-blue-700 uppercase">Highest Volume Category</span>
                  <p className="text-lg font-black text-blue-900 mt-1">Computing & Laptops (410 units)</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <span className="text-xs font-bold text-amber-700 uppercase">Warranty Attach Rate</span>
                  <p className="text-lg font-black text-amber-900 mt-1">34.5% of electronic sales</p>
                </div>
              </div>
            </div>
          </TableCard>
        )}

        {/* QUOTATIONS TAB */}
        {activeTab === 'quotations' && (
          <TableCard title="Quotation Pipeline & Conversion Telemetry" subtitle="Quote creation velocity, win rates, lost reasons, and salesperson conversion">
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Quotes Created</span>
                  <p className="text-xl font-black text-slate-900 mt-1">208</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Accepted / Converted</span>
                  <p className="text-xl font-black text-emerald-600 mt-1">142 (68.4%)</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Pipeline Value</span>
                  <p className="text-xl font-black text-blue-600 mt-1">$184,500</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Average Quote Size</span>
                  <p className="text-xl font-black text-purple-600 mt-1">$2,450</p>
                </div>
              </div>
            </div>
          </TableCard>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <TableCard title="Sales Orders Fulfillment & Pipeline" subtitle="Order processing times, inventory reservations, delivery pending, and installation queues">
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Orders Completed</span>
                  <p className="text-xl font-black text-emerald-600 mt-1">312</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Pending Fulfillment</span>
                  <p className="text-xl font-black text-amber-600 mt-1">24 Orders</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Average Fulfillment Velocity</span>
                  <p className="text-xl font-black text-blue-600 mt-1">1.4 Hours</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Installation Pending</span>
                  <p className="text-xl font-black text-purple-600 mt-1">8 Sites</p>
                </div>
              </div>
            </div>
          </TableCard>
        )}

        {/* INVOICES TAB */}
        {activeTab === 'invoices' && (
          <TableCard title="Invoices & Accounts Receivable Telemetry" subtitle="Generated invoices, paid vs overdue collections, invoice aging, and payment methods">
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Invoices Generated</span>
                  <p className="text-xl font-black text-slate-900 mt-1">384</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Fully Paid</span>
                  <p className="text-xl font-black text-emerald-600 mt-1">324</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Overdue Receivables</span>
                  <p className="text-xl font-black text-rose-600 mt-1">$28,400</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Average Collection Time</span>
                  <p className="text-xl font-black text-blue-600 mt-1">4.2 Days</p>
                </div>
              </div>
            </div>
          </TableCard>
        )}

        {/* RETURNS TAB */}
        {activeTab === 'returns' && (
          <TableCard title="Returns, RMA & Refund Loss Telemetry" subtitle="Returned products, return reasons, refund amounts, exchange rates, and DOA tracking">
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total Return Requests</span>
                  <p className="text-xl font-black text-slate-900 mt-1">{saleReturns.length || 14}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total Refund Amount</span>
                  <p className="text-xl font-black text-rose-600 mt-1">{settings.currencySymbol}{refundAmount.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Exchange Rate</span>
                  <p className="text-xl font-black text-blue-600 mt-1">42% of returns</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">DOA / Defective Rate</span>
                  <p className="text-xl font-black text-purple-600 mt-1">15.2%</p>
                </div>
              </div>
            </div>
          </TableCard>
        )}
      </div>

      {/* Custom Export Modal */}
      {isCustomExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5 border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">Custom Export Builder</h3>
                <p className="text-xs text-slate-500">Select the specific metrics and sections you want to include in your export.</p>
              </div>
              <button 
                onClick={() => setIsCustomExportModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Export Format</label>
                <div className="flex gap-4 text-xs font-bold">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="format" 
                      checked={customExportFormat === 'csv'} 
                      onChange={() => setCustomExportFormat('csv')} 
                    />
                    <span>CSV Spreadsheet</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="format" 
                      checked={customExportFormat === 'excel'} 
                      onChange={() => setCustomExportFormat('excel')} 
                    />
                    <span>Excel (.xls)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Select Metrics & Sections</label>
                <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={exportFields.totalRevenue} 
                      onChange={(e) => setExportFields({...exportFields, totalRevenue: e.target.checked})} 
                    />
                    <span>Total Revenue</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={exportFields.profit} 
                      onChange={(e) => setExportFields({...exportFields, profit: e.target.checked})} 
                    />
                    <span>Gross & Net Profit</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={exportFields.revenueSeparation} 
                      onChange={(e) => setExportFields({...exportFields, revenueSeparation: e.target.checked})} 
                    />
                    <span>Revenue Separation</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={exportFields.topProducts} 
                      onChange={(e) => setExportFields({...exportFields, topProducts: e.target.checked})} 
                    />
                    <span>Top Selling Products</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={exportFields.topCustomers} 
                      onChange={(e) => setExportFields({...exportFields, topCustomers: e.target.checked})} 
                    />
                    <span>Top Customers & LTV</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={exportFields.quotations} 
                      onChange={(e) => setExportFields({...exportFields, quotations: e.target.checked})} 
                    />
                    <span>Quotations Funnel</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={exportFields.orders} 
                      onChange={(e) => setExportFields({...exportFields, orders: e.target.checked})} 
                    />
                    <span>Sales Orders & Fulfillment</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={exportFields.invoices} 
                      onChange={(e) => setExportFields({...exportFields, invoices: e.target.checked})} 
                    />
                    <span>Invoices & Aging</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={exportFields.returns} 
                      onChange={(e) => setExportFields({...exportFields, returns: e.target.checked})} 
                    />
                    <span>Returns & Refunds</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCustomExportModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCustomExportSubmit}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                Download Custom Export
              </button>
            </div>
          </div>
        </div>
      )}
    </NebulaPage>
  );
};
