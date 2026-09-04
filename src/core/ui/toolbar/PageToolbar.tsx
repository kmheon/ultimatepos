import React from 'react';
import { SearchBar } from './SearchBar';
import { FilterBar, FilterOption } from './FilterBar';
import { ExportActions } from './ExportActions';

interface PageToolbarProps {
  searchValue: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;
  filters?: FilterOption[];
  activeFilter?: string;
  onFilterChange?: (id: string) => void;
  onAdvancedFilters?: () => void;
  onExportCSV?: () => void;
  onExportPDF?: () => void;
  onPrint?: () => void;
  extraActions?: React.ReactNode;
}

export const PageToolbar: React.FC<PageToolbarProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filters,
  activeFilter,
  onFilterChange,
  onAdvancedFilters,
  onExportCSV,
  onExportPDF,
  onPrint,
  extraActions,
}) => {
  return (
    <div className="bg-white border-b border-slate-200 px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
        <SearchBar
          value={searchValue}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          className="w-full sm:w-72"
        />
        {filters && activeFilter && onFilterChange && (
          <FilterBar
            filters={filters}
            activeFilter={activeFilter}
            onFilterChange={onFilterChange}
            onAdvancedClick={onAdvancedFilters}
          />
        )}
      </div>
      <div className="flex items-center gap-3 justify-end">
        <ExportActions
          onExportCSV={onExportCSV}
          onExportPDF={onExportPDF}
          onPrint={onPrint}
        />
        {extraActions}
      </div>
    </div>
  );
};
