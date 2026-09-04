import React from 'react';
import { 
  LayoutDashboard, 
  Truck, 
  FileSpreadsheet, 
  Users, 
  Receipt, 
  BarChart3, 
  Plus, 
  ArrowUpRight, 
  Clock, 
  PackageCheck, 
  AlertCircle 
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { NebulaPage, TableCard } from '../../core/ui';

interface PurchaseDashboardViewProps {
  onNavigate: (tab: string) => void;
  onNewPO: () => void;
}

export const PurchaseDashboardView: React.FC<PurchaseDashboardViewProps> = ({ onNavigate, onNewPO }) => {
  const { transactions, contacts, settings } = usePOS();
  const purchases = transactions.filter(t => t.type === 'purchase');
  const totalSpend = purchases.reduce((acc, p) => acc + p.finalTotal, 342500);
  const suppliersList = contacts.filter(c => c.type === 'supplier' || c.type === 'both');

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
      {/* Top KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Purchase Spend</p>
          <p className="text-xl font-black text-slate-900 mt-1">{settings.currencySymbol}{totalSpend.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending POs</p>
          <p className="text-xl font-black text-blue-600 mt-1">14 Orders</p>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Requisitions</p>
          <p className="text-xl font-black text-amber-600 mt-1">12 Pending</p>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Suppliers Active</p>
          <p className="text-xl font-black text-emerald-600 mt-1">{suppliersList.length || 18}</p>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Goods Awaiting</p>
          <p className="text-xl font-black text-purple-600 mt-1">6 Shipments</p>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Proc Time</p>
          <p className="text-xl font-black text-slate-900 mt-1">3.8 Days</p>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">This Month</p>
          <p className="text-xl font-black text-emerald-600 mt-1">{settings.currencySymbol}84,200</p>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inventory Value</p>
          <p className="text-xl font-black text-blue-600 mt-1">{settings.currencySymbol}612,400</p>
        </div>
      </div>

      {/* Quick Actions & Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <TableCard title="Recent Purchase Orders" subtitle="Inbound supplier acquisitions and fulfillment tracking">
            <div className="divide-y divide-slate-100 text-xs p-4">
              {purchases.slice(0, 5).map(p => (
                <div key={p.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      PO
                    </div>
                    <div>
                      <span className="font-bold text-slate-900">PO #{p.invoiceNo}</span>
                      <p className="text-slate-500 text-[11px]">{p.contactName} • {p.transactionDate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-slate-900">{settings.currencySymbol}{p.finalTotal.toFixed(2)}</span>
                    <span className="block text-[10px] font-bold text-emerald-600 uppercase">Received</span>
                  </div>
                </div>
              ))}
            </div>
          </TableCard>

          <TableCard title="Low Stock Requiring Purchase" subtitle="Inventory items below safety stock thresholds">
            <div className="p-4 space-y-3 text-xs">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-rose-900">MacBook Pro 16 M3 Max (SKU: MB-16-M3)</span>
                  <p className="text-rose-700 text-[11px]">Current Stock: 2 units • Reorder Level: 5 units</p>
                </div>
                <button onClick={onNewPO} className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-xs">
                  Create PO
                </button>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-amber-900">Dell UltraSharp 32 4K Monitor (SKU: DEL-32-4K)</span>
                  <p className="text-amber-700 text-[11px]">Current Stock: 4 units • Reorder Level: 8 units</p>
                </div>
                <button onClick={onNewPO} className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-xs">
                  Create PO
                </button>
              </div>
            </div>
          </TableCard>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Procurement Quick Actions</h3>
            <div className="grid grid-cols-1 gap-2 text-xs font-bold">
              <button onClick={onNewPO} className="w-full text-left px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-3 transition-all shadow-sm cursor-pointer">
                <Truck className="w-4 h-4" /> New Purchase Order
              </button>
              <button onClick={() => onNavigate('requisitions')} className="w-full text-left px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center gap-3 transition-all cursor-pointer">
                <FileSpreadsheet className="w-4 h-4 text-blue-600" /> Create Requisition
              </button>
              <button onClick={() => onNavigate('suppliers')} className="w-full text-left px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center gap-3 transition-all cursor-pointer">
                <Users className="w-4 h-4 text-emerald-600" /> Add Supplier
              </button>
              <button onClick={() => onNavigate('expenses')} className="w-full text-left px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center gap-3 transition-all cursor-pointer">
                <Receipt className="w-4 h-4 text-purple-600" /> Record Expense
              </button>
              <button onClick={() => onNavigate('reports')} className="w-full text-left px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center gap-3 transition-all cursor-pointer">
                <BarChart3 className="w-4 h-4 text-amber-600" /> View Reports
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Upcoming Deliveries</h3>
            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900">PO #8821 — Apex Global</span>
                  <p className="text-slate-400 text-[10px]">Expected Today, 2:00 PM</p>
                </div>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded text-[10px]">In Transit</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900">PO #8822 — Nexus Cyber</span>
                  <p className="text-slate-400 text-[10px]">Expected Sep 6</p>
                </div>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded text-[10px]">Processing</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
