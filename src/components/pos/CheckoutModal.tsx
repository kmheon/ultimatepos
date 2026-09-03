import React, { useState } from 'react';
import { X, CreditCard, Banknote, Building2, FileText, CheckCircle2, Calculator } from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { Transaction } from '../../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (tx: Transaction) => void;
}

type PaymentMethodType = 'cash' | 'card' | 'bank_transfer' | 'cheque' | 'multiple';

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { cartTotal, cart, selectedCustomer, processCheckout, settings } = usePOS();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('cash');
  const [tenderedAmount, setTenderedAmount] = useState<string>(cartTotal.toFixed(2));
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const numericTendered = parseFloat(tenderedAmount) || 0;
  const changeDue = paymentMethod === 'cash' ? Math.max(0, numericTendered - cartTotal) : 0;
  const dueRemaining = Math.max(0, cartTotal - numericTendered);

  const handleQuickCash = (amt: number) => {
    setTenderedAmount(amt.toFixed(2));
  };

  const handleExactCash = () => {
    setTenderedAmount(cartTotal.toFixed(2));
  };

  const handleNextRound = () => {
    const next10 = Math.ceil(cartTotal / 10) * 10;
    setTenderedAmount(next10.toFixed(2));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const tx = processCheckout({
      method: paymentMethod,
      amountPaid: paymentMethod === 'cash' ? numericTendered : cartTotal,
      notes: notes.trim() || undefined,
    });

    onSuccess(tx);
  };

  const methods: { id: PaymentMethodType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'cash', label: 'Cash', icon: Banknote },
    { id: 'card', label: 'Credit/Debit Card', icon: CreditCard },
    { id: 'bank_transfer', label: 'Bank Wire / ACH', icon: Building2 },
    { id: 'cheque', label: 'Cheque', icon: FileText },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">Finalize Payment & Checkout</h3>
            <p className="text-xs text-slate-400">Customer: {selectedCustomer.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Total Banner */}
          <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl text-white flex items-center justify-between shadow-lg shadow-blue-500/20">
            <div>
              <p className="text-xs uppercase font-bold tracking-wider text-blue-200">Payable Amount</p>
              <h2 className="text-3xl font-extrabold tracking-tight">
                {settings.currencySymbol}{cartTotal.toFixed(2)}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-medium backdrop-blur-xs">
                {cart.reduce((a, b) => a + b.quantity, 0)} Items
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Payment Method
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {methods.map(m => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(m.id);
                      if (m.id !== 'cash') {
                        setTenderedAmount(cartTotal.toFixed(2));
                      }
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-blue-600 text-blue-700 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cash Tendered Input & Calculator */}
          {paymentMethod === 'cash' && (
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Cash Received / Tendered
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleExactCash}
                    className="px-2 py-1 text-[11px] font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 rounded transition-colors"
                  >
                    Exact
                  </button>
                  <button
                    type="button"
                    onClick={handleNextRound}
                    className="px-2 py-1 text-[11px] font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 rounded transition-colors"
                  >
                    Round Up
                  </button>
                </div>
              </div>

              <div className="relative">
                <span className="absolute left-4 top-3 text-lg font-bold text-slate-400">
                  {settings.currencySymbol}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={tenderedAmount}
                  onChange={e => setTenderedAmount(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-2xl font-bold text-slate-900 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Quick Cash Buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                {[10, 20, 50, 100, 200, 500].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleQuickCash(amt)}
                    className="px-3 py-1 bg-white hover:bg-blue-50 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-xs font-bold rounded-lg border border-slate-200 shadow-2xs transition-colors"
                  >
                    +{settings.currencySymbol}{amt}
                  </button>
                ))}
              </div>

              {/* Live Calculation Display */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                    Change Due to Customer
                  </span>
                  <p className="text-xl font-extrabold text-emerald-600">
                    {settings.currencySymbol}{changeDue.toFixed(2)}
                  </p>
                </div>

                <div className="bg-slate-100 border border-slate-200 p-2.5 rounded-lg">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                    Balance Remaining
                  </span>
                  <p className={`text-xl font-extrabold ${dueRemaining > 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                    {settings.currencySymbol}{dueRemaining.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Transaction Notes / Ref Number (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Card Authorization code / PO Number"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-500/25 transition-all transform active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              Complete Sale & Print
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
