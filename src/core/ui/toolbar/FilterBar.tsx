import React from 'react';
import { Filter, SlidersHorizontal } from 'lucide-react';

export interface FilterOption {
  id: string;
  label: string;
  value: string;
}

interface FilterBarProps {
  filters: FilterOption[];
  activeFilter: string;
  onFilterChange: (id: string) => void;
  onAdvancedClick?: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  activeFilter,
  onFilterChange,
  onAdvancedClick,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1">
      <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
        <Filter className="w-3.5 h-3.5 text-slate-500 ml-2 mr-1" />
        {filters.map((f) => {
          const isActive = activeFilter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onFilterChange(f.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-blue-600 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>
      {onAdvancedClick && (
        <button
          type="button"
          onClick={onAdvancedClick}
          className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
          <span>Filters</span>
        </button>
      )}
    </div>
  );
};
