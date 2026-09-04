import React from 'react';
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { NebulaButton } from '../buttons/NebulaButton';

interface NebulaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  variant?: 'info' | 'warning' | 'danger' | 'success';
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
}

export const NebulaDialog: React.FC<NebulaDialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  variant = 'warning',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
}) => {
  if (!isOpen) return null;

  const icons = {
    info: <Info className="w-6 h-6 text-blue-600" />,
    warning: <AlertTriangle className="w-6 h-6 text-amber-600" />,
    danger: <AlertTriangle className="w-6 h-6 text-red-600" />,
    success: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
  };

  const bgColors = {
    info: 'bg-blue-50',
    warning: 'bg-amber-50',
    danger: 'bg-red-50',
    success: 'bg-emerald-50',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 flex flex-col">
        <div className="flex items-center gap-4 mb-4">
          <div className={`p-3 rounded-2xl ${bgColors[variant]} shrink-0`}>
            {icons[variant]}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{description}</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 mt-6">
          <NebulaButton variant="outline" onClick={onClose}>
            {cancelText}
          </NebulaButton>
          <NebulaButton
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </NebulaButton>
        </div>
      </div>
    </div>
  );
};
