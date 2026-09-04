import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface ModuleTabItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string | number;
  badgeColor?: string;
}

interface ModuleHeaderProps {
  icon: LucideIcon;
  title: string;
  badge?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  tabs?: ModuleTabItem[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

export const ModuleHeader: React.FC<ModuleHeaderProps> = ({
  icon: Icon,
  title,
  badge,
  subtitle,
  actions,
}) => {
  return (
    <div className="bg-white border-b border-slate-200 shrink-0 select-none">
      {/* Top Header Bar */}
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
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {actions && (
          <div className="flex items-center gap-2.5">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
