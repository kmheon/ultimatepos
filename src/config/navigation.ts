import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Wrench, 
  Receipt, 
  Package, 
  Truck, 
  Users, 
  Landmark, 
  BarChart3, 
  Users2, 
  UserCheck, 
  Puzzle, 
  Layers, 
  Settings, 
  Shield,
  CreditCard,
  Building2,
  FileSpreadsheet,
  Boxes,
  RotateCcw,
  Percent,
  SlidersHorizontal,
  ArrowLeftRight,
  Barcode,
  CalendarCheck,
  Clock,
  Banknote,
  Tag,
  CheckSquare,
  Sparkles,
  ShoppingBag,
  Database
} from 'lucide-react';
import { ActiveTab } from '../types';

export interface NavigationSubItem {
  name: string;
  tab: ActiveTab;
  badge?: string | number;
  badgeColor?: string;
  action?: string;
  subTab?: string;
  requiredRoles?: string[];
  children?: NavigationSubItem[];
}

export interface NavigationMenuItem {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  tab?: ActiveTab;
  badge?: string | number;
  badgeColor?: string;
  requiredRoles?: string[];
  subItems?: NavigationSubItem[];
}

export interface NavigationContextValues {
  cartCount?: number;
  lowStockCount?: number;
  activeRepairsCount?: number;
  activeQuotesCount?: number;
  userRole?: string;
}

export const AUTHORIZED_SYSTEM_ADMIN_ROLES = [
  'Super Administrator',
  'System Administrator',
  'IT Administrator',
  'Admin'
];

/**
 * Enterprise Nebula ERP Centralized Navigation Architecture
 * Follows Clean Architecture to decouple UI representation from business domain logic.
 */
export const buildNavigationMenu = (ctx: NavigationContextValues = {}): NavigationMenuItem[] => {
  const {
    cartCount = 0,
    lowStockCount = 0,
    activeRepairsCount = 0,
    activeQuotesCount = 0,
    userRole = 'System Administrator'
  } = ctx;

  const isSysAdmin = AUTHORIZED_SYSTEM_ADMIN_ROLES.includes(userRole);

  const menu: NavigationMenuItem[] = [
    // 1. Dashboard
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: LayoutDashboard,
      tab: 'dashboard',
    },

    // 2. POS Terminal
    {
      id: 'pos',
      title: 'POS Terminal',
      icon: ShoppingCart,
      tab: 'pos',
      badge: cartCount > 0 ? `${cartCount} Cart` : 'Instant',
      badgeColor: cartCount > 0 ? 'bg-emerald-500 text-white font-bold' : 'bg-blue-100 text-blue-700',
    },

    // 3. Service Management
    {
      id: 'service_mgmt',
      title: 'Service Management',
      icon: Wrench,
      tab: 'services',
      badge: activeRepairsCount > 0 ? `${activeRepairsCount} Active` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 font-bold border border-amber-300',
      subItems: [
        { name: 'Dashboard', tab: 'services', subTab: 'dashboard' },
        { name: 'Requests', tab: 'services', subTab: 'requests', badge: activeRepairsCount > 0 ? activeRepairsCount : undefined, badgeColor: 'bg-amber-500 text-white' },
        { name: 'Work Orders', tab: 'services', subTab: 'work_orders' },
        { name: 'Technicians', tab: 'services', subTab: 'technicians' },
        { name: 'Schedule', tab: 'services', subTab: 'schedule' },
        { name: 'Reports', tab: 'services', subTab: 'reports' },
      ],
    },

    // 4. Sales (Renamed from Sell & Invoicing)
    {
      id: 'sales',
      title: 'Sales',
      icon: Receipt,
      tab: 'sales',
      badge: activeQuotesCount > 0 ? `${activeQuotesCount} Quotes` : undefined,
      badgeColor: 'bg-sky-100 text-sky-800 font-bold',
      subItems: [
        { name: 'Dashboard', tab: 'sales' },
        { name: 'POS', tab: 'pos' },
        { name: 'Sales Orders', tab: 'orders' },
        { name: 'Quotations', tab: 'quotations', badge: activeQuotesCount > 0 ? activeQuotesCount : undefined, badgeColor: 'bg-sky-100 text-sky-800' },
        { name: 'Invoices', tab: 'invoices' },
        { name: 'Returns', tab: 'returns' },
        { name: 'Shipments', tab: 'sales' },
        { name: 'Discounts', tab: 'sales' },
        { name: 'Import Sales', tab: 'import_export' },
        { name: 'Reports', tab: 'reports', subTab: 'sales' },
      ],
    },

    // 5. Inventory (Renamed from Products & Catalog; Merged Stock Transfers & Adjustments)
    {
      id: 'inventory',
      title: 'Inventory',
      icon: Package,
      tab: 'products',
      badge: lowStockCount > 0 ? `${lowStockCount} Low` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 border border-amber-300',
      subItems: [
        { name: 'Dashboard', tab: 'products' },
        { name: 'Products', tab: 'products' },
        { name: 'Categories', tab: 'products' },
        { name: 'Brands', tab: 'products' },
        { name: 'Units', tab: 'products' },
        { name: 'Variations', tab: 'products' },
        { name: 'Warranties', tab: 'products' },
        { name: 'Warehouses', tab: 'settings' },
        { name: 'Opening Stock', tab: 'import_export' },
        { name: 'Stock Transfers', tab: 'transfers' },
        { name: 'Stock Adjustments', tab: 'adjustments' },
        { name: 'Price Management', tab: 'products' },
        { name: 'Barcode & Labels', tab: 'labels' },
        { name: 'Import Products', tab: 'import_export' },
        { name: 'Reports', tab: 'reports', subTab: 'inventory' },
      ],
    },

    // 6. Procurement (Renamed from Purchases & Supply)
    {
      id: 'procurement',
      title: 'Procurement',
      icon: Truck,
      tab: 'purchases',
      subItems: [
        { name: 'Dashboard', tab: 'purchases' },
        { name: 'Purchase Requisitions', tab: 'purchases' },
        { name: 'Purchase Orders', tab: 'purchases' },
        { name: 'Goods Receipts', tab: 'purchases' },
        { name: 'Purchases', tab: 'purchases' },
        { name: 'Purchase Returns', tab: 'purchases' },
        { name: 'Vendors', tab: 'contacts' },
        { name: 'Reports', tab: 'reports', subTab: 'procurement' },
      ],
    },

    // 7. CRM (Renamed from Contacts & CRM)
    {
      id: 'crm',
      title: 'CRM',
      icon: Users,
      tab: 'contacts',
      subItems: [
        { name: 'Dashboard', tab: 'contacts' },
        { name: 'Customers', tab: 'contacts' },
        { name: 'Suppliers', tab: 'contacts' },
        { name: 'Customer Groups', tab: 'contacts' },
        { name: 'Leads (placeholder)', tab: 'contacts', badge: 'Future', badgeColor: 'bg-slate-100 text-slate-600' },
        { name: 'Import Contacts', tab: 'import_export' },
        { name: 'Reports', tab: 'reports', subTab: 'crm' },
      ],
    },

    // 8. Finance (Merged Payment Accounts & Expenses; Prepared for Banking, Tax, Assets, Budgets)
    {
      id: 'finance',
      title: 'Finance',
      icon: Landmark,
      tab: 'accounts',
      subItems: [
        { name: 'Dashboard', tab: 'accounts' },
        { name: 'Banking', tab: 'accounts' },
        { name: 'Payments', tab: 'accounts' },
        { name: 'Expenses', tab: 'expenses' },
        { name: 'Accounting', tab: 'accounts' },
        { name: 'Tax Management', tab: 'settings' },
        { name: 'Asset Management', tab: 'accounts', badge: 'Future', badgeColor: 'bg-slate-100 text-slate-600' },
        { name: 'Budgets (placeholder)', tab: 'accounts', badge: 'Future', badgeColor: 'bg-slate-100 text-slate-600' },
        { name: 'Reports', tab: 'reports', subTab: 'finance' },
      ],
    },

    // 9. Reports & Analytics (Categorized Report Groups)
    {
      id: 'reports',
      title: 'Reports & Analytics',
      icon: BarChart3,
      tab: 'reports',
      subItems: [
        { name: 'Executive Dashboard', tab: 'reports', subTab: 'pnl' },
        { name: 'Sales Reports', tab: 'reports', subTab: 'sales_by_product' },
        { name: 'Procurement Reports', tab: 'reports', subTab: 'procurement' },
        { name: 'Inventory Reports', tab: 'reports', subTab: 'inventory' },
        { name: 'CRM Reports', tab: 'reports', subTab: 'crm' },
        { name: 'Finance Reports', tab: 'reports', subTab: 'finance' },
        { name: 'Service Reports', tab: 'reports', subTab: 'service' },
        { name: 'HR Reports', tab: 'reports', subTab: 'hr' },
        { name: 'Audit Reports', tab: 'reports', subTab: 'audit' },
      ],
    },

    // 10. HR & Team
    {
      id: 'hrm',
      title: 'HR & Team',
      icon: Users2,
      tab: 'hrm',
      subItems: [
        { name: 'Dashboard', tab: 'hrm' },
        { name: 'Attendance', tab: 'hrm' },
        { name: 'Leave Management', tab: 'hrm' },
        { name: 'Payroll', tab: 'hrm' },
        { name: 'Departments', tab: 'hrm' },
      ],
    },

    // 11. User Management
    {
      id: 'users',
      title: 'User Management',
      icon: UserCheck,
      tab: 'users',
      subItems: [
        { name: 'Users', tab: 'users' },
        { name: 'Roles & Permissions', tab: 'users' },
        { name: 'Commission Agents', tab: 'users' },
      ],
    },

    // 12. Marketplace (Renamed from Modules & Addons)
    {
      id: 'marketplace',
      title: 'Marketplace',
      icon: Puzzle,
      tab: 'modules',
      subItems: [
        { name: 'Installed Modules', tab: 'modules' },
        { name: 'Browse Marketplace', tab: 'modules' },
        { name: 'Licenses', tab: 'modules', badge: 'Future', badgeColor: 'bg-slate-100 text-slate-600' },
        { name: 'Updates', tab: 'modules', badge: 'Future', badgeColor: 'bg-slate-100 text-slate-600' },
      ],
    },

    // 13. Integrations (Replaced WooCommerce Sync with generic Integrations hub)
    {
      id: 'integrations',
      title: 'Integrations',
      icon: Layers,
      tab: 'woocommerce',
      subItems: [
        { name: 'WooCommerce', tab: 'woocommerce' },
        { name: 'Shopify (placeholder)', tab: 'woocommerce', badge: 'Future', badgeColor: 'bg-slate-100 text-slate-600' },
        { name: 'API Keys', tab: 'settings', badge: 'Future', badgeColor: 'bg-slate-100 text-slate-600' },
        { name: 'Webhooks', tab: 'settings', badge: 'Future', badgeColor: 'bg-slate-100 text-slate-600' },
        { name: 'Email', tab: 'settings', badge: 'Future', badgeColor: 'bg-slate-100 text-slate-600' },
        { name: 'SMS', tab: 'settings', badge: 'Future', badgeColor: 'bg-slate-100 text-slate-600' },
        { name: 'WhatsApp', tab: 'settings', badge: 'Future', badgeColor: 'bg-slate-100 text-slate-600' },
        { name: 'Payment Gateways', tab: 'settings', badge: 'Future', badgeColor: 'bg-slate-100 text-slate-600' },
      ],
    },

    // 14. Settings (Business Profile & Configuration)
    {
      id: 'settings',
      title: 'Settings',
      icon: Settings,
      tab: 'settings',
      subItems: [
        { name: 'Business Profile', tab: 'settings' },
        { name: 'Branches', tab: 'settings' },
        { name: 'Warehouses', tab: 'settings' },
        { name: 'Financial Settings', tab: 'settings' },
        { name: 'Tax Rules', tab: 'settings' },
        { name: 'Invoice Settings', tab: 'settings' },
        { name: 'Barcode Settings', tab: 'settings' },
        { name: 'Printers & POS', tab: 'settings' },
        { name: 'Theme & Appearance', tab: 'settings' },
        { name: 'Notifications', tab: 'settings' },
        { name: 'Localization', tab: 'settings' },
      ],
    },

    // 15. System Administration (Privileged Tools & Governance)
    {
      id: 'system_admin',
      title: 'System Administration',
      icon: Shield,
      tab: 'system_admin',
      badge: 'Admin Only',
      badgeColor: 'bg-slate-800 text-slate-100 font-bold',
      requiredRoles: AUTHORIZED_SYSTEM_ADMIN_ROLES,
      subItems: [
        { name: 'System Overview', tab: 'system_admin' },
        { name: 'System Health', tab: 'system_health' },
        { name: 'Data Migration', tab: 'data_migration', badge: '30 Sources', badgeColor: 'bg-blue-100 text-blue-800 font-bold' },
        { name: 'Backup & Restore', tab: 'backup_restore', badge: 'Vault', badgeColor: 'bg-emerald-100 text-emerald-800 font-bold' },
        { name: 'Import / Export', tab: 'import_export' },
        { name: 'Database Utilities', tab: 'database_utilities', badge: 'Future', badgeColor: 'bg-slate-100 text-slate-600' },
        { name: 'Audit Logs', tab: 'sys_audit_logs', badge: 'Future', badgeColor: 'bg-slate-100 text-slate-600' },
        { name: 'Scheduler & Jobs', tab: 'scheduler_jobs', badge: 'Future', badgeColor: 'bg-slate-100 text-slate-600' },
        { name: 'System Maintenance', tab: 'system_maintenance', badge: 'Future', badgeColor: 'bg-slate-100 text-slate-600' },
        { name: 'Developer Tools', tab: 'system_admin', badge: 'Future', badgeColor: 'bg-slate-100 text-slate-600' },
      ],
    },
  ];

  return menu;
};

/**
 * Returns which primary sidebar section ID corresponds to the given active tab
 */
export const getParentSectionIdForTab = (tab: ActiveTab): string => {
  switch (tab) {
    case 'dashboard':
      return 'dashboard';
    case 'pos':
      return 'pos';
    case 'services':
    case 'repairs':
      return 'service_mgmt';
    case 'sales':
    case 'quotations':
    case 'returns':
      return 'sales';
    case 'products':
    case 'labels':
    case 'transfers':
    case 'adjustments':
      return 'inventory';
    case 'purchases':
      return 'procurement';
    case 'contacts':
      return 'crm';
    case 'accounts':
    case 'expenses':
      return 'finance';
    case 'reports':
      return 'reports';
    case 'hrm':
      return 'hrm';
    case 'users':
      return 'users';
    case 'modules':
      return 'marketplace';
    case 'woocommerce':
      return 'integrations';
    case 'settings':
      return 'settings';
    case 'system_admin':
    case 'data_migration':
    case 'backup_restore':
    case 'import_export':
    case 'database_utilities':
    case 'system_maintenance':
    case 'sys_audit_logs':
    case 'system_health':
    case 'scheduler_jobs':
    case 'import':
    case 'backup':
    case 'data_management':
    case 'database_maintenance':
    case 'data_cleanup':
    case 'archive_center':
    case 'audit_recovery':
      return 'system_admin';
    default:
      return 'dashboard';
  }
};

/**
 * Breadcrumb metadata resolution for any tab
 */
export const getBreadcrumbPath = (tab: ActiveTab): { label: string; tab?: ActiveTab }[] => {
  const sectionId = getParentSectionIdForTab(tab);
  
  const sectionLabels: Record<string, string> = {
    dashboard: 'Dashboard',
    pos: 'POS Terminal',
    service_mgmt: 'Service Management',
    sales: 'Sales',
    inventory: 'Inventory',
    procurement: 'Procurement',
    crm: 'CRM',
    finance: 'Finance',
    reports: 'Reports & Analytics',
    hrm: 'HR & Team',
    users: 'User Management',
    marketplace: 'Marketplace',
    integrations: 'Integrations',
    settings: 'Settings',
    system_admin: 'System Administration',
  };

  const currentLabels: Partial<Record<ActiveTab, string>> = {
    dashboard: 'Overview',
    pos: 'Point of Sale',
    services: 'Service Operations',
    repairs: 'Work Orders',
    sales: 'Invoices & Orders',
    quotations: 'Quotations',
    returns: 'Sales Returns',
    products: 'Products & Catalog',
    labels: 'Barcode & Labels',
    transfers: 'Stock Transfers',
    adjustments: 'Stock Adjustments',
    purchases: 'Purchases & Supply',
    contacts: 'Contacts & Directory',
    accounts: 'Payment Accounts',
    expenses: 'Expense Management',
    reports: 'Business Intelligence',
    hrm: 'Workforce & HR',
    users: 'Users & Roles',
    modules: 'Installed Modules',
    woocommerce: 'Store Connectors',
    settings: 'Business Configuration',
    system_admin: 'System Admin Suite',
  };

  const parentLabel = sectionLabels[sectionId] || 'System';
  const childLabel = currentLabels[tab] || 'Console';

  if (parentLabel === childLabel) {
    return [{ label: parentLabel }];
  }

  return [
    { label: parentLabel },
    { label: childLabel, tab }
  ];
};
