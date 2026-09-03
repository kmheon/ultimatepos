import React from 'react';
import { 
  FileText, 
  ExternalLink, 
  Clock, 
  User, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight,
  Eye
} from 'lucide-react';
import { RepairJobSheet } from '../../../types';
import { isWorkOrderOverdue } from '../../../services/serviceOperations.service';

interface RecentWorkOrdersTableProps {
  jobs: RepairJobSheet[];
  currencySymbol: string;
  onJobClick: (job: RepairJobSheet) => void;
  onViewAllClick: () => void;
}

export const RecentWorkOrdersTable: React.FC<RecentWorkOrdersTableProps> = ({
  jobs,
  currencySymbol,
  onJobClick,
  onViewAllClick
}) => {
  const getStatusBadge = (status: RepairJobSheet['status']) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">Pending Triage</span>;
      case 'diagnosing':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">Assessment / In Progress</span>;
      case 'awaiting_parts':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Waiting on Parts</span>;
      case 'repaired':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Quality Review</span>;
      case 'delivered':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300">Closed / Delivered</span>;
      case 'cancelled':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">Cancelled</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const getPriorityBadge = (priority: RepairJobSheet['priority']) => {
    switch (priority) {
      case 'urgent':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-600 text-white uppercase tracking-wider">Urgent</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-orange-100 text-orange-800 border border-orange-200">High</span>;
      case 'normal':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">Normal</span>;
      case 'low':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-50 text-slate-500">Low</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Recent Work Orders</h3>
          <p className="text-xs text-slate-500">Active and recently updated enterprise service tickets</p>
        </div>
        <button
          onClick={onViewAllClick}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          View Full Table <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-y border-slate-100">
            <tr>
              <th className="py-2.5 px-3">Work Order</th>
              <th className="py-2.5 px-3">Customer & Asset</th>
              <th className="py-2.5 px-3">Service Type</th>
              <th className="py-2.5 px-3">Assigned Resource</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Priority</th>
              <th className="py-2.5 px-3">Due Date</th>
              <th className="py-2.5 px-3 text-right">Value</th>
              <th className="py-2.5 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-slate-400">
                  No work orders found in database
                </td>
              </tr>
            ) : (
              jobs.slice(0, 7).map(job => {
                const isOverdue = isWorkOrderOverdue(job);
                const resourceName = (job.technicianAssigned || 'Unassigned Resource').split(',')[0].split('(')[0].trim();
                const serviceType = job.serviceType || 'Standard Maintenance & Diagnostic';

                return (
                  <tr 
                    key={job.id} 
                    onClick={() => onJobClick(job)}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                  >
                    {/* Work Order */}
                    <td className="py-3 px-3 font-bold text-blue-600">
                      {job.jobSheetNumber}
                    </td>

                    {/* Customer & Asset */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{job.customerName}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                        {job.deviceBrand} {job.deviceModel}
                      </div>
                    </td>

                    {/* Service Type */}
                    <td className="py-3 px-3">
                      <span className="text-slate-700 font-medium">{serviceType}</span>
                    </td>

                    {/* Assigned Resource */}
                    <td className="py-3 px-3 text-slate-700">
                      <div className="flex items-center gap-1.5 font-medium">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[130px]">{resourceName}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      {getStatusBadge(job.status)}
                    </td>

                    {/* Priority */}
                    <td className="py-3 px-3">
                      {getPriorityBadge(job.priority)}
                    </td>

                    {/* Due Date */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className={`flex items-center gap-1 ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600'}`}>
                        {isOverdue && <Clock className="w-3 h-3 text-rose-600" />}
                        <span>{job.estimatedDeliveryDate || 'TBD'}</span>
                      </div>
                    </td>

                    {/* Value */}
                    <td className="py-3 px-3 text-right font-bold text-slate-900 whitespace-nowrap">
                      {currencySymbol}{job.finalTotal?.toFixed(2)}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onJobClick(job);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-colors"
                        title="View Work Order"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
