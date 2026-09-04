import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface NebulaModuleHeaderProps {
  icon: LucideIcon;
  title: string;
  badge?: string;
  description?: string;
  actions?: React.ReactNode;
}

export const NebulaModuleHeader: React.FC<NebulaModuleHeaderProps> = ({
  icon: Icon,
  title,
  badge,
  description,
  actions,
}) => {
  return (
    <div className="bg-white border-b border-slate-200 shrink-0 select-none">
      <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 rounded-2xl text-white shadow-sm shadow-blue-200 shrink-0">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{title}</h1>
              {badge && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {badge}
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-slate-500 mt-0.5">
                {description}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex items-center gap-2.5">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
