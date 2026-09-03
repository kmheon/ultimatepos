import React, { useState } from 'react';
import {
  X,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Award,
  Calendar,
  Clock,
  Shield,
  FileText,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Star,
  Car,
  Navigation,
  Activity,
  Building2,
  FileCheck,
  BookOpen,
  User,
  Zap,
  TrendingUp,
  Download,
  Send,
  MessageSquare,
  Percent
} from 'lucide-react';
import { ServiceTechnician, TechnicianStatus } from '../../../types';

interface EmployeeProfileModalProps {
  technician: ServiceTechnician | null;
  isOpen: boolean;
  onClose: () => void;
  onAssignWorkOrder: (tech: ServiceTechnician) => void;
  onScheduleVisit: (tech: ServiceTechnician) => void;
  onMessage: (tech: ServiceTechnician) => void;
  onToggleStatus: (techId: string, status: TechnicianStatus) => void;
  onToggleDeactivate: (techId: string) => void;
}

type ProfileTab = 'overview' | 'skills' | 'assets' | 'jobs' | 'kpis' | 'attendance' | 'documents' | 'training';

export const EmployeeProfileModal: React.FC<EmployeeProfileModalProps> = ({
  technician,
  isOpen,
  onClose,
  onAssignWorkOrder,
  onScheduleVisit,
  onMessage,
  onToggleStatus,
  onToggleDeactivate,
}) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');

  if (!isOpen || !technician) return null;

  const getStatusBadge = (status: TechnicianStatus) => {
    switch (status) {
      case 'available':
        return { label: 'Available / Standby', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'busy':
        return { label: 'Occupied / Working', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'on_site':
        return { label: 'On Site / Active Duty', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'travelling':
        return { label: 'En Route / Travelling', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'on_leave':
        return { label: 'On Approved Leave', bg: 'bg-slate-100 text-slate-600 border-slate-200' };
      case 'offline':
        return { label: 'Offline / Inactive', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
      default:
        return { label: String(status || 'Active'), bg: 'bg-slate-100 text-slate-600 border-slate-200' };
    }
  };

  const statusInfo = getStatusBadge(technician.status);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
            <div className="relative">
              <img
                src={technician.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={technician.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-white/20 shadow-lg"
              />
              <span className={`absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full border-2 border-white ${
                technician.status === 'available' ? 'bg-emerald-500' :
                technician.status === 'on_site' ? 'bg-blue-500' :
                technician.status === 'busy' ? 'bg-amber-500' :
                technician.status === 'travelling' ? 'bg-purple-500' : 'bg-slate-400'
              }`} />
            </div>

            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{technician.name}</h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-400/30 font-mono">
                  {technician.employeeId || 'CNX-FE-0101'}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${statusInfo.bg}`}>
                  {statusInfo.label}
                </span>
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-300 flex-wrap">
                <span className="font-semibold text-blue-300">{technician.designation || technician.role}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300">{technician.department}</span>
                <span className="text-slate-500">•</span>
                <span className="flex items-center gap-1 text-slate-300">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {technician.currentBranch || 'Dhaka Central Hub'}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400 pt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-300" />
                  {technician.mobileNumber || technician.phone}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-300" />
                  {technician.email}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <strong className="text-white">{technician.rating.toFixed(1)}</strong> ({technician.completedJobsCount} jobs completed)
                </span>
              </div>
            </div>

            {/* Quick Action Header Buttons */}
            <div className="flex flex-wrap md:flex-col gap-2 w-full md:w-auto pt-2 md:pt-0">
              <button
                onClick={() => onAssignWorkOrder(technician)}
                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                <Briefcase className="w-3.5 h-3.5" />
                Assign Work Order
              </button>
              <button
                onClick={() => onScheduleVisit(technician)}
                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/15 transition-all"
              >
                <Calendar className="w-3.5 h-3.5" />
                Schedule Visit
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 flex space-x-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Personal & Employment', icon: User },
            { id: 'skills', label: 'Skills & Certifications', icon: Award },
            { id: 'assets', label: 'Assigned Assets', icon: Wrench, badge: technician.assignedAssets?.length },
            { id: 'jobs', label: 'Jobs & Schedule', icon: Briefcase, badge: technician.activeJobsCount },
            { id: 'kpis', label: 'Performance KPIs', icon: TrendingUp },
            { id: 'attendance', label: 'Attendance & Timesheets', icon: Clock },
            { id: 'documents', label: 'Documents', icon: FileText, badge: technician.documents?.length },
            { id: 'training', label: 'Training History', icon: BookOpen, badge: technician.trainingHistory?.length },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ProfileTab)}
                className={`flex items-center gap-1.5 px-3.5 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-blue-600 text-blue-600 bg-white shadow-xs rounded-t-lg'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-slate-700">
          {/* TAB 1: OVERVIEW & EMPLOYMENT */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Live Status & Field Assignment Banner */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Current Live Assignment</span>
                    <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {technician.currentAssignment?.workOrderNumber || 'WO-2026-0041'}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {technician.currentAssignment?.clientName || 'Grameen CyberNet Ltd.'}
                  </h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {technician.currentAssignment?.siteLocation || 'Gulshan-2 Data Center Hub, Dhaka'}
                  </p>
                  <p className="text-xs text-slate-600 pt-0.5">
                    {technician.currentAssignment?.taskSummary || 'Routine maintenance and inspection'}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1.5 bg-white p-3 rounded-xl border border-slate-200 min-w-[200px]">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <Navigation className="w-3.5 h-3.5 text-blue-600" />
                    <span>GPS: <strong>{technician.currentGpsStatus?.status.toUpperCase() || 'ONLINE'}</strong></span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono truncate max-w-[190px]">
                    {technician.currentGpsStatus?.lastLocationName || 'Gulshan 2, Dhaka'}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <Car className="w-3 h-3" />
                    <span>{technician.vehicleAssigned || 'Company Service Van'}</span>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div>
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3 flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 bg-white border border-slate-200 rounded-2xl p-4 text-xs">
                  <div>
                    <span className="block text-slate-400 font-semibold text-[11px]">Date of Birth</span>
                    <span className="font-bold text-slate-900">{technician.personalInfo?.dateOfBirth || '1992-06-14'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-semibold text-[11px]">Blood Group</span>
                    <span className="font-bold text-rose-600">{technician.personalInfo?.bloodGroup || 'B+'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-semibold text-[11px]">National ID (NID)</span>
                    <span className="font-bold text-slate-900 font-mono">{technician.personalInfo?.nidNumber || '19922692019000142'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-semibold text-[11px]">Emergency Contact</span>
                    <span className="font-bold text-slate-900">
                      {technician.personalInfo?.emergencyContact?.name || 'Nasrin Sultana'} ({technician.personalInfo?.emergencyContact?.relation || 'Spouse'})
                    </span>
                    <span className="block text-[11px] text-slate-500">{technician.personalInfo?.emergencyContact?.phone || '+880 1819-204910'}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="block text-slate-400 font-semibold text-[11px]">Present Address (Dhaka)</span>
                    <span className="text-slate-800">{technician.personalInfo?.presentAddress || 'House 42, Road 9, Block D, Bashundhara R/A, Dhaka'}</span>
                  </div>
                  <div className="sm:col-span-3">
                    <span className="block text-slate-400 font-semibold text-[11px]">Permanent Address</span>
                    <span className="text-slate-800">{technician.personalInfo?.permanentAddress || 'Feni Sadar, Feni, Bangladesh'}</span>
                  </div>
                </div>
              </div>

              {/* Employment Information */}
              <div>
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3 flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                  Enterprise Employment Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 bg-white border border-slate-200 rounded-2xl p-4 text-xs">
                  <div>
                    <span className="block text-slate-400 font-semibold text-[11px]">Joining Date</span>
                    <span className="font-bold text-slate-900">{technician.employmentInfo?.joiningDate || '2021-03-15'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-semibold text-[11px]">Employment Type</span>
                    <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-block">
                      {technician.employmentType || 'Full-Time Permanent'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-semibold text-[11px]">Payroll & Grade</span>
                    <span className="font-bold text-slate-900">{technician.employmentInfo?.payrollGrade || 'Grade E-4 (Senior Specialist)'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-semibold text-[11px]">Reporting Manager</span>
                    <span className="font-bold text-slate-900">{technician.employmentInfo?.reportingManager || 'Engr. Muniruzzaman (Head of Operations)'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-semibold text-[11px]">Shift Timing</span>
                    <span className="font-bold text-slate-900">{technician.employmentInfo?.shiftTiming || '08:30 AM – 05:30 PM'}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-semibold text-[11px]">Work Station</span>
                    <span className="font-bold text-slate-900">{technician.employmentInfo?.workStation || 'Dhaka Central Operations Hub'}</span>
                  </div>
                </div>
              </div>

              {/* Status Update Control */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <h4 className="text-xs font-bold text-slate-900 mb-2">Update Operational Availability Status</h4>
                <div className="flex flex-wrap gap-2">
                  {(['available', 'busy', 'on_site', 'travelling', 'on_leave', 'offline'] as TechnicianStatus[]).map(st => (
                    <button
                      key={st}
                      onClick={() => onToggleStatus(technician.id, st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all border ${
                        technician.status === st
                          ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SKILLS & CERTIFICATIONS */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">Primary Technical Competencies</h3>
                <div className="flex flex-wrap gap-2">
                  {(technician.primarySkills || [
                    'Enterprise CCTV', 'NVR/SAN RAID Storage', 'PTZ Optical Zoom', 'AI Face Recognition', 'Fiber Transceivers'
                  ]).map((skill, idx) => (
                    <span key={idx} className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">Industry Certifications & Accreditations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(technician.certificationList || [
                    'Hikvision Certified Security Professional (HCSP)',
                    'Milestone Certified Integration Tech (MCIT)',
                    'BTRC Telecomm & Surveillance Grade-A'
                  ]).map((cert, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-start gap-3 shadow-xs">
                      <div className="p-2 bg-amber-50 text-amber-600 rounded-lg border border-amber-200">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">{cert}</h4>
                        <span className="text-[11px] text-slate-500 block">Verified Enterprise Credential</span>
                        <span className="text-[10px] text-emerald-600 font-semibold">Active & Valid</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                  <span className="text-slate-400 text-xs font-bold uppercase block">Field Experience</span>
                  <strong className="text-xl font-bold text-slate-900">{technician.yearsOfExperience || 7} Years</strong>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                  <span className="text-slate-400 text-xs font-bold uppercase block">AMC Contracts Assigned</span>
                  <strong className="text-xl font-bold text-blue-600">{technician.amcContractsAssigned || 12} Accounts</strong>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                  <span className="text-slate-400 text-xs font-bold uppercase block">Turnkey Projects</span>
                  <strong className="text-xl font-bold text-indigo-600">{technician.projectsAssigned || 3} Active</strong>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ASSIGNED ASSETS */}
          {activeTab === 'assets' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Assigned Enterprise Assets & Field Gear</h3>
                  <p className="text-xs text-slate-500">Tracked tools, diagnostic meters, fleet vehicle and PPE equipment</p>
                </div>
                <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                  {technician.assignedAssets?.length || 0} Assets Allocated
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Asset Name & Model</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Serial / Plate #</th>
                      <th className="p-3">Issued Date</th>
                      <th className="p-3">Condition</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(technician.assignedAssets || []).map(asset => (
                      <tr key={asset.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-semibold text-slate-900 flex items-center gap-2">
                          <Wrench className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          {asset.assetName}
                        </td>
                        <td className="p-3 text-slate-600">
                          <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">
                            {asset.assetType}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-slate-700 font-semibold">{asset.serialNumber}</td>
                        <td className="p-3 text-slate-500">{asset.issuedDate}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            asset.condition === 'Excellent' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            asset.condition === 'Good' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {asset.condition}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: CURRENT JOBS & UPCOMING SCHEDULE */}
          {activeTab === 'jobs' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3 flex items-center justify-between">
                  <span>Current Active Work Orders</span>
                  <span className="text-blue-600 font-semibold">{technician.currentJobsList?.length || 0} Open</span>
                </h3>
                <div className="space-y-3">
                  {(technician.currentJobsList || []).map(job => (
                    <div key={job.id} className="bg-white border border-slate-200 rounded-2xl p-4 hover:border-blue-300 transition-all shadow-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                          {job.jobSheetNumber}
                        </span>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          job.priority === 'urgent' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          job.priority === 'high' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {job.priority} Priority
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{job.customerName}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {job.siteAddress}
                      </p>
                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-xs">
                        <span className="text-slate-600 font-medium">Service: {job.serviceType}</span>
                        <span className="text-rose-600 font-semibold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          SLA Target: {job.slaDeadline}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">Upcoming Dispatch Schedule</h3>
                <div className="space-y-2.5">
                  {(technician.upcomingSchedule || []).map(slot => (
                    <div key={slot.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 text-blue-700 p-2 rounded-lg font-bold text-center min-w-[55px]">
                          <Calendar className="w-3.5 h-3.5 mx-auto mb-0.5" />
                          <span className="text-[10px] block">{slot.date}</span>
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-900">{slot.clientName}</h5>
                          <span className="text-slate-600">{slot.taskType}</span>
                          <span className="text-[11px] text-slate-400 block">{slot.location} • {slot.timeSlot}</span>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        slot.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                        slot.status === 'en_route' ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {slot.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PERFORMANCE KPIS */}
          {activeTab === 'kpis' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <span className="text-slate-400 text-xs font-bold uppercase block">SLA Success Rate</span>
                  <div className="text-2xl font-bold text-emerald-600 mt-1">
                    {technician.slaSuccessRate || 98.6}%
                  </div>
                  <span className="text-[11px] text-slate-500">Benchmark: 95.0%</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <span className="text-slate-400 text-xs font-bold uppercase block">First Time Fix Rate</span>
                  <div className="text-2xl font-bold text-blue-600 mt-1">
                    {technician.firstTimeFixRate || 95.2}%
                  </div>
                  <span className="text-[11px] text-slate-500">Benchmark: 90.0%</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <span className="text-slate-400 text-xs font-bold uppercase block">Avg Turnaround</span>
                  <div className="text-2xl font-bold text-slate-900 mt-1">
                    {technician.performanceKpis?.avgResolutionTimeHours || 2.8} hrs
                  </div>
                  <span className="text-[11px] text-slate-500">Target: &lt; 4.0 hrs</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <span className="text-slate-400 text-xs font-bold uppercase block">Customer Rating</span>
                  <div className="text-2xl font-bold text-amber-600 mt-1 flex items-center gap-1">
                    ★ {technician.rating.toFixed(2)}
                  </div>
                  <span className="text-[11px] text-slate-500">5-Star Feedback</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Service Revenue & Fleet Productivity</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-500 block">Monthly Revenue Generated</span>
                    <strong className="text-base font-bold text-slate-900">
                      ৳ {(technician.revenueGenerated || 485000).toLocaleString()} BDT
                    </strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-500 block">Billable Hours Logged</span>
                    <strong className="text-base font-bold text-blue-600">
                      {technician.billableHours || 36} hrs / week
                    </strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-500 block">Workforce Utilization</span>
                    <strong className="text-base font-bold text-emerald-600">
                      {technician.workloadPercent || 88}%
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ATTENDANCE & TIMESHEETS */}
          {activeTab === 'attendance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block">Days Present (This Month)</span>
                  <strong className="text-lg font-bold text-slate-900">{technician.attendance?.daysPresentMonth || 22} Days</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Days Late</span>
                  <strong className="text-lg font-bold text-slate-900">{technician.attendance?.daysLateMonth || 0} Days</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Leave Balance</span>
                  <strong className="text-lg font-bold text-blue-600">{technician.attendance?.leaveBalanceDays || 14} Days</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Last GPS Punch-in</span>
                  <strong className="text-xs font-bold text-emerald-700 block">{technician.attendance?.lastCheckIn || '08:24 AM'}</strong>
                  <span className="text-[10px] text-slate-400">{technician.attendance?.checkInLocation || 'Dhaka Central Hub'}</span>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">Recent Field Timesheet Logs</h3>
                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Date</th>
                        <th className="p-3">Work Order</th>
                        <th className="p-3">Task Performed</th>
                        <th className="p-3 text-center">Regular Hrs</th>
                        <th className="p-3 text-center">Overtime</th>
                        <th className="p-3 text-right">Approval</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(technician.timesheets || [
                        { id: 'ts-1', date: '2026-09-02', workOrderNumber: 'WO-2026-0041', taskName: 'NVR Diagnostic & Storage Configuration', regularHours: 8, overtimeHours: 1.5, status: 'Approved' }
                      ]).map(ts => (
                        <tr key={ts.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-semibold text-slate-900">{ts.date}</td>
                          <td className="p-3 font-mono text-blue-600 font-bold">{ts.workOrderNumber}</td>
                          <td className="p-3 text-slate-700">{ts.taskName}</td>
                          <td className="p-3 text-center font-bold text-slate-900">{ts.regularHours}h</td>
                          <td className="p-3 text-center text-amber-600 font-semibold">{ts.overtimeHours > 0 ? `+${ts.overtimeHours}h` : '—'}</td>
                          <td className="p-3 text-right">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {ts.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Verified Employee Dossier & Credentials</h3>
                  <p className="text-xs text-slate-500">Official security clearance, contracts, certifications and identification records</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {(technician.documents || [
                  { id: 'doc-1', title: 'National ID Card (Smart Card Scan)', fileType: 'PDF', fileSize: '1.8 MB', uploadedDate: '2021-03-15', category: 'Identity' }
                ]).map(doc => (
                  <div key={doc.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-start justify-between gap-3 shadow-xs hover:border-blue-300 transition-all">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs leading-tight">{doc.title}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                          <span>{doc.fileType}</span>
                          <span>•</span>
                          <span>{doc.fileSize}</span>
                          <span>•</span>
                          <span>Uploaded: {doc.uploadedDate}</span>
                        </div>
                        {doc.expiryDate && (
                          <span className="text-[10px] text-amber-600 font-semibold block mt-0.5">
                            Expires: {doc.expiryDate}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => alert(`Downloading verified document: ${doc.title}`)}
                      className="p-2 hover:bg-slate-100 text-slate-600 rounded-xl transition-all"
                      title="Download document"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: TRAINING HISTORY */}
          {activeTab === 'training' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Enterprise Training & OEM Certifications</h3>
                <p className="text-xs text-slate-500">Authorized manufacturer programs, safety drills and engineering updates</p>
              </div>

              <div className="space-y-3">
                {(technician.trainingHistory || [
                  { id: 'trn-1', courseName: 'Enterprise AI Video Analytics & DeepinMind VMS Architecture', institution: 'Hikvision Academy Bangladesh', completionDate: '2024-05-12', validUntil: '2027-05-12', status: 'Completed', credentialId: 'HIK-BD-2024-9102' }
                ]).map(trn => (
                  <div key={trn.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">{trn.courseName}</h4>
                        <span className="text-[11px] text-slate-500 block">{trn.institution}</span>
                        {trn.credentialId && (
                          <span className="text-[10px] font-mono text-blue-600 font-semibold block mt-0.5">
                            Credential ID: {trn.credentialId}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="text-right text-[11px]">
                        <span className="text-slate-400 block font-semibold">Completed</span>
                        <span className="text-slate-800 font-bold">{trn.completionDate}</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {trn.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 px-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleDeactivate(technician.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                technician.isActive !== false
                  ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              {technician.isActive !== false ? 'Deactivate Employee' : 'Activate Employee'}
            </button>
            <button
              onClick={() => onMessage(technician)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              Direct Message
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.location.href = `tel:${technician.mobileNumber || technician.phone}`}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
            >
              <Phone className="w-3.5 h-3.5" />
              Call Engineer
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
