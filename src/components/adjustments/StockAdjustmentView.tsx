import React, { useState, useMemo } from 'react';
import { 
  SlidersHorizontal, 
  Plus, 
  Search, 
  Trash2, 
  AlertTriangle, 
  Building2, 
  Download, 
  Eye, 
  X, 
  TrendingDown, 
  TrendingUp, 
  FileText, 
  Package, 
  DollarSign,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';

interface AdjustmentItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitCost: number;
}

interface StockAdjustment {
  id: string;
  refNo: string;
  date: string;
  locationId?: string;
  locationName: string;
  adjustmentType: 'normal' | 'abnormal' | 'surplus';
  reason: string;
  items: AdjustmentItem[];
  totalAmountRecovered: number;
  totalLoss: number;
  actionType: 'deduct' | 'add';
}

export const StockAdjustmentView: React.FC = () => {
  const { products, updateProduct, locations, settings } = usePOS();
  
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([
    {
      id: '1',
      refNo: 'ADJ-2026-001',
      date: '2026-08-28',
      locationName: locations[0]?.name || 'Central Tech Hub',
      adjustmentType: 'normal',
      actionType: 'deduct',
      reason: 'Shelf display wear & demo unit tear',
      items: [
        { productId: '1', productName: 'iPhone 15 Pro Max 256GB', sku: 'IP15PM-256', quantity: 1, unitCost: 950 }
      ],
      totalAmountRecovered: 200,
      totalLoss: 750
    },
    {
      id: '2',
      refNo: 'ADJ-2026-002',
      date: '2026-08-30',
      locationName: locations[1]?.name || 'Silicon Valley Central Warehouse',
      adjustmentType: 'abnormal',
      actionType: 'deduct',
      reason: 'Transit water damage during heavy rainfall',
      items: [
        { productId: '2', productName: 'Samsung Galaxy S24 Ultra', sku: 'S24U-512', quantity: 1, unitCost: 880 }
      ],
      totalAmountRecovered: 0,
      totalLoss: 880
    },
    {
      id: '3',
      refNo: 'ADJ-2026-003',
      date: '2026-09-02',
      locationName: locations[0]?.name || 'Central Tech Hub',
      adjustmentType: 'surplus',
      actionType: 'add',
      reason: 'Annual cycle count unrecorded supplier bonus pack found',
      items: [
        { productId: '3', productName: 'MacBook Air M3 15-inch', sku: 'MBA-M3-15', quantity: 1, unitCost: 1100 }
      ],
      totalAmountRecovered: 0,
      totalLoss: 0
    }
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAdjustmentForView, setSelectedAdjustmentForView] = useState<StockAdjustment | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'normal' | 'abnormal' | 'surplus' | 'recovered'>('all');
  const [locationFilter, setLocationFilter] = useState('all');

  // Form states
  const [actionType, setActionType] = useState<'deduct' | 'add'>('deduct');
  const [adjType, setAdjType] = useState<'normal' | 'abnormal' | 'surplus'>('normal');
  const [selectedLocationId, setSelectedLocationId] = useState(locations[0]?.id || '');
  const [adjReason, setAdjReason] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [adjQty, setAdjQty] = useState('1');
  const [amountRecovered, setAmountRecovered] = useState('0');
  const [formError, setFormError] = useState('');

  // Global KPIs
  const metrics = useMemo(() => {
    const totalCount = adjustments.length;
    const totalWriteOffLoss = adjustments
      .filter(a => a.actionType === 'deduct')
      .reduce((sum, a) => sum + a.totalLoss, 0);
    const totalRecovered = adjustments.reduce((sum, a) => sum + a.totalAmountRecovered, 0);
    const abnormalLossCount = adjustments.filter(a => a.adjustmentType === 'abnormal').length;
    const surplusUnitsAdded = adjustments
      .filter(a => a.actionType === 'add')
      .reduce((sum, a) => sum + a.items.reduce((s, i) => s + i.quantity, 0), 0);

    return {
      totalCount,
      totalWriteOffLoss,
      totalRecovered,
      abnormalLossCount,
      surplusUnitsAdded,
    };
  }, [adjustments]);

  const handleCreateAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find(p => p.id === selectedProductId);
    if (!prod) {
      setFormError('Please select a valid product to adjust');
      return;
    }

    const qty = parseInt(adjQty, 10);
    if (isNaN(qty) || qty <= 0) {
      setFormError('Quantity must be 1 or greater');
      return;
    }

    const rec = parseFloat(amountRecovered) || 0;
    const loss = actionType === 'deduct' ? Math.max(0, (prod.purchasePrice * qty) - rec) : 0;

    // Deduct or add stock from inventory
    const newStock = actionType === 'deduct' 
      ? Math.max(0, prod.currentStock - qty) 
      : prod.currentStock + qty;

    updateProduct(prod.id, {
      currentStock: newStock
    });

    const targetLoc = locations.find(l => l.id === selectedLocationId) || locations[0];

    const newAdj: StockAdjustment = {
      id: Date.now().toString(),
      refNo: `ADJ-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
      locationId: targetLoc?.id,
      locationName: targetLoc?.name || 'Main Warehouse',
      adjustmentType: actionType === 'add' ? 'surplus' : adjType,
      actionType,
      reason: adjReason.trim() || (actionType === 'add' ? 'Physical count surplus recovery' : adjType === 'normal' ? 'Normal Stock Shrinkage' : 'Damage write-off'),
      items: [
        {
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          quantity: qty,
          unitCost: prod.purchasePrice
        }
      ],
      totalAmountRecovered: rec,
      totalLoss: loss
    };

    setAdjustments([newAdj, ...adjustments]);
    setIsAddModalOpen(false);
    setAdjReason('');
    setAdjQty('1');
    setAmountRecovered('0');
    setFormError('');
  };

  const filteredAdjustments = useMemo(() => {
    return adjustments.filter(a => {
      if (typeFilter === 'normal' && a.adjustmentType !== 'normal') return false;
      if (typeFilter === 'abnormal' && a.adjustmentType !== 'abnormal') return false;
      if (typeFilter === 'surplus' && a.actionType !== 'add') return false;
      if (typeFilter === 'recovered' && a.totalAmountRecovered <= 0) return false;

      if (locationFilter !== 'all' && a.locationId && a.locationId !== locationFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inRef = a.refNo.toLowerCase().includes(q);
        const inReason = a.reason.toLowerCase().includes(q);
        const inLoc = a.locationName.toLowerCase().includes(q);
        const inItem = a.items.some(i => i.productName.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q));
        return inRef || inReason || inLoc || inItem;
      }

      return true;
    });
  }, [adjustments, typeFilter, locationFilter, searchQuery]);

  const handleExportCSV = () => {
    const headers = [
      'Ref #',
      'Date',
      'Location',
      'Adjustment Type',
      'Direction',
      'Items',
      'Quantity',
      'Gross Cost',
      'Salvage Recovered',
      'Net Loss',
      'Reason'
    ];

    const rows = filteredAdjustments.map(a => {
      const itemsText = a.items.map(i => `${i.productName} (${i.sku})`).join('; ');
      const totalQty = a.items.reduce((s, i) => s + i.quantity, 0);
      const grossCost = a.items.reduce((s, i) => s + (i.unitCost * i.quantity), 0);

      return [
        `"${a.refNo}"`,
        a.date,
        `"${a.locationName}"`,
        a.adjustmentType,
        a.actionType === 'add' ? 'Stock Added (+)' : 'Stock Deducted (-)',
        `"${itemsText}"`,
        totalQty,
        grossCost.toFixed(2),
        a.totalAmountRecovered.toFixed(2),
        a.totalLoss.toFixed(2),
        `"${a.reason}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `stock_adjustments_${new Date().toISOString().slice(0, 10)}.csv`);
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
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Audited Entries</p>
            <SlidersHorizontal className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{metrics.totalCount}</p>
          <span className="text-[10px] font-bold text-blue-600 mt-1 block">Reconciliation records</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Net Loss (Write-Offs)</p>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600 mt-1">
            {settings.currencySymbol}{metrics.totalWriteOffLoss.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <span className="text-[10px] font-bold text-rose-600 mt-1 block">Damaged & unrecoverable</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Salvage Recovered</p>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {settings.currencySymbol}{metrics.totalRecovered.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <span className="text-[10px] font-bold text-emerald-600 mt-1 block">Insurance & salvage resale</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Abnormal Incidents</p>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 mt-1">{metrics.abnormalLossCount}</p>
          <span className="text-[10px] font-bold text-amber-600 mt-1 block">Water, transit, or theft</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Surplus Found</p>
            <TrendingUp className="w-4 h-4 text-cyan-500" />
          </div>
          <p className="text-2xl font-black text-cyan-600 mt-1">+{metrics.surplusUnitsAdded} units</p>
          <span className="text-[10px] font-bold text-cyan-600 mt-1 block">Stock reconciled upwards</span>
        </div>
      </div>

      {/* Filter & Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Search Box */}
          <div className="relative sm:col-span-2 lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search adjustments by Ref #, Reason, Location, or Product..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Location Filter */}
          <div>
            <select
              value={locationFilter}
              onChange={e => setLocationFilter(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 py-2 px-3 rounded-xl font-medium text-slate-700 focus:bg-white focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Locations ({locations.length})</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => {
                setFormError('');
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-blue-200 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Adjustment</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Filter:</span>
          {[
            { id: 'all', label: `All (${adjustments.length})` },
            { id: 'normal', label: 'Normal Shrinkage' },
            { id: 'abnormal', label: 'Abnormal Damage' },
            { id: 'surplus', label: 'Surplus Found (+)' },
            { id: 'recovered', label: 'With Salvage Recovery' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setTypeFilter(f.id as any)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                typeFilter === f.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Adjustments Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Ref #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Adjusted Product</th>
                <th className="py-3 px-4">Stock Impact</th>
                <th className="py-3 px-4">Reason / Investigation</th>
                <th className="py-3 px-4 text-right">Net Loss</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredAdjustments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <SlidersHorizontal className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-bold text-slate-700 text-sm">No adjustment vouchers found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Click 'Add Adjustment' to write-off damaged units or reconcile stock</p>
                  </td>
                </tr>
              ) : (
                filteredAdjustments.map(adj => {
                  const isAdd = adj.actionType === 'add';

                  return (
                    <tr key={adj.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Ref */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {adj.refNo}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-500 font-mono">
                        {adj.date}
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {adj.locationName}
                      </td>

                      {/* Type Badge */}
                      <td className="py-3.5 px-4">
                        {isAdd ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                            Surplus (+)
                          </span>
                        ) : adj.adjustmentType === 'normal' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            Normal (Shrinkage)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                            Abnormal (Damaged)
                          </span>
                        )}
                      </td>

                      {/* Product */}
                      <td className="py-3.5 px-4">
                        {adj.items.map((it, idx) => (
                          <div key={idx}>
                            <div className="font-bold text-slate-900">{it.productName}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{it.sku}</div>
                          </div>
                        ))}
                      </td>

                      {/* Quantity Impact */}
                      <td className="py-3.5 px-4">
                        {adj.items.map((it, idx) => (
                          <span
                            key={idx}
                            className={`font-mono font-bold text-xs ${
                              isAdd ? 'text-cyan-700' : 'text-rose-700'
                            }`}
                          >
                            {isAdd ? `+${it.quantity} units` : `-${it.quantity} units`}
                          </span>
                        ))}
                      </td>

                      {/* Reason */}
                      <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                        {adj.reason}
                      </td>

                      {/* Loss */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold">
                        {isAdd ? (
                          <span className="text-cyan-600 font-medium">Surplus Gain</span>
                        ) : adj.totalLoss > 0 ? (
                          <span className="text-rose-600">{settings.currencySymbol}{adj.totalLoss.toFixed(2)}</span>
                        ) : (
                          <span className="text-emerald-600">Fully Recovered</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedAdjustmentForView(adj)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="View Voucher"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setAdjustments(adjustments.filter(a => a.id !== adj.id))}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Add Adjustment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span>Post Stock Adjustment</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdjustment} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-medium">
                  {formError}
                </div>
              )}

              {/* Adjustment Direction Toggle */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Adjustment Direction</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setActionType('deduct');
                      setAdjType('normal');
                    }}
                    className={`py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                      actionType === 'deduct' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>Deduct Stock (Loss/Damage)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActionType('add');
                      setAdjType('surplus');
                    }}
                    className={`py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                      actionType === 'add' ? 'bg-white text-cyan-700 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Add Stock (Surplus Found)</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {actionType === 'deduct' ? (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Loss Classification *</label>
                    <select
                      value={adjType}
                      onChange={e => setAdjType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:bg-white focus:outline-hidden"
                    >
                      <option value="normal">Normal (Display / Shrinkage / Wear)</option>
                      <option value="abnormal">Abnormal (Water / Transit / Theft)</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Surplus Classification</label>
                    <input
                      type="text"
                      disabled
                      value="Cycle Audit Surplus"
                      className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-semibold"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Warehouse Location *</label>
                  <select
                    value={selectedLocationId}
                    onChange={e => setSelectedLocationId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:bg-white focus:outline-hidden"
                  >
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Select Product */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product to Reconcile *</label>
                <select
                  value={selectedProductId}
                  onChange={e => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:bg-white focus:outline-hidden"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) — Current: {p.currentStock} {p.unit}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity & Salvage */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {actionType === 'deduct' ? 'Units to Deduct *' : 'Units to Add *'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={adjQty}
                    onChange={e => setAdjQty(e.target.value)}
                    className={`w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:bg-white focus:outline-hidden ${
                      actionType === 'deduct' ? 'text-rose-600' : 'text-cyan-700'
                    }`}
                  />
                </div>

                {actionType === 'deduct' ? (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Salvage / Scrap Recouped ({settings.currencySymbol})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={amountRecovered}
                      onChange={e => setAmountRecovered(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-emerald-600 focus:bg-white focus:outline-hidden"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Valuation Impact</label>
                    <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl font-bold text-emerald-700">
                      Positive Asset Gain
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Audit Notes / Incident Reason *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Scratched during forklift transport or count reconciliation..."
                  value={adjReason}
                  onChange={e => setAdjReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden resize-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-xs shadow-blue-200 cursor-pointer"
                >
                  Post Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Discrepancy Detail Modal */}
      {selectedAdjustmentForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base font-mono">{selectedAdjustmentForView.refNo}</h3>
                <p className="text-xs text-slate-400">Inventory Adjustment Audit Voucher</p>
              </div>
              <button
                onClick={() => setSelectedAdjustmentForView(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Audit Date</span>
                  <span className="font-bold text-slate-800">{selectedAdjustmentForView.date}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Location</span>
                  <span className="font-bold text-slate-800">{selectedAdjustmentForView.locationName}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Adjusted Item</span>
                <div className="p-3 bg-slate-100/70 rounded-xl border border-slate-200">
                  {selectedAdjustmentForView.items.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">{it.productName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{it.sku}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold font-mono">
                          {selectedAdjustmentForView.actionType === 'add' ? `+${it.quantity}` : `-${it.quantity}`} units
                        </div>
                        <div className="text-[10px] text-slate-500">@{settings.currencySymbol}{it.unitCost} cost</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-0.5">Audit Reason</span>
                <p className="text-amber-900 font-medium">{selectedAdjustmentForView.reason}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Salvage Recouped</span>
                  <span className="font-bold text-emerald-600 text-sm">
                    {settings.currencySymbol}{selectedAdjustmentForView.totalAmountRecovered.toFixed(2)}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Net Loss Written Down</span>
                  <span className="font-bold text-rose-600 text-sm">
                    {settings.currencySymbol}{selectedAdjustmentForView.totalLoss.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedAdjustmentForView(null)}
                className="px-4 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
