import React from 'react';
import { 
  Users, 
  ShieldCheck, 
  Award, 
  CheckCircle, 
  Clock, 
  Briefcase, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { ServiceResource } from '../../../types';

interface ServiceResourcePanelProps {
  resources: ServiceResource[];
  onManageClick: () => void;
}

export const ServiceResourcePanel: React.FC<ServiceResourcePanelProps> = ({
  resources,
  onManageClick
}) => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Service Resources</h3>
              <p className="text-[11px] text-slate-500">Staff utilization, active jobs & certifications</p>
            </div>
          </div>
          <button
            onClick={onManageClick}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            Manage Fleet <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Resources List */}
        <div className="space-y-3">
          {resources.slice(0, 5).map(resource => {
            const isAvailable = resource.status === 'available';
            const isBusy = resource.status === 'busy';

            return (
              <div 
                key={resource.id} 
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition-all space-y-2.5"
              >
                {/* Employee Name, Avatar, Status Badge */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <img 
                      src={resource.avatar} 
                      alt={resource.name} 
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-2xs" 
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{resource.name}</span>
                        <span className="text-amber-500 font-bold text-[11px]">★ {resource.rating.toFixed(1)}</span>
                      </div>
                      <div className="text-[11px] text-blue-700 font-medium">{resource.role}</div>
                    </div>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    isAvailable
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : isBusy
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {isAvailable ? 'Available' : isBusy ? 'Dispatched' : resource.status}
                  </span>
                </div>

                {/* Current Job & Availability Note */}
                <div className="flex items-center justify-between text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-1.5 truncate">
                    <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="text-slate-500">Current Job:</span>
                    <strong className="text-slate-800 truncate">
                      {resource.currentJob || 'Queue Ready (None)'}
                    </strong>
                  </div>
                  <span className={`text-[10px] font-semibold shrink-0 ml-2 ${isAvailable ? 'text-emerald-600' : 'text-amber-700'}`}>
                    {resource.availability}
                  </span>
                </div>

                {/* Workload Progress Bar & Certifications */}
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <Award className="w-3 h-3 text-blue-600" />
                    <span className="truncate max-w-[140px] font-medium">
                      {resource.certifications.slice(0, 2).join(' • ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-medium">Workload:</span>
                    <div className="w-14 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          resource.workloadPercent > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} 
                        style={{ width: `${resource.workloadPercent}%` }} 
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-800">{resource.workloadPercent}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Total Fleet: {resources.length} resources</span>
        <span className="text-emerald-600 font-medium">
          {resources.filter(r => r.status === 'available').length} ready for dispatch
        </span>
      </div>
    </div>
  );
};
