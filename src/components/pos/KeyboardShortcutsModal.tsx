import React from 'react';
import { X, Command, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'F2', action: 'Focus Barcode / SKU Product Search' },
    { key: 'F4', action: 'Direct Pay / Finalize Express Cash' },
    { key: 'F8', action: 'Open Full Payment & Checkout Modal' },
    { key: 'F9', action: 'Hold / Park Current Transaction' },
    { key: 'F10', action: 'Retrieve Suspended / Parked Orders' },
    { key: 'F12', action: 'Open Cash Drawer / Register Shift' },
    { key: 'Alt + C', action: 'Quick Open Built-in Calculator' },
    { key: 'Alt + N', action: 'Quick Add New Customer' },
    { key: 'Esc', action: 'Cancel / Close Open Modal' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Keyboard className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-base">POS Keyboard Shortcuts</h3>
              <p className="text-xs text-slate-400">High-speed cashier key bindings</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="p-6 space-y-3">
          <div className="divide-y divide-slate-100">
            {shortcuts.map((sc, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <span className="text-slate-700 font-medium">{sc.action}</span>
                <kbd className="px-2.5 py-1 bg-slate-100 border border-slate-300 rounded-lg text-slate-800 font-mono font-bold shadow-xs">
                  {sc.key}
                </kbd>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center gap-2">
            <Command className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Shortcuts are active across the entire POS screen during order entry.</span>
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
