import React from 'react';
import { LucideIcon, ArrowRight } from 'lucide-react';

interface ActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  iconColor?: string;
  bgColor?: string;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  icon: Icon,
  onClick,
  iconColor = 'text-blue-600',
  bgColor = 'bg-blue-50',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between hover:border-blue-300 hover:shadow-md transition-all text-left cursor-pointer group w-full"
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${bgColor} ${iconColor} shrink-0 group-hover:scale-105 transition-transform`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{title}</h4>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
        <ArrowRight className="w-4 h-4" />
      </div>
    </button>
  );
};
