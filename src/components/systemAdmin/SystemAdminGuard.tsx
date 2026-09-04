import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  ArrowLeft, 
  UserCheck, 
  KeyRound, 
  AlertTriangle,
  ChevronDown
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';

export type SystemAdminRole = 
  | 'Super Administrator'
  | 'System Administrator'
  | 'IT Administrator'
  | 'Store Manager'
  | 'Cashier'
  | 'Technician';

export const AUTHORIZED_SYSTEM_ADMIN_ROLES: SystemAdminRole[] = [
  'Super Administrator',
  'System Administrator',
  'IT Administrator'
];

interface SystemAdminGuardProps {
  children: React.ReactNode;
}

export const SystemAdminGuard: React.FC<SystemAdminGuardProps> = ({ children }) => {
  const { setActiveTab } = usePOS();
  
  // Stored role simulation (defaults to System Administrator)
  const [currentRole, setCurrentRole] = useState<SystemAdminRole>(() => {
    const saved = localStorage.getItem('nebula_erp_admin_role');
    if (saved && ['Super Administrator', 'System Administrator', 'IT Administrator', 'Store Manager', 'Cashier', 'Technician'].includes(saved)) {
      return saved as SystemAdminRole;
    }
    return 'System Administrator';
  });

  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const handleRoleChange = (role: SystemAdminRole) => {
    setCurrentRole(role);
    localStorage.setItem('nebula_erp_admin_role', role);
    setShowRoleSwitcher(false);
  };

  const isAuthorized = AUTHORIZED_SYSTEM_ADMIN_ROLES.includes(currentRole);

  if (!isAuthorized) {
    return (
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 flex items-center justify-center min-h-[500px]">
        <div className="max-w-xl w-full bg-white rounded-2xl border border-slate-300 shadow-sm p-6 sm:p-8 space-y-6">
          {/* Graphite header badge */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="bg-slate-800 text-slate-200 border border-slate-700 text-[11px] font-bold px-2.5 py-1 rounded-md tracking-wide uppercase">
                System Administration
              </span>
              <span className="text-xs font-semibold text-slate-500">Access Control Guard</span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
              <Lock className="w-3.5 h-3.5" />
              Access Restricted
            </span>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-slate-300 flex items-center justify-center shrink-0 shadow-inner">
              <ShieldAlert className="w-6 h-6 text-amber-400" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Administrator Privileges Required
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                You do not have permission to access the System Administration suite. These tools can modify, migrate, restore or permanently affect business data and database schemas.
              </p>
            </div>
          </div>

          {/* Current credentials box */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600">Your Current Session Role:</span>
              <span className="font-bold text-slate-800 px-2.5 py-0.5 rounded bg-slate-200">
                {currentRole}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Authorized roles: Super Administrator, System Administrator, IT Administrator.</span>
            </div>
          </div>

          {/* Actions & Role simulation tester */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Dashboard</span>
              </button>

              <button
                type="button"
                onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                <KeyRound className="w-4 h-4 text-slate-300" />
                <span>Role Simulator &bull; Switch Role</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showRoleSwitcher ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {showRoleSwitcher && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 animate-fadeIn">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Test Role Permission Guard (Enterprise Simulation)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {AUTHORIZED_SYSTEM_ADMIN_ROLES.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleRoleChange(role)}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-950 font-bold text-left transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        {role}
                      </span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-200/80 px-1.5 py-0.5 rounded">
                        Authorized
                      </span>
                    </button>
                  ))}
                  {(['Store Manager', 'Cashier', 'Technician'] as SystemAdminRole[]).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleRoleChange(role)}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-left transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        {role}
                      </span>
                      <span className="text-[10px] text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                        Restricted
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Role Indicator Bar for Authorized Users */}
      <div className="bg-slate-900 text-slate-300 px-4 py-1.5 text-xs flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-300">Administrator Console Session:</span>
          <span className="text-white font-bold bg-slate-800 px-2 py-0.5 rounded text-[11px] border border-slate-700">
            {currentRole}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
            className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer transition-colors"
          >
            Role Switcher ({currentRole})
          </button>
        </div>
      </div>

      {showRoleSwitcher && (
        <div className="bg-slate-800 border-b border-slate-700 p-3 text-xs text-slate-200">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-slate-400" />
              <span className="font-bold text-slate-200">Switch Simulated Role:</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {(['Super Administrator', 'System Administrator', 'IT Administrator', 'Store Manager', 'Cashier'] as SystemAdminRole[]).map((r) => {
                const isSelected = currentRole === r;
                const isAuth = AUTHORIZED_SYSTEM_ADMIN_ROLES.includes(r);
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRoleChange(r)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : isAuth
                        ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                        : 'bg-rose-950/70 text-rose-300 border border-rose-800 hover:bg-rose-900'
                    }`}
                  >
                    {r} {!isAuth && '(Restricted)'}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {children}
    </>
  );
};
