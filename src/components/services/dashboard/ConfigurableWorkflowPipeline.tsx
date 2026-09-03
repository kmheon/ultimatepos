import React from 'react';
import { 
  ChevronRight, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  DollarSign, 
  User, 
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { RepairJobSheet, ServiceWorkflowStage } from '../../../types';
import { mapJobToWorkflowStage, isWorkOrderOverdue } from '../../../services/serviceOperations.service';

interface ConfigurableWorkflowPipelineProps {
  stages: ServiceWorkflowStage[];
  jobs: RepairJobSheet[];
  currencySymbol: string;
  onJobClick: (job: RepairJobSheet) => void;
  onViewAllClick: () => void;
  onAdvanceJobStage?: (jobId: string, nextStageKey: string) => void;
}

export const ConfigurableWorkflowPipeline: React.FC<ConfigurableWorkflowPipelineProps> = ({
  stages,
  jobs,
  currencySymbol,
  onJobClick,
  onViewAllClick,
  onAdvanceJobStage
}) => {
  const getPriorityBadge = (priority: RepairJobSheet['priority']) => {
    switch (priority) {
      case 'urgent':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white uppercase tracking-wider">Urgent</span>;
      case 'high':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-orange-100 text-orange-800 border border-orange-200">High</span>;
      case 'normal':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">Normal</span>;
      case 'low':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-50 text-slate-500">Low</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Service Pipeline & Work Queue</h2>
            <span className="text-[10px] font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
              10 Configurable Stages
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time visual tracking of customer assets across the complete service lifecycle
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-500">
            Total Pipeline Value: <strong className="text-slate-900">{currencySymbol}{jobs.reduce((s, j) => s + (j.finalTotal || 0), 0).toFixed(2)}</strong>
          </div>
          <button
            onClick={onViewAllClick}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            View All Requests <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Kanban Columns */}
      <div className="overflow-x-auto pb-2 -mx-2 px-2 no-scrollbar">
        <div className="flex space-x-3 min-w-[1200px]">
          {stages.map((stage, stageIdx) => {
            const stageJobs = jobs.filter(j => mapJobToWorkflowStage(j) === stage.key);
            const stageTotalValue = stageJobs.reduce((sum, j) => sum + (j.finalTotal || 0), 0);

            return (
              <div 
                key={stage.id} 
                className={`w-72 shrink-0 p-3.5 rounded-2xl border ${stage.color} flex flex-col justify-between`}
              >
                <div>
                  {/* Stage Header */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-xs font-bold ${stage.textColor} flex items-center gap-1.5`}>
                      <span className={`w-2 h-2 rounded-full ${stage.dotColor}`} />
                      {stage.title}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white shadow-xs ${stage.textColor}`}>
                      {stageJobs.length}
                    </span>
                  </div>

                  {/* Stage Subtitle & Value */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-3 pb-2 border-b border-slate-200/50">
                    <span className="truncate">{stage.description}</span>
                    <span className="font-semibold text-slate-700 shrink-0 ml-1">
                      {currencySymbol}{stageTotalValue.toFixed(0)}
                    </span>
                  </div>

                  {/* Cards inside stage */}
                  <div className="space-y-2.5">
                    {stageJobs.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-[11px] bg-white/40 rounded-xl border border-dashed border-slate-200">
                        No active jobs
                      </div>
                    ) : (
                      stageJobs.slice(0, 4).map(job => {
                        const isOverdue = isWorkOrderOverdue(job);
                        const resourceName = (job.technicianAssigned || 'Unassigned Resource').split(',')[0].split('(')[0].trim();
                        const nextStage = stages[stageIdx + 1]?.key;

                        return (
                          <div
                            key={job.id}
                            onClick={() => onJobClick(job)}
                            className={`bg-white p-3 rounded-xl border shadow-xs cursor-pointer hover:border-blue-400 hover:shadow-sm transition-all text-xs ${
                              isOverdue ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200/90'
                            }`}
                          >
                            {/* Top row: Work Order # & Priority Badge */}
                            <div className="flex items-center justify-between font-semibold text-slate-900 mb-1">
                              <span className="text-blue-600 font-bold">{job.jobSheetNumber}</span>
                              <div className="flex items-center gap-1">
                                {isOverdue && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-0.5">
                                    <Clock className="w-2.5 h-2.5" /> Overdue
                                  </span>
                                )}
                                {getPriorityBadge(job.priority)}
                              </div>
                            </div>

                            {/* Customer Asset Name */}
                            <div className="text-slate-800 font-medium truncate">
                              {job.deviceBrand} {job.deviceModel}
                            </div>

                            {/* Customer Name & Issue */}
                            <div className="text-[11px] text-slate-500 truncate mt-0.5">
                              {job.customerName}
                            </div>

                            {/* Assigned Resource & Due Date */}
                            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                              <span className="flex items-center gap-1 truncate text-slate-700 font-medium">
                                <User className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate">{resourceName}</span>
                              </span>
                              <span className={`font-semibold shrink-0 ml-1 ${isOverdue ? 'text-rose-600' : 'text-slate-600'}`}>
                                Due: {job.estimatedDeliveryDate?.slice(5) || 'TBD'}
                              </span>
                            </div>

                            {/* Total Value & Advance Stage Action */}
                            <div className="mt-1.5 flex items-center justify-between text-[11px]">
                              <span className="font-bold text-slate-900">
                                {currencySymbol}{job.finalTotal?.toFixed(2)}
                              </span>
                              {nextStage && onAdvanceJobStage && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onAdvanceJobStage(job.id, nextStage);
                                  }}
                                  className="text-[10px] text-blue-600 hover:text-blue-800 font-bold hover:underline flex items-center gap-0.5"
                                >
                                  Advance →
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Footer Count Note */}
                {stageJobs.length > 4 && (
                  <div className="text-center pt-2 text-[10px] text-slate-500 font-medium">
                    +{stageJobs.length - 4} more jobs in queue
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
