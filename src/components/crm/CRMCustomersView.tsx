import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  MapPin, 
  DollarSign, 
  ShoppingBag, 
  Eye, 
  Edit, 
  Trash2, 
  AlertCircle, 
  LayoutGrid, 
  Table as TableIcon,
  CreditCard,
  Building
} from 'lucide-react';
import { Contact } from '../../types';
import { usePOS } from '../../context/POSContext';
import { CustomerDrawer } from './CustomerDrawer';

interface CRMCustomersViewProps {
  onOpenAddCustomer: () => void;
  onEditCustomer: (customer: Contact) => void;
}

export const CRMCustomersView: React.FC<CRMCustomersViewProps> = ({
  onOpenAddCustomer,
  onEditCustomer
}) => {
  const { contacts, deleteContact, setSelectedCustomer, setActiveTab, settings, transactions } = usePOS();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [dueFilter, setDueFilter] = useState<'all' | 'due' | 'zero'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [selectedCustomerForDrawer, setSelectedCustomerForDrawer] = useState<Contact | null>(null);

  // Filter only customers
  const customers = contacts.filter(c => c.type === 'customer' || c.type === 'both');

  // Apply search & filters
  const filteredCustomers = customers.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.businessName && c.businessName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.mobile && c.mobile.includes(searchTerm)) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.city && c.city.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (dueFilter === 'due') {
      return (c.totalSaleDue || 0) > 0;
    }
    if (dueFilter === 'zero') {
      return !c.totalSaleDue || c.totalSaleDue <= 0;
    }

    return true;
  });

  // Calculate metrics
  const totalDueAmount = customers.reduce((acc, c) => acc + (c.totalSaleDue || 0), 0);
  const customersWithDue = customers.filter(c => (c.totalSaleDue || 0) > 0).length;
  const vipCustomersCount = customers.filter(c => (c.creditLimit || 0) >= 15000).length;

  const handleStartPOSSale = (customer: Contact) => {
    setSelectedCustomer(customer);
    setActiveTab('pos');
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove customer "${name}"?`)) {
      deleteContact(id);
    }
  };

  return (
    <div className="space-y-6">


      {/* Action Header & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by customer name, store, mobile number, or city..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <select
            value={dueFilter}
            onChange={e => setDueFilter(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Balance Statuses</option>
            <option value="due">Has Outstanding Balance</option>
            <option value="zero">Zero Due / Paid Up</option>
          </select>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onOpenAddCustomer}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs shadow-blue-200 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Customer
          </button>
        </div>
      </div>

      {/* Customers List View */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No Customers Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            {searchTerm || dueFilter !== 'all' 
              ? 'No customer records match your current filter settings.' 
              : 'Add your first customer to start tracking purchases and managing credit limits.'}
          </p>
          <button
            onClick={onOpenAddCustomer}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Customer Profile
          </button>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Customer Name</th>
                  <th className="py-3.5 px-4">Business / Outlet</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">City / Area</th>
                  <th className="py-3.5 px-4 text-right">Credit Limit</th>
                  <th className="py-3.5 px-4 text-right">Balance Due</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map(cust => (
                  <tr key={cust.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                          {cust.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <button
                            onClick={() => setSelectedCustomerForDrawer(cust)}
                            className="font-bold text-slate-900 hover:text-blue-600 text-left block cursor-pointer"
                          >
                            {cust.name}
                          </button>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {cust.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {cust.businessName ? (
                        <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[180px]">{cust.businessName}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Individual</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        {cust.mobile && (
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{cust.mobile}</span>
                          </div>
                        )}
                        {cust.email && (
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[160px]">{cust.email}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-slate-600">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{cust.city || 'N/A'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-medium text-slate-900">
                      {cust.creditLimit ? `${settings.currencySymbol}${cust.creditLimit.toLocaleString()}` : '—'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {(cust.totalSaleDue || 0) > 0 ? (
                        <span className="font-extrabold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                          {settings.currencySymbol}{(cust.totalSaleDue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                          Paid Up
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setSelectedCustomerForDrawer(cust)}
                          title="Customer 360 View"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStartPOSSale(cust)}
                          title="Checkout POS Terminal"
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <ShoppingBag className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditCustomer(cust)}
                          title="Edit Customer"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cust.id, cust.name)}
                          title="Delete Customer"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Cards View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map(cust => (
            <div
              key={cust.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                      {cust.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 
                        onClick={() => setSelectedCustomerForDrawer(cust)}
                        className="text-xs font-bold text-slate-900 hover:text-blue-600 cursor-pointer"
                      >
                        {cust.name}
                      </h3>
                      {cust.businessName && (
                        <p className="text-[11px] text-slate-500 font-medium truncate max-w-[180px]">{cust.businessName}</p>
                      )}
                    </div>
                  </div>

                  {(cust.totalSaleDue || 0) > 0 ? (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      Due: {settings.currencySymbol}{(cust.totalSaleDue || 0).toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Zero Due
                    </span>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  {cust.mobile && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{cust.mobile}</span>
                    </div>
                  )}
                  {cust.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{cust.email}</span>
                    </div>
                  )}
                  {cust.city && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{cust.city}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedCustomerForDrawer(cust)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  Customer 360 →
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleStartPOSSale(cust)}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
                    title="Start POS Sale"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEditCustomer(cust)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Customer 360 Drawer */}
      <CustomerDrawer
        customer={selectedCustomerForDrawer}
        isOpen={Boolean(selectedCustomerForDrawer)}
        onClose={() => setSelectedCustomerForDrawer(null)}
        onEdit={c => onEditCustomer(c)}
        onStartSale={c => handleStartPOSSale(c)}
      />
    </div>
  );
};
