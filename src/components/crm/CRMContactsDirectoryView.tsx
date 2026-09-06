import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  MapPin, 
  Building2, 
  UserCheck, 
  Edit, 
  Trash2, 
  Filter,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { Contact } from '../../types';
import { usePOS } from '../../context/POSContext';
import { useCRM } from '../../context/CRMContext';

interface CRMContactsDirectoryViewProps {
  onOpenAddContact: () => void;
  onEditContact: (c: Contact) => void;
}

export const CRMContactsDirectoryView: React.FC<CRMContactsDirectoryViewProps> = ({
  onOpenAddContact,
  onEditContact
}) => {
  const { contacts, deleteContact, settings } = usePOS();
  const { organizations } = useCRM();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'customer' | 'supplier' | 'b2b_exec'>('all');

  // Also include key executives from organizations
  const b2bExecutives = organizations.map(org => ({
    id: `exec-${org.id}`,
    name: org.contactPersonName,
    businessName: org.name,
    type: 'b2b_exec' as const,
    mobile: org.phone,
    email: org.email,
    city: org.city,
    address: org.address,
    contactPersonRole: org.contactPersonRole,
    amcTier: org.amcTier,
    creditLimit: org.creditLimit,
    isOrgExecutive: true
  }));

  // Combine standard contacts and B2B corporate leads for directory
  const unifiedDirectory = [
    ...contacts.map(c => ({
      ...c,
      isOrgExecutive: false,
      contactPersonRole: c.businessName ? 'Primary Contact' : 'Individual Customer'
    })),
    ...b2bExecutives
  ];

  const filteredDirectory = unifiedDirectory.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.businessName && item.businessName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.mobile && item.mobile.includes(searchTerm)) ||
      (item.email && item.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.city && item.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.contactPersonRole && item.contactPersonRole.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (typeFilter === 'customer') {
      return item.type === 'customer' || item.type === 'both';
    }
    if (typeFilter === 'supplier') {
      return item.type === 'supplier' || item.type === 'both';
    }
    if (typeFilter === 'b2b_exec') {
      return item.isOrgExecutive;
    }

    return true;
  });

  const handleDelete = (id: string, name: string, isExec: boolean) => {
    if (isExec) {
      alert('This contact is managed under the B2B Organizations directory.');
      return;
    }
    if (window.confirm(`Are you sure you want to remove contact "${name}"?`)) {
      deleteContact(id);
    }
  };

  return (
    <div className="space-y-6">


      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by name, organization, role, email, or telephone..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Directory Roles</option>
            <option value="customer">Retail Customers</option>
            <option value="b2b_exec">B2B Corporate Decision Makers</option>
            <option value="supplier">Suppliers & Vendors</option>
          </select>
        </div>

        <button
          onClick={onOpenAddContact}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs shadow-blue-200 transition-colors cursor-pointer self-end md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Contact
        </button>
      </div>

      {/* Master Contacts Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Contact Individual</th>
                <th className="py-3.5 px-4">Organization / Company</th>
                <th className="py-3.5 px-4">Classification</th>
                <th className="py-3.5 px-4">Phone & Mobile</th>
                <th className="py-3.5 px-4">Email Address</th>
                <th className="py-3.5 px-4">City / Region</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDirectory.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs shrink-0 ${
                        item.isOrgExecutive ? 'bg-indigo-100 text-indigo-700' :
                        item.type === 'supplier' ? 'bg-purple-100 text-purple-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{item.name}</span>
                        <span className="text-[10px] text-slate-400">{item.contactPersonRole}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    {item.businessName ? (
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[180px]">{item.businessName}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Direct Consumer</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                      item.isOrgExecutive ? 'bg-indigo-100 text-indigo-800' :
                      item.type === 'supplier' ? 'bg-purple-100 text-purple-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {item.isOrgExecutive ? 'B2B Executive' : item.type}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    {item.mobile ? (
                      <a href={`tel:${item.mobile}`} className="text-slate-700 hover:text-blue-600 font-medium flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{item.mobile}</span>
                      </a>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    {item.email ? (
                      <a href={`mailto:${item.email}`} className="text-slate-600 hover:text-blue-600 flex items-center gap-1.5 truncate max-w-[180px]">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{item.email}</span>
                      </a>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1 text-slate-600">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{item.city || 'N/A'}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-center gap-1">
                      {item.mobile && (
                        <a
                          href={`tel:${item.mobile}`}
                          title="Call Contact"
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      )}
                      {item.email && (
                        <a
                          href={`mailto:${item.email}`}
                          title="Send Email"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                      )}
                      {!item.isOrgExecutive && (
                        <>
                          <button
                            onClick={() => onEditContact(item as any)}
                            title="Edit Contact"
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.name, item.isOrgExecutive)}
                            title="Delete Contact"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
