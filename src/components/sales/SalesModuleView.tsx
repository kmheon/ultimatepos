import React, { useState, useEffect, useMemo } from 'react';
import { 
  Receipt, 
  LayoutDashboard, 
  ShoppingCart, 
  FileText, 
  RotateCcw, 
  BarChart3,
  PlusCircle,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  Calendar,
  DollarSign,
  Users,
  Percent
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { ModuleHeader } from '../layout/ModuleHeader';
import { WorkspaceNav, WorkspaceItem } from '../layout/WorkspaceNav';
import { SalesList } from './SalesList';
import { ReturnsView } from '../returns/ReturnsView';
import { ReportsView } from '../reports/ReportsView';
import { POSTerminal } from '../pos/POSTerminal';
import { updateBrowserURL } from '../../utils/navigationRouter';

export type SalesSubTab = 'dashboard' | 'pos' | 'orders' | 'invoices' | 'returns' | 'reports';

interface SalesModuleViewProps {
  initialSubTab?: string;
}

export const SalesModuleView: React.FC<SalesModuleViewProps> = ({ initialSubTab = 'orders' }) => {
  const { transactions, settings, setActiveTab } = usePOS();
  const [activeWorkspace, setActiveWorkspace] = useState('executive');

  const salesWorkspaces: WorkspaceItem[] = useMemo(() => [
    { id: 'executive', label: 'Executive', icon: BarChart3, description: 'Sales revenue & margin KPI telemetry', priority: 1 },
    { id: 'sales', label: 'Sales', icon: Receipt, description: 'POS checkout transactions & counter volume', priority: 2 },
    { id: 'invoices', label: 'Invoices', icon: FileText, description: 'Tax invoices & B2B credit notes', priority: 3 },
    { id: 'payments', label: 'Payments', icon: CreditCard, description: 'Cash, card, and mobile money collections', priority: 4 },
    { id: 'customers', label: 'Customers', icon: Users, description: 'Top retail & wholesale customer accounts', priority: 5 },
    { id: 'tax', label: 'Tax', icon: Percent, description: 'VAT, GST and fiscal tax compliance', priority: 6 },
    { id: 'performance', label: 'Performance', icon: TrendingUp, description: 'Cashier & sales representative targets', priority: 7 },
  ], []);
  
  // Normalize initialSubTab
  const normalizedSubTab: SalesSubTab = useMemo(() => {
    if (!initialSubTab) return 'orders';
    const clean = initialSubTab.toLowerCase().replace(/_/g, '-');
    if (['dashboard', 'overview'].includes(clean)) return 'dashboard';
    if (['pos', 'terminal', 'register'].includes(clean)) return 'pos';
    if (['orders', 'sales', 'all-sales'].includes(clean)) return 'orders';
    if (['invoices', 'billing'].includes(clean)) return 'invoices';
    if (['returns', 'refunds'].includes(clean)) return 'returns';
    if (['reports', 'analytics'].includes(clean)) return 'reports';
    return 'orders';
  }, [initialSubTab]);

  const [activeSubTab, setActiveSubTab] = useState<SalesSubTab>(normalizedSubTab);

  useEffect(() => {
    setActiveSubTab(normalizedSubTab);
  }, [normalizedSubTab]);

  const handleTabChange = (tabId: string) => {
    const nextTab = tabId as SalesSubTab;
    setActiveSubTab(nextTab);
    updateBrowserURL('sales', nextTab);
  };

  const sales = useMemo(() => transactions.filter(t => t.type === 'sell'), [transactions]);
  const totalRevenue = sales.reduce((acc, s) => acc + s.finalTotal, 0);
  const totalPaid = sales.reduce((acc, s) => acc + s.amountPaid, 0);
  const totalDue = Math.max(0, totalRevenue - totalPaid);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Standardized Module Header */}
      <ModuleHeader
        icon={Receipt}
        title="Sales & Orders Management"
        badge="Revenue Operations"
        subtitle="Customer transactions, billing invoices, return orders, price groups, and revenue operations"
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setActiveTab('pos')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer shadow-blue-200"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Sale / POS</span>
            </button>
          </div>
        }
      />

      {/* Main Tab Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeSubTab === 'dashboard' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Sales Revenue</span>
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 mt-2">
                  {settings.currencySymbol}{totalRevenue.toFixed(2)}
                </div>
                <p className="text-xs text-slate-500 mt-1">{sales.length} completed transactions</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payments Collected</span>
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <CreditCard className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 mt-2">
                  {settings.currencySymbol}{totalPaid.toFixed(2)}
                </div>
                <p className="text-xs text-emerald-600 font-semibold mt-1">100% cleared settlement</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Accounts Receivable Due</span>
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 mt-2">
                  {settings.currencySymbol}{totalDue.toFixed(2)}
                </div>
                <p className="text-xs text-slate-400 mt-1">Outstanding customer dues</p>
              </div>
            </div>

            {/* Quick Actions & Recent Orders Banner */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Recent Customer Sales</h2>
                  <p className="text-xs text-slate-500">Live feed of store checkout transactions</p>
                </div>
                <button
                  onClick={() => handleTabChange('orders')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  View All Orders →
                </button>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {sales.slice(0, 5).map(s => (
                  <div key={s.id} className="py-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">Invoice #{s.invoiceNo}</span>
                      <p className="text-slate-500 text-[11px]">{s.contactName} • {s.transactionDate}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-slate-900">{settings.currencySymbol}{s.finalTotal.toFixed(2)}</span>
                      <span className="block text-[10px] font-bold text-emerald-600 uppercase">Paid</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'pos' && (
          <div className="flex-1 overflow-y-auto">
            <POSTerminal />
          </div>
        )}

        {activeSubTab === 'orders' && (
          <div className="flex-1 overflow-y-auto">
            <SalesList />
          </div>
        )}

        {activeSubTab === 'invoices' && (
          <div className="flex-1 overflow-y-auto">
            <SalesList />
          </div>
        )}

        {activeSubTab === 'returns' && (
          <div className="flex-1 overflow-y-auto p-6">
            <ReturnsView />
          </div>
        )}

        {activeSubTab === 'reports' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <WorkspaceNav
              workspaces={salesWorkspaces}
              activeWorkspace={activeWorkspace}
              onWorkspaceChange={setActiveWorkspace}
            />
            <div className="flex-1 overflow-y-auto p-6">
              <ReportsView initialReportTab="sales" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
