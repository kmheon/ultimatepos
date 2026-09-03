import React, { useState } from 'react';
import { 
  Puzzle, 
  CheckCircle2, 
  Wrench, 
  Users2, 
  CheckSquare, 
  ShoppingBag, 
  Utensils, 
  Factory, 
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

interface SystemModule {
  id: string;
  name: string;
  description: string;
  version: string;
  icon: React.FC<{ className?: string }>;
  isEnabled: boolean;
  category: string;
}

export const ModulesView: React.FC = () => {
  const [modules, setModules] = useState<SystemModule[]>([
    { id: '1', name: 'Repair & Electronics Workshop', description: 'Device intake checklists, IMEI/Serial number tracking, technician diagnostic bench, and job sheets', version: 'v3.2', icon: Wrench, isEnabled: true, category: 'Core Service' },
    { id: '2', name: 'Human Resource Management (HRM)', description: 'Employee attendance timeclock, leave approvals, salary payroll generation, and departments', version: 'v2.1', icon: Users2, isEnabled: true, category: 'Administration' },
    { id: '3', name: 'Essentials & Workflows', description: 'Internal staff To-Do tasks, document repository notes, and customer follow-up alerts', version: 'v2.0', icon: CheckSquare, isEnabled: true, category: 'Productivity' },
    { id: '4', name: 'WooCommerce Storefront Sync', description: 'Real-time REST API synchronization for online catalog stock and web checkout orders', version: 'v4.0', icon: ShoppingBag, isEnabled: true, category: 'E-commerce' },
    { id: '5', name: 'Restaurant & Table Orders', description: 'Table reservations, Kitchen Order Tickets (KOT), modifier add-ons, and service charges', version: 'v1.8', icon: Utensils, isEnabled: false, category: 'Hospitality' },
    { id: '6', name: 'Manufacturing & Bill of Materials', description: 'Raw materials inventory, production lot tracking, and assembly cost calculations', version: 'v2.4', icon: Factory, isEnabled: false, category: 'Production' },
  ]);

  const toggleModule = (id: string) => {
    setModules(modules.map(m => m.id === id ? { ...m, isEnabled: !m.isEnabled } : m));
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Puzzle className="w-6 h-6 text-blue-600" />
            Manage UltimatePOS Modules
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Activate or deactivate extensions and specialized business plugins.
          </p>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map(mod => {
          const Icon = mod.icon;
          return (
            <div
              key={mod.id}
              className={`p-5 rounded-2xl border transition-all space-y-4 flex flex-col justify-between ${
                mod.isEnabled
                  ? 'bg-white border-slate-200 shadow-xs'
                  : 'bg-slate-50/70 border-slate-200/80 opacity-75'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    mod.isEnabled ? 'bg-blue-50 text-blue-600' : 'bg-slate-200 text-slate-500'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                    {mod.version}
                  </span>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{mod.category}</div>
                  <h3 className="font-bold text-base text-slate-900 mt-0.5">{mod.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{mod.description}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className={`text-xs font-bold flex items-center gap-1.5 ${
                  mod.isEnabled ? 'text-emerald-700' : 'text-slate-400'
                }`}>
                  {mod.isEnabled && <CheckCircle2 className="w-4 h-4" />}
                  {mod.isEnabled ? 'Active & Enabled' : 'Disabled'}
                </span>

                <button
                  onClick={() => toggleModule(mod.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    mod.isEnabled
                      ? 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {mod.isEnabled ? 'Deactivate' : 'Enable Module'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
