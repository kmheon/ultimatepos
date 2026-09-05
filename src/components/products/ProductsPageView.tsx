import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  SlidersHorizontal, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  Layers, 
  ShoppingCart, 
  DollarSign,
  Eye,
  Printer,
  Barcode,
  Boxes,
  Tag,
  CheckCircle2,
  TrendingUp,
  Download,
  LayoutGrid,
  List,
  ArrowUpDown,
  Filter,
  ShieldCheck,
  CheckSquare,
  Square,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { Product } from '../../types';
import { NebulaStatGrid } from '../../core/ui/components/dashboard/NebulaStatGrid';
import { NebulaStatCard } from '../../core/ui/components/dashboard/NebulaStatCard';
import { AddProductModal } from './AddProductModal';
import { StockAdjustmentModal } from './StockAdjustmentModal';
import { ProductDetailModal } from './ProductDetailModal';
import { ProductBarcodeModal } from './ProductBarcodeModal';

type StockFilter = 'all' | 'instock' | 'low' | 'out' | 'imei';
type ViewMode = 'table' | 'grid';
type SortOption = 'name_asc' | 'name_desc' | 'stock_desc' | 'stock_asc' | 'price_desc' | 'price_asc' | 'margin_desc';

export const ProductsPageView: React.FC = () => {
  const { products, categories, brands, deleteProduct, addToCart, settings, setActiveTab } = usePOS();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name_asc');
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // Multi-Selection for Bulk Actions
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Modals State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [barcodeProduct, setBarcodeProduct] = useState<Product | null>(null);

  // Filter and Sort Logic
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Category filter
      if (categoryFilter !== 'all' && p.categoryId !== categoryFilter) return false;

      // Brand filter
      if (brandFilter !== 'all' && p.brandId !== brandFilter) return false;

      // Stock status filter
      if (stockFilter === 'instock' && p.currentStock <= p.alertQuantity) return false;
      if (stockFilter === 'low' && (p.currentStock <= 0 || p.currentStock > p.alertQuantity)) return false;
      if (stockFilter === 'out' && p.currentStock > 0) return false;
      if (stockFilter === 'imei' && !p.imeiTracking) return false;

      // Search term filter
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;

      const inName = p.name.toLowerCase().includes(q);
      const inSku = p.sku.toLowerCase().includes(q);
      const inBarcode = p.barcode.includes(q);
      const inBrand = (p.brandName || '').toLowerCase().includes(q);
      const inCategory = (p.categoryName || '').toLowerCase().includes(q);
      const inSerials = (p.serialNumbers || []).some(s => s.toLowerCase().includes(q));

      return inName || inSku || inBarcode || inBrand || inCategory || inSerials;
    }).sort((a, b) => {
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
      if (sortBy === 'stock_desc') return b.currentStock - a.currentStock;
      if (sortBy === 'stock_asc') return a.currentStock - b.currentStock;
      if (sortBy === 'price_desc') return b.sellingPrice - a.sellingPrice;
      if (sortBy === 'price_asc') return a.sellingPrice - b.sellingPrice;
      if (sortBy === 'margin_desc') {
        const marginA = a.sellingPrice > 0 ? ((a.sellingPrice - a.purchasePrice) / a.sellingPrice) : 0;
        const marginB = b.sellingPrice > 0 ? ((b.sellingPrice - b.purchasePrice) / b.sellingPrice) : 0;
        return marginB - marginA;
      }
      return 0;
    });
  }, [products, categoryFilter, brandFilter, stockFilter, searchQuery, sortBy]);

  // Aggregate Metrics for NEB-UI-GOV-01 Grid
  const metrics = useMemo(() => {
    const totalCount = products.length;
    const totalCostValuation = products.reduce((sum, p) => sum + (p.purchasePrice * p.currentStock), 0);
    const totalRetailValuation = products.reduce((sum, p) => sum + (p.sellingPrice * p.currentStock), 0);
    const totalUnits = products.reduce((sum, p) => sum + p.currentStock, 0);
    const lowStockCount = products.filter(p => p.currentStock > 0 && p.currentStock <= p.alertQuantity).length;
    const outOfStockCount = products.filter(p => p.currentStock <= 0).length;
    const imeiTrackedCount = products.filter(p => p.imeiTracking).length;

    return {
      totalCount,
      totalCostValuation,
      totalRetailValuation,
      totalUnits,
      lowStockCount,
      outOfStockCount,
      imeiTrackedCount,
    };
  }, [products]);

  // Bulk Selection Handlers
  const handleSelectAll = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map(p => p.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedProductIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // CSV Export
  const handleExportCSV = () => {
    const itemsToExport = selectedProductIds.length > 0
      ? products.filter(p => selectedProductIds.includes(p.id))
      : filteredProducts;

    if (itemsToExport.length === 0) return;

    const headers = ['Product Name', 'SKU', 'Barcode', 'Category', 'Brand', 'Cost Price', 'Selling Price', 'Margin %', 'Stock Level', 'Unit', 'Status'];
    const rows = itemsToExport.map(p => {
      const margin = p.sellingPrice > 0
        ? (((p.sellingPrice - p.purchasePrice) / p.sellingPrice) * 100).toFixed(1)
        : '0';
      const status = p.currentStock <= 0 ? 'Out of Stock' : p.currentStock <= p.alertQuantity ? 'Low Stock' : 'Optimal';

      return [
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.sku}"`,
        `"${p.barcode}"`,
        `"${p.categoryName || ''}"`,
        `"${p.brandName || ''}"`,
        p.purchasePrice.toFixed(2),
        p.sellingPrice.toFixed(2),
        margin,
        p.currentStock,
        `"${p.unit}"`,
        `"${status}"`
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `nebula_products_catalog_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Bulk Delete
  const handleBulkDelete = () => {
    if (selectedProductIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedProductIds.length} selected products?`)) {
      selectedProductIds.forEach(id => deleteProduct(id));
      setSelectedProductIds([]);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50">
      {/* 1. Standardized Responsive KPI Metrics Row (NEB-UI-GOV-01) */}
      <NebulaStatGrid>
        <NebulaStatCard
          label="Catalog SKUs"
          value={`${metrics.totalCount} Products`}
          statusText={`Across ${categories.length} store categories`}
          icon={Package}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-50"
        />

        <NebulaStatCard
          label="Inventory Cost Valuation"
          value={`${settings.currencySymbol}${metrics.totalCostValuation.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          statusText={`Retail potential: ${settings.currencySymbol}${metrics.totalRetailValuation.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          icon={DollarSign}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-50"
        />

        <NebulaStatCard
          label="In-Stock Units"
          value={`${metrics.totalUnits.toLocaleString()} Units`}
          statusText="Total active warehouse inventory"
          icon={Boxes}
          iconColor="text-emerald-600"
          iconBgColor="bg-emerald-50"
        />

        <NebulaStatCard
          label="Low Stock Restock Alerts"
          value={`${metrics.lowStockCount} Items`}
          statusText="Below reorder threshold"
          icon={AlertTriangle}
          iconColor="text-amber-600"
          iconBgColor="bg-amber-50"
          statusColor="text-amber-600"
        />

        <NebulaStatCard
          label="Stockouts / Depleted"
          value={`${metrics.outOfStockCount} Items`}
          statusText="Immediate purchase required"
          icon={Boxes}
          iconColor="text-rose-600"
          iconBgColor="bg-rose-50"
          statusColor="text-rose-600"
        />
      </NebulaStatGrid>

      {/* 2. Controls, Search, and Filtering Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 space-y-4">
        {/* Top Controls Row: Status Pills & Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Status Quick Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/50">
            <button
              onClick={() => setStockFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                stockFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Products ({products.length})
            </button>

            <button
              onClick={() => setStockFilter('instock')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                stockFilter === 'instock'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              In Stock ({products.length - metrics.lowStockCount - metrics.outOfStockCount})
            </button>

            <button
              onClick={() => setStockFilter('low')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                stockFilter === 'low'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Low Stock ({metrics.lowStockCount})
            </button>

            <button
              onClick={() => setStockFilter('out')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                stockFilter === 'out'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Out of Stock ({metrics.outOfStockCount})
            </button>

            {metrics.imeiTrackedCount > 0 && (
              <button
                onClick={() => setStockFilter('imei')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  stockFilter === 'imei'
                    ? 'bg-white text-purple-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Serials ({metrics.imeiTrackedCount})
              </button>
            )}
          </div>

          {/* Primary Actions & View Toggles */}
          <div className="flex items-center gap-2.5">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/60">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Grid / Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              title="Export Products as CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            {/* New Product Button */}
            <button
              onClick={() => {
                setEditingProduct(null);
                setIsAddOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer shadow-blue-200 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Bottom Controls Row: Search & Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1 border-t border-slate-100">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search product, SKU, barcode..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all font-medium text-slate-800"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 py-2 px-3 rounded-xl font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Dropdown */}
          <div>
            <select
              value={brandFilter}
              onChange={e => setBrandFilter(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 py-2 px-3 rounded-xl font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="all">All Brands ({brands.length})</option>
              {brands.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sorting Dropdown */}
          <div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              className="w-full text-xs bg-slate-50 border border-slate-200 py-2 px-3 rounded-xl font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="name_asc">Sort: Name (A to Z)</option>
              <option value="name_desc">Sort: Name (Z to A)</option>
              <option value="stock_desc">Sort: Stock (High to Low)</option>
              <option value="stock_asc">Sort: Stock (Low to High)</option>
              <option value="price_desc">Sort: Price (High to Low)</option>
              <option value="price_asc">Sort: Price (Low to High)</option>
              <option value="margin_desc">Sort: Margin % (High to Low)</option>
            </select>
          </div>
        </div>

        {/* Multi-Selection Action Toolbar (appears when items are selected) */}
        {selectedProductIds.length > 0 && (
          <div className="flex items-center justify-between p-2.5 bg-blue-50/80 border border-blue-200 rounded-xl text-xs">
            <span className="font-bold text-blue-900">
              {selectedProductIds.length} of {filteredProducts.length} products selected
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="px-2.5 py-1 bg-white hover:bg-blue-100 text-blue-700 font-bold rounded-lg border border-blue-200 transition-colors cursor-pointer"
              >
                Export Selected
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedProductIds([])}
                className="px-2 py-1 text-slate-500 hover:text-slate-800 text-[11px] font-semibold"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Products List / Grid Container */}
      {viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedProductIds.length > 0 && selectedProductIds.length === filteredProducts.length}
                      onChange={handleSelectAll}
                      className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  <th className="py-3.5 px-4">Product Info</th>
                  <th className="py-3.5 px-4">SKU / Barcode</th>
                  <th className="py-3.5 px-4">Category & Brand</th>
                  <th className="py-3.5 px-4 text-right">Cost Price</th>
                  <th className="py-3.5 px-4 text-right">Selling Price</th>
                  <th className="py-3.5 px-4 text-right">Gross Margin</th>
                  <th className="py-3.5 px-4 text-center">Stock Level</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center text-slate-400">
                      <Package className="w-12 h-12 mx-auto mb-3 text-slate-300 stroke-[1.5]" />
                      <p className="font-bold text-sm text-slate-700">No products found matching filters</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        Try clearing your search query or reset category/stock filters to view all catalog items.
                      </p>
                      {(searchQuery || categoryFilter !== 'all' || brandFilter !== 'all' || stockFilter !== 'all') && (
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setCategoryFilter('all');
                            setBrandFilter('all');
                            setStockFilter('all');
                          }}
                          className="mt-4 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          Clear All Filters
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(p => {
                    const margin = p.sellingPrice > 0
                      ? (((p.sellingPrice - p.purchasePrice) / p.sellingPrice) * 100).toFixed(1)
                      : '0';
                    const isLow = p.currentStock <= p.alertQuantity && p.currentStock > 0;
                    const isOut = p.currentStock <= 0;
                    const isSelected = selectedProductIds.includes(p.id);

                    return (
                      <tr 
                        key={p.id} 
                        className={`hover:bg-slate-50/90 transition-colors ${
                          isSelected ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(p.id)}
                            className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>

                        {/* Product Info with Thumbnail */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div 
                              onClick={() => setViewingProduct(p)}
                              className="w-11 h-11 rounded-xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center border border-slate-200 cursor-pointer hover:opacity-90 transition-opacity"
                            >
                              {p.image ? (
                                <img
                                  src={p.image}
                                  alt={p.name}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="w-5 h-5 text-slate-300" />
                              )}
                            </div>
                            <div>
                              <button
                                onClick={() => setViewingProduct(p)}
                                className="font-bold text-slate-900 hover:text-blue-600 text-left line-clamp-1 transition-colors cursor-pointer"
                              >
                                {p.name}
                              </button>
                              <div className="flex items-center gap-2 mt-0.5">
                                {p.brandName && (
                                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                                    {p.brandName}
                                  </span>
                                )}
                                {p.imeiTracking && (
                                  <span className="px-1.5 py-0.2 bg-purple-50 text-purple-700 text-[9px] font-bold rounded border border-purple-200">
                                    IMEI
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* SKU & Barcode */}
                        <td className="py-3 px-4 font-mono">
                          <div className="text-slate-900 font-bold">{p.sku}</div>
                          <button
                            onClick={() => setBarcodeProduct(p)}
                            className="text-[10px] text-slate-400 hover:text-blue-600 flex items-center gap-1 transition-colors mt-0.5 cursor-pointer"
                            title="Print Barcode Tag"
                          >
                            <Barcode className="w-3 h-3" />
                            <span>{p.barcode}</span>
                          </button>
                        </td>

                        {/* Category & Brand */}
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium text-[11px] border border-slate-200/60 inline-block">
                            {p.categoryName || 'General'}
                          </span>
                        </td>

                        {/* Cost Price */}
                        <td className="py-3 px-4 text-right font-medium text-slate-600">
                          {settings.currencySymbol}{p.purchasePrice.toFixed(2)}
                        </td>

                        {/* Selling Price */}
                        <td className="py-3 px-4 text-right font-black text-slate-900">
                          {settings.currencySymbol}{p.sellingPrice.toFixed(2)}
                        </td>

                        {/* Gross Profit Margin */}
                        <td className="py-3 px-4 text-right">
                          <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded text-[11px]">
                            {margin}%
                          </span>
                        </td>

                        {/* Stock Level */}
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span
                              className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                                isOut
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : isLow
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              {p.currentStock} {p.unit}
                            </span>
                            {isLow && (
                              <span className="text-[9px] text-amber-600 font-bold mt-0.5">
                                Alert ≤ {p.alertQuantity}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {/* View Details */}
                            <button
                              onClick={() => setViewingProduct(p)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="View Master Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Add to POS */}
                            <button
                              onClick={() => {
                                addToCart(p, 1);
                                setActiveTab('pos');
                              }}
                              className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Add to POS Cart"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                            </button>

                            {/* Quick Adjust Stock */}
                            <button
                              onClick={() => setAdjustingProduct(p)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                              title="Adjust Stock Level"
                            >
                              <SlidersHorizontal className="w-3.5 h-3.5" />
                            </button>

                            {/* Print Barcode */}
                            <button
                              onClick={() => setBarcodeProduct(p)}
                              className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                              title="Print Barcode"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setIsAddOpen(true);
                              }}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Product"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete "${p.name}"?`)) {
                                  deleteProduct(p.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
      ) : (
        /* GRID / CARDS VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-16 text-center text-slate-400">
              <Package className="w-12 h-12 mx-auto mb-3 text-slate-300 stroke-[1.5]" />
              <p className="font-bold text-sm text-slate-700">No products found matching filters</p>
            </div>
          ) : (
            filteredProducts.map(p => {
              const isLow = p.currentStock <= p.alertQuantity && p.currentStock > 0;
              const isOut = p.currentStock <= 0;
              const margin = p.sellingPrice > 0
                ? (((p.sellingPrice - p.purchasePrice) / p.sellingPrice) * 100).toFixed(1)
                : '0';

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    {/* Card Image Area */}
                    <div 
                      onClick={() => setViewingProduct(p)}
                      className="relative h-44 bg-slate-100 overflow-hidden cursor-pointer"
                    >
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Package className="w-12 h-12 stroke-[1.5]" />
                        </div>
                      )}

                      {/* Stock Badge */}
                      <div className="absolute top-2.5 right-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider shadow-xs ${
                            isOut
                              ? 'bg-rose-600 text-white'
                              : isLow
                              ? 'bg-amber-500 text-white'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : `${p.currentStock} ${p.unit}`}
                        </span>
                      </div>

                      {/* Category Tag */}
                      <div className="absolute bottom-2.5 left-2.5">
                        <span className="px-2 py-0.5 bg-slate-900/70 backdrop-blur-xs text-white rounded-md text-[10px] font-semibold">
                          {p.categoryName || 'General'}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <h4 
                          onClick={() => setViewingProduct(p)}
                          className="font-bold text-sm text-slate-900 hover:text-blue-600 line-clamp-1 cursor-pointer transition-colors"
                        >
                          {p.name}
                        </h4>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                        <span>{p.sku}</span>
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                          {margin}% margin
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between pt-1 border-t border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Cost</span>
                          <span className="text-xs font-semibold text-slate-600">
                            {settings.currencySymbol}{p.purchasePrice.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block font-medium">Retail</span>
                          <span className="text-base font-black text-blue-600">
                            {settings.currencySymbol}{p.sellingPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Quick Actions */}
                  <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-1">
                    <button
                      onClick={() => setViewingProduct(p)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                      title="Inspect Product"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setBarcodeProduct(p)}
                      className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                      title="Print Barcode Tag"
                    >
                      <Barcode className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setAdjustingProduct(p)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                      title="Adjust Stock"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingProduct(p);
                        setIsAddOpen(true);
                      }}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                      title="Edit Product"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        addToCart(p, 1);
                        setActiveTab('pos');
                      }}
                      className="ml-auto flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
                    >
                      <ShoppingCart className="w-3 h-3" />
                      <span>Sell</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 4. Modals */}
      {/* Add / Edit Product Modal */}
      <AddProductModal
        isOpen={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          setEditingProduct(null);
        }}
        productToEdit={editingProduct}
      />

      {/* Quick Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={Boolean(adjustingProduct)}
        onClose={() => setAdjustingProduct(null)}
        product={adjustingProduct}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        isOpen={Boolean(viewingProduct)}
        onClose={() => setViewingProduct(null)}
        product={viewingProduct}
        onEdit={p => {
          setViewingProduct(null);
          setEditingProduct(p);
          setIsAddOpen(true);
        }}
        onAdjustStock={p => {
          setViewingProduct(null);
          setAdjustingProduct(p);
        }}
        onPrintBarcode={p => {
          setViewingProduct(null);
          setBarcodeProduct(p);
        }}
      />

      {/* Barcode Printing Modal */}
      <ProductBarcodeModal
        isOpen={Boolean(barcodeProduct)}
        onClose={() => setBarcodeProduct(null)}
        product={barcodeProduct}
      />
    </div>
  );
};

export default ProductsPageView;
