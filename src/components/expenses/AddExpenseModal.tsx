import React, { useState } from 'react';
import { X, CreditCard, DollarSign, Calendar, Tag, FileText } from 'lucide-react';
import { usePOS } from '../../context/POSContext';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose }) => {
  const { addExpense, settings, currentLocation } = usePOS();

  const [category, setCategory] = useState('Store Rent & Lease');
  const [amount, setAmount] = useState('150.00');
  const [refNo, setRefNo] = useState(`EXP-${Date.now().toString().slice(-5)}`);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'bank_transfer' | 'cheque'>('cash');
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmt = parseFloat(amount) || 0;
    if (numAmt <= 0) return;

    addExpense({
      category,
      amount: numAmt,
      refNo: refNo.trim() || undefined,
      paymentMethod,
      note: note.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-rose-400" />
            <h3 className="font-bold text-base">Record Operating Expense</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Expense Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-medium"
            >
              <option value="Store Rent & Lease">Store Rent & Lease</option>
              <option value="Electricity & Utilities">Electricity & Utilities</option>
              <option value="Staff Salaries & Wages">Staff Salaries & Wages</option>
              <option value="Packaging & Bags">Packaging & Bags</option>
              <option value="Marketing & Advertising">Marketing & Advertising</option>
              <option value="Equipment & Maintenance">Equipment & Maintenance</option>
              <option value="Internet & Software Subscriptions">Internet & Software Subscriptions</option>
              <option value="Miscellaneous Overhead">Miscellaneous Overhead</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Amount ({settings.currencySymbol}) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full px-3 py-2 text-sm font-bold bg-slate-50 border border-slate-300 rounded-lg focus:bg-white text-rose-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ref / Receipt #</label>
              <input
                type="text"
                value={refNo}
                onChange={e => setRefNo(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-medium"
            >
              <option value="cash">Cash (Deducted from Cash Drawer)</option>
              <option value="card">Company Credit Card</option>
              <option value="bank_transfer">Bank Wire / ACH</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Notes</label>
            <textarea
              rows={2}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Expense justification or vendor details..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
            ></textarea>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-sm"
            >
              Record Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
