import React from 'react';
import { LucideIcon } from 'lucide-react';
import { NebulaTooltip } from '../../core/ui/feedback/NebulaTooltip';

export interface WorkspaceItem {
  id: string;
  label: string;
  icon: LucideIcon;
  description?: string;
  priority?: number; // lower number = higher priority
}

interface WorkspaceNavProps {
  workspaces: WorkspaceItem[];
  activeWorkspace: string;
  onWorkspaceChange: (id: string) => void;
}

export const WorkspaceNav: React.FC<WorkspaceNavProps> = ({
  workspaces,
  activeWorkspace,
  onWorkspaceChange,
}) => {
  if (!workspaces || workspaces.length === 0) return null;

  // Sort by priority (default 99 if undefined)
  const sorted = [...workspaces].sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center gap-2 select-none shrink-0 overflow-hidden">
      <div className="flex items-center gap-1.5 flex-wrap w-full">
        {sorted.map((ws, index) => {
          const Icon = ws.icon;
          const isActive = activeWorkspace === ws.id;
          // Determine if expanded: active, first item, or high priority (top 3)
          const isAlwaysExpanded = isActive || index === 0 || (ws.priority !== undefined && ws.priority <= 3);

          const buttonContent = (
            <button
              type="button"
              onClick={() => onWorkspaceChange(ws.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs shadow-blue-200'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              {isAlwaysExpanded && <span className="truncate">{ws.label}</span>}
            </button>
          );

          return (
            <div key={ws.id} className="relative">
              {!isAlwaysExpanded && ws.description ? (
                <NebulaTooltip title={ws.label} content={ws.description}>
                  {buttonContent}
                </NebulaTooltip>
              ) : (
                buttonContent
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
