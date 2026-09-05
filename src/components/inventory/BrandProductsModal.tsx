import React, { useState, useMemo } from 'react';
import { X, Tag, Package, Plus, DollarSign, Layers, GitFork } from 'lucide-react';
import { Brand, Product } from '../../types';
import { usePOS } from '../../context/POSContext';

interface BrandProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  brand: Brand | null;
  onAddProductForBrand: (brandId: string) => void;
}

export const BrandProductsModal: React.FC<BrandProductsModalProps> = ({
  isOpen,
  onClose,
  brand,
  onAddProductForBrand,
}) => {
  const { brands, products, settings } = usePOS();
  const [logoError, setLogoError] = useState(false);
  const [includeSubBrands, setIncludeSubBrands] = useState(true);

  if (!isOpen || !brand) return null;

  // Find sub-brands for this brand
  const childSubBrands = brands.filter(b => b.parentId === brand.id);
  const childBrandIds = new Set(childSubBrands.map(b => b.id));

  // Products belonging directly to this brand
  const directProducts = products.filter(
    p => p.brandId === brand.id || (p.brandName && p.brandName.toLowerCase() === brand.name.toLowerCase())
  );

  // Products belonging to sub-brands
  const subBrandProducts = products.filter(
    p => p.brandId && childBrandIds.has(p.brandId)
  );

  const displayedProducts = (childSubBrands.length > 0 && includeSubBrands)
    ? [...directProducts, ...subBrandProducts]
    : directProducts;

  const totalUnits = displayedProducts.reduce((sum, p) => sum + p.currentStock, 0);
  const totalValuation = displayedProducts.reduce((sum, p) => sum + (p.purchasePrice * p.currentStock), 0);
  const totalRetailVal = displayedProducts.reduce((sum, p) => sum + (p.sellingPrice * p.currentStock), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {brand.logo && !logoError ? (
              <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-2xs">
                <img
                  src={brand.logo}
                  alt={brand.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                  onError={() => setLogoError(true)}
                />
              </div>
            ) : (
              <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm">
                {brand.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{brand.name}</h2>
                {brand.parentId ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-700 border border-violet-200">
                    <GitFork className="w-2.5 h-2.5" /> Sub-brand of {brand.parentName || 'Parent'}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Primary Brand
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                  {displayedProducts.length} Assigned SKUs
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {brand.description || 'Manufacturer brand portfolio and current stock'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-brand Toggle Bar if Parent has Sub-brands */}
        {childSubBrands.length > 0 && (
          <div className="px-6 py-2.5 bg-violet-50/70 border-b border-violet-100 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2">
              <GitFork className="w-3.5 h-3.5 text-violet-600" />
              <span className="font-bold text-violet-900">Brand Family Includes:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {childSubBrands.map(cb => (
                  <span key={cb.id} className="px-2 py-0.5 rounded-md bg-white border border-violet-200 text-violet-700 font-semibold text-[10px]">
                    {cb.name}
                  </span>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-violet-900 text-[11px]">
              <input
                type="checkbox"
                checked={includeSubBrands}
                onChange={e => setIncludeSubBrands(e.target.checked)}
                className="rounded text-violet-600 focus:ring-violet-500 h-3.5 w-3.5"
              />
              <span>Include Sub-brand Products</span>
            </label>
          </div>
        )}

        {/* Brand Summary Stats */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-100/60 border-b border-slate-200 shrink-0">
          <div className="bg-white p-3 rounded-xl border border-slate-200/80">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">In-Stock Units</p>
            <p className="text-lg font-black text-slate-900 mt-0.5">{totalUnits.toLocaleString()} units</p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200/80">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inventory Cost</p>
            <p className="text-lg font-black text-emerald-600 mt-0.5">
              {settings.currencySymbol}{totalValuation.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200/80">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Retail Valuation</p>
            <p className="text-lg font-black text-indigo-600 mt-0.5">
              {settings.currencySymbol}{totalRetailVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        {/* Product List */}
        <div className="flex-1 overflow-y-auto p-6">
          {displayedProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700">No products assigned to this brand yet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Add products from the master catalog and set their brand to {brand.name}.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onAddProductForBrand(brand.id);
                }}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product for {brand.name}</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="pb-3">Product Name & SKU</th>
                    <th className="pb-3">Brand Line</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Unit Cost</th>
                    <th className="pb-3">Selling Price</th>
                    <th className="pb-3">Stock Units</th>
                    <th className="pb-3 text-right">Valuation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {displayedProducts.map(p => {
                    const isSubBrandItem = p.brandId && childBrandIds.has(p.brandId);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3">
                          <div className="font-bold text-slate-900">{p.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{p.sku}</div>
                        </td>
                        <td className="py-3">
                          {isSubBrandItem ? (
                            <span className="px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 border border-violet-200 font-semibold text-[10px]">
                              ↳ {p.brandName}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10px]">
                              {brand.name}
                            </span>
                          )}
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10px]">
                            {p.categoryName || 'Unassigned'}
                          </span>
                        </td>
                        <td className="py-3 font-mono font-semibold text-slate-600">
                          {settings.currencySymbol}{p.purchasePrice.toFixed(2)}
                        </td>
                        <td className="py-3 font-mono font-bold text-slate-900">
                          {settings.currencySymbol}{p.sellingPrice.toFixed(2)}
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              p.currentStock <= 0
                                ? 'bg-rose-100 text-rose-700'
                                : p.currentStock <= p.alertQuantity
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {p.currentStock} {p.currentStock <= p.alertQuantity && p.currentStock > 0 ? '(Low)' : ''}
                          </span>
                        </td>
                        <td className="py-3 text-right font-bold text-slate-900 font-mono">
                          {settings.currencySymbol}{(p.purchasePrice * p.currentStock).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            Showing {displayedProducts.length} items linked to {brand.name}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onAddProductForBrand(brand.id);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Product</span>
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
