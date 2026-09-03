import React from 'react';
import { X, Printer, CheckCircle, Download, ShoppingBag } from 'lucide-react';
import { Transaction } from '../../types';
import { usePOS } from '../../context/POSContext';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, transaction }) => {
  const { settings, currentLocation } = usePOS();

  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
        {/* Top Control Bar */}
        <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-xs">Sale Successful • Receipt Ready</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-center gap-2 no-print">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Receipt (Thermal / A4)
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            New POS Sale
          </button>
        </div>

        {/* Thermal Slip Content */}
        <div 
          id="printable-receipt"
          className="p-6 bg-white font-mono text-slate-900 text-xs leading-relaxed max-h-[70vh] overflow-y-auto select-text"
        >
          {/* Header */}
          <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-400">
            <h2 className="text-base font-extrabold uppercase tracking-wide">{settings.businessName}</h2>
            <p className="text-[11px] text-slate-600">{currentLocation.name}</p>
            <p className="text-[11px] text-slate-600">{settings.address}</p>
            <p className="text-[11px] text-slate-600">Tel: {settings.phone}</p>
            <div className="pt-1 whitespace-pre-line text-[10px] text-slate-500 font-sans">
              {settings.receiptHeader}
            </div>
          </div>

          {/* Invoice Meta */}
          <div className="py-2 border-b border-dashed border-slate-400 text-[11px] space-y-0.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Invoice No:</span>
              <span className="font-bold">{transaction.invoiceNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date/Time:</span>
              <span>{transaction.transactionDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Cashier:</span>
              <span>{transaction.staffName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Customer:</span>
              <span className="font-semibold">{transaction.contactName}</span>
            </div>
            {transaction.contactMobile && transaction.contactMobile !== 'N/A' && (
              <div className="flex justify-between">
                <span className="text-slate-500">Mobile:</span>
                <span>{transaction.contactMobile}</span>
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="py-2 border-b border-dashed border-slate-400">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] uppercase text-slate-500">
                  <th className="py-1">Item</th>
                  <th className="py-1 text-center">Qty</th>
                  <th className="py-1 text-right">Price</th>
                  <th className="py-1 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transaction.items.map((item, idx) => (
                  <tr key={idx} className="text-[11px]">
                    <td className="py-1 pr-1 font-medium">
                      <div>{item.productName}</div>
                      <span className="text-[9px] text-slate-400 font-sans">{item.sku}</span>
                    </td>
                    <td className="py-1 text-center align-top">{item.quantity}</td>
                    <td className="py-1 text-right align-top">{settings.currencySymbol}{item.unitPrice.toFixed(2)}</td>
                    <td className="py-1 text-right font-bold align-top">{settings.currencySymbol}{item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown */}
          <div className="py-2 space-y-1 text-[11px] border-b border-dashed border-slate-400">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{settings.currencySymbol}{transaction.totalBeforeTax.toFixed(2)}</span>
            </div>
            {transaction.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount:</span>
                <span>-{settings.currencySymbol}{transaction.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Tax ({settings.taxName}):</span>
              <span>{settings.currencySymbol}{transaction.taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-extrabold text-sm pt-1 border-t border-slate-300">
              <span>TOTAL PAYABLE:</span>
              <span>{settings.currencySymbol}{transaction.finalTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Detail */}
          <div className="py-2 border-b border-dashed border-slate-400 text-[11px] space-y-0.5">
            <div className="flex justify-between">
              <span className="uppercase font-semibold">Paid via ({transaction.paymentMethod}):</span>
              <span className="font-bold">{settings.currencySymbol}{transaction.amountPaid.toFixed(2)}</span>
            </div>
            {transaction.changeReturn && transaction.changeReturn > 0 ? (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Change Returned:</span>
                <span>{settings.currencySymbol}{transaction.changeReturn.toFixed(2)}</span>
              </div>
            ) : null}
            {transaction.finalTotal > transaction.amountPaid && (
              <div className="flex justify-between text-rose-600 font-bold">
                <span>Balance Due:</span>
                <span>{settings.currencySymbol}{(transaction.finalTotal - transaction.amountPaid).toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Barcode & Footer */}
          <div className="text-center pt-4 space-y-2">
            {/* Pseudo Barcode */}
            <div className="flex justify-center items-center py-1">
              <div className="h-10 flex items-center justify-center gap-0.5 bg-slate-100 px-3 py-1 rounded border border-slate-300">
                {[4, 2, 6, 2, 4, 3, 1, 5, 2, 6, 3, 2, 5, 1, 4, 2, 3, 6, 2, 4].map((w, i) => (
                  <span key={i} className="bg-slate-900 h-full inline-block" style={{ width: `${w * 1.5}px` }}></span>
                ))}
              </div>
            </div>
            <p className="text-[10px] text-slate-500 font-bold tracking-widest">{transaction.invoiceNo}</p>
            <div className="text-[10px] text-slate-500 whitespace-pre-line font-sans pt-1">
              {settings.receiptFooter}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Done & Close
          </button>
        </div>
      </div>
    </div>
  );
};
