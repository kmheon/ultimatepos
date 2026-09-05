import React, { useState } from 'react';
import { 
  X, 
  Truck, 
  PackageCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Building, 
  Barcode, 
  FileText, 
  Check
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { Transaction } from '../../types';

interface GoodsReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Transaction;
  onSuccess?: () => void;
}

export const GoodsReceiptModal: React.FC<GoodsReceiptModalProps> = ({
  isOpen,
  onClose,
  order,
  onSuccess
}) => {
  const { receivePurchaseOrder, adjustStock, locations, currentLocation } = usePOS();
  
  const [consignmentNote, setConsignmentNote] = useState(`GRN-${Date.now().toString().slice(-6)}`);
  const [carrierReference, setCarrierReference] = useState(order.delivery?.trackingCode || '');
  const [warehouseLocation, setWarehouseLocation] = useState(order.locationName || currentLocation.name);
  const [inspectionResult, setInspectionResult] = useState<'passed' | 'partial_damage' | 'discrepancy'>('passed');
  const [receivingNotes, setReceivingNotes] = useState('');
  
  // Received quantities for each line item
  const [itemReceipts, setItemReceipts] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    order.items.forEach(item => {
      initial[item.productId] = item.quantity;
    });
    return initial;
  });

  if (!isOpen) return null;

  const handleSetAllMax = () => {
    const updated: Record<string, number> = {};
    order.items.forEach(item => {
      updated[item.productId] = item.quantity;
    });
    setItemReceipts(updated);
  };

  const handleQuantityChange = (productId: string, val: number, max: number) => {
    const clamped = Math.max(0, Math.min(max, val));
    setItemReceipts(prev => ({
      ...prev,
      [productId]: clamped
    }));
  };

  const totalOrderedQty = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalReceivingQty = Object.values(itemReceipts).reduce((sum, qty) => sum + qty, 0);
  const isFullReceipt = totalReceivingQty >= totalOrderedQty;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // If previously not received, increment stock for each item
    if (order.status !== 'received') {
      order.items.forEach(item => {
        const qtyToReceive = itemReceipts[item.productId] ?? item.quantity;
        if (qtyToReceive > 0) {
          adjustStock(
            item.productId, 
            qtyToReceive, 
            `Goods Receipt (GRN: ${consignmentNote}) for ${order.invoiceNo || order.refNo}`
          );
        }
      });
    }

    const grnSummary = `GRN: ${consignmentNote} | Carrier Ref: ${carrierReference || 'N/A'} | Inspected: ${inspectionResult} | Location: ${warehouseLocation}${receivingNotes ? ` | Note: ${receivingNotes}` : ''}`;
    receivePurchaseOrder(order.id, grnSummary);

    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/30 text-blue-400 rounded-xl border border-blue-500/30">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                <span>Goods Receipt Note (GRN)</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {order.invoiceNo || order.refNo}
                </span>
              </h3>
              <p className="text-xs text-slate-400">Verify warehouse inbound stock delivery from {order.contactName}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          {/* Warehouse & Consignment info banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                GRN Number
              </label>
              <input
                type="text"
                required
                value={consignmentNote}
                onChange={e => setConsignmentNote(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Receiving Hub / Dock
              </label>
              <select
                value={warehouseLocation}
                onChange={e => setWarehouseLocation(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
              >
                {locations.map(loc => (
                  <option key={loc.id} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Carrier Waybill / Tracking #
              </label>
              <input
                type="text"
                value={carrierReference}
                onChange={e => setCarrierReference(e.target.value)}
                placeholder="e.g. FDX-9938201948"
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-mono text-slate-900"
              />
            </div>
          </div>

          {/* Inspection Condition */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              QC Cargo Inspection & Condition
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                inspectionResult === 'passed' 
                  ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900' 
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}>
                <input
                  type="radio"
                  name="inspection"
                  checked={inspectionResult === 'passed'}
                  onChange={() => setInspectionResult('passed')}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Passed 100%</span>
                  </div>
                  <div className="text-[11px] text-slate-500">Perfect factory condition</div>
                </div>
              </label>

              <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                inspectionResult === 'partial_damage' 
                  ? 'border-amber-500 bg-amber-50/50 text-amber-900' 
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}>
                <input
                  type="radio"
                  name="inspection"
                  checked={inspectionResult === 'partial_damage'}
                  onChange={() => setInspectionResult('partial_damage')}
                  className="text-amber-600 focus:ring-amber-500"
                />
                <div>
                  <div className="text-xs font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Minor Damage</span>
                  </div>
                  <div className="text-[11px] text-slate-500">Packaging tear / scuffs</div>
                </div>
              </label>

              <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                inspectionResult === 'discrepancy' 
                  ? 'border-rose-500 bg-rose-50/50 text-rose-900' 
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}>
                <input
                  type="radio"
                  name="inspection"
                  checked={inspectionResult === 'discrepancy'}
                  onChange={() => setInspectionResult('discrepancy')}
                  className="text-rose-600 focus:ring-rose-500"
                />
                <div>
                  <div className="text-xs font-bold flex items-center gap-1">
                    <X className="w-3.5 h-3.5 text-rose-600" />
                    <span>Qty Shortage</span>
                  </div>
                  <div className="text-[11px] text-slate-500">Partial shipment received</div>
                </div>
              </label>
            </div>
          </div>

          {/* Line items checklist */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Line Items Inbound Verification</span>
              <button
                type="button"
                onClick={handleSetAllMax}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                Fill All Quantities
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
              <div className="grid grid-cols-12 bg-slate-50 px-3.5 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <div className="col-span-7">Product SKU & Name</div>
                <div className="col-span-2 text-center">Ordered</div>
                <div className="col-span-3 text-right">Received Now</div>
              </div>

              {order.items.map(item => (
                <div key={item.productId} className="grid grid-cols-12 px-3.5 py-2.5 items-center text-xs">
                  <div className="col-span-7 pr-2">
                    <div className="font-semibold text-slate-900 truncate">{item.productName}</div>
                    <div className="text-[11px] font-mono text-slate-400">{item.sku}</div>
                  </div>
                  <div className="col-span-2 text-center font-bold text-slate-700">
                    {item.quantity}
                  </div>
                  <div className="col-span-3 flex justify-end">
                    <input
                      type="number"
                      min={0}
                      max={item.quantity}
                      value={itemReceipts[item.productId] ?? item.quantity}
                      onChange={e => handleQuantityChange(item.productId, parseInt(e.target.value) || 0, item.quantity)}
                      className="w-20 px-2 py-1 text-xs text-right font-bold bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Receiving notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Receiving Bay Notes / Inspection Remarks
            </label>
            <textarea
              rows={2}
              value={receivingNotes}
              onChange={e => setReceivingNotes(e.target.value)}
              placeholder="e.g. Pallet #4 unloaded in Dock Bay A. Barcodes scanned and verified with packing slip."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Total Receiving: <span className="font-bold text-slate-900">{totalReceivingQty}</span> of <span className="font-bold text-slate-900">{totalOrderedQty}</span> units
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-emerald-200 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Confirm Stock In (GRN)</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
