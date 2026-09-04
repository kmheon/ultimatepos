import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface TimelineItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  icon: LucideIcon;
  iconColor?: string;
  bgColor?: string;
}

interface NebulaTimelineProps {
  items: TimelineItem[];
}

export const NebulaTimeline: React.FC<NebulaTimelineProps> = ({ items }) => {
  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.id} className="relative flex items-start gap-4">
            <div className={`absolute -left-6 p-1.5 rounded-full ${item.bgColor || 'bg-blue-50'} ${item.iconColor || 'text-blue-600'} ring-4 ring-white`}>
              <Icon className="w-3.5 h-3.5" />
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                <span className="text-[10px] text-slate-400 font-medium">{item.timestamp}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
