import React, { useState, useEffect, useMemo } from 'react';
import { 
  Truck, 
  LayoutDashboard, 
  FileSpreadsheet, 
  PackageCheck, 
  Users, 
  BarChart3,
  Plus,
  TrendingDown,
  Clock,
  CheckCircle2,
  Receipt
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { ModuleHeader } from '../layout/ModuleHeader';
import { WorkspaceNav, WorkspaceItem } from '../layout/WorkspaceNav';
import { PurchasesList } from './PurchasesList';
import { ContactsList } from '../contacts/ContactsList';
import { ReportsView } from '../reports/ReportsView';
import { AddPurchaseModal } from './AddPurchaseModal';
import { updateBrowserURL } from '../../utils/navigationRouter';

export type PurchasesSubTab = 'dashboard' | 'requisitions' | 'orders' | 'suppliers' | 'receiving' | 'reports';

interface PurchasesModuleViewProps {
  initialSubTab?: string;
}

export const PurchasesModuleView: React.FC<PurchasesModuleViewProps> = ({ initialSubTab = 'orders' }) => {
  const { transactions, contacts, settings } = usePOS();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState('executive');

  const purchasesWorkspaces: WorkspaceItem[] = useMemo(() => [
    { id: 'executive', label: 'Executive', icon: BarChart3, description: 'Procurement spend & supplier KPI overview', priority: 1 },
    { id: 'requisitions', label: 'Requisitions', icon: FileSpreadsheet, description: 'Internal material requests & approvals', priority: 2 },
    { id: 'orders', label: 'Purchase Orders', icon: Truck, description: 'Inbound supplier PO tracking', priority: 3 },
    { id: 'suppliers', label: 'Suppliers', icon: Users, description: 'Vendor directory & performance metrics', priority: 4 },
    { id: 'receiving', label: 'Receiving', icon: PackageCheck, description: 'Goods receipt & warehouse intake', priority: 5 },
    { id: 'expenses', label: 'Expenses', icon: Receipt, description: 'Direct procurement expenditures', priority: 6 },
    { id: 'analytics', label: 'Analytics', icon: TrendingDown, description: 'Spend variance & supply chain velocity', priority: 7 },
  ], []);

  const normalizedSubTab: PurchasesSubTab = useMemo(() => {
    if (!initialSubTab) return 'orders';
    const clean = initialSubTab.toLowerCase().replace(/_/g, '-');
    if (['dashboard', 'overview'].includes(clean)) return 'dashboard';
    if (['requisitions', 'requests'].includes(clean)) return 'requisitions';
    if (['orders', 'purchase-orders', 'po'].includes(clean)) return 'orders';
    if (['suppliers', 'vendors'].includes(clean)) return 'suppliers';
    if (['receiving', 'inventory-receiving', 'receipts'].includes(clean)) return 'receiving';
    if (['reports', 'analytics'].includes(clean)) return 'reports';
    return 'orders';
  }, [initialSubTab]);

  const [activeSubTab, setActiveSubTab] = useState<PurchasesSubTab>(normalizedSubTab);

  useEffect(() => {
    setActiveSubTab(normalizedSubTab);
  }, [normalizedSubTab]);

  const handleTabChange = (tabId: string) => {
    const nextTab = tabId as PurchasesSubTab;
    setActiveSubTab(nextTab);
    updateBrowserURL('purchases', nextTab);
  };

  const purchases = useMemo(() => transactions.filter(t => t.type === 'purchase'), [transactions]);
  const totalSpend = purchases.reduce((acc, p) => acc + p.finalTotal, 0);
  const suppliersList = contacts.filter(c => c.type === 'supplier' || c.type === 'both');

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Standardized Module Header */}
      <ModuleHeader
        icon={Truck}
        title="Purchasing & Procurement"
        badge="Supply Chain"
        subtitle="Inbound supplier purchase orders, vendor invoices, requisition workflows, and goods receipt tracking"
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer shadow-blue-200"
            >
              <Plus className="w-4 h-4" />
              <span>New Purchase Order</span>
            </button>
          </div>
        }
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeSubTab === 'dashboard' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Procurement Cost</span>
                <div className="text-2xl font-black text-slate-900 mt-2">
                  {settings.currencySymbol}{totalSpend.toFixed(2)}
                </div>
                <p className="text-xs text-slate-500 mt-1">{purchases.length} Purchase orders placed</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Approved Suppliers</span>
                <div className="text-2xl font-black text-blue-600 mt-2">
                  {suppliersList.length} Vendors
                </div>
                <p className="text-xs text-slate-500 mt-1">Verified partner network</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Goods Receipt Status</span>
                <div className="text-2xl font-black text-emerald-600 mt-2">
                  100% On-Time
                </div>
                <p className="text-xs text-emerald-600 font-semibold mt-1">No pending warehouse delays</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Recent Purchase Orders</h2>
                  <p className="text-xs text-slate-500">Inbound supplier inventory acquisitions</p>
                </div>
                <button
                  onClick={() => handleTabChange('orders')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  View All Orders →
                </button>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {purchases.map(p => (
                  <div key={p.id} className="py-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">PO #{p.invoiceNo}</span>
                      <p className="text-slate-500 text-[11px]">{p.contactName} • {p.transactionDate}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-slate-900">{settings.currencySymbol}{p.finalTotal.toFixed(2)}</span>
                      <span className="block text-[10px] font-bold text-emerald-600 uppercase">Received</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'requisitions' && (
          <div className="p-6 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Active Purchase Requisitions</h3>
                  <p className="text-xs text-slate-500">Internal department purchase requests pending procurement sign-off</p>
                </div>
                <button
                  onClick={() => setIsAddOpen(true)}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold"
                >
                  Create Requisition
                </button>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900">PR-2026-0901 — 50x Network Patch Cables & SFP Modules</span>
                  <p className="text-slate-400 text-[11px]">Requested by Field Service Squad • Budget approved</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  Ready for PO
                </span>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'orders' && <PurchasesList />}

        {activeSubTab === 'suppliers' && (
          <div className="p-6">
            <ContactsList />
          </div>
        )}

        {activeSubTab === 'receiving' && (
          <div className="p-6 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
              <h3 className="font-bold text-slate-900 text-sm mb-1">Warehouse Stock Receiving Ledger</h3>
              <p className="text-xs text-slate-500 mb-4">Inspect shipment manifests, verify batch numbers, and confirm physical counts</p>

              <div className="divide-y divide-slate-100 text-xs">
                {purchases.map(p => (
                  <div key={p.id} className="py-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">Shipment for PO #{p.invoiceNo}</span>
                      <p className="text-slate-400 text-[11px]">{p.contactName} • Fully accepted into Central Warehouse</p>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg border border-emerald-200 text-[10px]">
                      QC Passed & Stocked
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'reports' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <WorkspaceNav
              workspaces={purchasesWorkspaces}
              activeWorkspace={activeWorkspace}
              onWorkspaceChange={setActiveWorkspace}
            />
            <div className="flex-1 overflow-y-auto p-6">
              <ReportsView initialReportTab="procurement" />
            </div>
          </div>
        )}
      </div>

      {isAddOpen && (
        <AddPurchaseModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
      )}
    </div>
  );
};
