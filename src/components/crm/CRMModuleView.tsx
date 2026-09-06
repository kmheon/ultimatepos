import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  LayoutDashboard, 
  Building2, 
  Contact, 
  FolderKanban, 
  Wrench, 
  BarChart3,
  Plus
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { useCRM } from '../../context/CRMContext';
import { ModuleHeader } from '../layout/ModuleHeader';
import { updateBrowserURL } from '../../utils/navigationRouter';
import { Contact as ContactType, CRMLead, CRMLeadStage, CRMOrganization, CRMProject } from '../../types';

// Views
import { CRMDashboardView } from './CRMDashboardView';
import { CRMCustomersView } from './CRMCustomersView';
import { CRMOrganizationsView } from './CRMOrganizationsView';
import { CRMContactsDirectoryView } from './CRMContactsDirectoryView';
import { CRMLeadsPipelineView } from './CRMLeadsPipelineView';
import { CRMProjectsAMCView } from './CRMProjectsAMCView';
import { CRMReportsAnalyticsView } from './CRMReportsAnalyticsView';

// Modals
import { AddContactModal } from '../contacts/AddContactModal';
import { AddEditLeadModal } from './AddEditLeadModal';
import { AddEditOrganizationModal } from './AddEditOrganizationModal';
import { AddEditProjectModal } from './AddEditProjectModal';

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

export const CRMModuleView: React.FC<CRMModuleViewProps> = ({ initialSubTab = 'dashboard' }) => {
  const { setActiveTab } = usePOS();
  const { leads, organizations, projects } = useCRM();

  // Normalize route param to sub tab
  const normalizedSubTab: CRMSubTab = useMemo(() => {
    if (!initialSubTab) return 'dashboard';
    const clean = initialSubTab.toLowerCase().replace(/_/g, '-');
    if (['dashboard', 'overview'].includes(clean)) return 'dashboard';
    if (['customers', 'customer', 'clients'].includes(clean)) return 'customers';
    if (['organizations', 'organization', 'b2b', 'companies'].includes(clean)) return 'organizations';
    if (['contacts', 'all-contacts', 'directory'].includes(clean)) return 'contacts';
    if (['leads', 'lead', 'prospects', 'deals', 'pipeline'].includes(clean)) return 'leads';
    if (['projects', 'project', 'contracts', 'amc'].includes(clean)) return 'projects';
    if (['reports', 'analytics', 'telemetry'].includes(clean)) return 'reports';
    return 'dashboard';
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

  // Modal State Management
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactType | null>(null);

  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<CRMLead | null>(null);
  const [leadDefaultStage, setLeadDefaultStage] = useState<CRMLeadStage>('new');

  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<CRMOrganization | null>(null);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<CRMProject | null>(null);

  // Subtab definition for internal navbar
  const subTabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers' as const, label: 'Customers', icon: Users },
    { id: 'organizations' as const, label: 'Organizations (B2B)', icon: Building2, count: organizations.length },
    { id: 'contacts' as const, label: 'Contacts Directory', icon: Contact },
    { id: 'leads' as const, label: 'Leads & Pipeline', icon: FolderKanban, count: leads.filter(l => l.stage !== 'lost').length },
    { id: 'projects' as const, label: 'Projects & AMC', icon: Wrench, count: projects.length },
    { id: 'reports' as const, label: 'Reports & Analytics', icon: BarChart3 },
  ];

  // Quick Action Handlers
  const handleOpenNewLead = (stage: CRMLeadStage = 'new') => {
    setEditingLead(null);
    setLeadDefaultStage(stage);
    setIsLeadModalOpen(true);
  };

  const handleEditLead = (lead: CRMLead) => {
    setEditingLead(lead);
    setIsLeadModalOpen(true);
  };

  const handleOpenNewOrg = () => {
    setEditingOrg(null);
    setIsOrgModalOpen(true);
  };

  const handleEditOrg = (org: CRMOrganization) => {
    setEditingOrg(org);
    setIsOrgModalOpen(true);
  };

  const handleCreateLeadForOrg = (org: CRMOrganization) => {
    setEditingLead({
      id: '',
      title: `${org.name} - Enterprise Solution Expansion`,
      companyName: org.name,
      contactName: org.contactPersonName,
      email: org.email,
      mobile: org.phone,
      dealValue: 25000,
      stage: 'qualified',
      probability: 60,
      priority: 'high',
      source: 'referral',
      assignedTo: 'Zubair Hossain',
      expectedCloseDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0],
      notes: `Lead initiated from corporate account ${org.name}.`,
      tags: ['B2B', org.industry]
    });
    setIsLeadModalOpen(true);
  };

  const handleCreateProjectForOrg = (org: CRMOrganization) => {
    setEditingProject({
      id: '',
      projectNumber: `AMC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      title: `${org.name} Annual Maintenance Contract`,
      clientId: org.id,
      clientName: org.name,
      clientType: 'b2b',
      type: 'amc_maintenance',
      contractTier: org.amcTier === 'enterprise_platinum' ? 'Enterprise Platinum 24/7' : 'Standard Business SLA',
      contractValue: 48000,
      billingCycle: 'quarterly',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      renewalStatus: 'active',
      slaLevel: '24_7_dedicated',
      visitsCompleted: 0,
      totalVisitsPlanned: 4,
      progress: 0,
      projectLead: 'Engr. Tanvir Ahmed'
    });
    setIsProjectModalOpen(true);
  };

  const handleOpenNewProject = () => {
    setEditingProject(null);
    setIsProjectModalOpen(true);
  };

  const handleEditProject = (project: CRMProject) => {
    setEditingProject(project);
    setIsProjectModalOpen(true);
  };

  const handleOpenAddCustomer = () => {
    setEditingContact(null);
    setIsAddContactOpen(true);
  };

  const handleEditCustomer = (customer: ContactType) => {
    setEditingContact(customer);
    setIsAddContactOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Standardized Module Header */}
      <ModuleHeader
        icon={Users}
        title="Customer Relationship Management (CRM)"
        badge="Enterprise CRM"
        subtitle="End-to-end sales pipeline, B2B corporate contracts, annual maintenance agreements (AMC), and retail customer intelligence"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenNewLead('new')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer shadow-blue-200"
            >
              <Plus className="w-4 h-4" />
              <span>New Opportunity</span>
            </button>
            <button
              onClick={handleOpenNewOrg}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer shadow-indigo-200"
            >
              <Building2 className="w-4 h-4" />
              <span>New B2B Account</span>
            </button>
          </div>
        }
      />



      {/* Content Area Rendering the Active Sub-Page */}
      <div className={`flex-1 ${activeSubTab === 'reports' ? 'flex flex-col overflow-hidden' : 'overflow-y-auto p-6'}`}>
        {activeSubTab === 'dashboard' && (
          <CRMDashboardView
            onOpenNewLead={() => handleOpenNewLead('new')}
            onOpenNewOrg={handleOpenNewOrg}
            onOpenNewProject={handleOpenNewProject}
            onOpenNewCustomer={handleOpenAddCustomer}
          />
        )}

        {activeSubTab === 'customers' && (
          <CRMCustomersView
            onOpenAddCustomer={handleOpenAddCustomer}
            onEditCustomer={handleEditCustomer}
          />
        )}

        {activeSubTab === 'organizations' && (
          <CRMOrganizationsView
            onOpenAddOrg={handleOpenNewOrg}
            onEditOrg={handleEditOrg}
            onCreateLeadForOrg={handleCreateLeadForOrg}
            onCreateProjectForOrg={handleCreateProjectForOrg}
          />
        )}

        {activeSubTab === 'contacts' && (
          <CRMContactsDirectoryView
            onOpenAddContact={handleOpenAddCustomer}
            onEditContact={handleEditCustomer}
          />
        )}

        {activeSubTab === 'leads' && (
          <CRMLeadsPipelineView
            onOpenNewLead={handleOpenNewLead}
            onEditLead={handleEditLead}
            onConvertToQuote={lead => {
              setActiveTab('quotations');
            }}
          />
        )}

        {activeSubTab === 'projects' && (
          <CRMProjectsAMCView
            onOpenNewProject={handleOpenNewProject}
            onEditProject={handleEditProject}
          />
        )}

        {activeSubTab === 'reports' && (
          <CRMReportsAnalyticsView />
        )}
      </div>

      {/* Shared Modals */}
      <AddContactModal
        isOpen={isAddContactOpen}
        onClose={() => {
          setIsAddContactOpen(false);
          setEditingContact(null);
        }}
        contactToEdit={editingContact}
      />

      <AddEditLeadModal
        isOpen={isLeadModalOpen}
        onClose={() => {
          setIsLeadModalOpen(false);
          setEditingLead(null);
        }}
        editingLead={editingLead}
        defaultStage={leadDefaultStage}
      />

      <AddEditOrganizationModal
        isOpen={isOrgModalOpen}
        onClose={() => {
          setIsOrgModalOpen(false);
          setEditingOrg(null);
        }}
        editingOrg={editingOrg}
      />

      <AddEditProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setEditingProject(null);
        }}
        editingProject={editingProject}
      />
    </div>
  );
};
