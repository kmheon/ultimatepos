import React, { useState, useMemo } from 'react';
import { 
  ArrowLeftRight, 
  Plus, 
  Search, 
  Building2, 
  Truck, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Download, 
  Filter, 
  Eye, 
  FileText,
  DollarSign,
  Package
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { StockTransfer } from '../../types';
import { AddTransferModal } from './AddTransferModal';
import { TransferDetailModal } from './TransferDetailModal';

export const TransfersView: React.FC = () => {
  const { stockTransfers, updateStockTransferStatus, locations, settings } = usePOS();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_transit' | 'completed' | 'cancelled'>('all');
  const [fromLocFilter, setFromLocFilter] = useState('all');
  const [toLocFilter, setToLocFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'val_desc'>('date_desc');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTransferForDetail, setSelectedTransferForDetail] = useState<StockTransfer | null>(null);

  // Global KPIs
  const metrics = useMemo(() => {
    const totalCount = stockTransfers.length;
    const inTransitCount = stockTransfers.filter(t => t.status === 'in_transit').length;
    const pendingCount = stockTransfers.filter(t => t.status === 'pending').length;
    const completedCount = stockTransfers.filter(t => t.status === 'completed').length;
    const totalValuation = stockTransfers
      .filter(t => t.status !== 'cancelled')
      .reduce((sum, t) => sum + t.totalValue, 0);

    return {
      totalCount,
      inTransitCount,
      pendingCount,
      completedCount,
      totalValuation,
    };
  }, [stockTransfers]);

  // Filter & Sort
  const filteredTransfers = useMemo(() => {
    return stockTransfers.filter(transfer => {
      if (statusFilter !== 'all' && transfer.status !== statusFilter) return false;
      if (fromLocFilter !== 'all' && transfer.fromLocationId !== fromLocFilter) return false;
      if (toLocFilter !== 'all' && transfer.toLocationId !== toLocFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inRef = transfer.refNo.toLowerCase().includes(q);
        const inFrom = transfer.fromLocationName.toLowerCase().includes(q);
        const inTo = transfer.toLocationName.toLowerCase().includes(q);
        const inProduct = transfer.items.some(
          i => i.productName.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q)
        );
        return inRef || inFrom || inTo || inProduct;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date_desc') return b.date.localeCompare(a.date);
      if (sortBy === 'date_asc') return a.date.localeCompare(b.date);
      if (sortBy === 'val_desc') return b.totalValue - a.totalValue;
      return 0;
    });
  }, [stockTransfers, statusFilter, fromLocFilter, toLocFilter, searchQuery, sortBy]);

  const getStatusBadge = (status: StockTransfer['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-500" />
            Pending Dispatch
          </span>
        );
      case 'in_transit':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200">
            <Truck className="w-3 h-3 text-sky-500" />
            In Transit
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Received & Done
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-500" />
            Cancelled
          </span>
        );
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Transfer Ref #',
      'Date',
      'Origin (From)',
      'Destination (To)',
      'Items Count',
      'Total Value',
      'Shipping Charges',
      'Status',
      'Notes'
    ];

    const rows = filteredTransfers.map(t => [
      `"${t.refNo}"`,
      t.date,
      `"${t.fromLocationName}"`,
      `"${t.toLocationName}"`,
      t.items.reduce((s, i) => s + i.quantity, 0),
      t.totalValue.toFixed(2),
      t.shippingCharges.toFixed(2),
      t.status,
      `"${t.notes || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `stock_transfers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* 5 NEB-UI-GOV-01 Standard KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Dispatches</p>
            <ArrowLeftRight className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{metrics.totalCount}</p>
          <span className="text-[10px] font-bold text-blue-600 mt-1 block">Inter-branch shipments</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active In-Transit</p>
            <Truck className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-black text-sky-600 mt-1">{metrics.inTransitCount}</p>
          <span className="text-[10px] font-bold text-sky-600 mt-1 block">On road / logistics</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Dispatch</p>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 mt-1">{metrics.pendingCount}</p>
          <span className="text-[10px] font-bold text-amber-600 mt-1 block">Awaiting warehouse pickup</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Received & Done</p>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-1">{metrics.completedCount}</p>
          <span className="text-[10px] font-bold text-emerald-600 mt-1 block">Stock reconciled</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transferred Value</p>
            <DollarSign className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-purple-600 mt-1">
            {settings.currencySymbol}{metrics.totalValuation.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <span className="text-[10px] font-bold text-slate-400 mt-1 block">Circulating inventory</span>
        </div>
      </div>

      {/* Filter & Action Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Search Box */}
          <div className="relative sm:col-span-2 lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search transfers by Ref #, Location, or Product..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Source Location */}
          <div>
            <select
              value={fromLocFilter}
              onChange={e => setFromLocFilter(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 py-2 px-3 rounded-xl font-medium text-slate-700 focus:bg-white focus:outline-hidden cursor-pointer"
            >
              <option value="all">From: All Locations</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>
                  From: {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Destination Location */}
          <div>
            <select
              value={toLocFilter}
              onChange={e => setToLocFilter(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 py-2 px-3 rounded-xl font-medium text-slate-700 focus:bg-white focus:outline-hidden cursor-pointer"
            >
              <option value="all">To: All Locations</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>
                  To: {loc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary Bar: Status Pills & Action Buttons */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Status:</span>
            {[
              { id: 'all', label: `All (${stockTransfers.length})` },
              { id: 'in_transit', label: `In Transit (${metrics.inTransitCount})` },
              { id: 'pending', label: `Pending (${metrics.pendingCount})` },
              { id: 'completed', label: `Completed (${metrics.completedCount})` },
              { id: 'cancelled', label: 'Cancelled' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id as any)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  statusFilter === f.id
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Sort & Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="text-xs bg-slate-50 border border-slate-200 py-1.5 px-3 rounded-xl font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="date_desc">Sort: Newest Date</option>
              <option value="date_asc">Sort: Oldest Date</option>
              <option value="val_desc">Sort: Highest Value</option>
            </select>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-blue-200 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Stock Transfer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Transfers Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Transfer Ref #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Origin (From)</th>
                <th className="py-3 px-4">Destination (To)</th>
                <th className="py-3 px-4">Items Manifest</th>
                <th className="py-3 px-4">Shipping / Value</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Quick Pipeline</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredTransfers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <ArrowLeftRight className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-bold text-slate-700 text-sm">No stock transfers found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Create a new transfer to move stock between warehouse and branches</p>
                  </td>
                </tr>
              ) : (
                filteredTransfers.map(transfer => {
                  const totalUnits = transfer.items.reduce((s, i) => s + i.quantity, 0);

                  return (
                    <tr key={transfer.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Ref # */}
                      <td className="py-3.5 px-4 font-mono font-black text-slate-900">
                        {transfer.refNo}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-500 font-mono">
                        {transfer.date}
                      </td>

                      {/* Origin */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{transfer.fromLocationName}</span>
                        </div>
                      </td>

                      {/* Destination */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-blue-800 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-blue-500" />
                          <span>{transfer.toLocationName}</span>
                        </div>
                      </td>

                      {/* Manifest preview */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5 max-w-xs">
                          {transfer.items.slice(0, 2).map((item, idx) => (
                            <div key={idx} className="text-xs text-slate-700 font-medium truncate">
                              <span className="font-bold text-slate-900">{item.quantity}x</span> {item.productName}
                            </div>
                          ))}
                          {transfer.items.length > 2 && (
                            <span className="text-[10px] text-slate-400 font-semibold">
                              +{transfer.items.length - 2} more items ({totalUnits} units total)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Valuation */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-slate-900">
                          {settings.currencySymbol}{transfer.totalValue.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Ship: {settings.currencySymbol}{transfer.shippingCharges.toFixed(2)}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(transfer.status)}
                      </td>

                      {/* Quick Pipeline Transition */}
                      <td className="py-3.5 px-4 text-right">
                        {transfer.status !== 'completed' && transfer.status !== 'cancelled' ? (
                          <select
                            value={transfer.status}
                            onChange={e => updateStockTransferStatus(transfer.id, e.target.value as any)}
                            className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg px-2.5 py-1 border border-slate-300 text-slate-700 cursor-pointer focus:outline-hidden"
                          >
                            <option value="pending">Pending</option>
                            <option value="in_transit">In Transit</option>
                            <option value="completed">Mark Completed</option>
                            <option value="cancelled">Cancel</option>
                          </select>
                        ) : (
                          <span className="text-xs text-slate-400 font-semibold font-mono">Archived</span>
                        )}
                      </td>

                      {/* Inspect Button */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedTransferForDetail(transfer)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Inspect Transfer Waybill"
                        >
                          <Eye className="w-4 h-4" />
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

      {/* Add Transfer Modal */}
      {isAddModalOpen && (
        <AddTransferModal onClose={() => setIsAddModalOpen(false)} />
      )}

      {/* Transfer Detail / Waybill Modal */}
      {selectedTransferForDetail && (
        <TransferDetailModal
          isOpen={!!selectedTransferForDetail}
          onClose={() => setSelectedTransferForDetail(null)}
          transfer={selectedTransferForDetail}
        />
      )}
    </div>
  );
};
