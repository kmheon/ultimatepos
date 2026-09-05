import React, { useState, useMemo } from 'react';
import { 
  Layers, 
  Plus, 
  Folder, 
  Trash2, 
  Edit3, 
  Search, 
  Boxes, 
  Eye, 
  DollarSign, 
  Download, 
  LayoutGrid, 
  List, 
  Package, 
  CheckCircle2, 
  Sparkles,
  ArrowUpDown,
  Filter,
  AlertCircle,
  FolderTree,
  CornerDownRight,
  GitFork,
  ArrowRight
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { Category, Product } from '../../types';
import { NebulaStatGrid } from '../../core/ui/components/dashboard/NebulaStatGrid';
import { NebulaStatCard } from '../../core/ui/components/dashboard/NebulaStatCard';
import { AddEditCategoryModal } from './AddEditCategoryModal';
import { CategoryProductsModal } from './CategoryProductsModal';
import { ProductDetailModal } from '../products/ProductDetailModal';
import { AddProductModal } from '../products/AddProductModal';
import { StockAdjustmentModal } from '../products/StockAdjustmentModal';
import { ProductBarcodeModal } from '../products/ProductBarcodeModal';

type CategoryFilter = 'all' | 'root_only' | 'subcategories_only' | 'with_products' | 'empty';
type ViewMode = 'grid' | 'table';
type SortOption = 'hierarchy' | 'name_asc' | 'name_desc' | 'products_desc' | 'products_asc' | 'valuation_desc';

export const InventoryCategoriesView: React.FC = () => {
  const { categories, products, deleteCategory, settings } = usePOS();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<CategoryFilter>('all');
  const [parentFilter, setParentFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('hierarchy');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Modals
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [modalDefaultParentId, setModalDefaultParentId] = useState<string | null>(null);
  const [inspectingCategory, setInspectingCategory] = useState<Category | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  // Product Inspection Modals
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [barcodeProduct, setBarcodeProduct] = useState<Product | null>(null);

  // Subcategories mapping
  const { childrenMap, rootCategories, subcategoriesCount } = useMemo(() => {
    const map: Record<string, Category[]> = {};
    let subCount = 0;

    categories.forEach(cat => {
      if (cat.parentId) {
        subCount++;
        if (!map[cat.parentId]) map[cat.parentId] = [];
        map[cat.parentId].push(cat);
      }
    });

    const roots = categories.filter(c => !c.parentId);

    return {
      childrenMap: map,
      rootCategories: roots,
      subcategoriesCount: subCount,
    };
  }, [categories]);

  // Category Aggregates Map
  const categoryStats = useMemo(() => {
    const statsMap: Record<string, { count: number; units: number; costValuation: number; retailValuation: number }> = {};

    categories.forEach(cat => {
      statsMap[cat.id] = { count: 0, units: 0, costValuation: 0, retailValuation: 0 };
    });

    products.forEach(p => {
      if (p.categoryId && statsMap[p.categoryId]) {
        statsMap[p.categoryId].count += 1;
        statsMap[p.categoryId].units += p.currentStock;
        statsMap[p.categoryId].costValuation += (p.purchasePrice * p.currentStock);
        statsMap[p.categoryId].retailValuation += (p.sellingPrice * p.currentStock);
      }
    });

    return statsMap;
  }, [categories, products]);

  // Overall Metrics for NEB-UI-GOV-01 KPI Grid
  const metrics = useMemo(() => {
    const totalCategories = categories.length;
    const rootCount = rootCategories.length;
    const subCount = subcategoriesCount;
    const assignedProductsCount = products.filter(p => p.categoryId).length;
    const totalInventoryUnits = products.reduce((sum, p) => sum + (p.categoryId ? p.currentStock : 0), 0);
    const totalValuation = products.reduce((sum, p) => sum + (p.categoryId ? (p.purchasePrice * p.currentStock) : 0), 0);
    const emptyCategoriesCount = categories.filter(c => (categoryStats[c.id]?.count || 0) === 0).length;

    return {
      totalCategories,
      rootCount,
      subCount,
      assignedProductsCount,
      totalInventoryUnits,
      totalValuation,
      emptyCategoriesCount,
    };
  }, [categories, rootCategories.length, subcategoriesCount, products, categoryStats]);

  // Filtered & Sorted Categories
  const filteredCategories = useMemo(() => {
    return categories.filter(cat => {
      const stats = categoryStats[cat.id] || { count: 0, units: 0, costValuation: 0, retailValuation: 0 };

      // Hierarchy filter type
      if (filterType === 'root_only' && cat.parentId) return false;
      if (filterType === 'subcategories_only' && !cat.parentId) return false;
      if (filterType === 'with_products' && stats.count === 0) return false;
      if (filterType === 'empty' && stats.count > 0) return false;

      // Parent filter dropdown
      if (parentFilter !== 'all') {
        if (cat.parentId !== parentFilter && cat.id !== parentFilter) return false;
      }

      // Search Query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const inName = cat.name.toLowerCase().includes(q);
      const inCode = (cat.shortCode || '').toLowerCase().includes(q);
      const inDesc = (cat.description || '').toLowerCase().includes(q);
      const inParent = (cat.parentName || '').toLowerCase().includes(q);

      return inName || inCode || inDesc || inParent;
    }).sort((a, b) => {
      const statsA = categoryStats[a.id] || { count: 0, units: 0, costValuation: 0, retailValuation: 0 };
      const statsB = categoryStats[b.id] || { count: 0, units: 0, costValuation: 0, retailValuation: 0 };

      if (sortBy === 'hierarchy') {
        // Roots first, subcategories immediately under their parent
        const parentA = a.parentId ? a.parentId : a.id;
        const parentB = b.parentId ? b.parentId : b.id;
        if (parentA !== parentB) {
          const parentCatA = categories.find(c => c.id === parentA);
          const parentCatB = categories.find(c => c.id === parentB);
          return (parentCatA?.name || '').localeCompare(parentCatB?.name || '');
        }
        // If same parent group, root comes before subcategory
        if (!a.parentId && b.parentId) return -1;
        if (a.parentId && !b.parentId) return 1;
        return a.name.localeCompare(b.name);
      }

      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
      if (sortBy === 'products_desc') return statsB.count - statsA.count;
      if (sortBy === 'products_asc') return statsA.count - statsB.count;
      if (sortBy === 'valuation_desc') return statsB.costValuation - statsA.costValuation;
      return 0;
    });
  }, [categories, categoryStats, filterType, parentFilter, searchQuery, sortBy]);

  // Open Add Category Modal
  const handleOpenAddCategory = (parentId: string | null = null) => {
    setCategoryToEdit(null);
    setModalDefaultParentId(parentId);
    setIsAddEditOpen(true);
  };

  // Open Edit Category Modal
  const handleOpenEditCategory = (cat: Category) => {
    setCategoryToEdit(cat);
    setModalDefaultParentId(cat.parentId || null);
    setIsAddEditOpen(true);
  };

  // CSV Export with Hierarchy
  const handleExportCSV = () => {
    if (categories.length === 0) return;

    const headers = ['Category Name', 'Short Code', 'Parent Category', 'Is Subcategory', 'Assigned SKUs', 'Inventory Units', 'Cost Valuation', 'Description'];
    const rows = filteredCategories.map(cat => {
      const stats = categoryStats[cat.id] || { count: 0, units: 0, costValuation: 0, retailValuation: 0 };
      const isSub = Boolean(cat.parentId);
      const parentName = cat.parentName || (cat.parentId ? categories.find(c => c.id === cat.parentId)?.name : '') || 'None (Root)';

      return [
        `"${cat.name.replace(/"/g, '""')}"`,
        `"${cat.shortCode}"`,
        `"${parentName.replace(/"/g, '""')}"`,
        isSub ? 'YES' : 'NO',
        stats.count,
        stats.units,
        stats.costValuation.toFixed(2),
        `"${(cat.description || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `nebula_categories_hierarchy_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (category: Category) => {
    const stats = categoryStats[category.id];
    const children = childrenMap[category.id] || [];

    let confirmMsg = `Are you sure you want to delete category "${category.name}"?`;
    if (children.length > 0) {
      confirmMsg = `Category "${category.name}" has ${children.length} subcategories (${children.map(c => c.name).join(', ')}). Deleting it will detach them to become top-level categories. Proceed?`;
    } else if (stats && stats.count > 0) {
      confirmMsg = `Warning: "${category.name}" has ${stats.count} assigned products. Deleting it will unassign those products. Proceed?`;
    }

    if (!confirm(confirmMsg)) return;
    deleteCategory(category.id);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50">
      {/* 1. Standardized Responsive KPI Metrics Row (NEB-UI-GOV-01) */}
      <NebulaStatGrid>
        <NebulaStatCard
          label="Total Categories"
          value={`${metrics.totalCategories} Taxonomies`}
          statusText={`${metrics.rootCount} Master • ${metrics.subCount} Subcategories`}
          icon={FolderTree}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-50"
        />

        <NebulaStatCard
          label="Classified Catalog"
          value={`${metrics.assignedProductsCount} SKUs`}
          statusText="Categorized product lines"
          icon={Package}
          iconColor="text-emerald-600"
          iconBgColor="bg-emerald-50"
        />

        <NebulaStatCard
          label="Categorized Units"
          value={`${metrics.totalInventoryUnits.toLocaleString()} Units`}
          statusText="Physical warehouse stock"
          icon={Boxes}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-50"
        />

        <NebulaStatCard
          label="Category Valuation"
          value={`${settings.currencySymbol}${metrics.totalValuation.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          statusText="Inventory purchase cost"
          icon={DollarSign}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-50"
        />

        <NebulaStatCard
          label="Empty Taxonomies"
          value={`${metrics.emptyCategoriesCount} Groups`}
          statusText="Ready for product classification"
          icon={AlertCircle}
          iconColor="text-amber-600"
          iconBgColor="bg-amber-50"
          statusColor="text-amber-600"
        />
      </NebulaStatGrid>

      {/* 2. Controls, Search, Hierarchy, and Filtering Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 space-y-4">
        {/* Top Controls Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Status & Hierarchy Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/50">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({categories.length})
            </button>

            <button
              onClick={() => setFilterType('root_only')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === 'root_only'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Top-Level Only ({metrics.rootCount})
            </button>

            <button
              onClick={() => setFilterType('subcategories_only')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === 'subcategories_only'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Subcategories Only ({metrics.subCount})
            </button>

            <button
              onClick={() => setFilterType('with_products')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === 'with_products'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              With Products ({categories.length - metrics.emptyCategoriesCount})
            </button>

            <button
              onClick={() => setFilterType('empty')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === 'empty'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Empty ({metrics.emptyCategoriesCount})
            </button>
          </div>

          {/* Action Buttons & View Mode */}
          <div className="flex items-center gap-2.5">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/60">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Cards Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Hierarchical Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              title="Export Category Taxonomy"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            {/* Create Category */}
            <button
              onClick={() => handleOpenAddCategory(null)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer shadow-blue-200 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </div>
        </div>

        {/* Bottom Controls Row: Search, Parent Scope & Sorting */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1 border-t border-slate-100">
          {/* Search Input */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search category, code, subcategory, or parent group..."
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

          {/* Parent Category Scope Filter */}
          <div>
            <select
              value={parentFilter}
              onChange={e => setParentFilter(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 py-2 px-3 rounded-xl font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="all">All Parent Groups</option>
              {rootCategories.map(r => (
                <option key={r.id} value={r.id}>
                  📁 {r.name} ({childrenMap[r.id]?.length || 0} subs)
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              className="w-full text-xs bg-slate-50 border border-slate-200 py-2 px-3 rounded-xl font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="hierarchy">Sort: Hierarchical Tree</option>
              <option value="name_asc">Sort: Name (A to Z)</option>
              <option value="name_desc">Sort: Name (Z to A)</option>
              <option value="products_desc">Sort: Most Products</option>
              <option value="products_asc">Sort: Fewest Products</option>
              <option value="valuation_desc">Sort: Highest Valuation</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Categories Content: Grid Cards vs Table */}
      {viewMode === 'grid' ? (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-16 text-center text-slate-400">
              <FolderTree className="w-12 h-12 mx-auto mb-3 text-slate-300 stroke-[1.5]" />
              <p className="font-bold text-sm text-slate-700">No categories found matching criteria</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Try adjusting the search query or create a new category or subcategory using the button above.
              </p>
            </div>
          ) : (
            filteredCategories.map(cat => {
              const stats = categoryStats[cat.id] || { count: 0, units: 0, costValuation: 0, retailValuation: 0 };
              const percentageOfTotal = products.length > 0 
                ? Math.round((stats.count / products.length) * 100) 
                : 0;
              const subcategories = childrenMap[cat.id] || [];
              const isSubcategory = Boolean(cat.parentId);

              return (
                <div
                  key={cat.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 p-5 flex flex-col justify-between space-y-4 group ${
                    isSubcategory 
                      ? 'border-blue-200/70 bg-gradient-to-br from-white to-blue-50/20 shadow-xs' 
                      : 'border-slate-200/80 shadow-xs hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* Top Category Title Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div 
                          onClick={() => setInspectingCategory(cat)}
                          className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 transition-all cursor-pointer overflow-hidden p-0.5 bg-white shadow-2xs group-hover:scale-105 ${
                            isSubcategory
                              ? 'border-indigo-200'
                              : 'border-slate-200'
                          }`}
                          title={`Inspect ${cat.name}`}
                        >
                          {cat.image || cat.icon ? (
                            <img
                              src={cat.image || cat.icon}
                              alt={cat.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <div className={`w-full h-full rounded-lg flex items-center justify-center transition-colors ${
                              isSubcategory
                                ? 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'
                                : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
                            }`}>
                              {isSubcategory ? (
                                <CornerDownRight className="w-5 h-5" />
                              ) : (
                                <Folder className="w-5 h-5" />
                              )}
                            </div>
                          )}
                        </div>
                        <div>
                          {/* Breadcrumb if Subcategory */}
                          {isSubcategory && (
                            <div className="flex items-center gap-1 text-[11px] text-blue-700 font-semibold mb-0.5">
                              <span className="text-slate-400">Sub of:</span>
                              <span 
                                onClick={() => setParentFilter(cat.parentId || 'all')}
                                className="hover:underline cursor-pointer font-bold"
                              >
                                {cat.parentName || 'Parent Category'}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <h4 
                              onClick={() => setInspectingCategory(cat)}
                              className="font-bold text-slate-900 text-sm hover:text-blue-600 cursor-pointer transition-colors"
                            >
                              {cat.name}
                            </h4>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              {cat.shortCode}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                            {cat.description || (isSubcategory ? `Subcategory of ${cat.parentName}` : 'Master department category')}
                          </p>
                        </div>
                      </div>

                      {/* Top Action Menu */}
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        {/* Quick Add Subcategory under this root category */}
                        {!isSubcategory && (
                          <button
                            onClick={() => handleOpenAddCategory(cat.id)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title={`Add Subcategory under ${cat.name}`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEditCategory(cat)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Category & Hierarchy"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Subcategories preview tags if root category */}
                    {!isSubcategory && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                            <GitFork className="w-3 h-3 text-slate-400" />
                            Subcategories ({subcategories.length})
                          </span>
                          <button
                            onClick={() => handleOpenAddCategory(cat.id)}
                            className="text-[10px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-0.5"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Sub</span>
                          </button>
                        </div>
                        {subcategories.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {subcategories.slice(0, 3).map(sub => (
                              <button
                                key={sub.id}
                                onClick={() => setInspectingCategory(sub)}
                                className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                              >
                                {sub.name}
                              </button>
                            ))}
                            {subcategories.length > 3 && (
                              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-50 text-slate-400">
                                +{subcategories.length - 3} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-400 italic">No subcategories assigned yet</p>
                        )}
                      </div>
                    )}

                    {/* Middle Metrics Row */}
                    <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned SKUs</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-base font-black text-slate-900">{stats.count}</span>
                          <span className="text-[10px] text-slate-500">products</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Units</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-base font-black text-emerald-600">{stats.units.toLocaleString()}</span>
                          <span className="text-[10px] text-slate-500">items</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar Showing % of Catalog */}
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Catalog Share</span>
                        <span className="font-bold text-slate-700">{percentageOfTotal}% of total items</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, percentageOfTotal)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">Valuation:</span>
                      <span className="font-bold text-slate-800">
                        {settings.currencySymbol}{stats.costValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setInspectingCategory(cat)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Products ({stats.count})</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* TABLE VIEW WITH HIERARCHY TREE */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Category / Taxonomy</th>
                  <th className="py-3.5 px-4">Code</th>
                  <th className="py-3.5 px-4">Hierarchy Level</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4 text-center">Assigned SKUs</th>
                  <th className="py-3.5 px-4 text-right">Units</th>
                  <th className="py-3.5 px-4 text-right">Valuation</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-slate-400">
                      <FolderTree className="w-12 h-12 mx-auto mb-3 text-slate-300 stroke-[1.5]" />
                      <p className="font-bold text-sm text-slate-700">No categories found matching criteria</p>
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map(cat => {
                    const stats = categoryStats[cat.id] || { count: 0, units: 0, costValuation: 0, retailValuation: 0 };
                    const isSubcategory = Boolean(cat.parentId);
                    const subcategories = childrenMap[cat.id] || [];

                    return (
                      <tr 
                        key={cat.id} 
                        className={`transition-colors ${
                          isSubcategory 
                            ? 'bg-blue-50/30 hover:bg-blue-50/60' 
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        {/* Category Name, Thumbnail & Hierarchy Indentation */}
                        <td className="py-3.5 px-4">
                          <div className={`flex items-center gap-2.5 ${isSubcategory ? 'pl-6' : ''}`}>
                            {isSubcategory && (
                              <CornerDownRight className="w-4 h-4 text-indigo-500 shrink-0" />
                            )}
                            <div 
                              onClick={() => setInspectingCategory(cat)}
                              className="w-8 h-8 rounded-lg bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 p-0.5 cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all shadow-2xs"
                              title={`View ${cat.name}`}
                            >
                              {cat.image || cat.icon ? (
                                <img
                                  src={cat.image || cat.icon}
                                  alt={cat.name}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover rounded-md"
                                />
                              ) : (
                                <div className={`w-full h-full rounded-md flex items-center justify-center ${
                                  isSubcategory ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'
                                }`}>
                                  <Folder className="w-3.5 h-3.5" />
                                </div>
                              )}
                            </div>
                            <div>
                              <button
                                onClick={() => setInspectingCategory(cat)}
                                className={`font-bold hover:text-blue-600 text-left cursor-pointer transition-colors ${
                                  isSubcategory ? 'text-indigo-950 font-semibold' : 'text-slate-900'
                                }`}
                              >
                                {cat.name}
                              </button>
                              {isSubcategory && (
                                <p className="text-[10px] text-slate-400">
                                  Under: <span className="font-semibold text-slate-600">{cat.parentName}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Code */}
                        <td className="py-3.5 px-4 font-mono">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            {cat.shortCode}
                          </span>
                        </td>

                        {/* Hierarchy Level */}
                        <td className="py-3.5 px-4">
                          {isSubcategory ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              <CornerDownRight className="w-3 h-3" />
                              Subcategory
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              <Folder className="w-3 h-3 text-blue-600" />
                              Top-Level ({subcategories.length} subs)
                            </span>
                          )}
                        </td>

                        {/* Description */}
                        <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                          {cat.description || (isSubcategory ? `Subcategory under ${cat.parentName}` : 'Master department taxonomy')}
                        </td>

                        {/* Assigned SKUs */}
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                              stats.count > 0
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {stats.count} SKUs
                          </span>
                        </td>

                        {/* Physical Units */}
                        <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                          {stats.units.toLocaleString()}
                        </td>

                        {/* Valuation */}
                        <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                          {settings.currencySymbol}{stats.costValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {!isSubcategory && (
                              <button
                                onClick={() => handleOpenAddCategory(cat.id)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                title={`Add Subcategory under ${cat.name}`}
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => setInspectingCategory(cat)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="View Products in Category"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEditCategory(cat)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Category"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(cat)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Category"
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
      )}

      {/* 4. Modals */}
      {/* Create / Edit Category Modal */}
      <AddEditCategoryModal
        isOpen={isAddEditOpen}
        onClose={() => {
          setIsAddEditOpen(false);
          setCategoryToEdit(null);
          setModalDefaultParentId(null);
        }}
        categoryToEdit={categoryToEdit}
        defaultParentId={modalDefaultParentId}
      />

      {/* Category Products Inspection Modal */}
      <CategoryProductsModal
        isOpen={Boolean(inspectingCategory)}
        onClose={() => setInspectingCategory(null)}
        category={inspectingCategory}
        onOpenAddProduct={() => setIsAddProductOpen(true)}
        onViewProduct={p => setViewingProduct(p)}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        isOpen={Boolean(viewingProduct)}
        onClose={() => setViewingProduct(null)}
        product={viewingProduct}
        onEdit={p => {
          setViewingProduct(null);
          setEditingProduct(p);
          setIsAddProductOpen(true);
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

      {/* Add / Edit Product Modal */}
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => {
          setIsAddProductOpen(false);
          setEditingProduct(null);
        }}
        productToEdit={editingProduct}
      />

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={Boolean(adjustingProduct)}
        onClose={() => setAdjustingProduct(null)}
        product={adjustingProduct}
      />

      {/* Barcode Modal */}
      <ProductBarcodeModal
        isOpen={Boolean(barcodeProduct)}
        onClose={() => setBarcodeProduct(null)}
        product={barcodeProduct}
      />
    </div>
  );
};
