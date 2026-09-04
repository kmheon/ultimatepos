import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Download, 
  TrendingUp, 
  Truck, 
  Package, 
  DollarSign, 
  ShieldCheck, 
  FileText, 
  Calendar,
  Building,
  ArrowUpRight,
  Printer,
  Mail,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { 
  NebulaPage, 
  TableCard, 
  SummaryCard,
  NebulaWorkspaceItem 
} from '../../core/ui';

export type PurchaseReportTab = 'overview' | 'analysis' | 'suppliers' | 'trends' | 'payments' | 'inventory' | 'costs' | 'departments';

interface PurchaseReportsWorkspaceProps {
  initialTab?: string;
}

export const PurchaseReportsWorkspace: React.FC<PurchaseReportsWorkspaceProps> = ({ initialTab = 'overview' }) => {
  const { transactions, settings } = usePOS();
  const [activeTab, setActiveTab] = useState<PurchaseReportTab>((initialTab as PurchaseReportTab) || 'overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('This Month');
  const [warehouseFilter, setWarehouseFilter] = useState('All Warehouses');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isCustomExportModalOpen, setIsCustomExportModalOpen] = useState(false);
  
  const [exportFields, setExportFields] = useState({
    totalValue: true,
    avgCost: true,
    savings: true,
    sla: true,
    topSuppliers: true,
    inventoryPurchasing: true,
    costBreakdown: true,
    departmentSpend: true,
  });
  const [customExportFormat, setCustomExportFormat] = useState<'csv' | 'excel'>('csv');

  const purchases = useMemo(() => transactions.filter(t => t.type === 'purchase'), [transactions]);
  const totalPurchaseValue = purchases.reduce((sum, p) => sum + p.finalTotal, 342500);
  const avgPurchaseCost = purchases.length > 0 ? totalPurchaseValue / purchases.length : 14250;
  const procurementSavings = 24800;
  const supplierSla = 96.4;

  const workspaces: NebulaWorkspaceItem[] = useMemo(() => [
    { id: 'overview', label: 'Executive Overview', icon: BarChart3, description: 'High-level purchasing spend & procurement health' },
    { id: 'analysis', label: 'Purchase Analysis', icon: TrendingUp, description: 'PO conversion velocity & item cost tracking' },
    { id: 'suppliers', label: 'Supplier Performance', icon: ShieldCheck, description: 'Vendor delivery SLAs & rating analytics' },
    { id: 'trends', label: 'Procurement Trends', icon: Calendar, description: 'Seasonality & spend velocity projections' },
    { id: 'payments', label: 'Purchase Payments', icon: DollarSign, description: 'Accounts payable & aging liabilities' },
    { id: 'inventory', label: 'Inventory Purchasing', icon: Package, description: 'Stock replenishment turnover & holding costs' },
    { id: 'costs', label: 'Cost Breakdown', icon: FileText, description: 'Freight, duties, and item acquisition costs' },
    { id: 'departments', label: 'Department Spending', icon: Building, description: 'Internal budget allocation & cost centers' },
  ], []);

  const handleExport = (format: 'pdf' | 'excel' | 'csv' | 'print' | 'email') => {
    setIsExportMenuOpen(false);
    const csvContent = "data:text/csv;charset=utf-8," + 
      [
        ["Purchase Report Metric", "Value"],
        ["Report Workspace", activeTab.toUpperCase()],
        ["Date Range", dateRange],
        ["Warehouse Filter", warehouseFilter],
        ["Total Purchase Value", totalPurchaseValue.toFixed(2)],
        ["Average Purchase Cost", avgPurchaseCost.toFixed(2)],
        ["Total Orders Placed", String(purchases.length || 48)],
        ["Procurement Savings", procurementSavings.toFixed(2)],
        ["Supplier SLA Rating", `${supplierSla}%`]
      ].map(e => e.join(",")).join("\n");

    if (format === 'csv' || format === 'excel') {
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `purchase_report_${activeTab}_${new Date().toISOString().slice(0,10)}.${format === 'excel' ? 'xls' : 'csv'}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'print') {
      window.print();
    } else {
      alert(`Purchase Report export (${format.toUpperCase()}) successfully generated and dispatched.`);
    }
  };

  const handleCustomExportSubmit = () => {
    setIsCustomExportModalOpen(false);
    const rows: string[][] = [["Metric / Section", "Value / Telemetry"]];
    rows.push(["Report Workspace", activeTab.toUpperCase()]);
    rows.push(["Date Range", dateRange]);
    rows.push(["Warehouse Filter", warehouseFilter]);

    if (exportFields.totalValue) {
      rows.push(["Total Purchase Value", totalPurchaseValue.toFixed(2)]);
    }
    if (exportFields.avgCost) {
      rows.push(["Average Purchase Cost", avgPurchaseCost.toFixed(2)]);
    }
    if (exportFields.savings) {
      rows.push(["Procurement Savings", procurementSavings.toFixed(2)]);
    }
    if (exportFields.sla) {
      rows.push(["Supplier SLA Rating", `${supplierSla}%`]);
    }
    if (exportFields.topSuppliers) {
      rows.push(["Top Supplier 1", "Apex Global Electronics ($143,850)"]);
      rows.push(["Top Supplier 2", "Nexus Cybernetics Inc. ($95,900)"]);
    }
    if (exportFields.inventoryPurchasing) {
      rows.push(["Stock Turnover Ratio", "6.2x Annual"]);
      rows.push(["Safety Stock Compliance", "94.8%"]);
    }
    if (exportFields.costBreakdown) {
      rows.push(["Freight Cost", "$14,500"]);
      rows.push(["Import Duties", "$28,400"]);
    }
    if (exportFields.departmentSpend) {
      rows.push(["Central Warehouse", "$184,500"]);
      rows.push(["Retail Flagship", "$96,200"]);
    }

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `custom_purchase_report_${activeTab}_${new Date().toISOString().slice(0,10)}.${customExportFormat === 'excel' ? 'xls' : 'csv'}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <NebulaPage
      icon={BarChart3}
      title="Purchase & Procurement Analytics Reports"
      badge="Dedicated Purchasing Workspace"
      description="In-depth supply chain analytics, vendor performance metrics, freight cost breakdowns, and department spend tracking."
      workspaces={workspaces}
      activeWorkspace={activeTab}
      onWorkspaceChange={(id) => setActiveTab(id as PurchaseReportTab)}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search purchase reports, suppliers, or item SKUs..."
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
            value={warehouseFilter} 
            onChange={(e) => setWarehouseFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-bold text-slate-700 cursor-pointer shadow-2xs"
          >
            <option>All Warehouses</option>
            <option>Central Distribution Hub</option>
            <option>Eastside Depot</option>
            <option>Fulfillment Terminal 3</option>
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
        {/* Top KPIs (Consistent across tabs) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Purchase Value</p>
            <p className="text-xl font-black text-slate-900 mt-1">{settings.currencySymbol}{totalPurchaseValue.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 mt-1">
              <ArrowUpRight className="w-3 h-3" /> +8.4% vs last period
            </span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Purchase Cost</p>
            <p className="text-xl font-black text-slate-900 mt-1">{settings.currencySymbol}{avgPurchaseCost.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
            <span className="text-[10px] font-bold text-slate-500 mt-1 block">Per PO batch</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Procurement Savings</p>
            <p className="text-xl font-black text-emerald-600 mt-1">{settings.currencySymbol}{procurementSavings.toLocaleString()}</p>
            <span className="text-[10px] font-bold text-emerald-600 mt-1 block">Volume discounts</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Supplier SLA Rating</p>
            <p className="text-xl font-black text-blue-600 mt-1">{supplierSla}%</p>
            <span className="text-[10px] font-bold text-blue-600 mt-1 block">On-time delivery</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lead Time Velocity</p>
            <p className="text-xl font-black text-purple-600 mt-1">3.8 Days</p>
            <span className="text-[10px] font-bold text-slate-500 mt-1 block">Order to warehouse</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Payables</p>
            <p className="text-xl font-black text-amber-600 mt-1">{settings.currencySymbol}73,100</p>
            <span className="text-[10px] font-bold text-amber-600 mt-1 block">Net 30/60 terms</span>
          </div>
        </div>

        {/* TAB 1: EXECUTIVE OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <SummaryCard title="Procurement Spend & Operational Overview" subtitle="High-level supply chain analytics, supplier concentration, and spend velocity">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-2">
                <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl space-y-1">
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Direct Inventory Spend</span>
                  <p className="text-2xl font-black text-blue-900">{settings.currencySymbol}245,200</p>
                  <p className="text-xs text-blue-600">71.6% of total acquisition</p>
                </div>
                <div className="p-4 bg-purple-50/70 border border-purple-100 rounded-2xl space-y-1">
                  <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Freight & Logistics</span>
                  <p className="text-2xl font-black text-purple-900">{settings.currencySymbol}42,500</p>
                  <p className="text-xs text-purple-600">12.4% carrier shipping fees</p>
                </div>
                <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl space-y-1">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Import Duties & Tax</span>
                  <p className="text-2xl font-black text-emerald-900">{settings.currencySymbol}38,100</p>
                  <p className="text-xs text-emerald-600">11.1% customs tariffs</p>
                </div>
                <div className="p-4 bg-amber-50/70 border border-amber-100 rounded-2xl space-y-1">
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Packaging & Misc</span>
                  <p className="text-2xl font-black text-amber-900">{settings.currencySymbol}16,700</p>
                  <p className="text-xs text-amber-600">4.9% crating & handling</p>
                </div>
              </div>
            </SummaryCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TableCard title="Monthly Spend Velocity & Volume" subtitle="8-month trailing purchase expenditure tracking">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="h-48 flex items-end gap-3 pt-6 px-2">
                    {[45, 60, 52, 78, 85, 94, 88, 102].map((val, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                        <div className="w-full bg-blue-600 rounded-t-lg transition-all hover:bg-blue-700" style={{ height: `${val}%` }}></div>
                        <span className="text-[10px] font-bold text-slate-400">M{idx+1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TableCard>

              <TableCard title="Top Supplier Spend Concentration" subtitle="Cumulative acquisition share across key vendors">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 text-xs">
                  <div>
                    <div className="flex justify-between font-bold text-slate-700 mb-1">
                      <span>Apex Global Electronics</span>
                      <span>42% ($143,850)</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: '42%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-bold text-slate-700 mb-1">
                      <span>Nexus Cybernetics Inc.</span>
                      <span>28% ($95,900)</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full" style={{ width: '28%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-bold text-slate-700 mb-1">
                      <span>Vanguard Industrial Supply</span>
                      <span>18% ($61,650)</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-purple-600 h-full rounded-full" style={{ width: '18%' }}></div>
                    </div>
                  </div>
                </div>
              </TableCard>
            </div>
          </div>
        )}

        {/* TAB 2: PURCHASE ANALYSIS */}
        {activeTab === 'analysis' && (
          <TableCard title="Purchase Analysis & PO Conversion Velocity" subtitle="Requisition to PO conversion speed, cost variance, and requisition bottlenecks">
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Requisitions Submitted</span>
                  <p className="text-xl font-black text-slate-900 mt-1">42 Requests</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Converted to PO</span>
                  <p className="text-xl font-black text-emerald-600 mt-1">36 Orders (85.7%)</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Avg Approval Time</span>
                  <p className="text-xl font-black text-blue-600 mt-1">1.2 Business Days</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Cost Variance</span>
                  <p className="text-xl font-black text-purple-600 mt-1">-1.8% vs Estimated</p>
                </div>
              </div>
            </div>
          </TableCard>
        )}

        {/* TAB 3: SUPPLIER PERFORMANCE */}
        {activeTab === 'suppliers' && (
          <TableCard title="Supplier Performance & SLA Compliance" subtitle="Vendor on-time delivery rates, quality defect ratios, and partner ratings">
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="text-xs font-bold text-emerald-700 uppercase">Highest Rated Vendor</span>
                  <p className="text-lg font-black text-emerald-900 mt-1">Apex Global Electronics (4.9 ★)</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <span className="text-xs font-bold text-blue-700 uppercase">Fastest Lead Time</span>
                  <p className="text-lg font-black text-blue-900 mt-1">Nexus Cybernetics (3.0 Days avg)</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <span className="text-xs font-bold text-purple-700 uppercase">SLA Compliance Ratio</span>
                  <p className="text-lg font-black text-purple-900 mt-1">96.4% On-Time Deliveries</p>
                </div>
              </div>
            </div>
          </TableCard>
        )}

        {/* TAB 4: PROCUREMENT TRENDS */}
        {activeTab === 'trends' && (
          <TableCard title="Procurement Trends & Spend Projections" subtitle="Seasonality analysis, quarterly acquisition growth, and price fluctuation tracking">
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Q3 Spend Forecast</span>
                  <p className="text-xl font-black text-slate-900 mt-1">{settings.currencySymbol}410,000</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">YoY Spend Growth</span>
                  <p className="text-xl font-black text-emerald-600 mt-1">+12.4%</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Price Volatility Index</span>
                  <p className="text-xl font-black text-blue-600 mt-1">Low (1.4%)</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Bulk Discount Capture</span>
                  <p className="text-xl font-black text-purple-600 mt-1">88.2%</p>
                </div>
              </div>
            </div>
          </TableCard>
        )}

        {/* TAB 5: PURCHASE PAYMENTS */}
        {activeTab === 'payments' && (
          <TableCard title="Purchase Payments & Accounts Payable Aging" subtitle="Outstanding vendor balances, Net 30/60 payment terms, and upcoming disbursements">
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total AP Outstanding</span>
                  <p className="text-xl font-black text-amber-600 mt-1">{settings.currencySymbol}73,100</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Current (0-30 Days)</span>
                  <p className="text-xl font-black text-emerald-600 mt-1">{settings.currencySymbol}52,400</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Overdue (31-60 Days)</span>
                  <p className="text-xl font-black text-blue-600 mt-1">{settings.currencySymbol}16,500</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Critical (&gt;60 Days)</span>
                  <p className="text-xl font-black text-rose-600 mt-1">{settings.currencySymbol}4,200</p>
                </div>
              </div>
            </div>
          </TableCard>
        )}

        {/* TAB 6: INVENTORY PURCHASING */}
        {activeTab === 'inventory' && (
          <TableCard title="Inventory Purchasing & Stock Turnover" subtitle="Stock replenishment speed, holding costs, and safety stock compliance ratios">
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Stock Turnover Ratio</span>
                  <p className="text-xl font-black text-slate-900 mt-1">6.2x Annual</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Safety Stock Compliance</span>
                  <p className="text-xl font-black text-emerald-600 mt-1">94.8%</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Average Holding Cost</span>
                  <p className="text-xl font-black text-blue-600 mt-1">11.4% of Inventory</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Stockout Incidents</span>
                  <p className="text-xl font-black text-purple-600 mt-1">2 SKUs This Month</p>
                </div>
              </div>
            </div>
          </TableCard>
        )}

        {/* TAB 7: COST BREAKDOWN */}
        {activeTab === 'costs' && (
          <TableCard title="Cost Breakdown & Acquisition Telemetry" subtitle="Detailed audit of freight, import customs tariffs, packaging, and item purchase pricing">
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <span className="text-xs font-bold text-blue-700 uppercase">Freight & Shipping Fees</span>
                  <p className="text-lg font-black text-blue-900 mt-1">{settings.currencySymbol}14,500 (4.2% of spend)</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <span className="text-xs font-bold text-purple-700 uppercase">Customs & Import Tariffs</span>
                  <p className="text-lg font-black text-purple-900 mt-1">{settings.currencySymbol}28,400 (8.3% of spend)</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="text-xs font-bold text-emerald-700 uppercase">Packaging & Crating</span>
                  <p className="text-lg font-black text-emerald-900 mt-1">{settings.currencySymbol}6,800 (2.0% of spend)</p>
                </div>
              </div>
            </div>
          </TableCard>
        )}

        {/* TAB 8: DEPARTMENT SPENDING */}
        {activeTab === 'departments' && (
          <TableCard title="Department Spending & Cost Center Allocation" subtitle="Internal budget utilization across business units and operating depots">
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase">Central Warehouse</span>
                  <p className="text-xl font-black text-blue-600 mt-1">{settings.currencySymbol}184,500 (54%)</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase">Retail Flagship Store</span>
                  <p className="text-xl font-black text-emerald-600 mt-1">{settings.currencySymbol}96,200 (28%)</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase">Import Logistics Dept</span>
                  <p className="text-xl font-black text-purple-600 mt-1">{settings.currencySymbol}61,800 (18%)</p>
                </div>
              </div>
            </div>
          </TableCard>
        )}

        {/* Executive summary banner */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 flex items-center justify-between">
          <div>
            <span className="font-bold">Executive Summary:</span> Procurement spending is up 8.4% month-over-month due to seasonal inventory stocking at the Central Warehouse. Supplier on-time SLA remains exceptionally high at 96.4%.
          </div>
          <button onClick={() => alert('Downloading Executive PDF Summary...')} className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded-xl shadow-xs hover:bg-blue-700 cursor-pointer shrink-0">
            Download PDF Summary
          </button>
        </div>
      </div>

      {/* Custom Export Modal */}
      {isCustomExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Custom Purchase Report Export</h3>
              <button onClick={() => setIsCustomExportModalOpen(false)} className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer">✕</button>
            </div>
            <p className="text-xs text-slate-500">Select specific procurement metrics and sections to include in your customized export file:</p>
            <div className="space-y-2 text-xs font-bold text-slate-700 max-h-60 overflow-y-auto pr-2">
              <label className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl cursor-pointer">
                <input type="checkbox" checked={exportFields.totalValue} onChange={(e) => setExportFields({...exportFields, totalValue: e.target.checked})} className="rounded text-blue-600" />
                <span>Total Purchase Value</span>
              </label>
              <label className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl cursor-pointer">
                <input type="checkbox" checked={exportFields.avgCost} onChange={(e) => setExportFields({...exportFields, avgCost: e.target.checked})} className="rounded text-blue-600" />
                <span>Average Purchase Cost</span>
              </label>
              <label className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl cursor-pointer">
                <input type="checkbox" checked={exportFields.savings} onChange={(e) => setExportFields({...exportFields, savings: e.target.checked})} className="rounded text-blue-600" />
                <span>Procurement Savings</span>
              </label>
              <label className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl cursor-pointer">
                <input type="checkbox" checked={exportFields.sla} onChange={(e) => setExportFields({...exportFields, sla: e.target.checked})} className="rounded text-blue-600" />
                <span>Supplier SLA Rating</span>
              </label>
              <label className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl cursor-pointer">
                <input type="checkbox" checked={exportFields.topSuppliers} onChange={(e) => setExportFields({...exportFields, topSuppliers: e.target.checked})} className="rounded text-blue-600" />
                <span>Top Supplier Spend Concentration</span>
              </label>
              <label className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl cursor-pointer">
                <input type="checkbox" checked={exportFields.inventoryPurchasing} onChange={(e) => setExportFields({...exportFields, inventoryPurchasing: e.target.checked})} className="rounded text-blue-600" />
                <span>Inventory Purchasing & Turnover</span>
              </label>
              <label className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl cursor-pointer">
                <input type="checkbox" checked={exportFields.costBreakdown} onChange={(e) => setExportFields({...exportFields, costBreakdown: e.target.checked})} className="rounded text-blue-600" />
                <span>Cost Breakdown (Freight & Tariffs)</span>
              </label>
              <label className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl cursor-pointer">
                <input type="checkbox" checked={exportFields.departmentSpend} onChange={(e) => setExportFields({...exportFields, departmentSpend: e.target.checked})} className="rounded text-blue-600" />
                <span>Department Spending Allocation</span>
              </label>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">File Format</label>
              <div className="flex gap-3 text-xs">
                <label className="flex items-center gap-2 font-bold cursor-pointer">
                  <input type="radio" name="customFormat" checked={customExportFormat === 'csv'} onChange={() => setCustomExportFormat('csv')} /> CSV File (.csv)
                </label>
                <label className="flex items-center gap-2 font-bold cursor-pointer">
                  <input type="radio" name="customFormat" checked={customExportFormat === 'excel'} onChange={() => setCustomExportFormat('excel')} /> Excel Spreadsheet (.xls)
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setIsCustomExportModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer">Cancel</button>
              <button onClick={handleCustomExportSubmit} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer">Generate Custom Export</button>
            </div>
          </div>
        </div>
      )}
    </NebulaPage>
  );
};
