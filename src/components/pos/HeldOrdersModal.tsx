import React from 'react';
import { X, PauseCircle, Play, Trash2, Clock, User } from 'lucide-react';
import { usePOS } from '../../context/POSContext';

interface HeldOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HeldOrdersModal: React.FC<HeldOrdersModalProps> = ({ isOpen, onClose }) => {
  const { heldOrders, resumeHeldOrder, deleteHeldOrder, settings } = usePOS();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PauseCircle className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base">Suspended / Held Orders</h3>
            <span className="bg-amber-500/20 text-amber-300 text-xs px-2 py-0.5 rounded-full font-bold border border-amber-500/30">
              {heldOrders.length}
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
          {heldOrders.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <PauseCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-medium text-sm">No suspended carts</p>
              <p className="text-xs text-slate-400">Orders placed on hold will appear here for fast retrieval.</p>
            </div>
          ) : (
            heldOrders.map(order => (
              <div
                key={order.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/30 transition-all flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-sm text-slate-900">{order.customer.name}</span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {order.timestamp}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600">
                    <span>{order.cart.reduce((a, b) => a + b.quantity, 0)} Items</span>
                    <span className="mx-2">•</span>
                    <span className="font-bold text-slate-900">{settings.currencySymbol}{order.total.toFixed(2)}</span>
                  </div>

                  {order.note && (
                    <p className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">
                      Note: {order.note}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      resumeHeldOrder(order.id);
                      onClose();
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 shadow-xs transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Resume
                  </button>
                  <button
                    onClick={() => deleteHeldOrder(order.id)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete suspended order"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
