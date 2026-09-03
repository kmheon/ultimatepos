import React from 'react';
import { 
  Activity, 
  UserCheck, 
  PlayCircle, 
  CheckCircle2, 
  FileCheck2, 
  Receipt, 
  CreditCard, 
  Cpu, 
  MessageSquare,
  Clock
} from 'lucide-react';
import { ServiceActivityItem } from '../../../types';

interface ServiceActivityFeedProps {
  activities: ServiceActivityItem[];
}

export const ServiceActivityFeed: React.FC<ServiceActivityFeedProps> = ({
  activities
}) => {
  const getActivityIcon = (type: ServiceActivityItem['type']) => {
    switch (type) {
      case 'work_order_assigned':
        return <UserCheck className="w-3.5 h-3.5 text-blue-600" />;
      case 'job_started':
        return <PlayCircle className="w-3.5 h-3.5 text-cyan-600" />;
      case 'job_completed':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      case 'quote_approved':
        return <FileCheck2 className="w-3.5 h-3.5 text-indigo-600" />;
      case 'invoice_generated':
        return <Receipt className="w-3.5 h-3.5 text-purple-600" />;
      case 'payment_received':
        return <CreditCard className="w-3.5 h-3.5 text-emerald-600" />;
      case 'asset_checked_in':
        return <Cpu className="w-3.5 h-3.5 text-amber-600" />;
      case 'customer_comment':
        return <MessageSquare className="w-3.5 h-3.5 text-pink-600" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  const getActivityBadgeBg = (type: ServiceActivityItem['type']) => {
    switch (type) {
      case 'work_order_assigned':
        return 'bg-blue-50 border-blue-100';
      case 'job_started':
        return 'bg-cyan-50 border-cyan-100';
      case 'job_completed':
        return 'bg-emerald-50 border-emerald-100';
      case 'quote_approved':
        return 'bg-indigo-50 border-indigo-100';
      case 'invoice_generated':
        return 'bg-purple-50 border-purple-100';
      case 'payment_received':
        return 'bg-emerald-50 border-emerald-100';
      case 'asset_checked_in':
        return 'bg-amber-50 border-amber-100';
      case 'customer_comment':
        return 'bg-pink-50 border-pink-100';
      default:
        return 'bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Service Activity</h3>
              <p className="text-[11px] text-slate-500">Live operational event log and audit trail</p>
            </div>
          </div>
          <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
            Realtime
          </span>
        </div>

        {/* Timeline List */}
        <div className="space-y-3.5 relative before:absolute before:top-2 before:bottom-2 before:left-[17px] before:w-[2px] before:bg-slate-100">
          {activities.slice(0, 6).map(act => (
            <div key={act.id} className="flex items-start gap-3 relative">
              <div className={`w-8 h-8 rounded-full border ${getActivityBadgeBg(act.type)} flex items-center justify-center shrink-0 z-10 bg-white shadow-2xs`}>
                {getActivityIcon(act.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 truncate">{act.title}</span>
                  <span className="text-[10px] text-slate-500 flex items-center gap-0.5 shrink-0 ml-1">
                    <Clock className="w-2.5 h-2.5" />
                    {act.timestamp}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                  {act.description}
                </p>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded font-medium text-slate-700">
                    By {act.user}
                  </span>
                  {act.amount && (
                    <span className="text-emerald-600 font-bold">
                      ${act.amount.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span>Continuous automated logging</span>
        <span className="text-blue-600 font-medium cursor-pointer hover:underline">
          View Audit Logs
        </span>
      </div>
    </div>
  );
};
