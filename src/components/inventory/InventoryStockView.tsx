import React, { useState, useMemo } from 'react';
import { Boxes, Search, Filter, Truck, ArrowLeftRight, SlidersHorizontal, Barcode, Building2 } from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { TableCard } from '../../core/ui';

export const InventoryStockView: React.FC = () => {
  const { products, categories, settings } = usePOS();
  const [warehouseFilter, setWarehouseFilter] = useState('All Warehouses');
  const [searchQuery, setSearchQuery] = useState('');

  const totalStockUnits = useMemo(() => products.reduce((sum, p) => sum + p.currentStock, 0), [products]);
  const totalStockValuation = useMemo(() => products.reduce((sum, p) => sum + (p.purchasePrice * p.currentStock), 0), [products]);
  const reservedStock = 145;
  const availableStock = Math.max(0, totalStockUnits - reservedStock);
  const lowStockCount = useMemo(() => products.filter(p => p.currentStock <= p.alertQuantity).length, [products]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return products.filter(p => !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
  }, [products, searchQuery]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* 7 Stock KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Stock Units</p>
          <p className="text-xl font-black text-slate-900 mt-1">{totalStockUnits}</p>
          <span className="text-[10px] font-bold text-blue-600 mt-1 block">Units in stock</span>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inventory Value</p>
          <p className="text-xl font-black text-slate-900 mt-1">{settings.currencySymbol}{totalStockValuation.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
          <span className="text-[10px] font-bold text-emerald-600 mt-1 block">Cost valuation</span>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reserved Stock</p>
          <p className="text-xl font-black text-purple-600 mt-1">{reservedStock}</p>
          <span className="text-[10px] font-bold text-purple-600 mt-1 block">For sales orders</span>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Available Stock</p>
          <p className="text-xl font-black text-emerald-600 mt-1">{availableStock}</p>
          <span className="text-[10px] font-bold text-emerald-600 mt-1 block">Ready to pick</span>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Low Stock</p>
          <p className="text-xl font-black text-amber-600 mt-1">{lowStockCount}</p>
          <span className="text-[10px] font-bold text-amber-600 mt-1 block">Below alert level</span>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Negative Stock</p>
          <p className="text-xl font-black text-rose-600 mt-1">0</p>
          <span className="text-[10px] font-bold text-emerald-600 mt-1 block">Fully reconciled</span>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reorder Required</p>
          <p className="text-xl font-black text-indigo-600 mt-1">{lowStockCount} SKUs</p>
          <span className="text-[10px] font-bold text-indigo-600 mt-1 block">Purchase triggers</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search stock by product SKU or name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={warehouseFilter}
            onChange={e => setWarehouseFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 py-2 px-3 rounded-xl font-bold text-slate-700 focus:outline-hidden"
          >
            <option>All Warehouses</option>
            <option>Central Distribution Hub</option>
            <option>Eastside Depot</option>
            <option>Fulfillment Terminal 3</option>
          </select>

          <button
            onClick={() => alert('Opening Stock Receive Wizard...')}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
          >
            <Truck className="w-3.5 h-3.5" /> Receive Stock
          </button>
        </div>
      </div>

      {/* Stock Table */}
      <TableCard title="Warehouse Stock Ledger" subtitle="Multi-location inventory availability, reserved commitments, and reorder triggers">
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="pb-3">Product SKU & Name</th>
                  <th className="pb-3">Warehouse Location</th>
                  <th className="pb-3">Available</th>
                  <th className="pb-3">Reserved</th>
                  <th className="pb-3">Incoming</th>
                  <th className="pb-3">Reorder Level</th>
                  <th className="pb-3">Stock Valuation</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredProducts.map(p => {
                  const val = p.purchasePrice * p.currentStock;
                  const isLow = p.currentStock <= p.alertQuantity;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3">
                        <span className="font-bold text-slate-900 block">{p.name}</span>
                        <span className="text-[10px] text-slate-400">SKU: {p.sku}</span>
                      </td>
                      <td className="py-3 font-semibold text-slate-700">Central Distribution Hub</td>
                      <td className="py-3 font-black text-emerald-600">{p.currentStock} units</td>
                      <td className="py-3 font-bold text-purple-600">12 units</td>
                      <td className="py-3 font-bold text-blue-600">50 units</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${isLow ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-600'}`}>
                          Min: {p.alertQuantity}
                        </span>
                      </td>
                      <td className="py-3 font-black text-slate-900">{settings.currencySymbol}{val.toFixed(2)}</td>
                      <td className="py-3 text-right">
                        <button onClick={() => alert(`Managing stock for ${p.sku}`)} className="text-blue-600 hover:underline font-bold cursor-pointer">Adjust</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </TableCard>
    </div>
  );
};
