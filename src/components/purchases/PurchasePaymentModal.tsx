import React, { useState } from 'react';
import { X, DollarSign, CreditCard, Building2, Receipt, CheckCircle2 } from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { Transaction } from '../../types';

interface PurchasePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Transaction;
  onSuccess?: () => void;
}

export const PurchasePaymentModal: React.FC<PurchasePaymentModalProps> = ({
  isOpen,
  onClose,
  order,
  onSuccess
}) => {
  const { recordInvoicePayment, settings } = usePOS();
  
  const due = Math.max(0, order.finalTotal - order.amountPaid);
  const [payAmount, setPayAmount] = useState(due > 0 ? due.toFixed(2) : '0.00');
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'cheque' | 'card' | 'cash'>('bank_transfer');
  const [referenceNo, setReferenceNo] = useState(`PAY-TX-${Date.now().toString().slice(-6)}`);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentNotes, setPaymentNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(payAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    recordInvoicePayment(order.id, parsedAmount, paymentMethod);

    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600/30 text-emerald-400 rounded-xl border border-emerald-500/30">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Record Supplier Payment</h3>
              <p className="text-xs text-slate-400 font-mono">PO: {order.invoiceNo || order.refNo}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Supplier Info & Balance card */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vendor / Supplier</span>
              <span className="text-xs font-bold text-slate-900">{order.contactName}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-center">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">PO Total</div>
                <div className="text-xs font-black text-slate-900 mt-0.5">
                  {settings.currencySymbol}{order.finalTotal.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Paid To Date</div>
                <div className="text-xs font-black text-emerald-600 mt-0.5">
                  {settings.currencySymbol}{order.amountPaid.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Outstanding Due</div>
                <div className="text-xs font-black text-rose-600 mt-0.5">
                  {settings.currencySymbol}{due.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Amount */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">Payment Amount ({settings.currencySymbol})</label>
              <button
                type="button"
                onClick={() => setPayAmount(due.toFixed(2))}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700"
              >
                Pay Full Due ({settings.currencySymbol}{due.toFixed(2)})
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2.5 font-bold text-slate-400 text-xs">{settings.currencySymbol}</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={due > 0 ? due : undefined}
                required
                value={payAmount}
                onChange={e => setPayAmount(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm font-black text-slate-900 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Payment Method & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-medium"
              >
                <option value="bank_transfer">Direct Bank Wire / EFT</option>
                <option value="cheque">Company Cheque</option>
                <option value="card">Corporate Credit Card</option>
                <option value="cash">Petty Cash Drawer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Date</label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={e => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-medium"
              />
            </div>
          </div>

          {/* Reference # */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Payment Reference / Cheque #</label>
            <input
              type="text"
              value={referenceNo}
              onChange={e => setReferenceNo(e.target.value)}
              placeholder="e.g. WIRE-883920 or CHQ-0021"
              className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-xl"
            />
          </div>

          {/* Payment Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Payment Notes / Reconciliation</label>
            <input
              type="text"
              value={paymentNotes}
              onChange={e => setPaymentNotes(e.target.value)}
              placeholder="e.g. Authorized by CFO David Sterling against invoice"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-blue-200 transition-all cursor-pointer"
            >
              Record Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
