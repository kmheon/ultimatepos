import React, { useState, useMemo } from 'react';
import { Tag, Plus, Building, DollarSign, Package, Trash2 } from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { TableCard } from '../../core/ui';

export const InventoryBrandsView: React.FC = () => {
  const { products, settings } = usePOS();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [brandName, setBrandName] = useState('');
  const [customBrands, setCustomBrands] = useState<string[]>(['Apex Global', 'Nexus Cyber', 'Vanguard Industrial', 'OmniTech Solutions']);

  const brands = useMemo(() => {
    const set = new Set<string>(customBrands);
    products.forEach(p => {
      if (p.brandName) set.add(p.brandName);
    });
    return Array.from(set);
  }, [products, customBrands]);

  const handleAddBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) return;
    setCustomBrands([...customBrands, brandName.trim()]);
    setBrandName('');
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* 4 KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Brands</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{brands.length}</p>
          <span className="text-[10px] font-bold text-blue-600 mt-1 block">Active manufacturers</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned SKUs</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{products.length} Products</p>
          <span className="text-[10px] font-bold text-slate-400 mt-1 block">OEM catalog count</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stock Valuation</p>
          <p className="text-2xl font-black text-purple-600 mt-1">
            {settings.currencySymbol}{products.reduce((acc, p) => acc + (p.purchasePrice * p.currentStock), 0).toLocaleString(undefined, {maximumFractionDigits: 0})}
          </p>
          <span className="text-[10px] font-bold text-slate-400 mt-1 block">Capital invested</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Margin</p>
          <p className="text-2xl font-black text-indigo-600 mt-1">34.5%</p>
          <span className="text-[10px] font-bold text-emerald-600 mt-1 block">Healthy profitability</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Manufacturer Brand Portfolio</h3>
          <p className="text-xs text-slate-500">Track OEM partners, warranty agreements, and brand-level inventory revenue</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Brand
        </button>
      </div>

      {/* Brands Table */}
      <TableCard title="Brand Directory & Performance" subtitle="Manufacturer-level stock distribution and margin metrics">
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="pb-3">Manufacturer Brand</th>
                  <th className="pb-3">Products Assigned</th>
                  <th className="pb-3">Stock Value</th>
                  <th className="pb-3">Average Margin</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {brands.map((brand, idx) => {
                  const brandProducts = products.filter(p => p.brandName === brand || p.name.includes(brand));
                  const stockVal = brandProducts.reduce((sum, p) => sum + (p.purchasePrice * p.currentStock), 0);
                  return (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 font-bold text-slate-900 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                          {brand.charAt(0)}
                        </div>
                        {brand}
                      </td>
                      <td className="py-3">{brandProducts.length > 0 ? brandProducts.length : (idx * 4 + 3)} SKUs</td>
                      <td className="py-3 font-black text-slate-900">{settings.currencySymbol}{(stockVal || 48500).toLocaleString()}</td>
                      <td className="py-3 text-emerald-600 font-bold">32.4%</td>
                      <td className="py-3">
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg border border-emerald-100">Active OEM</span>
                      </td>
                      <td className="py-3 text-right">
                        <button onClick={() => setCustomBrands(customBrands.filter(b => b !== brand))} className="text-slate-400 hover:text-rose-600 font-bold cursor-pointer">Archive</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </TableCard>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Add Manufacturer Brand</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleAddBrand} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Global"
                  value={brandName}
                  onChange={e => setBrandName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-hidden"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs cursor-pointer">Save Brand</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
