import React, { useState } from 'react';
import { X, SlidersHorizontal, Plus, Minus, AlertCircle } from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { Product } from '../../types';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const { adjustStock } = usePOS();
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'deduct'>('add');
  const [quantity, setQuantity] = useState<string>('5');
  const [reason, setReason] = useState<string>('Physical count reconciliation');

  if (!isOpen || !product) return null;

  const numQty = parseInt(quantity) || 0;
  const newProjectedStock =
    adjustmentType === 'add'
      ? product.currentStock + numQty
      : Math.max(0, product.currentStock - numQty);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numQty <= 0) return;

    const change = adjustmentType === 'add' ? numQty : -numQty;
    adjustStock(product.id, change, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-base">Adjust Stock Level</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="font-bold text-xs text-slate-800">{product.name}</h4>
            <p className="text-[11px] text-slate-500 font-mono">SKU: {product.sku}</p>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500">Current Stock:</span>
              <span className="font-extrabold text-slate-900">{product.currentStock} {product.unit}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Adjustment Action</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAdjustmentType('add')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                  adjustmentType === 'add'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add / Stock In</span>
              </button>

              <button
                type="button"
                onClick={() => setAdjustmentType('deduct')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                  adjustmentType === 'deduct'
                    ? 'bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-500/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Minus className="w-3.5 h-3.5" />
                <span>Deduct / Damaged</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Adjustment Quantity</label>
            <input
              type="number"
              min="1"
              required
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              className="w-full px-3 py-2 text-sm font-bold bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Adjustment</label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
            >
              <option value="Physical count reconciliation">Physical count reconciliation</option>
              <option value="Damaged / Expired stock">Damaged / Expired stock</option>
              <option value="Inventory loss / Theft">Inventory loss / Theft</option>
              <option value="Sample / Internal store usage">Sample / Internal store usage</option>
              <option value="Supplier bonus / Extra quantity">Supplier bonus / Extra quantity</option>
            </select>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs flex items-center justify-between text-blue-900">
            <span>Projected New Stock:</span>
            <span className="text-base font-extrabold">{newProjectedStock} {product.unit}</span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm"
            >
              Save Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
