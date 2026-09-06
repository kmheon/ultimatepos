import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  Calendar, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  Building2, 
  Shield, 
  Plus,
  Download,
  Printer
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { 
  NebulaPage, 
  NebulaTable, 
  TableCard, 
  SummaryCard, 
  Column 
} from '../../core/ui';

interface AttendanceRecord {
  id: string;
  employeeName: string;
  employeeId: string;
  department: string;
  date: string;
  checkIn: string;
  checkOut: string;
  totalHours: string;
  status: 'On Time' | 'Late' | 'Absent' | 'On Leave';
  branch: string;
}

export const AttendancePage: React.FC = () => {
  const { settings } = usePOS();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [branchFilter, setBranchFilter] = useState('All Branches');
  const [selectedDate, setSelectedDate] = useState('2026-09-06');
  const [isPunchModalOpen, setIsPunchModalOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([
    {
      id: 'att-1',
      employeeName: 'Sarah Jenkins',
      employeeId: 'EMP-2026-001',
      department: 'POS & Retail Sales',
      date: '2026-09-06',
      checkIn: '08:55 AM',
      checkOut: 'Active',
      totalHours: '6h 12m',
      status: 'On Time',
      branch: 'Downtown Flagship'
    },
    {
      id: 'att-2',
      employeeName: 'Alex Rivera',
      employeeId: 'EMP-2026-002',
      department: 'Electronics & Repair',
      date: '2026-09-06',
      checkIn: '09:12 AM',
      checkOut: 'Active',
      totalHours: '5h 45m',
      status: 'Late',
      branch: 'Downtown Flagship'
    },
    {
      id: 'att-3',
      employeeName: 'Marcus Vance',
      employeeId: 'EMP-2026-003',
      department: 'Management & HR',
      date: '2026-09-06',
      checkIn: '08:40 AM',
      checkOut: 'Active',
      totalHours: '6h 30m',
      status: 'On Time',
      branch: 'Downtown Flagship'
    },
    {
      id: 'att-4',
      employeeName: 'David Miller',
      employeeId: 'EMP-2026-004',
      department: 'Warehouse & Logistics',
      date: '2026-09-06',
      checkIn: '09:05 AM',
      checkOut: 'Active',
      totalHours: '6h 02m',
      status: 'On Time',
      branch: 'Westside Mall'
    },
    {
      id: 'att-5',
      employeeName: 'Elena Rostova',
      employeeId: 'EMP-2026-005',
      department: 'POS & Retail Sales',
      date: '2026-09-06',
      checkIn: '—',
      checkOut: '—',
      totalHours: '0h 00m',
      status: 'On Leave',
      branch: 'Westside Mall'
    }
  ]);

  const [punchForm, setPunchForm] = useState({
    employeeName: 'Sarah Jenkins',
    employeeId: 'EMP-2026-001',
    checkInTime: '08:50 AM',
    branch: 'Downtown Flagship',
    status: 'On Time' as const
  });

  const handleManualPunch = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      employeeName: punchForm.employeeName,
      employeeId: punchForm.employeeId,
      department: 'POS & Retail Sales',
      date: selectedDate,
      checkIn: punchForm.checkInTime,
      checkOut: 'Active',
      totalHours: '0h 00m',
      status: punchForm.status,
      branch: punchForm.branch
    };

    setAttendanceRecords([newRecord, ...attendanceRecords]);
    setIsPunchModalOpen(false);
    setNotice(`Successfully recorded attendance punch for ${punchForm.employeeName}.`);
    setTimeout(() => setNotice(null), 4000);
  };

  const filteredRecords = useMemo(() => {
    return attendanceRecords.filter(rec => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        rec.employeeName.toLowerCase().includes(q) || 
        rec.employeeId.toLowerCase().includes(q) || 
        rec.department.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'All Statuses' || rec.status === statusFilter;
      const matchesBranch = branchFilter === 'All Branches' || rec.branch === branchFilter;

      return matchesSearch && matchesStatus && matchesBranch;
    });
  }, [attendanceRecords, searchQuery, statusFilter, branchFilter]);

  const columns: Column<AttendanceRecord>[] = useMemo(() => [
    {
      header: 'Employee Name & ID',
      accessor: (rec) => (
        <div className="flex flex-col">
          <span className="font-black text-slate-900">{rec.employeeName}</span>
          <span className="font-mono text-[11px] text-blue-600">{rec.employeeId}</span>
        </div>
      )
    },
    {
      header: 'Department',
      accessor: (rec) => <span className="text-xs font-semibold text-slate-700">{rec.department}</span>
    },
    {
      header: 'Branch Location',
      accessor: (rec) => <span className="text-xs text-slate-600">{rec.branch}</span>
    },
    {
      header: 'Check-In',
      accessor: (rec) => <span className="font-mono text-xs font-bold text-slate-900">{rec.checkIn}</span>
    },
    {
      header: 'Check-Out',
      accessor: (rec) => <span className="font-mono text-xs font-bold text-slate-600">{rec.checkOut}</span>
    },
    {
      header: 'Shift Hours',
      accessor: (rec) => <span className="font-mono text-xs font-black text-emerald-600">{rec.totalHours}</span>
    },
    {
      header: 'Punctuality Status',
      accessor: (rec) => (
        <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
          rec.status === 'On Time' ? 'bg-emerald-100 text-emerald-800' :
          rec.status === 'Late' ? 'bg-amber-100 text-amber-800' :
          rec.status === 'On Leave' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
        }`}>
          {rec.status}
        </span>
      )
    }
  ], []);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-0">
        {notice && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center justify-between">
            <span>{notice}</span>
            <button onClick={() => setNotice(null)} className="text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer">Dismiss</button>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">Attendance & Punctuality Tracking</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  96.8% Attendance Rate
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Real-time biometric punch logs, tardiness reports, and daily shift hours.</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsPunchModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Manual Time Punch</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Active Staff</span>
            <h3 className="text-2xl font-black text-slate-900">12 Employees</h3>
            <p className="text-[11px] text-slate-500 font-medium">Scheduled Today</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Present On-Time</span>
            <h3 className="text-2xl font-black text-emerald-600">11 Staff</h3>
            <p className="text-[11px] text-emerald-700 font-bold">94.2% On-Time Start</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Late Arrivals</span>
            <h3 className="text-2xl font-black text-amber-600">1 Staff</h3>
            <p className="text-[11px] text-amber-700 font-bold">&gt;15 mins tardy</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Approved Leave</span>
            <h3 className="text-2xl font-black text-blue-600">1 Staff</h3>
            <p className="text-[11px] text-blue-700 font-bold">Paid Vacation</p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search attendance by name or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer"
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
                <option value="On Time">On Time</option>
                <option value="Late">Late</option>
                <option value="On Leave">On Leave</option>
                <option value="Absent">Absent</option>
              </select>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="All Branches">All Branches</option>
                <option value="Downtown Flagship">Downtown Flagship</option>
                <option value="Westside Mall">Westside Mall</option>
              </select>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <TableCard title="Daily Attendance & Biometric Logs" subtitle={`Showing shift punch records for ${selectedDate}`}>
          <NebulaTable
            data={filteredRecords}
            columns={columns}
            keyExtractor={(row) => row.id}
          />
        </TableCard>
      </div>

      {/* Manual Time Punch Modal */}
      {isPunchModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Manual Time Punch</h3>
                  <p className="text-xs text-slate-500">Record check-in time for employee shift.</p>
                </div>
              </div>
              <button onClick={() => setIsPunchModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleManualPunch} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Employee Name</label>
                <select
                  value={punchForm.employeeName}
                  onChange={(e) => {
                    const name = e.target.value;
                    const id = name === 'Sarah Jenkins' ? 'EMP-2026-001' : name === 'Alex Rivera' ? 'EMP-2026-002' : 'EMP-2026-003';
                    setPunchForm({ ...punchForm, employeeName: name, employeeId: id });
                  }}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="Sarah Jenkins">Sarah Jenkins (EMP-2026-001)</option>
                  <option value="Alex Rivera">Alex Rivera (EMP-2026-002)</option>
                  <option value="Marcus Vance">Marcus Vance (EMP-2026-003)</option>
                  <option value="David Miller">David Miller (EMP-2026-004)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Check-In Time</label>
                  <input
                    type="text"
                    required
                    value={punchForm.checkInTime}
                    onChange={(e) => setPunchForm({ ...punchForm, checkInTime: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Status</label>
                  <select
                    value={punchForm.status}
                    onChange={(e) => setPunchForm({ ...punchForm, status: e.target.value as any })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="On Time">On Time</option>
                    <option value="Late">Late</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Branch Location</label>
                <select
                  value={punchForm.branch}
                  onChange={(e) => setPunchForm({ ...punchForm, branch: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="Downtown Flagship">Downtown Flagship</option>
                  <option value="Westside Mall">Westside Mall</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsPunchModalOpen(false)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-all">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-all">Record Punch</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
