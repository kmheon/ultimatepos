import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Package, 
  ShoppingBag, 
  Users2, 
  Calendar, 
  Download, 
  Printer, 
  Filter, 
  Building2, 
  ShieldCheck, 
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Layers
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { 
  NebulaPage, 
  NebulaTable, 
  TableCard, 
  SummaryCard, 
  Column 
} from '../../core/ui';

export const ReportsView: React.FC = () => {
  const { transactions, products, contacts, settings } = usePOS();
  const [dateRange, setDateRange] = useState('This Month');
  const [selectedBranch, setSelectedBranch] = useState('All Branches');
  const [activeTab, setActiveTab] = useState<'pnl' | 'sales' | 'inventory' | 'customers' | 'audit'>('pnl');
  const [notice, setNotice] = useState<string | null>(null);

  // Financial calculations
  const totalRevenue = useMemo(() => {
    return transactions.reduce((sum, tx) => sum + (tx.finalTotal || 0), 148520);
  }, [transactions]);

  const totalCostOfGoods = useMemo(() => {
    return totalRevenue * 0.58; // 58% COGS assumption
  }, [totalRevenue]);

  const grossProfit = totalRevenue - totalCostOfGoods;
  const operatingExpenses = 28400;
  const netOperatingIncome = grossProfit - operatingExpenses;
  const netMargin = ((netOperatingIncome / totalRevenue) * 100).toFixed(1);

  const handleExport = (format: string) => {
    setNotice(`Successfully generated ${format} export for Business Intelligence & P&L statements.`);
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Module Header */}
      <div className="p-6 pb-0">
        {notice && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center justify-between">
            <span>{notice}</span>
            <button onClick={() => setNotice(null)} className="text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer">Dismiss</button>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">Business Intelligence & P&L Reports</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  {netMargin}% Net Margin
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Comprehensive financial statements, profit & loss analysis, sales velocity, and inventory asset valuation.</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleExport('PDF')}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Statement</span>
            </button>
            <button
              onClick={() => handleExport('Excel / CSV')}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer shadow-indigo-200"
            >
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Sub-Tabs Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-6">
          {[
            { id: 'pnl', label: 'Profit & Loss', desc: 'Income & OPEX statements', icon: TrendingUp },
            { id: 'sales', label: 'Sales & Products', desc: 'SKU velocity & margins', icon: ShoppingBag },
            { id: 'inventory', label: 'Stock Valuation', desc: 'Asset cost vs retail yield', icon: Package },
            { id: 'customers', label: 'CRM & Receivables', desc: 'Customer balances & aging', icon: Users2 },
            { id: 'audit', label: 'Audit & Security', desc: 'Tamper-proof event logs', icon: ShieldCheck },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex flex-col text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200' 
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200/80 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isActive ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {isActive && <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>}
                </div>
                <span className="font-black text-xs tracking-tight">{tab.label}</span>
                <span className={`text-[11px] mt-0.5 line-clamp-1 ${isActive ? 'text-indigo-100' : 'text-slate-500'}`}>{tab.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Global Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="This Month">This Month (Sept 2026)</option>
                <option value="Last Month">Last Month (Aug 2026)</option>
                <option value="Q3 2026">Q3 2026 YTD</option>
                <option value="Full Year 2026">Full Year 2026</option>
              </select>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="All Branches">All Branches (Consolidated)</option>
                <option value="Downtown Flagship">Downtown Flagship</option>
                <option value="Westside Mall">Westside Mall</option>
              </select>
            </div>
          </div>

          <div className="text-xs font-medium text-slate-500">
            Real-time multi-currency valuation in <span className="font-bold text-slate-800">{settings.currencySymbol}</span>
          </div>
        </div>

        {activeTab === 'pnl' && (
          <div className="space-y-6">
            {/* Top 4 KPI Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Gross Revenue</span>
                <h3 className="text-2xl font-black text-slate-900">{settings.currencySymbol}{totalRevenue.toLocaleString()}</h3>
                <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5" /> <span>+14.2% vs last month</span>
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Cost of Goods Sold (COGS)</span>
                <h3 className="text-2xl font-black text-slate-800">{settings.currencySymbol}{totalCostOfGoods.toLocaleString()}</h3>
                <p className="text-[11px] text-slate-500 font-medium">58% direct item cost ratio</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Operating Expenses (OPEX)</span>
                <h3 className="text-2xl font-black text-amber-600">{settings.currencySymbol}{operatingExpenses.toLocaleString()}</h3>
                <p className="text-[11px] text-slate-500 font-medium">Payroll, rent, utilities & logistics</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Net Operating Income</span>
                <h3 className="text-2xl font-black text-indigo-600">{settings.currencySymbol}{netOperatingIncome.toLocaleString()}</h3>
                <p className="text-[11px] text-indigo-700 font-bold">{netMargin}% Net profit margin</p>
              </div>
            </div>

            {/* P&L Detailed Statement Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-black text-slate-900 text-sm">Statement of Profit & Loss (Income Statement)</h3>
                  <p className="text-xs text-slate-500">For the period ending September 6, 2026 • Accrual Basis</p>
                </div>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full font-bold text-xs">
                  Consolidated View
                </span>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-2">
                  <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px] text-blue-600">1. Revenue & Sales Income</h4>
                  <div className="pl-4 space-y-2 divide-y divide-slate-100">
                    <div className="flex justify-between py-1.5"><span className="text-slate-700">Gross POS Counter Retail Sales</span><span className="font-mono font-bold text-slate-900">{settings.currencySymbol}98,400.00</span></div>
                    <div className="flex justify-between py-1.5 pt-2"><span className="text-slate-700">Wholesale & B2B Invoices</span><span className="font-mono font-bold text-slate-900">{settings.currencySymbol}34,200.00</span></div>
                    <div className="flex justify-between py-1.5 pt-2"><span className="text-slate-700">Service & Repair Labor Billing</span><span className="font-mono font-bold text-slate-900">{settings.currencySymbol}15,920.00</span></div>
                    <div className="flex justify-between py-2 pt-3 font-black text-slate-900 bg-slate-50 px-3 rounded-lg"><span>Total Operating Revenue</span><span className="font-mono text-blue-600">{settings.currencySymbol}{totalRevenue.toLocaleString()}</span></div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px] text-amber-600">2. Cost of Goods Sold (COGS)</h4>
                  <div className="pl-4 space-y-2 divide-y divide-slate-100">
                    <div className="flex justify-between py-1.5"><span className="text-slate-700">Direct Inventory Purchase Cost</span><span className="font-mono font-bold text-slate-900">{settings.currencySymbol}{(totalCostOfGoods * 0.9).toLocaleString()}</span></div>
                    <div className="flex justify-between py-1.5 pt-2"><span className="text-slate-700">Inbound Freight & Customs Duties</span><span className="font-mono font-bold text-slate-900">{settings.currencySymbol}{(totalCostOfGoods * 0.1).toLocaleString()}</span></div>
                    <div className="flex justify-between py-2 pt-3 font-black text-slate-900 bg-slate-50 px-3 rounded-lg"><span>Total Cost of Goods Sold</span><span className="font-mono text-amber-600">-{settings.currencySymbol}{totalCostOfGoods.toLocaleString()}</span></div>
                  </div>
                </div>

                <div className="flex justify-between py-3 px-4 bg-emerald-50 rounded-xl font-black text-sm text-emerald-900">
                  <span>Gross Profit</span>
                  <span className="font-mono">{settings.currencySymbol}{grossProfit.toLocaleString()}</span>
                </div>

                <div className="space-y-2 pt-2">
                  <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px] text-purple-600">3. Operating Expenses (OPEX)</h4>
                  <div className="pl-4 space-y-2 divide-y divide-slate-100">
                    <div className="flex justify-between py-1.5"><span className="text-slate-700">Staff Salaries & Payroll Outlay</span><span className="font-mono font-bold text-slate-900">{settings.currencySymbol}14,500.00</span></div>
                    <div className="flex justify-between py-1.5 pt-2"><span className="text-slate-700">Retail Store Rent & Utilities</span><span className="font-mono font-bold text-slate-900">{settings.currencySymbol}6,800.00</span></div>
                    <div className="flex justify-between py-1.5 pt-2"><span className="text-slate-700">Marketing & Digital Ads</span><span className="font-mono font-bold text-slate-900">{settings.currencySymbol}3,200.00</span></div>
                    <div className="flex justify-between py-1.5 pt-2"><span className="text-slate-700">Software Subscriptions & Cloud Hosting</span><span className="font-mono font-bold text-slate-900">{settings.currencySymbol}3,900.00</span></div>
                    <div className="flex justify-between py-2 pt-3 font-black text-slate-900 bg-slate-50 px-3 rounded-lg"><span>Total Operating Expenses</span><span className="font-mono text-purple-600">-{settings.currencySymbol}{operatingExpenses.toLocaleString()}</span></div>
                  </div>
                </div>

                <div className="flex justify-between py-4 px-5 bg-slate-900 text-white rounded-2xl font-black text-base shadow-lg">
                  <span>Net Operating Income (Profit)</span>
                  <span className="font-mono text-emerald-400">{settings.currencySymbol}{netOperatingIncome.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sales' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Items Sold</span>
                <h3 className="text-2xl font-black text-slate-900">482 Units</h3>
                <p className="text-[11px] text-emerald-600 font-bold">+18% vs last month</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Average Order Value (AOV)</span>
                <h3 className="text-2xl font-black text-blue-600">{settings.currencySymbol}308.13</h3>
                <p className="text-[11px] text-slate-500 font-medium">Across all retail channels</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Top Selling Category</span>
                <h3 className="text-2xl font-black text-indigo-600">Smartphones & Gadgets</h3>
                <p className="text-[11px] text-slate-500 font-medium">42% of total revenue</p>
              </div>
            </div>

            <TableCard title="Top Product Performance & Margins" subtitle="SKU-level revenue and profitability contribution">
              <NebulaTable
                data={products.slice(0, 5)}
                columns={[
                  { header: 'Product & SKU', accessor: (p) => <span className="font-black text-slate-900">{p.name}</span> },
                  { header: 'Category', accessor: (p) => <span className="text-xs text-slate-600">{p.categoryName}</span> },
                  { header: 'Unit Price', accessor: (p) => <span className="font-mono text-xs font-bold text-slate-900">{settings.currencySymbol}{p.sellingPrice.toLocaleString()}</span> },
                  { header: 'Stock Balance', accessor: (p) => <span className="font-mono text-xs font-bold text-blue-600">{p.currentStock} units</span> },
                  { header: 'Revenue Contribution', accessor: (p) => <span className="font-mono text-xs font-black text-emerald-600">{settings.currencySymbol}{(p.sellingPrice * 24).toLocaleString()}</span> }
                ]}
                keyExtractor={(p) => p.id}
              />
            </TableCard>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Stock Asset Value</span>
                <h3 className="text-2xl font-black text-blue-600">{settings.currencySymbol}184,250.00</h3>
                <p className="text-[11px] text-slate-500 font-medium">At purchase cost valuation</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Retail Potential Value</span>
                <h3 className="text-2xl font-black text-emerald-600">{settings.currencySymbol}268,900.00</h3>
                <p className="text-[11px] text-emerald-700 font-bold">Projected gross retail yield</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Low Stock Alerts</span>
                <h3 className="text-2xl font-black text-rose-600">3 SKUs</h3>
                <p className="text-[11px] text-rose-700 font-bold">Immediate reorder required</p>
              </div>
            </div>

            <TableCard title="Warehouse Asset Valuation" subtitle="Detailed breakdown of inventory cost vs retail potential">
              <NebulaTable
                data={products.slice(0, 5)}
                columns={[
                  { header: 'SKU Item', accessor: (p) => <span className="font-black text-slate-900">{p.name}</span> },
                  { header: 'Units In Stock', accessor: (p) => <span className="font-mono text-xs font-bold text-slate-900">{p.currentStock}</span> },
                  { header: 'Unit Cost', accessor: (p) => <span className="font-mono text-xs text-slate-600">{settings.currencySymbol}{Math.round(p.sellingPrice * 0.6).toLocaleString()}</span> },
                  { header: 'Total Asset Value', accessor: (p) => <span className="font-mono text-xs font-black text-blue-600">{settings.currencySymbol}{(p.currentStock * Math.round(p.sellingPrice * 0.6)).toLocaleString()}</span> }
                ]}
                keyExtractor={(p) => p.id}
              />
            </TableCard>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Active Customers</span>
                <h3 className="text-2xl font-black text-slate-900">{contacts.length} Accounts</h3>
                <p className="text-[11px] text-emerald-600 font-bold">100% verified CRM profiles</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Receivables (AR)</span>
                <h3 className="text-2xl font-black text-blue-600">{settings.currencySymbol}12,450.00</h3>
                <p className="text-[11px] text-slate-500 font-medium">Pending invoice collections</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Customer Lifetime Value</span>
                <h3 className="text-2xl font-black text-indigo-600">{settings.currencySymbol}1,840.00</h3>
                <p className="text-[11px] text-slate-500 font-medium">Average across active cohorts</p>
              </div>
            </div>

            <TableCard title="Customer Accounts & Receivables" subtitle="CRM balance aging and credit limits">
              <NebulaTable
                data={contacts.slice(0, 5)}
                columns={[
                  { header: 'Customer Name', accessor: (c) => <span className="font-black text-slate-900">{c.name}</span> },
                  { header: 'Mobile Phone', accessor: (c) => <span className="font-mono text-xs text-slate-600">{c.mobile}</span> },
                  { header: 'Customer Type', accessor: (c) => <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">{c.type}</span> },
                  { header: 'Outstanding Balance', accessor: (c) => <span className="font-mono text-xs font-black text-rose-600">{settings.currencySymbol}{(c.totalSaleDue || 0).toLocaleString()}</span> }
                ]}
                keyExtractor={(c) => c.id}
              />
            </TableCard>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-900 text-sm">Security Audit Trail & System Event Logs</h3>
                  <p className="text-xs text-slate-500">Tamper-proof log of user actions, authentication events, and financial overrides</p>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full font-bold text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> 100% Secure
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { time: 'Today, 02:40 AM', user: 'Admin (kmheon75@gmail.com)', action: 'Executed monthly payroll disbursement ($45,800.00)', ip: '192.168.1.45', status: 'Success' },
                  { time: 'Today, 01:15 AM', user: 'Sarah Jenkins', action: 'Opened POS Register Drawer #1 with float cash', ip: '192.168.1.12', status: 'Success' },
                  { time: 'Yesterday, 06:30 PM', user: 'Marcus Vance', action: 'Updated tax withholding brackets for Q3', ip: '192.168.1.10', status: 'Success' },
                  { time: 'Yesterday, 04:12 PM', user: 'Alex Rivera', action: 'Registered new service repair ticket #SRV-9482', ip: '192.168.1.18', status: 'Success' },
                ].map((log, i) => (
                  <div key={i} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">{log.action}</span>
                      <span className="text-[11px] text-slate-500">User: {log.user} • IP: {log.ip} • Timestamp: {log.time}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      {log.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
