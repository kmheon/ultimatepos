import React from 'react';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  ShoppingBag, 
  Calendar, 
  ArrowUpRight, 
  ExternalLink,
  DollarSign
} from 'lucide-react';
import { Contact } from '../../types';
import { usePOS } from '../../context/POSContext';

interface CustomerDrawerProps {
  customer: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (c: Contact) => void;
  onStartSale?: (c: Contact) => void;
}

export const CustomerDrawer: React.FC<CustomerDrawerProps> = ({
  customer,
  isOpen,
  onClose,
  onEdit,
  onStartSale
}) => {
  const { settings, transactions } = usePOS();

  if (!isOpen || !customer) return null;

  // Filter transactions for this customer
  const customerTransactions = transactions.filter(
    tx => tx.contactId === customer.id || (tx.contactName && tx.contactName.toLowerCase() === customer.name.toLowerCase())
  );

  const totalSpent = customerTransactions.reduce((acc, tx) => acc + (tx.finalTotal || tx.totalBeforeTax || 0), 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col transform transition-transform duration-300">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-lg shadow-md">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">{customer.name}</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {customer.businessName ? 'Commercial Retail' : 'Direct Consumer'}
                </span>
              </div>
              {customer.businessName && (
                <p className="text-xs text-slate-300 mt-0.5">{customer.businessName}</p>
              )}
              <p className="text-[11px] text-slate-400 mt-0.5">ID: {customer.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Financial Snapshot */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] font-bold text-slate-500 block">Total Lifetime Spent</span>
              <span className="text-base font-extrabold text-slate-900 mt-1 block">
                {settings.currencySymbol}{totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-slate-400">{customerTransactions.length} orders completed</span>
            </div>

            <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl">
              <span className="text-[11px] font-bold text-rose-700 block">Outstanding Due</span>
              <span className="text-base font-extrabold text-rose-800 mt-1 block">
                {settings.currencySymbol}{(customer.totalSaleDue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-rose-600">
                {(customer.totalSaleDue || 0) > 0 ? 'Payment pending' : 'Zero balance due'}
              </span>
            </div>

            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl">
              <span className="text-[11px] font-bold text-blue-700 block">Credit Ceiling</span>
              <span className="text-base font-extrabold text-blue-900 mt-1 block">
                {settings.currencySymbol}{(customer.creditLimit || 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-blue-600">Approved limit</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5">
            {onStartSale && (
              <button
                onClick={() => {
                  onStartSale(customer);
                  onClose();
                }}
                className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs shadow-blue-200 transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                Start POS Sale with Customer
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => {
                  onEdit(customer);
                  onClose();
                }}
                className="py-2.5 px-4 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Edit Details
              </button>
            )}
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Communication & Location</h3>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5 text-xs text-slate-700">
              {customer.mobile && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{customer.mobile}</span>
                  </div>
                  <a
                    href={`tel:${customer.mobile}`}
                    className="text-blue-600 hover:underline font-bold text-[11px]"
                  >
                    Call
                  </a>
                </div>
              )}

              {customer.email && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{customer.email}</span>
                  </div>
                  <a
                    href={`mailto:${customer.email}`}
                    className="text-blue-600 hover:underline font-bold text-[11px]"
                  >
                    Email
                  </a>
                </div>
              )}

              {customer.address && (
                <div className="flex items-start gap-2 pt-1 border-t border-slate-200/60">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    {customer.address}
                    {customer.city ? `, ${customer.city}` : ''}
                    {customer.state ? `, ${customer.state}` : ''}
                  </span>
                </div>
              )}

              {customer.taxNumber && (
                <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-500">Tax / BIN:</span>
                  <span className="font-mono font-medium">{customer.taxNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Purchase History */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Recent Invoices ({customerTransactions.length})
              </h3>
            </div>

            {customerTransactions.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
                No past transactions recorded for this customer profile yet.
              </div>
            ) : (
              <div className="space-y-2">
                {customerTransactions.slice(0, 5).map(tx => (
                  <div
                    key={tx.id}
                    className="p-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-600">{tx.invoiceNo}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                          tx.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {tx.paymentStatus}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{tx.transactionDate}</span>
                        <span>•</span>
                        <span className="capitalize">{tx.paymentMethod}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 block">
                        {settings.currencySymbol}{(tx.finalTotal || tx.totalBeforeTax || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
