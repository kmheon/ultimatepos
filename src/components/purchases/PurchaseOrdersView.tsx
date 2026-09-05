import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  DollarSign, 
  PackageCheck, 
  FileText, 
  Printer, 
  MoreVertical, 
  Trash2, 
  Calendar, 
  Building2, 
  ArrowUpDown, 
  Eye, 
  Receipt,
  Download,
  Package,
  Layers
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { Transaction } from '../../types';
import { NebulaStatGrid } from '../../core/ui/components/dashboard/NebulaStatGrid';
import { NebulaStatCard } from '../../core/ui/components/dashboard/NebulaStatCard';
import { AddPurchaseModal } from './AddPurchaseModal';
import { GoodsReceiptModal } from './GoodsReceiptModal';
import { PurchasePaymentModal } from './PurchasePaymentModal';
import { PurchaseOrderDetailModal } from './PurchaseOrderDetailModal';

type FilterStatus = 'all' | 'ordered' | 'pending' | 'received' | 'due';

export const PurchaseOrdersView: React.FC = () => {
  const { transactions, contacts, locations, settings, deleteTransaction, updatePurchaseOrderStatus } = usePOS();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<Transaction | null>(null);
  const [grnOrder, setGrnOrder] = useState<Transaction | null>(null);
  const [paymentOrder, setPaymentOrder] = useState<Transaction | null>(null);
  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);

  // All purchase transactions
  const purchaseOrders = useMemo(() => {
    return transactions.filter(t => t.type === 'purchase');
  }, [transactions]);

  // Suppliers list for filtering
  const suppliers = useMemo(() => {
    return contacts.filter(c => c.type === 'supplier' || c.type === 'both');
  }, [contacts]);

  // Metrics calculation
  const metrics = useMemo(() => {
    const totalCount = purchaseOrders.length;
    const totalValue = purchaseOrders.reduce((sum, po) => sum + (po.finalTotal || 0), 0);
    
    const awaitingReceiptOrders = purchaseOrders.filter(po => po.status === 'ordered');
    const awaitingReceiptCount = awaitingReceiptOrders.length;
    const awaitingReceiptValue = awaitingReceiptOrders.reduce((sum, po) => sum + (po.finalTotal || 0), 0);

    const partialOrders = purchaseOrders.filter(po => po.status === 'pending');
    const partialCount = partialOrders.length;

    const receivedOrders = purchaseOrders.filter(po => po.status === 'received');
    const receivedCount = receivedOrders.length;
    const receivedValue = receivedOrders.reduce((sum, po) => sum + (po.finalTotal || 0), 0);

    const totalDue = purchaseOrders.reduce((sum, po) => {
      const due = Math.max(0, (po.finalTotal || 0) - (po.amountPaid || 0));
      return sum + due;
    }, 0);

    return {
      totalCount,
      totalValue,
      awaitingReceiptCount,
      awaitingReceiptValue,
      partialCount,
      receivedCount,
      receivedValue,
      totalDue,
    };
  }, [purchaseOrders]);

  // Filtered & Sorted POs
  const filteredOrders = useMemo(() => {
    return purchaseOrders.filter(po => {
      // Status Filter
      if (activeFilter === 'ordered' && po.status !== 'ordered') return false;
      if (activeFilter === 'pending' && po.status !== 'pending') return false;
      if (activeFilter === 'received' && po.status !== 'received') return false;
      if (activeFilter === 'due' && (po.paymentStatus === 'paid' || (po.finalTotal - po.amountPaid) <= 0)) return false;

      // Supplier Filter
      if (selectedSupplier !== 'all' && po.contactId !== selectedSupplier) return false;

      // Location Filter
      if (selectedLocation !== 'all' && po.locationId !== selectedLocation) return false;

      // Search Filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesInvoice = po.invoiceNo?.toLowerCase().includes(query);
        const matchesRef = po.refNo?.toLowerCase().includes(query);
        const matchesSupplier = po.contactName?.toLowerCase().includes(query);
        const matchesNotes = po.notes?.toLowerCase().includes(query);
        const matchesItems = po.items.some(item => 
          item.productName.toLowerCase().includes(query) || 
          item.sku.toLowerCase().includes(query)
        );

        if (!matchesInvoice && !matchesRef && !matchesSupplier && !matchesNotes && !matchesItems) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date_desc') {
        return new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime();
      }
      if (sortBy === 'date_asc') {
        return new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime();
      }
      if (sortBy === 'amount_desc') {
        return (b.finalTotal || 0) - (a.finalTotal || 0);
      }
      if (sortBy === 'amount_asc') {
        return (a.finalTotal || 0) - (b.finalTotal || 0);
      }
      return 0;
    });
  }, [purchaseOrders, activeFilter, selectedSupplier, selectedLocation, searchTerm, sortBy]);

  const handleDeletePO = (id: string, ref: string) => {
    if (window.confirm(`Are you sure you want to delete purchase order ${ref}? This action cannot be undone.`)) {
      deleteTransaction(id);
      setActionMenuOpenId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Standardized Responsive KPI Row (NEB-UI-GOV-01) */}
      <NebulaStatGrid>
        <NebulaStatCard
          label="Total Procurement"
          value={`${settings.currencySymbol}${metrics.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          statusText={`${metrics.totalCount} Purchase Orders`}
          icon={Receipt}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-50"
        />

        <NebulaStatCard
          label="Awaiting Inbound"
          value={`${metrics.awaitingReceiptCount} Orders`}
          statusText={`${settings.currencySymbol}${metrics.awaitingReceiptValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} in transit`}
          icon={Truck}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-50"
        />

        <NebulaStatCard
          label="Partially Received"
          value={`${metrics.partialCount} Orders`}
          statusText="Partial dock intake"
          icon={PackageCheck}
          iconColor="text-amber-600"
          iconBgColor="bg-amber-50"
        />

        <NebulaStatCard
          label="Stocked & Received"
          value={`${metrics.receivedCount} Orders`}
          statusText={`${settings.currencySymbol}${metrics.receivedValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} received`}
          icon={CheckCircle2}
          iconColor="text-emerald-600"
          iconBgColor="bg-emerald-50"
        />

        <NebulaStatCard
          label="Accounts Payable Due"
          value={`${settings.currencySymbol}${metrics.totalDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          statusText="Outstanding liabilities"
          icon={DollarSign}
          iconColor="text-rose-600"
          iconBgColor="bg-rose-50"
          statusColor="text-rose-600"
        />
      </NebulaStatGrid>

      {/* 2. Controls & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 space-y-4">
        {/* Status Pills & Primary Action */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status filter tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/50">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeFilter === 'all'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              All Orders ({metrics.totalCount})
            </button>

            <button
              onClick={() => setActiveFilter('ordered')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeFilter === 'ordered'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-blue-500" />
              <span>In Transit ({metrics.awaitingReceiptCount})</span>
            </button>

            <button
              onClick={() => setActiveFilter('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeFilter === 'pending'
                  ? 'bg-white text-amber-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Partial / Pending ({metrics.partialCount})</span>
            </button>

            <button
              onClick={() => setActiveFilter('received')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeFilter === 'received'
                  ? 'bg-white text-emerald-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Received ({metrics.receivedCount})</span>
            </button>

            <button
              onClick={() => setActiveFilter('due')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeFilter === 'due'
                  ? 'bg-white text-rose-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-rose-500" />
              <span>Payment Due</span>
            </button>
          </div>

          {/* New Purchase Order Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Create Purchase Order</span>
          </button>
        </div>

        {/* Search & Dynamic Select Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search PO #, supplier, SKU, product..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all"
            />
          </div>

          {/* Supplier Select */}
          <div>
            <select
              value={selectedSupplier}
              onChange={e => setSelectedSupplier(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all text-slate-700 font-medium"
            >
              <option value="all">All Suppliers ({suppliers.length})</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Warehouse Location Select */}
          <div>
            <select
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all text-slate-700 font-medium"
            >
              <option value="all">All Warehouse Docks</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Select */}
          <div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all text-slate-700 font-medium"
            >
              <option value="date_desc">Order Date: Newest First</option>
              <option value="date_asc">Order Date: Oldest First</option>
              <option value="amount_desc">PO Total: High to Low</option>
              <option value="amount_asc">PO Total: Low to High</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400 mb-3 border border-slate-200">
              <Truck className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No Purchase Orders Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {searchTerm || activeFilter !== 'all' || selectedSupplier !== 'all'
                ? 'No purchase orders match your filter criteria. Try resetting your search or filters.'
                : 'There are currently no purchase orders in the system. Create your first supplier PO to start inbound tracking.'}
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              {(searchTerm || activeFilter !== 'all' || selectedSupplier !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setActiveFilter('all');
                    setSelectedSupplier('all');
                    setSelectedLocation('all');
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              )}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
              >
                Create Purchase Order
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">PO Number / Ref</th>
                  <th className="py-3 px-4">Order & Expected Date</th>
                  <th className="py-3 px-4">Supplier / Vendor</th>
                  <th className="py-3 px-4">Warehouse Dock</th>
                  <th className="py-3 px-4">Items Summary</th>
                  <th className="py-3 px-4">Fulfillment</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4 text-right">Total Amount</th>
                  <th className="py-3 px-4 text-right">Balance Due</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredOrders.map(order => {
                  const due = Math.max(0, order.finalTotal - order.amountPaid);
                  const totalUnits = order.items.reduce((acc, item) => acc + item.quantity, 0);

                  return (
                    <tr 
                      key={order.id} 
                      className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                      onClick={() => setViewingOrder(order)}
                    >
                      {/* PO / Invoice # */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-blue-600 font-mono flex items-center gap-1.5 group-hover:underline">
                          <FileText className="w-3.5 h-3.5 text-blue-500" />
                          <span>{order.invoiceNo || order.refNo}</span>
                        </div>
                        {order.refNo && order.refNo !== order.invoiceNo && (
                          <div className="text-[11px] font-mono text-slate-400">Ref: {order.refNo}</div>
                        )}
                      </td>

                      {/* Dates */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{order.transactionDate?.slice(0, 10)}</span>
                        </div>
                        {order.delivery?.expectedDate && (
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <span className="text-slate-400">Est:</span>
                            <span className="font-semibold text-slate-700">{order.delivery.expectedDate}</span>
                          </div>
                        )}
                      </td>

                      {/* Supplier */}
                      <td className="py-3.5 px-4 max-w-[200px]">
                        <div className="font-bold text-slate-900 truncate">{order.contactName}</div>
                        {order.contactMobile && (
                          <div className="text-[11px] text-slate-500 truncate">{order.contactMobile}</div>
                        )}
                      </td>

                      {/* Warehouse */}
                      <td className="py-3.5 px-4 max-w-[160px]">
                        <div className="font-medium text-slate-800 truncate flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{order.locationName || 'Central Hub'}</span>
                        </div>
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                          <Package className="w-3 h-3 text-slate-500" />
                          <span>{order.items.length} {order.items.length === 1 ? 'item' : 'items'} ({totalUnits} units)</span>
                        </div>
                      </td>

                      {/* Inbound Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          order.status === 'received'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status === 'received' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <Truck className="w-3 h-3" />
                          )}
                          <span>{order.status}</span>
                        </span>
                      </td>

                      {/* Payment Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          order.paymentStatus === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.paymentStatus === 'partial'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          <span>{order.paymentStatus}</span>
                        </span>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-bold text-slate-900">
                          {settings.currencySymbol}{order.finalTotal.toFixed(2)}
                        </div>
                        <div className="text-[11px] text-slate-400 uppercase font-mono">
                          {order.paymentMethod.replace('_', ' ')}
                        </div>
                      </td>

                      {/* Balance Due */}
                      <td className="py-3.5 px-4 text-right">
                        {due > 0 ? (
                          <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                            {settings.currencySymbol}{due.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-semibold flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Settled</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          {/* View PO */}
                          <button
                            title="View / Print PO"
                            onClick={() => setViewingOrder(order)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Goods Receipt (GRN) */}
                          {order.status !== 'received' && (
                            <button
                              title="Receive Goods (GRN)"
                              onClick={() => setGrnOrder(order)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <PackageCheck className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Record Payment */}
                          {due > 0 && (
                            <button
                              title="Record Payment"
                              onClick={() => setPaymentOrder(order)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete PO */}
                          <button
                            title="Delete Purchase Order"
                            onClick={() => handleDeletePO(order.id, order.invoiceNo || order.refNo || order.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Modals */}
      {/* Create PO Modal */}
      {isAddModalOpen && (
        <AddPurchaseModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}

      {/* View & Print PO Document Modal */}
      {viewingOrder && (
        <PurchaseOrderDetailModal
          isOpen={!!viewingOrder}
          onClose={() => setViewingOrder(null)}
          order={viewingOrder}
          onOpenGRN={() => setGrnOrder(viewingOrder)}
          onOpenPayment={() => setPaymentOrder(viewingOrder)}
        />
      )}

      {/* Goods Receipt Note (GRN) Modal */}
      {grnOrder && (
        <GoodsReceiptModal
          isOpen={!!grnOrder}
          onClose={() => setGrnOrder(null)}
          order={grnOrder}
          onSuccess={() => {
            // Updated in context
          }}
        />
      )}

      {/* Supplier Payment Modal */}
      {paymentOrder && (
        <PurchasePaymentModal
          isOpen={!!paymentOrder}
          onClose={() => setPaymentOrder(null)}
          order={paymentOrder}
          onSuccess={() => {
            // Updated in context
          }}
        />
      )}
    </div>
  );
};
