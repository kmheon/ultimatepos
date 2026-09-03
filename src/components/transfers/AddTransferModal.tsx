import React, { useState } from 'react';
import { X, ArrowLeftRight, Plus, Trash2, Building2, Package } from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { StockTransferItem } from '../../types';

interface AddTransferModalProps {
  onClose: () => void;
}

export const AddTransferModal: React.FC<AddTransferModalProps> = ({ onClose }) => {
  const { locations, products, addStockTransfer, settings } = usePOS();

  const [fromLocationId, setFromLocationId] = useState(locations[1]?.id || locations[0]?.id || 'loc-1');
  const [toLocationId, setToLocationId] = useState(locations[0]?.id || locations[1]?.id || 'loc-2');
  const [shippingCharges, setShippingCharges] = useState('25.00');
  const [notes, setNotes] = useState('Stock replenishment dispatch.');
  const [status, setStatus] = useState<'pending' | 'in_transit' | 'completed'>('in_transit');

  const [selectedProductToAdd, setSelectedProductToAdd] = useState('');
  const [items, setItems] = useState<StockTransferItem[]>([
    {
      productId: products[0]?.id || 'p1',
      productName: products[0]?.name || 'Product',
      sku: products[0]?.sku || 'SKU',
      quantity: 3,
      unitCost: products[0]?.purchasePrice || 900,
    }
  ]);

  const handleAddItem = (prodId: string) => {
    const prod = products.find(p => p.id === prodId);
    if (!prod) return;

    const existing = items.find(i => i.productId === prod.id);
    if (existing) {
      setItems(items.map(i => i.productId === prod.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setItems([
        ...items,
        {
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          quantity: 1,
          unitCost: prod.purchasePrice,
        }
      ]);
    }
    setSelectedProductToAdd('');
  };

  const updateItemQty = (index: number, qty: number) => {
    if (qty <= 0) return;
    setItems(items.map((it, idx) => idx === index ? { ...it, quantity: qty } : it));
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const totalValue = items.reduce((s, i) => s + i.quantity * i.unitCost, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromLocationId === toLocationId) {
      alert('Source and destination locations cannot be the same!');
      return;
    }
    if (items.length === 0) {
      alert('Please add at least one product to transfer.');
      return;
    }

    const fromLoc = locations.find(l => l.id === fromLocationId);
    const toLoc = locations.find(l => l.id === toLocationId);

    addStockTransfer({
      fromLocationId,
      fromLocationName: fromLoc ? fromLoc.name : 'Origin Location',
      toLocationId,
      toLocationName: toLoc ? toLoc.name : 'Destination Location',
      items,
      shippingCharges: parseFloat(shippingCharges) || 0,
      status,
      notes,
      totalValue,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold">
              <ArrowLeftRight className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-extrabold text-base tracking-tight text-white">
                New Stock Transfer
              </h2>
              <p className="text-xs text-slate-400">
                Dispatch items between store branches and central warehouses.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Location Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Dispatch From (Source)
              </label>
              <select
                value={fromLocationId}
                onChange={e => setFromLocationId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">
                Deliver To (Destination)
              </label>
              <select
                value={toLocationId}
                onChange={e => setToLocationId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Add product */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Add Products to Transfer Manifest
            </label>
            <div className="flex gap-2">
              <select
                value={selectedProductToAdd}
                onChange={e => setSelectedProductToAdd(e.target.value)}
                className="flex-1 px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Choose product from catalog --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Current Stock: {p.currentStock})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => selectedProductToAdd && handleAddItem(selectedProductToAdd)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3 w-24">Transfer Qty</th>
                  <th className="py-2.5 px-3 text-right w-28">Unit Cost</th>
                  <th className="py-2.5 px-3 text-right w-28">Total Value</th>
                  <th className="py-2.5 px-2 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2 px-3">
                      <p className="font-bold text-slate-800">{item.productName}</p>
                      <span className="text-[10px] text-slate-400 font-mono">{item.sku}</span>
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={e => updateItemQty(idx, parseInt(e.target.value) || 1)}
                        className="w-16 px-2 py-1 border border-slate-200 rounded text-center font-bold"
                      />
                    </td>
                    <td className="py-2 px-3 text-right text-slate-700">
                      {settings.currencySymbol}{item.unitCost.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-right font-black text-slate-900">
                      {settings.currencySymbol}{(item.quantity * item.unitCost).toFixed(2)}
                    </td>
                    <td className="py-2 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200 font-bold text-xs">
                <tr>
                  <td colSpan={3} className="py-2.5 px-3 text-right text-slate-700">Total Transfer Value:</td>
                  <td className="py-2.5 px-3 text-right text-slate-900 font-black">
                    {settings.currencySymbol}{totalValue.toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Transfer Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg"
              >
                <option value="in_transit">In Transit (Dispatched)</option>
                <option value="completed">Completed (Stock Transferred)</option>
                <option value="pending">Pending Preparation</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Shipping / Courier Charges ({settings.currencySymbol})</label>
              <input
                type="number"
                step="0.01"
                value={shippingCharges}
                onChange={e => setShippingCharges(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Logistics / Transfer Notes</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
              placeholder="e.g. Courier tracking code, vehicle license, or package count"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20"
            >
              Dispatch Stock Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
