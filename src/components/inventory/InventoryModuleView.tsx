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
  Plus,
  AlertTriangle,
  Barcode,
  Building2,
  Truck,
  DollarSign,
  Shield
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { ModuleHeader } from '../layout/ModuleHeader';
import { WorkspaceNav, WorkspaceItem } from '../layout/WorkspaceNav';
import { ProductList } from '../products/ProductList';
import { TransfersView } from '../transfers/TransfersView';
import { StockAdjustmentView } from '../adjustments/StockAdjustmentView';
import { BarcodeLabelsView } from '../labels/BarcodeLabelsView';
import { ReportsView } from '../reports/ReportsView';
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

export const InventoryModuleView: React.FC<InventoryModuleViewProps> = ({ initialSubTab = 'products' }) => {
  const { products, categories, settings } = usePOS();
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState('executive');

  const inventoryWorkspaces: WorkspaceItem[] = useMemo(() => [
    { id: 'executive', label: 'Executive', icon: BarChart3, description: 'Executive Summary & KPI overview', priority: 1 },
    { id: 'inventory', label: 'Inventory', icon: Package, description: 'SKU Valuation & Stock Levels', priority: 2 },
    { id: 'warehouse', label: 'Warehouse', icon: Building2, description: 'Multi-location distribution telemetry', priority: 3 },
    { id: 'stock', label: 'Stock', icon: Boxes, description: 'Movement velocity and reorder thresholds', priority: 4 },
    { id: 'procurement', label: 'Procurement', icon: Truck, description: 'Vendor supply chain and purchase velocity', priority: 5 },
    { id: 'finance', label: 'Finance', icon: DollarSign, description: 'Inventory cost valuation and capital tied', priority: 6 },
    { id: 'audit', label: 'Audit', icon: Shield, description: 'Physical count adjustments and variance log', priority: 7 },
  ], []);

  const normalizedSubTab: InventorySubTab = useMemo(() => {
    if (!initialSubTab) return 'products';
    const clean = initialSubTab.toLowerCase().replace(/_/g, '-');
    if (['dashboard', 'overview'].includes(clean)) return 'dashboard';
    if (['products', 'catalog', 'skus'].includes(clean)) return 'products';
    if (['categories', 'category'].includes(clean)) return 'categories';
    if (['brands', 'brand', 'manufacturers'].includes(clean)) return 'brands';
    if (['stock', 'valuation', 'warehouse'].includes(clean)) return 'stock';
    if (['transfers', 'transfer'].includes(clean)) return 'transfers';
    if (['adjustments', 'adjustment', 'audit'].includes(clean)) return 'adjustments';
    if (['reports', 'analytics'].includes(clean)) return 'reports';
    return 'products';
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

  const totalCostValuation = products.reduce((acc, p) => acc + (p.purchasePrice * p.currentStock), 0);
  const totalRetailValuation = products.reduce((acc, p) => acc + (p.sellingPrice * p.currentStock), 0);
  const lowStockCount = products.filter(p => p.currentStock <= p.alertQuantity).length;

  const brands = useMemo(() => {
    const brandSet = new Set<string>();
    products.forEach(p => {
      if (p.brandName) brandSet.add(p.brandName);
    });
    return Array.from(brandSet);
  }, [products]);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Standardized Module Header */}
      <ModuleHeader
        icon={Package}
        title="Inventory & Warehouse Management"
        badge="Asset Control"
        subtitle="SKU catalog, multi-warehouse stock levels, stock transfers, barcode labels, and physical inventory audits"
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
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inventory Cost Valuation</span>
                <div className="text-2xl font-black text-slate-900 mt-2">
                  {settings.currencySymbol}{totalCostValuation.toFixed(2)}
                </div>
                <p className="text-xs text-slate-400 mt-1">Retail market value: {settings.currencySymbol}{totalRetailValuation.toFixed(2)}</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Catalog SKUs</span>
                <div className="text-2xl font-black text-blue-600 mt-2">
                  {products.length} Products
                </div>
                <p className="text-xs text-slate-500 mt-1">{categories.length} Categories • {brands.length} Brands</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Low Stock Warnings</span>
                <div className="text-2xl font-black text-rose-600 mt-2">
                  {lowStockCount} Items
                </div>
                <p className="text-xs text-rose-500 font-semibold mt-1">Reorder threshold triggered</p>
              </div>
            </div>

            {/* Quick Catalog Overview */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Low Stock Alert List</h3>
                  <p className="text-xs text-slate-500">Products currently below safety reorder threshold</p>
                </div>
                <button
                  onClick={() => handleTabChange('products')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  Manage All SKUs →
                </button>
              </div>

              {lowStockCount === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">All warehouse items are within healthy inventory stock levels.</div>
              ) : (
                <div className="divide-y divide-slate-100 text-xs">
                  {products.filter(p => p.currentStock <= p.alertQuantity).map(p => (
                    <div key={p.id} className="py-3 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">{p.name}</span>
                        <p className="text-slate-400 text-[11px]">SKU: {p.sku} • Category: {categories.find(c => c.id === p.categoryId)?.name || 'General'}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-rose-600">{p.currentStock} in stock</span>
                        <span className="block text-[10px] text-slate-400">Alert at {p.alertQuantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeSubTab === 'products' && (
          <div className="flex-1 overflow-y-auto">
            <ProductList />
          </div>
        )}

        {activeSubTab === 'categories' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Product Categories Master</h3>
                  <p className="text-xs text-slate-500">Organize catalog items into taxonomic groups</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map(cat => {
                  const count = products.filter(p => p.categoryId === cat.id).length;
                  return (
                    <div key={cat.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 text-xs">{cat.name}</span>
                        <p className="text-[11px] text-slate-400 mt-0.5">{cat.description || 'System taxonomy'}</p>
                      </div>
                      <span className="text-xs font-extrabold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-200">
                        {count} SKUs
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'brands' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
              <h3 className="font-bold text-slate-900 text-sm mb-1">Manufacturer Brands</h3>
              <p className="text-xs text-slate-500 mb-4">Original Equipment Manufacturers (OEM) and brand labels</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {brands.length === 0 ? (
                  <div className="p-4 text-xs text-slate-400 col-span-3 text-center">No distinct brands registered.</div>
                ) : (
                  brands.map((brand, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{brand}</span>
                      <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {products.filter(p => p.brandName === brand).length} Items
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'stock' && (
          <div className="flex-1 overflow-y-auto p-6">
            <ReportsView initialReportTab="inventory" />
          </div>
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
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <WorkspaceNav
              workspaces={inventoryWorkspaces}
              activeWorkspace={activeWorkspace}
              onWorkspaceChange={setActiveWorkspace}
            />
            <div className="flex-1 overflow-y-auto p-6">
              <ReportsView initialReportTab="inventory" />
            </div>
          </div>
        )}
      </div>

      {isAddProductOpen && (
        <AddProductModal isOpen={isAddProductOpen} onClose={() => setIsAddProductOpen(false)} />
      )}
    </div>
  );
};
