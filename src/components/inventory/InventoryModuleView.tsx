import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, 
  Plus
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { ModuleHeader } from '../layout/ModuleHeader';
import { InventoryDashboardView } from './InventoryDashboardView';
import { ProductList } from '../products/ProductList';
import { InventoryCategoriesView } from './InventoryCategoriesView';
import { InventoryBrandsView } from './InventoryBrandsView';
import { InventoryStockView } from './InventoryStockView';
import { TransfersView } from '../transfers/TransfersView';
import { StockAdjustmentView } from '../adjustments/StockAdjustmentView';
import { InventoryReportsView } from './InventoryReportsView';
import { AddProductModal } from '../products/AddProductModal';
import { updateBrowserURL } from '../../utils/navigationRouter';

export type InventorySubTab = 
  | 'dashboard' 
  | 'products' 
  | 'categories' 
  | 'brands' 
  | 'stock' 
  | 'transfers' 
  | 'adjustments' 
  | 'reports';

interface InventoryModuleViewProps {
  initialSubTab?: string;
}

export const InventoryModuleView: React.FC<InventoryModuleViewProps> = ({ initialSubTab = 'dashboard' }) => {
  const { products, categories, settings } = usePOS();
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  const normalizedSubTab: InventorySubTab = useMemo(() => {
    if (!initialSubTab) return 'dashboard';
    const clean = initialSubTab.toLowerCase().replace(/_/g, '-');
    if (['dashboard', 'overview'].includes(clean)) return 'dashboard';
    if (['products', 'catalog', 'skus'].includes(clean)) return 'products';
    if (['categories', 'category'].includes(clean)) return 'categories';
    if (['brands', 'brand', 'manufacturers'].includes(clean)) return 'brands';
    if (['stock', 'valuation', 'warehouse'].includes(clean)) return 'stock';
    if (['transfers', 'transfer'].includes(clean)) return 'transfers';
    if (['adjustments', 'adjustment', 'audit'].includes(clean)) return 'adjustments';
    if (['reports', 'analytics'].includes(clean)) return 'reports';
    return 'dashboard';
  }, [initialSubTab]);

  const [activeSubTab, setActiveSubTab] = useState<InventorySubTab>(normalizedSubTab);

  useEffect(() => {
    setActiveSubTab(normalizedSubTab);
  }, [normalizedSubTab]);

  const handleTabChange = (tabId: string) => {
    const nextTab = tabId as InventorySubTab;
    setActiveSubTab(nextTab);
    updateBrowserURL('inventory', nextTab);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Standardized Module Header */}
      <ModuleHeader
        icon={Package}
        title="Inventory & Warehouse Management"
        badge="Asset Control"
        subtitle="Enterprise warehouse control, SKU catalog, multi-location stock, transfers, audits, and analytics reports"
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsAddProductOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer shadow-blue-200"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>
        }
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeSubTab === 'dashboard' && (
          <InventoryDashboardView 
            onNavigateTab={handleTabChange} 
            onOpenAddProduct={() => setIsAddProductOpen(true)} 
          />
        )}

        {activeSubTab === 'products' && <ProductList />}

        {activeSubTab === 'categories' && (
          <InventoryCategoriesView />
        )}

        {activeSubTab === 'brands' && (
          <InventoryBrandsView />
        )}

        {activeSubTab === 'stock' && (
          <InventoryStockView />
        )}

        {activeSubTab === 'transfers' && (
          <TransfersView />
        )}

        {activeSubTab === 'adjustments' && (
          <StockAdjustmentView />
        )}

        {activeSubTab === 'reports' && (
          <InventoryReportsView />
        )}
      </div>

      {isAddProductOpen && (
        <AddProductModal isOpen={isAddProductOpen} onClose={() => setIsAddProductOpen(false)} />
      )}
    </div>
  );
};

