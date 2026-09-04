import React from 'react';
import { X } from 'lucide-react';

interface NebulaDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  position?: 'right' | 'left';
}

export const NebulaDrawer: React.FC<NebulaDrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  position = 'right',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      {position === 'left' && <div className="flex-1" onClick={onClose} />}
      <div className={`bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-200 animate-slide-in ${
        position === 'left' ? 'border-r border-l-0' : 'ml-auto'
      }`}>
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
      {position === 'right' && <div className="flex-1" onClick={onClose} />}
    </div>
  );
};
