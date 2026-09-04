import React, { useState } from 'react';
import { LucideIcon } from 'lucide-react';

export interface NebulaWorkspaceItem {
  id: string;
  label: string;
  icon: LucideIcon;
  description?: string;
  priority?: number;
  badge?: string | number;
}

interface NebulaWorkspaceTabsProps {
  workspaces: NebulaWorkspaceItem[];
  activeWorkspace: string;
  onWorkspaceChange: (id: string) => void;
}

export const NebulaWorkspaceTabs: React.FC<NebulaWorkspaceTabsProps> = ({
  workspaces,
  activeWorkspace,
  onWorkspaceChange,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (!workspaces || workspaces.length === 0) return null;

  const sorted = [...workspaces].sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center gap-2 select-none shrink-0 overflow-hidden">
      <div className="flex items-center gap-1.5 flex-wrap w-full">
        {sorted.map((ws, index) => {
          const Icon = ws.icon;
          const isActive = activeWorkspace === ws.id;
          const isAlwaysExpanded = isActive || index === 0 || (ws.priority !== undefined && ws.priority <= 3);

          return (
            <div
              key={ws.id}
              className="relative"
              onMouseEnter={() => setHoveredId(ws.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
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
                {ws.badge !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'
                  }`}>
                    {ws.badge}
                  </span>
                )}
              </button>

              {!isAlwaysExpanded && hoveredId === ws.id && ws.description && (
                <div className="absolute top-full left-0 mt-1.5 z-30 bg-slate-900 text-white text-[11px] rounded-xl p-2.5 shadow-xl w-48 pointer-events-none animate-fade-in">
                  <div className="font-bold mb-0.5">{ws.label}</div>
                  <div className="text-slate-300 text-[10px] leading-tight">{ws.description}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
