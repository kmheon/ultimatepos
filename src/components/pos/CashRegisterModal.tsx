import React, { useState } from 'react';
import { X, DollarSign, Lock, Unlock, TrendingUp, CreditCard, Receipt, AlertTriangle } from 'lucide-react';
import { usePOS } from '../../context/POSContext';

interface CashRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CashRegisterModal: React.FC<CashRegisterModalProps> = ({ isOpen, onClose }) => {
  const { cashRegister, closeRegister, openRegister, settings, currentLocation } = usePOS();
  const [closingCash, setClosingCash] = useState<string>(cashRegister.cashInDrawer.toFixed(2));
  const [openCash, setOpenCash] = useState<string>('250.00');
  const [notes, setNotes] = useState<string>('');
  const [isClosingConfirm, setIsClosingConfirm] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCloseShift = (e: React.FormEvent) => {
    e.preventDefault();
    closeRegister(parseFloat(closingCash) || 0, notes);
    setIsClosingConfirm(false);
    onClose();
  };

  const handleOpenShift = (e: React.FormEvent) => {
    e.preventDefault();
    openRegister(parseFloat(openCash) || 0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-base">Cash Register & Shift Control</h3>
              <p className="text-xs text-slate-400">{currentLocation.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {cashRegister.status === 'open' ? (
          <div className="p-6 space-y-5">
            {/* Shift Status Banner */}
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                <div>
                  <p className="text-xs font-bold text-emerald-900">Current Shift Active</p>
                  <p className="text-[11px] text-emerald-700">Opened at: {cashRegister.openedAt} by {cashRegister.userName}</p>
                </div>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider bg-emerald-600 text-white px-2.5 py-1 rounded-full">
                Open
              </span>
            </div>

            {/* Financial Stats Breakdown */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-medium">Opening Cash:</span>
                <p className="text-base font-bold text-slate-800">
                  {settings.currencySymbol}{cashRegister.openingCash.toFixed(2)}
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-medium">Cash Sales:</span>
                <p className="text-base font-bold text-emerald-600">
                  +{settings.currencySymbol}{cashRegister.totalCashSales.toFixed(2)}
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-medium">Card & Digital Sales:</span>
                <p className="text-base font-bold text-blue-600">
                  +{settings.currencySymbol}{cashRegister.totalCardSales.toFixed(2)}
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-medium">Cash Expenses / Payout:</span>
                <p className="text-base font-bold text-rose-600">
                  -{settings.currencySymbol}{cashRegister.totalExpenses.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Drawer Total */}
            <div className="p-4 bg-slate-900 rounded-xl text-white flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Calculated Cash in Drawer</p>
                <h3 className="text-2xl font-extrabold text-emerald-400">
                  {settings.currencySymbol}{cashRegister.cashInDrawer.toFixed(2)}
                </h3>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-400/40" />
            </div>

            {/* Close Shift Form */}
            {isClosingConfirm ? (
              <form onSubmit={handleCloseShift} className="bg-rose-50 border border-rose-200 p-4 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Confirm Closing Cash Count</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Physical Cash Counted in Drawer ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={closingCash}
                    onChange={e => setClosingCash(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-hidden font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Closing Notes / Discrepancy Note
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="e.g. Exact count matches. Shift completed smoothly."
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                  ></textarea>
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsClosingConfirm(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-sm"
                  >
                    Confirm & Close Shift
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  onClick={() => setIsClosingConfirm(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Close Shift & Reconcile
                </button>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleOpenShift} className="p-6 space-y-4">
            <div className="text-center py-3 bg-amber-50 rounded-xl border border-amber-200">
              <Lock className="w-8 h-8 text-amber-600 mx-auto mb-1" />
              <h4 className="font-bold text-sm text-amber-900">Register is Currently Closed</h4>
              <p className="text-xs text-amber-700">Enter the opening cash amount float to start a new shift.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Opening Cash Balance ({settings.currencySymbol})
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={openCash}
                onChange={e => setOpenCash(e.target.value)}
                className="w-full px-3 py-2 text-base font-bold bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm"
              >
                <Unlock className="w-3.5 h-3.5" />
                Open Register Shift
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
