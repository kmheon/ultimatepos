import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { POSProvider, usePOS } from './context/POSContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { POSTerminal } from './components/pos/POSTerminal';
import { Dashboard } from './components/dashboard/Dashboard';
import { ServiceManagementView } from './components/services/ServiceManagementView';
import { SalesModuleView } from './components/sales/SalesModuleView';
import { PurchasesModuleView } from './components/purchases/PurchasesModuleView';
import { InventoryModuleView } from './components/inventory/InventoryModuleView';
import { CRMModuleView } from './components/crm/CRMModuleView';
import { FinanceModuleView } from './components/finance/FinanceModuleView';
import { HRMModuleView } from './components/hrm/HRMModuleView';
import { SettingsModuleView } from './components/settings/SettingsModuleView';
import { ReportsView } from './components/reports/ReportsView';
import { SystemAdminView } from './components/systemAdmin/SystemAdminView';
import { UserManagementView } from './components/users/UserManagementView';
import { ModulesView } from './components/modules/ModulesView';
import { WooCommerceView } from './components/woocommerce/WooCommerceView';
import { parseCurrentURL, updateBrowserURL } from './utils/navigationRouter';

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab } = usePOS();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [initialSubTab, setInitialSubTab] = useState<string | undefined>(undefined);

  // Initialize deep-linking and browser navigation listener
  useEffect(() => {
    const handleLocationChange = () => {
      const parsed = parseCurrentURL();
      if (parsed.module) {
        setActiveTab(parsed.module as any);
        setInitialSubTab(parsed.subTab);
      }
    };

    // Parse URL on initial load if present
    const initialRoute = parseCurrentURL();
    if (initialRoute.module) {
      setActiveTab(initialRoute.module as any);
      setInitialSubTab(initialRoute.subTab);
    }

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, [setActiveTab]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-900 antialiased">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {/* Dashboard & POS */}
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'pos' && <POSTerminal />}

          {/* Service Management Module */}
          {(activeTab === 'services' || activeTab === 'service' || activeTab === 'repairs') && (
            <ServiceManagementView initialSubTab={initialSubTab} />
          )}

          {/* Sales Module */}
          {activeTab === 'sales' && <SalesModuleView initialSubTab={initialSubTab || 'orders'} />}
          {activeTab === 'quotations' && <SalesModuleView initialSubTab="quotations" />}
          {activeTab === 'returns' && <SalesModuleView initialSubTab="returns" />}

          {/* Purchases / Procurement Module */}
          {(activeTab === 'purchases' || activeTab === 'procurement') && (
            <PurchasesModuleView initialSubTab={initialSubTab || 'orders'} />
          )}

          {/* Inventory Module */}
          {(activeTab === 'inventory' || activeTab === 'products') && (
            <InventoryModuleView initialSubTab={initialSubTab || 'products'} />
          )}
          {activeTab === 'transfers' && <InventoryModuleView initialSubTab="transfers" />}
          {activeTab === 'adjustments' && <InventoryModuleView initialSubTab="adjustments" />}
          {activeTab === 'labels' && <InventoryModuleView initialSubTab="labels" />}

          {/* CRM Module */}
          {(activeTab === 'crm' || activeTab === 'contacts') && (
            <CRMModuleView initialSubTab={initialSubTab || 'customers'} />
          )}

          {/* Finance Module */}
          {(activeTab === 'finance' || activeTab === 'accounts') && (
            <FinanceModuleView initialSubTab={initialSubTab || 'banking'} />
          )}
          {activeTab === 'expenses' && <FinanceModuleView initialSubTab="expenses" />}

          {/* HRM Module */}
          {(activeTab === 'hrm' || activeTab === 'essentials') && (
            <HRMModuleView initialSubTab={initialSubTab || 'employees'} />
          )}

          {/* Reports & Analytics */}
          {activeTab === 'reports' && <ReportsView />}

          {/* User Management & Access Control */}
          {activeTab === 'users' && <UserManagementView />}

          {/* Settings Module */}
          {activeTab === 'settings' && <SettingsModuleView initialSubTab={initialSubTab || 'business'} />}

          {/* Marketplace & Integrations */}
          {(activeTab === 'marketplace' || activeTab === 'modules') && <ModulesView />}
          {(activeTab === 'integrations' || activeTab === 'woocommerce') && <WooCommerceView />}

          {/* System Administration Suite */}
          {(activeTab === 'system_admin' || 
            activeTab === 'data_migration' || 
            activeTab === 'backup_restore' || 
            activeTab === 'import_export' || 
            activeTab === 'database_utilities' || 
            activeTab === 'system_maintenance' || 
            activeTab === 'sys_audit_logs' || 
            activeTab === 'system_health' || 
            activeTab === 'scheduler_jobs' ||
            activeTab === 'import' ||
            activeTab === 'backup' ||
            activeTab === 'data_management' ||
            activeTab === 'database_maintenance' ||
            activeTab === 'data_cleanup' ||
            activeTab === 'archive_center' ||
            activeTab === 'audit_recovery'
          ) && (
            <SystemAdminView 
              initialSubTab={
                (initialSubTab as any) ||
                (activeTab === 'data_migration' || activeTab === 'import' ? 'data_migration' :
                 activeTab === 'backup_restore' || activeTab === 'backup' ? 'backup_restore' :
                 activeTab === 'import_export' ? 'import_export' :
                 activeTab === 'database_utilities' || activeTab === 'database_maintenance' ? 'database_utilities' :
                 activeTab === 'system_maintenance' || activeTab === 'data_cleanup' ? 'system_maintenance' :
                 activeTab === 'sys_audit_logs' || activeTab === 'archive_center' || activeTab === 'audit_recovery' ? 'audit_logs' :
                 activeTab === 'system_health' ? 'system_health' :
                 activeTab === 'scheduler_jobs' ? 'scheduler_jobs' : 'overview')
              } 
            />
          )}
        </main>
      </div>
    </div>
  );
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 mins
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <POSProvider>
        <MainContent />
      </POSProvider>
    </QueryClientProvider>
  );
}

export default App;
