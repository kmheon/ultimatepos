import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { POSProvider, usePOS } from './context/POSContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { POSTerminal } from './components/pos/POSTerminal';
import { Dashboard } from './components/dashboard/Dashboard';
import { ProductList } from './components/products/ProductList';
import { SalesList } from './components/sales/SalesList';
import { PurchasesList } from './components/purchases/PurchasesList';
import { ContactsList } from './components/contacts/ContactsList';
import { ExpensesList } from './components/expenses/ExpensesList';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { RepairsView } from './components/repairs/RepairsView';
import { QuotationsView } from './components/quotations/QuotationsView';
import { TransfersView } from './components/transfers/TransfersView';
import { BarcodeLabelsView } from './components/labels/BarcodeLabelsView';
import { ReturnsView } from './components/returns/ReturnsView';
import { UserManagementView } from './components/users/UserManagementView';
import { StockAdjustmentView } from './components/adjustments/StockAdjustmentView';
import { PaymentAccountsView } from './components/accounts/PaymentAccountsView';
import { HRMView } from './components/hrm/HRMView';
import { EssentialsView } from './components/essentials/EssentialsView';
import { WooCommerceView } from './components/woocommerce/WooCommerceView';
import { BackupView } from './components/backup/BackupView';
import { ModulesView } from './components/modules/ModulesView';
import { ServiceManagementView } from './components/services/ServiceManagementView';
import { UltimatePOSImportView } from './components/import/UltimatePOSImportView';

const MainContent: React.FC = () => {
  const { activeTab } = usePOS();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-900 antialiased">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {activeTab === 'pos' && <POSTerminal />}
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'services' && <ServiceManagementView />}
          {activeTab === 'import' && <UltimatePOSImportView />}
          {activeTab === 'users' && <UserManagementView />}
          {activeTab === 'products' && <ProductList />}
          {activeTab === 'repairs' && <ServiceManagementView />}
          {activeTab === 'sales' && <SalesList />}
          {activeTab === 'quotations' && <QuotationsView />}
          {activeTab === 'returns' && <ReturnsView />}
          {activeTab === 'purchases' && <PurchasesList />}
          {activeTab === 'transfers' && <TransfersView />}
          {activeTab === 'adjustments' && <StockAdjustmentView />}
          {activeTab === 'expenses' && <ExpensesList />}
          {activeTab === 'accounts' && <PaymentAccountsView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'labels' && <BarcodeLabelsView />}
          {activeTab === 'contacts' && <ContactsList />}
          {activeTab === 'hrm' && <HRMView />}
          {activeTab === 'essentials' && <EssentialsView />}
          {activeTab === 'woocommerce' && <WooCommerceView />}
          {activeTab === 'backup' && <BackupView />}
          {activeTab === 'modules' && <ModulesView />}
          {activeTab === 'settings' && <SettingsView />}
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
