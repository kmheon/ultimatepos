import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Receipt, 
  Truck, 
  Users, 
  CreditCard, 
  BarChart3, 
  Settings,
  ChevronDown,
  ChevronRight,
  Wrench,
  FileSpreadsheet,
  ArrowLeftRight,
  Barcode,
  RotateCcw,
  UserCheck,
  ShieldCheck,
  Percent,
  SlidersHorizontal,
  Landmark,
  Scale,
  TrendingUp,
  FileText,
  Users2,
  CheckSquare,
  ShoppingBag,
  Database,
  Puzzle,
  Search,
  Tag,
  Boxes,
  Layers,
  Building2,
  CalendarCheck,
  Clock,
  Banknote,
  Send,
  Plus
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { ActiveTab } from '../../types';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface SubMenuItem {
  name: string;
  tab: ActiveTab;
  badge?: string | number;
  badgeColor?: string;
  action?: string;
}

interface MenuItem {
  id: string;
  title: string;
  icon: React.FC<{ className?: string }>;
  tab?: ActiveTab;
  badge?: string | number;
  badgeColor?: string;
  subItems?: SubMenuItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const { activeTab, setActiveTab, products, cart, repairJobSheets, quotations } = usePOS();
  
  const [searchFilter, setSearchFilter] = useState('');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    sell: true,
    products: false,
    repairs: false,
    purchases: false,
    contacts: false,
    accounts: false,
    reports: false,
    hrm: false,
    settings: false,
  });

  const lowStockCount = products.filter(p => p.currentStock <= p.alertQuantity).length;
  const activeRepairsCount = repairJobSheets.filter(r => r.status === 'pending' || r.status === 'diagnosing' || r.status === 'awaiting_parts').length;
  const activeQuotesCount = quotations.filter(q => q.status === 'sent' || q.status === 'draft').length;

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const menuStructure: MenuItem[] = [
    {
      id: 'home',
      title: 'Home / Dashboard',
      icon: LayoutDashboard,
      tab: 'dashboard',
    },
    {
      id: 'pos_direct',
      title: 'POS Terminal',
      icon: ShoppingCart,
      tab: 'pos',
      badge: cart.length > 0 ? `${cart.length} Cart` : 'Instant',
      badgeColor: cart.length > 0 ? 'bg-emerald-500 text-white font-bold' : 'bg-blue-100 text-blue-700',
    },
    {
      id: 'service_mgmt',
      title: 'Service Management',
      icon: Wrench,
      tab: 'services',
      badge: activeRepairsCount > 0 ? `${activeRepairsCount} Active` : 'New',
      badgeColor: activeRepairsCount > 0 ? 'bg-amber-100 text-amber-800 font-bold border border-amber-300' : 'bg-blue-100 text-blue-700 font-semibold',
      subItems: [
        { name: 'Dashboard', tab: 'services' },
        { name: 'Requests', tab: 'services', badge: activeRepairsCount > 0 ? activeRepairsCount : undefined, badgeColor: 'bg-amber-500 text-white' },
        { name: 'Technicians', tab: 'services' },
        { name: 'Schedule', tab: 'services' },
        { name: 'Reports', tab: 'services' },
      ]
    },
    {
      id: 'data_import',
      title: 'Data Migration / Import',
      icon: Database,
      tab: 'import',
      badge: 'UltimatePOS',
      badgeColor: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold',
      subItems: [
        { name: 'Import UltimatePOS Data', tab: 'import' },
        { name: 'SQL Dump Parser', tab: 'import' },
        { name: '1-Click Dataset Sync', tab: 'import' },
      ]
    },
    {
      id: 'sell',
      title: 'Sell & Invoicing',
      icon: Receipt,
      tab: 'sales',
      subItems: [
        { name: 'All sales', tab: 'sales' },
        { name: 'Add Sale (POS)', tab: 'pos' },
        { name: 'List POS Receipts', tab: 'sales' },
        { name: 'Sales Order', tab: 'sales' },
        { name: 'Add Quotation', tab: 'quotations' },
        { name: 'List quotations', tab: 'quotations', badge: activeQuotesCount > 0 ? activeQuotesCount : undefined, badgeColor: 'bg-sky-100 text-sky-800' },
        { name: 'List Sell Return', tab: 'returns' },
        { name: 'Shipments', tab: 'sales' },
        { name: 'Discounts', tab: 'sales' },
        { name: 'Import Sales', tab: 'import' },
      ]
    },
    {
      id: 'products',
      title: 'Products & Catalog',
      icon: Package,
      tab: 'products',
      badge: lowStockCount > 0 ? `${lowStockCount} Low` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 border border-amber-300',
      subItems: [
        { name: 'List Products', tab: 'products' },
        { name: 'Add Product', tab: 'products' },
        { name: 'Update Price', tab: 'products' },
        { name: 'Print Labels', tab: 'labels' },
        { name: 'Variations', tab: 'products' },
        { name: 'Import Products', tab: 'import' },
        { name: 'Import Opening Stock', tab: 'import' },
        { name: 'Selling Price Group', tab: 'products' },
        { name: 'Units', tab: 'products' },
        { name: 'Categories', tab: 'products' },
        { name: 'Brands', tab: 'products' },
        { name: 'Warranties', tab: 'products' },
      ]
    },
    {
      id: 'purchases',
      title: 'Purchases & Supply',
      icon: Truck,
      tab: 'purchases',
      subItems: [
        { name: 'Purchase Requisition', tab: 'purchases' },
        { name: 'Purchase Order', tab: 'purchases' },
        { name: 'List Purchases', tab: 'purchases' },
        { name: 'Add Purchase', tab: 'purchases' },
        { name: 'List Purchase Return', tab: 'purchases' },
      ]
    },
    {
      id: 'contacts',
      title: 'Contacts & CRM',
      icon: Users,
      tab: 'contacts',
      subItems: [
        { name: 'Suppliers', tab: 'contacts' },
        { name: 'Customers', tab: 'contacts' },
        { name: 'Customer Groups', tab: 'contacts' },
        { name: 'Import Contacts', tab: 'import' },
      ]
    },
    {
      id: 'stock_transfers',
      title: 'Stock Transfers',
      icon: ArrowLeftRight,
      tab: 'transfers',
      subItems: [
        { name: 'List Stock Transfers', tab: 'transfers' },
        { name: 'Add Stock Transfer', tab: 'transfers' },
      ]
    },
    {
      id: 'stock_adjustment',
      title: 'Stock Adjustment',
      icon: SlidersHorizontal,
      tab: 'adjustments',
      subItems: [
        { name: 'List Stock Adjustments', tab: 'adjustments' },
        { name: 'Add Stock Adjustment', tab: 'adjustments' },
      ]
    },
    {
      id: 'expenses',
      title: 'Expenses',
      icon: CreditCard,
      tab: 'expenses',
      subItems: [
        { name: 'List Expenses', tab: 'expenses' },
        { name: 'Add Expense', tab: 'expenses' },
        { name: 'Expense Categories', tab: 'expenses' },
      ]
    },
    {
      id: 'accounts',
      title: 'Payment Accounts',
      icon: Landmark,
      tab: 'accounts',
      subItems: [
        { name: 'List Accounts', tab: 'accounts' },
        { name: 'Balance Sheet', tab: 'accounts' },
        { name: 'Trial Balance', tab: 'accounts' },
        { name: 'Cash Flow', tab: 'accounts' },
        { name: 'Payment Account Report', tab: 'accounts' },
      ]
    },
    {
      id: 'reports',
      title: 'Reports & Analytics',
      icon: BarChart3,
      tab: 'reports',
      subItems: [
        { name: 'Profit / Loss Report', tab: 'reports' },
        { name: 'Purchase & Sale', tab: 'reports' },
        { name: 'Tax Report', tab: 'reports' },
        { name: 'Supplier & Customer Report', tab: 'reports' },
        { name: 'Customer Groups Report', tab: 'reports' },
        { name: 'Stock Report', tab: 'reports' },
        { name: 'Lot & Serial Report', tab: 'reports' },
        { name: 'Stock Adjustment Report', tab: 'reports' },
        { name: 'Trending Products', tab: 'reports' },
        { name: 'Items Report', tab: 'reports' },
        { name: 'Product Purchase Report', tab: 'reports' },
        { name: 'Product Sell Report', tab: 'reports' },
        { name: 'Purchase Payment Report', tab: 'reports' },
        { name: 'Sell Payment Report', tab: 'reports' },
        { name: 'Expense Report', tab: 'reports' },
        { name: 'Register Report', tab: 'reports' },
        { name: 'Sales Representative Report', tab: 'reports' },
        { name: 'Activity Log', tab: 'reports' },
      ]
    },
    {
      id: 'user_mgmt',
      title: 'User Management',
      icon: UserCheck,
      tab: 'users',
      subItems: [
        { name: 'Users', tab: 'users' },
        { name: 'Roles & Permissions', tab: 'users' },
        { name: 'Sales Commission Agents', tab: 'users' },
      ]
    },
    {
      id: 'hrm',
      title: 'HRM & Team',
      icon: Users2,
      tab: 'hrm',
      subItems: [
        { name: 'HRM Dashboard', tab: 'hrm' },
        { name: 'Attendance Timeclock', tab: 'hrm' },
        { name: 'Leaves & Time Off', tab: 'hrm' },
        { name: 'Salary Payrolls', tab: 'hrm' },
        { name: 'Departments', tab: 'hrm' },
      ]
    },
    {
      id: 'essentials',
      title: 'Essentials & Notes',
      icon: CheckSquare,
      tab: 'essentials',
      subItems: [
        { name: 'To Do Tasks', tab: 'essentials' },
        { name: 'Documents & Notes', tab: 'essentials' },
        { name: 'Reminders & Alerts', tab: 'essentials' },
      ]
    },
    {
      id: 'woocommerce',
      title: 'WooCommerce Sync',
      icon: ShoppingBag,
      tab: 'woocommerce',
      subItems: [
        { name: 'Storefront Settings', tab: 'woocommerce' },
        { name: 'Push Products', tab: 'woocommerce' },
        { name: 'Fetch Orders', tab: 'woocommerce' },
      ]
    },
    {
      id: 'modules',
      title: 'Modules & Addons',
      icon: Puzzle,
      tab: 'modules',
    },
    {
      id: 'backup',
      title: 'Administer Backup',
      icon: Database,
      tab: 'backup',
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: Settings,
      tab: 'settings',
      subItems: [
        { name: 'Business Settings', tab: 'settings' },
        { name: 'Business Locations', tab: 'settings' },
        { name: 'Invoice Settings', tab: 'settings' },
        { name: 'Barcode Settings', tab: 'settings' },
        { name: 'Receipt Printers', tab: 'settings' },
        { name: 'Tax Rates', tab: 'settings' },
        { name: 'Types of service', tab: 'settings' },
      ]
    },
  ];

  const filteredMenu = searchFilter.trim() === ''
    ? menuStructure
    : menuStructure.filter(m => 
        m.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        m.subItems?.some(s => s.name.toLowerCase().includes(searchFilter.toLowerCase()))
      );

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
              placeholder="Search 92+ menu items..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="bg-transparent border-none focus:outline-none w-full text-xs"
            />
            {searchFilter && (
              <button onClick={() => setSearchFilter('')} className="text-slate-400 hover:text-slate-700 text-[10px] font-bold">
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* Nav List */}
      <div className="p-2.5 flex flex-col gap-1 flex-1 overflow-y-auto">
        {filteredMenu.map(item => {
          const Icon = item.icon;
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isSectionOpen = openSections[item.id] || searchFilter.length > 0;
          const isItemActive = activeTab === item.tab || item.subItems?.some(s => s.tab === activeTab);

          return (
            <div key={item.id} className="space-y-0.5">
              <button
                onClick={() => {
                  if (hasSubItems) {
                    toggleSection(item.id);
                  }
                  if (item.tab) {
                    setActiveTab(item.tab);
                  }
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left group ${
                  isItemActive
                    ? 'bg-blue-50 text-blue-800'
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
                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-slate-100 text-slate-700'}`}>
                        {item.badge}
                      </span>
                    )}
                    {hasSubItems && (
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isSectionOpen ? 'rotate-180 text-blue-600' : ''}`} />
                    )}
                  </div>
                )}
              </button>

              {/* Submenu Dropdown */}
              {!isCollapsed && hasSubItems && isSectionOpen && (
                <div className="ml-7 pl-3 border-l-2 border-slate-200 space-y-0.5 py-1">
                  {item.subItems?.map((sub, sIdx) => {
                    const isSubActive = activeTab === sub.tab;
                    return (
                      <button
                        key={sIdx}
                        onClick={() => setActiveTab(sub.tab)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
                          isSubActive
                            ? 'text-blue-700 font-bold bg-blue-50/70'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                        }`}
                      >
                        <span className="truncate">{sub.name}</span>
                        {sub.badge && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${sub.badgeColor || 'bg-slate-100 text-slate-600'}`}>
                            {sub.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer / Location indicator */}
      {!isCollapsed && (
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Store Edition</div>
          <div className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            UltimatePOS v5.4 Complete
          </div>
        </div>
      )}
    </aside>
  );
};
