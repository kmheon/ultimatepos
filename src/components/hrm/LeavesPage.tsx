import React, { useState, useMemo } from 'react';
import { 
  CalendarCheck, 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Users2 
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { 
  NebulaTable, 
  TableCard, 
  Column 
} from '../../core/ui';

interface LeaveRequest {
  id: string;
  employeeName: string;
  employeeId: string;
  leaveType: 'Annual Vacation' | 'Sick Leave' | 'Maternity' | 'Casual Leave';
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'Approved' | 'Pending' | 'Rejected';
}

export const LeavesPage: React.FC = () => {
  const { settings } = usePOS();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const [leaves, setLeaves] = useState<LeaveRequest[]>([
    {
      id: 'lev-1',
      employeeName: 'Sarah Jenkins',
      employeeId: 'EMP-2026-001',
      leaveType: 'Annual Vacation',
      startDate: '2026-09-10',
      endDate: '2026-09-15',
      totalDays: 5,
      reason: 'Family holiday and personal travel',
      status: 'Approved'
    },
    {
      id: 'lev-2',
      employeeName: 'Alex Rivera',
      employeeId: 'EMP-2026-002',
      leaveType: 'Sick Leave',
      startDate: '2026-09-06',
      endDate: '2026-09-06',
      totalDays: 1,
      reason: 'Medical appointment and recovery',
      status: 'Pending'
    },
    {
      id: 'lev-3',
      employeeName: 'Elena Rostova',
      employeeId: 'EMP-2026-005',
      leaveType: 'Casual Leave',
      startDate: '2026-09-01',
      endDate: '2026-09-02',
      totalDays: 2,
      reason: 'Urgent family matters',
      status: 'Approved'
    }
  ]);

  const [applyForm, setApplyForm] = useState({
    employeeName: 'Sarah Jenkins',
    leaveType: 'Annual Vacation' as const,
    startDate: '2026-09-20',
    endDate: '2026-09-22',
    totalDays: 3,
    reason: ''
  });

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq: LeaveRequest = {
      id: `lev-${Date.now()}`,
      employeeName: applyForm.employeeName,
      employeeId: 'EMP-2026-001',
      leaveType: applyForm.leaveType,
      startDate: applyForm.startDate,
      endDate: applyForm.endDate,
      totalDays: Number(applyForm.totalDays) || 1,
      reason: applyForm.reason || 'Requested time off',
      status: 'Pending'
    };

    setLeaves([newReq, ...leaves]);
    setIsApplyModalOpen(false);
    setNotice(`Leave request submitted successfully for ${applyForm.employeeName}.`);
    setTimeout(() => setNotice(null), 4000);
  };

  const handleUpdateStatus = (id: string, newStatus: 'Approved' | 'Rejected') => {
    setLeaves(leaves.map(l => l.id === id ? { ...l, status: newStatus } : l));
    setNotice(`Leave request status updated to ${newStatus}.`);
    setTimeout(() => setNotice(null), 4000);
  };

  const filteredLeaves = useMemo(() => {
    return leaves.filter(l => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || l.employeeName.toLowerCase().includes(q) || l.leaveType.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'All Statuses' || l.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [leaves, searchQuery, statusFilter]);

  const columns: Column<LeaveRequest>[] = useMemo(() => [
    {
      header: 'Employee Name & ID',
      accessor: (l) => (
        <div className="flex flex-col">
          <span className="font-black text-slate-900">{l.employeeName}</span>
          <span className="font-mono text-[11px] text-blue-600">{l.employeeId}</span>
        </div>
      )
    },
    {
      header: 'Leave Type',
      accessor: (l) => <span className="font-bold text-slate-800 text-xs">{l.leaveType}</span>
    },
    {
      header: 'Duration',
      accessor: (l) => (
        <div className="flex flex-col text-xs">
          <span className="text-slate-800 font-medium">{l.startDate} to {l.endDate}</span>
          <span className="text-[11px] text-slate-500 font-bold">{l.totalDays} Days</span>
        </div>
      )
    },
    {
      header: 'Reason',
      accessor: (l) => <span className="text-xs text-slate-600 truncate max-w-xs">{l.reason}</span>
    },
    {
      header: 'Approval Status',
      accessor: (l) => (
        <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
          l.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
          l.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
        }`}>
          {l.status}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: (l) => l.status === 'Pending' ? (
        <div className="flex items-center gap-2">
          <button onClick={() => handleUpdateStatus(l.id, 'Approved')} className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg cursor-pointer">Approve</button>
          <button onClick={() => handleUpdateStatus(l.id, 'Rejected')} className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded-lg cursor-pointer">Reject</button>
        </div>
      ) : <span className="text-xs text-slate-400 font-medium">Processed</span>
    }
  ], [leaves]);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      <div className="p-6 pb-0">
        {notice && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center justify-between">
            <span>{notice}</span>
            <button onClick={() => setNotice(null)} className="text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer">Dismiss</button>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-xs">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">Leave Utilization & Time-Off Approvals</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                  {leaves.filter(l => l.status === 'Pending').length} Pending Request
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Manage employee vacation days, sick leave accruals, and supervisor approvals.</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsApplyModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Request Leave</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Leave Days YTD</span>
            <h3 className="text-2xl font-black text-slate-900">48 Days</h3>
            <p className="text-[11px] text-slate-500 font-medium">Well within budgeted thresholds</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending Approvals</span>
            <h3 className="text-2xl font-black text-amber-600">{leaves.filter(l => l.status === 'Pending').length} Request</h3>
            <p className="text-[11px] text-amber-700 font-bold">Requires manager review</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Approved Time-Off</span>
            <h3 className="text-2xl font-black text-emerald-600">{leaves.filter(l => l.status === 'Approved').length} Requests</h3>
            <p className="text-[11px] text-slate-500 font-medium">Scheduled on calendar</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search leaves by employee or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="All Statuses">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <TableCard title="Leave Requests & Approval Register" subtitle="Comprehensive log of employee vacation and sick time">
          <NebulaTable data={filteredLeaves} columns={columns} keyExtractor={(row) => row.id} />
        </TableCard>
      </div>

      {isApplyModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-black text-slate-900">Request Leave Time-Off</h3>
              <button onClick={() => setIsApplyModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleApplyLeave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Employee Name</label>
                <select
                  value={applyForm.employeeName}
                  onChange={(e) => setApplyForm({ ...applyForm, employeeName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="Sarah Jenkins">Sarah Jenkins</option>
                  <option value="Alex Rivera">Alex Rivera</option>
                  <option value="Marcus Vance">Marcus Vance</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Leave Type</label>
                <select
                  value={applyForm.leaveType}
                  onChange={(e) => setApplyForm({ ...applyForm, leaveType: e.target.value as any })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="Annual Vacation">Annual Vacation</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Maternity">Maternity</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Start Date</label>
                  <input type="date" value={applyForm.startDate} onChange={(e) => setApplyForm({ ...applyForm, startDate: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">End Date</label>
                  <input type="date" value={applyForm.endDate} onChange={(e) => setApplyForm({ ...applyForm, endDate: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Reason / Notes</label>
                <textarea rows={2} placeholder="Brief reason for time-off..." value={applyForm.reason} onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsApplyModalOpen(false)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
