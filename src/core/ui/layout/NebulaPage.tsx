import React from 'react';
import { LucideIcon } from 'lucide-react';
import { ModuleLayout } from './ModuleLayout';
import { PageLayout } from './PageLayout';
import { NebulaModuleHeader } from '../navigation/ModuleHeader';
import { NebulaWorkspaceTabs, NebulaWorkspaceItem } from '../navigation/WorkspaceTabs';
import { PageToolbar } from '../toolbar/PageToolbar';
import { FilterOption } from '../toolbar/FilterBar';

export interface NebulaPageProps {
  moduleName?: string;
  icon: LucideIcon;
  title: string;
  description?: string;
  badge?: string;
  actions?: React.ReactNode;
  
  // Workspaces / Tabs
  workspaces?: NebulaWorkspaceItem[];
  activeWorkspace?: string;
  onWorkspaceChange?: (id: string) => void;

  // Toolbar
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  filters?: FilterOption[];
  activeFilter?: string;
  onFilterChange?: (id: string) => void;
  onExportCSV?: () => void;
  onExportPDF?: () => void;
  extraToolbarActions?: React.ReactNode;

  children: React.ReactNode;
}

export const NebulaPage: React.FC<NebulaPageProps> = ({
  icon,
  title,
  description,
  badge,
  actions,
  workspaces,
  activeWorkspace,
  onWorkspaceChange,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filters,
  activeFilter,
  onFilterChange,
  onExportCSV,
  onExportPDF,
  extraToolbarActions,
  children,
}) => {
  const hasWorkspaces = workspaces && workspaces.length > 0 && activeWorkspace && onWorkspaceChange;
  const hasToolbar = searchValue !== undefined && onSearchChange !== undefined;

  return (
    <ModuleLayout
      header={
        <NebulaModuleHeader
          icon={icon}
          title={title}
          badge={badge}
          description={description}
          actions={actions}
        />
      }
      workspaceTabs={
        hasWorkspaces ? (
          <NebulaWorkspaceTabs
            workspaces={workspaces}
            activeWorkspace={activeWorkspace}
            onWorkspaceChange={onWorkspaceChange}
          />
        ) : undefined
      }
      toolbar={
        hasToolbar ? (
          <PageToolbar
            searchValue={searchValue}
            onSearchChange={onSearchChange}
            searchPlaceholder={searchPlaceholder}
            filters={filters}
            activeFilter={activeFilter}
            onFilterChange={onFilterChange}
            onExportCSV={onExportCSV}
            onExportPDF={onExportPDF}
            extraActions={extraToolbarActions}
          />
        ) : undefined
      }
    >
      <PageLayout>
        {children}
      </PageLayout>
    </ModuleLayout>
  );
};

