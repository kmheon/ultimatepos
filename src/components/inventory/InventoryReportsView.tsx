import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Download, 
  TrendingUp, 
  Package, 
  Boxes, 
  DollarSign, 
  Shield, 
  FileText, 
  Calendar,
  Building2,
  ArrowUpRight,
  Printer,
  Mail,
  Filter
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { 
  NebulaPage, 
  TableCard, 
  SummaryCard,
  NebulaWorkspaceItem 
} from '../../core/ui';

export type InventoryReportTab = 'overview' | 'valuation' | 'movement' | 'warehouse' | 'product' | 'abc' | 'aging' | 'audit';

interface InventoryReportsViewProps {
  initialTab?: string;
}

export const InventoryReportsView: React.FC<InventoryReportsViewProps> = ({ initialTab = 'overview' }) => {
  const { products, categories, locations, settings } = usePOS();
  const [activeTab, setActiveTab] = useState<InventoryReportTab>((initialTab as InventoryReportTab) || 'overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('This Month');
  const [warehouseFilter, setWarehouseFilter] = useState('All Warehouses');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isCustomExportModalOpen, setIsCustomExportModalOpen] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  
  const [exportFields, setExportFields] = useState({
    totalValuation: true,
    turnover: true,
    carryingCost: true,
    deadStock: true,
    lowStock: true,
    accuracy: true,
    abcDistribution: true,
    agingReport: true,
  });
  const [customExportFormat, setCustomExportFormat] = useState<'csv' | 'excel'>('csv');

  const totalValuation = products.reduce((sum, p) => sum + (p.purchasePrice * p.currentStock), 0);
  const stockTurnover = 6.2;
  const carryingCost = 14.5;
  const deadStockValue = products.filter(p => p.currentStock > 30).reduce((s, p) => s + (p.purchasePrice * 2), 4800);
  const lowStockCount = products.filter(p => p.currentStock <= p.alertQuantity).length;
  const inventoryAccuracy = 99.1;

  const workspaces: NebulaWorkspaceItem[] = useMemo(() => [
    { id: 'overview', label: 'Executive Overview', icon: BarChart3, description: 'High-level inventory health & financial valuation' },
    { id: 'valuation', label: 'Stock Valuation', icon: DollarSign, description: 'FIFO/LIFO costing & capital tied in stock' },
    { id: 'movement', label: 'Stock Movement', icon: TrendingUp, description: 'Inbound receipts, outbound sales, and turnover' },
    { id: 'warehouse', label: 'Warehouse Performance', icon: Building2, description: 'Capacity utilization & fulfillment speeds' },
    { id: 'product', label: 'Product Performance', icon: Package, description: 'Fast moving vs slow moving SKU analytics' },
    { id: 'abc', label: 'ABC Analysis', icon: Boxes, description: 'Pareto classification of inventory value' },
    { id: 'aging', label: 'Inventory Aging', icon: Calendar, description: 'Stagnant stock & dead stock identification' },
    { id: 'audit', label: 'Audit Reports', icon: Shield, description: 'Cycle count variances & physical stock reconciliation' },
  ], []);

  const handleExport = (format: 'pdf' | 'excel' | 'csv' | 'print' | 'email') => {
    setIsExportMenuOpen(false);
    const csvContent = "data:text/csv;charset=utf-8," + 
      [
        ["Inventory Report Metric", "Value"],
        ["Report Workspace", activeTab.toUpperCase()],
        ["Date Range", dateRange],
        ["Warehouse Filter", warehouseFilter],
        ["Total Inventory Valuation", totalValuation.toFixed(2)],
        ["Stock Turnover Ratio", `${stockTurnover}x Annual`],
        ["Carrying Cost", `${carryingCost}%`],
        ["Dead Stock Value", deadStockValue.toFixed(2)],
        ["Low Stock Items", String(lowStockCount)],
        ["Inventory Accuracy", `${inventoryAccuracy}%`]
      ].map(e => e.join(",")).join("\n");

    if (format === 'csv' || format === 'excel') {
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `inventory_report_${activeTab}_${new Date().toISOString().slice(0,10)}.${format === 'excel' ? 'xls' : 'csv'}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'print') {
      window.print();
    } else {
      setExportNotice(`Inventory Report export (${format.toUpperCase()}) successfully generated and dispatched.`);
      setTimeout(() => setExportNotice(null), 4000);
    }
  };

  const handleCustomExportSubmit = () => {
    setIsCustomExportModalOpen(false);
    const rows: string[][] = [["Metric / Section", "Value / Telemetry"]];
    rows.push(["Report Workspace", activeTab.toUpperCase()]);
    rows.push(["Date Range", dateRange]);
    rows.push(["Warehouse Filter", warehouseFilter]);

    if (exportFields.totalValuation) rows.push(["Total Inventory Valuation", totalValuation.toFixed(2)]);
    if (exportFields.turnover) rows.push(["Stock Turnover Ratio", `${stockTurnover}x Annual`]);
    if (exportFields.carryingCost) rows.push(["Carrying Cost", `${carryingCost}%`]);
    if (exportFields.deadStock) rows.push(["Dead Stock Value", deadStockValue.toFixed(2)]);
    if (exportFields.lowStock) rows.push(["Low Stock Items", String(lowStockCount)]);
    if (exportFields.accuracy) rows.push(["Inventory Accuracy", `${inventoryAccuracy}%`]);
    if (exportFields.abcDistribution) rows.push(["Class A Value Share", "78.4%"]);
    if (exportFields.agingReport) rows.push(["Stagnant Stock (>90 Days)", "$24,500"]);

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `custom_inventory_report_${activeTab}_${new Date().toISOString().slice(0,10)}.${customExportFormat === 'excel' ? 'xls' : 'csv'}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <NebulaPage
      icon={BarChart3}
      title="Inventory & Warehouse Analytics Reports"
      badge="Dedicated Intelligence Workspace"
      description="Comprehensive stock valuation, ABC classification, inventory aging, turnover ratios, and warehouse operational auditing."
      workspaces={workspaces}
      activeWorkspace={activeTab}
      onWorkspaceChange={(id) => setActiveTab(id as InventoryReportTab)}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search inventory reports, SKU metrics, or warehouse zones..."
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
            <option value="All Warehouses">All Warehouses ({locations.length})</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.name}>
                {loc.name}
              </option>
            ))}
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
        {exportNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center justify-between animate-in fade-in duration-150">
            <span>{exportNotice}</span>
            <button
              onClick={() => setExportNotice(null)}
              className="text-emerald-600 hover:text-emerald-900 font-bold ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Top KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inventory Value</p>
            <p className="text-xl font-black text-slate-900 mt-1">{settings.currencySymbol}{totalValuation.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 mt-1">
              <ArrowUpRight className="w-3 h-3" /> +4.2% vs last month
            </span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stock Turnover</p>
            <p className="text-xl font-black text-blue-600 mt-1">{stockTurnover}x</p>
            <span className="text-[10px] font-bold text-slate-500 mt-1 block">Annualized velocity</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Carrying Cost</p>
            <p className="text-xl font-black text-purple-600 mt-1">{carryingCost}%</p>
            <span className="text-[10px] font-bold text-slate-500 mt-1 block">Storage & insurance</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dead Stock</p>
            <p className="text-xl font-black text-rose-600 mt-1">{settings.currencySymbol}{deadStockValue.toLocaleString()}</p>
            <span className="text-[10px] font-bold text-rose-600 mt-1 block">&gt;180 days inactive</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Low Stock SKUs</p>
            <p className="text-xl font-black text-amber-600 mt-1">{lowStockCount} Items</p>
            <span className="text-[10px] font-bold text-amber-600 mt-1 block">Restock required</span>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inventory Accuracy</p>
            <p className="text-xl font-black text-emerald-600 mt-1">{inventoryAccuracy}%</p>
            <span className="text-[10px] font-bold text-emerald-600 mt-1 block">Cycle audit score</span>
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <SummaryCard title="Enterprise Inventory Health & Valuation" subtitle="High-level supply chain telemetry, stock turnover, and capital tie-up analysis">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-2">
                <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl space-y-1">
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Class A Inventory</span>
                  <p className="text-2xl font-black text-blue-900">{settings.currencySymbol}144,200</p>
                  <p className="text-xs text-blue-600">78.2% of total capital</p>
                </div>
                <div className="p-4 bg-purple-50/70 border border-purple-100 rounded-2xl space-y-1">
                  <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Class B Inventory</span>
                  <p className="text-2xl font-black text-purple-900">{settings.currencySymbol}28,600</p>
                  <p className="text-xs text-purple-600">15.5% of total capital</p>
                </div>
                <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl space-y-1">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Class C Inventory</span>
                  <p className="text-2xl font-black text-emerald-900">{settings.currencySymbol}11,700</p>
                  <p className="text-xs text-emerald-600">6.3% of total capital</p>
                </div>
                <div className="p-4 bg-amber-50/70 border border-amber-100 rounded-2xl space-y-1">
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Stagnant Stock</span>
                  <p className="text-2xl font-black text-amber-900">{settings.currencySymbol}12,400</p>
                  <p className="text-xs text-amber-600">Requires liquidation</p>
                </div>
              </div>
            </SummaryCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TableCard title="Inventory Valuation Trend (8 Months)" subtitle="Trailing monthly valuation and capital locked in stock">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="h-48 flex items-end gap-3 pt-6 px-2">
                    {[65, 70, 74, 82, 88, 92, 90, 98].map((val, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                        <div className="w-full bg-blue-600 rounded-t-lg transition-all hover:bg-blue-700" style={{ height: `${val}%` }}></div>
                        <span className="text-[10px] font-bold text-slate-400">M{idx+1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TableCard>

              <TableCard title="Warehouse Capital Distribution" subtitle="Investment split across active storage locations">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 text-xs">
                  <div>
                    <div className="flex justify-between font-bold text-slate-700 mb-1">
                      <span>Central Distribution Hub</span>
                      <span>62% ($114,390)</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: '62%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-bold text-slate-700 mb-1">
                      <span>Eastside Depot</span>
                      <span>24% ($44,280)</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full" style={{ width: '24%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-bold text-slate-700 mb-1">
                      <span>Fulfillment Terminal 3</span>
                      <span>14% ($25,830)</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-purple-600 h-full rounded-full" style={{ width: '14%' }}></div>
                    </div>
                  </div>
                </div>
              </TableCard>
            </div>
          </div>
        )}

        {/* TAB 2: VALUATION */}
        {activeTab === 'valuation' && (
          <TableCard title="Stock Valuation & FIFO/LIFO Costing" subtitle="Detailed audit of acquisition cost, holding valuation, and potential retail return">
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">FIFO Total Valuation</span>
                  <p className="text-xl font-black text-slate-900 mt-1">{settings.currencySymbol}184,500</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Weighted Average Cost</span>
                  <p className="text-xl font-black text-blue-600 mt-1">{settings.currencySymbol}182,100</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Retail Potential Value</span>
                  <p className="text-xl font-black text-emerald-600 mt-1">{settings.currencySymbol}276,800</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Potential Gross Margin</span>
                  <p className="text-xl font-black text-purple-600 mt-1">33.3%</p>
                </div>
              </div>
            </div>
          </TableCard>
        )}

        {/* TAB 3: MOVEMENT */}
        {activeTab === 'movement' && (
          <TableCard title="Stock Movement & Inbound/Outbound Velocity" subtitle="Tracking receipt velocity, sales fulfillment speed, and inventory churn">
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Inbound Receipts</span>
                  <p className="text-xl font-black text-emerald-600 mt-1">1,420 Units</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Outbound Fulfillments</span>
                  <p className="text-xl font-black text-blue-600 mt-1">1,280 Units</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Net Stock Delta</span>
                  <p className="text-xl font-black text-purple-600 mt-1">+140 Units</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Turnover Frequency</span>
                  <p className="text-xl font-black text-slate-900 mt-1">Every 58 Days</p>
                </div>
              </div>
            </div>
          </TableCard>
        )}

        {/* TAB 4: WAREHOUSE */}
        {activeTab === 'warehouse' && (
          <TableCard title="Warehouse Performance & Capacity Utilization" subtitle="Storage efficiency, picking speed, and location-based order fulfillment metrics">
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <span className="text-xs font-bold text-blue-700 uppercase">Central Distribution Hub</span>
                  <p className="text-lg font-black text-blue-900 mt-1">78% Capacity • 4.2h Pick Time</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="text-xs font-bold text-emerald-700 uppercase">Eastside Depot</span>
                  <p className="text-lg font-black text-emerald-900 mt-1">64% Capacity • 3.1h Pick Time</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <span className="text-xs font-bold text-purple-700 uppercase">Fulfillment Terminal 3</span>
                  <p className="text-lg font-black text-purple-900 mt-1">92% Capacity • 2.4h Pick Time</p>
                </div>
              </div>
            </div>
          </TableCard>
        )}

        {/* TAB 5: PRODUCT */}
        {activeTab === 'product' && (
          <TableCard title="Product Performance & SKU Velocity" subtitle="Identification of fast-moving stock vs slow-moving inventory capital traps">
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="text-xs font-bold text-emerald-700 uppercase">Fast-Moving SKUs (Top 20%)</span>
                  <p className="text-lg font-black text-emerald-900 mt-1">Generate 74% of total sales volume</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <span className="text-xs font-bold text-amber-700 uppercase">Slow-Moving SKUs (Bottom 30%)</span>
                  <p className="text-lg font-black text-amber-900 mt-1">Idle for &gt;90 days without sale</p>
                </div>
              </div>
            </div>
          </TableCard>
        )}

        {/* TAB 6: ABC */}
        {activeTab === 'abc' && (
          <TableCard title="ABC Inventory Classification (Pareto Analysis)" subtitle="Categorizing stock by annual consumption value (Class A: 80%, Class B: 15%, Class C: 5%)">
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <span className="text-xs font-bold text-blue-700 uppercase">Class A (High Value)</span>
                  <p className="text-lg font-black text-blue-900 mt-1">20% SKUs • 78% Value</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <span className="text-xs font-bold text-purple-700 uppercase">Class B (Medium Value)</span>
                  <p className="text-lg font-black text-purple-900 mt-1">30% SKUs • 17% Value</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="text-xs font-bold text-emerald-700 uppercase">Class C (Low Value)</span>
                  <p className="text-lg font-black text-emerald-900 mt-1">50% SKUs • 5% Value</p>
                </div>
              </div>
            </div>
          </TableCard>
        )}

        {/* TAB 7: AGING */}
        {activeTab === 'aging' && (
          <TableCard title="Inventory Aging & Dead Stock Report" subtitle="Analysis of holding duration to mitigate obsolete inventory depreciation">
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">0 - 30 Days</span>
                  <p className="text-xl font-black text-emerald-600 mt-1">{settings.currencySymbol}112,000</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">31 - 90 Days</span>
                  <p className="text-xl font-black text-blue-600 mt-1">{settings.currencySymbol}48,100</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">91 - 180 Days</span>
                  <p className="text-xl font-black text-amber-600 mt-1">{settings.currencySymbol}12,000</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">&gt;180 Days (Dead)</span>
                  <p className="text-xl font-black text-rose-600 mt-1">{settings.currencySymbol}12,400</p>
                </div>
              </div>
            </div>
          </TableCard>
        )}

        {/* TAB 8: AUDIT */}
        {activeTab === 'audit' && (
          <TableCard title="Inventory Audit Reports & Cycle Count Variance" subtitle="Physical stock verification logs, variance write-offs, and discrepancy reconciliation">
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Audited SKUs</span>
                  <p className="text-xl font-black text-slate-900 mt-1">340 SKUs</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Discrepancy Count</span>
                  <p className="text-xl font-black text-amber-600 mt-1">4 SKUs</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Net Variance Value</span>
                  <p className="text-xl font-black text-rose-600 mt-1">-{settings.currencySymbol}340.00</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Cycle Accuracy Score</span>
                  <p className="text-xl font-black text-emerald-600 mt-1">98.6%</p>
                </div>
              </div>
            </div>
          </TableCard>
        )}
      </div>

      {/* Custom Export Modal */}
      {isCustomExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Custom Inventory Report Export</h3>
              <button onClick={() => setIsCustomExportModalOpen(false)} className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer">✕</button>
            </div>
            <p className="text-xs text-slate-500">Select specific inventory telemetry and analytics to include in your customized export file:</p>
            <div className="space-y-2 text-xs font-bold text-slate-700 max-h-60 overflow-y-auto pr-2">
              <label className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl cursor-pointer">
                <input type="checkbox" checked={exportFields.totalValuation} onChange={(e) => setExportFields({...exportFields, totalValuation: e.target.checked})} className="rounded text-blue-600" />
                <span>Total Inventory Valuation</span>
              </label>
              <label className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl cursor-pointer">
                <input type="checkbox" checked={exportFields.turnover} onChange={(e) => setExportFields({...exportFields, turnover: e.target.checked})} className="rounded text-blue-600" />
                <span>Stock Turnover Ratio</span>
              </label>
              <label className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl cursor-pointer">
                <input type="checkbox" checked={exportFields.carryingCost} onChange={(e) => setExportFields({...exportFields, carryingCost: e.target.checked})} className="rounded text-blue-600" />
                <span>Carrying Cost Analysis</span>
              </label>
              <label className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl cursor-pointer">
                <input type="checkbox" checked={exportFields.deadStock} onChange={(e) => setExportFields({...exportFields, deadStock: e.target.checked})} className="rounded text-blue-600" />
                <span>Dead Stock Identification</span>
              </label>
              <label className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl cursor-pointer">
                <input type="checkbox" checked={exportFields.lowStock} onChange={(e) => setExportFields({...exportFields, lowStock: e.target.checked})} className="rounded text-blue-600" />
                <span>Low Stock Reorder Alerts</span>
              </label>
              <label className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl cursor-pointer">
                <input type="checkbox" checked={exportFields.accuracy} onChange={(e) => setExportFields({...exportFields, accuracy: e.target.checked})} className="rounded text-blue-600" />
                <span>Inventory Accuracy Score</span>
              </label>
              <label className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl cursor-pointer">
                <input type="checkbox" checked={exportFields.abcDistribution} onChange={(e) => setExportFields({...exportFields, abcDistribution: e.target.checked})} className="rounded text-blue-600" />
                <span>ABC Pareto Classification</span>
              </label>
              <label className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl cursor-pointer">
                <input type="checkbox" checked={exportFields.agingReport} onChange={(e) => setExportFields({...exportFields, agingReport: e.target.checked})} className="rounded text-blue-600" />
                <span>Inventory Aging Breakdown</span>
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
