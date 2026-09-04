import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard,
  ShoppingCart,
  Wrench,
  Receipt,
  Truck,
  Package,
  Users,
  Landmark,
  Users2,
  BarChart3,
  UserCheck,
  Puzzle,
  Layers,
  Settings,
  Shield,
  Search,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { updateBrowserURL } from '../../utils/navigationRouter';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export interface ModuleSubPage {
  id: string;
  label: string;
}

export interface ERPModuleItem {
  id: string;
  title: string;
  tab: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeColor?: string;
  subPages?: ModuleSubPage[];
}

export const resolveParentModule = (tab: string): string => {
  if (!tab) return 'dashboard';
  const clean = tab.toLowerCase().replace(/_/g, '-');

  if (['dashboard', 'overview'].includes(clean)) return 'dashboard';
  if (['pos', 'terminal'].includes(clean)) return 'pos';
  if (['services', 'service', 'repairs', 'repair'].includes(clean)) return 'service';
  if (['sales', 'sale', 'orders', 'invoices', 'quotations', 'returns'].includes(clean)) return 'sales';
  if (['purchases', 'purchase', 'procurement', 'requisitions', 'suppliers'].includes(clean)) return 'purchases';
  if (['inventory', 'products', 'product', 'categories', 'brands', 'stock', 'transfers', 'adjustments', 'labels'].includes(clean)) return 'inventory';
  if (['crm', 'contacts', 'contact', 'customers', 'customer', 'organizations', 'leads', 'projects'].includes(clean)) return 'crm';
  if (['finance', 'accounts', 'account', 'expenses', 'expense', 'banking', 'registers', 'accounting'].includes(clean)) return 'finance';
  if (['hrm', 'hr', 'attendance', 'leaves', 'payroll', 'departments', 'essentials'].includes(clean)) return 'hrm';
  if (['reports', 'report', 'analytics', 'pnl'].includes(clean)) return 'reports';
  if (['users', 'user', 'roles'].includes(clean)) return 'users';
  if (['marketplace', 'modules', 'module'].includes(clean)) return 'marketplace';
  if (['integrations', 'integration', 'woocommerce'].includes(clean)) return 'integrations';
  if (['settings', 'setting', 'configuration'].includes(clean)) return 'settings';
  if ([
    'system-admin', 'system_admin', 'system', 'admin',
    'data-migration', 'data_migration', 'backup-restore', 'backup_restore',
    'import-export', 'import_export', 'database-utilities', 'database_utilities',
    'system-maintenance', 'system_maintenance', 'sys-audit-logs', 'sys_audit_logs',
    'system-health', 'system_health', 'scheduler-jobs', 'scheduler_jobs',
    'import', 'backup', 'data_management', 'database_maintenance',
    'data_cleanup', 'archive_center', 'audit_recovery'
  ].includes(clean)) {
    return 'system_admin';
  }

  return tab;
};

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
  const { activeTab, setActiveTab, products, cart, repairJobSheets } = usePOS();
  const [searchFilter, setSearchFilter] = useState('');
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  const lowStockCount = products.filter(p => p.currentStock <= p.alertQuantity).length;
  const activeRepairsCount = repairJobSheets.filter(r => r.status === 'pending' || r.status === 'diagnosing' || r.status === 'awaiting_parts').length;

  const currentActiveModule = resolveParentModule(activeTab);

  const modulesList: ERPModuleItem[] = useMemo(() => [
    {
      id: 'dashboard',
      title: 'Dashboard',
      tab: 'dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'pos',
      title: 'Point of Sale (POS)',
      tab: 'pos',
      icon: ShoppingCart,
      badge: cart.length > 0 ? cart.length : undefined,
      badgeColor: 'bg-emerald-500 text-white',
    },
    {
      id: 'service',
      title: 'Service Management',
      tab: 'service',
      icon: Wrench,
      badge: activeRepairsCount > 0 ? activeRepairsCount : undefined,
      badgeColor: 'bg-amber-500 text-white',
      subPages: [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'requests', label: 'Requests' },
        { id: 'work_orders', label: 'Work Orders' },
        { id: 'technicians', label: 'Technicians' },
        { id: 'schedule', label: 'Schedule' },
        { id: 'reports', label: 'Analytics' },
      ]
    },
    {
      id: 'sales',
      title: 'Sales',
      tab: 'sales',
      icon: Receipt,
      subPages: [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'pos', label: 'POS Terminal' },
        { id: 'orders', label: 'Orders' },
        { id: 'quotations', label: 'Quotations' },
        { id: 'invoices', label: 'Invoices' },
        { id: 'returns', label: 'Returns' },
        { id: 'reports', label: 'Reports' },
      ]
    },
    {
      id: 'purchases',
      title: 'Purchases',
      tab: 'purchases',
      icon: Truck,
      subPages: [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'orders', label: 'Purchase Orders' },
        { id: 'requisitions', label: 'Requisitions' },
        { id: 'suppliers', label: 'Suppliers' },
        { id: 'expenses', label: 'Expenses' },
        { id: 'reports', label: 'Reports' },
      ]
    },
    {
      id: 'inventory',
      title: 'Inventory',
      tab: 'inventory',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} Low` : undefined,
      badgeColor: 'bg-rose-500 text-white',
      subPages: [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'products', label: 'Products' },
        { id: 'categories', label: 'Categories' },
        { id: 'brands', label: 'Brands' },
        { id: 'stock', label: 'Stock' },
        { id: 'transfers', label: 'Transfers' },
        { id: 'adjustments', label: 'Adjustments' },
        { id: 'reports', label: 'Reports' },
      ]
    },
    {
      id: 'crm',
      title: 'CRM',
      tab: 'crm',
      icon: Users,
      subPages: [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'customers', label: 'Customers' },
        { id: 'organizations', label: 'Organizations' },
        { id: 'contacts', label: 'Contacts' },
        { id: 'leads', label: 'Leads' },
        { id: 'projects', label: 'Projects' },
        { id: 'reports', label: 'Reports' },
      ]
    },
    {
      id: 'finance',
      title: 'Finance',
      tab: 'finance',
      icon: Landmark,
      subPages: [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'banking', label: 'Banking & Accounts' },
        { id: 'expenses', label: 'Expenses' },
        { id: 'registers', label: 'Cash Registers' },
        { id: 'accounting', label: 'Accounting' },
        { id: 'reports', label: 'Reports' },
      ]
    },
    {
      id: 'hrm',
      title: 'HRM',
      tab: 'hrm',
      icon: Users2,
      subPages: [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'employees', label: 'Employees' },
        { id: 'attendance', label: 'Attendance' },
        { id: 'leaves', label: 'Leaves' },
        { id: 'payroll', label: 'Payroll' },
        { id: 'departments', label: 'Departments' },
        { id: 'reports', label: 'Reports' },
      ]
    },
    {
      id: 'reports',
      title: 'Reports',
      tab: 'reports',
      icon: BarChart3,
    },
    {
      id: 'users',
      title: 'User Management',
      tab: 'users',
      icon: UserCheck,
    },
    {
      id: 'marketplace',
      title: 'Marketplace',
      tab: 'marketplace',
      icon: Puzzle,
    },
    {
      id: 'integrations',
      title: 'Integrations',
      tab: 'integrations',
      icon: Layers,
    },
    {
      id: 'settings',
      title: 'Settings',
      tab: 'settings',
      icon: Settings,
      subPages: [
        { id: 'business', label: 'Business' },
        { id: 'locations', label: 'Locations' },
        { id: 'financial', label: 'Financial' },
        { id: 'taxes', label: 'Taxes' },
        { id: 'pos', label: 'POS' },
        { id: 'invoices', label: 'Invoices' },
        { id: 'integrations', label: 'Integrations' },
        { id: 'appearance', label: 'Appearance' },
      ]
    },
    {
      id: 'system_admin',
      title: 'System Administration',
      tab: 'system_admin',
      icon: Shield,
      badge: 'Vault',
      badgeColor: 'bg-slate-800 text-slate-200',
      subPages: [
        { id: 'overview', label: 'Overview' },
        { id: 'data_migration', label: 'Data Migration' },
        { id: 'backup_restore', label: 'Backup & Restore' },
        { id: 'import_export', label: 'Import/Export' },
        { id: 'database_utilities', label: 'Database Utilities' },
        { id: 'system_maintenance', label: 'Maintenance' },
        { id: 'sys_audit_logs', label: 'Audit Logs' },
        { id: 'system_health', label: 'Health' },
        { id: 'scheduler_jobs', label: 'Scheduler' },
      ]
    },
  ], [cart.length, activeRepairsCount, lowStockCount]);

  const filteredModules = useMemo(() => {
    if (!searchFilter.trim()) return modulesList;
    const q = searchFilter.toLowerCase().trim();
    return modulesList.filter(m => m.title.toLowerCase().includes(q));
  }, [modulesList, searchFilter]);

  const handleModuleClick = (mod: ERPModuleItem) => {
    // Clicking parent module opens module dashboard
    setActiveTab(mod.tab as any);
    updateBrowserURL(mod.id, 'dashboard');
    // Toggle expand state
    setExpandedModules(prev => ({ ...prev, [mod.id]: !prev[mod.id] }));
  };

  const handleSubPageClick = (mod: ERPModuleItem, subId: string) => {
    setActiveTab(mod.tab as any);
    updateBrowserURL(mod.id, subId);
  };

  return (
    <aside
      className={`bg-white border-r border-slate-200 flex flex-col transition-all duration-300 z-20 select-none ${
        isCollapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Search menu filter (when expanded) */}
      {!isCollapsed && (
        <div className="p-3 border-b border-slate-100">
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl text-xs text-slate-600 focus-within:ring-2 focus-within:ring-blue-500">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search ERP modules..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="bg-transparent border-none focus:outline-none w-full text-xs"
            />
            {searchFilter && (
              <button 
                type="button"
                onClick={() => setSearchFilter('')} 
                className="text-slate-400 hover:text-slate-700 text-[10px] font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* Nav List with modules and sub-pages */}
      <div className="p-2.5 flex flex-col gap-1 flex-1 overflow-y-auto">
        {filteredModules.map(item => {
          const Icon = item.icon;
          const isItemActive = currentActiveModule === item.id;
          const isExpanded = isItemActive || expandedModules[item.id];
          const hasSubPages = item.subPages && item.subPages.length > 0;

          return (
            <div key={item.id} className="flex flex-col">
              <button
                type="button"
                onClick={() => handleModuleClick(item)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer group ${
                  isItemActive
                    ? 'bg-blue-50 text-blue-800 font-bold'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                title={isCollapsed ? item.title : undefined}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                      isItemActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-500 group-hover:text-slate-800 group-hover:bg-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  {!isCollapsed && <span className="truncate">{item.title}</span>}
                </div>

                {!isCollapsed && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.badge !== undefined && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-slate-100 text-slate-700'}`}>
                        {item.badge}
                      </span>
                    )}
                    {hasSubPages && (
                      isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                )}
              </button>

              {/* Sub-pages list when expanded and not collapsed */}
              {!isCollapsed && hasSubPages && isExpanded && (
                <div className="ml-9 pl-2 border-l border-slate-200 my-1 flex flex-col gap-1">
                  {item.subPages!.map(sub => {
                    const isSubActive = isItemActive && (window.location.pathname.includes(sub.id) || window.location.hash.includes(sub.id));
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => handleSubPageClick(item, sub.id)}
                        className={`text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                          isSubActive
                            ? 'text-blue-600 font-bold bg-blue-50/60'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        {sub.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer / Store indicator */}
      {!isCollapsed && (
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Store Edition</div>
          <div className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Nebula ERP Enterprise
          </div>
        </div>
      )}
    </aside>
  );
};
