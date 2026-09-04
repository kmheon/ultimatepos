import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  LayoutDashboard, 
  UserCheck, 
  Building2, 
  Contact, 
  Sparkles, 
  Briefcase, 
  BarChart3,
  Plus,
  Mail,
  Phone,
  CheckCircle2,
  Clock,
  DollarSign
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { ModuleHeader } from '../layout/ModuleHeader';
import { WorkspaceNav, WorkspaceItem } from '../layout/WorkspaceNav';
import { ContactsList } from '../contacts/ContactsList';
import { QuotationsView } from '../quotations/QuotationsView';
import { ReportsView } from '../reports/ReportsView';
import { AddContactModal } from '../contacts/AddContactModal';
import { updateBrowserURL } from '../../utils/navigationRouter';

export type CRMSubTab = 
  | 'dashboard' 
  | 'customers' 
  | 'organizations' 
  | 'contacts' 
  | 'leads' 
  | 'projects' 
  | 'reports';

interface CRMModuleViewProps {
  initialSubTab?: string;
}

export const CRMModuleView: React.FC<CRMModuleViewProps> = ({ initialSubTab = 'customers' }) => {
  const { contacts, quotations, repairJobSheets } = usePOS();
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState('executive');

  const crmWorkspaces: WorkspaceItem[] = useMemo(() => [
    { id: 'executive', label: 'Executive', icon: BarChart3, description: 'CRM pipeline & relationship metrics', priority: 1 },
    { id: 'customers', label: 'Customers', icon: UserCheck, description: 'Retail customer demographic breakdown', priority: 2 },
    { id: 'organizations', label: 'Organizations', icon: Building2, description: 'B2B enterprise partners & accounts', priority: 3 },
    { id: 'projects', label: 'Projects', icon: Briefcase, description: 'AMC contracts & deployment projects', priority: 4 },
    { id: 'leads', label: 'Leads', icon: Sparkles, description: 'Sales quotations & deal conversion pipeline', priority: 5 },
    { id: 'activity', label: 'Activity', icon: Clock, description: 'Client communications & support logs', priority: 6 },
    { id: 'revenue', label: 'Revenue', icon: DollarSign, description: 'Account lifetime value & billings', priority: 7 },
  ], []);

  const normalizedSubTab: CRMSubTab = useMemo(() => {
    if (!initialSubTab) return 'customers';
    const clean = initialSubTab.toLowerCase().replace(/_/g, '-');
    if (['dashboard', 'overview'].includes(clean)) return 'dashboard';
    if (['customers', 'customer', 'clients'].includes(clean)) return 'customers';
    if (['organizations', 'organization', 'b2b', 'companies'].includes(clean)) return 'organizations';
    if (['contacts', 'all-contacts', 'directory'].includes(clean)) return 'contacts';
    if (['leads', 'lead', 'prospects', 'quotations'].includes(clean)) return 'leads';
    if (['projects', 'project', 'contracts', 'amc'].includes(clean)) return 'projects';
    if (['reports', 'analytics'].includes(clean)) return 'reports';
    return 'customers';
  }, [initialSubTab]);

  const [activeSubTab, setActiveSubTab] = useState<CRMSubTab>(normalizedSubTab);

  useEffect(() => {
    setActiveSubTab(normalizedSubTab);
  }, [normalizedSubTab]);

  const handleTabChange = (tabId: string) => {
    const nextTab = tabId as CRMSubTab;
    setActiveSubTab(nextTab);
    updateBrowserURL('crm', nextTab);
  };

  const customerList = useMemo(() => contacts.filter(c => c.type === 'customer' || c.type === 'both'), [contacts]);
  const supplierList = useMemo(() => contacts.filter(c => c.type === 'supplier' || c.type === 'both'), [contacts]);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Standardized Module Header */}
      <ModuleHeader
        icon={Users}
        title="Customer Relationship Management (CRM)"
        badge="Client Relations"
        subtitle="Customer directories, B2B corporate client profiles, supplier network, and sales communication"
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsAddContactOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer shadow-blue-200"
            >
              <Plus className="w-4 h-4" />
              <span>Add Contact</span>
            </button>
          </div>
        }
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeSubTab === 'dashboard' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Customer Accounts</span>
                <div className="text-2xl font-black text-slate-900 mt-2">
                  {customerList.length} Accounts
                </div>
                <p className="text-xs text-slate-500 mt-1">Direct consumers & retail accounts</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">B2B Organizations</span>
                <div className="text-2xl font-black text-blue-600 mt-2">
                  {supplierList.length} Partners
                </div>
                <p className="text-xs text-slate-500 mt-1">Corporate vendors & institutions</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Open Leads & Quotations</span>
                <div className="text-2xl font-black text-amber-600 mt-2">
                  {quotations.length} Prospects
                </div>
                <p className="text-xs text-slate-500 mt-1">Pipeline deal proposals</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Top Client Accounts</h3>
                  <p className="text-xs text-slate-500">Recently active corporate & retail customers</p>
                </div>
                <button
                  onClick={() => handleTabChange('customers')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  View All Clients →
                </button>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {customerList.slice(0, 5).map(c => (
                  <div key={c.id} className="py-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{c.name}</span>
                      <p className="text-slate-400 text-[11px]">{c.mobile || c.email} • {c.city || 'Standard Group'}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                        {c.type.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'customers' && (
          <div className="flex-1 overflow-y-auto p-6">
            <ContactsList />
          </div>
        )}

        {activeSubTab === 'organizations' && (
          <div className="flex-1 overflow-y-auto p-6">
            <ContactsList />
          </div>
        )}

        {activeSubTab === 'contacts' && (
          <div className="flex-1 overflow-y-auto p-6">
            <ContactsList />
          </div>
        )}

        {activeSubTab === 'leads' && (
          <div className="flex-1 overflow-y-auto p-6">
            <QuotationsView />
          </div>
        )}

        {activeSubTab === 'projects' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
              <h3 className="font-bold text-slate-900 text-sm mb-1">Corporate Client Projects & AMC Contracts</h3>
              <p className="text-xs text-slate-500 mb-4">Annual maintenance agreements and enterprise deployment contracts</p>

              <div className="space-y-3 text-xs">
                {repairJobSheets.slice(0, 4).map(job => (
                  <div key={job.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{job.customerName} — {job.deviceBrand} Maintenance</span>
                      <p className="text-slate-400 text-[11px]">Model: {job.deviceModel || 'Enterprise Asset'} • Tech: {job.technicianAssigned || 'Field Squad'}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg border border-emerald-200 text-[10px]">
                      Active AMC Contract
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'reports' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <WorkspaceNav
              workspaces={crmWorkspaces}
              activeWorkspace={activeWorkspace}
              onWorkspaceChange={setActiveWorkspace}
            />
            <div className="flex-1 overflow-y-auto p-6">
              <ReportsView initialReportTab="crm" />
            </div>
          </div>
        )}
      </div>

      {isAddContactOpen && (
        <AddContactModal isOpen={isAddContactOpen} onClose={() => setIsAddContactOpen(false)} />
      )}
    </div>
  );
};
