import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  PlusCircle, 
  Search, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ArrowRight, 
  Building, 
  User, 
  Tag,
  FileText
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { 
  NebulaPage, 
  NebulaTable, 
  TableCard, 
  SummaryCard, 
  Column, 
  NebulaWorkspaceItem 
} from '../../core/ui';

export interface PurchaseRequisitionRecord {
  id: string;
  requestNo: string;
  department: string;
  requestedBy: string;
  itemsSummary: string;
  estimatedCost: number;
  priority: 'Normal' | 'High' | 'Urgent';
  approver: string;
  status: 'Pending Approval' | 'Approved' | 'Rejected' | 'Converted to PO' | 'Waiting Budget';
  requiredDate: string;
}

export const PurchaseRequisitionsView: React.FC = () => {
  const { settings } = usePOS();
  const [activeSubWorkspace, setActiveSubWorkspace] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const initialRequisitions: PurchaseRequisitionRecord[] = useMemo(() => [
    {
      id: 'pr-1',
      requestNo: 'PR-2026-0901',
      department: 'Field Service Squad',
      requestedBy: 'Alex Vance',
      itemsSummary: '50x Network Patch Cables & SFP Transceiver Modules',
      estimatedCost: 3450.00,
      priority: 'Urgent',
      approver: 'Sarah Jenkins (Ops Director)',
      status: 'Pending Approval',
      requiredDate: '2026-09-15',
    },
    {
      id: 'pr-2',
      requestNo: 'PR-2026-0902',
      department: 'Central Warehouse',
      requestedBy: 'Michael Chang',
      itemsSummary: '10x Heavy Duty Steel Shelving Racks & Pallet Jacks',
      estimatedCost: 8900.00,
      priority: 'High',
      approver: 'David Sterling (CFO)',
      status: 'Approved',
      requiredDate: '2026-09-20',
    },
    {
      id: 'pr-3',
      requestNo: 'PR-2026-0903',
      department: 'IT Infrastructure',
      requestedBy: 'Elena Rostova',
      itemsSummary: '3x Enterprise Cisco Catalyst Switches & PoE Injectors',
      estimatedCost: 14200.00,
      priority: 'Normal',
      approver: 'David Sterling (CFO)',
      status: 'Waiting Budget',
      requiredDate: '2026-10-01',
    },
    {
      id: 'pr-4',
      requestNo: 'PR-2026-0904',
      department: 'Retail Flagship',
      requestedBy: 'Marcus Brody',
      itemsSummary: '20x Barcode Laser Scanners & Thermal Receipt Printers',
      estimatedCost: 5200.00,
      priority: 'High',
      approver: 'Sarah Jenkins (Ops Director)',
      status: 'Converted to PO',
      requiredDate: '2026-09-10',
    },
  ], []);

  const workspaces: NebulaWorkspaceItem[] = useMemo(() => [
    { id: 'pending', label: 'Pending Approval', icon: Clock, description: 'Internal requisitions awaiting department or finance approval' },
    { id: 'approved', label: 'Approved', icon: CheckCircle2, description: 'Requisitions cleared for PO conversion and buyer assignment' },
    { id: 'rejected', label: 'Rejected', icon: XCircle, description: 'Requests declined due to budget constraints or policy mismatch' },
    { id: 'converted', label: 'Converted to PO', icon: FileText, description: 'Requisitions successfully bound to active purchase orders' },
  ], []);

  const filteredRequisitions = useMemo(() => {
    return initialRequisitions.filter(pr => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        pr.requestNo.toLowerCase().includes(q) ||
        pr.department.toLowerCase().includes(q) ||
        pr.requestedBy.toLowerCase().includes(q) ||
        pr.itemsSummary.toLowerCase().includes(q);

      let matchesTab = true;
      if (activeSubWorkspace === 'pending') matchesTab = pr.status === 'Pending Approval' || pr.status === 'Waiting Budget';
      if (activeSubWorkspace === 'approved') matchesTab = pr.status === 'Approved';
      if (activeSubWorkspace === 'rejected') matchesTab = pr.status === 'Rejected';
      if (activeSubWorkspace === 'converted') matchesTab = pr.status === 'Converted to PO';

      return matchesSearch && matchesTab;
    });
  }, [initialRequisitions, searchQuery, activeSubWorkspace]);

  const columns: Column<PurchaseRequisitionRecord>[] = useMemo(() => [
    {
      header: 'Request #',
      accessor: (pr) => <span className="font-mono font-black text-blue-600">{pr.requestNo}</span>,
      sortable: true
    },
    {
      header: 'Department / Requester',
      accessor: (pr) => (
        <div>
          <div className="font-bold text-slate-900">{pr.department}</div>
          <div className="text-[10px] text-slate-400">Req: {pr.requestedBy}</div>
        </div>
      )
    },
    {
      header: 'Items & Description',
      accessor: (pr) => <div className="text-xs font-bold text-slate-800 line-clamp-1">{pr.itemsSummary}</div>
    },
    {
      header: 'Priority',
      accessor: (pr) => (
        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
          pr.priority === 'Urgent' ? 'bg-rose-50 text-rose-700' :
          pr.priority === 'High' ? 'bg-amber-50 text-amber-700' :
          'bg-slate-100 text-slate-600'
        }`}>
          {pr.priority}
        </span>
      )
    },
    {
      header: 'Estimated Cost',
      accessor: (pr) => <span className="font-black text-slate-900">{settings.currencySymbol}{pr.estimatedCost.toFixed(2)}</span>,
      sortable: true
    },
    {
      header: 'Status',
      accessor: (pr) => (
        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
          pr.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' :
          pr.status === 'Pending Approval' ? 'bg-amber-50 text-amber-700' :
          pr.status === 'Converted to PO' ? 'bg-blue-50 text-blue-700' :
          'bg-slate-100 text-slate-600'
        }`}>
          {pr.status}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: (pr) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => alert(`Converting requisition ${pr.requestNo} to Purchase Order...`)}
            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
          >
            <span>Convert to PO</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      ),
      className: 'text-right'
    }
  ], [settings.currencySymbol]);

  return (
    <NebulaPage
      icon={FileSpreadsheet}
      title="Purchase Requisitions & Material Requests"
      badge="Internal Procurement"
      description="Manage internal department purchase requests, budget checks, and requisition-to-PO conversions."
      workspaces={workspaces}
      activeWorkspace={activeSubWorkspace}
      onWorkspaceChange={setActiveSubWorkspace}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search requisitions by Request #, Department, Requester, or Item..."
      extraToolbarActions={
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer shadow-blue-200"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Requisition</span>
        </button>
      }
    >
      <div className="flex flex-col space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Approval</p>
            <p className="text-xl font-black text-amber-600 mt-1">12 Requests</p>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Approved</p>
            <p className="text-xl font-black text-emerald-600 mt-1">28 Requests</p>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Waiting Budget</p>
            <p className="text-xl font-black text-purple-600 mt-1">5 Requests</p>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Converted to PO</p>
            <p className="text-xl font-black text-blue-600 mt-1">94 Orders</p>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Urgent Requests</p>
            <p className="text-xl font-black text-rose-600 mt-1">3 Requests</p>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rejected</p>
            <p className="text-xl font-black text-slate-500 mt-1">4 Requests</p>
          </div>
        </div>

        {/* Table */}
        <TableCard
          title="Purchase Requisitions Log"
          subtitle={`Showing ${filteredRequisitions.length} material requests in workflow queue`}
        >
          <NebulaTable
            data={filteredRequisitions}
            columns={columns}
            keyExtractor={(r) => r.id}
            emptyMessage="No purchase requisitions found matching current filters."
          />
        </TableCard>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Create Purchase Requisition</h3>
            <p className="text-xs text-slate-500">Submit internal material request for procurement and budget clearance.</p>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Department</label>
                <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium">
                  <option>Field Service Squad</option>
                  <option>Central Warehouse</option>
                  <option>IT Infrastructure</option>
                  <option>Retail Flagship</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Items & Specifications</label>
                <textarea rows={3} placeholder="Describe parts, quantities, and requirements..." className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"></textarea>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Estimated Cost ($)</label>
                <input type="number" placeholder="2500.00" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">Cancel</button>
              <button onClick={() => { alert('Requisition created and sent for approval!'); setIsModalOpen(false); }} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm">Submit Requisition</button>
            </div>
          </div>
        </div>
      )}
    </NebulaPage>
  );
};
