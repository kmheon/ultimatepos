import React, { useRef } from 'react';
import { 
  X, 
  Printer, 
  Truck, 
  Building, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  PackageCheck,
  CreditCard,
  FileText,
  Barcode
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { Transaction } from '../../types';

interface PurchaseOrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Transaction;
  onOpenGRN?: () => void;
  onOpenPayment?: () => void;
}

export const PurchaseOrderDetailModal: React.FC<PurchaseOrderDetailModalProps> = ({
  isOpen,
  onClose,
  order,
  onOpenGRN,
  onOpenPayment
}) => {
  const { settings, contacts, locations } = usePOS();
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const supplier = contacts.find(c => c.id === order.contactId);
  const location = locations.find(l => l.id === order.locationId);
  const due = Math.max(0, order.finalTotal - order.amountPaid);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150 flex flex-col max-h-[92vh] print:max-h-none print:border-none print:shadow-none">
        {/* Modal Top Bar (Hidden on print) */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/30 text-blue-400 rounded-xl border border-blue-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                <span>Purchase Order</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {order.invoiceNo || order.refNo}
                </span>
              </h3>
              <p className="text-xs text-slate-400">Issued to {order.contactName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable PO Document Canvas */}
        <div ref={printRef} className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-slate-800 bg-white">
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
                  NE
                </div>
                <h1 className="text-xl font-black tracking-tight text-slate-900">{settings.businessName}</h1>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Enterprise Procurement & Supply Chain Division
                <br />
                {location ? `${location.landmark ? location.landmark + ', ' : ''}${location.city}, ${location.state}` : settings.address || '100 Innovation Parkway, Suite 400'}
                <br />
                Tax Reg: {settings.taxName ? `${settings.taxName} (${settings.taxRate}%)` : 'US-CORP-948210-ERP'}
              </p>
            </div>

            <div className="sm:text-right">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">
                Official Purchase Order
              </span>
              <div className="text-2xl font-black text-blue-600 font-mono mt-0.5">
                {order.invoiceNo || order.refNo}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Order Date: <span className="font-semibold text-slate-800">{order.transactionDate}</span>
              </div>
              {order.delivery?.expectedDate && (
                <div className="text-xs text-slate-500">
                  Target Delivery: <span className="font-semibold text-slate-800">{order.delivery.expectedDate}</span>
                </div>
              )}
            </div>
          </div>

          {/* Status & Highlights Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fulfillment Status</span>
              <span className={`inline-flex items-center gap-1 font-bold mt-1 px-2 py-0.5 rounded-full text-[11px] uppercase ${
                order.status === 'received' 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : order.status === 'pending'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {order.status === 'received' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                {order.status}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Payment Status</span>
              <span className={`inline-flex items-center gap-1 font-bold mt-1 px-2 py-0.5 rounded-full text-[11px] uppercase ${
                order.paymentStatus === 'paid' 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : order.paymentStatus === 'partial'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}>
                {order.paymentStatus}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Payment Terms</span>
              <span className="font-bold text-slate-800 uppercase mt-1 block">
                {order.paymentMethod.replace('_', ' ')}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Authorized Buyer</span>
              <span className="font-bold text-slate-800 mt-1 block truncate">
                {order.staffName || 'Procurement Officer'}
              </span>
            </div>
          </div>

          {/* Two Columns: Vendor & Ship-To */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block mb-1">
                Vendor / Supplier
              </span>
              <h4 className="font-bold text-sm text-slate-900">{order.contactName}</h4>
              {supplier?.businessName && (
                <p className="text-xs text-slate-600 font-medium">{supplier.businessName}</p>
              )}
              <p className="text-xs text-slate-500 mt-1">
                {supplier?.address || 'Supplier Distribution Depot, Logistics Gate 4'}
                <br />
                Phone: {order.contactMobile || supplier?.mobile || 'N/A'}
                <br />
                Email: {supplier?.email || 'sales@supplier-network.com'}
                {supplier?.taxNumber && (
                  <>
                    <br />
                    Tax/VAT: {supplier.taxNumber}
                  </>
                )}
              </p>
            </div>

            <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block mb-1">
                Ship-To Warehouse & Inbound Dock
              </span>
              <h4 className="font-bold text-sm text-slate-900">{order.locationName || location?.name}</h4>
              <p className="text-xs text-slate-500 mt-1">
                {order.delivery?.deliveryAddress || (location ? `${location.name}, ${location.city}` : 'Central Tech Receiving Dock Bay 3')}
                <br />
                Receiving Contact: Receiving Team / Inventory Inbound
                <br />
                Carrier: {order.delivery?.provider || 'Commercial Freight'} ({order.delivery?.method || 'Standard'})
                {order.delivery?.trackingCode && (
                  <>
                    <br />
                    Tracking Ref: <span className="font-mono font-bold text-slate-700">{order.delivery.trackingCode}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 w-12 text-center">#</th>
                  <th className="py-2.5 px-4">Item Description</th>
                  <th className="py-2.5 px-4">SKU / Code</th>
                  <th className="py-2.5 px-4 text-center">Qty</th>
                  <th className="py-2.5 px-4 text-right">Unit Price</th>
                  <th className="py-2.5 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 px-4 text-center text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{item.productName}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{item.sku}</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-800">{item.quantity}</td>
                    <td className="py-3 px-4 text-right text-slate-700">
                      {settings.currencySymbol}{(item.purchasePrice || item.unitPrice).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {settings.currencySymbol}{item.subtotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Financial Breakdown */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 pt-2">
            <div className="max-w-md text-xs text-slate-500 space-y-2">
              <div>
                <span className="font-bold text-slate-700">Order Remarks / Delivery Instructions:</span>
                <p className="mt-0.5 italic text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {order.notes || 'Please verify all serial numbers against the packing list upon dock arrival. Pallets must be shrink-wrapped with barcoded packing slip attached.'}
                </p>
              </div>
            </div>

            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Before Tax:</span>
                <span className="font-bold text-slate-900">{settings.currencySymbol}{order.totalBeforeTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Freight / Delivery:</span>
                <span className="font-semibold text-slate-700">
                  {order.delivery?.standardPrice ? `${settings.currencySymbol}${order.delivery.standardPrice.toFixed(2)}` : 'Prepaid / Included'}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Taxes & Duties:</span>
                <span className="font-semibold text-slate-700">{settings.currencySymbol}{order.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Total PO Amount:</span>
                <span className="text-blue-600">{settings.currencySymbol}{order.finalTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-emerald-600 pt-1">
                <span>Amount Paid:</span>
                <span>{settings.currencySymbol}{order.amountPaid.toFixed(2)}</span>
              </div>
              {due > 0 && (
                <div className="flex justify-between text-xs font-bold text-rose-600 pt-1">
                  <span>Balance Due:</span>
                  <span>{settings.currencySymbol}{due.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Authorized Sign-off (Printed format) */}
          <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-500">
            <div>
              <div className="border-b border-slate-300 pb-12 mb-1"></div>
              <span className="font-bold text-slate-700">Authorized Procurement Agent Signature</span>
            </div>
            <div>
              <div className="border-b border-slate-300 pb-12 mb-1"></div>
              <span className="font-bold text-slate-700">Vendor Confirmation & Acceptance Date</span>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer (Hidden on print) */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="text-xs text-slate-500">
            Status: <span className="font-bold text-slate-800 uppercase">{order.status}</span> &bull; Payment: <span className="font-bold text-slate-800 uppercase">{order.paymentStatus}</span>
          </div>

          <div className="flex items-center gap-2">
            {order.status !== 'received' && onOpenGRN && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenGRN();
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <PackageCheck className="w-4 h-4" />
                <span>Receive Goods (GRN)</span>
              </button>
            )}

            {due > 0 && onOpenPayment && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPayment();
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <DollarSign className="w-4 h-4" />
                <span>Record Payment</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold rounded-xl transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
