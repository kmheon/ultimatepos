import React, { useState, useEffect, useMemo } from 'react';
import { 
  Tag, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  ExternalLink, 
  MapPin, 
  Download, 
  LayoutGrid, 
  List, 
  Globe, 
  Building2,
  Package,
  TrendingUp,
  DollarSign,
  Layers,
  Sparkles,
  GitFork,
  CheckCircle,
  Filter
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { Brand } from '../../types';
import { AddEditBrandModal } from './AddEditBrandModal';
import { BrandProductsModal } from './BrandProductsModal';
import { AddProductModal } from '../products/AddProductModal';

// Brand Logo Badge with graceful fallback
const BrandLogoBadge: React.FC<{ 
  logo?: string; 
  name: string; 
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}> = ({ logo, name, size = 'md', onClick }) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [logo]);

  const sizeClasses = size === 'sm' ? 'w-8 h-8 rounded-lg text-xs' : size === 'lg' ? 'w-14 h-14 rounded-2xl text-base' : 'w-12 h-12 rounded-xl text-sm';

  if (logo && !imgError) {
    return (
      <div 
        onClick={onClick}
        className={`${sizeClasses} bg-white border border-slate-200/90 p-1 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden ${
          onClick ? 'cursor-pointer hover:ring-2 hover:ring-blue-400 hover:scale-105 transition-all' : ''
        }`}
        title={onClick ? `View ${name} products` : name}
      >
        <img
          src={logo}
          alt={name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className={`${sizeClasses} bg-linear-to-br from-blue-50 to-indigo-100/70 border border-blue-200/60 text-blue-700 flex items-center justify-center font-black shrink-0 shadow-2xs ${
        onClick ? 'cursor-pointer hover:ring-2 hover:ring-blue-400 hover:scale-105 transition-all' : ''
      }`}
      title={onClick ? `View ${name} products` : name}
    >
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
};

export const InventoryBrandsView: React.FC = () => {
  const { brands, products, settings, deleteBrand } = usePOS();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name_asc' | 'name_desc' | 'skus_desc' | 'val_desc' | 'margin_desc'>('name_asc');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'with_products' | 'empty'>('all');
  const [hierarchyFilter, setHierarchyFilter] = useState<'all' | 'parents' | 'subbrands'>('all');
  const [parentFilter, setParentFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

  // Modals
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [defaultParentIdForAdd, setDefaultParentIdForAdd] = useState<string | null>(null);
  const [viewingBrand, setViewingBrand] = useState<Brand | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [defaultBrandIdForProduct, setDefaultBrandIdForProduct] = useState<string | undefined>(undefined);

  // Computations for each brand
  const brandMetricsMap = useMemo(() => {
    const map: Record<string, { productCount: number; stockUnits: number; valuation: number; retailValuation: number; margin: number }> = {};
    
    brands.forEach(b => {
      const bProducts = products.filter(
        p => p.brandId === b.id || (p.brandName && p.brandName.toLowerCase() === b.name.toLowerCase())
      );
      const productCount = bProducts.length;
      const stockUnits = bProducts.reduce((sum, p) => sum + p.currentStock, 0);
      const valuation = bProducts.reduce((sum, p) => sum + (p.purchasePrice * p.currentStock), 0);
      const retailValuation = bProducts.reduce((sum, p) => sum + (p.sellingPrice * p.currentStock), 0);
      const margin = retailValuation > 0 ? ((retailValuation - valuation) / retailValuation) * 100 : 0;

      map[b.id] = { productCount, stockUnits, valuation, retailValuation, margin };
    });

    return map;
  }, [brands, products]);

  // Primary parent brands list (for dropdown filters)
  const primaryBrands = useMemo(() => {
    return brands.filter(b => !b.parentId);
  }, [brands]);

  // Sub-brands count by parentId
  const subBrandsMap = useMemo(() => {
    const map: Record<string, Brand[]> = {};
    brands.forEach(b => {
      if (b.parentId) {
        if (!map[b.parentId]) map[b.parentId] = [];
        map[b.parentId].push(b);
      }
    });
    return map;
  }, [brands]);

  // Overall Global Brand KPIs
  const globalMetrics = useMemo(() => {
    const totalBrands = brands.length;
    const parentCount = brands.filter(b => !b.parentId).length;
    const subBrandCount = brands.filter(b => !!b.parentId).length;
    let totalAssignedSKUs = 0;
    let totalStockUnits = 0;
    let totalValuation = 0;
    let totalRetail = 0;

    Object.values(brandMetricsMap).forEach(m => {
      totalAssignedSKUs += m.productCount;
      totalStockUnits += m.stockUnits;
      totalValuation += m.valuation;
      totalRetail += m.retailValuation;
    });

    const avgMargin = totalRetail > 0 ? ((totalRetail - totalValuation) / totalRetail) * 100 : 0;

    return {
      totalBrands,
      parentCount,
      subBrandCount,
      totalAssignedSKUs,
      totalStockUnits,
      totalValuation,
      avgMargin,
    };
  }, [brands, brandMetricsMap]);

  // Filter & Sort
  const filteredBrands = useMemo(() => {
    return brands.filter(b => {
      const m = brandMetricsMap[b.id] || { productCount: 0 };
      
      // Hierarchy Filter
      if (hierarchyFilter === 'parents' && b.parentId) return false;
      if (hierarchyFilter === 'subbrands' && !b.parentId) return false;

      // Specific Parent Filter
      if (parentFilter !== 'all') {
        // If parent selected, show parent itself and its children
        if (b.id !== parentFilter && b.parentId !== parentFilter) return false;
      }

      // Status Filter
      if (statusFilter === 'active' && b.status === 'inactive') return false;
      if (statusFilter === 'inactive' && b.status !== 'inactive') return false;
      if (statusFilter === 'with_products' && m.productCount === 0) return false;
      if (statusFilter === 'empty' && m.productCount > 0) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inName = b.name.toLowerCase().includes(q);
        const inDesc = (b.description || '').toLowerCase().includes(q);
        const inCountry = (b.country || '').toLowerCase().includes(q);
        const inParent = (b.parentName || '').toLowerCase().includes(q);
        return inName || inDesc || inCountry || inParent;
      }

      return true;
    }).sort((a, b) => {
      const mA = brandMetricsMap[a.id] || { productCount: 0, valuation: 0, margin: 0 };
      const mB = brandMetricsMap[b.id] || { productCount: 0, valuation: 0, margin: 0 };

      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
      if (sortBy === 'skus_desc') return mB.productCount - mA.productCount;
      if (sortBy === 'val_desc') return mB.valuation - mA.valuation;
      if (sortBy === 'margin_desc') return mB.margin - mA.margin;
      return 0;
    });
  }, [brands, brandMetricsMap, hierarchyFilter, parentFilter, statusFilter, searchQuery, sortBy]);

  const handleExportCSV = () => {
    const headers = ['Brand Name', 'Hierarchy', 'Parent Brand', 'Status', 'Country', 'Assigned SKUs', 'Stock Units', 'Valuation Cost', 'Retail Valuation', 'Margin %', 'Website'];
    const rows = filteredBrands.map(b => {
      const m = brandMetricsMap[b.id] || { productCount: 0, stockUnits: 0, valuation: 0, retailValuation: 0, margin: 0 };
      return [
        `"${b.name}"`,
        b.parentId ? 'Sub-brand' : 'Primary Brand',
        `"${b.parentName || 'None'}"`,
        b.status || 'active',
        `"${b.country || 'N/A'}"`,
        m.productCount,
        m.stockUnits,
        m.valuation.toFixed(2),
        m.retailValuation.toFixed(2),
        `${m.margin.toFixed(1)}%`,
        `"${b.website || ''}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `brands_catalog_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (b: Brand) => {
    const m = brandMetricsMap[b.id];
    const subBrands = subBrandsMap[b.id] || [];
    let confirmMsg = `Are you sure you want to delete "${b.name}"?`;
    if (subBrands.length > 0) {
      confirmMsg += ` It has ${subBrands.length} sub-brand(s) (${subBrands.map(sb => sb.name).join(', ')}). Their parent relationship will be unlinked.`;
    }
    if (m && m.productCount > 0) {
      confirmMsg += ` It is currently linked to ${m.productCount} product(s). The products will remain in your catalog with brand unassigned.`;
    }

    if (window.confirm(confirmMsg)) {
      deleteBrand(b.id);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* 5 Standardized NEB-UI-GOV-01 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Brands</p>
            <Tag className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{globalMetrics.totalBrands}</p>
          <span className="text-[10px] font-bold text-blue-600 mt-1 block">
            {globalMetrics.parentCount} Primary · {globalMetrics.subBrandCount} Sub-brands
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sub-Brands</p>
            <GitFork className="w-4 h-4 text-violet-500" />
          </div>
          <p className="text-2xl font-black text-violet-700 mt-1">{globalMetrics.subBrandCount}</p>
          <span className="text-[10px] font-bold text-slate-400 mt-1 block">Specialized child lines</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Products</p>
            <Package className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-1">{globalMetrics.totalAssignedSKUs} SKUs</p>
          <span className="text-[10px] font-bold text-slate-400 mt-1 block">
            {globalMetrics.totalStockUnits.toLocaleString()} total units
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Brand Stock Valuation</p>
            <DollarSign className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-purple-600 mt-1">
            {settings.currencySymbol}{globalMetrics.totalValuation.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <span className="text-[10px] font-bold text-slate-400 mt-1 block">Tied inventory cost</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Margin</p>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-indigo-600 mt-1">{globalMetrics.avgMargin.toFixed(1)}%</p>
          <span className="text-[10px] font-bold text-emerald-600 mt-1 block">Gross markup yield</span>
        </div>
      </div>

      {/* Control & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search brands, sub-brands, parent names, country..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter by Parent Brand */}
            <select
              value={parentFilter}
              onChange={e => setParentFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 py-2 px-3 rounded-xl font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Parent Families</option>
              {primaryBrands.map(pb => (
                <option key={pb.id} value={pb.id}>
                  Family: {pb.name}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="text-xs bg-slate-50 border border-slate-200 py-2 px-3 rounded-xl font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="name_asc">Sort: Brand Name (A-Z)</option>
              <option value="name_desc">Sort: Brand Name (Z-A)</option>
              <option value="skus_desc">Sort: Most Products</option>
              <option value="val_desc">Sort: Highest Valuation</option>
              <option value="margin_desc">Sort: Highest Margin</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'cards' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            {/* Add Brand */}
            <button
              onClick={() => {
                setEditingBrand(null);
                setDefaultParentIdForAdd(null);
                setIsAddEditOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-blue-200 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Brand</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-between gap-2 flex-wrap pt-2 border-t border-slate-100">
          {/* Hierarchy Filter Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Hierarchy:</span>
            {[
              { id: 'all', label: `All Brands (${brands.length})` },
              { id: 'parents', label: `Primary Brands (${globalMetrics.parentCount})` },
              { id: 'subbrands', label: `Sub-brands (${globalMetrics.subBrandCount})` },
            ].map(h => (
              <button
                key={h.id}
                onClick={() => setHierarchyFilter(h.id as any)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  hierarchyFilter === h.id
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {h.label}
              </button>
            ))}
          </div>

          {/* Status Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Status:</span>
            {[
              { id: 'all', label: 'All Status' },
              { id: 'active', label: 'Active' },
              { id: 'inactive', label: 'Inactive' },
              { id: 'with_products', label: 'With Products' },
              { id: 'empty', label: 'No SKUs' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id as any)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  statusFilter === f.id
                    ? 'bg-slate-800 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Brands Content */}
      {filteredBrands.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-2xs">
          <Tag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-800">No brands match your filter</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords, parent brand filter, or add a new brand/sub-brand to your catalog.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setHierarchyFilter('all');
              setParentFilter('all');
            }}
            className="mt-4 px-4 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredBrands.map(b => {
            const m = brandMetricsMap[b.id] || { productCount: 0, stockUnits: 0, valuation: 0, retailValuation: 0, margin: 0 };
            const subBrands = subBrandsMap[b.id] || [];
            const isSubBrand = !!b.parentId;

            return (
              <div
                key={b.id}
                className={`bg-white rounded-2xl border p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between ${
                  isSubBrand
                    ? 'border-violet-200/80 hover:border-violet-300 bg-linear-to-b from-white to-violet-50/20'
                    : 'border-slate-200 hover:border-blue-200'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <BrandLogoBadge 
                        logo={b.logo} 
                        name={b.name} 
                        size="md" 
                        onClick={() => setViewingBrand(b)} 
                      />
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-slate-900 text-sm">{b.name}</h4>
                          {isSubBrand ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-violet-100 text-violet-700 flex items-center gap-0.5">
                              <GitFork className="w-2.5 h-2.5" /> Sub-brand
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-700">
                              Primary
                            </span>
                          )}
                        </div>
                        
                        {/* Parent brand indicator for sub-brands */}
                        {isSubBrand && b.parentName && (
                          <p className="text-[11px] font-medium text-violet-600 flex items-center gap-1 mt-0.5">
                            <span>↳ Parent:</span>
                            <span className="font-bold underline cursor-pointer" onClick={() => setParentFilter(b.parentId!)}>
                              {b.parentName}
                            </span>
                          </p>
                        )}

                        <div className="flex items-center gap-1.5 mt-0.5">
                          {b.country && (
                            <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                              <MapPin className="w-2.5 h-2.5 text-slate-400" />
                              {b.country}
                            </span>
                          )}
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                              b.status === 'inactive' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            {b.status === 'inactive' ? 'Inactive' : 'Active'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingBrand(b);
                          setDefaultParentIdForAdd(null);
                          setIsAddEditOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Brand"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(b)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Brand"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Sub-brands tag pills if this is a parent brand */}
                  {!isSubBrand && (
                    <div className="mb-3 flex items-center justify-between gap-1 p-2 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <GitFork className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0">Sub-brands:</span>
                        {subBrands.length > 0 ? (
                          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                            {subBrands.map(sb => (
                              <span
                                key={sb.id}
                                className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-200 whitespace-nowrap"
                              >
                                {sb.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">None registered</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingBrand(null);
                          setDefaultParentIdForAdd(b.id);
                          setIsAddEditOpen(true);
                        }}
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-700 shrink-0 hover:underline cursor-pointer"
                        title="Add sub-brand to this brand"
                      >
                        + Add Sub
                      </button>
                    </div>
                  )}

                  {b.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                      {b.description}
                    </p>
                  )}

                  {/* Metrics Bar */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs mb-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Products</span>
                      <span className="font-bold text-slate-800">{m.productCount} SKUs</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">In Stock</span>
                      <span className="font-bold text-slate-800">{m.stockUnits} units</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Valuation</span>
                      <span className="font-bold text-purple-700">
                        {settings.currencySymbol}{m.valuation.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Margin</span>
                      <span className="font-bold text-emerald-600">{m.margin.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  {b.website ? (
                    <a
                      href={b.website.startsWith('http') ? b.website : `https://${b.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-medium"
                    >
                      <Globe className="w-3 h-3" />
                      <span>Website</span>
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-400">Standard Partner</span>
                  )}

                  <button
                    onClick={() => setViewingBrand(b)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View SKUs ({m.productCount})</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Brand & Logo</th>
                  <th className="py-3 px-4">Hierarchy</th>
                  <th className="py-3 px-4">Country</th>
                  <th className="py-3 px-4">Catalog SKUs</th>
                  <th className="py-3 px-4">In-Stock Units</th>
                  <th className="py-3 px-4">Inventory Valuation</th>
                  <th className="py-3 px-4">Avg Margin</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredBrands.map(b => {
                  const m = brandMetricsMap[b.id] || { productCount: 0, stockUnits: 0, valuation: 0, retailValuation: 0, margin: 0 };
                  const subBrands = subBrandsMap[b.id] || [];
                  const isSubBrand = !!b.parentId;

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <BrandLogoBadge 
                            logo={b.logo} 
                            name={b.name} 
                            size="sm" 
                            onClick={() => setViewingBrand(b)}
                          />
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{b.name}</span>
                            </div>
                            {b.description && (
                              <div className="text-[11px] text-slate-400 truncate max-w-xs">{b.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {isSubBrand ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-200">
                            <GitFork className="w-3 h-3" /> Sub-brand of {b.parentName || 'Parent'}
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              Primary
                            </span>
                            {subBrands.length > 0 && (
                              <span className="text-[10px] font-bold text-slate-400">
                                ({subBrands.length} sub-brands)
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">{b.country || 'Global'}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900">{m.productCount}</span> SKUs
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900">{m.stockUnits}</span> units
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {settings.currencySymbol}{m.valuation.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>
                      <td className="py-3 px-4 text-emerald-600 font-bold font-mono">
                        {m.margin.toFixed(1)}%
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            b.status === 'inactive' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {b.status === 'inactive' ? 'Inactive' : 'Active'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isSubBrand && (
                            <button
                              onClick={() => {
                                setEditingBrand(null);
                                setDefaultParentIdForAdd(b.id);
                                setIsAddEditOpen(true);
                              }}
                              className="p-1.5 text-violet-600 hover:bg-violet-50 rounded-lg transition-colors cursor-pointer"
                              title="Add Sub-brand to this Brand"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setViewingBrand(b)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Inspect Products"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingBrand(b);
                              setDefaultParentIdForAdd(null);
                              setIsAddEditOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Brand"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(b)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Brand"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Brand Modal */}
      {isAddEditOpen && (
        <AddEditBrandModal
          isOpen={isAddEditOpen}
          onClose={() => {
            setIsAddEditOpen(false);
            setEditingBrand(null);
            setDefaultParentIdForAdd(null);
          }}
          brandToEdit={editingBrand}
          defaultParentId={defaultParentIdForAdd}
        />
      )}

      {/* View Brand Products Modal */}
      {viewingBrand && (
        <BrandProductsModal
          isOpen={!!viewingBrand}
          onClose={() => setViewingBrand(null)}
          brand={viewingBrand}
          onAddProductForBrand={brandId => {
            setDefaultBrandIdForProduct(brandId);
            setIsAddProductOpen(true);
          }}
        />
      )}

      {/* Add Product Modal (if user clicks to add product for brand) */}
      {isAddProductOpen && (
        <AddProductModal
          isOpen={isAddProductOpen}
          onClose={() => {
            setIsAddProductOpen(false);
            setDefaultBrandIdForProduct(undefined);
          }}
          defaultBrandId={defaultBrandIdForProduct}
        />
      )}
    </div>
  );
};
