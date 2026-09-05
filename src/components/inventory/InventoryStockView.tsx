import React, { useState, useMemo } from 'react';
import { 
  Boxes, 
  Search, 
  Filter, 
  Truck, 
  SlidersHorizontal, 
  Download, 
  Building2, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  DollarSign, 
  TrendingUp, 
  Layers, 
  Tag, 
  Barcode, 
  Eye,
  Plus
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { Product } from '../../types';
import { StockAdjustmentModal } from '../products/StockAdjustmentModal';
import { ReceiveStockModal } from './ReceiveStockModal';
import { ProductDetailModal } from '../products/ProductDetailModal';

export const InventoryStockView: React.FC = () => {
  const { products, categories, brands, locations, settings } = usePOS();

  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [selectedBrandId, setSelectedBrandId] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'instock' | 'low' | 'out' | 'imei'>('all');
  const [sortBy, setSortBy] = useState<'stock_desc' | 'stock_asc' | 'val_desc' | 'name_asc' | 'margin_desc'>('stock_desc');

  // Modals
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [preselectedReceiveProductId, setPreselectedReceiveProductId] = useState<string | undefined>(undefined);

  // Overall Global Stock KPIs
  const metrics = useMemo(() => {
    const totalSKUs = products.length;
    const totalUnits = products.reduce((sum, p) => sum + p.currentStock, 0);
    const totalCostValuation = products.reduce((sum, p) => sum + (p.purchasePrice * p.currentStock), 0);
    const totalRetailValuation = products.reduce((sum, p) => sum + (p.sellingPrice * p.currentStock), 0);
    const grossMarginDollars = totalRetailValuation - totalCostValuation;
    const grossMarginPercent = totalRetailValuation > 0 ? (grossMarginDollars / totalRetailValuation) * 100 : 0;

    const lowStockCount = products.filter(p => p.currentStock > 0 && p.currentStock <= p.alertQuantity).length;
    const outOfStockCount = products.filter(p => p.currentStock <= 0).length;
    const healthyCount = products.filter(p => p.currentStock > p.alertQuantity).length;
    const healthPercent = totalSKUs > 0 ? Math.round((healthyCount / totalSKUs) * 100) : 100;
    const imeiTrackedCount = products.filter(p => p.imeiTracking).length;

    return {
      totalSKUs,
      totalUnits,
      totalCostValuation,
      totalRetailValuation,
      grossMarginDollars,
      grossMarginPercent,
      lowStockCount,
      outOfStockCount,
      healthyCount,
      healthPercent,
      imeiTrackedCount,
    };
  }, [products]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Category filter (matches category or subcategories)
      if (selectedCategoryId !== 'all') {
        const matchingCatIds = new Set([
          selectedCategoryId,
          ...categories.filter(c => c.parentId === selectedCategoryId).map(c => c.id)
        ]);
        if (!matchingCatIds.has(p.categoryId)) return false;
      }

      // Brand filter
      if (selectedBrandId !== 'all') {
        if (p.brandId !== selectedBrandId) return false;
      }

      // Stock status filter
      if (statusFilter === 'instock' && p.currentStock <= p.alertQuantity) return false;
      if (statusFilter === 'low' && (p.currentStock <= 0 || p.currentStock > p.alertQuantity)) return false;
      if (statusFilter === 'out' && p.currentStock > 0) return false;
      if (statusFilter === 'imei' && !p.imeiTracking) return false;

      // Search term
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inName = p.name.toLowerCase().includes(q);
        const inSku = p.sku.toLowerCase().includes(q);
        const inBarcode = (p.barcode || '').includes(q);
        const inBrand = (p.brandName || '').toLowerCase().includes(q);
        const inCategory = (p.categoryName || '').toLowerCase().includes(q);
        return inName || inSku || inBarcode || inBrand || inCategory;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'stock_desc') return b.currentStock - a.currentStock;
      if (sortBy === 'stock_asc') return a.currentStock - b.currentStock;
      if (sortBy === 'val_desc') return (b.purchasePrice * b.currentStock) - (a.purchasePrice * a.currentStock);
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      if (sortBy === 'margin_desc') {
        const marginA = a.sellingPrice > 0 ? (a.sellingPrice - a.purchasePrice) / a.sellingPrice : 0;
        const marginB = b.sellingPrice > 0 ? (b.sellingPrice - b.purchasePrice) / b.sellingPrice : 0;
        return marginB - marginA;
      }
      return 0;
    });
  }, [products, categories, selectedCategoryId, selectedBrandId, statusFilter, searchQuery, sortBy]);

  const handleExportCSV = () => {
    const headers = [
      'Product Name',
      'SKU',
      'Barcode',
      'Category',
      'Brand',
      'Current Stock',
      'Unit',
      'Alert Level',
      'Stock Status',
      'Purchase Cost',
      'Selling Price',
      'Total Cost Valuation',
      'Total Retail Valuation',
      'Margin %',
      'IMEI Tracking'
    ];

    const rows = filteredProducts.map(p => {
      const status = p.currentStock <= 0 ? 'Out of Stock' : p.currentStock <= p.alertQuantity ? 'Low Stock' : 'In Stock';
      const margin = p.sellingPrice > 0 ? (((p.sellingPrice - p.purchasePrice) / p.sellingPrice) * 100).toFixed(1) : '0';
      return [
        `"${p.name}"`,
        `"${p.sku}"`,
        `"${p.barcode || ''}"`,
        `"${p.categoryName || ''}"`,
        `"${p.brandName || ''}"`,
        p.currentStock,
        p.unit,
        p.alertQuantity,
        status,
        p.purchasePrice.toFixed(2),
        p.sellingPrice.toFixed(2),
        (p.purchasePrice * p.currentStock).toFixed(2),
        (p.sellingPrice * p.currentStock).toFixed(2),
        `${margin}%`,
        p.imeiTracking ? 'Yes' : 'No'
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `warehouse_stock_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Standardized 6 NEB-UI-GOV-01 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Physical Stock</p>
            <Boxes className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl font-black text-slate-900 mt-1">{metrics.totalUnits.toLocaleString()}</p>
          <span className="text-[10px] font-bold text-blue-600 mt-1 block">Units across catalogue</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cost Valuation</p>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl font-black text-emerald-600 mt-1">
            {settings.currencySymbol}{metrics.totalCostValuation.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <span className="text-[10px] font-bold text-slate-400 mt-1 block">Inventory purchase cost</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Retail Valuation</p>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-xl font-black text-indigo-600 mt-1">
            {settings.currencySymbol}{metrics.totalRetailValuation.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <span className="text-[10px] font-bold text-indigo-600 mt-1 block">{metrics.grossMarginPercent.toFixed(1)}% Gross Margin</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Low Stock SKUs</p>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-black text-amber-600 mt-1">{metrics.lowStockCount}</p>
          <span className="text-[10px] font-bold text-amber-600 mt-1 block">Below alert threshold</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Out of Stock</p>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-xl font-black text-rose-600 mt-1">{metrics.outOfStockCount}</p>
          <span className="text-[10px] font-bold text-rose-600 mt-1 block">Immediate replenishment</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inventory Health</p>
            <CheckCircle2 className="w-4 h-4 text-cyan-500" />
          </div>
          <p className="text-xl font-black text-cyan-700 mt-1">{metrics.healthPercent}%</p>
          <span className="text-[10px] font-bold text-emerald-600 mt-1 block">{metrics.healthyCount} in-stock SKUs</span>
        </div>
      </div>

      {/* Filter & Action Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Search Box */}
          <div className="relative sm:col-span-2 lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search stock by product name, SKU, or barcode..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Location Selector */}
          <div>
            <select
              value={selectedLocationId}
              onChange={e => setSelectedLocationId(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 py-2 px-3 rounded-xl font-medium text-slate-700 focus:bg-white focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Locations ({locations.length})</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={selectedCategoryId}
              onChange={e => setSelectedCategoryId(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 py-2 px-3 rounded-xl font-medium text-slate-700 focus:bg-white focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.parentId && c.parentName ? `↳ ${c.parentName} → ${c.name}` : c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Dropdown */}
          <div>
            <select
              value={selectedBrandId}
              onChange={e => setSelectedBrandId(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 py-2 px-3 rounded-xl font-medium text-slate-700 focus:bg-white focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Brands ({brands.length})</option>
              {brands.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary Bar: Filter Pills, Sort & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          {/* Status Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Status:</span>
            {[
              { id: 'all', label: `All (${products.length})` },
              { id: 'instock', label: `Healthy (${metrics.healthyCount})` },
              { id: 'low', label: `Low Stock (${metrics.lowStockCount})` },
              { id: 'out', label: `Out of Stock (${metrics.outOfStockCount})` },
              { id: 'imei', label: `IMEI Tracked (${metrics.imeiTrackedCount})` },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id as any)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  statusFilter === f.id
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Sort & Export & Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="text-xs bg-slate-50 border border-slate-200 py-1.5 px-3 rounded-xl font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="stock_desc">Sort: Highest Stock</option>
              <option value="stock_asc">Sort: Lowest Stock</option>
              <option value="val_desc">Sort: Highest Valuation</option>
              <option value="margin_desc">Sort: Highest Margin</option>
              <option value="name_asc">Sort: Name (A-Z)</option>
            </select>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => {
                setPreselectedReceiveProductId(undefined);
                setIsReceiveModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-blue-200 transition-colors cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Receive Inbound Stock</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stock Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">SKU / Barcode</th>
                <th className="py-3 px-4">Product Details</th>
                <th className="py-3 px-4">Category & Brand</th>
                <th className="py-3 px-4">Unit Cost</th>
                <th className="py-3 px-4">Selling Price</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Alert Level</th>
                <th className="py-3 px-4">Stock Valuation</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Boxes className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-bold text-slate-700 text-sm">No inventory items found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try relaxing your search or status filters</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => {
                  const isOut = p.currentStock <= 0;
                  const isLow = !isOut && p.currentStock <= p.alertQuantity;
                  const stockVal = p.purchasePrice * p.currentStock;
                  const margin = p.sellingPrice > 0 ? (((p.sellingPrice - p.purchasePrice) / p.sellingPrice) * 100).toFixed(0) : '0';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* SKU & Barcode */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-800">{p.sku}</div>
                        {p.barcode && (
                          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                            <Barcode className="w-2.5 h-2.5" />
                            <span>{p.barcode}</span>
                          </div>
                        )}
                      </td>

                      {/* Product Name & Specs */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{p.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {p.imeiTracking && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                              IMEI TRACKED
                            </span>
                          )}
                          <span className="text-[11px] text-slate-400">{p.unit}</span>
                        </div>
                      </td>

                      {/* Category & Brand */}
                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-semibold">{p.categoryName || '—'}</div>
                        <div className="text-[11px] text-slate-400">{p.brandName || 'Generic'}</div>
                      </td>

                      {/* Cost */}
                      <td className="py-3 px-4 font-mono font-semibold text-slate-600">
                        {settings.currencySymbol}{p.purchasePrice.toFixed(2)}
                      </td>

                      {/* Price & Margin */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-900">
                          {settings.currencySymbol}{p.sellingPrice.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-emerald-600 font-bold">{margin}% margin</div>
                      </td>

                      {/* Stock Level Status */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-black font-mono ${
                              isOut
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : isLow
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                            }`}
                          >
                            {p.currentStock} {p.unit}
                          </span>
                        </div>
                        <div className="text-[10px] mt-0.5 font-bold">
                          {isOut ? (
                            <span className="text-rose-600">Out of Stock</span>
                          ) : isLow ? (
                            <span className="text-amber-600">Low Stock Alert</span>
                          ) : (
                            <span className="text-emerald-600">Healthy</span>
                          )}
                        </div>
                      </td>

                      {/* Alert Level */}
                      <td className="py-3 px-4 text-slate-500 font-mono">
                        {p.alertQuantity} {p.unit}
                      </td>

                      {/* Valuation */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {settings.currencySymbol}{stockVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Adjust */}
                          <button
                            onClick={() => setAdjustingProduct(p)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Adjust Stock Quantity"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Receive */}
                          <button
                            onClick={() => {
                              setPreselectedReceiveProductId(p.id);
                              setIsReceiveModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Receive Inbound Stock"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>

                          {/* Inspect Detail */}
                          <button
                            onClick={() => setViewingProduct(p)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="View Product Spec"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {adjustingProduct && (
        <StockAdjustmentModal
          isOpen={!!adjustingProduct}
          onClose={() => setAdjustingProduct(null)}
          product={adjustingProduct}
        />
      )}

      {isReceiveModalOpen && (
        <ReceiveStockModal
          isOpen={isReceiveModalOpen}
          onClose={() => {
            setIsReceiveModalOpen(false);
            setPreselectedReceiveProductId(undefined);
          }}
          preselectedProductId={preselectedReceiveProductId}
        />
      )}

      {viewingProduct && (
        <ProductDetailModal
          isOpen={!!viewingProduct}
          onClose={() => setViewingProduct(null)}
          product={viewingProduct}
          onAdjustStock={(p) => {
            setViewingProduct(null);
            setAdjustingProduct(p);
          }}
        />
      )}
    </div>
  );
};
