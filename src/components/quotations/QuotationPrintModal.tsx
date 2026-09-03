import React, { useRef } from 'react';
import { X, Printer, FileSpreadsheet, MapPin, Phone, Mail, CheckCircle2 } from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { Quotation } from '../../types';

interface QuotationPrintModalProps {
  quotation: Quotation;
  onClose: () => void;
}

export const QuotationPrintModal: React.FC<QuotationPrintModalProps> = ({ quotation, onClose }) => {
  const { settings, currentLocation } = usePOS();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-3 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-blue-400" />
            <span className="font-bold text-sm">Formal Quotation: {quotation.quoteNo}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Quote</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Area */}
        <div ref={printRef} className="p-8 space-y-6 text-slate-900 bg-white">
          <div className="flex justify-between items-start border-b border-slate-200 pb-6">
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900">
                {settings.businessName}
              </h1>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mt-0.5">
                Official Commercial Quotation
              </p>
              <div className="text-xs text-slate-500 mt-2 space-y-0.5">
                <p className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> {currentLocation.landmark || settings.address}</p>
                <p className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {settings.phone} | <Mail className="w-3 h-3 text-slate-400" /> {settings.email}</p>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-black rounded-md tracking-wider">
                PRICE ESTIMATE
              </div>
              <p className="text-lg font-black text-slate-900 mt-2">{quotation.quoteNo}</p>
              <p className="text-xs text-slate-500">Date Issued: {quotation.date}</p>
              <p className="text-xs text-rose-600 font-bold">Valid Until: {quotation.validUntil}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1">
              <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Prepared For Client</p>
              <p className="font-black text-slate-900 text-sm">{quotation.customerName}</p>
              <p className="text-slate-600">Contact: {quotation.customerMobile || 'Direct'}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1">
              <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Issued By Branch</p>
              <p className="font-bold text-slate-900 text-sm">{quotation.locationName}</p>
              <p className="text-slate-600">Status: <span className="uppercase font-bold text-blue-600">{quotation.status}</span></p>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-600 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">#</th>
                  <th className="py-2.5 px-4">Item & Specifications</th>
                  <th className="py-2.5 px-4 text-center">Qty</th>
                  <th className="py-2.5 px-4 text-right">Unit Price</th>
                  <th className="py-2.5 px-4 text-right">Discount</th>
                  <th className="py-2.5 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotation.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-4 text-slate-400 font-bold">{idx + 1}</td>
                    <td className="py-2.5 px-4">
                      <p className="font-bold text-slate-900">{item.productName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">SKU: {item.sku}</p>
                    </td>
                    <td className="py-2.5 px-4 text-center font-bold text-slate-800">{item.quantity}</td>
                    <td className="py-2.5 px-4 text-right text-slate-700">{settings.currencySymbol}{item.unitPrice.toFixed(2)}</td>
                    <td className="py-2.5 px-4 text-right text-emerald-600 font-semibold">
                      {item.discount > 0 ? `-${settings.currencySymbol}${item.discount.toFixed(2)}` : '-'}
                    </td>
                    <td className="py-2.5 px-4 text-right font-black text-slate-900">
                      {settings.currencySymbol}{item.subtotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200 font-bold">
                <tr>
                  <td colSpan={5} className="py-2 px-4 text-right text-slate-600">Subtotal:</td>
                  <td className="py-2 px-4 text-right text-slate-900 font-bold">{settings.currencySymbol}{quotation.subtotal.toFixed(2)}</td>
                </tr>
                {quotation.discountAmount > 0 && (
                  <tr>
                    <td colSpan={5} className="py-1.5 px-4 text-right text-emerald-600">Special Discount:</td>
                    <td className="py-1.5 px-4 text-right text-emerald-600 font-bold">-{settings.currencySymbol}{quotation.discountAmount.toFixed(2)}</td>
                  </tr>
                )}
                <tr>
                  <td colSpan={5} className="py-1.5 px-4 text-right text-slate-600">Sales Tax:</td>
                  <td className="py-1.5 px-4 text-right text-slate-900 font-bold">{settings.currencySymbol}{quotation.taxAmount.toFixed(2)}</td>
                </tr>
                <tr className="border-t border-slate-200 text-sm">
                  <td colSpan={5} className="py-3 px-4 text-right text-slate-900 font-black">Final Quoted Total:</td>
                  <td className="py-3 px-4 text-right text-blue-600 font-black text-base">
                    {settings.currencySymbol}{quotation.finalTotal.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Notes & Terms */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
            {quotation.notes && (
              <div>
                <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider block">Notes:</span>
                <p className="text-slate-700">{quotation.notes}</p>
              </div>
            )}
            {quotation.termsAndConditions && (
              <div>
                <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider block">Terms & Conditions:</span>
                <p className="text-slate-600">{quotation.termsAndConditions}</p>
              </div>
            )}
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 text-xs text-slate-500">
            <div>
              <div className="border-b border-slate-300 w-48 mb-1"></div>
              <p className="font-semibold text-slate-700">Client Acceptance Signature</p>
              <p className="text-[10px]">Date: ____________________</p>
            </div>
            <div className="text-right">
              <div className="border-b border-slate-300 w-48 ml-auto mb-1"></div>
              <p className="font-semibold text-slate-700">Authorized Sales Representative</p>
              <p className="text-[10px]">{settings.businessName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
