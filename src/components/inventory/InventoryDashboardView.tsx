import React from 'react';
import { 
  Package, 
  Boxes, 
  AlertTriangle, 
  TrendingUp, 
  ArrowLeftRight, 
  SlidersHorizontal, 
  Barcode, 
  BarChart3, 
  ArrowUpRight, 
  Building2, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Plus, 
  Truck, 
  RefreshCw 
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { SummaryCard, TableCard, NebulaStatGrid, NebulaStatCard } from '../../core/ui';

interface InventoryDashboardViewProps {
  onNavigateTab: (tab: string) => void;
  onOpenAddProduct: () => void;
}

export const InventoryDashboardView: React.FC<InventoryDashboardViewProps> = ({ onNavigateTab, onOpenAddProduct }) => {
  const { products, categories, settings } = usePOS();

  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + (p.purchasePrice * p.currentStock), 0);
  const lowStockCount = products.filter(p => p.currentStock <= p.alertQuantity && p.currentStock > 0).length;
  const outOfStockCount = products.filter(p => p.currentStock === 0).length;
  const incomingStock = 1420;
  const pendingTransfers = 4;
  const pendingAdjustments = 3;
  const inventoryAccuracy = 98.6;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Enterprise Inventory KPIs */}
      <NebulaStatGrid>
        <NebulaStatCard
          label="Out of Stock"
          value={outOfStockCount}
          icon={AlertTriangle}
          iconColor="text-rose-600"
          iconBgColor="bg-rose-50"
          statusText="Stockout alert"
          statusColor="text-rose-600"
        />
        <NebulaStatCard
          label="Incoming Stock"
          value={incomingStock}
          icon={Truck}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-50"
          statusText="Units en route"
          statusColor="text-purple-600"
        />
        <NebulaStatCard
          label="Pending Transfers"
          value={pendingTransfers}
          icon={ArrowLeftRight}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-50"
          statusText="Inter-warehouse"
          statusColor="text-blue-600"
        />
        <NebulaStatCard
          label="Pending Audits"
          value={pendingAdjustments}
          icon={SlidersHorizontal}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-50"
          statusText="Stock corrections"
          statusColor="text-indigo-600"
        />
        <NebulaStatCard
          label="Inventory Accuracy"
          value={`${inventoryAccuracy}%`}
          icon={ShieldCheck}
          iconColor="text-emerald-600"
          iconBgColor="bg-emerald-50"
          statusText="Cycle count rate"
          statusColor="text-emerald-600"
        />
      </NebulaStatGrid>

      {/* Quick Actions Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">Quick Warehouse Actions:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={onOpenAddProduct} className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-2xs cursor-pointer">
            <Plus className="w-3.5 h-3.5" /> Add Product
          </button>
          <button onClick={() => onNavigateTab('stock')} className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer">
            <Truck className="w-3.5 h-3.5" /> Receive Stock
          </button>
          <button onClick={() => onNavigateTab('transfers')} className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer">
            <ArrowLeftRight className="w-3.5 h-3.5" /> Stock Transfer
          </button>
          <button onClick={() => onNavigateTab('adjustments')} className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Stock Adjustment
          </button>
          <button onClick={() => alert('Opening Barcode & Label Printing Studio...')} className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer">
            <Barcode className="w-3.5 h-3.5" /> Print Labels
          </button>
          <button onClick={() => onNavigateTab('reports')} className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer">
            <BarChart3 className="w-3.5 h-3.5" /> Inventory Reports
          </button>
        </div>
      </div>

      {/* Dashboard Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TableCard title="Inventory Health Overview" subtitle="Stock valuation breakdown across warehousing zones">
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="font-bold text-emerald-800">Healthy Stock</span>
                <p className="text-xl font-black text-emerald-900 mt-1">{products.filter(p => p.currentStock > p.alertQuantity).length} SKUs</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <span className="font-bold text-amber-800">Low Stock</span>
                <p className="text-xl font-black text-amber-900 mt-1">{lowStockCount} SKUs</p>
              </div>
              <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
                <span className="font-bold text-rose-800">Stockout</span>
                <p className="text-xl font-black text-rose-900 mt-1">{outOfStockCount} SKUs</p>
              </div>
            </div>
          </div>
        </TableCard>

        <TableCard title="Low Stock Alerts" subtitle="Urgent item replenishment required">
          <div className="p-5">
            {products.filter(p => p.currentStock <= p.alertQuantity).length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">No low stock warnings at this time.</div>
            ) : (
              <div className="space-y-3 max-h-56 overflow-y-auto pr-2 text-xs">
                {products.filter(p => p.currentStock <= p.alertQuantity).slice(0, 5).map(p => (
                  <div key={p.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <span className="font-bold text-slate-900">{p.name}</span>
                      <p className="text-[10px] text-slate-500">SKU: {p.sku}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-amber-600">{p.currentStock} left</span>
                      <span className="block text-[10px] text-slate-400">Min: {p.alertQuantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TableCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TableCard title="Recent Stock Movements" subtitle="Audit trail of warehouse entries, exits, and adjustments">
            <div className="p-5 text-xs">
              <div className="divide-y divide-slate-100">
                {[
                  { ref: 'PO-2026-891', item: 'Industrial Sensor Pro', type: 'Stock In', qty: '+250 units', warehouse: 'Central Hub', time: '2 hours ago' },
                  { ref: 'SO-2026-402', item: 'Smart POS Terminal V2', type: 'Stock Out', qty: '-12 units', warehouse: 'Retail Flagship', time: '4 hours ago' },
                  { ref: 'TR-2026-105', item: 'Ethernet Switch 24-Port', type: 'Transfer', qty: '50 units', warehouse: 'Depot 3 → Hub', time: 'Yesterday' },
                  { ref: 'ADJ-2026-012', item: 'Barcode Scanner Laser', type: 'Audit Correction', qty: '-2 units', warehouse: 'Central Hub', time: '2 days ago' },
                ].map((m, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl font-bold ${m.type.includes('In') ? 'bg-emerald-50 text-emerald-600' : m.type.includes('Out') ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                        <RefreshCw className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900">{m.item}</span>
                        <p className="text-[10px] text-slate-400">{m.ref} • {m.warehouse}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-slate-900">{m.qty}</span>
                      <span className="block text-[10px] text-slate-400">{m.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TableCard>
        </div>

        <div>
          <TableCard title="Warehouse Capacity" subtitle="Storage utilization ratio">
            <div className="p-5 space-y-4 text-xs">
              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span>Central Distribution Hub</span>
                  <span>78% Utilized</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span>Eastside Depot</span>
                  <span>64% Utilized</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: '64%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span>Fulfillment Terminal 3</span>
                  <span>92% Utilized</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-amber-600 h-full rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
            </div>
          </TableCard>
        </div>
      </div>
    </div>
  );
};
