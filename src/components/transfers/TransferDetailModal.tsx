import React from 'react';
import { 
  X, 
  ArrowLeftRight, 
  Building2, 
  Calendar, 
  Truck, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Printer, 
  DollarSign, 
  Layers,
  MapPin
} from 'lucide-react';
import { StockTransfer } from '../../types';
import { usePOS } from '../../context/POSContext';

interface TransferDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transfer: StockTransfer | null;
}

export const TransferDetailModal: React.FC<TransferDetailModalProps> = ({
  isOpen,
  onClose,
  transfer,
}) => {
  const { updateStockTransferStatus, locations, settings } = usePOS();

  if (!isOpen || !transfer) return null;

  const fromLoc = locations.find(l => l.id === transfer.fromLocationId);
  const toLoc = locations.find(l => l.id === transfer.toLocationId);

  const getStatusBadge = (status: StockTransfer['status']) => {
    switch (status) {
      case 'pending':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Pending Dispatch</span>;
      case 'in_transit':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200 flex items-center gap-1.5"><Truck className="w-3.5 h-3.5" /> In Transit</span>;
      case 'completed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Received & Completed</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">Cancelled</span>;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-mono tracking-tight">{transfer.refNo}</h2>
                {getStatusBadge(transfer.status)}
              </div>
              <p className="text-xs text-slate-400">Inter-Branch Stock Transfer Manifest & Waybill</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Transfer Route Card */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Origin (Dispatch From)</p>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-500" />
                {transfer.fromLocationName}
              </h4>
              {fromLoc?.landmark && (
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {fromLoc.landmark}, {fromLoc.city}
                </p>
              )}
            </div>

            <div className="border-t sm:border-t-0 sm:border-l border-slate-200 sm:pl-4 pt-3 sm:pt-0">
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Destination (Deliver To)</p>
              <h4 className="text-sm font-bold text-blue-900 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-600" />
                {transfer.toLocationName}
              </h4>
              {toLoc?.landmark && (
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {toLoc.landmark}, {toLoc.city}
                </p>
              )}
            </div>
          </div>

          {/* Transfer Metadata */}
          <div className="grid grid-cols-3 gap-3 bg-slate-100/70 p-3 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Transfer Date</span>
              <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3 text-slate-400" />
                {transfer.date}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Value</span>
              <span className="font-mono font-bold text-slate-900 mt-0.5 block">
                {settings.currencySymbol}{transfer.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Shipping Charges</span>
              <span className="font-mono font-bold text-slate-700 mt-0.5 block">
                {settings.currencySymbol}{transfer.shippingCharges.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Transferred Items Manifest ({transfer.items.length})</span>
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Item / SKU</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Cost</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {transfer.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{item.productName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{item.sku}</div>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-900 font-mono">
                        {item.quantity}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                        {settings.currencySymbol}{item.unitCost.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {settings.currencySymbol}{(item.quantity * item.unitCost).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          {transfer.notes && (
            <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-xs text-amber-900">
              <span className="font-bold block mb-0.5">Logistics & Handling Instructions:</span>
              <p>{transfer.notes}</p>
            </div>
          )}

          {/* Status Change Control */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between flex-wrap gap-3">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Update Transfer Status</span>
              <span className="text-[11px] text-slate-500">Advance pipeline to reflect physical movement</span>
            </div>

            <div className="flex items-center gap-2">
              {transfer.status === 'pending' && (
                <button
                  onClick={() => updateStockTransferStatus(transfer.id, 'in_transit')}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Dispatch (In Transit)</span>
                </button>
              )}
              {(transfer.status === 'pending' || transfer.status === 'in_transit') && (
                <button
                  onClick={() => updateStockTransferStatus(transfer.id, 'completed')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Received & Completed</span>
                </button>
              )}
              {transfer.status !== 'completed' && transfer.status !== 'cancelled' && (
                <button
                  onClick={() => updateStockTransferStatus(transfer.id, 'cancelled')}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-rose-100 hover:text-rose-700 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel Transfer
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200/80 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Waybill</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
