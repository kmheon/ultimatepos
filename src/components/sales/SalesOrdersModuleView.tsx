import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  Eye, 
  Printer, 
  CheckCircle2, 
  Clock, 
  PlusCircle, 
  Truck, 
  Wrench, 
  BarChart3, 
  Building,
  User,
  Box,
  MapPin,
  ClipboardList,
  ArrowRight
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { Transaction } from '../../types';
import { 
  NebulaPage, 
  NebulaTable, 
  TableCard, 
  SummaryCard, 
  Column, 
  NebulaWorkspaceItem 
} from '../../core/ui';

export type SalesOrdersSubTab = 'active' | 'picking' | 'packing' | 'dispatched' | 'analytics';

interface SalesOrdersModuleViewProps {
  initialSubTab?: string;
}

interface SalesOrderRecord {
  id: string;
  orderNo: string;
  customerName: string;
  customerMobile: string;
  warehouse: string;
  fulfillmentStage: 'Confirmed' | 'Inventory Reserved' | 'Picking' | 'Packing' | 'Ready for Dispatch' | 'Dispatched' | 'Completed';
  deliveryDate: string;
  installationRequired: boolean;
  assignedTeam: string;
  itemsCount: number;
  totalAmount: number;
  shippingCarrier: string;
  trackingNo: string;
}

export const SalesOrdersModuleView: React.FC<SalesOrdersModuleViewProps> = ({ initialSubTab = 'active' }) => {
  const { transactions, settings, setActiveTab } = usePOS();
  const [activeSubTab, setActiveSubTab] = useState<SalesOrdersSubTab>((initialSubTab as SalesOrdersSubTab) || 'active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<SalesOrderRecord | null>(null);

  // Dedicated Sales Orders operations dataset (distinct from Invoices and Quotations)
  const ordersDataset: SalesOrderRecord[] = useMemo(() => {
    return transactions.map((tx, idx) => ({
      id: `ord-${tx.id}`,
      orderNo: `SO-2026-${(9381 + idx).toString()}`,
      customerName: tx.contactName,
      customerMobile: tx.contactMobile || '+1 (555) 382-9102',
      warehouse: idx % 2 === 0 ? 'Main Distribution Hub A' : 'North Logistics Center B',
      fulfillmentStage: idx === 0 ? 'Inventory Reserved' : idx === 1 ? 'Picking' : idx === 2 ? 'Packing' : idx === 3 ? 'Ready for Dispatch' : 'Dispatched',
      deliveryDate: new Date(Date.now() + (idx + 1) * 86400000).toISOString().slice(0, 10),
      installationRequired: idx % 2 === 0,
      assignedTeam: idx % 3 === 0 ? 'Fulfillment Squad Alpha' : 'Logistics Team Delta',
      itemsCount: tx.items.length,
      totalAmount: tx.finalTotal,
      shippingCarrier: idx % 2 === 0 ? 'FedEx Express Freight' : 'DHL Global Logistics',
      trackingNo: `TRK-938210${idx}`,
    }));
  }, [transactions]);

  const orderWorkspaces: NebulaWorkspaceItem[] = useMemo(() => [
    { id: 'active', label: 'Active Orders', icon: Package, description: 'Customer confirmed purchase orders awaiting warehouse processing' },
    { id: 'picking', label: 'Picking & Packing', icon: Box, description: 'Warehouse floor picking lists and box packing stations' },
    { id: 'dispatched', label: 'Dispatched & Delivery', icon: Truck, description: 'Courier transit tracking and on-site installation schedules' },
    { id: 'analytics', label: 'Operations Analytics', icon: BarChart3, description: 'Fulfillment throughput, processing velocity, and warehouse metrics' },
  ], []);

  const handleTabChange = (tabId: string) => {
    setActiveSubTab(tabId as SalesOrdersSubTab);
  };

  const filteredOrders = useMemo(() => {
    return ordersDataset.filter(ord => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        ord.orderNo.toLowerCase().includes(q) ||
        ord.customerName.toLowerCase().includes(q) ||
        ord.warehouse.toLowerCase().includes(q) ||
        ord.assignedTeam.toLowerCase().includes(q);

      let matchesTab = true;
      if (activeSubTab === 'picking') matchesTab = ['Inventory Reserved', 'Picking', 'Packing'].includes(ord.fulfillmentStage);
      if (activeSubTab === 'dispatched') matchesTab = ['Ready for Dispatch', 'Dispatched', 'Completed'].includes(ord.fulfillmentStage);

      return matchesSearch && matchesTab;
    });
  }, [ordersDataset, searchQuery, activeSubTab]);

  // Operations KPIs
  const activeOrdersCount = ordersDataset.length;
  const inventoryReservedCount = ordersDataset.filter(o => o.fulfillmentStage === 'Inventory Reserved').length;
  const pickingPackingCount = ordersDataset.filter(o => ['Picking', 'Packing'].includes(o.fulfillmentStage)).length;
  const scheduledDispatchesCount = ordersDataset.filter(o => ['Ready for Dispatch', 'Dispatched'].includes(o.fulfillmentStage)).length;
  const installationQueueCount = ordersDataset.filter(o => o.installationRequired).length;

  const columns: Column<SalesOrderRecord>[] = useMemo(() => [
    {
      header: 'Sales Order #',
      accessor: (ord) => (
        <span className="font-mono font-black text-blue-600 cursor-pointer hover:underline" onClick={() => setSelectedOrder(ord)}>
          {ord.orderNo}
        </span>
      ),
      sortable: true
    },
    {
      header: 'Customer',
      accessor: (ord) => (
        <div>
          <div className="font-bold text-slate-900 cursor-pointer hover:text-blue-600" onClick={() => setSelectedOrder(ord)}>
            {ord.customerName}
          </div>
          <div className="text-[10px] text-slate-400">{ord.customerMobile}</div>
        </div>
      )
    },
    {
      header: 'Warehouse Location',
      accessor: (ord) => (
        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
          {ord.warehouse}
        </span>
      )
    },
    {
      header: 'Fulfillment Stage',
      accessor: (ord) => {
        const stageColor = 
          ord.fulfillmentStage === 'Dispatched' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
          ord.fulfillmentStage === 'Ready for Dispatch' ? 'bg-blue-50 text-blue-700 border-blue-200' :
          ord.fulfillmentStage === 'Packing' ? 'bg-purple-50 text-purple-700 border-purple-200' :
          'bg-amber-50 text-amber-700 border-amber-200';
        return (
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1 border ${stageColor}`}>
            <ClipboardList className="w-3 h-3" />
            {ord.fulfillmentStage}
          </span>
        );
      }
    },
    {
      header: 'Delivery Date',
      accessor: (ord) => (
        <span className="text-xs font-semibold text-slate-700">{ord.deliveryDate}</span>
      )
    },
    {
      header: 'Installation',
      accessor: (ord) => (
        <span className={`text-xs font-bold px-2 py-0.5 rounded ${ord.installationRequired ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
          {ord.installationRequired ? 'Required (On-site)' : 'None'}
        </span>
      )
    },
    {
      header: 'Assigned Team',
      accessor: (ord) => (
        <span className="text-xs text-slate-600 font-medium">{ord.assignedTeam}</span>
      )
    },
    {
      header: 'Operations Actions',
      accessor: (ord) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => setSelectedOrder(ord)}
            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-all cursor-pointer flex items-center gap-1"
          >
            <span>Fulfill</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      ),
      className: 'text-right'
    }
  ], []);

  return (
    <NebulaPage
      icon={Package}
      title="Sales Orders & Fulfillment Operations"
      badge="Operations Workspace"
      description="Manage confirmed customer orders, warehouse inventory allocation, picking lists, box packing, courier dispatch, and on-site installation queues."
      workspaces={orderWorkspaces}
      activeWorkspace={activeSubTab}
      onWorkspaceChange={handleTabChange}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search sales orders by Order #, Customer, Warehouse, or Team..."
      extraToolbarActions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('pos')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer shadow-blue-200"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Order / POS</span>
          </button>
        </div>
      }
    >
      <div className="flex flex-col space-y-6">
        {activeSubTab !== 'analytics' ? (
          <>
            {/* Sales Orders Operations KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Orders</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{activeOrdersCount}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inventory Reserved</p>
                <p className="text-2xl font-black text-blue-600 mt-1">{inventoryReservedCount}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Picking / Packing</p>
                <p className="text-2xl font-black text-purple-600 mt-1">{pickingPackingCount}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scheduled Dispatches</p>
                <p className="text-2xl font-black text-emerald-600 mt-1">{scheduledDispatchesCount}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Installation Queue</p>
                <p className="text-2xl font-black text-amber-600 mt-1">{installationQueueCount}</p>
              </div>
            </div>

            {/* Table Card */}
            <TableCard
              title="Warehouse Fulfillment & Operations Board"
              subtitle={`Showing ${filteredOrders.length} sales orders in fulfillment pipeline`}
              actions={
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <span>Active Hub: Main Distribution Center</span>
                </div>
              }
            >
              <NebulaTable
                data={filteredOrders}
                columns={columns}
                keyExtractor={(o) => o.id}
                emptyMessage="No sales orders found matching fulfillment criteria."
              />
            </TableCard>
          </>
        ) : (
          /* Operations Analytics */
          <SummaryCard title="Sales Orders Fulfillment & Warehouse Performance Analytics" subtitle="Throughput metrics, picking accuracy, and processing velocity">
            <div className="space-y-6 p-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 space-y-2">
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Order Fulfillment Rate</span>
                  <p className="text-3xl font-black text-blue-900">99.2%</p>
                  <p className="text-xs text-blue-600">Successfully picked, packed, and dispatched orders without discrepancies.</p>
                </div>
                <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-2">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Average Processing Time</span>
                  <p className="text-3xl font-black text-emerald-900">32 Minutes</p>
                  <p className="text-xs text-emerald-600">Time elapsed from customer order placement to warehouse bin allocation.</p>
                </div>
                <div className="p-5 bg-purple-50 rounded-2xl border border-purple-100 space-y-2">
                  <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">On-Time Dispatch Rate</span>
                  <p className="text-3xl font-black text-purple-900">98.8%</p>
                  <p className="text-xs text-purple-600">Courier pickups executed within committed delivery windows.</p>
                </div>
              </div>
            </div>
          </SummaryCard>
        )}
      </div>

      {/* Sales Order Fulfillment Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 overflow-y-auto">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between sticky top-0 z-10">
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Sales Order Fulfillment Console</span>
                <h3 className="text-lg font-black font-mono mt-0.5">{selectedOrder.orderNo}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>{selectedOrder.customerName}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div>Warehouse: <span className="font-semibold text-slate-900">{selectedOrder.warehouse}</span></div>
                  <div>Stage: <span className="font-semibold text-emerald-600 uppercase">{selectedOrder.fulfillmentStage}</span></div>
                  <div>Delivery Date: <span className="font-semibold text-slate-900">{selectedOrder.deliveryDate}</span></div>
                  <div>Installation: <span className="font-semibold text-slate-900">{selectedOrder.installationRequired ? 'Required' : 'None'}</span></div>
                  <div>Carrier: <span className="font-semibold text-slate-900">{selectedOrder.shippingCarrier}</span></div>
                  <div>Tracking: <span className="font-mono text-blue-600 font-bold">{selectedOrder.trackingNo}</span></div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Warehouse Bin Picking & Packing List</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs p-3 bg-slate-50 space-y-2">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>Item Description</span>
                    <span>Bin Location</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Dell XPS 15 Creator Edition (Qty: 1)</span>
                    <span className="font-mono font-bold text-blue-600">Aisle 4 - Bin 12</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Logistics Handling & Assembly Kit</span>
                    <span className="font-mono font-bold text-blue-600">Shelf B - Rack 2</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Fulfillment Execution Workflow</h4>
                <div className="space-y-2 text-xs">
                  <button
                    onClick={() => {
                      alert(`Order ${selectedOrder.orderNo} status updated to Ready for Dispatch!`);
                      setSelectedOrder(null);
                    }}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Mark Packed & Ready for Dispatch</span>
                  </button>
                  <button
                    onClick={() => {
                      alert(`Dispatch label printed for ${selectedOrder.orderNo} via ${selectedOrder.shippingCarrier}!`);
                    }}
                    className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Shipping Label & Packing Slip</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </NebulaPage>
  );
};
