import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Star, 
  Building2, 
  Phone, 
  Mail, 
  FileText, 
  PlusCircle, 
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Truck
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { 
  NebulaPage, 
  NebulaTable, 
  TableCard, 
  Column, 
  NebulaWorkspaceItem 
} from '../../core/ui';

export interface SupplierRecord {
  id: string;
  name: string;
  company: string;
  rating: number;
  paymentTerms: string;
  leadTime: string;
  openOrdersCount: number;
  outstandingBalance: number;
  lastPurchaseDate: string;
  status: 'Preferred' | 'Active' | 'On Hold';
  email: string;
  phone: string;
}

export const SuppliersView: React.FC = () => {
  const { settings, contacts } = usePOS();
  const [activeWorkspace, setActiveWorkspace] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierRecord | null>(null);

  const suppliers: SupplierRecord[] = useMemo(() => {
    const list = contacts.filter(c => c.type === 'supplier' || c.type === 'both');
    if (list.length > 0) {
      return list.map((c, i) => ({
        id: c.id,
        name: c.name,
        company: c.businessName || c.name,
        rating: 4.5 + (i % 5) * 0.1,
        paymentTerms: i % 2 === 0 ? 'Net 30 Days' : 'Net 60 Days',
        leadTime: `${3 + (i % 4)} Business Days`,
        openOrdersCount: (i % 3) + 1,
        outstandingBalance: 12500 + i * 4200,
        lastPurchaseDate: '2026-08-28',
        status: i === 2 ? 'On Hold' : i === 0 ? 'Preferred' : 'Active',
        email: c.email || 'orders@vendor-corp.com',
        phone: c.mobile || '+1 (555) 382-9100',
      }));
    }
    return [
      { id: 'sup-1', name: 'Apex Global Electronics', company: 'Apex Global Inc.', rating: 4.9, paymentTerms: 'Net 30 Days', leadTime: '3 Business Days', openOrdersCount: 4, outstandingBalance: 48500.00, lastPurchaseDate: '2026-09-02', status: 'Preferred', email: 'orders@apexglobal.com', phone: '+1 (800) 555-0192' },
      { id: 'sup-2', name: 'Nexus Cybernetics', company: 'Nexus Logistics', rating: 4.7, paymentTerms: 'Net 60 Days', leadTime: '5 Business Days', openOrdersCount: 2, outstandingBalance: 18200.00, lastPurchaseDate: '2026-08-29', status: 'Active', email: 'procurement@nexus.org', phone: '+1 (888) 420-9911' },
      { id: 'sup-3', name: 'Vanguard Industrial Supply', company: 'Vanguard Corp', rating: 4.2, paymentTerms: 'Net 30 Days', leadTime: '7 Business Days', openOrdersCount: 1, outstandingBalance: 6400.00, lastPurchaseDate: '2026-08-15', status: 'Active', email: 'sales@vanguard.net', phone: '+1 (555) 911-2030' },
      { id: 'sup-4', name: 'Summit Precision Parts', company: 'Summit Manufacturing', rating: 3.8, paymentTerms: 'COD', leadTime: '10 Business Days', openOrdersCount: 0, outstandingBalance: 0.00, lastPurchaseDate: '2026-07-20', status: 'On Hold', email: 'billing@summitparts.com', phone: '+1 (555) 732-4412' },
    ];
  }, [contacts]);

  const workspaces: NebulaWorkspaceItem[] = useMemo(() => [
    { id: 'all', label: 'All Suppliers', icon: Users, description: 'Complete verified vendor directory' },
    { id: 'preferred', label: 'Preferred Vendors', icon: ShieldCheck, description: 'Top-tier SLA compliant partner network' },
    { id: 'active', label: 'Active', icon: Truck, description: 'Suppliers with active open orders' },
    { id: 'hold', label: 'On Hold', icon: AlertCircle, description: 'Vendors under review or payment pause' },
  ], []);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || s.name.toLowerCase().includes(q) || s.company.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
      let matchesTab = true;
      if (activeWorkspace === 'preferred') matchesTab = s.status === 'Preferred';
      if (activeWorkspace === 'active') matchesTab = s.status === 'Active';
      if (activeWorkspace === 'hold') matchesTab = s.status === 'On Hold';
      return matchesSearch && matchesTab;
    });
  }, [suppliers, searchQuery, activeWorkspace]);

  const columns: Column<SupplierRecord>[] = useMemo(() => [
    {
      header: 'Supplier & Company',
      accessor: (s) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm shrink-0">
            {s.name.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-slate-900">{s.name}</div>
            <div className="text-[10px] text-slate-400">{s.company} • Terms: {s.paymentTerms}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Vendor Rating',
      accessor: (s) => (
        <div className="flex items-center gap-1 font-bold text-amber-600 text-xs">
          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span>{s.rating.toFixed(1)}</span>
        </div>
      ),
      sortable: true
    },
    {
      header: 'Lead Time',
      accessor: (s) => <span className="text-xs font-bold text-slate-700">{s.leadTime}</span>
    },
    {
      header: 'Open Orders',
      accessor: (s) => <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold text-xs rounded-full">{s.openOrdersCount} Active</span>
    },
    {
      header: 'Outstanding Balance',
      accessor: (s) => <span className="font-black text-slate-900">{settings.currencySymbol}{s.outstandingBalance.toFixed(2)}</span>,
      sortable: true
    },
    {
      header: 'Status',
      accessor: (s) => (
        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
          s.status === 'Preferred' ? 'bg-emerald-50 text-emerald-700' :
          s.status === 'Active' ? 'bg-blue-50 text-blue-700' :
          'bg-rose-50 text-rose-700'
        }`}>
          {s.status}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: (s) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => setSelectedSupplier(s)}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            View Profile
          </button>
          <button
            onClick={() => alert(`Creating Purchase Order for ${s.name}...`)}
            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            Create PO
          </button>
        </div>
      ),
      className: 'text-right'
    }
  ], [settings.currencySymbol]);

  return (
    <NebulaPage
      icon={Users}
      title="Supplier Relationship Management (SRM)"
      badge="Vendor Network"
      description="Manage approved suppliers, evaluation scores, payment terms, lead times, and open contracts."
      workspaces={workspaces}
      activeWorkspace={activeWorkspace}
      onWorkspaceChange={setActiveWorkspace}
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search suppliers by name, company, or email..."
      extraToolbarActions={
        <button
          onClick={() => alert('Add New Supplier Modal')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer shadow-blue-200"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Supplier</span>
        </button>
      }
    >
      <div className="flex flex-col space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Suppliers</p>
            <p className="text-xl font-black text-slate-900 mt-1">{suppliers.length} Vendors</p>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Preferred Vendors</p>
            <p className="text-xl font-black text-emerald-600 mt-1">14 Partners</p>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">On Hold</p>
            <p className="text-xl font-black text-rose-600 mt-1">2 Vendors</p>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Outstanding Payments</p>
            <p className="text-xl font-black text-amber-600 mt-1">{settings.currencySymbol}73,100</p>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Lead Time</p>
            <p className="text-xl font-black text-blue-600 mt-1">4.2 Days</p>
          </div>
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Rating</p>
            <p className="text-xl font-black text-amber-500 mt-1">4.6 / 5.0</p>
          </div>
        </div>

        <TableCard
          title="Verified Supplier Directory"
          subtitle={`Showing ${filteredSuppliers.length} active vendors`}
        >
          <NebulaTable
            data={filteredSuppliers}
            columns={columns}
            keyExtractor={(s) => s.id}
            emptyMessage="No suppliers found matching current search criteria."
          />
        </TableCard>
      </div>

      {selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-black text-lg flex items-center justify-center">
                  {selectedSupplier.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">{selectedSupplier.name}</h3>
                  <p className="text-xs text-slate-500">{selectedSupplier.company} • Rating: {selectedSupplier.rating} ★</p>
                </div>
              </div>
              <button onClick={() => setSelectedSupplier(null)} className="text-slate-400 hover:text-slate-700 font-bold p-1 cursor-pointer">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Payment Terms</span>
                <p className="font-bold text-slate-900 mt-1">{selectedSupplier.paymentTerms}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Average Lead Time</span>
                <p className="font-bold text-slate-900 mt-1">{selectedSupplier.leadTime}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Open Orders</span>
                <p className="font-bold text-blue-600 mt-1">{selectedSupplier.openOrdersCount} Orders in Transit</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Outstanding Balance</span>
                <p className="font-bold text-rose-600 mt-1">{settings.currencySymbol}{selectedSupplier.outstandingBalance.toFixed(2)}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" /><span>{selectedSupplier.email}</span></div>
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" /><span>{selectedSupplier.phone}</span></div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button onClick={() => alert(`Sending email to ${selectedSupplier.email}...`)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold">Send Email</button>
              <button onClick={() => alert(`Loading contracts for ${selectedSupplier.name}...`)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold">View Contracts</button>
              <button onClick={() => { alert(`Creating Purchase Order for ${selectedSupplier.name}`); setSelectedSupplier(null); }} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm">Create Purchase Order</button>
            </div>
          </div>
        </div>
      )}
    </NebulaPage>
  );
};
