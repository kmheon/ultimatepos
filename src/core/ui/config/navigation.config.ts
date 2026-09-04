import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Briefcase, 
  FileText, 
  DollarSign, 
  Settings,
  Wrench
} from 'lucide-react';
import { NebulaWorkspaceItem } from '../navigation/WorkspaceTabs';

export interface ModuleConfig {
  id: string;
  name: string;
  icon: typeof LayoutDashboard;
  description: string;
  defaultWorkspace: string;
  workspaces: NebulaWorkspaceItem[];
}

export const ERP_MODULES: Record<string, ModuleConfig> = {
  inventory: {
    id: 'inventory',
    name: 'Inventory',
    icon: Package,
    description: 'Stock management, warehouse locations & fulfillment',
    defaultWorkspace: 'stock',
    workspaces: [
      { id: 'stock', label: 'Stock Levels', icon: Package, description: 'Live inventory counts & valuation', priority: 1 },
      { id: 'warehouses', label: 'Warehouses', icon: Briefcase, description: 'Multi-location storage facilities', priority: 2 },
      { id: 'transfers', label: 'Transfers', icon: FileText, description: 'Stock movement between depots', priority: 3 },
      { id: 'suppliers', label: 'Suppliers', icon: Users, description: 'Vendor directory & lead times', priority: 4 },
      { id: 'reports', label: 'Reports', icon: DollarSign, description: 'Valuation & shrinkage reports', priority: 5 },
    ],
  },
  sales: {
    id: 'sales',
    name: 'Sales & POS',
    icon: ShoppingCart,
    description: 'Point of sale, orders & customer invoicing',
    defaultWorkspace: 'pos',
    workspaces: [
      { id: 'pos', label: 'POS Register', icon: ShoppingCart, description: 'Active checkout & barcode scanner', priority: 1 },
      { id: 'orders', label: 'Orders', icon: FileText, description: 'Sales orders & fulfillment status', priority: 2 },
      { id: 'invoices', label: 'Invoices', icon: DollarSign, description: 'Billing, payments & AR aging', priority: 3 },
      { id: 'customers', label: 'Customers', icon: Users, description: 'Client CRM & loyalty programs', priority: 4 },
      { id: 'reports', label: 'Reports', icon: LayoutDashboard, description: 'Sales performance analytics', priority: 5 },
    ],
  },
  hrm: {
    id: 'hrm',
    name: 'HR & Payroll',
    icon: Users,
    description: 'Workforce management, attendance & payroll',
    defaultWorkspace: 'employees',
    workspaces: [
      { id: 'executive', label: 'Executive', icon: LayoutDashboard, description: 'Workforce headcount summary', priority: 1 },
      { id: 'attendance', label: 'Attendance', icon: FileText, description: 'Time clocks & punctuality', priority: 2 },
      { id: 'payroll', label: 'Payroll', icon: DollarSign, description: 'Salary disbursements & tax', priority: 3 },
      { id: 'leaves', label: 'Leaves', icon: Briefcase, description: 'Vacation & sick leave approvals', priority: 4 },
      { id: 'employees', label: 'Employees', icon: Users, description: 'Staff profiles & directory', priority: 5 },
    ],
  },
  finance: {
    id: 'finance',
    name: 'Finance & Accounts',
    icon: DollarSign,
    description: 'General ledger, P&L, balance sheet & cash flow',
    defaultWorkspace: 'ledger',
    workspaces: [
      { id: 'ledger', label: 'General Ledger', icon: FileText, description: 'Chart of accounts & journal entries', priority: 1 },
      { id: 'cashflow', label: 'Cash Flow', icon: DollarSign, description: 'Inflows, outflows & liquidity', priority: 2 },
      { id: 'pnl', label: 'P & L', icon: LayoutDashboard, description: 'Profit and loss statements', priority: 3 },
      { id: 'budgets', label: 'Budgets', icon: Briefcase, description: 'Departmental spending allocations', priority: 4 },
    ],
  },
  service: {
    id: 'service',
    name: 'Field Services',
    icon: Wrench,
    description: 'Work orders, technician dispatch & SLA tracking',
    defaultWorkspace: 'tickets',
    workspaces: [
      { id: 'tickets', label: 'Service Tickets', icon: FileText, description: 'Customer service requests & status', priority: 1 },
      { id: 'dispatch', label: 'Dispatch', icon: Users, description: 'Technician routing & scheduling', priority: 2 },
      { id: 'assets', label: 'Asset Fleet', icon: Package, description: 'Equipment & serialized asset tracking', priority: 3 },
      { id: 'slas', label: 'SLAs', icon: LayoutDashboard, description: 'Response time & resolution metrics', priority: 4 },
    ],
  }
};
