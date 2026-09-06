import React, { useState } from 'react';
import { 
  CreditCard, 
  ShieldCheck, 
  Clock, 
  DollarSign, 
  Lock, 
  Unlock, 
  Plus, 
  CheckCircle2, 
  AlertTriangle,
  X 
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { NebulaStatGrid, NebulaStatCard, TableCard } from '../../core/ui';

interface CashRegister {
  id: string;
  name: string;
  location: string;
  status: 'open' | 'closed';
  cashier: string;
  openedAt: string;
  openingFloat: number;
  cashSales: number;
  cardSales: number;
  expectedCash: number;
}

export const FinanceRegistersView: React.FC = () => {
  const { settings } = usePOS();
  const [registers, setRegisters] = useState<CashRegister[]>([
    { id: '1', name: 'Register Lane 01', location: 'Main Retail Floor', status: 'open', cashier: 'Alice Johnson', openedAt: '2026-09-06 08:30 AM', openingFloat: 500.00, cashSales: 2450.00, cardSales: 4120.00, expectedCash: 2950.00 },
    { id: '2', name: 'Register Lane 02', location: 'Express Checkout', status: 'open', cashier: 'Bob Smith', openedAt: '2026-09-06 09:00 AM', openingFloat: 350.00, cashSales: 1120.00, cardSales: 2890.00, expectedCash: 1470.00 },
    { id: '3', name: 'Service Counter POS', location: 'Repair & AMC Desk', status: 'closed', cashier: 'Unassigned', openedAt: '-', openingFloat: 0, cashSales: 0, cardSales: 0, expectedCash: 0 },
  ]);

  const [isNewOpen, setIsNewOpen] = useState(false);
  const [regName, setRegName] = useState('');
  const [regLocation, setRegLocation] = useState('');
  const [regFloat, setRegFloat] = useState('500');

  const openCount = registers.filter(r => r.status === 'open').length;
  const totalFloat = registers.reduce((acc, r) => acc + r.openingFloat, 0);
  const totalCashCollected = registers.reduce((acc, r) => acc + r.cashSales, 0);

  const handleCreateRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) return;
    const newReg: CashRegister = {
      id: Date.now().toString(),
      name: regName.trim(),
      location: regLocation.trim() || 'General Store',
      status: 'closed',
      cashier: 'Unassigned',
      openedAt: '-',
      openingFloat: parseFloat(regFloat) || 0,
      cashSales: 0,
      cardSales: 0,
      expectedCash: 0,
    };
    setRegisters([...registers, newReg]);
    setIsNewOpen(false);
    setRegName('');
    setRegLocation('');
    setRegFloat('500');
  };

  const toggleRegisterStatus = (id: string) => {
    setRegisters(registers.map(r => {
      if (r.id === id) {
        const isCurrentlyOpen = r.status === 'open';
        return {
          ...r,
          status: isCurrentlyOpen ? 'closed' : 'open',
          cashier: isCurrentlyOpen ? 'Unassigned' : 'Current Cashier',
          openedAt: isCurrentlyOpen ? '-' : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      }
      return r;
    }));
  };

  return (
    <div className="space-y-6">
      <NebulaStatGrid>
        <NebulaStatCard
          label="Active Register Stations"
          value={openCount}
          icon={CreditCard}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-50"
          statusText={`${registers.length} total stations configured`}
          statusColor="text-blue-600"
        />
        <NebulaStatCard
          label="Total Opening Cash Floats"
          value={`${settings.currencySymbol}${totalFloat.toLocaleString()}`}
          icon={DollarSign}
          iconColor="text-emerald-600"
          iconBgColor="bg-emerald-50"
          statusText="Cash vault floats allocated"
          statusColor="text-emerald-600"
        />
        <NebulaStatCard
          label="Today's Cash Collected"
          value={`${settings.currencySymbol}${totalCashCollected.toLocaleString()}`}
          icon={ShieldCheck}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-50"
          statusText="Verified cash drawer totals"
          statusColor="text-indigo-600"
        />
      </NebulaStatGrid>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700">Cash Register Terminals & Shift Audits</span>
        <button
          onClick={() => setIsNewOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-2xs cursor-pointer transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Add Terminal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {registers.map(reg => (
          <div key={reg.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">{reg.name}</span>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                  reg.status === 'open' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                }`}>
                  {reg.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{reg.location}</p>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Assigned Cashier:</span>
                <span className="font-bold text-slate-800">{reg.cashier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Opening Float:</span>
                <span className="font-bold text-slate-900">{settings.currencySymbol}{reg.openingFloat.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cash Sales:</span>
                <span className="font-bold text-emerald-600">{settings.currencySymbol}{reg.cashSales.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Card POS Sales:</span>
                <span className="font-bold text-blue-600">{settings.currencySymbol}{reg.cardSales.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => toggleRegisterStatus(reg.id)}
                className={`w-full py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  reg.status === 'open' 
                    ? 'bg-rose-600 hover:bg-rose-700 text-white' 
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {reg.status === 'open' ? 'Close Register & Audit Shift' : 'Open Shift Terminal'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {isNewOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Configure New Register Terminal</h3>
              <button onClick={() => setIsNewOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateRegister} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Terminal Name</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Register Lane 03"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Location / Zone</label>
                <input
                  type="text"
                  value={regLocation}
                  onChange={(e) => setRegLocation(e.target.value)}
                  placeholder="e.g. Electronics Floor"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Default Opening Cash Float</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={regFloat}
                  onChange={(e) => setRegFloat(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  Create Terminal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
