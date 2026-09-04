import React from 'react';

interface NebulaFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export const NebulaField: React.FC<NebulaFieldProps> = ({
  label,
  error,
  required = false,
  hint,
  children,
  className = '',
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-xs font-bold text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <span className="text-[11px] text-slate-400">{hint}</span>}
      {error && <span className="text-[11px] font-semibold text-red-600">{error}</span>}
    </div>
  );
};
