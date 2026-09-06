import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Eye, 
  Edit, 
  Trash2, 
  Table as TableIcon, 
  LayoutGrid, 
  DollarSign, 
  FolderKanban, 
  Wrench,
  User
} from 'lucide-react';
import { CRMOrganization, CRMOrgStatus } from '../../types';
import { usePOS } from '../../context/POSContext';
import { useCRM } from '../../context/CRMContext';
import { OrganizationDrawer } from './OrganizationDrawer';

interface CRMOrganizationsViewProps {
  onOpenAddOrg: () => void;
  onEditOrg: (org: CRMOrganization) => void;
  onCreateLeadForOrg: (org: CRMOrganization) => void;
  onCreateProjectForOrg: (org: CRMOrganization) => void;
}

export const CRMOrganizationsView: React.FC<CRMOrganizationsViewProps> = ({
  onOpenAddOrg,
  onEditOrg,
  onCreateLeadForOrg,
  onCreateProjectForOrg
}) => {
  const { settings } = usePOS();
  const { organizations, deleteOrganization, projects } = useCRM();

  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | CRMOrgStatus>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedOrgForDrawer, setSelectedOrgForDrawer] = useState<CRMOrganization | null>(null);

  // Industry options extracted from data
  const industries = Array.from(new Set(organizations.map(o => o.industry))).filter(Boolean);

  const filteredOrgs = organizations.filter(org => {
    const matchesSearch = 
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.contactPersonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (org.binOrTaxNumber && org.binOrTaxNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (org.city && org.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (org.accountManager && org.accountManager.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    if (industryFilter !== 'all' && org.industry !== industryFilter) return false;
    if (statusFilter !== 'all' && org.status !== statusFilter) return false;

    return true;
  });

  const totalCorporateRevenue = organizations.reduce((acc, o) => acc + (o.totalRevenue || 0), 0);
  const activeSlaAccounts = organizations.filter(o => o.amcTier !== 'none' && o.amcTier !== 'standard').length;

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete corporate account "${name}"?`)) {
      deleteOrganization(id);
    }
  };

  return (
    <div className="space-y-6">


      {/* Filter and Action Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search companies, BIN #, key contacts, or cities..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <select
            value={industryFilter}
            onChange={e => setIndustryFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Industries</option>
            {industries.map(ind => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Accounts</option>
            <option value="on_hold">On Hold</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
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
            onClick={onOpenAddOrg}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs shadow-blue-200 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Organization
          </button>
        </div>
      </div>

      {/* Content Table or Grid */}
      {filteredOrgs.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No Organizations Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            No corporate client records match your search criteria.
          </p>
          <button
            onClick={onOpenAddOrg}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add B2B Account
          </button>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Organization / Company</th>
                  <th className="py-3.5 px-4">Sector & BIN</th>
                  <th className="py-3.5 px-4">Key Decision Maker</th>
                  <th className="py-3.5 px-4">AMC & SLA Tier</th>
                  <th className="py-3.5 px-4 text-right">Credit Line</th>
                  <th className="py-3.5 px-4 text-right">Total Revenue</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrgs.map(org => (
                  <tr key={org.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <button
                            onClick={() => setSelectedOrgForDrawer(org)}
                            className="font-bold text-slate-900 hover:text-blue-600 text-left block cursor-pointer"
                          >
                            {org.name}
                          </button>
                          <span className="text-[10px] text-slate-400">{org.city || 'Headquarters'}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block">{org.industry}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Tax: {org.binOrTaxNumber || 'N/A'}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{org.contactPersonName}</span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {org.contactPersonRole} • {org.phone}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 block w-fit">
                        {org.amcTier.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block uppercase">
                        {org.paymentTerms} terms
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-medium text-slate-900">
                      {settings.currencySymbol}{org.creditLimit.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {settings.currencySymbol}{org.totalRevenue.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        org.status === 'active' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {org.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setSelectedOrgForDrawer(org)}
                          title="Organization 360 View"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onCreateLeadForOrg(org)}
                          title="Create Lead Opportunity"
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <FolderKanban className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onCreateProjectForOrg(org)}
                          title="Create Project / AMC"
                          className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Wrench className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditOrg(org)}
                          title="Edit Account"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(org.id, org.name)}
                          title="Delete Account"
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
        /* Grid Mode */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrgs.map(org => (
            <div
              key={org.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3
                        onClick={() => setSelectedOrgForDrawer(org)}
                        className="text-xs font-bold text-slate-900 hover:text-blue-600 cursor-pointer line-clamp-1"
                      >
                        {org.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium">{org.industry}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize shrink-0 ${
                    org.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {org.status}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Decision Maker:</span>
                    <span className="font-bold text-slate-800">{org.contactPersonName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">AMC Tier:</span>
                    <span className="font-semibold text-indigo-600 capitalize">
                      {org.amcTier.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Total Billed:</span>
                    <span className="font-extrabold text-slate-900">
                      {settings.currencySymbol}{org.totalRevenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedOrgForDrawer(org)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                >
                  Account 360 →
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onCreateLeadForOrg(org)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
                    title="New Lead Opportunity"
                  >
                    <FolderKanban className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEditOrg(org)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                    title="Edit Account"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Organization 360 Drawer */}
      <OrganizationDrawer
        org={selectedOrgForDrawer}
        isOpen={Boolean(selectedOrgForDrawer)}
        onClose={() => setSelectedOrgForDrawer(null)}
        onEdit={org => onEditOrg(org)}
        onCreateLead={org => onCreateLeadForOrg(org)}
        onCreateProject={org => onCreateProjectForOrg(org)}
      />
    </div>
  );
};
