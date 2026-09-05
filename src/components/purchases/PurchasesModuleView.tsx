import React, { useState, useEffect, useMemo } from 'react';
import { Truck, Plus } from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { ModuleHeader } from '../layout/ModuleHeader';
import { PurchasesList } from './PurchasesList';
import { PurchaseDashboardView } from './PurchaseDashboardView';
import { PurchaseRequisitionsView } from './PurchaseRequisitionsView';
import { SuppliersView } from './SuppliersView';
import { PurchasingExpensesView } from './PurchasingExpensesView';
import { PurchaseReportsWorkspace } from './PurchaseReportsWorkspace';
import { AddPurchaseModal } from './AddPurchaseModal';
import { updateBrowserURL } from '../../utils/navigationRouter';

export type PurchasesSubTab = 'dashboard' | 'orders' | 'requisitions' | 'suppliers' | 'expenses' | 'reports';

interface PurchasesModuleViewProps {
  initialSubTab?: string;
}

export const PurchasesModuleView: React.FC<PurchasesModuleViewProps> = ({ initialSubTab = 'dashboard' }) => {
  const [isAddOpen, setIsAddOpen] = useState(false);

  const normalizedSubTab: PurchasesSubTab = useMemo(() => {
    if (!initialSubTab) return 'dashboard';
    const clean = initialSubTab.toLowerCase().replace(/_/g, '-');
    if (['dashboard', 'overview'].includes(clean)) return 'dashboard';
    if (['orders', 'purchase-orders', 'po'].includes(clean)) return 'orders';
    if (['requisitions', 'requests'].includes(clean)) return 'requisitions';
    if (['suppliers', 'vendors'].includes(clean)) return 'suppliers';
    if (['expenses', 'cost'].includes(clean)) return 'expenses';
    if (['reports', 'analytics'].includes(clean)) return 'reports';
    return 'dashboard';
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

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Standardized Module Header */}
      <ModuleHeader
        icon={Truck}
        title="Purchase Management"
        badge="Supply Chain & Procurement"
        subtitle="Inbound supplier purchase orders, requisition workflows, vendor SRM, freight expenses, and procurement reporting"
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
          <PurchaseDashboardView 
            onNavigate={(tab) => handleTabChange(tab)} 
            onNewPO={() => setIsAddOpen(true)} 
          />
        )}
        {activeSubTab === 'orders' && <PurchasesList />}
        {activeSubTab === 'requisitions' && <PurchaseRequisitionsView />}
        {activeSubTab === 'suppliers' && <SuppliersView />}
        {activeSubTab === 'expenses' && <PurchasingExpensesView />}
        {activeSubTab === 'reports' && <PurchaseReportsWorkspace />}
      </div>

      {isAddOpen && (
        <AddPurchaseModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
      )}
    </div>
  );
};
