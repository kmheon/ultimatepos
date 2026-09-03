import React, { useState } from 'react';
import { 
  Users2, 
  CalendarCheck, 
  Clock, 
  Banknote, 
  Plus, 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Building,
  DollarSign,
  X
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';

interface AttendanceRecord {
  id: string;
  employeeName: string;
  date: string;
  clockIn: string;
  clockOut: string;
  workDuration: string;
  status: 'present' | 'late' | 'absent' | 'half_day';
}

interface LeaveRequest {
  id: string;
  employeeName: string;
  leaveType: 'Casual' | 'Sick' | 'Maternity' | 'Annual';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'approved' | 'pending' | 'rejected';
}

interface PayrollRecord {
  id: string;
  employeeName: string;
  department: string;
  month: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: 'paid' | 'pending';
}

export const HRMView: React.FC = () => {
  const { settings } = usePOS();
  const [activeSubTab, setActiveSubTab] = useState<'attendance' | 'leaves' | 'payroll' | 'departments'>('attendance');
  const [searchQuery, setSearchQuery] = useState('');

  const [attendance, setAttendance] = useState<AttendanceRecord[]>([
    { id: '1', employeeName: 'Sarah Jenkins', date: '2026-09-01', clockIn: '08:55 AM', clockOut: '05:05 PM', workDuration: '8h 10m', status: 'present' },
    { id: '2', employeeName: 'Alex Rivera', date: '2026-09-01', clockIn: '09:25 AM', clockOut: '06:00 PM', workDuration: '8h 35m', status: 'late' },
    { id: '3', employeeName: 'Marcus Vance', date: '2026-09-01', clockIn: '08:50 AM', clockOut: '05:00 PM', workDuration: '8h 10m', status: 'present' },
  ]);

  const [leaves, setLeaves] = useState<LeaveRequest[]>([
    { id: '1', employeeName: 'David Miller', leaveType: 'Sick', startDate: '2026-09-03', endDate: '2026-09-04', days: 2, reason: 'Flu recovery doctor prescribed rest', status: 'approved' },
    { id: '2', employeeName: 'Elena Rostova', leaveType: 'Annual', startDate: '2026-09-10', endDate: '2026-09-15', days: 5, reason: 'Family vacation', status: 'pending' },
  ]);

  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([
    { id: '1', employeeName: 'Sarah Jenkins', department: 'Sales / POS', month: 'August 2026', basicSalary: 3200, allowances: 250, deductions: 120, netSalary: 3330, status: 'paid' },
    { id: '2', employeeName: 'Alex Rivera', department: 'Technical Workshop', month: 'August 2026', basicSalary: 3800, allowances: 400, deductions: 150, netSalary: 4050, status: 'paid' },
    { id: '3', employeeName: 'Marcus Vance', department: 'Operations Management', month: 'August 2026', basicSalary: 4500, allowances: 500, deductions: 200, netSalary: 4800, status: 'paid' },
  ]);

  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [newLeaveEmployee, setNewLeaveEmployee] = useState('Sarah Jenkins');
  const [newLeaveType, setNewLeaveType] = useState<'Casual' | 'Sick' | 'Maternity' | 'Annual'>('Casual');
  const [newLeaveStart, setNewLeaveStart] = useState('');
  const [newLeaveEnd, setNewLeaveEnd] = useState('');
  const [newLeaveReason, setNewLeaveReason] = useState('');

  const handleCreateLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeaveStart || !newLeaveEnd) return;
    const leaveObj: LeaveRequest = {
      id: Date.now().toString(),
      employeeName: newLeaveEmployee,
      leaveType: newLeaveType,
      startDate: newLeaveStart,
      endDate: newLeaveEnd,
      days: 1,
      reason: newLeaveReason.trim() || 'General leave request',
      status: 'pending',
    };
    setLeaves([leaveObj, ...leaves]);
    setIsLeaveModalOpen(false);
    setNewLeaveReason('');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Users2 className="w-6 h-6 text-blue-600" />
            Human Resource Management (HRM)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Employee timeclock attendance, leave approvals, salary payrolls, and department structure.
          </p>
        </div>

        {activeSubTab === 'leaves' && (
          <button
            onClick={() => setIsLeaveModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Apply Leave</span>
          </button>
        )}
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('attendance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'attendance' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Attendance Timeclock</span>
        </button>

        <button
          onClick={() => setActiveSubTab('leaves')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'leaves' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Leaves & Time Off ({leaves.filter(l => l.status === 'pending').length} Pending)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('payroll')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'payroll' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Banknote className="w-4 h-4" />
          <span>Salary Payrolls</span>
        </button>

        <button
          onClick={() => setActiveSubTab('departments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'departments' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Departments</span>
        </button>
      </div>

      {/* Attendance View */}
      {activeSubTab === 'attendance' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Clock In</th>
                  <th className="px-4 py-3">Clock Out</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {attendance.map(att => (
                  <tr key={att.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-900">{att.employeeName}</td>
                    <td className="px-4 py-3.5 text-slate-500">{att.date}</td>
                    <td className="px-4 py-3.5 font-mono text-emerald-700 font-semibold">{att.clockIn}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-600 font-semibold">{att.clockOut}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-800">{att.workDuration}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        att.status === 'present' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {att.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Leaves View */}
      {activeSubTab === 'leaves' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Leave Type</th>
                  <th className="px-4 py-3">Dates</th>
                  <th className="px-4 py-3">Days</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {leaves.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-900">{l.employeeName}</td>
                    <td className="px-4 py-3.5 font-semibold">{l.leaveType} Leave</td>
                    <td className="px-4 py-3.5 text-slate-500">{l.startDate} to {l.endDate}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-800">{l.days} Day(s)</td>
                    <td className="px-4 py-3.5 text-slate-500">{l.reason}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        l.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {l.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {l.status === 'pending' && (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setLeaves(leaves.map(item => item.id === l.id ? { ...item, status: 'approved' } : item))}
                            className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700"
                          >
                            Approve
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payroll View */}
      {activeSubTab === 'payroll' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Month</th>
                  <th className="px-4 py-3">Base Salary</th>
                  <th className="px-4 py-3">Allowances</th>
                  <th className="px-4 py-3">Deductions</th>
                  <th className="px-4 py-3 font-bold text-slate-900">Net Salary</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {payrolls.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-900">{p.employeeName}</td>
                    <td className="px-4 py-3.5 text-slate-600">{p.department}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-500">{p.month}</td>
                    <td className="px-4 py-3.5">{settings.currencySymbol}{p.basicSalary}</td>
                    <td className="px-4 py-3.5 text-emerald-600">+{settings.currencySymbol}{p.allowances}</td>
                    <td className="px-4 py-3.5 text-rose-600">-{settings.currencySymbol}{p.deductions}</td>
                    <td className="px-4 py-3.5 font-black text-sm text-slate-900">{settings.currencySymbol}{p.netSalary}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[11px]">
                        PAID
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Departments View */}
      {activeSubTab === 'departments' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { name: 'POS & Retail Sales', count: 4, lead: 'Marcus Vance' },
            { name: 'Electronics & Repair Workshop', count: 3, lead: 'Alex Rivera' },
            { name: 'Warehouse & Logistics', count: 2, lead: 'David Miller' }
          ].map((d, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-blue-600">
                <Building className="w-5 h-5" />
                <h3 className="font-bold text-sm text-slate-900">{d.name}</h3>
              </div>
              <div className="text-xs text-slate-500">Department Head: <span className="font-semibold text-slate-800">{d.lead}</span></div>
              <div className="text-xs text-slate-500">Active Staff: <span className="font-bold text-blue-600">{d.count} Members</span></div>
            </div>
          ))}
        </div>
      )}

      {/* Leave Application Modal */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Apply for Leave / Time Off</h3>
              <button onClick={() => setIsLeaveModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateLeave} className="p-6 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Employee Name *</label>
                <input
                  type="text"
                  required
                  value={newLeaveEmployee}
                  onChange={e => setNewLeaveEmployee(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Leave Category *</label>
                <select
                  value={newLeaveType}
                  onChange={e => setNewLeaveType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                >
                  <option value="Casual">Casual Leave</option>
                  <option value="Sick">Sick Leave</option>
                  <option value="Annual">Annual Leave</option>
                  <option value="Maternity">Maternity / Paternity</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={newLeaveStart}
                    onChange={e => setNewLeaveStart(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={newLeaveEnd}
                    onChange={e => setNewLeaveEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason / Notes</label>
                <textarea
                  rows={2}
                  value={newLeaveReason}
                  onChange={e => setNewLeaveReason(e.target.value)}
                  placeholder="Explain purpose of time-off..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
