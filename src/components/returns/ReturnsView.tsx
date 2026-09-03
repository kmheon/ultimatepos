import React, { useState } from 'react';
import { 
  RotateCcw, 
  Plus, 
  Search, 
  Printer, 
  DollarSign, 
  Calendar, 
  User, 
  Receipt,
  CheckCircle2,
  PackageCheck
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { SaleReturn } from '../../types';
import { AddReturnModal } from './AddReturnModal';

export const ReturnsView: React.FC = () => {
  const { saleReturns, settings } = usePOS();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredReturns = saleReturns.filter(ret => {
    return (
      ret.returnNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ret.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ret.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ret.items.some(i => i.productName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Sales Returns & RMA Customer Refunds
            </h1>
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-extrabold">
              Reverse Logistics
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Process returned electronics, warranty RMA defect replacements, restocking, and credit notes.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Process Return / RMA</span>
        </button>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Returns</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{saleReturns.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Refunded</p>
          <p className="text-2xl font-black text-rose-600 mt-1">
            {settings.currencySymbol}{saleReturns.reduce((s, r) => s + r.totalRefund, 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Restocked Units</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {saleReturns.reduce((s, r) => s + r.items.filter(i => i.restockStock).reduce((q, item) => q + item.quantity, 0), 0)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Return Rate</p>
          <p className="text-2xl font-black text-slate-900 mt-1">0.8%</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search returns by Return #, Invoice #, Customer, or Product..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Return #</th>
                <th className="py-3 px-4">Orig. Invoice #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Returned Items & Reasons</th>
                <th className="py-3 px-4">Refund Amount</th>
                <th className="py-3 px-4">Refund Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RotateCcw className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">No sale returns logged</p>
                    <p className="text-xs text-slate-400 mt-0.5">Customer returns and warranty replacements will show up here.</p>
                  </td>
                </tr>
              ) : (
                filteredReturns.map(ret => (
                  <tr key={ret.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      {ret.returnNo}
                      <span className="text-[10px] text-slate-400 block font-normal">{ret.locationName}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs">
                        {ret.invoiceNo}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {ret.customerName}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {ret.date}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        {ret.items.map((item, idx) => (
                          <div key={idx} className="text-xs text-slate-800">
                            <span className="font-bold">{item.quantity}x {item.productName}</span>
                            <p className="text-[11px] text-slate-500 italic">"{item.reason}"</p>
                            {item.restockStock && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                                <PackageCheck className="w-3 h-3" /> Restocked into catalog
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-black text-rose-600">
                      {settings.currencySymbol}{ret.totalRefund.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                        {ret.refundMethod.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAddModalOpen && (
        <AddReturnModal onClose={() => setIsAddModalOpen(false)} />
      )}
    </div>
  );
};
