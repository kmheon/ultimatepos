import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex items-center space-x-2 text-xs text-slate-500 py-2 px-6 bg-white border-b border-slate-100">
      <button 
        type="button" 
        className="flex items-center hover:text-slate-900 transition-colors cursor-pointer"
      >
        <Home className="w-3.5 h-3.5" />
      </button>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          {item.onClick ? (
            <button
              type="button"
              onClick={item.onClick}
              className="hover:text-blue-600 transition-colors font-medium cursor-pointer"
            >
              {item.label}
            </button>
          ) : (
            <span className="font-semibold text-slate-800">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
