import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  Package, 
  Search, 
  DollarSign, 
  Boxes, 
  Barcode, 
  Eye, 
  ShoppingCart, 
  Plus,
  ArrowRight
} from 'lucide-react';
import { Category, Product } from '../../types';
import { usePOS } from '../../context/POSContext';

interface CategoryProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onOpenAddProduct?: () => void;
  onViewProduct?: (product: Product) => void;
}

export const CategoryProductsModal: React.FC<CategoryProductsModalProps> = ({
  isOpen,
  onClose,
  category,
  onOpenAddProduct,
  onViewProduct,
}) => {
  const { products, settings, addToCart, setActiveTab } = usePOS();
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen || !category) return null;

  // Filter products in this category
  const categoryProducts = products.filter(p => p.categoryId === category.id);
  const filtered = categoryProducts.filter(p => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.barcode.includes(q)
    );
  });

  const totalStock = categoryProducts.reduce((sum, p) => sum + p.currentStock, 0);
  const totalValuation = categoryProducts.reduce((sum, p) => sum + (p.purchasePrice * p.currentStock), 0);
  const totalRetail = categoryProducts.reduce((sum, p) => sum + (p.sellingPrice * p.currentStock), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 overflow-hidden shrink-0 p-0.5">
              {category.image || category.icon ? (
                <img
                  src={category.image || category.icon}
                  alt={category.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <Layers className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">{category.name}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {category.shortCode}
                </span>
                {category.parentId && category.parentName && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-900/60 text-blue-300 border border-blue-700/60 flex items-center gap-1">
                    <span>↳ Subcategory of</span>
                    <strong className="text-white">{category.parentName}</strong>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {categoryProducts.length} Products Assigned • {category.description || 'Department category'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 border-b border-slate-200 text-center">
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned SKUs</span>
            <span className="text-base font-black text-slate-900 mt-0.5 block">{categoryProducts.length} Items</span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Inventory Units</span>
            <span className="text-base font-black text-emerald-600 mt-0.5 block">{totalStock.toLocaleString()} Units</span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Inventory Valuation</span>
            <span className="text-base font-black text-blue-600 mt-0.5 block">
              {settings.currencySymbol}{totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search products in this category..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {onOpenAddProduct && (
            <button
              onClick={() => {
                onClose();
                onOpenAddProduct();
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Product</span>
            </button>
          )}
        </div>

        {/* Product List Table */}
        <div className="max-h-[50vh] overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">SKU / Barcode</th>
                <th className="py-3 px-4 text-right">Cost</th>
                <th className="py-3 px-4 text-right">Retail</th>
                <th className="py-3 px-4 text-center">Stock Level</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Package className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                    <p className="font-bold text-sm text-slate-700">No products in this category</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Assign products to this category from the Products page or when creating new items.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map(p => {
                  const isLow = p.currentStock <= p.alertQuantity && p.currentStock > 0;
                  const isOut = p.currentStock <= 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                            {p.image ? (
                              <img src={p.image} alt={p.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-4 h-4 text-slate-300" />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{p.name}</span>
                            {p.brandName && (
                              <span className="text-[10px] text-slate-400 uppercase font-semibold">{p.brandName}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <span className="font-bold text-slate-800 block">{p.sku}</span>
                        <span className="text-[10px] text-slate-400">{p.barcode}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-600">
                        {settings.currencySymbol}{p.purchasePrice.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-slate-900">
                        {settings.currencySymbol}{p.sellingPrice.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            isOut
                              ? 'bg-rose-100 text-rose-800'
                              : isLow
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {p.currentStock} {p.unit}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {onViewProduct && (
                            <button
                              onClick={() => {
                                onClose();
                                onViewProduct(p);
                              }}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="View Master Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              addToCart(p, 1);
                              onClose();
                              setActiveTab('pos');
                            }}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Add to POS"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
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

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Showing {filtered.length} of {categoryProducts.length} items
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
