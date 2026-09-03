import React, { useState } from 'react';
import { X, Printer, CheckCircle2, DollarSign, Download, Building, Phone, Mail, Calendar, User } from 'lucide-react';
import { Transaction } from '../../types';
import { usePOS } from '../../context/POSContext';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, transaction }) => {
  const { settings, currentLocation, recordInvoicePayment } = usePOS();
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(
    Math.max(0, transaction.finalTotal - transaction.amountPaid).toFixed(2)
  );
  const [paymentMethod, setPaymentMethod] = useState('cash');

  if (!isOpen) return null;

  const dueAmount = Math.max(0, transaction.finalTotal - transaction.amountPaid);

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(paymentAmount) || 0;
    if (amt <= 0) return;
    recordInvoicePayment(transaction.id, amt, paymentMethod);
    setShowPaymentForm(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
        {/* Top Control Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-base">Commercial Invoice Details</h3>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                transaction.paymentStatus === 'paid'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : transaction.paymentStatus === 'partial'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}
            >
              {transaction.paymentStatus}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable View */}
        <div id="printable-receipt" className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{settings.businessName}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{currentLocation.name}</p>
              <p className="text-xs text-slate-500">{settings.address}</p>
              <p className="text-xs text-slate-500">Phone: {settings.phone} • Email: {settings.email}</p>
            </div>

            <div className="sm:text-right">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">TAX INVOICE</span>
              <h1 className="text-2xl font-black font-mono text-slate-900 tracking-tight">{transaction.invoiceNo}</h1>
              <p className="text-xs text-slate-500 mt-1">Date: {transaction.transactionDate}</p>
              <p className="text-xs text-slate-500">Salesperson: {transaction.staffName}</p>
            </div>
          </div>

          {/* Customer / Bill To */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Billed To:</span>
              <h4 className="font-bold text-sm text-slate-900 mt-0.5">{transaction.contactName}</h4>
              {transaction.contactMobile && transaction.contactMobile !== 'N/A' && (
                <p className="text-slate-600">Mobile: {transaction.contactMobile}</p>
              )}
            </div>
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Payment Summary:</span>
              <p className="text-slate-600 mt-0.5">Method: <span className="font-semibold uppercase text-slate-800">{transaction.paymentMethod}</span></p>
              <p className="text-slate-600">Status: <span className="font-semibold uppercase text-slate-800">{transaction.paymentStatus}</span></p>
            </div>
          </div>

          {/* Itemized Table */}
          <div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-lg">Item Description</th>
                  <th className="py-2.5 px-3 font-mono">SKU</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-right rounded-r-lg">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transaction.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{item.productName}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{item.sku}</td>
                    <td className="py-2.5 px-3 text-center font-bold">{item.quantity}</td>
                    <td className="py-2.5 px-3 text-right">{settings.currencySymbol}{item.unitPrice.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">{settings.currencySymbol}{item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total Breakdown */}
          <div className="flex justify-end pt-4 border-t border-slate-200">
            <div className="w-64 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-800">{settings.currencySymbol}{transaction.totalBeforeTax.toFixed(2)}</span>
              </div>
              {transaction.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount:</span>
                  <span>-{settings.currencySymbol}{transaction.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>{settings.taxName}:</span>
                <span className="font-semibold text-slate-800">{settings.currencySymbol}{transaction.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Grand Total:</span>
                <span>{settings.currencySymbol}{transaction.finalTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-emerald-700 font-bold pt-1">
                <span>Amount Paid:</span>
                <span>{settings.currencySymbol}{transaction.amountPaid.toFixed(2)}</span>
              </div>
              {dueAmount > 0 && (
                <div className="flex justify-between text-xs text-rose-600 font-bold bg-rose-50 p-1.5 rounded">
                  <span>Balance Due:</span>
                  <span>{settings.currencySymbol}{dueAmount.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {transaction.notes && (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800">
              <span className="font-bold">Notes:</span> {transaction.notes}
            </div>
          )}

          {/* Add Payment Form (If due amount exists) */}
          {dueAmount > 0 && !showPaymentForm && (
            <div className="no-print pt-2 flex justify-end">
              <button
                onClick={() => setShowPaymentForm(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                <DollarSign className="w-4 h-4" />
                <span>Receive / Add Payment</span>
              </button>
            </div>
          )}

          {showPaymentForm && (
            <form onSubmit={handleRecordPayment} className="no-print p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
              <h4 className="font-bold text-xs text-emerald-900 uppercase tracking-wider">Record Payment on Invoice</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Payment Amount ({settings.currencySymbol})</label>
                  <input
                    type="number"
                    step="0.01"
                    max={dueAmount}
                    required
                    value={paymentAmount}
                    onChange={e => setPaymentAmount(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Credit/Debit Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs"
                >
                  Save Payment
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end no-print">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close Invoice
          </button>
        </div>
      </div>
    </div>
  );
};
