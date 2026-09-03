import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Plus, 
  Search, 
  Printer, 
  ShoppingCart, 
  Trash2, 
  CheckCircle, 
  Clock, 
  Send, 
  User, 
  DollarSign, 
  Calendar 
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { Quotation } from '../../types';
import { AddQuotationModal } from './AddQuotationModal';
import { QuotationPrintModal } from './QuotationPrintModal';

export const QuotationsView: React.FC = () => {
  const { quotations, deleteQuotation, convertQuotationToSale, updateQuotation, settings } = usePOS();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedQuoteForPrint, setSelectedQuoteForPrint] = useState<Quotation | null>(null);

  const filteredQuotations = quotations.filter(q => {
    const matchesSearch = 
      q.quoteNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.items.some(i => i.productName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = selectedStatus === 'all' || q.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Quotation['status']) => {
    switch (status) {
      case 'draft':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">Draft</span>;
      case 'sent':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1"><Send className="w-3 h-3" /> Sent to Client</span>;
      case 'accepted':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Accepted</span>;
      case 'declined':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">Declined</span>;
      case 'converted':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1"><ShoppingCart className="w-3 h-3" /> Converted to Sale</span>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Quotations & Proforma Invoices
            </h1>
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-extrabold">
              B2B Estimates
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Prepare formal tech estimates, office bulk quotes, and convert accepted quotes into POS checkout in 1-click.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Quotation</span>
        </button>
      </div>

      {/* Quick metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Quotes</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{quotations.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Pipeline</p>
          <p className="text-2xl font-black text-blue-600 mt-1">
            {quotations.filter(q => q.status === 'sent' || q.status === 'draft').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Converted Sales</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {quotations.filter(q => q.status === 'converted').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Quoted Value</p>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {settings.currencySymbol}{quotations.reduce((sum, q) => sum + q.finalTotal, 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search quotes by Quote #, Customer, or Product..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={e => setSelectedStatus(e.target.value)}
          className="px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="accepted">Accepted</option>
          <option value="converted">Converted to Sale</option>
          <option value="declined">Declined</option>
        </select>
      </div>

      {/* Quotations Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Quote #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Date & Validity</th>
                <th className="py-3 px-4">Items Count</th>
                <th className="py-3 px-4">Grand Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <FileSpreadsheet className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">No quotations found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Click New Quotation to create your first client estimate.</p>
                  </td>
                </tr>
              ) : (
                filteredQuotations.map(quote => (
                  <tr key={quote.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      {quote.quoteNo}
                      <span className="text-[11px] text-slate-400 font-normal block">{quote.locationName}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800">{quote.customerName}</p>
                      <p className="text-xs text-slate-500">{quote.customerMobile || 'No phone'}</p>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <p className="text-slate-800 font-medium">Created: {quote.date}</p>
                      <p className="text-slate-500">Valid until: {quote.validUntil}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-bold">
                        {quote.items.reduce((s, i) => s + i.quantity, 0)} Units ({quote.items.length} Products)
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-black text-slate-900">
                        {settings.currencySymbol}{quote.finalTotal.toFixed(2)}
                      </p>
                      {quote.discountAmount > 0 && (
                        <span className="text-[10px] text-emerald-600 font-bold block">
                          Discount: {settings.currencySymbol}{quote.discountAmount.toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(quote.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {quote.status !== 'converted' && (
                          <button
                            onClick={() => convertQuotationToSale(quote.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all"
                            title="Load into POS Cart to Checkout"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Convert to POS</span>
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedQuoteForPrint(quote)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Print / View Quotation"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete quotation ${quote.quoteNo}?`)) {
                              deleteQuotation(quote.id);
                            }
                          }}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {isAddModalOpen && (
        <AddQuotationModal onClose={() => setIsAddModalOpen(false)} />
      )}

      {selectedQuoteForPrint && (
        <QuotationPrintModal
          quotation={selectedQuoteForPrint}
          onClose={() => setSelectedQuoteForPrint(null)}
        />
      )}
    </div>
  );
};
