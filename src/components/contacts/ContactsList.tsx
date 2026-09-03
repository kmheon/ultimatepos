import React, { useState, useMemo } from 'react';
import { Users, Plus, Search, Phone, Mail, Building, Trash2, Edit3, DollarSign, UserCheck } from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { Contact } from '../../types';
import { AddContactModal } from './AddContactModal';

export const ContactsList: React.FC = () => {
  const { contacts, deleteContact, setSelectedCustomer, setActiveTab, settings } = usePOS();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'customer' | 'supplier'>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      const matchesType =
        typeFilter === 'all' ||
        c.type === typeFilter ||
        c.type === 'both';

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.businessName && c.businessName.toLowerCase().includes(q)) ||
        (c.mobile && c.mobile.includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q));

      return matchesType && matchesSearch;
    });
  }, [contacts, typeFilter, searchQuery]);

  const totalCustomerReceivables = contacts.reduce((sum, c) => sum + (c.totalSaleDue || 0), 0);
  const totalSupplierPayables = contacts.reduce((sum, c) => sum + (c.totalPurchaseDue || 0), 0);

  const handleEdit = (c: Contact) => {
    setEditingContact(c);
    setIsAddOpen(true);
  };

  const handleStartSaleForCustomer = (c: Contact) => {
    setSelectedCustomer(c);
    setActiveTab('pos');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Contacts & Accounts (CRM)</h1>
          <p className="text-xs text-slate-500">Maintain directory of retail customers, B2B wholesale clients, and vendor suppliers</p>
        </div>

        <button
          onClick={() => {
            setEditingContact(null);
            setIsAddOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Contact</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Accounts</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{contacts.length} Contacts</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {contacts.filter(c => c.type === 'customer').length} Customers • {contacts.filter(c => c.type === 'supplier').length} Vendors
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Customer Receivables</span>
          <h3 className="text-2xl font-black text-amber-600 mt-1">{settings.currencySymbol}{totalCustomerReceivables.toFixed(2)}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Total credit owed by customers</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Supplier Payables</span>
          <h3 className="text-2xl font-black text-rose-600 mt-1">{settings.currencySymbol}{totalSupplierPayables.toFixed(2)}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Owed to suppliers for POs</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, company, phone, or email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          {(['all', 'customer', 'supplier'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                typeFilter === t
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t === 'all' ? 'All Contacts' : `${t}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Contact Profile</th>
                <th className="py-3.5 px-4">Classification</th>
                <th className="py-3.5 px-4">Communication</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4 text-right">Balance Due</th>
                <th className="py-3.5 px-4 text-right">Credit Limit</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-sm">No contacts found</p>
                  </td>
                </tr>
              ) : (
                filteredContacts.map(c => {
                  const due = c.type === 'supplier' ? (c.totalPurchaseDue || 0) : (c.totalSaleDue || 0);

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-sm">{c.name}</div>
                        {c.businessName && (
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Building className="w-3 h-3 text-slate-400" />
                            <span>{c.businessName}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                            c.type === 'customer'
                              ? 'bg-blue-100 text-blue-800'
                              : c.type === 'supplier'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {c.type}
                        </span>
                      </td>

                      <td className="py-3 px-4 space-y-0.5 text-slate-600">
                        {c.mobile && (
                          <div className="flex items-center gap-1.5 font-mono">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{c.mobile}</span>
                          </div>
                        )}
                        {c.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{c.email}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        {c.city || 'Standard Area'}
                      </td>

                      <td className="py-3 px-4 text-right font-bold">
                        {due > 0 ? (
                          <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded text-xs">
                            {settings.currencySymbol}{due.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal">$0.00</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right font-medium text-slate-600">
                        {c.creditLimit ? `${settings.currencySymbol}${c.creditLimit.toFixed(2)}` : 'N/A'}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {(c.type === 'customer' || c.type === 'both') && (
                            <button
                              onClick={() => handleStartSaleForCustomer(c)}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold"
                              title="Start POS Order"
                            >
                              POS Sale
                            </button>
                          )}

                          <button
                            onClick={() => handleEdit(c)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                            title="Edit Contact"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Delete contact "${c.name}"?`)) {
                                deleteContact(c.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Delete Contact"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddContactModal
        isOpen={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          setEditingContact(null);
        }}
        contactToEdit={editingContact}
      />
    </div>
  );
};
