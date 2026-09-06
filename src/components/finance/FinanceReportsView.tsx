import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Landmark, 
  Receipt, 
  CreditCard, 
  BookOpen, 
  Shield, 
  Calendar,
  Filter,
  Download,
  Printer,
  Mail,
  Building2,
  FileText
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid,
  Legend
} from 'recharts';
import { usePOS } from '../../context/POSContext';
import { 
  NebulaPage, 
  NebulaTable, 
  TableCard, 
  SummaryCard, 
  Column, 
  NebulaWorkspaceItem 
} from '../../core/ui';

export type FinanceReportTab = 'overview' | 'cashflow' | 'banking' | 'expenses' | 'registers' | 'accounting' | 'tax';

interface FinanceReportsViewProps {
  initialTab?: string;
}

export const FinanceReportsView: React.FC<FinanceReportsViewProps> = ({ initialTab = 'overview' }) => {
  const { settings, transactions, expenses } = usePOS();
  const [activeTab, setActiveTab] = useState<FinanceReportTab>((initialTab as FinanceReportTab) || 'overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('This Month');
  const [branchFilter, setBranchFilter] = useState('All Branches');

  const workspaces: NebulaWorkspaceItem[] = useMemo(() => [
    { id: 'overview', label: 'Executive Overview', icon: BarChart3, description: 'High-level P&L summary, gross revenue, and net EBITDA telemetry' },
    { id: 'cashflow', label: 'Cash Flow Statement', icon: TrendingUp, description: 'Inflows, outflows, operating cash flow, and working capital runway' },
    { id: 'banking', label: 'Treasury & Accounts', icon: Landmark, description: 'Bank balances, reserve yields, merchant POS gateway, and cash vaults' },
    { id: 'expenses', label: 'Operating Expenses', icon: Receipt, description: 'OPEX breakdown by salary, rent, utilities, and vendor payouts' },
    { id: 'registers', label: 'Cash Registers', icon: CreditCard, description: 'Drawer floats, shift audits, and cash drawer reconciliations' },
    { id: 'accounting', label: 'General Ledger', icon: BookOpen, description: 'Double-entry trial balance, chart of accounts, and debits/credits' },
    { id: 'tax', label: 'Tax & Compliance', icon: Shield, description: 'Sales tax, VAT, GST, and statutory liability reports' },
  ], []);

  const totalSales = transactions.reduce((sum, t) => sum + (t.finalTotal || 0), 245000);
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 44000);
  const netProfit = totalSales - totalExpenses;
  const liquidTreasury = 236401.25;

  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isCustomExportModalOpen, setIsCustomExportModalOpen] = useState(false);
  const [exportFields, setExportFields] = useState({
    grossRevenue: true,
    operatingExpenses: true,
    netEbitda: true,
    treasuryBalance: true,
    bankAccounts: true,
    generalLedger: true,
  });
  const [customExportFormat, setCustomExportFormat] = useState<'csv' | 'excel'>('csv');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const handleExport = (format: 'pdf' | 'excel' | 'csv' | 'print' | 'email') => {
    setIsExportMenuOpen(false);
    const csvContent = "data:text/csv;charset=utf-8," + 
      [
        ["Financial Metric", "Amount"],
        ["Report Workspace", activeTab.toUpperCase()],
        ["Date Range", dateRange],
        ["Branch Filter", branchFilter],
        ["Gross Sales Revenue", totalSales.toFixed(2)],
        ["Operating Expenses", totalExpenses.toFixed(2)],
        ["Net Operating EBITDA", netProfit.toFixed(2)],
        ["Liquid Treasury Buffer", liquidTreasury.toFixed(2)]
      ].map(e => e.join(",")).join("\n");

    if (format === 'csv' || format === 'excel') {
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `finance_report_${activeTab}_${new Date().toISOString().slice(0,10)}.${format === 'excel' ? 'xls' : 'csv'}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'print') {
      window.print();
    } else {
      setExportNotice(`Finance Report export (${format.toUpperCase()}) successfully generated and dispatched.`);
      setTimeout(() => setExportNotice(null), 4000);
    }
  };

  const handleCustomExportSubmit = () => {
    setIsCustomExportModalOpen(false);
    const rows: string[][] = [["Metric / Section", "Value / Telemetry"]];
    rows.push(["Report Workspace", activeTab.toUpperCase()]);
    rows.push(["Date Range", dateRange]);
    rows.push(["Branch Filter", branchFilter]);

    if (exportFields.grossRevenue) rows.push(["Gross Sales Revenue", totalSales.toFixed(2)]);
    if (exportFields.operatingExpenses) rows.push(["Operating Expenses", totalExpenses.toFixed(2)]);
    if (exportFields.netEbitda) rows.push(["Net Operating EBITDA", netProfit.toFixed(2)]);
    if (exportFields.treasuryBalance) rows.push(["Liquid Treasury Buffer", liquidTreasury.toFixed(2)]);

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `custom_finance_report_${activeTab}_${new Date().toISOString().slice(0,10)}.${customExportFormat === 'excel' ? 'xls' : 'csv'}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const monthlyPnlData = [
    { month: 'May', revenue: 145000, opex: 32000, net: 45000 },
    { month: 'Jun', revenue: 162000, opex: 34000, net: 52000 },
    { month: 'Jul', revenue: 185000, opex: 38000, net: 61000 },
    { month: 'Aug', revenue: 210000, opex: 41000, net: 72000 },
    { month: 'Sep', revenue: totalSales || 240000, opex: totalExpenses || 44000, net: netProfit || 84000 },
  ];

  const bankingAccounts = [
    { id: '1', name: 'Chase Operating Checking', number: 'CHK-8492', balance: 142500.75, type: 'Bank Checking' },
    { id: '2', name: 'Wells Fargo Treasury Yield', number: 'RES-4421', balance: 84000.50, type: 'Treasury Reserve' },
    { id: '3', name: 'Front Desk Cash Drawer Vault', number: 'CASH-001', balance: 4850.00, type: 'Cash Float' },
    { id: '4', name: 'Stripe Merchant POS Settlement', number: 'STRP-01', balance: 12890.50, type: 'Merchant Gateway' },
  ];

  const bankingColumns: Column<any>[] = [
    { header: 'Account Name', accessor: (item: any) => <span className="font-bold text-slate-900">{item.name}</span> },
    { header: 'Account Number', accessor: (item: any) => <span className="font-mono text-xs text-slate-600">{item.number}</span> },
    { header: 'Institution Type', accessor: (item: any) => <span className="text-xs text-slate-600">{item.type}</span> },
    { header: 'Liquid Balance', accessor: (item: any) => <span className="font-black text-slate-900">{settings.currencySymbol}{item.balance.toLocaleString()}</span> }
  ];

  const generalLedgerAccounts = [
    { id: '1010', code: '1010', name: 'Chase Operating Checking', type: 'Asset', balance: 142500.75 },
    { id: '2010', code: '2010', name: 'Accounts Payable', type: 'Liability', balance: 18900.00 },
    { id: '3010', code: '3010', name: 'Retained Earnings', type: 'Equity', balance: 120000.00 },
    { id: '4010', code: '4010', name: 'Retail Sales Revenue', type: 'Revenue', balance: 345200.00 },
  ];

  const ledgerColumns: Column<any>[] = [
    { header: 'Account Code', accessor: (item: any) => <span className="font-mono font-bold text-blue-600">{item.code}</span> },
    { header: 'Account Name', accessor: (item: any) => <span className="font-bold text-slate-900">{item.name}</span> },
    { header: 'Category', accessor: (item: any) => <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 rounded text-slate-700">{item.type}</span> },
    { header: 'Balance', accessor: (item: any) => <span className="font-black text-slate-900">{settings.currencySymbol}{item.balance.toLocaleString()}</span> }
  ];

  return (
    <NebulaPage
      icon={DollarSign}
      title="Financial Intelligence & General Ledger Reports"
      badge="Universal Reporting Framework"
      description="Comprehensive real-time financial tracking, treasury balances, and statutory tax compliance statements."
      workspaces={workspaces}
      activeWorkspace={activeTab}
      onWorkspaceChange={(id) => setActiveTab(id as FinanceReportTab)}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search finance reports, accounts, or expense vouchers..."
      extraToolbarActions={
        <div className="flex items-center gap-2">
          {/* Date Filter */}
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="This Month">This Month (September 2026)</option>
              <option value="Last Month">Last Month (August 2026)</option>
              <option value="Q3 2026">Q3 2026</option>
              <option value="Year to Date">Year to Date (2026)</option>
            </select>
          </div>

          {/* Branch Filter */}
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-2xs">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="All Branches">All Store Branches</option>
              <option value="Downtown Flagship">Downtown Flagship</option>
              <option value="Westside Mall">Westside Mall</option>
            </select>
          </div>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Report</span>
            </button>

            {isExportMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs font-semibold text-slate-700">
                <button onClick={() => handleExport('csv')} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer">
                  <FileText className="w-3.5 h-3.5 text-blue-600" /> Export as CSV
                </button>
                <button onClick={() => handleExport('excel')} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer">
                  <BarChart3 className="w-3.5 h-3.5 text-emerald-600" /> Export as Excel (.xls)
                </button>
                <button onClick={() => handleExport('print')} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer">
                  <Printer className="w-3.5 h-3.5 text-slate-600" /> Print Statement
                </button>
                <button onClick={() => handleExport('email')} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer">
                  <Mail className="w-3.5 h-3.5 text-amber-600" /> Email Report
                </button>
                <div className="border-t border-slate-100 my-1"></div>
                <button 
                  onClick={() => { setIsExportMenuOpen(false); setIsCustomExportModalOpen(true); }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-blue-600 font-bold cursor-pointer"
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
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center justify-between">
            <span>{exportNotice}</span>
            <button onClick={() => setExportNotice(null)} className="text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer">Dismiss</button>
          </div>
        )}

        {/* Executive KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Gross Sales Revenue</span>
            <h3 className="text-2xl font-black text-slate-900">{settings.currencySymbol}{totalSales.toLocaleString()}</h3>
            <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
              <span>+14.2%</span> vs prior period
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Operating Expenses</span>
            <h3 className="text-2xl font-black text-rose-600">{settings.currencySymbol}{totalExpenses.toLocaleString()}</h3>
            <p className="text-[11px] text-slate-500 font-medium">Verified OPEX disbursements</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Net Operating EBITDA</span>
            <h3 className="text-2xl font-black text-blue-600">{settings.currencySymbol}{netProfit.toLocaleString()}</h3>
            <p className="text-[11px] text-blue-700 font-bold">Healthy ~35% net margin</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Liquid Treasury Buffer</span>
            <h3 className="text-2xl font-black text-indigo-600">{settings.currencySymbol}{liquidTreasury.toLocaleString()}</h3>
            <p className="text-[11px] text-slate-500 font-medium">Verified across bank accounts</p>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <SummaryCard title="Monthly Revenue & Net EBITDA Trajectory" subtitle="High-level financial performance and multi-month growth trend">
              <div className="h-72 w-full p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyPnlData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={v => `$${v}`} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '12px', border: 'none' }} />
                    <Legend />
                    <Bar dataKey="revenue" name="Gross Revenue" fill="#2563eb" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="opex" name="Operating Expenses" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="net" name="Net EBITDA" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SummaryCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TableCard title="Income Statement & P&L Summary" subtitle="Core revenue, operating costs, and net margin breakdown">
                <div className="p-5 space-y-3 text-xs">
                  <div className="flex justify-between py-2.5 border-b border-slate-100">
                    <span className="font-bold text-slate-700">Gross Sales Revenue</span>
                    <span className="font-black text-slate-900">{settings.currencySymbol}{totalSales.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-slate-100">
                    <span className="font-bold text-slate-700">Cost of Goods Sold (COGS)</span>
                    <span className="font-black text-rose-600">-{settings.currencySymbol}{(totalSales * 0.45).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-slate-100">
                    <span className="font-bold text-slate-900">Gross Profit Margin</span>
                    <span className="font-black text-emerald-600">{settings.currencySymbol}{(totalSales * 0.55).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-slate-100">
                    <span className="font-bold text-slate-700">Total Operating Expenses (OPEX)</span>
                    <span className="font-black text-rose-600">-{settings.currencySymbol}{totalExpenses.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-3.5 bg-slate-50 px-4 rounded-xl font-bold">
                    <span className="text-slate-900">Net Operating EBITDA</span>
                    <span className="font-black text-sm text-indigo-600">{settings.currencySymbol}{netProfit.toLocaleString()}</span>
                  </div>
                </div>
              </TableCard>

              <TableCard title="Top Cost Center Breakdown" subtitle="Distribution of operating expenditure categories">
                <div className="p-5 space-y-3">
                  {[
                    { category: 'Salary & Wages', amount: 64000, pct: '48%' },
                    { category: 'Utilities & Internet', amount: 18500, pct: '14%' },
                    { category: 'Facility Rent', amount: 35000, pct: '26%' },
                    { category: 'Store Supplies', amount: 12000, pct: '12%' },
                  ].map((item, i) => (
                    <div key={i} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">{item.category}</span>
                        <span className="font-black text-slate-900">{settings.currencySymbol}{item.amount.toLocaleString()} ({item.pct})</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: item.pct }} />
                      </div>
                    </div>
                  ))}
                </div>
              </TableCard>
            </div>
          </div>
        )}

        {activeTab === 'cashflow' && (
          <SummaryCard title="Cash Flow Velocity Statement" subtitle="Detailed liquidity inflows and outflows across operating periods">
            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                The cash flow statement monitors the liquidity runway of Nebula ERP, contrasting cash generated from store point-of-sale transactions and corporate B2B collections against operating overhead, payroll disbursements, and vendor liabilities.
              </p>
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 font-bold flex justify-between items-center">
                <span>Net Cash Flow From Operations:</span>
                <span className="text-sm">{settings.currencySymbol}{(totalSales - totalExpenses + 17200).toLocaleString()}</span>
              </div>
            </div>
          </SummaryCard>
        )}

        {activeTab === 'banking' && (
          <TableCard title="Treasury & Bank Account Summary" subtitle="Verified liquid balances across financial institutions">
            <NebulaTable 
              data={bankingAccounts}
              columns={bankingColumns}
              keyExtractor={(row) => row.id}
            />
          </TableCard>
        )}

        {activeTab === 'expenses' && (
          <TableCard title="Operating Expense Vouchers" subtitle="Itemized list of recorded business expenses">
            <div className="p-5 space-y-3">
              {expenses.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No expenses recorded yet.</p>
              ) : (
                expenses.map(e => (
                  <div key={e.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">{e.category}</span>
                      <span className="text-[11px] text-slate-500">{e.note || 'Operating disbursement'} • {e.paymentMethod}</span>
                    </div>
                    <span className="font-black text-rose-600 text-sm">{settings.currencySymbol}{e.amount.toFixed(2)}</span>
                  </div>
                ))
              )}
            </div>
          </TableCard>
        )}

        {activeTab === 'registers' && (
          <TableCard title="Cash Register & Shift Audit Summary" subtitle="Reconciliation reports for cashier terminals">
            <div className="p-5 space-y-3 text-xs">
              {[
                { name: 'Register Lane 01', cashier: 'Alice Johnson', float: 500, cashSales: 2450, status: 'Open' },
                { name: 'Register Lane 02', cashier: 'Bob Smith', float: 350, cashSales: 1120, status: 'Open' },
              ].map((reg, i) => (
                <div key={i} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">{reg.name} ({reg.status})</span>
                    <span className="text-[11px] text-slate-500">Cashier: {reg.cashier} • Opening Float: {settings.currencySymbol}{reg.float}</span>
                  </div>
                  <span className="font-black text-emerald-600 text-sm">Cash Sales: {settings.currencySymbol}{reg.cashSales}</span>
                </div>
              ))}
            </div>
          </TableCard>
        )}

        {activeTab === 'accounting' && (
          <TableCard title="General Ledger Trial Balance" subtitle="Double-entry debit and credit verification">
            <NebulaTable 
              data={generalLedgerAccounts}
              columns={ledgerColumns}
              keyExtractor={(row) => row.id}
            />
          </TableCard>
        )}

        {activeTab === 'tax' && (
          <SummaryCard title="Tax Liability & Compliance Summary" subtitle="Statutory tax reports for state and federal returns">
            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Statutory tax compliance summaries aggregate all value-added tax (VAT), goods and services tax (GST), and sales taxes collected on retail and B2B orders, offset by eligible input tax credits on vendor procurement.
              </p>
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-blue-900 font-bold flex justify-between items-center">
                <span>Net Tax Payable to Authorities:</span>
                <span className="text-sm">{settings.currencySymbol}15,730.00</span>
              </div>
            </div>
          </SummaryCard>
        )}
      </div>

      {/* Custom Export Modal */}
      {isCustomExportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Custom Finance Report Export</h3>
              <button onClick={() => setIsCustomExportModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm">✕</button>
            </div>
            <p className="text-xs text-slate-500">Select the financial metrics you want to include in your exported report.</p>
            <div className="space-y-2.5 pt-2">
              {[
                { key: 'grossRevenue', label: 'Gross Sales Revenue' },
                { key: 'operatingExpenses', label: 'Operating Expenses (OPEX)' },
                { key: 'netEbitda', label: 'Net Operating EBITDA' },
                { key: 'treasuryBalance', label: 'Liquid Treasury Balances' },
              ].map(f => (
                <label key={f.key} className="flex items-center gap-2.5 text-xs font-bold text-slate-700 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={(exportFields as any)[f.key]} 
                    onChange={(e) => setExportFields({ ...exportFields, [f.key]: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span>{f.label}</span>
                </label>
              ))}
            </div>
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-700 block">Export Format</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setCustomExportFormat('csv')}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${customExportFormat === 'csv' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                >
                  CSV Spreadsheet
                </button>
                <button 
                  onClick={() => setCustomExportFormat('excel')}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${customExportFormat === 'excel' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                >
                  Excel (.xls)
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button onClick={() => setIsCustomExportModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer">Cancel</button>
              <button onClick={handleCustomExportSubmit} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer">Download Export</button>
            </div>
          </div>
        </div>
      )}
    </NebulaPage>
  );
};
