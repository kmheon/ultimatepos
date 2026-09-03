import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  Plus, 
  Search, 
  Trash2, 
  AlertTriangle, 
  Package, 
  X,
  Building2
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';

interface AdjustmentItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitCost: number;
}

interface StockAdjustment {
  id: string;
  refNo: string;
  date: string;
  locationName: string;
  adjustmentType: 'normal' | 'abnormal';
  reason: string;
  items: AdjustmentItem[];
  totalAmountRecovered: number;
  totalLoss: number;
}

export const StockAdjustmentView: React.FC = () => {
  const { products, updateProduct, settings } = usePOS();
  
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([
    {
      id: '1',
      refNo: 'ADJ-2026-001',
      date: '2026-08-28',
      locationName: 'Downtown Flagship',
      adjustmentType: 'normal',
      reason: 'Shelf display wear & demo unit tear',
      items: [
        { productId: '1', productName: 'iPhone 15 Pro Max 256GB', sku: 'IP15PM-256', quantity: 1, unitCost: 950 }
      ],
      totalAmountRecovered: 200,
      totalLoss: 750
    },
    {
      id: '2',
      refNo: 'ADJ-2026-002',
      date: '2026-08-30',
      locationName: 'Westside Hub',
      adjustmentType: 'abnormal',
      reason: 'Transit water damage during heavy rainfall',
      items: [
        { productId: '2', productName: 'Samsung Galaxy S24 Ultra', sku: 'S24U-512', quantity: 1, unitCost: 880 }
      ],
      totalAmountRecovered: 0,
      totalLoss: 880
    }
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [adjType, setAdjType] = useState<'normal' | 'abnormal'>('normal');
  const [adjLocation, setAdjLocation] = useState('Downtown Flagship');
  const [adjReason, setAdjReason] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [adjQty, setAdjQty] = useState('1');
  const [amountRecovered, setAmountRecovered] = useState('0');

  const handleCreateAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find(p => p.id === selectedProductId);
    if (!prod) return;

    const qty = parseInt(adjQty) || 1;
    const rec = parseFloat(amountRecovered) || 0;
    const loss = (prod.purchasePrice * qty) - rec;

    // Deduct stock from inventory
    updateProduct(prod.id, {
      currentStock: Math.max(0, prod.currentStock - qty)
    });

    const newAdj: StockAdjustment = {
      id: Date.now().toString(),
      refNo: `ADJ-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
      locationName: adjLocation,
      adjustmentType: adjType,
      reason: adjReason.trim() || (adjType === 'normal' ? 'Normal Stock Shrinkage' : 'Damage / Leakage / Expiry'),
      items: [
        {
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          quantity: qty,
          unitCost: prod.purchasePrice
        }
      ],
      totalAmountRecovered: rec,
      totalLoss: Math.max(0, loss)
    };

    setAdjustments([newAdj, ...adjustments]);
    setIsAddModalOpen(false);
    setAdjReason('');
    setAdjQty('1');
    setAmountRecovered('0');
  };

  const filteredAdjustments = adjustments.filter(a =>
    a.refNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.items.some(i => i.productName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <SlidersHorizontal className="w-6 h-6 text-blue-600" />
            Stock Adjustments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Record inventory write-offs, physical count discrepancies, damage write-downs, and abnormal losses.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Stock Adjustment</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Adjustments</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{adjustments.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Recorded audit entries</div>
        </div>

        <div className="p-4 bg-rose-50/50 border border-rose-200 rounded-2xl shadow-xs">
          <div className="text-xs text-rose-700 font-bold uppercase tracking-wider">Total Write-Off Loss</div>
          <div className="text-2xl font-black text-rose-700 mt-1">
            {settings.currencySymbol}{adjustments.reduce((acc, a) => acc + a.totalLoss, 0).toFixed(2)}
          </div>
          <div className="text-[11px] text-rose-500 mt-1">Direct inventory write-down</div>
        </div>

        <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl shadow-xs">
          <div className="text-xs text-emerald-700 font-bold uppercase tracking-wider">Amount Recovered</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {settings.currencySymbol}{adjustments.reduce((acc, a) => acc + a.totalAmountRecovered, 0).toFixed(2)}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">Salvage / Insurance claim returns</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by reference no, reason or product name..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full text-xs sm:text-sm bg-transparent border-none focus:outline-none"
        />
      </div>

      {/* Adjustments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Reference No</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Adjustment Type</th>
                <th className="px-4 py-3">Adjusted Products</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3 text-right">Net Loss</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredAdjustments.map(adj => (
                <tr key={adj.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3.5 font-mono font-bold text-slate-900">{adj.refNo}</td>
                  <td className="px-4 py-3.5 text-slate-500">{adj.date}</td>
                  <td className="px-4 py-3.5 font-medium">{adj.locationName}</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      adj.adjustmentType === 'normal'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {adj.adjustmentType === 'normal' ? 'Normal (Shrinkage)' : 'Abnormal (Damaged)'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    {adj.items.map((it, idx) => (
                      <div key={idx} className="font-semibold text-slate-800">
                        {it.productName} <span className="text-rose-600 font-bold">(-{it.quantity})</span>
                      </div>
                    ))}
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 max-w-xs truncate">{adj.reason}</td>
                  <td className="px-4 py-3.5 text-right font-bold text-rose-600">
                    {settings.currencySymbol}{adj.totalLoss.toFixed(2)}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => setAdjustments(adjustments.filter(a => a.id !== adj.id))}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Adjustment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Add Stock Adjustment
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateAdjustment} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Adjustment Type *</label>
                  <select
                    value={adjType}
                    onChange={e => setAdjType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                  >
                    <option value="normal">Normal (Shrinkage / Display / Expired)</option>
                    <option value="abnormal">Abnormal (Fire / Water / Theft / Transit)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location *</label>
                  <select
                    value={adjLocation}
                    onChange={e => setAdjLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="Downtown Flagship">Downtown Flagship</option>
                    <option value="Westside Hub">Westside Hub</option>
                    <option value="Uptown Express Mall">Uptown Express Mall</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Product to Adjust *</label>
                <select
                  value={selectedProductId}
                  onChange={e => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock: {p.currentStock} {p.unit}) - Cost: {settings.currencySymbol}{p.purchasePrice}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quantity to Deduct *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={adjQty}
                    onChange={e => setAdjQty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-rose-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Recovered / Salvage Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amountRecovered}
                    onChange={e => setAmountRecovered(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason / Notes</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Scratched screen during warehouse shelving"
                  value={adjReason}
                  onChange={e => setAdjReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
