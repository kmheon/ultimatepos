import React, { useMemo } from 'react';
import { 
  RepairJobSheet, 
  ServiceTechnician, 
  ServiceScheduleSlot 
} from '../../../types';
import { 
  calculateOperationsKpis, 
  getCommandCenterMetrics, 
  getSmartAlerts, 
  getRecentServiceActivities, 
  getEnrichedServiceResources, 
  getServiceAnalyticsChartsData,
  DEFAULT_WORKFLOW_STAGES 
} from '../../../services/serviceOperations.service';
import { CommandCenterBar } from './CommandCenterBar';
import { SmartAlertsBanner } from './SmartAlertsBanner';
import { QuickActionsToolbar } from './QuickActionsToolbar';
import { OperationsKpiRow } from './OperationsKpiRow';
import { ConfigurableWorkflowPipeline } from './ConfigurableWorkflowPipeline';
import { ServiceResourcePanel } from './ServiceResourcePanel';
import { RecentWorkOrdersTable } from './RecentWorkOrdersTable';
import { ServiceActivityFeed } from './ServiceActivityFeed';
import { ServiceOperationsCharts } from './ServiceOperationsCharts';

interface ServiceOperationsDashboardProps {
  jobs: RepairJobSheet[];
  technicians: ServiceTechnician[];
  scheduleSlots: ServiceScheduleSlot[];
  currencySymbol: string;
  onJobClick: (job: RepairJobSheet) => void;
  onNewServiceRequest: () => void;
  onNewWorkOrder: () => void;
  onScheduleVisit: () => void;
  onRegisterAsset: () => void;
  onCreateQuote: () => void;
  onGenerateInvoice: () => void;
  onViewAllRequests: () => void;
  onManageResources: () => void;
  onAdvanceJobStage?: (jobId: string, nextStageKey: string) => void;
  onApplyFilter?: (filterKey?: string) => void;
}

export const ServiceOperationsDashboard: React.FC<ServiceOperationsDashboardProps> = ({
  jobs,
  technicians,
  scheduleSlots,
  currencySymbol,
  onJobClick,
  onNewServiceRequest,
  onNewWorkOrder,
  onScheduleVisit,
  onRegisterAsset,
  onCreateQuote,
  onGenerateInvoice,
  onViewAllRequests,
  onManageResources,
  onAdvanceJobStage,
  onApplyFilter
}) => {
  // Domain Service Calculations (Read-only from Service Domain Layer)
  const kpis = useMemo(() => 
    calculateOperationsKpis(jobs, scheduleSlots, technicians), 
    [jobs, scheduleSlots, technicians]
  );

  const commandCenterMetrics = useMemo(() => 
    getCommandCenterMetrics(jobs, technicians), 
    [jobs, technicians]
  );

  const smartAlerts = useMemo(() => 
    getSmartAlerts(jobs, scheduleSlots), 
    [jobs, scheduleSlots]
  );

  const activities = useMemo(() => 
    getRecentServiceActivities(jobs), 
    [jobs]
  );

  const enrichedResources = useMemo(() => 
    getEnrichedServiceResources(technicians), 
    [technicians]
  );

  const chartsData = useMemo(() => 
    getServiceAnalyticsChartsData(jobs, technicians), 
    [jobs, technicians]
  );

  return (
    <div className="space-y-5">
      {/* 1. COMMAND CENTER (Compact Operational Status Panel) */}
      <CommandCenterBar 
        metrics={commandCenterMetrics}
        currencySymbol={currencySymbol}
        onFilterClick={onApplyFilter}
      />

      {/* 2. SMART ALERTS (High-Priority Operational Triggers) */}
      <SmartAlertsBanner 
        alerts={smartAlerts}
        onActionClick={onApplyFilter}
      />

      {/* 3. QUICK ACTIONS SHORTCUTS TOOLBAR */}
      <QuickActionsToolbar 
        onNewServiceRequest={onNewServiceRequest}
        onNewWorkOrder={onNewWorkOrder}
        onScheduleVisit={onScheduleVisit}
        onRegisterAsset={onRegisterAsset}
        onCreateQuote={onCreateQuote}
        onGenerateInvoice={onGenerateInvoice}
      />

      {/* 4. ENTERPRISE KPI MATRICES (Row 1 & Row 2) */}
      <OperationsKpiRow 
        kpis={kpis}
        currencySymbol={currencySymbol}
      />

      {/* 5. CONFIGURABLE WORKFLOW PIPELINE & WORK QUEUE */}
      <ConfigurableWorkflowPipeline 
        stages={DEFAULT_WORKFLOW_STAGES}
        jobs={jobs}
        currencySymbol={currencySymbol}
        onJobClick={onJobClick}
        onViewAllClick={onViewAllRequests}
        onAdvanceJobStage={onAdvanceJobStage}
      />

      {/* 6. MIDDLE SECTION: SERVICE RESOURCES & RECENT ACTIVITY AUDIT TRAIL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ServiceResourcePanel 
          resources={enrichedResources}
          onManageClick={onManageResources}
        />
        <ServiceActivityFeed 
          activities={activities}
        />
      </div>

      {/* 7. RECENT WORK ORDERS TABLE (Configured Columns) */}
      <RecentWorkOrdersTable 
        jobs={jobs}
        currencySymbol={currencySymbol}
        onJobClick={onJobClick}
        onViewAllClick={onViewAllRequests}
      />

      {/* 8. BUSINESS INTELLIGENCE & TELEMETRY CHARTS */}
      <ServiceOperationsCharts 
        chartsData={chartsData}
        currencySymbol={currencySymbol}
      />
    </div>
  );
};
