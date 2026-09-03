import React, { useState } from 'react';
import { 
  Wrench, 
  Plus, 
  Search, 
  Filter, 
  Printer, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Smartphone, 
  User, 
  ShieldCheck, 
  Calendar, 
  Eye, 
  Trash2, 
  MoreVertical,
  SlidersHorizontal,
  FileText
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { RepairJobSheet } from '../../types';
import { AddRepairModal } from './AddRepairModal';
import { RepairInvoiceModal } from './RepairInvoiceModal';

export const RepairsView: React.FC = () => {
  const { repairJobSheets, updateRepairStatus, deleteRepairJobSheet, settings } = usePOS();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedJobForInvoice, setSelectedJobForInvoice] = useState<RepairJobSheet | null>(null);

  const statusTabs = [
    { id: 'all', label: 'All Repairs', count: repairJobSheets.length },
    { id: 'pending', label: 'Pending', count: repairJobSheets.filter(r => r.status === 'pending').length },
    { id: 'diagnosing', label: 'Diagnosing', count: repairJobSheets.filter(r => r.status === 'diagnosing').length },
    { id: 'awaiting_parts', label: 'Awaiting Parts', count: repairJobSheets.filter(r => r.status === 'awaiting_parts').length },
    { id: 'repaired', label: 'Ready / Repaired', count: repairJobSheets.filter(r => r.status === 'repaired').length },
    { id: 'delivered', label: 'Delivered / Closed', count: repairJobSheets.filter(r => r.status === 'delivered').length },
  ];

  const filteredRepairs = repairJobSheets.filter(job => {
    const matchesSearch = 
      job.jobSheetNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.deviceBrand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.deviceModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.serialNumberOrIMEI.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.technicianAssigned.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || job.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || job.priority === selectedPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusBadge = (status: RepairJobSheet['status']) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"><Clock className="w-3 h-3" /> Pending</span>;
      case 'diagnosing':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200"><Wrench className="w-3 h-3" /> Diagnosing</span>;
      case 'awaiting_parts':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200"><AlertCircle className="w-3 h-3" /> Awaiting Parts</span>;
      case 'repaired':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3 h-3" /> Repaired / Ready</span>;
      case 'delivered':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300"><ShieldCheck className="w-3 h-3" /> Delivered</span>;
      case 'cancelled':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">Cancelled</span>;
    }
  };

  const getPriorityBadge = (priority: RepairJobSheet['priority']) => {
    switch (priority) {
      case 'urgent':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800">URGENT</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-orange-100 text-orange-800">High</span>;
      case 'normal':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">Normal</span>;
      case 'low':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-50 text-slate-500">Low</span>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Electronics Repair & Service Center
            </h1>
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-extrabold">
              UltimatePOS Job Sheets
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Track customer device repairs, diagnostic tests, hardware replacement parts, and warranty gate passes.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Repair Job Sheet</span>
        </button>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Active Repairs</p>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {repairJobSheets.filter(r => r.status !== 'delivered' && r.status !== 'cancelled').length}
          </p>
          <span className="text-[11px] text-blue-600 font-medium">In Workshop Pipeline</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Awaiting Parts</p>
          <p className="text-2xl font-black text-purple-700 mt-1">
            {repairJobSheets.filter(r => r.status === 'awaiting_parts').length}
          </p>
          <span className="text-[11px] text-purple-600 font-medium">Pending Supply Delivery</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ready for Pickup</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">
            {repairJobSheets.filter(r => r.status === 'repaired').length}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">Completed & Tested</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Est. Service Value</p>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {settings.currencySymbol}{repairJobSheets.reduce((sum, r) => sum + r.finalTotal, 0).toFixed(2)}
          </p>
          <span className="text-[11px] text-slate-500 font-medium">Parts + Labor Total</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {statusTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedStatus(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              selectedStatus === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              selectedStatus === tab.id ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Job #, Customer, Device Brand/Model, IMEI, or Technician..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={selectedPriority}
          onChange={e => setSelectedPriority(e.target.value)}
          className="px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="normal">Normal</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Repairs Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Job Sheet #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Device Details & IMEI</th>
                <th className="py-3 px-4">Issue Description</th>
                <th className="py-3 px-4">Technician</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Cost / Paid</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredRepairs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Wrench className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">No repair job sheets found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try searching with a different term or create a new job sheet.</p>
                  </td>
                </tr>
              ) : (
                filteredRepairs.map(job => (
                  <tr key={job.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-slate-900">{job.jobSheetNumber}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 block">{job.createdAt}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800">{job.customerName}</p>
                      <p className="text-xs text-slate-500">{job.customerMobile}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 flex items-center gap-1">
                        <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                        {job.deviceBrand} {job.deviceModel}
                      </p>
                      <p className="text-xs text-slate-500 font-mono">
                        {job.serialNumberOrIMEI}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 max-w-[200px]">
                      <p className="text-xs text-slate-700 truncate" title={job.defectsDescription}>
                        {job.defectsDescription}
                      </p>
                      {job.accessoriesHandedOver.length > 0 && (
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          Acc: {job.accessoriesHandedOver.join(', ')}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-medium text-slate-800">{job.technicianAssigned}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {getPriorityBadge(job.priority)}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">
                        {settings.currencySymbol}{job.finalTotal.toFixed(2)}
                      </p>
                      <span className={`text-[11px] font-semibold ${
                        job.amountPaid >= job.finalTotal ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                        Paid: {settings.currencySymbol}{job.amountPaid.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        {getStatusBadge(job.status)}
                        {/* Quick status changer */}
                        <select
                          value={job.status}
                          onChange={e => updateRepairStatus(job.id, e.target.value as any)}
                          className="block text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 rounded px-1.5 py-0.5 border border-slate-300 text-slate-700 cursor-pointer"
                        >
                          <option value="pending">Set: Pending</option>
                          <option value="diagnosing">Set: Diagnosing</option>
                          <option value="awaiting_parts">Set: Awaiting Parts</option>
                          <option value="repaired">Set: Repaired / Ready</option>
                          <option value="delivered">Set: Delivered</option>
                          <option value="cancelled">Set: Cancelled</option>
                        </select>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedJobForInvoice(job)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Print Job Sheet / Gate Pass / Invoice"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete repair job sheet ${job.jobSheetNumber}?`)) {
                              deleteRepairJobSheet(job.id);
                            }
                          }}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {isAddModalOpen && (
        <AddRepairModal onClose={() => setIsAddModalOpen(false)} />
      )}

      {selectedJobForInvoice && (
        <RepairInvoiceModal
          job={selectedJobForInvoice}
          onClose={() => setSelectedJobForInvoice(null)}
        />
      )}
    </div>
  );
};
