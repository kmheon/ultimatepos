import React from 'react';

interface NebulaSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const NebulaSection: React.FC<NebulaSectionProps> = ({
  title,
  description,
  children,
  className = '',
}) => {
  return (
    <div className={`bg-slate-50/50 p-5 rounded-2xl border border-slate-200/80 space-y-4 ${className}`}>
      <div>
        <h4 className="text-sm font-bold text-slate-900">{title}</h4>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );
};
