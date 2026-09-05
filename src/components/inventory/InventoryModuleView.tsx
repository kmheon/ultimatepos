import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, 
  LayoutDashboard, 
  Layers, 
  Tag, 
  Boxes, 
  ArrowLeftRight, 
  SlidersHorizontal, 
  BarChart3,
  Plus
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { ModuleHeader } from '../layout/ModuleHeader';
import { WorkspaceNav, WorkspaceItem } from '../layout/WorkspaceNav';
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

  const inventoryWorkspaces: WorkspaceItem[] = useMemo(() => [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Real-time warehouse operations & health', priority: 1 },
    { id: 'products', label: 'Products', icon: Package, description: 'Master product catalogue management', priority: 2 },
    { id: 'categories', label: 'Categories', icon: Layers, description: 'Taxonomy groups & hierarchy', priority: 3 },
    { id: 'brands', label: 'Brands', icon: Tag, description: 'Manufacturer brand portfolio', priority: 4 },
    { id: 'stock', label: 'Stock', icon: Boxes, description: 'Warehouse stock levels & reorders', priority: 5 },
    { id: 'transfers', label: 'Transfers', icon: ArrowLeftRight, description: 'Inter-branch inventory transfers', priority: 6 },
    { id: 'adjustments', label: 'Adjustments', icon: SlidersHorizontal, description: 'Audit corrections & variance log', priority: 7 },
    { id: 'reports', label: 'Reports', icon: BarChart3, description: 'Warehouse analytics & ABC analysis', priority: 8 },
  ], []);

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

        {activeSubTab === 'products' && (
          <div className="flex-1 overflow-y-auto">
            <ProductList />
          </div>
        )}

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
          <div className="flex-1 overflow-y-auto p-6">
            <TransfersView />
          </div>
        )}

        {activeSubTab === 'adjustments' && (
          <div className="flex-1 overflow-y-auto p-6">
            <StockAdjustmentView />
          </div>
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

