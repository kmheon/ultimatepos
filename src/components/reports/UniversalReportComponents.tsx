import React, { useState, useMemo } from 'react';
import { 
  Download, 
  Printer, 
  Mail, 
  Filter, 
  FileText, 
  Boxes, 
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Check,
  Calendar,
  Share2,
  Bookmark
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

// ==========================================
// 1. UNIVERSAL REPORT HEADER
// ==========================================
interface UniversalReportHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  description: string;
  badge?: string;
  onExport?: (format: 'csv' | 'excel' | 'print' | 'email') => void;
  onCustomExport?: () => void;
  onSchedule?: () => void;
  onSaveView?: () => void;
  onShare?: () => void;
}

export const UniversalReportHeader: React.FC<UniversalReportHeaderProps> = ({
  icon: Icon,
  title,
  subtitle,
  description,
  badge = 'Universal Reports Framework',
  onExport,
  onCustomExport,
  onSchedule,
  onSaveView,
  onShare,
}) => {
  const [isExportOpen, setIsExportOpen] = useState(false);

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-5 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl text-blue-600 shadow-2xs shrink-0">
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
              {badge}
            </span>
            {subtitle && <span className="text-xs font-bold text-slate-500">• {subtitle}</span>}
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">{title}</h1>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {onSaveView && (
          <button 
            onClick={onSaveView}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            <Bookmark className="w-3.5 h-3.5 text-slate-500" />
            <span>Save View</span>
          </button>
        )}
        {onSchedule && (
          <button 
            onClick={onSchedule}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Schedule</span>
          </button>
        )}
        {onShare && (
          <button 
            onClick={onShare}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Share</span>
          </button>
        )}

        {/* Export Menu Dropdown */}
        {onExport && (
          <div className="relative">
            <button
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            {isExportOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs font-semibold text-slate-700">
                <button onClick={() => { setIsExportOpen(false); onExport('csv'); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer">
                  <FileText className="w-3.5 h-3.5 text-blue-600" /> Export as CSV
                </button>
                <button onClick={() => { setIsExportOpen(false); onExport('excel'); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer">
                  <Boxes className="w-3.5 h-3.5 text-emerald-600" /> Export as Excel (.xls)
                </button>
                <button onClick={() => { setIsExportOpen(false); onExport('print'); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer">
                  <Printer className="w-3.5 h-3.5 text-slate-600" /> Print Statement
                </button>
                <button onClick={() => { setIsExportOpen(false); onExport('email'); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer">
                  <Mail className="w-3.5 h-3.5 text-amber-600" /> Email Report
                </button>
                {onCustomExport && (
                  <>
                    <div className="border-t border-slate-100 my-1"></div>
                    <button 
                      onClick={() => { setIsExportOpen(false); onCustomExport(); }} 
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-blue-600 font-bold cursor-pointer"
                    >
                      <Filter className="w-3.5 h-3.5" /> Custom Export...
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 2. UNIVERSAL REPORT CATEGORY TABS
// ==========================================
export interface CategoryTabItem {
  id: string;
  label: string;
  icon: LucideIcon;
  description?: string;
  badge?: string | number;
}

interface UniversalReportCategoryTabsProps {
  tabs: CategoryTabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export const UniversalReportCategoryTabs: React.FC<UniversalReportCategoryTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  if (!tabs || tabs.length === 0) return null;

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center gap-2 select-none shrink-0 overflow-x-auto scrollbar-none">
      <div className="flex items-center gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs shadow-blue-200'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// 3. UNIVERSAL KPI CARDS
// ==========================================
export interface KPICardData {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  subtext?: string;
  colorClass?: string;
}

interface UniversalKPICardsProps {
  metrics: KPICardData[];
}

export const UniversalKPICards: React.FC<UniversalKPICardsProps> = ({ metrics }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
    {metrics.map((metric, idx) => (
      <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{metric.label}</p>
        <p className={`text-xl font-black mt-1 ${metric.colorClass || 'text-slate-900'}`}>{metric.value}</p>
        {metric.change && (
          <span className={`text-[10px] font-bold flex items-center gap-0.5 mt-1 ${
            metric.changeType === 'positive' ? 'text-emerald-600' : metric.changeType === 'negative' ? 'text-rose-600' : 'text-slate-500'
          }`}>
            {metric.change}
          </span>
        )}
        {metric.subtext && !metric.change && (
          <span className="text-[10px] font-bold text-slate-500 mt-1 block">{metric.subtext}</span>
        )}
      </div>
    ))}
  </div>
);

// ==========================================
// 4. UNIVERSAL REPORT TABLE
// ==========================================
export interface ColumnDef<T> {
  header: string;
  accessorKey: keyof T | string;
  cell?: (item: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}

interface UniversalReportTableProps<T> {
  title?: string;
  subtitle?: string;
  data: T[];
  columns: ColumnDef<T>[];
  searchPlaceholder?: string;
  enableSearch?: boolean;
  rowKey?: keyof T | ((item: T) => string);
  pageSize?: number;
}

export function UniversalReportTable<T>({
  title,
  subtitle,
  data,
  columns,
  searchPlaceholder = 'Search records...',
  enableSearch = true,
  rowKey = 'id' as keyof T,
  pageSize = 10,
}: UniversalReportTableProps<T>) {
  const [filterQuery, setFilterQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

  // Filtering
  const filteredData = useMemo(() => {
    if (!filterQuery) return data;
    return data.filter(item => {
      return Object.values(item as any).some(val => 
        String(val).toLowerCase().includes(filterQuery.toLowerCase())
      );
    });
  }, [data, filterQuery]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = (a as any)[sortColumn];
      const bVal = (b as any)[sortColumn];
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const getRowKey = (item: T, index: number) => {
    if (typeof rowKey === 'function') return rowKey(item);
    if (item[rowKey] !== undefined) return String(item[rowKey]);
    return String(index);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {(title || enableSearch) && (
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {title ? (
            <div>
              <h3 className="text-sm font-bold text-slate-900">{title}</h3>
              {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
          ) : <div />}

          {enableSearch && (
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={filterQuery}
                onChange={e => { setFilterQuery(e.target.value); setCurrentPage(1); }}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
            <tr>
              <th className="py-3 px-4 w-10 text-center">
                <span className="sr-only">Select</span>
              </th>
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  onClick={() => col.sortable && handleSort(String(col.accessorKey))}
                  className={`py-3 px-4 font-bold text-slate-700 ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'} ${col.sortable ? 'cursor-pointer hover:bg-slate-100 select-none' : ''}`}
                >
                  <div className={`flex items-center gap-1 ${col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'}`}>
                    <span>{col.header}</span>
                    {col.sortable && <ArrowUpDown className="w-3 h-3 text-slate-400" />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedData.length > 0 ? (
              paginatedData.map((item, index) => {
                const rKey = getRowKey(item, index);
                const isSelected = selectedRowIds.includes(rKey);

                return (
                  <tr key={rKey} className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}>
                    <td className="py-3 px-4 text-center">
                      <input 
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          setSelectedRowIds(prev => 
                            prev.includes(rKey) ? prev.filter(id => id !== rKey) : [...prev, rKey]
                          );
                        }}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    {columns.map((col, cIdx) => {
                      const val = (item as any)[col.accessorKey];
                      return (
                        <td 
                          key={cIdx} 
                          className={`py-3 px-4 text-slate-800 ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right font-medium' : 'text-left'}`}
                        >
                          {col.cell ? col.cell(item) : (val !== undefined ? String(val) : '—')}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="py-12 text-center text-slate-400 font-semibold">
                  No records found matching your filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>
          Showing <span className="font-bold text-slate-800">{sortedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to <span className="font-bold text-slate-800">{Math.min(currentPage * pageSize, sortedData.length)}</span> of <span className="font-bold text-slate-800">{sortedData.length}</span> entries
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 py-1 font-bold text-slate-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 5. UNIVERSAL EXPORT DROPDOWN
// ==========================================
interface UniversalExportDropdownProps {
  onExport: (format: 'csv' | 'excel' | 'print' | 'email') => void;
  onCustomExport: () => void;
}

export const UniversalExportDropdown: React.FC<UniversalExportDropdownProps> = ({ onExport, onCustomExport }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Export Report</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs font-semibold text-slate-700">
          <button onClick={() => { setIsOpen(false); onExport('csv'); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer">
            <FileText className="w-3.5 h-3.5 text-blue-600" /> Export as CSV
          </button>
          <button onClick={() => { setIsOpen(false); onExport('excel'); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer">
            <Boxes className="w-3.5 h-3.5 text-emerald-600" /> Export as Excel (.xls)
          </button>
          <button onClick={() => { setIsOpen(false); onExport('print'); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer">
            <Printer className="w-3.5 h-3.5 text-slate-600" /> Print Statement
          </button>
          <button onClick={() => { setIsOpen(false); onExport('email'); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer">
            <Mail className="w-3.5 h-3.5 text-amber-600" /> Email Report
          </button>
          <div className="border-t border-slate-100 my-1"></div>
          <button 
            onClick={() => { setIsOpen(false); onCustomExport(); }} 
            className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-blue-600 font-bold cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5" /> Custom Export...
          </button>
        </div>
      )}
    </div>
  );
};

