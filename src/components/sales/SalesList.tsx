import React, { useState, useMemo } from 'react';
import { 
  Receipt, 
  Search, 
  Filter, 
  Eye, 
  Printer, 
  DollarSign, 
  Download, 
  PlusCircle,
  Calendar,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { Transaction } from '../../types';
import { InvoiceModal } from './InvoiceModal';

export const SalesList: React.FC = () => {
  const { transactions, settings, setActiveTab } = usePOS();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'due' | 'partial'>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Transaction | null>(null);

  const sales = useMemo(() => {
    return transactions.filter(t => t.type === 'sell');
  }, [transactions]);

  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const matchesStatus = statusFilter === 'all' || sale.paymentStatus === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        sale.invoiceNo.toLowerCase().includes(q) ||
        sale.contactName.toLowerCase().includes(q) ||
        (sale.refNo && sale.refNo.toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [sales, statusFilter, searchQuery]);

  const totalSales = filteredSales.reduce((s, x) => s + x.finalTotal, 0);
  const totalPaid = filteredSales.reduce((s, x) => s + x.amountPaid, 0);
  const totalDue = Math.max(0, totalSales - totalPaid);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sales Invoices & Orders</h1>
          <p className="text-xs text-slate-500">Manage all completed customer point of sale orders and billing records</p>
        </div>

        <button
          onClick={() => setActiveTab('pos')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New POS Sale</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filtered Sales Total</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{settings.currencySymbol}{totalSales.toFixed(2)}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{filteredSales.length} Total Invoices</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Received</span>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">{settings.currencySymbol}{totalPaid.toFixed(2)}</h3>
          <p className="text-[11px] text-emerald-700 mt-0.5">{((totalPaid / (totalSales || 1)) * 100).toFixed(1)}% Collected</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Outstanding Customer Due</span>
          <h3 className="text-2xl font-black text-rose-600 mt-1">{settings.currencySymbol}{totalDue.toFixed(2)}</h3>
          <p className="text-[11px] text-rose-700 mt-0.5">Credit balance to be collected</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by invoice number or customer..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
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
      </div>

      {/* Sales Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Invoice No</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Payment Status</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4 text-right">Grand Total</th>
                <th className="py-3.5 px-4 text-right">Paid</th>
                <th className="py-3.5 px-4 text-right">Due</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    <Receipt className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-sm">No sales records found</p>
                  </td>
                </tr>
              ) : (
                filteredSales.map(sale => {
                  const due = Math.max(0, sale.finalTotal - sale.amountPaid);
                  return (
                    <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-600">
                        {sale.invoiceNo}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{sale.contactName}</div>
                        {sale.contactMobile && sale.contactMobile !== 'N/A' && (
                          <div className="text-[10px] text-slate-400">{sale.contactMobile}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {sale.transactionDate}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wide inline-flex items-center gap-1 ${
                            sale.paymentStatus === 'paid'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : sale.paymentStatus === 'partial'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {sale.paymentStatus === 'paid' && <CheckCircle2 className="w-3 h-3" />}
                          {sale.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 uppercase font-medium text-slate-600">
                        {sale.paymentMethod}
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                        {settings.currencySymbol}{sale.finalTotal.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600">
                        {settings.currencySymbol}{sale.amountPaid.toFixed(2)}
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
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedInvoice(sale)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition-colors"
                            title="View Commercial Invoice"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <InvoiceModal
          isOpen={Boolean(selectedInvoice)}
          onClose={() => setSelectedInvoice(null)}
          transaction={selectedInvoice}
        />
      )}
    </div>
  );
};
