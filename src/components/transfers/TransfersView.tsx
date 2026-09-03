import React, { useState } from 'react';
import { 
  ArrowLeftRight, 
  Plus, 
  Search, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Package, 
  Building2, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { StockTransfer } from '../../types';
import { AddTransferModal } from './AddTransferModal';

export const TransfersView: React.FC = () => {
  const { stockTransfers, updateStockTransferStatus, locations, settings } = usePOS();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredTransfers = stockTransfers.filter(t => {
    return (
      t.refNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.fromLocationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.toLocationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.items.some(i => i.productName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const getStatusBadge = (status: StockTransfer['status']) => {
    switch (status) {
      case 'pending':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1"><Clock className="w-3 h-3" /> Pending Dispatch</span>;
      case 'in_transit':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1"><Truck className="w-3 h-3" /> In Transit</span>;
      case 'completed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Received / Completed</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">Cancelled</span>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Stock Transfers Between Branches
            </h1>
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-extrabold">
              Multi-Store Logistics
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Transfer inventory between warehouses, flagship showrooms, and mall kiosk branches.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Stock Transfer</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Transfers</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stockTransfers.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active In-Transit</p>
          <p className="text-2xl font-black text-sky-600 mt-1">
            {stockTransfers.filter(t => t.status === 'in_transit' || t.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed Transfers</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {stockTransfers.filter(t => t.status === 'completed').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Transferred Value</p>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {settings.currencySymbol}{stockTransfers.reduce((s, t) => s + t.totalValue, 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search transfers by Reference #, Source/Destination Location, or Product..."
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
                <th className="py-3 px-4">Transfer Ref #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Source Branch (From)</th>
                <th className="py-3 px-4">Destination (To)</th>
                <th className="py-3 px-4">Items & Quantities</th>
                <th className="py-3 px-4">Shipping / Value</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredTransfers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <ArrowLeftRight className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">No stock transfers found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Transfer products from warehouse to retail showrooms.</p>
                  </td>
                </tr>
              ) : (
                filteredTransfers.map(transfer => (
                  <tr key={transfer.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      {transfer.refNo}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {transfer.date}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800 text-xs flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {transfer.fromLocationName}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-blue-700 text-xs flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-blue-500" />
                        {transfer.toLocationName}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5 max-w-xs">
                        {transfer.items.map((item, idx) => (
                          <div key={idx} className="text-xs text-slate-700 font-medium">
                            <span className="font-bold text-slate-900">{item.quantity}x</span> {item.productName}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 text-xs">
                        Val: {settings.currencySymbol}{transfer.totalValue.toFixed(2)}
                      </p>
                      <span className="text-[10px] text-slate-500">
                        Ship: {settings.currencySymbol}{transfer.shippingCharges.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(transfer.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {transfer.status !== 'completed' && transfer.status !== 'cancelled' ? (
                        <select
                          value={transfer.status}
                          onChange={e => updateStockTransferStatus(transfer.id, e.target.value as any)}
                          className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg px-2 py-1 border border-slate-300 text-slate-700 cursor-pointer"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_transit">In Transit</option>
                          <option value="completed">Mark Received / Completed</option>
                          <option value="cancelled">Cancel</option>
                        </select>
                      ) : (
                        <span className="text-xs text-slate-400 font-semibold">Locked</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAddModalOpen && (
        <AddTransferModal onClose={() => setIsAddModalOpen(false)} />
      )}
    </div>
  );
};
