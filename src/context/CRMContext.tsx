import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  CRMLead, 
  CRMOrganization, 
  CRMProject, 
  CRMActivity, 
  CRMLeadStage 
} from '../types';
import { 
  initialCRMOrganizations, 
  initialCRMLeads, 
  initialCRMProjects, 
  initialCRMActivities 
} from '../data/crmMockData';

interface CRMContextType {
  leads: CRMLead[];
  organizations: CRMOrganization[];
  projects: CRMProject[];
  activities: CRMActivity[];
  
  // Leads Management
  addLead: (lead: Omit<CRMLead, 'id' | 'createdAt'>) => CRMLead;
  updateLead: (id: string, updates: Partial<CRMLead>) => void;
  deleteLead: (id: string) => void;
  moveLeadStage: (id: string, newStage: CRMLeadStage) => void;
  
  // Organizations Management
  addOrganization: (org: Omit<CRMOrganization, 'id' | 'createdAt'>) => CRMOrganization;
  updateOrganization: (id: string, updates: Partial<CRMOrganization>) => void;
  deleteOrganization: (id: string) => void;
  
  // Projects & AMC Management
  addProject: (proj: Omit<CRMProject, 'id' | 'projectNumber'>) => CRMProject;
  updateProject: (id: string, updates: Partial<CRMProject>) => void;
  deleteProject: (id: string) => void;
  logMaintenanceVisit: (projectId: string, notes?: string) => void;
  
  // Activities Management
  addActivity: (act: Omit<CRMActivity, 'id' | 'date'>) => CRMActivity;
  
  // Reset demo data
  resetCRMData: () => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Leads
  const [leads, setLeads] = useState<CRMLead[]>(() => {
    try {
      const saved = localStorage.getItem('upos_crm_leads_v1');
      return saved ? JSON.parse(saved) : initialCRMLeads;
    } catch (e) {
      console.error('Failed to parse saved CRM leads', e);
      return initialCRMLeads;
    }
  });

  // Organizations
  const [organizations, setOrganizations] = useState<CRMOrganization[]>(() => {
    try {
      const saved = localStorage.getItem('upos_crm_orgs_v1');
      return saved ? JSON.parse(saved) : initialCRMOrganizations;
    } catch (e) {
      console.error('Failed to parse saved CRM organizations', e);
      return initialCRMOrganizations;
    }
  });

  // Projects / AMC Contracts
  const [projects, setProjects] = useState<CRMProject[]>(() => {
    try {
      const saved = localStorage.getItem('upos_crm_projects_v1');
      return saved ? JSON.parse(saved) : initialCRMProjects;
    } catch (e) {
      console.error('Failed to parse saved CRM projects', e);
      return initialCRMProjects;
    }
  });

  // Activities
  const [activities, setActivities] = useState<CRMActivity[]>(() => {
    try {
      const saved = localStorage.getItem('upos_crm_activities_v1');
      return saved ? JSON.parse(saved) : initialCRMActivities;
    } catch (e) {
      console.error('Failed to parse saved CRM activities', e);
      return initialCRMActivities;
    }
  });

  // Persistence
  useEffect(() => {
    localStorage.setItem('upos_crm_leads_v1', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('upos_crm_orgs_v1', JSON.stringify(organizations));
  }, [organizations]);

  useEffect(() => {
    localStorage.setItem('upos_crm_projects_v1', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('upos_crm_activities_v1', JSON.stringify(activities));
  }, [activities]);

  // Lead CRUD
  const addLead = (leadData: Omit<CRMLead, 'id' | 'createdAt'>): CRMLead => {
    const newLead: CRMLead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setLeads(prev => [newLead, ...prev]);

    // Automatically record activity
    addActivity({
      title: `Created new lead: ${newLead.title}`,
      type: 'note',
      entityType: 'lead',
      entityId: newLead.id,
      entityName: newLead.companyName || newLead.contactName,
      notes: `Deal value $${newLead.dealValue.toLocaleString()} registered in stage: ${newLead.stage}.`,
      createdBy: newLead.assignedTo || 'Current User'
    });

    return newLead;
  };

  const updateLead = (id: string, updates: Partial<CRMLead>) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const deleteLead = (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
  };

  const moveLeadStage = (id: string, newStage: CRMLeadStage) => {
    setLeads(prev => prev.map(lead => {
      if (lead.id !== id) return lead;
      
      const probMap: Record<CRMLeadStage, number> = {
        new: 20,
        contacted: 40,
        qualified: 60,
        proposal: 70,
        negotiation: 85,
        won: 100,
        lost: 0
      };

      const updatedLead: CRMLead = {
        ...lead,
        stage: newStage,
        probability: probMap[newStage],
        lastContactedAt: new Date().toISOString().split('T')[0]
      };

      // Add activity log on stage transition
      addActivity({
        title: `Opportunity stage updated to ${newStage.toUpperCase()}`,
        type: newStage === 'won' ? 'contract_signed' : 'note',
        entityType: 'lead',
        entityId: lead.id,
        entityName: lead.companyName || lead.contactName,
        notes: `Pipeline opportunity moved from ${lead.stage} to ${newStage}. Estimated probability: ${probMap[newStage]}%.`,
        createdBy: lead.assignedTo || 'Sales Rep'
      });

      return updatedLead;
    }));
  };

  // Organization CRUD
  const addOrganization = (orgData: Omit<CRMOrganization, 'id' | 'createdAt'>): CRMOrganization => {
    const newOrg: CRMOrganization = {
      ...orgData,
      id: `org-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setOrganizations(prev => [newOrg, ...prev]);

    addActivity({
      title: `Added enterprise account: ${newOrg.name}`,
      type: 'note',
      entityType: 'organization',
      entityId: newOrg.id,
      entityName: newOrg.name,
      notes: `Industry: ${newOrg.industry} • Key contact: ${newOrg.contactPersonName} (${newOrg.contactPersonRole})`,
      createdBy: newOrg.accountManager || 'Account Manager'
    });

    return newOrg;
  };

  const updateOrganization = (id: string, updates: Partial<CRMOrganization>) => {
    setOrganizations(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
  };

  const deleteOrganization = (id: string) => {
    setOrganizations(prev => prev.filter(o => o.id !== id));
  };

  // Project CRUD
  const addProject = (projData: Omit<CRMProject, 'id' | 'projectNumber'>): CRMProject => {
    const prefix = projData.type === 'amc_maintenance' ? 'AMC' : 'DEP';
    const year = new Date().getFullYear();
    const randomSeq = String(Math.floor(Math.random() * 900) + 100);
    const newProject: CRMProject = {
      ...projData,
      id: `proj-${Date.now()}`,
      projectNumber: `${prefix}-${year}-${randomSeq}`
    };

    setProjects(prev => [newProject, ...prev]);

    addActivity({
      title: `Contract established: ${newProject.projectNumber} (${newProject.title})`,
      type: 'contract_signed',
      entityType: 'project',
      entityId: newProject.id,
      entityName: newProject.clientName,
      notes: `Value: $${newProject.contractValue.toLocaleString()} • SLA Tier: ${newProject.contractTier} • Lead: ${newProject.projectLead}`,
      createdBy: newProject.projectLead || 'Engr. Kamal Hossain'
    });

    return newProject;
  };

  const updateProject = (id: string, updates: Partial<CRMProject>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const logMaintenanceVisit = (projectId: string, notes?: string) => {
    setProjects(prev => prev.map(proj => {
      if (proj.id !== projectId) return proj;
      const newCompleted = Math.min(proj.totalVisitsPlanned, proj.visitsCompleted + 1);
      const newProgress = Math.round((newCompleted / (proj.totalVisitsPlanned || 1)) * 100);
      const today = new Date().toISOString().split('T')[0];

      addActivity({
        title: `Maintenance audit completed for ${proj.projectNumber}`,
        type: 'site_visit',
        entityType: 'project',
        entityId: proj.id,
        entityName: proj.clientName,
        notes: notes || `Routine maintenance inspection and hardware diagnostics executed. Visit #${newCompleted} of ${proj.totalVisitsPlanned}.`,
        createdBy: proj.projectLead || 'Service Engineer'
      });

      return {
        ...proj,
        visitsCompleted: newCompleted,
        progress: newProgress,
        lastServiceDate: today
      };
    }));
  };

  // Activity CRUD
  const addActivity = (actData: Omit<CRMActivity, 'id' | 'date'>): CRMActivity => {
    const now = new Date();
    const dateString = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newAct: CRMActivity = {
      ...actData,
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      date: dateString
    };

    setActivities(prev => [newAct, ...prev]);
    return newAct;
  };

  const resetCRMData = () => {
    setLeads(initialCRMLeads);
    setOrganizations(initialCRMOrganizations);
    setProjects(initialCRMProjects);
    setActivities(initialCRMActivities);
    localStorage.removeItem('upos_crm_leads_v1');
    localStorage.removeItem('upos_crm_orgs_v1');
    localStorage.removeItem('upos_crm_projects_v1');
    localStorage.removeItem('upos_crm_activities_v1');
  };

  return (
    <CRMContext.Provider
      value={{
        leads,
        organizations,
        projects,
        activities,
        addLead,
        updateLead,
        deleteLead,
        moveLeadStage,
        addOrganization,
        updateOrganization,
        deleteOrganization,
        addProject,
        updateProject,
        deleteProject,
        logMaintenanceVisit,
        addActivity,
        resetCRMData
      }}
    >
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};
