import React, { useState } from 'react';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  X, 
  ChevronRight, 
  ArrowRight 
} from 'lucide-react';
import { ServiceAlertItem } from '../../../types';

interface SmartAlertsBannerProps {
  alerts: ServiceAlertItem[];
  onActionClick?: (filterKey?: string) => void;
}

export const SmartAlertsBanner: React.FC<SmartAlertsBannerProps> = ({
  alerts,
  onActionClick
}) => {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  const visibleAlerts = alerts.filter(a => !dismissedIds.includes(a.id));

  if (visibleAlerts.length === 0) return null;

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedIds(prev => [...prev, id]);
  };

  return (
    <div className="space-y-2">
      {visibleAlerts.map(alert => {
        const isCritical = alert.severity === 'critical';
        const isWarning = alert.severity === 'warning';

        const bgClass = isCritical
          ? 'bg-rose-50 border-rose-200 text-rose-900'
          : isWarning
          ? 'bg-amber-50 border-amber-200 text-amber-900'
          : 'bg-blue-50 border-blue-200 text-blue-900';

        const iconColor = isCritical
          ? 'text-rose-600'
          : isWarning
          ? 'text-amber-600'
          : 'text-blue-600';

        const btnClass = isCritical
          ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200'
          : isWarning
          ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200'
          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200';

        return (
          <div
            key={alert.id}
            className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border ${bgClass} shadow-xs gap-3 transition-all`}
          >
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-xl bg-white/80 shadow-xs mt-0.5">
                {isCritical ? (
                  <AlertCircle className={`w-4 h-4 ${iconColor}`} />
                ) : isWarning ? (
                  <AlertTriangle className={`w-4 h-4 ${iconColor}`} />
                ) : (
                  <Info className={`w-4 h-4 ${iconColor}`} />
                )}
              </div>
              <div>
                <div className="font-bold text-xs flex items-center gap-2">
                  <span>{alert.title}</span>
                  <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md bg-white/90 border border-current">
                    {alert.severity}
                  </span>
                </div>
                <p className="text-[11px] opacity-90 mt-0.5">
                  {alert.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              {alert.actionLabel && (
                <button
                  onClick={() => onActionClick && onActionClick(alert.filterKey)}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl shadow-xs transition-all ${btnClass}`}
                >
                  {alert.actionLabel}
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={(e) => handleDismiss(alert.id, e)}
                title="Dismiss alert"
                className="p-1.5 hover:bg-black/5 rounded-xl text-slate-500 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
