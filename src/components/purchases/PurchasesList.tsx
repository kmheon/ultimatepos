import React, { useState, useMemo } from 'react';
import { Truck, Plus, Search, Eye, CheckCircle2, DollarSign, Calendar } from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { Transaction } from '../../types';
import { AddPurchaseModal } from './AddPurchaseModal';
import { InvoiceModal } from '../sales/InvoiceModal';

export const PurchasesList: React.FC = () => {
  const { transactions, settings } = usePOS();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'partial' | 'due'>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Transaction | null>(null);

  const purchases = useMemo(() => {
    return transactions.filter(t => t.type === 'purchase');
  }, [transactions]);

  const filteredPurchases = useMemo(() => {
    return purchases.filter(p => {
      const matchesStatus = statusFilter === 'all' || p.paymentStatus === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (p.refNo && p.refNo.toLowerCase().includes(q)) ||
        p.contactName.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [purchases, statusFilter, searchQuery]);

  const totalPurchaseCost = filteredPurchases.reduce((s, x) => s + x.finalTotal, 0);
  const totalPaid = filteredPurchases.reduce((s, x) => s + x.amountPaid, 0);
  const totalPayableDue = Math.max(0, totalPurchaseCost - totalPaid);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Purchases & Supplier Orders</h1>
          <p className="text-xs text-slate-500">Track inbound warehouse inventory deliveries, supplier bills, and accounts payable</p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Purchase Order</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Purchases Invoiced</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{settings.currencySymbol}{totalPurchaseCost.toFixed(2)}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{filteredPurchases.length} Purchase Invoices</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Paid to Suppliers</span>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">{settings.currencySymbol}{totalPaid.toFixed(2)}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Disbursed funds</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Accounts Payable Due</span>
          <h3 className="text-2xl font-black text-rose-600 mt-1">{settings.currencySymbol}{totalPayableDue.toFixed(2)}</h3>
          <p className="text-[11px] text-rose-700 mt-0.5">Outstanding supplier debt</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by PO reference or supplier name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          {(['all', 'paid', 'partial', 'due'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">PO / Reference #</th>
                <th className="py-3.5 px-4">Supplier</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4 text-right">Total Cost</th>
                <th className="py-3.5 px-4 text-right">Paid</th>
                <th className="py-3.5 px-4 text-right">Payable Due</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    <Truck className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-sm">No purchase orders found</p>
                  </td>
                </tr>
              ) : (
                filteredPurchases.map(p => {
                  const due = Math.max(0, p.finalTotal - p.amountPaid);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-600">
                        {p.refNo || p.invoiceNo}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {p.contactName}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {p.transactionDate}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wide inline-flex items-center gap-1 ${
                            p.paymentStatus === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.paymentStatus === 'partial'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {p.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 uppercase font-medium text-slate-600">
                        {p.paymentMethod}
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                        {settings.currencySymbol}{p.finalTotal.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600">
                        {settings.currencySymbol}{p.amountPaid.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold">
                        {due > 0 ? (
                          <span className="text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                            {settings.currencySymbol}{due.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedPurchase(p)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                        >
                          View PO
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddPurchaseModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />

      {selectedPurchase && (
        <InvoiceModal
          isOpen={Boolean(selectedPurchase)}
          onClose={() => setSelectedPurchase(null)}
          transaction={selectedPurchase}
        />
      )}
    </div>
  );
};
