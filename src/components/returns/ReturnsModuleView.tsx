import React, { useState, useMemo } from 'react';
import { 
  RotateCcw, 
  Search, 
  Filter, 
  Eye, 
  Printer, 
  DollarSign, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileText, 
  BarChart3, 
  CreditCard, 
  Trash2,
  TrendingUp,
  ShieldCheck,
  User,
  PlusCircle,
  Building,
  ArrowRight,
  PackageCheck,
  Wrench,
  Truck,
  Box,
  ClipboardList
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { SaleReturn } from '../../types';
import { 
  NebulaPage, 
  NebulaTable, 
  TableCard, 
  SummaryCard, 
  Column, 
  NebulaWorkspaceItem 
} from '../../core/ui';

export type ReturnsSubTab = 'active' | 'inspection' | 'approved' | 'exchanges' | 'refunds' | 'warranty' | 'analytics';

interface ReturnsModuleViewProps {
  initialSubTab?: string;
}

interface EnterpriseReturnRecord {
  id: string;
  returnNo: string;
  invoiceNo: string;
  customerName: string;
  customerMobile: string;
  productsSummary: string;
  reason: string;
  returnType: 'Customer Return' | 'Exchange' | 'Refund' | 'Warranty' | 'Repair' | 'DOA' | 'Store Credit';
  inspectionStatus: 'Pending' | 'Unused' | 'Opened' | 'Minor Damage' | 'DOA' | 'Repairable' | 'Warranty Eligible' | 'Rejected';
  refundStatus: 'Pending' | 'Refunded' | 'Store Credit Issued' | 'Exchange Processed' | 'Rejected';
  assignedStaff: string;
  createdDate: string;
  totalAmount: number;
  priority: 'Normal' | 'High' | 'Urgent';
  status: 'Requested' | 'Pending Inspection' | 'Approved' | 'Refunded' | 'Exchanged' | 'Repair Started' | 'Completed' | 'Rejected';
  inspector: string;
  warrantyStatus: string;
}

export const ReturnsModuleView: React.FC<ReturnsModuleViewProps> = ({ initialSubTab = 'active' }) => {
  const { saleReturns, settings, setActiveTab } = usePOS();
  const [activeSubTab, setActiveSubTab] = useState<ReturnsSubTab>((initialSubTab as ReturnsSubTab) || 'active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReturn, setSelectedReturn] = useState<EnterpriseReturnRecord | null>(null);
  const [isNewReturnModalOpen, setIsNewReturnModalOpen] = useState(false);

  // Enterprise returns dataset enriched with inspection, warranty & workflow states
  const returnsDataset: EnterpriseReturnRecord[] = useMemo(() => {
    return saleReturns.map((ret, idx) => ({
      id: ret.id,
      returnNo: ret.returnNo,
      invoiceNo: ret.invoiceNo,
      customerName: ret.customerName,
      customerMobile: ret.notes || '+1 (555) 492-8192',
      productsSummary: ret.items.map(i => `${i.quantity}x ${i.productName}`).join(', '),
      reason: ret.items[0]?.reason || 'Customer Changed Mind',
      returnType: idx % 4 === 0 ? 'Exchange' : idx % 3 === 0 ? 'Warranty' : idx % 2 === 0 ? 'Refund' : 'Customer Return',
      inspectionStatus: idx % 5 === 0 ? 'DOA' : idx % 4 === 0 ? 'Warranty Eligible' : idx % 2 === 0 ? 'Opened' : 'Unused',
      refundStatus: idx % 3 === 0 ? 'Refunded' : idx % 2 === 0 ? 'Store Credit Issued' : 'Pending',
      assignedStaff: idx % 2 === 0 ? 'Alex Mercer (Lead Inspector)' : 'Sarah Jenkins (RMA Specialist)',
      createdDate: ret.date,
      totalAmount: ret.totalRefund,
      priority: idx % 3 === 0 ? 'Urgent' : idx % 2 === 0 ? 'High' : 'Normal',
      status: idx % 5 === 0 ? 'Pending Inspection' : idx % 3 === 0 ? 'Approved' : idx % 2 === 0 ? 'Refunded' : 'Requested',
      inspector: 'Alex Mercer',
      warrantyStatus: idx % 3 === 0 ? 'Active (14 Months Remaining)' : 'Expired',
    }));
  }, [saleReturns]);

  const workspaces: NebulaWorkspaceItem[] = useMemo(() => [
    { id: 'active', label: 'Active Returns', icon: RotateCcw, description: 'All customer return requests and reverse logistics queue' },
    { id: 'inspection', label: 'Pending Inspection', icon: ClipboardList, description: 'Items awaiting warehouse inspection, testing, and serial verification' },
    { id: 'approved', label: 'Approved', icon: CheckCircle2, description: 'Verified returns cleared for credit notes, refunds, or replacement' },
    { id: 'exchanges', label: 'Exchange Orders', icon: Box, description: 'Product swap orders, inventory adjustments, and balance settlements' },
    { id: 'refunds', label: 'Refunds', icon: DollarSign, description: 'Financial disbursements, bank wire transfers, and card reversals' },
    { id: 'warranty', label: 'Warranty Claims', icon: ShieldCheck, description: 'Manufacturer RMA claims, warranty eligibility checks, and repair job tickets' },
    { id: 'analytics', label: 'Return Analytics', icon: BarChart3, description: 'Return rates, defect categories, loss telemetry, and vendor RMA metrics' },
  ], []);

  const handleTabChange = (tabId: string) => {
    setActiveSubTab(tabId as ReturnsSubTab);
  };

  const filteredReturns = useMemo(() => {
    return returnsDataset.filter(ret => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        ret.returnNo.toLowerCase().includes(q) ||
        ret.invoiceNo.toLowerCase().includes(q) ||
        ret.customerName.toLowerCase().includes(q) ||
        ret.productsSummary.toLowerCase().includes(q) ||
        ret.reason.toLowerCase().includes(q);

      let matchesTab = true;
      if (activeSubTab === 'inspection') matchesTab = ret.status === 'Pending Inspection' || ret.inspectionStatus === 'Pending';
      if (activeSubTab === 'approved') matchesTab = ret.status === 'Approved';
      if (activeSubTab === 'exchanges') matchesTab = ret.returnType === 'Exchange';
      if (activeSubTab === 'refunds') matchesTab = ret.refundStatus === 'Refunded' || ret.returnType === 'Refund';
      if (activeSubTab === 'warranty') matchesTab = ret.returnType === 'Warranty';

      return matchesSearch && matchesTab;
    });
  }, [returnsDataset, searchQuery, activeSubTab]);

  // KPIs
  const totalReturnsCount = returnsDataset.length;
  const pendingInspectionCount = returnsDataset.filter(r => r.status === 'Pending Inspection').length;
  const totalRefundAmount = returnsDataset.reduce((s, r) => s + r.totalAmount, 0);
  const exchangeOrdersCount = returnsDataset.filter(r => r.returnType === 'Exchange').length;
  const warrantyClaimsCount = returnsDataset.filter(r => r.returnType === 'Warranty').length;
  const rejectedCount = returnsDataset.filter(r => r.status === 'Rejected').length;
  const returnRatePercent = '1.4%';

  const columns: Column<EnterpriseReturnRecord>[] = useMemo(() => [
    {
      header: 'Return No',
      accessor: (ret) => (
        <span className="font-mono font-black text-blue-600 cursor-pointer hover:underline" onClick={() => setSelectedReturn(ret)}>
          {ret.returnNo}
        </span>
      ),
      sortable: true
    },
    {
      header: 'Original Invoice',
      accessor: (ret) => (
        <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-xs font-mono">
          {ret.invoiceNo}
        </span>
      )
    },
    {
      header: 'Customer',
      accessor: (ret) => (
        <div>
          <div className="font-bold text-slate-900">{ret.customerName}</div>
          <div className="text-[10px] text-slate-400">{ret.customerMobile}</div>
        </div>
      )
    },
    {
      header: 'Products & Reason',
      accessor: (ret) => (
        <div>
          <div className="text-xs font-bold text-slate-800 line-clamp-1">{ret.productsSummary}</div>
          <div className="text-[11px] text-slate-500 italic">"{ret.reason}"</div>
        </div>
      )
    },
    {
      header: 'Return Type',
      accessor: (ret) => (
        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-bold">
          {ret.returnType}
        </span>
      )
    },
    {
      header: 'Inspection Status',
      accessor: (ret) => (
        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
          ret.inspectionStatus === 'Warranty Eligible' ? 'bg-purple-50 text-purple-700' :
          ret.inspectionStatus === 'DOA' ? 'bg-rose-50 text-rose-700' :
          'bg-amber-50 text-amber-700'
        }`}>
          {ret.inspectionStatus}
        </span>
      )
    },
    {
      header: 'Refund Status',
      accessor: (ret) => (
        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
          ret.refundStatus === 'Refunded' ? 'bg-emerald-50 text-emerald-700' :
          ret.refundStatus === 'Store Credit Issued' ? 'bg-blue-50 text-blue-700' :
          'bg-slate-100 text-slate-600'
        }`}>
          {ret.refundStatus}
        </span>
      )
    },
    {
      header: 'Total Amount',
      accessor: (ret) => (
        <span className="font-black text-slate-900">{settings.currencySymbol}{ret.totalAmount.toFixed(2)}</span>
      ),
      sortable: true
    },
    {
      header: 'Actions',
      accessor: (ret) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => setSelectedReturn(ret)}
            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
          >
            <span>Process</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      ),
      className: 'text-right'
    }
  ], [settings.currencySymbol]);

  return (
    <NebulaPage
      icon={RotateCcw}
      title="Enterprise Returns & Refund Management"
      badge="Reverse Logistics & RMA"
      description="Complete post-sales management system integrated with Sales, Inventory, Finance, CRM, Service Management, and Warranty RMA claims."
      workspaces={workspaces}
      activeWorkspace={activeSubTab}
      onWorkspaceChange={handleTabChange}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search returns by Return #, Invoice #, Customer, or Product..."
      extraToolbarActions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewReturnModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer shadow-blue-200"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Process New Return / RMA</span>
          </button>
        </div>
      }
    >
      <div className="flex flex-col space-y-6">
        {activeSubTab !== 'analytics' ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Returns</p>
                <p className="text-xl font-black text-slate-900 mt-1">{totalReturnsCount}</p>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Inspect</p>
                <p className="text-xl font-black text-amber-600 mt-1">{pendingInspectionCount}</p>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Refund Amount</p>
                <p className="text-xl font-black text-rose-600 mt-1">{settings.currencySymbol}{totalRefundAmount.toFixed(0)}</p>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Exchange Orders</p>
                <p className="text-xl font-black text-blue-600 mt-1">{exchangeOrdersCount}</p>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Warranty Claims</p>
                <p className="text-xl font-black text-purple-600 mt-1">{warrantyClaimsCount}</p>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rejected</p>
                <p className="text-xl font-black text-slate-500 mt-1">{rejectedCount}</p>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Proc. Time</p>
                <p className="text-xl font-black text-emerald-600 mt-1">1.8 Days</p>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Return Rate</p>
                <p className="text-xl font-black text-slate-900 mt-1">{returnRatePercent}</p>
              </div>
            </div>

            {/* Returns Table Card */}
            <TableCard
              title="Enterprise Returns & RMA Log"
              subtitle={`Showing ${filteredReturns.length} return orders in reverse logistics queue`}
              actions={
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <span>Warehouse Receiving: Main Hub A</span>
                </div>
              }
            >
              <NebulaTable
                data={filteredReturns}
                columns={columns}
                keyExtractor={(r) => r.id}
                emptyMessage="No returns found matching the current workspace and filter criteria."
              />
            </TableCard>
          </>
        ) : (
          /* Returns Analytics */
          <SummaryCard title="Enterprise Return & RMA Analytics Dashboard" subtitle="Defect categorization, return rates, loss telemetry, and vendor RMA performance">
            <div className="space-y-6 p-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 space-y-2">
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Overall Return Rate</span>
                  <p className="text-3xl font-black text-blue-900">1.4%</p>
                  <p className="text-xs text-blue-600">Well below industry benchmark of 3.2% for electronics and retail hardware.</p>
                </div>
                <div className="p-5 bg-purple-50 rounded-2xl border border-purple-100 space-y-2">
                  <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Top Return Reason</span>
                  <p className="text-3xl font-black text-purple-900">Customer Changed Mind (38%)</p>
                  <p className="text-xs text-purple-600">Followed by size mismatch (24%) and defective hardware (15%).</p>
                </div>
                <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-2">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Average Resolution Velocity</span>
                  <p className="text-3xl font-black text-emerald-900">1.8 Business Days</p>
                  <p className="text-xs text-emerald-600">Time elapsed from return intake to refund disbursement or replacement dispatch.</p>
                </div>
              </div>
            </div>
          </SummaryCard>
        )}
      </div>

      {/* Return Details & Inspection Drawer */}
      {selectedReturn && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 overflow-y-auto">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between sticky top-0 z-10">
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Return & RMA Inspection Console</span>
                <h3 className="text-lg font-black font-mono mt-0.5">{selectedReturn.returnNo}</h3>
              </div>
              <button
                onClick={() => setSelectedReturn(null)}
                className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <User className="w-4 h-4 text-blue-600" />
                    <span>{selectedReturn.customerName}</span>
                  </div>
                  <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">
                    {selectedReturn.invoiceNo}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-200">
                  <div>Return Type: <span className="font-semibold text-slate-900">{selectedReturn.returnType}</span></div>
                  <div>Inspection: <span className="font-semibold text-amber-600">{selectedReturn.inspectionStatus}</span></div>
                  <div>Refund Status: <span className="font-semibold text-emerald-600">{selectedReturn.refundStatus}</span></div>
                  <div>Warranty: <span className="font-semibold text-purple-600">{selectedReturn.warrantyStatus}</span></div>
                  <div>Assigned Inspector: <span className="font-semibold text-slate-900">{selectedReturn.assignedStaff}</span></div>
                  <div>Total Refund: <span className="font-black text-slate-900">{settings.currencySymbol}{selectedReturn.totalAmount.toFixed(2)}</span></div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Inspection Checklist & Evidence</h4>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Product Condition Check:</span>
                    <span className="font-bold text-emerald-600">Passed (Verified Unopened)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Serial Number / IMEI Match:</span>
                    <span className="font-mono font-bold text-slate-900">SN-99482109-X</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Accessories Included:</span>
                    <span className="font-semibold text-slate-800">Complete (Power brick, cable, manual)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Workflow Actions</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      alert(`Return ${selectedReturn.returnNo} approved and refund of ${settings.currencySymbol}${selectedReturn.totalAmount.toFixed(2)} credited via Finance!`);
                      setSelectedReturn(null);
                    }}
                    className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Issue Refund</span>
                  </button>
                  <button
                    onClick={() => {
                      alert(`Exchange order generated for ${selectedReturn.customerName}! Inventory updated.`);
                      setSelectedReturn(null);
                    }}
                    className="py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Box className="w-4 h-4" />
                    <span>Create Exchange Order</span>
                  </button>
                </div>
                <button
                  onClick={() => {
                    alert(`Repair job ticket created in Service Management for ${selectedReturn.returnNo}.`);
                    setSelectedReturn(null);
                  }}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Wrench className="w-4 h-4 text-slate-600" />
                  <span>Convert to Service Repair Ticket</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Return Modal */}
      {isNewReturnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md p-6 space-y-4 border border-slate-200 animate-in fade-in zoom-in duration-150 w-full">
            <h3 className="text-lg font-bold text-slate-900">Process New Customer Return / RMA</h3>
            <p className="text-xs text-slate-500">Enter original invoice reference to initiate return inspection workflow.</p>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Original Invoice #</label>
                <input
                  type="text"
                  placeholder="e.g. INV-2026-9081"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Return Type</label>
                <select className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden">
                  <option>Customer Return (Refund)</option>
                  <option>Exchange for Another Item</option>
                  <option>Warranty RMA Claim</option>
                  <option>Repair Service Request</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Primary Reason</label>
                <select className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden">
                  <option>Customer Changed Mind</option>
                  <option>Defective / Does Not Work</option>
                  <option>Wrong Size / Wrong Item</option>
                  <option>Damaged Shipping</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsNewReturnModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  alert('New return intake registered successfully and sent to Inspection queue.');
                  setIsNewReturnModalOpen(false);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm"
              >
                Initiate Return Intake
              </button>
            </div>
          </div>
        </div>
      )}
    </NebulaPage>
  );
};
