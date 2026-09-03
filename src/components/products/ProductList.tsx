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
  DollarSign
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { Product } from '../../types';
import { AddProductModal } from './AddProductModal';
import { StockAdjustmentModal } from './StockAdjustmentModal';

export const ProductList: React.FC = () => {
  const { products, categories, deleteProduct, addToCart, settings, setActiveTab } = usePOS();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'low' | 'out'>('all');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = categoryFilter === 'all' || p.categoryId === categoryFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.includes(q);

      let matchesStock = true;
      if (stockStatusFilter === 'low') {
        matchesStock = p.currentStock > 0 && p.currentStock <= p.alertQuantity;
      } else if (stockStatusFilter === 'out') {
        matchesStock = p.currentStock <= 0;
      }

      return matchesCategory && matchesSearch && matchesStock;
    });
  }, [products, categoryFilter, searchQuery, stockStatusFilter]);

  // Inventory stats
  const totalValuation = products.reduce((sum, p) => sum + (p.purchasePrice * p.currentStock), 0);
  const retailValuation = products.reduce((sum, p) => sum + (p.sellingPrice * p.currentStock), 0);
  const lowStockCount = products.filter(p => p.currentStock <= p.alertQuantity).length;

  const handleEdit = (p: Product) => {
    setEditingProduct(p);
    setIsAddOpen(true);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Product Catalog & Inventory</h1>
          <p className="text-xs text-slate-500">Manage SKUs, retail pricing, margins, barcode indexes, and warehouse stocks</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingProduct(null);
              setIsAddOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Catalog SKUs</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{products.length} Products</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Across {categories.length} store departments</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inventory Cost Valuation</span>
          <h3 className="text-2xl font-black text-blue-600 mt-1">{settings.currencySymbol}{totalValuation.toFixed(2)}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Retail Potential: {settings.currencySymbol}{retailValuation.toFixed(2)}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stock Attention Needed</span>
          <h3 className={`text-2xl font-black mt-1 ${lowStockCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
            {lowStockCount} Items Low
          </h3>
          <p className="text-[11px] text-amber-700 mt-0.5">Below alert restock threshold</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, SKU, or barcode..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 py-2 px-3 rounded-xl font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Stock Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {(['all', 'low', 'out'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStockStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  stockStatusFilter === st
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {st === 'all' ? 'All Stock' : st === 'low' ? 'Low Stock' : 'Out of Stock'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Product Info</th>
                <th className="py-3.5 px-4">SKU / Barcode</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-right">Cost Price</th>
                <th className="py-3.5 px-4 text-right">Selling Price</th>
                <th className="py-3.5 px-4 text-right">Margin</th>
                <th className="py-3.5 px-4 text-center">Stock Level</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Package className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-sm">No products found matching filters</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => {
                  const margin = p.sellingPrice > 0
                    ? (((p.sellingPrice - p.purchasePrice) / p.sellingPrice) * 100).toFixed(1)
                    : '0';
                  const isLow = p.currentStock <= p.alertQuantity && p.currentStock > 0;
                  const isOut = p.currentStock <= 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center border border-slate-200">
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
                            <p className="font-bold text-slate-900 line-clamp-1">{p.name}</p>
                            {p.brandName && (
                              <p className="text-[10px] text-slate-400 font-medium">{p.brandName}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <div className="text-slate-800 font-semibold">{p.sku}</div>
                        <div className="text-[10px] text-slate-400">{p.barcode}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium text-[11px]">
                          {p.categoryName}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-medium text-slate-600">
                        {settings.currencySymbol}{p.purchasePrice.toFixed(2)}
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {settings.currencySymbol}{p.sellingPrice.toFixed(2)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <span className="font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">
                          {margin}%
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                              isOut
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : isLow
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {p.currentStock} {p.unit}
                          </span>
                          {isLow && (
                            <span className="text-[9px] text-amber-600 font-medium mt-0.5">
                              Alert at {p.alertQuantity}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              addToCart(p, 1);
                              setActiveTab('pos');
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Add to POS Cart"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setAdjustingProduct(p)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Adjust Stock Level"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleEdit(p)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${p.name}"?`)) {
                                deleteProduct(p.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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

      {/* Modals */}
      <AddProductModal
        isOpen={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          setEditingProduct(null);
        }}
        productToEdit={editingProduct}
      />

      <StockAdjustmentModal
        isOpen={Boolean(adjustingProduct)}
        onClose={() => setAdjustingProduct(null)}
        product={adjustingProduct}
      />
    </div>
  );
};
