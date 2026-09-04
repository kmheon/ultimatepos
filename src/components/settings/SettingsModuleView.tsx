import React, { useState, useEffect, useMemo } from 'react';
import { 
  Settings as SettingsIcon, 
  Building, 
  MapPin, 
  DollarSign, 
  Percent, 
  ShoppingCart, 
  Receipt, 
  Layers, 
  Palette,
  Check,
  Save
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { ModuleHeader, ModuleTabItem } from '../layout/ModuleHeader';
import { SettingsView } from './SettingsView';
import { WooCommerceView } from '../woocommerce/WooCommerceView';
import { updateBrowserURL } from '../../utils/navigationRouter';

export type SettingsSubTab = 
  | 'business' 
  | 'locations' 
  | 'financial' 
  | 'taxes' 
  | 'pos' 
  | 'invoices' 
  | 'integrations' 
  | 'appearance';

interface SettingsModuleViewProps {
  initialSubTab?: string;
}

export const SettingsModuleView: React.FC<SettingsModuleViewProps> = ({ initialSubTab = 'business' }) => {
  const { settings, updateSettings, locations } = usePOS();
  const [formData, setFormData] = useState(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const normalizedSubTab: SettingsSubTab = useMemo(() => {
    if (!initialSubTab) return 'business';
    const clean = initialSubTab.toLowerCase().replace(/_/g, '-');
    if (['business', 'profile', 'company'].includes(clean)) return 'business';
    if (['locations', 'branches', 'stores'].includes(clean)) return 'locations';
    if (['financial', 'currency', 'accounting'].includes(clean)) return 'financial';
    if (['taxes', 'tax', 'vat'].includes(clean)) return 'taxes';
    if (['pos', 'register', 'terminal'].includes(clean)) return 'pos';
    if (['invoices', 'receipts', 'billing'].includes(clean)) return 'invoices';
    if (['integrations', 'api', 'woocommerce'].includes(clean)) return 'integrations';
    if (['appearance', 'theme', 'display'].includes(clean)) return 'appearance';
    return 'business';
  }, [initialSubTab]);

  const [activeSubTab, setActiveSubTab] = useState<SettingsSubTab>(normalizedSubTab);

  useEffect(() => {
    setActiveSubTab(normalizedSubTab);
  }, [normalizedSubTab]);

  const handleTabChange = (tabId: string) => {
    const nextTab = tabId as SettingsSubTab;
    setActiveSubTab(nextTab);
    updateBrowserURL('settings', nextTab);
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const tabs: ModuleTabItem[] = [
    { id: 'business', label: 'Business', icon: Building },
    { id: 'locations', label: 'Locations', icon: MapPin, badge: locations.length, badgeColor: 'bg-slate-100 text-slate-700' },
    { id: 'financial', label: 'Financial', icon: DollarSign },
    { id: 'taxes', label: 'Taxes', icon: Percent },
    { id: 'pos', label: 'POS', icon: ShoppingCart },
    { id: 'invoices', label: 'Invoices', icon: Receipt },
    { id: 'integrations', label: 'Integrations', icon: Layers },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Standardized Module Header */}
      <ModuleHeader
        icon={SettingsIcon}
        title="System Settings & Configuration"
        badge="Enterprise Core"
        subtitle="Global enterprise configurations, store outlets, fiscal tax schemes, printer layouts, and branding"
        actions={
          <div className="flex items-center gap-2.5">
            {savedSuccess && (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                <Check className="w-3.5 h-3.5" />
                Saved
              </span>
            )}
            <button
              onClick={() => handleSave()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer shadow-blue-200"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        }
        tabs={tabs}
        activeTab={activeSubTab}
        onTabChange={handleTabChange}
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {activeSubTab === 'business' && (
          <div className="p-6">
            <SettingsView />
          </div>
        )}

        {activeSubTab === 'locations' && (
          <div className="p-6 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Store Branches & Warehouse Locations</h3>
                  <p className="text-xs text-slate-500">Multi-location retail network and central distribution warehouses</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {locations.map(loc => (
                  <div key={loc.id} className="p-5 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{loc.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        Active Branch
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{loc.landmark ? `${loc.landmark}, ` : ''}{loc.city}, {loc.state}</p>
                    <div className="text-[11px] text-slate-400">Mobile: {loc.mobile}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'financial' && (
          <div className="p-6">
            <SettingsView />
          </div>
        )}

        {activeSubTab === 'taxes' && (
          <div className="p-6">
            <SettingsView />
          </div>
        )}

        {activeSubTab === 'pos' && (
          <div className="p-6">
            <SettingsView />
          </div>
        )}

        {activeSubTab === 'invoices' && (
          <div className="p-6">
            <SettingsView />
          </div>
        )}

        {activeSubTab === 'integrations' && (
          <div className="p-6">
            <WooCommerceView />
          </div>
        )}

        {activeSubTab === 'appearance' && (
          <div className="p-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Enterprise Theme & Visual Appearance</h3>
              <p className="text-xs text-slate-500">Nebula ERP enterprise styling and display density parameters</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-slate-50 rounded-xl border-2 border-blue-600 space-y-2">
                  <span className="font-bold text-xs text-slate-900">Standard Slate Light</span>
                  <p className="text-[11px] text-slate-500">High-contrast accessibility optimized for POS terminals and back-office workstations.</p>
                  <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">Default Active</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
