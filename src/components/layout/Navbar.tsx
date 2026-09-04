import React, { useState, useEffect } from 'react';
import { 
  Store, 
  DollarSign, 
  ShoppingCart, 
  Clock, 
  RotateCcw, 
  Bell, 
  UserCheck, 
  ChevronDown,
  Calculator,
  Keyboard
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { CashRegisterModal } from '../pos/CashRegisterModal';
import { QuickCalculatorModal } from '../pos/QuickCalculatorModal';
import { KeyboardShortcutsModal } from '../pos/KeyboardShortcutsModal';

interface NavbarProps {
  onOpenRegisterModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenRegisterModal }) => {
  const { 
    settings, 
    locations, 
    currentLocation, 
    setCurrentLocation, 
    cashRegister, 
    cart, 
    setActiveTab, 
    activeTab,
    resetToDemoData 
  } = usePOS();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    update();
    const timer = setInterval(update, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleOpenRegister = () => {
    if (onOpenRegisterModal) {
      onOpenRegisterModal();
    } else {
      setIsRegisterModalOpen(true);
    }
  };

  return (
    <>
      <header className="h-14 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between px-4 z-30 shrink-0 select-none">
        {/* Brand & Location */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-xs tracking-wider shadow-md shadow-blue-500/30">
              ERP
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-white block leading-tight">
                {settings.businessName}
              </span>
              <span className="text-[10px] text-blue-400 font-medium tracking-wide">
                Nebula ERP v5.4
              </span>
            </div>
          </div>

          {/* Location Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700/80 px-2.5 py-1.5 rounded-lg border border-slate-700 transition-colors text-slate-200"
            >
              <Store className="w-3.5 h-3.5 text-blue-400" />
              <span className="max-w-[140px] truncate font-medium">{currentLocation.name}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showLocationDropdown && (
              <div className="absolute left-0 top-full mt-1.5 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-1 z-50">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  Switch Active Store Location
                </div>
                {locations.map(loc => (
                  <button
                    key={loc.id}
                    onClick={() => {
                      setCurrentLocation(loc);
                      setShowLocationDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                      currentLocation.id === loc.id ? 'text-blue-400 font-bold bg-slate-800/50' : 'text-slate-300'
                    }`}
                  >
                    <div>
                      <p className="font-medium">{loc.name}</p>
                      <p className="text-[10px] text-slate-500">{loc.city}, {loc.state}</p>
                    </div>
                    {currentLocation.id === loc.id && (
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right side utility icons */}
        <div className="flex items-center gap-3">
          {/* Direct POS Cart Quick Button */}
          <button
            onClick={() => setActiveTab('pos')}
            className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'pos'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>POS Screen</span>
            {cart.length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ml-1 animate-pulse">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </span>
            )}
          </button>

          {/* Cash Register Status */}
          <button
            onClick={handleOpenRegister}
            className="flex items-center gap-2 text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-200 transition-colors"
            title="Click to view Cash Register details or Close Shift"
          >
            <div className={`w-2 h-2 rounded-full ${cashRegister.status === 'open' ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden lg:inline">Drawer:</span>
            <span className="font-bold text-emerald-400">
              {settings.currencySymbol}{cashRegister.cashInDrawer.toFixed(2)}
            </span>
          </button>

          {/* Calculator Quick Modal Button */}
          <button
            onClick={() => setIsCalcOpen(true)}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg border border-slate-700/60 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Open Quick Calculator (Alt+C)"
          >
            <Calculator className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Calculator</span>
          </button>

          {/* POS Keyboard Shortcuts Guide */}
          <button
            onClick={() => setIsShortcutsOpen(true)}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg border border-slate-700/60 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="View Keyboard Shortcuts"
          >
            <Keyboard className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden lg:inline">Shortcuts</span>
          </button>

          {/* Live Clock */}
          <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{currentTime}</span>
          </div>

          {/* Reset / Demo data helper */}
          <button
            onClick={() => {
              if (confirm('Reset store state to default demonstration dataset?')) {
                resetToDemoData();
              }
            }}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            title="Reset Demo Data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* User Badge */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-inner">
              SJ
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-slate-200 leading-none">Sarah Jenkins</p>
              <p className="text-[10px] text-emerald-400 font-medium">Store Admin</p>
            </div>
          </div>
        </div>
      </header>

      <CashRegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />

      <QuickCalculatorModal
        isOpen={isCalcOpen}
        onClose={() => setIsCalcOpen(false)}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </>
  );
};
